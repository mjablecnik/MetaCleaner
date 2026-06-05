package tests

import (
	"os"
	"path/filepath"
	"testing"
	"time"

	src "metacleaner-server/src"
)

// writeTestFile creates a file at path with the given modification time.
func writeTestFile(t *testing.T, path string, modTime time.Time) {
	t.Helper()
	if err := os.WriteFile(path, []byte("test"), 0644); err != nil {
		t.Fatalf("failed to create test file %s: %v", path, err)
	}
	if err := os.Chtimes(path, modTime, modTime); err != nil {
		t.Fatalf("failed to set mtime on %s: %v", path, err)
	}
}

func setupCleanupDirs(t *testing.T) (string, *src.CleanupScheduler) {
	t.Helper()
	base := t.TempDir()
	for _, sub := range []string{"uploads", "cleaned"} {
		if err := os.MkdirAll(filepath.Join(base, sub), 0755); err != nil {
			t.Fatalf("mkdir %s: %v", sub, err)
		}
	}
	return base, src.NewCleanupScheduler(time.Hour, base)
}

// Test: expired files in both uploads/ and cleaned/ are deleted.
func TestCleanupRemovesExpiredFiles(t *testing.T) {
	base, cs := setupCleanupDirs(t)
	old := time.Now().Add(-2 * time.Hour)

	expiredUpload := filepath.Join(base, "uploads", "f-aa001122_original.jpg")
	expiredCleaned := filepath.Join(base, "cleaned", "f-aa001122_cleaned.jpg")
	writeTestFile(t, expiredUpload, old)
	writeTestFile(t, expiredCleaned, old)

	cs.RunCleanup()

	if _, err := os.Stat(expiredUpload); !os.IsNotExist(err) {
		t.Error("expired upload file should have been deleted")
	}
	if _, err := os.Stat(expiredCleaned); !os.IsNotExist(err) {
		t.Error("expired cleaned file should have been deleted")
	}
}

// Test: non-expired files are retained.
func TestCleanupRetainsNonExpiredFiles(t *testing.T) {
	base, cs := setupCleanupDirs(t)
	recent := time.Now().Add(-10 * time.Minute)

	freshUpload := filepath.Join(base, "uploads", "f-bb002233_original.png")
	freshCleaned := filepath.Join(base, "cleaned", "f-bb002233_cleaned.png")
	writeTestFile(t, freshUpload, recent)
	writeTestFile(t, freshCleaned, recent)

	cs.RunCleanup()

	if _, err := os.Stat(freshUpload); err != nil {
		t.Errorf("fresh upload file should not have been deleted: %v", err)
	}
	if _, err := os.Stat(freshCleaned); err != nil {
		t.Errorf("fresh cleaned file should not have been deleted: %v", err)
	}
}

// Test: cleanup handles missing directories gracefully without panicking.
func TestCleanupMissingDirectories(t *testing.T) {
	cs := src.NewCleanupScheduler(time.Hour, t.TempDir()+"/nonexistent")
	// Should not panic
	cs.RunCleanup()
}

// Test: expired and fresh files coexist — only expired ones are removed.
func TestCleanupMixedFiles(t *testing.T) {
	base, cs := setupCleanupDirs(t)
	old := time.Now().Add(-90 * time.Minute)
	recent := time.Now().Add(-30 * time.Minute)

	expired := filepath.Join(base, "uploads", "f-cc003344_original.jpg")
	fresh := filepath.Join(base, "uploads", "f-dd004455_original.jpg")
	writeTestFile(t, expired, old)
	writeTestFile(t, fresh, recent)

	cs.RunCleanup()

	if _, err := os.Stat(expired); !os.IsNotExist(err) {
		t.Error("expired file should have been deleted")
	}
	if _, err := os.Stat(fresh); err != nil {
		t.Errorf("fresh file should not have been deleted: %v", err)
	}
}

// Test: extractFileID correctly parses file names.
func TestExtractFileID(t *testing.T) {
	cases := []struct {
		filename string
		want     string
	}{
		{"f-abcd1234_original.jpg", "f-abcd1234"},
		{"f-abcd1234_cleaned.png", "f-abcd1234"},
		{"nounderscore.jpg", "nounderscore"},
		{"multi_under_score.mp4", "multi_under"},
	}
	for _, tc := range cases {
		got := src.ExtractFileID(tc.filename)
		if got != tc.want {
			t.Errorf("ExtractFileID(%q) = %q, want %q", tc.filename, got, tc.want)
		}
	}
}
