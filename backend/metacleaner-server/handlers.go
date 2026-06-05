package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// UploadedFileInfo is the metadata returned for each accepted file on upload.
type UploadedFileInfo struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Size      int64  `json:"size"`
	Extension string `json:"extension"`
	Type      string `json:"type"`
	Format    string `json:"format"`
}

// generateFileID creates a unique file ID in the format "f-{8hex}".
func generateFileID() (string, error) {
	b := make([]byte, 4)
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

// handleUpload handles POST /api/upload — validates, saves, and returns file metadata.
func handleUpload(cfg Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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

		for _, fh := range fileHeaders {
			// Validate size from multipart header when available.
			if fh.Size > cfg.MaxFileSize {
				WriteError(w, http.StatusRequestEntityTooLarge, ErrFileTooLarge,
					fmt.Sprintf("File %q exceeds maximum allowed size of %d MB", fh.Filename, cfg.MaxFileSize/(1024*1024)))
				return
			}

			// Validate file format by extension.
			ext := strings.ToLower(filepath.Ext(fh.Filename))
			if ext == "" || !ValidateFileFormat(ext) {
				WriteError(w, http.StatusUnsupportedMediaType, ErrUnsupportedFormat,
					fmt.Sprintf("File format %q is not supported", ext))
				return
			}

			fileID, err := generateFileID()
			if err != nil {
				WriteError(w, http.StatusInternalServerError, ErrInsufficientStorage, "Failed to generate file identifier")
				return
			}

			src, err := fh.Open()
			if err != nil {
				WriteError(w, http.StatusInsufficientStorage, ErrInsufficientStorage, "Failed to read uploaded file")
				return
			}

			extNoDot := strings.TrimPrefix(ext, ".")
			destPath := filepath.Join(uploadsDir, fileID+"_original."+extNoDot)
			dst, err := os.Create(destPath)
			if err != nil {
				src.Close()
				WriteError(w, http.StatusInsufficientStorage, ErrInsufficientStorage, "Failed to create storage file")
				return
			}

			// LimitReader acts as a safety net if Content-Length header was missing or spoofed.
			limitedSrc := io.LimitReader(src, cfg.MaxFileSize+1)
			written, copyErr := io.Copy(dst, limitedSrc)
			dst.Close()
			src.Close()

			if copyErr != nil {
				os.Remove(destPath)
				WriteError(w, http.StatusInsufficientStorage, ErrInsufficientStorage, "Failed to write file to storage")
				return
			}
			if written > cfg.MaxFileSize {
				os.Remove(destPath)
				WriteError(w, http.StatusRequestEntityTooLarge, ErrFileTooLarge,
					fmt.Sprintf("File %q exceeds maximum allowed size of %d MB", fh.Filename, cfg.MaxFileSize/(1024*1024)))
				return
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
		json.NewEncoder(w).Encode(map[string][]UploadedFileInfo{"files": accepted})
	}
}
