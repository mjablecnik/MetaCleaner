package source

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// localIDPattern validates the expected on-disk file ID format (f-{hex}).
var localIDPattern = regexp.MustCompile(`^f-[0-9a-f]+$`)

// uuidV4Pattern validates UUIDv4 format used for job IDs.
var uuidV4Pattern = regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`)

// UploadedFileInfo is the metadata returned for each accepted file on upload.
type UploadedFileInfo struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Size      int64  `json:"size"`
	Extension string `json:"extension"`
	Type      string `json:"type"`
	Format    string `json:"format"`
}

// UploadedFileError is returned for each file that failed validation or processing during upload.
type UploadedFileError struct {
	Name    string `json:"name"`
	Error   string `json:"error"`
	Message string `json:"message"`
}

// generateFileID creates a unique file ID in the format "f-{32hex}".
func generateFileID() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return "f-" + hex.EncodeToString(b), nil
}

// canonicalFormat returns the canonical format name for a file extension.
// .jpg → "jpeg", .tif → "tiff", .mpg → "mpeg", others pass through.
func canonicalFormat(ext string) string {
	ext = strings.ToLower(strings.TrimPrefix(ext, "."))
	switch ext {
	case "jpg":
		return "jpeg"
	case "tif":
		return "tiff"
	case "mpg":
		return "mpeg"
	default:
		return ext
	}
}

// magicByteExtensions maps extensions that have reliable magic-byte signatures to their
// expected MIME type as returned by http.DetectContentType. Extensions absent from this
// map accept any image/*, video/*, or application/octet-stream (e.g. HEIC, AVIF, DNG).
var magicByteExtensions = map[string]string{
	".jpg": "image/jpeg", ".jpeg": "image/jpeg",
	".png": "image/png", ".gif": "image/gif",
	".webp": "image/webp",
	".tiff": "image/tiff", ".tif": "image/tiff",
	".mp4": "video/mp4", ".webm": "video/webm",
	".mpeg": "video/mpeg", ".mpg": "video/mpeg",
	".ogv": "video/ogg",
}

// validateMagicBytes reads the first 512 bytes from r to detect the real content type
// and checks that it is consistent with ext. Returns the peeked bytes so the caller can
// reconstruct a full reader via io.MultiReader(bytes.NewReader(header), r).
func validateMagicBytes(r io.Reader, ext string) ([]byte, error) {
	header := make([]byte, 512)
	n, err := io.ReadAtLeast(r, header, 1)
	if err != nil && err != io.ErrUnexpectedEOF {
		return nil, err
	}
	header = header[:n]
	detected := http.DetectContentType(header)
	if want, ok := magicByteExtensions[ext]; ok {
		if detected != want {
			return nil, fmt.Errorf("content type mismatch: extension %q but content detected as %q", ext, detected)
		}
	} else if !strings.HasPrefix(detected, "image/") && !strings.HasPrefix(detected, "video/") && detected != "application/octet-stream" {
		return nil, fmt.Errorf("content type mismatch: extension %q but content detected as %q", ext, detected)
	}
	return header, nil
}

// HandleUpload handles POST /api/upload — validates, saves, and returns file metadata.
func HandleUpload(cfg Config, tigris *TigrisClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Reject oversized request bodies before multipart parsing spools them to disk.
		// Allow up to 10 files at max size plus multipart overhead.
		r.Body = http.MaxBytesReader(w, r.Body, 10*cfg.MaxFileSize+4096)
		if err := r.ParseMultipartForm(32 * 1024 * 1024); err != nil {
			WriteError(w, http.StatusRequestEntityTooLarge, ErrFileTooLarge,
				fmt.Sprintf("File exceeds maximum allowed size of %d MB", cfg.MaxFileSize/(1024*1024)))
			return
		}

		fileHeaders := r.MultipartForm.File["files"]
		if len(fileHeaders) == 0 {
			WriteError(w, http.StatusBadRequest, ErrInvalidRequest, "No files provided")
			return
		}

		uploadsDir := filepath.Join(cfg.TempStoragePath, "uploads")
		if err := os.MkdirAll(uploadsDir, 0755); err != nil {
			WriteError(w, http.StatusInsufficientStorage, ErrInsufficientStorage, "Failed to create storage directory")
			return
		}

		accepted := make([]UploadedFileInfo, 0, len(fileHeaders))
		fileErrors := make([]UploadedFileError, 0)

		for _, fh := range fileHeaders {
			// Validate size from multipart header when available.
			if fh.Size > cfg.MaxFileSize {
				fileErrors = append(fileErrors, UploadedFileError{
					Name:    fh.Filename,
					Error:   ErrFileTooLarge,
					Message: fmt.Sprintf("File %q exceeds maximum allowed size of %d MB", fh.Filename, cfg.MaxFileSize/(1024*1024)),
				})
				continue
			}

			// Validate file format by extension.
			ext := strings.ToLower(filepath.Ext(fh.Filename))
			if ext == "" || !ValidateFileFormat(ext) {
				fileErrors = append(fileErrors, UploadedFileError{
					Name:    fh.Filename,
					Error:   ErrUnsupportedFormat,
					Message: fmt.Sprintf("File format %q is not supported", ext),
				})
				continue
			}

			fileID, err := generateFileID()
			if err != nil {
				fileErrors = append(fileErrors, UploadedFileError{
					Name:    fh.Filename,
					Error:   ErrInsufficientStorage,
					Message: "Failed to generate file identifier",
				})
				continue
			}

			src, err := fh.Open()
			if err != nil {
				fileErrors = append(fileErrors, UploadedFileError{
					Name:    fh.Filename,
					Error:   ErrInsufficientStorage,
					Message: "Failed to read uploaded file",
				})
				continue
			}

			// Validate magic bytes before accepting the file so arbitrary content
			// cannot be uploaded under a supported extension and handed to ExifTool/FFmpeg.
			header, magicErr := validateMagicBytes(src, ext)
			if magicErr != nil {
				src.Close()
				fileErrors = append(fileErrors, UploadedFileError{
					Name:    fh.Filename,
					Error:   ErrUnsupportedFormat,
					Message: fmt.Sprintf("File %q content does not match its extension", fh.Filename),
				})
				continue
			}
			// Reconstruct the full reader with the already-consumed header bytes.
			fullSrc := io.MultiReader(bytes.NewReader(header), src)

			extNoDot := strings.TrimPrefix(ext, ".")
			destPath := filepath.Join(uploadsDir, fileID+"_original."+extNoDot)
			dst, err := os.Create(destPath)
			if err != nil {
				src.Close()
				fileErrors = append(fileErrors, UploadedFileError{
					Name:    fh.Filename,
					Error:   ErrInsufficientStorage,
					Message: "Failed to create storage file",
				})
				continue
			}

			// LimitReader acts as a safety net if Content-Length header was missing or spoofed.
			limitedSrc := io.LimitReader(fullSrc, cfg.MaxFileSize+1)
			written, copyErr := io.Copy(dst, limitedSrc)
			dst.Close()
			src.Close()

			if copyErr != nil {
				os.Remove(destPath)
				fileErrors = append(fileErrors, UploadedFileError{
					Name:    fh.Filename,
					Error:   ErrInsufficientStorage,
					Message: "Failed to write file to storage",
				})
				continue
			}
			if !ValidateFileSize(written, cfg.MaxFileSize) {
				os.Remove(destPath)
				if written == 0 {
					fileErrors = append(fileErrors, UploadedFileError{
						Name:    fh.Filename,
						Error:   ErrInvalidRequest,
						Message: fmt.Sprintf("File %q is empty", fh.Filename),
					})
				} else {
					fileErrors = append(fileErrors, UploadedFileError{
						Name:    fh.Filename,
						Error:   ErrFileTooLarge,
						Message: fmt.Sprintf("File %q exceeds maximum allowed size of %d MB", fh.Filename, cfg.MaxFileSize/(1024*1024)),
					})
				}
				continue
			}

			// Write a sidecar .owner file so HandleCreateJob can verify ownership.
			// Only written when the uploader is authenticated; anonymous uploads
			// (no auth token) get no owner file and skip the ownership check.
			ownerID := UserIDFromContext(r.Context())
			if ownerID != "" {
				ownerPath := filepath.Join(uploadsDir, fileID+".owner")
				_ = os.WriteFile(ownerPath, []byte(ownerID), 0600)
			}

			// Upload original file to Tigris for cross-machine persistence.
			// When Tigris is configured, the canonical copy lives in object storage;
			// the local file is just a temporary artifact of the upload processing.
			if tigris != nil {
				extNoDotForKey := strings.TrimPrefix(ext, ".")
				tigrisKey := fmt.Sprintf("uploads/%s_original.%s", fileID, extNoDotForKey)
				uploadFile, openErr := os.Open(destPath)
				if openErr != nil {
					os.Remove(destPath)
					fileErrors = append(fileErrors, UploadedFileError{
						Name:    fh.Filename,
						Error:   ErrInsufficientStorage,
						Message: "Failed to read stored file for remote upload",
					})
					continue
				}
				tigrisErr := tigris.Upload(r.Context(), tigrisKey, uploadFile, contentTypeForExt(extNoDotForKey))
				uploadFile.Close()
				if tigrisErr != nil {
					os.Remove(destPath)
					fileErrors = append(fileErrors, UploadedFileError{
						Name:    fh.Filename,
						Error:   ErrInsufficientStorage,
						Message: "Failed to upload file to remote storage",
					})
					continue
				}
				// Upload ownership metadata to Tigris as well so any machine can check it.
				if ownerID != "" {
					ownerKey := fmt.Sprintf("uploads/%s.owner", fileID)
					_ = tigris.Upload(r.Context(), ownerKey, strings.NewReader(ownerID), "text/plain")
				}
				// Upload file metadata to Tigris so HandleCreateJob can resolve
				// the extension and size without globbing local disk.
				metaJSON, _ := json.Marshal(map[string]interface{}{
					"ext":   extNoDot,
					"size":  written,
					"owner": ownerID,
				})
				metaKey := fmt.Sprintf("uploads/%s.meta", fileID)
				_ = tigris.Upload(r.Context(), metaKey, strings.NewReader(string(metaJSON)), "application/json")
				// Remove local copy — Tigris is the source of truth.
				os.Remove(destPath)
				ownerLocalPath := filepath.Join(uploadsDir, fileID+".owner")
				os.Remove(ownerLocalPath)
			}

			accepted = append(accepted, UploadedFileInfo{
				ID:        fileID,
				Name:      fh.Filename,
				Size:      written,
				Extension: strings.ToUpper(extNoDot),
				Type:      GetFileType(ext),
				Format:    canonicalFormat(ext),
			})
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"files":      accepted,
			"fileErrors": fileErrors,
		})
	}
}
