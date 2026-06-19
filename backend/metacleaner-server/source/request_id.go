package source

import (
	"crypto/rand"
	"fmt"
	"log/slog"
	"net/http"
)

const RequestIDHeader = "X-Request-Id"

// GenerateRequestID produces a UUID v4 string.
func GenerateRequestID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	b[6] = (b[6] & 0x0f) | 0x40 // version 4
	b[8] = (b[8] & 0x3f) | 0x80 // variant 10
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}

// RequestIDMiddleware generates or propagates a request ID and injects
// a request-scoped logger with the requestId attribute into context.
func RequestIDMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := r.Header.Get(RequestIDHeader)
		if requestID == "" {
			requestID = GenerateRequestID()
		}
		w.Header().Set(RequestIDHeader, requestID)

		logger := slog.Default().With(slog.String("requestId", requestID))
		ctx := ContextWithLogger(r.Context(), logger)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
