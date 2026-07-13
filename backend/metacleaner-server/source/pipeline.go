package source

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

// CleaningPipeline orchestrates file metadata stripping.
type CleaningPipeline struct {
	cfg    Config
	tigris *TigrisClient
}

// NewCleaningPipeline creates a pipeline using the given config. Cleaned files are
// kept on local disk (no Tigris upload) unless a TigrisClient is attached via
// NewCleaningPipelineWithTigris.
func NewCleaningPipeline(cfg Config) *CleaningPipeline {
	return &CleaningPipeline{cfg: cfg}
}

// NewCleaningPipelineWithTigris creates a pipeline that uploads cleaned files to
// Tigris and deletes the local copy immediately after each successful upload.
func NewCleaningPipelineWithTigris(cfg Config, tigris *TigrisClient) *CleaningPipeline {
	return &CleaningPipeline{cfg: cfg, tigris: tigris}
}

// Cfg returns the pipeline's configuration (used by tests to access TempStoragePath).
func (p *CleaningPipeline) Cfg() Config {
	return p.cfg
}

// ProcessJob processes all files in the job sequentially, calling progressFn for each event.
func (p *CleaningPipeline) ProcessJob(ctx context.Context, job *Job, files []FileRecord, progressFn func(ProgressEvent)) error {
	start := time.Now()
	total := len(files)

	for i := range files {
		if ctx.Err() != nil {
			return ctx.Err()
		}

		f := &files[i]
		f.Status = "in_progress"

		fileProgressID := f.LocalID
		if fileProgressID == "" {
			fileProgressID = f.ID
		}

		progressFn(ProgressEvent{
			Type:            "file_progress",
			FileID:          fileProgressID,
			Status:          "in_progress",
			OverallProgress: CalculateJobProgress(i, total),
			FilesCompleted:  i,
			TotalFiles:      total,
			CurrentFileID:   fileProgressID,
		})

		originalPath := filepath.Join(p.cfg.TempStoragePath, "uploads", f.LocalID+"_original."+strings.TrimPrefix(f.FileExtension, "."))

		// If Tigris is configured and the file isn't on local disk, download it.
		if p.tigris != nil {
			if _, statErr := os.Stat(originalPath); os.IsNotExist(statErr) {
				uploadsDir := filepath.Join(p.cfg.TempStoragePath, "uploads")
				os.MkdirAll(uploadsDir, 0755) //nolint:errcheck
				tigrisKey := fmt.Sprintf("uploads/%s_original.%s", f.LocalID, strings.TrimPrefix(f.FileExtension, "."))
				if dlErr := p.tigris.Download(ctx, tigrisKey, originalPath); dlErr != nil {
					f.Status = "error"
					f.ErrorCode = ErrFileNotFound
					f.ErrorMessage = "failed to download original file from storage"
					slog.Warn("pipeline: tigris download failed", "fileId", f.LocalID, "key", tigrisKey, "error", dlErr)
					progressFn(buildFileErrorEvent(f, i+1, total))
					continue
				}
			}
		}

		cleanedDir := filepath.Join(p.cfg.TempStoragePath, "cleaned")
		if err := os.MkdirAll(cleanedDir, 0755); err != nil {
			f.Status = "error"
			f.ErrorCode = ErrInsufficientStorage
			f.ErrorMessage = "failed to create cleaned directory"
			progressFn(buildFileErrorEvent(f, i+1, total))
			continue
		}

		cleanedPath := filepath.Join(cleanedDir, f.LocalID+"_cleaned."+strings.TrimPrefix(f.FileExtension, "."))

		var result *CleaningResult
		var processErr error

		if SelectTool(f.FileExtension) == "exiftool" {
			result, processErr = runExifTool(ctx, originalPath, cleanedPath)
		} else {
			result, processErr = runFFmpeg(ctx, originalPath, cleanedPath)
		}

		now := time.Now()
		if processErr != nil {
			f.Status = "error"
			f.ErrorCode = "PROCESSING_FAILED"
			f.ErrorMessage = processErr.Error()
			progressFn(buildFileErrorEvent(f, i+1, total))
			continue
		}

		// Compute SHA-256 of the cleaned file for integrity verification.
		fileHash, hashErr := computeFileSHA256(cleanedPath)
		if hashErr != nil {
			f.Status = "error"
			f.ErrorCode = "PROCESSING_FAILED"
			f.ErrorMessage = "failed to compute file hash: " + hashErr.Error()
			progressFn(buildFileErrorEvent(f, i+1, total))
			continue
		}

		ext := strings.TrimPrefix(f.FileExtension, ".")

		if p.tigris != nil {
			if key, uploadErr := p.uploadCleanedFile(ctx, cleanedPath, f.LocalID, ext); uploadErr != nil {
				slog.Warn("pipeline: tigris upload failed, keeping local file", "fileId", f.LocalID, "error", uploadErr)
			} else {
				f.CleanedStorageKey = key
				os.Remove(cleanedPath) //nolint:errcheck
			}
			// Remove local original — it was downloaded from Tigris temporarily.
			os.Remove(originalPath) //nolint:errcheck
		}

		f.Status = "done"
		f.ProcessedAt = &now
		f.FieldsRemoved = result.FieldsRemoved
		f.GPSRemoved = result.GPSRemoved
		f.Device = result.Device
		f.MetadataBreakdown = result.MetadataBreakdown
		f.SHA256Hash = fileHash
		f.CleanedName = buildCleanedFileName(f.LocalID, ext)

		job.FilesCompleted++
		job.FieldsRemoved += result.FieldsRemoved
		if result.GPSRemoved {
			job.GPSLocationsRemoved++
		}

		progressFn(ProgressEvent{
			Type:            "file_complete",
			FileID:          fileProgressID,
			Status:          "done",
			FieldsRemoved:   result.FieldsRemoved,
			GPSRemoved:      result.GPSRemoved,
			OverallProgress: CalculateJobProgress(i+1, total),
			FilesCompleted:  i + 1,
			TotalFiles:      total,
		})
	}

	elapsedMs := int(time.Since(start).Milliseconds())
	job.TotalTimeMs = elapsedMs
	job.Status = "completed"
	completed := time.Now()
	job.CompletedAt = &completed

	progressFn(ProgressEvent{
		Type:                "job_complete",
		JobID:               job.ID,
		Status:              "completed",
		OverallProgress:     100,
		FilesCompleted:      job.FilesCompleted,
		TotalFiles:          total,
		FieldsRemoved:       job.FieldsRemoved,
		TotalTimeMs:         elapsedMs,
		GPSLocationsRemoved: job.GPSLocationsRemoved,
	})

	return nil
}

func buildFileErrorEvent(f *FileRecord, completed, total int) ProgressEvent {
	fileProgressID := f.LocalID
	if fileProgressID == "" {
		fileProgressID = f.ID
	}
	return ProgressEvent{
		Type:            "file_error",
		FileID:          fileProgressID,
		Status:          "error",
		ErrorCode:       f.ErrorCode,
		Message:         f.ErrorMessage,
		OverallProgress: CalculateJobProgress(completed, total),
		FilesCompleted:  completed,
		TotalFiles:      total,
	}
}

// uploadCleanedFile uploads the cleaned file at path to Tigris under the standard
// cleaned/{localId}_cleaned.{ext} key pattern and returns the key on success.
func (p *CleaningPipeline) uploadCleanedFile(ctx context.Context, path, localID, ext string) (string, error) {
	file, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer file.Close()

	key := fmt.Sprintf("cleaned/%s_cleaned.%s", localID, ext)
	if err := p.tigris.Upload(ctx, key, file, contentTypeForExt(ext)); err != nil {
		return "", err
	}
	return key, nil
}

// computeFileSHA256 computes the SHA-256 hash of a file and returns it as a hex string.
func computeFileSHA256(path string) (string, error) {
	f, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer f.Close()

	h := sha256.New()
	if _, err := io.Copy(h, f); err != nil {
		return "", err
	}
	return hex.EncodeToString(h.Sum(nil)), nil
}

// GetToolVersions returns the versions of ExifTool and FFmpeg installed on the system.
func GetToolVersions() (exiftoolVer, ffmpegVer string) {
	if out, err := exec.Command("exiftool", "-ver").Output(); err == nil {
		exiftoolVer = strings.TrimSpace(string(out))
	} else {
		exiftoolVer = "unknown"
	}
	if out, err := exec.Command("ffmpeg", "-version").Output(); err == nil {
		lines := strings.Split(string(out), "\n")
		if len(lines) > 0 {
			parts := strings.Fields(lines[0])
			if len(parts) >= 3 {
				ffmpegVer = parts[2]
			} else {
				ffmpegVer = lines[0]
			}
		}
	} else {
		ffmpegVer = "unknown"
	}
	return
}
