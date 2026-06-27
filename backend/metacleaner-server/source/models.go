package source

import (
	"fmt"
	"strings"
	"time"
)

// Supported image and video format extensions (lowercase, without dot)
var (
	imageFormats = map[string]bool{
		"jpg": true, "jpeg": true, "png": true, "heic": true, "heif": true,
		"avif": true, "tiff": true, "tif": true, "dng": true, "webp": true, "gif": true,
	}
	videoFormats = map[string]bool{
		"mp4": true, "mov": true, "avi": true, "mkv": true, "webm": true,
		"wmv": true, "flv": true, "3gp": true, "mpeg": true, "mpg": true,
		"ogv": true, "mts": true,
	}
)

// Job represents a cleaning job
type Job struct {
	ID                  string     `json:"jobId"`
	UserID              string     `json:"-"`
	Status              string     `json:"status"`
	TotalFiles          int        `json:"totalFiles"`
	FilesCompleted      int        `json:"filesCompleted"`
	FieldsRemoved       int        `json:"fieldsRemoved"`
	GPSLocationsRemoved int        `json:"gpsLocationsRemoved"`
	TotalTimeMs         int        `json:"totalTimeMs"`
	CreatedAt           time.Time  `json:"createdAt"`
	CompletedAt         *time.Time `json:"completedAt,omitempty"`
	ReportID            string     `json:"reportId,omitempty"` // populated on-the-fly from cleaning_reports; not stored on the job row
}

// FileRecord represents a file within a job
type FileRecord struct {
	ID                string          `json:"id"`
	LocalID           string          `json:"-"` // internal file ID for disk path lookup, not persisted to DB
	JobID             string          `json:"jobId"`
	UserID            string          `json:"-"`
	FileName          string          `json:"name"`
	OriginalName      string          `json:"originalName,omitempty"` // original upload filename from the client
	CleanedName       string          `json:"cleanedName,omitempty"` // output filename after cleaning (e.g. IMG_f-abc_cleaned.jpg)
	FileExtension     string          `json:"extension"`
	FileSizeBytes     int64           `json:"sizeBytes"`
	FileType          string          `json:"type"`
	Format            string          `json:"format"`
	Device            string          `json:"device,omitempty"`
	Status            string          `json:"status"`
	FieldsRemoved     int             `json:"fieldsRemoved"`
	GPSRemoved        bool            `json:"gpsRemoved"`
	ErrorCode         string          `json:"errorCode,omitempty"`
	ErrorMessage      string          `json:"errorMessage,omitempty"`
	MetadataBreakdown *MetadataDetail `json:"metadata,omitempty"`
	SHA256Hash        string          `json:"sha256Hash,omitempty"` // SHA-256 of the cleaned file
	ProcessedAt       *time.Time      `json:"processedAt,omitempty"`
}

// MetadataDetail holds per-category field breakdown
type MetadataDetail struct {
	GPSFields    []MetadataField `json:"gpsFields"`
	EXIFFields   []MetadataField `json:"exifFields"`
	XMPFields    []MetadataField `json:"xmpFields"`
	ID3Fields    []MetadataField `json:"id3Fields,omitempty"`
	MP4Atoms     []MetadataField `json:"mp4Atoms,omitempty"`
	PNGChunks    []MetadataField `json:"pngChunks,omitempty"`
	TotalRemoved int             `json:"totalRemoved"`
}

// MetadataField is a single metadata key-value pair
type MetadataField struct {
	Label string `json:"label"`
	Value string `json:"value"`
}

// CleaningResult is returned by the pipeline after cleaning one file
type CleaningResult struct {
	FieldsRemoved     int
	GPSRemoved        bool
	MetadataBreakdown *MetadataDetail
	Device            string
}

// ProgressEvent is sent over WebSocket
type ProgressEvent struct {
	Type                 string `json:"type"`
	FileID               string `json:"fileId,omitempty"`
	Status               string `json:"status,omitempty"`
	Progress             int    `json:"progress,omitempty"`
	FieldsRemoved        int    `json:"fieldsRemoved,omitempty"`
	GPSRemoved           bool   `json:"gpsRemoved,omitempty"`
	ErrorCode            string `json:"errorCode,omitempty"`
	Message              string `json:"message,omitempty"`
	OverallProgress      int    `json:"overallProgress,omitempty"`
	FilesCompleted       int    `json:"filesCompleted,omitempty"`
	TotalFiles           int    `json:"totalFiles,omitempty"`
	TimeRemainingSeconds int    `json:"timeRemainingSeconds,omitempty"`
	CurrentFileID        string `json:"currentFileId,omitempty"`
	JobID                string `json:"jobId,omitempty"`
	ReportID             string `json:"reportId,omitempty"`
	TotalTimeMs          int    `json:"totalTimeMs"`
	GPSLocationsRemoved  int    `json:"gpsLocationsRemoved,omitempty"`
}

// ReportSummary is a single entry in the reports list
type ReportSummary struct {
	ID        string   `json:"id"`
	ReportID  string   `json:"reportId"`
	Date      string   `json:"date"`
	Duration  string   `json:"duration"`
	FileCount int      `json:"fileCount"`
	FileTypes string   `json:"fileTypes"`
	Type      string   `json:"type"`
	GPS       bool     `json:"gps"`
	Fields    int      `json:"fields"`
	Tags      []string `json:"tags"`
}

// ReportDetail is the full report view
type ReportDetail struct {
	ReportID            string             `json:"reportId"`
	Date                string             `json:"date"`
	FilesProcessed      int                `json:"filesProcessed"`
	FieldsRemoved       int                `json:"fieldsRemoved"`
	GPSLocationsRemoved int                `json:"gpsLocationsRemoved"`
	TotalTimeMs         int                `json:"totalTimeMs"`
	ChartData           []ChartDataPoint   `json:"chartData"`
	Files               []ReportFileDetail `json:"files"`
}

// ChartDataPoint for metadata category breakdown chart
type ChartDataPoint struct {
	Label      string `json:"label"`
	Fields     int    `json:"fields"`
	Percentage int    `json:"percentage"`
}

// ReportFileDetail is a per-file breakdown in report detail
type ReportFileDetail struct {
	Name          string          `json:"name"`
	OriginalName  string          `json:"original_name,omitempty"`
	CleanedName   string          `json:"cleaned_name,omitempty"`
	Extension     string          `json:"extension"`
	SizeMB        string          `json:"sizeMB"`
	Format        string          `json:"format"`
	Device        string          `json:"device"`
	Type          string          `json:"type"`
	HasGPS        bool            `json:"hasGps"`
	FieldsRemoved int             `json:"fieldsRemoved"`
	Metadata      *MetadataDetail `json:"metadata"`
	SHA256Hash    string          `json:"sha256Hash,omitempty"` // SHA-256 of cleaned file (for PDF verification)
}

// PDFReportContext holds additional context needed for PDF generation beyond ReportDetail.
type PDFReportContext struct {
	Report      *ReportDetail
	FrontendURL string // Base URL of the frontend app
	BackendURL  string // Base URL of the backend API (for QR code PDF link)
	ExifToolVer string // ExifTool version used for cleaning
	FFmpegVer   string // FFmpeg version used for cleaning
	ServiceVer  string // MetaCleaner service version
}

// Report is the DB record for a cleaning report
type Report struct {
	ID                  string           `json:"id"`
	JobID               string           `json:"jobId"`
	UserID              string           `json:"-"`
	ReportID            string           `json:"reportId"`
	Date                time.Time        `json:"date"`
	FilesProcessed      int              `json:"filesProcessed"`
	FieldsRemoved       int              `json:"fieldsRemoved"`
	GPSLocationsRemoved int              `json:"gpsLocationsRemoved"`
	TotalTimeMs         int              `json:"totalTimeMs"`
	FileTypes           string           `json:"fileTypes"`
	DominantType        string           `json:"dominantType"`
	HasGPS              bool             `json:"hasGps"`
	Tags                []string         `json:"tags"`
	ChartData           []ChartDataPoint `json:"chartData"`
	PDFPath             string           `json:"pdfPath,omitempty"`
	PDFStatus           string           `json:"pdfStatus"`
	CreatedByName       string           `json:"createdByName,omitempty"`
	CreatedByEmail      string           `json:"createdByEmail,omitempty"`
	CreatedAt           time.Time        `json:"createdAt"`
}

// ReportsSummaryStats aggregates stats across all reports
type ReportsSummaryStats struct {
	TotalReports   int `json:"totalReports"`
	FieldsRemoved  int `json:"fieldsRemoved"`
	FilesProcessed int `json:"filesProcessed"`
	GPSRemoved     int `json:"gpsRemoved"`
}

// ValidateFileSize returns true if size does not exceed maxSize
func ValidateFileSize(size int64, maxSize int64) bool {
	return size > 0 && size <= maxSize
}

// FormatDurationMs formats milliseconds into a human-readable duration string.
// < 1000ms → "Xms", >= 1000ms → "X.Xs"
func FormatDurationMs(ms int) string {
	if ms < 1000 {
		return fmt.Sprintf("%dms", ms)
	}
	seconds := float64(ms) / 1000.0
	return fmt.Sprintf("%.1fs", seconds)
}

// ValidateFileFormat returns true if the extension (with or without dot) is supported, case-insensitively
func ValidateFileFormat(extension string) bool {
	ext := strings.ToLower(strings.TrimPrefix(extension, "."))
	return imageFormats[ext] || videoFormats[ext]
}

// GetFileType returns "image" or "video" for the given extension
func GetFileType(extension string) string {
	ext := strings.ToLower(strings.TrimPrefix(extension, "."))
	if imageFormats[ext] {
		return "image"
	}
	return "video"
}

// SelectTool returns "exiftool" for images and "ffmpeg" for videos
func SelectTool(extension string) string {
	if GetFileType(extension) == "image" {
		return "exiftool"
	}
	return "ffmpeg"
}

// CalculateJobProgress returns the floor percentage of completed files
func CalculateJobProgress(completed, total int) int {
	if total == 0 {
		return 0
	}
	return (completed * 100) / total
}

// IsFileExpired returns true if the file's age exceeds the retention period
func IsFileExpired(createdAt time.Time, retention time.Duration) bool {
	return time.Since(createdAt) > retention
}

// CalculateReportSummary aggregates stats across all report summaries
func CalculateReportSummary(reports []ReportSummary) ReportsSummaryStats {
	stats := ReportsSummaryStats{
		TotalReports: len(reports),
	}
	for _, r := range reports {
		stats.FieldsRemoved += r.Fields
		stats.FilesProcessed += r.FileCount
		if r.GPS {
			stats.GPSRemoved++
		}
	}
	return stats
}
