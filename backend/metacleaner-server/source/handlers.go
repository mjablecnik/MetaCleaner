package source

import (
	"archive/zip"
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"syscall"
	"time"
)

// localIDPattern validates the expected on-disk file ID format (f-{hex}).
var localIDPattern = regexp.MustCompile(`^f-[0-9a-f]+$`)

// UploadedFileInfo is the metadata returned for each accepted file on upload.
type UploadedFileInfo struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Size      int64  `json:"size"`
	Extension string `json:"extension"`
	Type      string `json:"type"`
	Format    string `json:"format"`
}

// UploadedFileError is returned for each file that failed validation or processing during upload.
type UploadedFileError struct {
	Name    string `json:"name"`
	Error   string `json:"error"`
	Message string `json:"message"`
}

// generateFileID creates a unique file ID in the format "f-{32hex}".
func generateFileID() (string, error) {
	b := make([]byte, 16)
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

// HandleUpload handles POST /api/upload — validates, saves, and returns file metadata.
func HandleUpload(cfg Config) http.HandlerFunc {
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
		fileErrors := make([]UploadedFileError, 0)

		for _, fh := range fileHeaders {
			// Validate size from multipart header when available.
			if fh.Size > cfg.MaxFileSize {
				fileErrors = append(fileErrors, UploadedFileError{
					Name:    fh.Filename,
					Error:   ErrFileTooLarge,
					Message: fmt.Sprintf("File %q exceeds maximum allowed size of %d MB", fh.Filename, cfg.MaxFileSize/(1024*1024)),
				})
				continue
			}

			// Validate file format by extension.
			ext := strings.ToLower(filepath.Ext(fh.Filename))
			if ext == "" || !ValidateFileFormat(ext) {
				fileErrors = append(fileErrors, UploadedFileError{
					Name:    fh.Filename,
					Error:   ErrUnsupportedFormat,
					Message: fmt.Sprintf("File format %q is not supported", ext),
				})
				continue
			}

			fileID, err := generateFileID()
			if err != nil {
				fileErrors = append(fileErrors, UploadedFileError{
					Name:    fh.Filename,
					Error:   ErrInsufficientStorage,
					Message: "Failed to generate file identifier",
				})
				continue
			}

			src, err := fh.Open()
			if err != nil {
				fileErrors = append(fileErrors, UploadedFileError{
					Name:    fh.Filename,
					Error:   ErrInsufficientStorage,
					Message: "Failed to read uploaded file",
				})
				continue
			}

			extNoDot := strings.TrimPrefix(ext, ".")
			destPath := filepath.Join(uploadsDir, fileID+"_original."+extNoDot)
			dst, err := os.Create(destPath)
			if err != nil {
				src.Close()
				fileErrors = append(fileErrors, UploadedFileError{
					Name:    fh.Filename,
					Error:   ErrInsufficientStorage,
					Message: "Failed to create storage file",
				})
				continue
			}

			// LimitReader acts as a safety net if Content-Length header was missing or spoofed.
			limitedSrc := io.LimitReader(src, cfg.MaxFileSize+1)
			written, copyErr := io.Copy(dst, limitedSrc)
			dst.Close()
			src.Close()

			if copyErr != nil {
				os.Remove(destPath)
				fileErrors = append(fileErrors, UploadedFileError{
					Name:    fh.Filename,
					Error:   ErrInsufficientStorage,
					Message: "Failed to write file to storage",
				})
				continue
			}
			if written > cfg.MaxFileSize {
				os.Remove(destPath)
				fileErrors = append(fileErrors, UploadedFileError{
					Name:    fh.Filename,
					Error:   ErrFileTooLarge,
					Message: fmt.Sprintf("File %q exceeds maximum allowed size of %d MB", fh.Filename, cfg.MaxFileSize/(1024*1024)),
				})
				continue
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
		json.NewEncoder(w).Encode(map[string]interface{}{
			"files":      accepted,
			"fileErrors": fileErrors,
		})
	}
}

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
func HandleCreateJob(cfg Config, db *SupabaseClient, hub *WebSocketHub, pl *CleaningPipeline) http.HandlerFunc {
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

		go func() {
			// Small delay to allow the frontend WebSocket client to connect
			// before we start broadcasting progress events.
			time.Sleep(500 * time.Millisecond)

			ctx := context.Background()
			progressFn := func(event ProgressEvent) { hub.Broadcast(job.ID, event) }
			if err := pl.ProcessJob(ctx, job, files, progressFn); err != nil {
				slog.Error("job: pipeline error", "jobId", job.ID, "error", err)
			}

			// Retry UpdateJob once — a transient DB error here leaves the job
			// stuck in "processing" with no way for the user to recover.
			if err := db.UpdateJob(ctx, job); err != nil {
				slog.Warn("job: UpdateJob failed, retrying", "jobId", job.ID, "error", err)
				if err2 := db.UpdateJob(ctx, job); err2 != nil {
					slog.Error("job: UpdateJob retry failed, broadcasting error", "jobId", job.ID, "error", err2)
					hub.Broadcast(job.ID, ProgressEvent{
						Type:    "job_error",
						JobID:   job.ID,
						Message: "Failed to save job results",
					})
					return
				}
			}

			for i := range files {
				if err := db.UpdateFileRecord(ctx, &files[i]); err != nil {
					slog.Warn("job: UpdateFileRecord failed", "jobId", job.ID, "fileId", files[i].LocalID, "error", err)
				}
			}
			createJobReport(ctx, cfg, db, hub, job, files)
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

// generateReportID returns a human-readable report ID in MCR-YYYY-MMDD-XX format.
func generateReportID(now time.Time) string {
	b := make([]byte, 1)
	rand.Read(b) //nolint:errcheck
	return fmt.Sprintf("MCR-%04d-%02d%02d-%02X", now.Year(), int(now.Month()), now.Day(), b[0])
}

// BuildReport constructs a Report record from completed job and file data.
func BuildReport(job *Job, files []FileRecord) *Report {
	now := time.Now().UTC()

	catCounts := map[string]int{"GPS": 0, "EXIF": 0, "XMP": 0, "ID3": 0, "MP4": 0}
	typeCounts := map[string]int{}
	formatCounts := map[string]int{}

	for _, f := range files {
		if f.Status != "done" {
			continue
		}
		typeCounts[f.FileType]++
		if f.Format != "" {
			formatCounts[f.Format]++
		}
		if md := f.MetadataBreakdown; md != nil {
			catCounts["GPS"] += len(md.GPSFields)
			catCounts["EXIF"] += len(md.EXIFFields)
			catCounts["XMP"] += len(md.XMPFields)
			catCounts["ID3"] += len(md.ID3Fields)
			catCounts["MP4"] += len(md.MP4Atoms)
		}
	}

	dominantType := "image"
	if typeCounts["video"] > typeCounts["image"] {
		dominantType = "video"
	}

	formats := make([]string, 0, len(formatCounts))
	for f := range formatCounts {
		formats = append(formats, strings.ToUpper(f))
	}
	sort.Strings(formats)
	fileTypesStr := strings.Join(formats, ", ")

	catOrder := []string{"GPS", "EXIF", "XMP", "ID3", "MP4"}
	tags := []string{}
	for _, cat := range catOrder {
		if catCounts[cat] > 0 {
			tags = append(tags, cat)
		}
	}

	total := 0
	for _, v := range catCounts {
		total += v
	}
	chartData := make([]ChartDataPoint, 0, len(catOrder))
	for _, cat := range catOrder {
		fields := catCounts[cat]
		if fields == 0 {
			continue
		}
		pct := 0
		if total > 0 {
			pct = (fields * 100) / total
		}
		chartData = append(chartData, ChartDataPoint{Label: cat, Fields: fields, Percentage: pct})
	}

	return &Report{
		JobID:               job.ID,
		UserID:              job.UserID,
		ReportID:            generateReportID(now),
		Date:                now,
		FilesProcessed:      job.FilesCompleted,
		FieldsRemoved:       job.FieldsRemoved,
		GPSLocationsRemoved: job.GPSLocationsRemoved,
		TotalTimeSeconds:    job.TotalTimeSeconds,
		FileTypes:           fileTypesStr,
		DominantType:        dominantType,
		HasGPS:              job.GPSLocationsRemoved > 0,
		Tags:                tags,
		ChartData:           chartData,
		PDFStatus:           "pending",
	}
}

// createJobReport builds a report record, persists it, notifies clients, and asynchronously
// generates and uploads the PDF.
func createJobReport(ctx context.Context, cfg Config, db *SupabaseClient, hub *WebSocketHub, job *Job, files []FileRecord) {
	report := BuildReport(job, files)
	if err := db.CreateReport(ctx, report); err != nil {
		return
	}

	hub.Broadcast(job.ID, ProgressEvent{
		Type:     "report_ready",
		JobID:    job.ID,
		ReportID: report.ReportID,
	})

	go func() {
		pdfCtx := context.Background()
		detail, err := db.GetReport(pdfCtx, report.ID)
		if err != nil || detail == nil {
			_ = db.UpdateReportPDF(pdfCtx, report.ID, "", "failed")
			return
		}

		exifVer, ffmpegVer := GetToolVersions()

		// Derive backend URL from OAuthCallbackURL (strip path).
		backendURL := ""
		if cfg.OAuthCallbackURL != "" {
			if idx := strings.Index(cfg.OAuthCallbackURL, "/api/"); idx > 0 {
				backendURL = cfg.OAuthCallbackURL[:idx]
			}
		}

		pdfContext := &PDFReportContext{
			Report:      detail,
			FrontendURL: cfg.FrontendURL,
			BackendURL:  backendURL,
			ExifToolVer: exifVer,
			FFmpegVer:   ffmpegVer,
			ServiceVer:  "1.0.0",
		}

		pdfBytes, err := GenerateReportPDF(pdfContext)
		if err != nil {
			_ = db.UpdateReportPDF(pdfCtx, report.ID, "", "failed")
			return
		}
		pdfPath, err := db.UploadPDF(pdfCtx, report.ID, pdfBytes)
		if err != nil {
			_ = db.UpdateReportPDF(pdfCtx, report.ID, "", "failed")
			return
		}
		_ = db.UpdateReportPDF(pdfCtx, report.ID, pdfPath, "uploaded")
	}()
}

// HandleListReports handles GET /api/reports — returns all reports with summary stats.
func HandleListReports(db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		reports, err := db.ListReports(r.Context(), userID)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "Failed to fetch reports")
			return
		}
		if reports == nil {
			reports = []ReportSummary{}
		}
		stats := CalculateReportSummary(reports)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"reports": reports,
			"summary": stats,
		})
	}
}

// HandleGetReport handles GET /api/reports/{id} — returns full report detail by human-readable ID.
func HandleGetReport(db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		reportID := r.PathValue("id")
		if reportID == "" {
			WriteError(w, http.StatusBadRequest, ErrInvalidRequest, "Missing report ID")
			return
		}
		userID := UserIDFromContext(r.Context())
		_, detail, err := db.GetReportByHumanID(r.Context(), reportID, userID)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "Failed to fetch report")
			return
		}
		if detail == nil {
			WriteError(w, http.StatusNotFound, ErrReportNotFound, "Report not found")
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(detail)
	}
}

// HandleGetPublicReport handles GET /api/public/reports/{id} — returns report detail
// without authentication. Used for QR code verification by third parties.
func HandleGetPublicReport(db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		reportID := r.PathValue("id")
		if reportID == "" {
			WriteError(w, http.StatusBadRequest, ErrInvalidRequest, "Missing report ID")
			return
		}
		// No userID filter — public access by human-readable report ID only
		_, detail, err := db.GetReportByHumanID(r.Context(), reportID, "")
		if err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "Failed to fetch report")
			return
		}
		if detail == nil {
			WriteError(w, http.StatusNotFound, ErrReportNotFound, "Report not found")
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(detail)
	}
}

// HandleGetPublicReportPDF handles GET /api/public/reports/{id}/pdf — redirects to
// the signed PDF download URL without authentication. This is the target of the QR code
// in printed PDF reports, allowing third parties to download the original PDF for verification.
func HandleGetPublicReportPDF(db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		reportID := r.PathValue("id")
		if reportID == "" {
			WriteError(w, http.StatusBadRequest, ErrInvalidRequest, "Missing report ID")
			return
		}
		// No userID filter — public access
		report, _, err := db.GetReportByHumanID(r.Context(), reportID, "")
		if err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "Failed to fetch report")
			return
		}
		if report == nil {
			WriteError(w, http.StatusNotFound, ErrReportNotFound, "Report not found")
			return
		}
		if report.PDFStatus != "uploaded" || report.PDFPath == "" {
			WriteError(w, http.StatusNotFound, ErrReportNotFound, "PDF not available for this report")
			return
		}
		signedURL, err := db.GetPDFSignedURL(r.Context(), report.PDFPath)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "Failed to generate PDF URL")
			return
		}
		http.Redirect(w, r, signedURL, http.StatusTemporaryRedirect)
	}
}

// HandleGetReportPDF handles GET /api/reports/{id}/pdf — redirects to signed PDF download URL.
func HandleGetReportPDF(db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		reportID := r.PathValue("id")
		if reportID == "" {
			WriteError(w, http.StatusBadRequest, ErrInvalidRequest, "Missing report ID")
			return
		}
		userID := UserIDFromContext(r.Context())
		report, _, err := db.GetReportByHumanID(r.Context(), reportID, userID)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "Failed to fetch report")
			return
		}
		if report == nil {
			WriteError(w, http.StatusNotFound, ErrReportNotFound, "Report not found")
			return
		}
		if report.PDFStatus != "uploaded" || report.PDFPath == "" {
			WriteError(w, http.StatusNotFound, ErrReportNotFound, "PDF not available for this report")
			return
		}
		signedURL, err := db.GetPDFSignedURL(r.Context(), report.PDFPath)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "Failed to generate PDF URL")
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"url":%q}`, signedURL)
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
