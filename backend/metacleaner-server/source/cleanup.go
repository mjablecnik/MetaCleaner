package source

import (
	"context"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// CleanupScheduler periodically removes expired temp files.
type CleanupScheduler struct {
	retentionPeriod time.Duration
	tempStoragePath string
}

// NewCleanupScheduler creates a scheduler with the given retention period and temp path.
func NewCleanupScheduler(retentionPeriod time.Duration, tempStoragePath string) *CleanupScheduler {
	return &CleanupScheduler{
		retentionPeriod: retentionPeriod,
		tempStoragePath: tempStoragePath,
	}
}

// Start runs an immediate cleanup then schedules one every 5 minutes until ctx is cancelled.
func (cs *CleanupScheduler) Start(ctx context.Context) {
	cs.RunCleanup()

	ticker := time.NewTicker(5 * time.Minute)
	go func() {
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				cs.RunCleanup()
			case <-ctx.Done():
				return
			}
		}
	}()
}

// RunCleanup scans the uploads/ directory and deletes expired files. Cleaned files are
// deleted immediately after Tigris upload (or, in local-dev fallback, served directly),
// so cleaned/ no longer needs scanning here — Tigris bucket lifecycle handles its expiry.
func (cs *CleanupScheduler) RunCleanup() {
	dirs := []string{
		filepath.Join(cs.tempStoragePath, "uploads"),
	}

	now := time.Now()
	for _, dir := range dirs {
		entries, err := os.ReadDir(dir)
		if err != nil {
			if !os.IsNotExist(err) {
				slog.Warn("cleanup: failed to read directory", "dir", dir, "error", err)
			}
			continue
		}

		for _, entry := range entries {
			if entry.IsDir() {
				continue
			}

			info, err := entry.Info()
			if err != nil {
				slog.Warn("cleanup: failed to stat file", "name", entry.Name(), "error", err)
				continue
			}

			age := now.Sub(info.ModTime())
			if age <= cs.retentionPeriod {
				continue
			}

			path := filepath.Join(dir, entry.Name())
			fileID := ExtractFileID(entry.Name())
			if err := os.Remove(path); err != nil {
				slog.Warn("cleanup: failed to delete file", "path", path, "error", err)
			} else {
				slog.Info("cleanup: deleted file", "name", entry.Name(), "id", fileID, "age", age.Round(time.Second))
			}
		}
	}
}

// ExtractFileID parses "f-abcd1234_original.jpg" → "f-abcd1234".
func ExtractFileID(filename string) string {
	base := strings.TrimSuffix(filename, filepath.Ext(filename))
	if idx := strings.LastIndex(base, "_"); idx >= 0 {
		return base[:idx]
	}
	return base
}
