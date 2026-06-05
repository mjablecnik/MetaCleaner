package source

import (
	"context"
	"log"
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

// RunCleanup scans uploads/ and cleaned/ directories and deletes expired files.
func (cs *CleanupScheduler) RunCleanup() {
	dirs := []string{
		filepath.Join(cs.tempStoragePath, "uploads"),
		filepath.Join(cs.tempStoragePath, "cleaned"),
	}

	now := time.Now()
	for _, dir := range dirs {
		entries, err := os.ReadDir(dir)
		if err != nil {
			if !os.IsNotExist(err) {
				log.Printf("cleanup: failed to read directory %s: %v", dir, err)
			}
			continue
		}

		for _, entry := range entries {
			if entry.IsDir() {
				continue
			}

			info, err := entry.Info()
			if err != nil {
				log.Printf("cleanup: failed to stat %s: %v", entry.Name(), err)
				continue
			}

			age := now.Sub(info.ModTime())
			if age <= cs.retentionPeriod {
				continue
			}

			path := filepath.Join(dir, entry.Name())
			fileID := ExtractFileID(entry.Name())
			if err := os.Remove(path); err != nil {
				log.Printf("cleanup: failed to delete %s: %v", path, err)
			} else {
				log.Printf("cleanup: deleted %s (id=%s, age=%s)", entry.Name(), fileID, age.Round(time.Second))
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
