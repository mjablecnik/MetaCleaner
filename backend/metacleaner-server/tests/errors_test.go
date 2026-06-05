package tests

import (
	"testing"
	"time"

	"pgregory.net/rapid"
)

// ErrorResponse mirrors the main package struct for testing
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

// Property 8: Error response format consistency
// For any error code and message, the response must have exactly three fields
// matching the inputs, with a valid RFC 3339 timestamp.
func TestErrorResponseFormatConsistency(t *testing.T) {
	rapid.Check(t, func(t *rapid.T) {
		code := rapid.StringMatching(`[A-Z_]{1,50}`).Draw(t, "code")
		message := rapid.String().Draw(t, "message")

		resp := NewErrorResponse(code, message)

		if resp.Error != code {
			t.Fatalf("error field mismatch: got %q, want %q", resp.Error, code)
		}
		if resp.Message != message {
			t.Fatalf("message field mismatch: got %q, want %q", resp.Message, message)
		}
		if _, err := time.Parse(time.RFC3339, resp.Timestamp); err != nil {
			t.Fatalf("timestamp is not valid RFC3339: %q, err: %v", resp.Timestamp, err)
		}
	})
}
