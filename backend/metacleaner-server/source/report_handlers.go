package source

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"sort"
	"strings"
	"time"
)

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
		TotalTimeMs:         job.TotalTimeMs,
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
		slog.Error("job: CreateReport failed", "jobId", job.ID, "userID", job.UserID, "error", err)
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
		keyID := KeyIDFromContext(r.Context())
		reports, err := db.ListReports(r.Context(), userID)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "Failed to fetch reports")
			return
		}
		if reports == nil {
			reports = []ReportSummary{}
		}
		if keyID != "" {
			slog.Info("list-reports", "userID", userID, "keyID", keyID, "reportCount", len(reports))
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
