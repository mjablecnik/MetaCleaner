package source

import (
	"archive/zip"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type createJobRequest struct {
	FileIDs   []string          `json:"fileIds"`
	FileNames map[string]string `json:"fileNames,omitempty"` // optional map of fileId → original upload name
}

// CreateJobResponse is the response structure for job creation.
type CreateJobResponse struct {
	JobID      string    `json:"jobId"`
	Status     string    `json:"status"`
	TotalFiles int       `json:"totalFiles"`
	CreatedAt  time.Time `json:"createdAt"`
}

// HandleCreateJob handles POST /api/jobs — validates file IDs, creates a job record, and starts the pipeline.
func HandleCreateJob(cfg Config, db *SupabaseClient, hub *WebSocketHub, pl *CleaningPipeline, pool *JobWorkerPool, authClient *SupabaseAuthClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())

		r.Body = http.MaxBytesReader(w, r.Body, 1<<20) // 1 MB limit
		var req createJobRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, ErrInvalidRequest, "Invalid request body")
			return
		}
		if len(req.FileIDs) == 0 {
			WriteError(w, http.StatusBadRequest, ErrInvalidRequest, "fileIds must not be empty")
			return
		}

		uploadsDir := filepath.Join(cfg.TempStoragePath, "uploads")
		files := make([]FileRecord, 0, len(req.FileIDs))

		for _, fileID := range req.FileIDs {
			if !localIDPattern.MatchString(fileID) {
				WriteError(w, http.StatusBadRequest, ErrInvalidRequest,
					fmt.Sprintf("Invalid file ID format: %q", fileID))
				return
			}
			matches, _ := filepath.Glob(filepath.Join(uploadsDir, fileID+"_original.*"))
			if len(matches) == 0 {
				WriteError(w, http.StatusNotFound, ErrFileNotFound, fmt.Sprintf("File %q not found", fileID))
				return
			}
			info, err := os.Stat(matches[0])
			if err != nil {
				WriteError(w, http.StatusNotFound, ErrFileNotFound, fmt.Sprintf("File %q not accessible", fileID))
				return
			}
			ext := filepath.Ext(matches[0])
			originalName := ""
			if req.FileNames != nil {
				originalName = req.FileNames[fileID]
			}
			files = append(files, FileRecord{
				LocalID:       fileID,
				FileName:      fileID + ext,
				OriginalName:  originalName,
				FileExtension: ext,
				FileSizeBytes: info.Size(),
				FileType:      GetFileType(ext),
				Format:        canonicalFormat(ext),
				Status:        "pending",
			})
		}

		subCredits, purchasedCredits, err := db.GetCreditBalance(r.Context(), userID)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "Failed to check credit balance")
			return
		}
		if subCredits+purchasedCredits < len(files) {
			WriteError(w, http.StatusPaymentRequired, ErrInsufficientCredits,
				fmt.Sprintf("Insufficient credits: need %d, have %d", len(files), subCredits+purchasedCredits))
			return
		}

		job := &Job{
			UserID:     userID,
			Status:     "processing",
			TotalFiles: len(files),
		}
		if err := db.CreateJob(r.Context(), job); err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "Failed to create job")
			return
		}
		for i := range files {
			files[i].JobID = job.ID
			files[i].UserID = userID
		}
		if err := db.CreateFileRecords(r.Context(), files); err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "Failed to create file records")
			return
		}

		// Channel signals that at least one WebSocket client has registered for this job,
		// or a timeout elapsed — whichever comes first. This ensures progress events
		// are not lost due to the WS connection being slower than the pipeline start.
		wsReady := hub.WaitForRegistration(job.ID, 3*time.Second)

		go func() {
			// Wait until a WS client connects or the timeout expires.
			<-wsReady

			ctx := context.Background()
			ProcessJobWithPool(pool, ctx, cfg, db, hub, pl, job, files, authClient)
		}()

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(CreateJobResponse{
			JobID:      job.ID,
			Status:     job.Status,
			TotalFiles: job.TotalFiles,
			CreatedAt:  job.CreatedAt,
		})
	}
}

// contentTypeForExt returns the MIME type for a given file extension (without dot).
func contentTypeForExt(ext string) string {
	switch strings.ToLower(ext) {
	case "jpg", "jpeg":
		return "image/jpeg"
	case "png":
		return "image/png"
	case "heic":
		return "image/heic"
	case "heif":
		return "image/heif"
	case "avif":
		return "image/avif"
	case "tiff", "tif":
		return "image/tiff"
	case "dng":
		return "image/dng"
	case "webp":
		return "image/webp"
	case "gif":
		return "image/gif"
	case "mp4":
		return "video/mp4"
	case "mov":
		return "video/quicktime"
	case "avi":
		return "video/x-msvideo"
	case "mkv":
		return "video/x-matroska"
	case "webm":
		return "video/webm"
	case "wmv":
		return "video/x-ms-wmv"
	case "flv":
		return "video/x-flv"
	case "3gp":
		return "video/3gpp"
	case "mpeg", "mpg":
		return "video/mpeg"
	case "ogv":
		return "video/ogg"
	case "mts":
		return "video/MP2T"
	default:
		return "application/octet-stream"
	}
}

// HandleFileDownload handles GET /api/files/{id}/download — serves the cleaned file.
func HandleFileDownload(cfg Config, db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fileID := r.PathValue("id")
		if fileID == "" || !localIDPattern.MatchString(fileID) {
			WriteError(w, http.StatusBadRequest, ErrInvalidRequest, "Invalid file ID")
			return
		}

		// Verify that the file belongs to the authenticated user.
		userID := UserIDFromContext(r.Context())
		if userID != "" {
			owned, err := db.VerifyFileOwnership(r.Context(), fileID, userID)
			if err != nil || !owned {
				WriteError(w, http.StatusNotFound, ErrFileNotFound, "File not found or has expired")
				return
			}
		}

		cleanedDir := filepath.Join(cfg.TempStoragePath, "cleaned")
		uploadsDir := filepath.Join(cfg.TempStoragePath, "uploads")

		// Look for the cleaned file.
		cleanedMatches, _ := filepath.Glob(filepath.Join(cleanedDir, fileID+"_cleaned.*"))
		if len(cleanedMatches) > 0 {
			// File is ready — serve it.
			cleanedPath := cleanedMatches[0]
			ext := strings.TrimPrefix(filepath.Ext(cleanedPath), ".")

			// Look up the original upload name for a meaningful download filename.
			originalMatches, _ := filepath.Glob(filepath.Join(uploadsDir, fileID+"_original.*"))
			downloadName := buildCleanedFileName(fileID, ext, originalMatches)

			w.Header().Set("Content-Type", contentTypeForExt(ext))
			w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, downloadName))
			http.ServeFile(w, r, cleanedPath)
			return
		}

		// Cleaned file doesn't exist — check if original is still present (in progress).
		originalMatches, _ := filepath.Glob(filepath.Join(uploadsDir, fileID+"_original.*"))
		if len(originalMatches) > 0 {
			WriteError(w, http.StatusConflict, ErrFileNotReady, "File is not ready for download yet")
			return
		}

		// Neither file found — expired or never existed.
		WriteError(w, http.StatusNotFound, ErrFileNotFound, "File not found or has expired")
	}
}

// HandleJobDownload handles GET /api/jobs/{id}/download — streams all cleaned files as a ZIP archive.
func HandleJobDownload(cfg Config, db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		jobID := r.PathValue("id")
		if jobID == "" {
			WriteError(w, http.StatusBadRequest, ErrInvalidRequest, "Missing job ID")
			return
		}

		userID := UserIDFromContext(r.Context())
		job, err := db.GetJob(r.Context(), jobID, userID)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "Failed to fetch job")
			return
		}
		if job == nil {
			WriteError(w, http.StatusNotFound, ErrJobNotFound, "Job not found")
			return
		}
		if job.Status != "completed" {
			WriteError(w, http.StatusConflict, ErrJobNotReady, "Job is still processing")
			return
		}

		files, err := db.GetFileRecords(r.Context(), jobID)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "Failed to fetch file records")
			return
		}

		cleanedDir := filepath.Join(cfg.TempStoragePath, "cleaned")

		type zipEntry struct {
			path     string
			fileName string
		}
		entries := make([]zipEntry, 0, len(files))

		for _, f := range files {
			if f.Status != "done" {
				continue
			}
			// LocalID is not persisted to DB — derive it from FileName by stripping the extension
			localID := strings.TrimSuffix(f.FileName, f.FileExtension)
			if !localIDPattern.MatchString(localID) {
				LoggerFromContext(r.Context()).Warn("HandleJobDownload: derived localID does not match expected pattern, skipping file", "localID", localID, "fileName", f.FileName, "fileId", f.ID)
				continue
			}
			matches, _ := filepath.Glob(filepath.Join(cleanedDir, localID+"_cleaned.*"))
			if len(matches) == 0 {
				continue
			}
			cleanedPath := matches[0]
			ext := strings.TrimPrefix(filepath.Ext(cleanedPath), ".")
			downloadName := buildCleanedFileName(localID, ext, nil)
			entries = append(entries, zipEntry{path: cleanedPath, fileName: downloadName})
		}

		if len(entries) == 0 {
			WriteError(w, http.StatusNotFound, ErrFilesExpired, "Cleaned files have expired")
			return
		}

		w.Header().Set("Content-Type", "application/zip")
		w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="metacleaner-%s.zip"`, jobID))

		zipWriter := zip.NewWriter(w)
		defer zipWriter.Close()

		for _, entry := range entries {
			file, err := os.Open(entry.path)
			if err != nil {
				continue
			}
			writer, err := zipWriter.Create(entry.fileName)
			if err != nil {
				file.Close()
				continue
			}
			io.Copy(writer, file) //nolint:errcheck
			file.Close()
		}

		// Include the PDF report in the ZIP if available.
		if reportID, err := db.GetReportIDByJobID(r.Context(), jobID); err == nil && reportID != "" {
			if report, _, err := db.GetReportByHumanID(r.Context(), reportID, ""); err == nil && report != nil {
				if report.PDFStatus == "uploaded" && report.PDFPath != "" {
					if pdfData, err := db.DownloadPDF(r.Context(), report.PDFPath); err == nil && len(pdfData) > 0 {
						pdfName := fmt.Sprintf("MetaCleaner_Report_%s.pdf", reportID)
						if writer, err := zipWriter.Create(pdfName); err == nil {
							writer.Write(pdfData) //nolint:errcheck
						}
					} else if err != nil {
						slog.Warn("job-download: failed to download PDF for ZIP inclusion", "jobId", jobID, "reportId", reportID, "error", err)
					}
				} else {
					slog.Info("job-download: PDF not yet available, skipping ZIP inclusion", "jobId", jobID, "reportId", reportID, "pdfStatus", report.PDFStatus)
				}
			}
		}
	}
}

// HandleGetJob handles GET /api/jobs/{id} — returns current job state.
// For completed jobs, also looks up the associated reportId so the frontend
// polling fallback can navigate to the report without relying on the WS report_ready event.
func HandleGetJob(db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		jobID := r.PathValue("id")
		if jobID == "" {
			WriteError(w, http.StatusBadRequest, ErrInvalidRequest, "Missing job ID")
			return
		}
		userID := UserIDFromContext(r.Context())
		job, err := db.GetJob(r.Context(), jobID, userID)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "Failed to fetch job")
			return
		}
		if job == nil {
			WriteError(w, http.StatusNotFound, ErrJobNotFound, "Job not found")
			return
		}
		if job.Status == "completed" {
			if reportID, err := db.GetReportIDByJobID(r.Context(), job.ID); err == nil {
				job.ReportID = reportID
			}
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(job)
	}
}

// buildCleanedFileName generates a download filename with IMG_/VID_ prefix to neutralize
// AI-revealing filenames. Format: IMG_<fileID>_cleaned.<ext> or VID_<fileID>_cleaned.<ext>
func buildCleanedFileName(fileID, ext string, originalMatches []string) string {
	baseName := fileID
	_ = originalMatches

	prefix := "IMG_"
	if videoFormats[strings.ToLower(ext)] {
		prefix = "VID_"
	}

	return fmt.Sprintf("%s%s_cleaned.%s", prefix, baseName, ext)
}
