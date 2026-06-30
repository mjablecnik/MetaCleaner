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

// generateReportID returns a human-readable report ID with 16 random bytes (128 bits) of
// entropy appended as hex, making enumeration computationally infeasible.
func generateReportID(now time.Time) string {
	b := make([]byte, 16)
	rand.Read(b) //nolint:errcheck
	return fmt.Sprintf("MCR-%04d-%02d%02d-%X", now.Year(), int(now.Month()), now.Day(), b)
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
func createJobReport(ctx context.Context, cfg Config, db *SupabaseClient, hub *WebSocketHub, job *Job, files []FileRecord, authClient *SupabaseAuthClient) {
	report := BuildReport(job, files)

	// Denormalize creator identity into the report for persistence after account deletion.
	if job.UserID != "" && authClient != nil {
		if profile, err := authClient.GetProfile(ctx, job.UserID); err == nil && profile != nil {
			name := strings.TrimSpace(profile.FirstName + " " + profile.LastName)
			if name != "" {
				report.CreatedByName = name
			}
			if profile.Email != "" {
				report.CreatedByEmail = profile.Email
			}
		}
	}

	// Retry with a freshly generated ID on a 409 UNIQUE violation as defense-in-depth.
	// Task 1's high-entropy IDs make collisions astronomically unlikely, but we handle them
	// explicitly so a completed job always produces a report even in adversarial conditions.
	const maxReportIDAttempts = 3
	var createErr error
	for attempt := 0; attempt < maxReportIDAttempts; attempt++ {
		if attempt > 0 {
			report.ReportID = generateReportID(time.Now().UTC())
			slog.Warn("job: CreateReport ID collision, retrying", "jobId", job.ID, "attempt", attempt)
		}
		createErr = db.CreateReport(ctx, report)
		if createErr == nil || !strings.Contains(createErr.Error(), "status 409") {
			break
		}
	}
	if createErr != nil {
		slog.Error("job: CreateReport failed", "jobId", job.ID, "userID", job.UserID, "error", createErr)
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

// toPublicReportDetail converts a full ReportDetail to its redacted public form,
// omitting raw metadata field values (GPS coordinates, serial numbers, etc.) that
// are personal data — keeping only aggregate counts and per-file verification data.
func toPublicReportDetail(d *ReportDetail) *PublicReportDetail {
	files := make([]PublicReportFileDetail, 0, len(d.Files))
	for _, f := range d.Files {
		files = append(files, PublicReportFileDetail{
			Extension:     f.Extension,
			Type:          f.Type,
			HasGPS:        f.HasGPS,
			FieldsRemoved: f.FieldsRemoved,
			SHA256Hash:    f.SHA256Hash,
		})
	}
	return &PublicReportDetail{
		ReportID:            d.ReportID,
		Date:                d.Date,
		FilesProcessed:      d.FilesProcessed,
		FieldsRemoved:       d.FieldsRemoved,
		GPSLocationsRemoved: d.GPSLocationsRemoved,
		TotalTimeMs:         d.TotalTimeMs,
		ChartData:           d.ChartData,
		Files:               files,
	}
}

// HandleGetPublicReport handles GET /api/public/reports/{id} — returns a redacted
// report for unauthenticated QR-code verification by third parties. Raw metadata
// field values (GPS coordinates, camera serial numbers, XMP creator, etc.) are
// excluded; only aggregate counts and per-file verification hashes are returned.
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
		json.NewEncoder(w).Encode(toPublicReportDetail(detail))
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
		report, err := db.GetReportMetaByHumanID(r.Context(), reportID, "")
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
		report, err := db.GetReportMetaByHumanID(r.Context(), reportID, userID)
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
