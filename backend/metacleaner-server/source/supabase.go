package source

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// SupabaseClient handles all Supabase DB (PostgREST) and Storage interactions.
type SupabaseClient struct {
	httpClient *http.Client
	baseURL    string
	apiKey     string
}

// NewSupabaseClient creates a new SupabaseClient from the given config.
func NewSupabaseClient(cfg Config) *SupabaseClient {
	return &SupabaseClient{
		httpClient: &http.Client{Timeout: 30 * time.Second},
		baseURL:    cfg.SupabaseURL,
		apiKey:     cfg.SupabaseAPIKey,
	}
}

// --- DB record types (snake_case for PostgREST serialization) ---

type dbJob struct {
	ID                  string     `json:"id,omitempty"`
	UserID              string     `json:"user_id,omitempty"`
	Status              string     `json:"status"`
	TotalFiles          int        `json:"total_files"`
	FilesCompleted      int        `json:"files_completed"`
	FieldsRemoved       int        `json:"fields_removed"`
	GPSLocationsRemoved int        `json:"gps_locations_removed"`
	TotalTimeSeconds    *int       `json:"total_time_seconds,omitempty"`
	CreatedAt           *time.Time `json:"created_at,omitempty"`
	CompletedAt         *time.Time `json:"completed_at,omitempty"`
}

type dbFileRecord struct {
	ID                string          `json:"id,omitempty"`
	JobID             string          `json:"job_id"`
	UserID            string          `json:"user_id,omitempty"`
	FileName          string          `json:"file_name"`
	OriginalName      string          `json:"original_name,omitempty"`
	FileExtension     string          `json:"file_extension"`
	FileSizeBytes     int64           `json:"file_size_bytes"`
	FileType          string          `json:"file_type"`
	Format            string          `json:"format"`
	Device            string          `json:"device,omitempty"`
	Status            string          `json:"status"`
	FieldsRemoved     int             `json:"fields_removed"`
	GPSRemoved        bool            `json:"gps_removed"`
	ErrorCode         string          `json:"error_code,omitempty"`
	ErrorMessage      string          `json:"error_message,omitempty"`
	MetadataBreakdown json.RawMessage `json:"metadata_breakdown,omitempty"`
	ProcessedAt       *time.Time      `json:"processed_at,omitempty"`
	CreatedAt         *time.Time      `json:"created_at,omitempty"`
}

type dbReport struct {
	ID                  string          `json:"id,omitempty"`
	JobID               string          `json:"job_id"`
	UserID              string          `json:"user_id,omitempty"`
	ReportID            string          `json:"report_id"`
	Date                time.Time       `json:"date"`
	FilesProcessed      int             `json:"files_processed"`
	FieldsRemoved       int             `json:"fields_removed"`
	GPSLocationsRemoved int             `json:"gps_locations_removed"`
	TotalTimeSeconds    int             `json:"total_time_seconds"`
	FileTypes           string          `json:"file_types"`
	DominantType        string          `json:"dominant_type"`
	HasGPS              bool            `json:"has_gps"`
	Tags                []string        `json:"tags"`
	ChartData           json.RawMessage `json:"chart_data"`
	PDFPath             string          `json:"pdf_path,omitempty"`
	PDFStatus           string          `json:"pdf_status"`
	CreatedAt           *time.Time      `json:"created_at,omitempty"`
}

// --- HTTP helpers ---

func (c *SupabaseClient) newRequest(ctx context.Context, method, url string, body io.Reader) (*http.Request, error) {
	req, err := http.NewRequestWithContext(ctx, method, url, body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("apikey", c.apiKey)
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	return req, nil
}

func (c *SupabaseClient) doJSON(ctx context.Context, method, url string, payload, result interface{}) error {
	var bodyReader io.Reader
	if payload != nil {
		data, err := json.Marshal(payload)
		if err != nil {
			return fmt.Errorf("marshal payload: %w", err)
		}
		bodyReader = bytes.NewReader(data)
	}

	req, err := c.newRequest(ctx, method, url, bodyReader)
	if err != nil {
		return err
	}
	if payload != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	req.Header.Set("Accept", "application/json")
	// Return the inserted/updated row so we can read auto-generated fields.
	if method == http.MethodPost || method == http.MethodPatch {
		req.Header.Set("Prefer", "return=representation")
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 300 {
		return fmt.Errorf("supabase %s %s: status %d: %s", method, url, resp.StatusCode, respBody)
	}

	if result != nil && len(respBody) > 0 {
		if err := json.Unmarshal(respBody, result); err != nil {
			return fmt.Errorf("unmarshal response: %w", err)
		}
	}
	return nil
}

func (c *SupabaseClient) restURL(path string) string {
	return c.baseURL + "/rest/v1/" + path
}

// --- Health ---

// Ping verifies Supabase DB connectivity by querying a known table.
func (c *SupabaseClient) Ping(ctx context.Context) error {
	url := c.restURL("cleaning_jobs?limit=1")
	req, err := c.newRequest(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Accept", "application/json")
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("ping failed: status %d: %s", resp.StatusCode, body)
	}
	return nil
}

// --- Job operations ---

// CreateJob inserts a new job record and populates ID and CreatedAt from the response.
func (c *SupabaseClient) CreateJob(ctx context.Context, job *Job) error {
	rec := dbJob{
		UserID:              job.UserID,
		Status:              job.Status,
		TotalFiles:          job.TotalFiles,
		FilesCompleted:      job.FilesCompleted,
		FieldsRemoved:       job.FieldsRemoved,
		GPSLocationsRemoved: job.GPSLocationsRemoved,
	}

	var rows []dbJob
	if err := c.doJSON(ctx, http.MethodPost, c.restURL("cleaning_jobs"), rec, &rows); err != nil {
		return err
	}
	if len(rows) > 0 {
		job.ID = rows[0].ID
		if rows[0].CreatedAt != nil {
			job.CreatedAt = *rows[0].CreatedAt
		}
	}
	return nil
}

// UpdateJob updates an existing job record.
func (c *SupabaseClient) UpdateJob(ctx context.Context, job *Job) error {
	rec := dbJob{
		Status:              job.Status,
		TotalFiles:          job.TotalFiles,
		FilesCompleted:      job.FilesCompleted,
		FieldsRemoved:       job.FieldsRemoved,
		GPSLocationsRemoved: job.GPSLocationsRemoved,
		CompletedAt:         job.CompletedAt,
	}
	if job.TotalTimeSeconds > 0 {
		t := job.TotalTimeSeconds
		rec.TotalTimeSeconds = &t
	}

	url := c.restURL("cleaning_jobs?id=eq." + job.ID)
	return c.doJSON(ctx, http.MethodPatch, url, rec, nil)
}

// GetJob fetches a job by ID, optionally filtering by user ID.
func (c *SupabaseClient) GetJob(ctx context.Context, jobID, userID string) (*Job, error) {
	var rows []dbJob
	url := c.restURL("cleaning_jobs?id=eq." + jobID)
	if userID != "" {
		url += "&user_id=eq." + userID
	}
	if err := c.doJSON(ctx, http.MethodGet, url, nil, &rows); err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, nil
	}
	r := rows[0]
	job := &Job{
		ID:                  r.ID,
		Status:              r.Status,
		TotalFiles:          r.TotalFiles,
		FilesCompleted:      r.FilesCompleted,
		FieldsRemoved:       r.FieldsRemoved,
		GPSLocationsRemoved: r.GPSLocationsRemoved,
		CompletedAt:         r.CompletedAt,
	}
	if r.TotalTimeSeconds != nil {
		job.TotalTimeSeconds = *r.TotalTimeSeconds
	}
	if r.CreatedAt != nil {
		job.CreatedAt = *r.CreatedAt
	}
	return job, nil
}

// --- File record operations ---

// CreateFileRecords bulk-inserts file records for a job.
func (c *SupabaseClient) CreateFileRecords(ctx context.Context, files []FileRecord) error {
	recs := make([]dbFileRecord, len(files))
	for i, f := range files {
		recs[i] = fileRecordToDB(f)
		recs[i].UserID = f.UserID
	}
	var rows []dbFileRecord
	if err := c.doJSON(ctx, http.MethodPost, c.restURL("job_files"), recs, &rows); err != nil {
		return err
	}
	// Populate IDs from the DB response.
	for i := range rows {
		if i < len(files) {
			files[i].ID = rows[i].ID
		}
	}
	return nil
}

// UpdateFileRecord patches a single file record.
func (c *SupabaseClient) UpdateFileRecord(ctx context.Context, file *FileRecord) error {
	rec := fileRecordToDB(*file)
	url := c.restURL("job_files?id=eq." + file.ID)
	return c.doJSON(ctx, http.MethodPatch, url, rec, nil)
}

// GetFileRecords returns all file records for a job.
func (c *SupabaseClient) GetFileRecords(ctx context.Context, jobID string) ([]FileRecord, error) {
	var rows []dbFileRecord
	url := c.restURL("job_files?job_id=eq." + jobID)
	if err := c.doJSON(ctx, http.MethodGet, url, nil, &rows); err != nil {
		return nil, err
	}
	files := make([]FileRecord, len(rows))
	for i, r := range rows {
		files[i] = dbToFileRecord(r)
	}
	return files, nil
}

// VerifyFileOwnership checks that a file (identified by local ID prefix) belongs to the given user.
// Returns false if not found or if the file belongs to a different user.
func (c *SupabaseClient) VerifyFileOwnership(ctx context.Context, localID, userID string) (bool, error) {
	var rows []dbFileRecord
	url := c.restURL("job_files?file_name=like." + localID + "%25&user_id=eq." + userID)
	if err := c.doJSON(ctx, http.MethodGet, url, nil, &rows); err != nil {
		return false, err
	}
	return len(rows) > 0, nil
}

// --- Report operations ---

// CreateReport inserts a new report record.
func (c *SupabaseClient) CreateReport(ctx context.Context, report *Report) error {
	chartJSON, err := json.Marshal(report.ChartData)
	if err != nil {
		return fmt.Errorf("marshal chart_data: %w", err)
	}
	rec := dbReport{
		JobID:               report.JobID,
		UserID:              report.UserID,
		ReportID:            report.ReportID,
		Date:                report.Date,
		FilesProcessed:      report.FilesProcessed,
		FieldsRemoved:       report.FieldsRemoved,
		GPSLocationsRemoved: report.GPSLocationsRemoved,
		TotalTimeSeconds:    report.TotalTimeSeconds,
		FileTypes:           report.FileTypes,
		DominantType:        report.DominantType,
		HasGPS:              report.HasGPS,
		Tags:                report.Tags,
		ChartData:           json.RawMessage(chartJSON),
		PDFStatus:           report.PDFStatus,
	}
	var rows []dbReport
	if err := c.doJSON(ctx, http.MethodPost, c.restURL("cleaning_reports"), rec, &rows); err != nil {
		return err
	}
	if len(rows) > 0 {
		report.ID = rows[0].ID
		if rows[0].CreatedAt != nil {
			report.CreatedAt = *rows[0].CreatedAt
		}
	}
	return nil
}

// UpdateReportPDF patches the pdf_path and pdf_status fields on a report.
func (c *SupabaseClient) UpdateReportPDF(ctx context.Context, reportID, pdfPath, status string) error {
	patch := map[string]string{
		"pdf_path":   pdfPath,
		"pdf_status": status,
	}
	url := c.restURL("cleaning_reports?id=eq." + reportID)
	return c.doJSON(ctx, http.MethodPatch, url, patch, nil)
}

// buildReportDetail assembles a ReportDetail from a dbReport row plus its file records.
func (c *SupabaseClient) buildReportDetail(ctx context.Context, r dbReport) (*ReportDetail, error) {
	var chartData []ChartDataPoint
	if len(r.ChartData) > 0 {
		_ = json.Unmarshal(r.ChartData, &chartData)
	}

	fileRecords, err := c.GetFileRecords(ctx, r.JobID)
	if err != nil {
		return nil, fmt.Errorf("get file records: %w", err)
	}

	fileDetails := make([]ReportFileDetail, 0, len(fileRecords))
	for _, f := range fileRecords {
		if f.Status == "done" || f.Status == "error" {
			sizeMB := fmt.Sprintf("%.1f", float64(f.FileSizeBytes)/(1024*1024))
			fileDetails = append(fileDetails, ReportFileDetail{
				Name:          f.FileName,
				OriginalName:  f.OriginalName,
				Extension:     f.FileExtension,
				SizeMB:        sizeMB,
				Format:        f.Format,
				Device:        f.Device,
				Type:          f.FileType,
				HasGPS:        f.GPSRemoved,
				FieldsRemoved: f.FieldsRemoved,
				Metadata:      f.MetadataBreakdown,
			})
		}
	}

	return &ReportDetail{
		ReportID:            r.ReportID,
		Date:                r.Date.UTC().Format(time.RFC3339),
		FilesProcessed:      r.FilesProcessed,
		FieldsRemoved:       r.FieldsRemoved,
		GPSLocationsRemoved: r.GPSLocationsRemoved,
		TotalTimeSeconds:    r.TotalTimeSeconds,
		ChartData:           chartData,
		Files:               fileDetails,
	}, nil
}

// dbRowToReport converts a dbReport row to a Report struct (includes PDFPath/PDFStatus).
func dbRowToReport(r dbReport) *Report {
	report := &Report{
		ID:                  r.ID,
		JobID:               r.JobID,
		ReportID:            r.ReportID,
		Date:                r.Date,
		FilesProcessed:      r.FilesProcessed,
		FieldsRemoved:       r.FieldsRemoved,
		GPSLocationsRemoved: r.GPSLocationsRemoved,
		TotalTimeSeconds:    r.TotalTimeSeconds,
		FileTypes:           r.FileTypes,
		DominantType:        r.DominantType,
		HasGPS:              r.HasGPS,
		Tags:                r.Tags,
		PDFPath:             r.PDFPath,
		PDFStatus:           r.PDFStatus,
	}
	if r.CreatedAt != nil {
		report.CreatedAt = *r.CreatedAt
	}
	return report
}

// GetReport fetches a report by its UUID and builds a ReportDetail including per-file data.
func (c *SupabaseClient) GetReport(ctx context.Context, reportID string) (*ReportDetail, error) {
	var rows []dbReport
	url := c.restURL("cleaning_reports?id=eq." + reportID)
	if err := c.doJSON(ctx, http.MethodGet, url, nil, &rows); err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, nil
	}
	return c.buildReportDetail(ctx, rows[0])
}

// GetReportByHumanID fetches a report by its human-readable MCR-... ID, optionally filtered by user ID.
// Returns both the raw Report (with PDFPath/PDFStatus) and the full ReportDetail.
func (c *SupabaseClient) GetReportByHumanID(ctx context.Context, humanID, userID string) (*Report, *ReportDetail, error) {
	var rows []dbReport
	url := c.restURL("cleaning_reports?report_id=eq." + humanID)
	if userID != "" {
		url += "&user_id=eq." + userID
	}
	if err := c.doJSON(ctx, http.MethodGet, url, nil, &rows); err != nil {
		return nil, nil, err
	}
	if len(rows) == 0 {
		return nil, nil, nil
	}
	r := rows[0]
	report := dbRowToReport(r)
	detail, err := c.buildReportDetail(ctx, r)
	if err != nil {
		return report, nil, err
	}
	return report, detail, nil
}

// ListReports returns all reports ordered by date descending, optionally filtered by user ID.
func (c *SupabaseClient) ListReports(ctx context.Context, userID string) ([]ReportSummary, error) {
	var rows []dbReport
	url := c.restURL("cleaning_reports?order=date.desc")
	if userID != "" {
		url += "&user_id=eq." + userID
	}
	if err := c.doJSON(ctx, http.MethodGet, url, nil, &rows); err != nil {
		return nil, err
	}

	summaries := make([]ReportSummary, len(rows))
	for i, r := range rows {
		duration := fmt.Sprintf("%ds", r.TotalTimeSeconds)
		summaries[i] = ReportSummary{
			ID:        r.ID,
			ReportID:  r.ReportID,
			Date:      r.Date.UTC().Format(time.RFC3339),
			Duration:  duration,
			FileCount: r.FilesProcessed,
			FileTypes: r.FileTypes,
			Type:      r.DominantType,
			GPS:       r.HasGPS,
			Fields:    r.FieldsRemoved,
			Tags:      r.Tags,
		}
	}
	return summaries, nil
}

// --- Storage operations ---

// UploadPDF uploads PDF bytes to the cleaning-reports Supabase Storage bucket.
// Retries once on failure. Returns the storage path on success.
func (c *SupabaseClient) UploadPDF(ctx context.Context, reportID string, data []byte) (string, error) {
	path := reportID + ".pdf"
	err := c.uploadPDFOnce(ctx, path, data)
	if err != nil {
		// Retry once.
		err = c.uploadPDFOnce(ctx, path, data)
	}
	if err != nil {
		return "", err
	}
	return path, nil
}

func (c *SupabaseClient) uploadPDFOnce(ctx context.Context, path string, data []byte) error {
	url := c.baseURL + "/storage/v1/object/cleaning-reports/" + path
	req, err := c.newRequest(ctx, http.MethodPost, url, bytes.NewReader(data))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/pdf")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 300 {
		return fmt.Errorf("storage upload failed: status %d: %s", resp.StatusCode, body)
	}
	return nil
}

// GetPDFSignedURL generates a signed URL for the given storage path (valid for 1 hour).
func (c *SupabaseClient) GetPDFSignedURL(ctx context.Context, path string) (string, error) {
	url := c.baseURL + "/storage/v1/object/sign/cleaning-reports/" + path
	payload := map[string]int{"expiresIn": 3600}

	var result struct {
		SignedURL string `json:"signedURL"`
	}
	req, err := c.newRequest(ctx, http.MethodPost, url, nil)
	if err != nil {
		return "", err
	}
	data, _ := json.Marshal(payload)
	req.Body = io.NopCloser(bytes.NewReader(data))
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 300 {
		return "", fmt.Errorf("signed URL request failed: status %d: %s", resp.StatusCode, body)
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("unmarshal signed URL: %w", err)
	}
	if result.SignedURL == "" {
		return "", fmt.Errorf("empty signed URL in response")
	}
	// The signedURL may be relative; prepend the base URL if so.
	if len(result.SignedURL) > 0 && result.SignedURL[0] == '/' {
		return c.baseURL + result.SignedURL, nil
	}
	return result.SignedURL, nil
}

// --- Conversion helpers ---

func fileRecordToDB(f FileRecord) dbFileRecord {
	rec := dbFileRecord{
		JobID:         f.JobID,
		FileName:      f.FileName,
		OriginalName:  f.OriginalName,
		FileExtension: f.FileExtension,
		FileSizeBytes: f.FileSizeBytes,
		FileType:      f.FileType,
		Format:        f.Format,
		Device:        f.Device,
		Status:        f.Status,
		FieldsRemoved: f.FieldsRemoved,
		GPSRemoved:    f.GPSRemoved,
		ErrorCode:     f.ErrorCode,
		ErrorMessage:  f.ErrorMessage,
		ProcessedAt:   f.ProcessedAt,
	}
	if f.MetadataBreakdown != nil {
		data, err := json.Marshal(f.MetadataBreakdown)
		if err == nil {
			rec.MetadataBreakdown = json.RawMessage(data)
		}
	}
	return rec
}

func dbToFileRecord(r dbFileRecord) FileRecord {
	f := FileRecord{
		ID:            r.ID,
		JobID:         r.JobID,
		FileName:      r.FileName,
		OriginalName:  r.OriginalName,
		FileExtension: r.FileExtension,
		FileSizeBytes: r.FileSizeBytes,
		FileType:      r.FileType,
		Format:        r.Format,
		Device:        r.Device,
		Status:        r.Status,
		FieldsRemoved: r.FieldsRemoved,
		GPSRemoved:    r.GPSRemoved,
		ErrorCode:     r.ErrorCode,
		ErrorMessage:  r.ErrorMessage,
		ProcessedAt:   r.ProcessedAt,
	}
	if len(r.MetadataBreakdown) > 0 {
		var md MetadataDetail
		if err := json.Unmarshal(r.MetadataBreakdown, &md); err == nil {
			f.MetadataBreakdown = &md
		}
	}
	return f
}
