package source

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
	"syscall"
)

type diskSpaceInfo struct {
	Available string `json:"available"`
	Total     string `json:"total"`
}

type healthResponse struct {
	Status    string        `json:"status"`
	ExifTool  bool          `json:"exiftool"`
	FFmpeg    bool          `json:"ffmpeg"`
	Database  bool          `json:"database"`
	DiskSpace diskSpaceInfo `json:"diskSpace"`
}

// HandleHealth handles GET /api/health — checks tool availability, DB connectivity, and disk space.
func HandleHealth(cfg Config, db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		exiftoolOK := exec.Command("exiftool", "-ver").Run() == nil
		ffmpegOK := exec.Command("ffmpeg", "-version").Run() == nil
		dbOK := db.Ping(r.Context()) == nil

		var stat syscall.Statfs_t
		diskAvail := "unknown"
		diskTotal := "unknown"
		if syscall.Statfs(cfg.TempStoragePath, &stat) == nil {
			avail := stat.Bavail * uint64(stat.Bsize)
			total := stat.Blocks * uint64(stat.Bsize)
			diskAvail = formatBytesHuman(int64(avail))
			diskTotal = formatBytesHuman(int64(total))
		}

		status := "healthy"
		if !exiftoolOK || !ffmpegOK || !dbOK {
			status = "degraded"
		}

		resp := healthResponse{
			Status:   status,
			ExifTool: exiftoolOK,
			FFmpeg:   ffmpegOK,
			Database: dbOK,
			DiskSpace: diskSpaceInfo{
				Available: diskAvail,
				Total:     diskTotal,
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
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
