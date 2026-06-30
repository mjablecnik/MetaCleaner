package source

import (
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

// HandleUpload handles POST /api/upload — validates, saves, and returns file metadata.
func HandleUpload(cfg Config) http.HandlerFunc {
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
			limitedSrc := io.LimitReader(src, cfg.MaxFileSize+1)
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
			if written > cfg.MaxFileSize {
				os.Remove(destPath)
				fileErrors = append(fileErrors, UploadedFileError{
					Name:    fh.Filename,
					Error:   ErrFileTooLarge,
					Message: fmt.Sprintf("File %q exceeds maximum allowed size of %d MB", fh.Filename, cfg.MaxFileSize/(1024*1024)),
				})
				continue
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
