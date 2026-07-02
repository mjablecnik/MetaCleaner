package source

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
	"sync"
	"syscall"
)

// toolCache caches exiftool/ffmpeg availability at startup (immutable at runtime).
var toolCache struct {
	once       sync.Once
	exiftoolOK bool
	ffmpegOK   bool
}

func checkTools() (bool, bool) {
	toolCache.once.Do(func() {
		toolCache.exiftoolOK = exec.Command("exiftool", "-ver").Run() == nil
		toolCache.ffmpegOK = exec.Command("ffmpeg", "-version").Run() == nil
	})
	return toolCache.exiftoolOK, toolCache.ffmpegOK
}

type healthResponse struct {
	Status string `json:"status"`
}

// HandleHealth handles GET /api/health.
// Returns only {"status":"healthy|degraded"} to avoid disclosing infrastructure
// details (exact stack, DB state, free disk) to unauthenticated callers.
// Tool checks are cached after the first call since exiftool/ffmpeg don't change at runtime.
func HandleHealth(cfg Config, db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		exiftoolOK, ffmpegOK := checkTools()
		dbOK := db.Ping(r.Context()) == nil

		status := "healthy"
		if !exiftoolOK || !ffmpegOK || !dbOK {
			status = "degraded"
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(healthResponse{Status: status})
	}
}

func formatBytesHuman(b int64) string {
	const (
		gb = 1024 * 1024 * 1024
		mb = 1024 * 1024
	)
	switch {
	case b >= gb:
		return fmt.Sprintf("%.1f GB", float64(b)/float64(gb))
	case b >= mb:
		return fmt.Sprintf("%.1f MB", float64(b)/float64(mb))
	default:
		return fmt.Sprintf("%d B", b)
	}
}

// Keep diskSpaceInfo for future internal use.
type diskSpaceInfo struct {
	Available string `json:"available"`
	Total     string `json:"total"`
}

func getDiskSpace(path string) diskSpaceInfo {
	var stat syscall.Statfs_t
	if syscall.Statfs(path, &stat) == nil {
		return diskSpaceInfo{
			Available: formatBytesHuman(int64(stat.Bavail * uint64(stat.Bsize))),
			Total:     formatBytesHuman(int64(stat.Blocks * uint64(stat.Bsize))),
		}
	}
	return diskSpaceInfo{Available: "unknown", Total: "unknown"}
}
