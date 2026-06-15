package tests

import (
	"bytes"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	src "metacleaner-server/source"
)

func newTestConfig(t *testing.T) src.Config {
	t.Helper()
	return src.Config{
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

func TestHandleUploadMultiFile(t *testing.T) {
	cfg := newTestConfig(t)
	handler := src.HandleUpload(cfg)

	req := buildUploadRequest(t, map[string][]byte{
		"photo.jpg": []byte("fake jpeg content"),
		"clip.mp4":  []byte("fake mp4 content"),
	})
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp struct {
		Files      []src.UploadedFileInfo  `json:"files"`
		FileErrors []src.UploadedFileError `json:"fileErrors"`
	}
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatal(err)
	}
	if len(resp.Files) != 2 {
		t.Fatalf("expected 2 files in response, got %d", len(resp.Files))
	}
	if len(resp.FileErrors) != 0 {
		t.Fatalf("expected 0 fileErrors, got %d: %v", len(resp.FileErrors), resp.FileErrors)
	}
	uploadsDir := filepath.Join(cfg.TempStoragePath, "uploads")
	for _, f := range resp.Files {
		if len(f.ID) < 4 {
			t.Errorf("file ID %q looks too short", f.ID)
		}
		matches, _ := filepath.Glob(filepath.Join(uploadsDir, f.ID+"_original.*"))
		if len(matches) == 0 {
			t.Errorf("no saved file found on disk for ID %q", f.ID)
		}
	}
}

func TestHandleUploadFileTooLarge(t *testing.T) {
	cfg := newTestConfig(t)
	cfg.MaxFileSize = 10

	req := buildUploadRequest(t, map[string][]byte{
		"big.jpg": bytes.Repeat([]byte("x"), 20),
	})
	rr := httptest.NewRecorder()
	src.HandleUpload(cfg)(rr, req)

	// Files exceeding the size limit are now reported as per-file errors (status 200).
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp map[string]interface{}
	json.NewDecoder(rr.Body).Decode(&resp)
	fileErrors, _ := resp["fileErrors"].([]interface{})
	if len(fileErrors) != 1 {
		t.Fatalf("expected 1 fileError, got %d: %v", len(fileErrors), resp)
	}
	fe := fileErrors[0].(map[string]interface{})
	if fe["error"] != src.ErrFileTooLarge {
		t.Errorf("expected error code %q, got %q", src.ErrFileTooLarge, fe["error"])
	}
}

func TestHandleUploadUnsupportedFormat(t *testing.T) {
	cfg := newTestConfig(t)

	req := buildUploadRequest(t, map[string][]byte{
		"document.pdf": []byte("fake pdf content"),
	})
	rr := httptest.NewRecorder()
	src.HandleUpload(cfg)(rr, req)

	// Unsupported formats are now reported as per-file errors (status 200).
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp map[string]interface{}
	json.NewDecoder(rr.Body).Decode(&resp)
	fileErrors, _ := resp["fileErrors"].([]interface{})
	if len(fileErrors) != 1 {
		t.Fatalf("expected 1 fileError, got %d: %v", len(fileErrors), resp)
	}
	fe := fileErrors[0].(map[string]interface{})
	if fe["error"] != src.ErrUnsupportedFormat {
		t.Errorf("expected error code %q, got %q", src.ErrUnsupportedFormat, fe["error"])
	}
}

func TestHandleUploadMixedBatch(t *testing.T) {
	cfg := newTestConfig(t)

	req := buildUploadRequest(t, map[string][]byte{
		"photo.jpg":    []byte("fake jpeg content"),
		"document.pdf": []byte("fake pdf content"),
	})
	rr := httptest.NewRecorder()
	src.HandleUpload(cfg)(rr, req)

	// Mixed batch: valid file accepted, unsupported format reported as per-file error.
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp map[string]interface{}
	json.NewDecoder(rr.Body).Decode(&resp)
	files, _ := resp["files"].([]interface{})
	fileErrors, _ := resp["fileErrors"].([]interface{})
	if len(files) != 1 {
		t.Fatalf("expected 1 accepted file, got %d", len(files))
	}
	if len(fileErrors) != 1 {
		t.Fatalf("expected 1 fileError, got %d", len(fileErrors))
	}
	fe := fileErrors[0].(map[string]interface{})
	if fe["error"] != src.ErrUnsupportedFormat {
		t.Errorf("expected error code %q, got %q", src.ErrUnsupportedFormat, fe["error"])
	}
}

func TestHandleUploadDiskWriteFailure(t *testing.T) {
	cfg := newTestConfig(t)
	cfg.TempStoragePath = "/proc/nonexistent-metacleaner-test"

	req := buildUploadRequest(t, map[string][]byte{
		"photo.jpg": []byte("fake jpeg content"),
	})
	rr := httptest.NewRecorder()
	src.HandleUpload(cfg)(rr, req)

	if rr.Code != http.StatusInsufficientStorage {
		t.Fatalf("expected 507, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp src.ErrorResponse
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp.Error != src.ErrInsufficientStorage {
		t.Errorf("expected error code %q, got %q", src.ErrInsufficientStorage, resp.Error)
	}
}

func TestHandleUploadResponseFields(t *testing.T) {
	cfg := newTestConfig(t)

	req := buildUploadRequest(t, map[string][]byte{
		"IMG_4821.jpg": []byte("fake jpeg data here"),
	})
	rr := httptest.NewRecorder()
	src.HandleUpload(cfg)(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp struct {
		Files      []src.UploadedFileInfo  `json:"files"`
		FileErrors []src.UploadedFileError `json:"fileErrors"`
	}
	json.NewDecoder(rr.Body).Decode(&resp)
	if len(resp.Files) != 1 {
		t.Fatalf("expected 1 file, got %d", len(resp.Files))
	}
	f := resp.Files[0]
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
