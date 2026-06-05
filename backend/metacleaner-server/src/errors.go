package src

import (
	"encoding/json"
	"net/http"
	"time"
)

const (
	ErrFileTooLarge        = "FILE_TOO_LARGE"
	ErrUnsupportedFormat   = "UNSUPPORTED_FORMAT"
	ErrInsufficientStorage = "INSUFFICIENT_STORAGE"
	ErrFileNotFound        = "FILE_NOT_FOUND"
	ErrFileNotReady        = "FILE_NOT_READY"
	ErrJobNotFound         = "JOB_NOT_FOUND"
	ErrReportNotFound      = "REPORT_NOT_FOUND"
	ErrInvalidRequest      = "INVALID_REQUEST"
	ErrDatabaseError       = "DATABASE_ERROR"
	ErrRateLimitExceeded   = "RATE_LIMIT_EXCEEDED"
)

type ErrorResponse struct {
	Error     string `json:"error"`
	Message   string `json:"message"`
	Timestamp string `json:"timestamp"`
}

func NewErrorResponse(code, message string) ErrorResponse {
	return ErrorResponse{
		Error:     code,
		Message:   message,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}
}

func WriteError(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(NewErrorResponse(code, message))
}
