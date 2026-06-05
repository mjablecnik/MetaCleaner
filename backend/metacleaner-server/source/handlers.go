package source

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"syscall"
	"time"
)

// UploadedFileInfo is the metadata returned for each accepted file on upload.
type UploadedFileInfo struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Size      int64  `json:"size"`
	Extension string `json:"extension"`
	Type      string `json:"type"`
	Format    string `json:"format"`
}

// generateFileID creates a unique file ID in the format "f-{8hex}".
func generateFileID() (string, error) {
	b := make([]byte, 4)
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

		for _, fh := range fileHeaders {
			// Validate size from multipart header when available.
			if fh.Size > cfg.MaxFileSize {
				WriteError(w, http.StatusRequestEntityTooLarge, ErrFileTooLarge,
					fmt.Sprintf("File %q exceeds maximum allowed size of %d MB", fh.Filename, cfg.MaxFileSize/(1024*1024)))
				return
			}

			// Validate file format by extension.
			ext := strings.ToLower(filepath.Ext(fh.Filename))
			if ext == "" || !ValidateFileFormat(ext) {
				WriteError(w, http.StatusUnsupportedMediaType, ErrUnsupportedFormat,
					fmt.Sprintf("File format %q is not supported", ext))
				return
			}

			fileID, err := generateFileID()
			if err != nil {
				WriteError(w, http.StatusInternalServerError, ErrInsufficientStorage, "Failed to generate file identifier")
				return
			}

			src, err := fh.Open()
			if err != nil {
				WriteError(w, http.StatusInsufficientStorage, ErrInsufficientStorage, "Failed to read uploaded file")
				return
			}

			extNoDot := strings.TrimPrefix(ext, ".")
			destPath := filepath.Join(uploadsDir, fileID+"_original."+extNoDot)
			dst, err := os.Create(destPath)
			if err != nil {
				src.Close()
				WriteError(w, http.StatusInsufficientStorage, ErrInsufficientStorage, "Failed to create storage file")
				return
			}

			// LimitReader acts as a safety net if Content-Length header was missing or spoofed.
			limitedSrc := io.LimitReader(src, cfg.MaxFileSize+1)
			written, copyErr := io.Copy(dst, limitedSrc)
			dst.Close()
			src.Close()

			if copyErr != nil {
				os.Remove(destPath)
				WriteError(w, http.StatusInsufficientStorage, ErrInsufficientStorage, "Failed to write file to storage")
				return
			}
			if written > cfg.MaxFileSize {
				os.Remove(destPath)
				WriteError(w, http.StatusRequestEntityTooLarge, ErrFileTooLarge,
					fmt.Sprintf("File %q exceeds maximum allowed size of %d MB", fh.Filename, cfg.MaxFileSize/(1024*1024)))
				return
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
		json.NewEncoder(w).Encode(map[string][]UploadedFileInfo{"files": accepted})
	}
}

type createJobRequest struct {
	FileIDs []string `json:"fileIds"`
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
			files = append(files, FileRecord{
				ID:            fileID,
				FileName:      fileID + ext,
				FileExtension: ext,
				FileSizeBytes: info.Size(),
				FileType:      GetFileType(ext),
				Format:        canonicalFormat(ext),
				Status:        "pending",
			})
		}

		job := &Job{
			Status:     "processing",
			TotalFiles: len(files),
		}
		if err := db.CreateJob(r.Context(), job); err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "Failed to create job")
			return
		}
		for i := range files {
			files[i].JobID = job.ID
		}
		if err := db.CreateFileRecords(r.Context(), files); err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "Failed to create file records")
			return
		}

		go func() {
			ctx := context.Background()
			progressFn := func(event ProgressEvent) { hub.Broadcast(job.ID, event) }
			_ = pl.ProcessJob(ctx, job, files, progressFn)
			_ = db.UpdateJob(ctx, job)
			createJobReport(ctx, db, hub, job, files)
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
func HandleFileDownload(cfg Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fileID := r.PathValue("id")
		if fileID == "" {
			WriteError(w, http.StatusBadRequest, ErrInvalidRequest, "Missing file ID")
			return
		}

		cleanedDir := filepath.Join(cfg.TempStoragePath, "cleaned")
		uploadsDir := filepath.Join(cfg.TempStoragePath, "uploads")

		// Look for the cleaned file.
		cleanedMatches, _ := filepath.Glob(filepath.Join(cleanedDir, fileID+"_cleaned.*"))
		if len(cleanedMatches) > 0 {
			// File is ready — serve it.
			cleanedPath := cleanedMatches[0]
			ext := strings.TrimPrefix(filepath.Ext(cleanedPath), ".")
			originalName := fileID + "_cleaned." + ext

			w.Header().Set("Content-Type", contentTypeForExt(ext))
			w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="cleaned_%s"`, originalName))
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

	iconColor := "green"
	if dominantType == "video" {
		iconColor = "blue"
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
		IconColor:           iconColor,
		ChartData:           chartData,
		PDFStatus:           "pending",
	}
}

// createJobReport builds a report record, persists it, notifies clients, and asynchronously
// generates and uploads the PDF.
func createJobReport(ctx context.Context, db *SupabaseClient, hub *WebSocketHub, job *Job, files []FileRecord) {
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
		pdfBytes, err := GenerateReportPDF(detail)
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
		reports, err := db.ListReports(r.Context())
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
		_, detail, err := db.GetReportByHumanID(r.Context(), reportID)
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

// HandleGetReportPDF handles GET /api/reports/{id}/pdf — redirects to signed PDF download URL.
func HandleGetReportPDF(db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		reportID := r.PathValue("id")
		if reportID == "" {
			WriteError(w, http.StatusBadRequest, ErrInvalidRequest, "Missing report ID")
			return
		}
		report, _, err := db.GetReportByHumanID(r.Context(), reportID)
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
		http.Redirect(w, r, signedURL, http.StatusFound)
	}
}

// HandleGetJob handles GET /api/jobs/{id} — returns current job state.
func HandleGetJob(db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		jobID := r.PathValue("id")
		if jobID == "" {
			WriteError(w, http.StatusBadRequest, ErrInvalidRequest, "Missing job ID")
			return
		}
		job, err := db.GetJob(r.Context(), jobID)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "Failed to fetch job")
			return
		}
		if job == nil {
			WriteError(w, http.StatusNotFound, ErrJobNotFound, "Job not found")
			return
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
