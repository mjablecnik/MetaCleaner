package main

import (
	"bytes"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"
)

func newTestConfig(t *testing.T) Config {
	t.Helper()
	return Config{
		MaxFileSize:     500 * 1024 * 1024,
		TempStoragePath: t.TempDir(),
	}
}

func buildUploadRequest(t *testing.T, files map[string][]byte) *http.Request {
	t.Helper()
	var buf bytes.Buffer
	mw := multipart.NewWriter(&buf)
	for name, content := range files {
		fw, err := mw.CreateFormFile("files", name)
		if err != nil {
			t.Fatal(err)
		}
		fw.Write(content)
	}
	mw.Close()
	req := httptest.NewRequest(http.MethodPost, "/api/upload", &buf)
	req.Header.Set("Content-Type", mw.FormDataContentType())
	return req
}

// Test multi-file upload processing (Req 1.5)
func TestHandleUploadMultiFile(t *testing.T) {
	cfg := newTestConfig(t)
	handler := handleUpload(cfg)

	req := buildUploadRequest(t, map[string][]byte{
		"photo.jpg": []byte("fake jpeg content"),
		"clip.mp4":  []byte("fake mp4 content"),
	})
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp map[string][]UploadedFileInfo
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatal(err)
	}
	files := resp["files"]
	if len(files) != 2 {
		t.Fatalf("expected 2 files in response, got %d", len(files))
	}
	uploadsDir := filepath.Join(cfg.TempStoragePath, "uploads")
	for _, f := range files {
		if len(f.ID) < 4 {
			t.Errorf("file ID %q looks too short", f.ID)
		}
		matches, _ := filepath.Glob(filepath.Join(uploadsDir, f.ID+"_original.*"))
		if len(matches) == 0 {
			t.Errorf("no saved file found on disk for ID %q", f.ID)
		}
	}
}

// Test oversized file rejection → 413 (Req 1.3)
func TestHandleUploadFileTooLarge(t *testing.T) {
	cfg := newTestConfig(t)
	cfg.MaxFileSize = 10 // 10 bytes max

	req := buildUploadRequest(t, map[string][]byte{
		"big.jpg": bytes.Repeat([]byte("x"), 20),
	})
	rr := httptest.NewRecorder()
	handleUpload(cfg)(rr, req)

	if rr.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("expected 413, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp ErrorResponse
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp.Error != ErrFileTooLarge {
		t.Errorf("expected error code %q, got %q", ErrFileTooLarge, resp.Error)
	}
}

// Test unsupported format rejection → 415 (Req 1.4)
func TestHandleUploadUnsupportedFormat(t *testing.T) {
	cfg := newTestConfig(t)

	req := buildUploadRequest(t, map[string][]byte{
		"document.pdf": []byte("fake pdf content"),
	})
	rr := httptest.NewRecorder()
	handleUpload(cfg)(rr, req)

	if rr.Code != http.StatusUnsupportedMediaType {
		t.Fatalf("expected 415, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp ErrorResponse
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp.Error != ErrUnsupportedFormat {
		t.Errorf("expected error code %q, got %q", ErrUnsupportedFormat, resp.Error)
	}
}

// Test disk write failure → 507 (Req 1.6)
func TestHandleUploadDiskWriteFailure(t *testing.T) {
	cfg := newTestConfig(t)
	// Point to a path that cannot be created (root-owned directory)
	cfg.TempStoragePath = "/proc/nonexistent-metacleaner-test"

	req := buildUploadRequest(t, map[string][]byte{
		"photo.jpg": []byte("fake jpeg content"),
	})
	rr := httptest.NewRecorder()
	handleUpload(cfg)(rr, req)

	if rr.Code != http.StatusInsufficientStorage {
		t.Fatalf("expected 507, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp ErrorResponse
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp.Error != ErrInsufficientStorage {
		t.Errorf("expected error code %q, got %q", ErrInsufficientStorage, resp.Error)
	}
}

// Test that valid single file upload returns correct metadata fields
func TestHandleUploadResponseFields(t *testing.T) {
	cfg := newTestConfig(t)

	req := buildUploadRequest(t, map[string][]byte{
		"IMG_4821.jpg": []byte("fake jpeg data here"),
	})
	rr := httptest.NewRecorder()
	handleUpload(cfg)(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp map[string][]UploadedFileInfo
	json.NewDecoder(rr.Body).Decode(&resp)
	files := resp["files"]
	if len(files) != 1 {
		t.Fatalf("expected 1 file, got %d", len(files))
	}
	f := files[0]
	if f.Name != "IMG_4821.jpg" {
		t.Errorf("name mismatch: got %q", f.Name)
	}
	if f.Extension != "JPG" {
		t.Errorf("extension should be uppercase, got %q", f.Extension)
	}
	if f.Format != "jpeg" {
		t.Errorf("format for .jpg should be 'jpeg', got %q", f.Format)
	}
	if f.Type != "image" {
		t.Errorf("type should be 'image', got %q", f.Type)
	}
	if f.Size <= 0 {
		t.Errorf("size should be positive, got %d", f.Size)
	}
}
