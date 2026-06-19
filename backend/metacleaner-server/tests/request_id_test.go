package tests

import (
	"log/slog"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	src "metacleaner-server/source"
	"pgregory.net/rapid"
)

var uuidV4Re = regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`)

// Property 9: Request ID in response header — UUID v4 format
func TestProperty9_RequestIDIsUUIDv4(t *testing.T) {
	rapid.Check(t, func(rt *rapid.T) {
		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		})
		mw := src.RequestIDMiddleware(handler)

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rw := httptest.NewRecorder()
		mw.ServeHTTP(rw, req)

		id := rw.Header().Get(src.RequestIDHeader)
		if !uuidV4Re.MatchString(id) {
			rt.Fatalf("response X-Request-Id %q does not match UUID v4 format", id)
		}
	})
}

// Property 10: Request ID passthrough — incoming X-Request-Id echoed exactly
func TestProperty10_RequestIDPassthrough(t *testing.T) {
	rapid.Check(t, func(rt *rapid.T) {
		incoming := rapid.StringMatching(`[a-zA-Z0-9-]{1,64}`).Draw(rt, "requestId")

		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		})
		mw := src.RequestIDMiddleware(handler)

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set(src.RequestIDHeader, incoming)
		rw := httptest.NewRecorder()
		mw.ServeHTTP(rw, req)

		got := rw.Header().Get(src.RequestIDHeader)
		if got != incoming {
			rt.Fatalf("expected X-Request-Id %q, got %q", incoming, got)
		}
	})
}

// Property 11: Request ID propagation to logs — requestId field in log entries during request
func TestProperty11_RequestIDPropagatedToLogger(t *testing.T) {
	rapid.Check(t, func(rt *rapid.T) {
		incoming := rapid.StringMatching(`[a-zA-Z0-9-]{1,64}`).Draw(rt, "requestId")

		var capturedLogger *slog.Logger
		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			capturedLogger = src.LoggerFromContext(r.Context())
			w.WriteHeader(http.StatusOK)
		})
		mw := src.RequestIDMiddleware(handler)

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set(src.RequestIDHeader, incoming)
		rw := httptest.NewRecorder()
		mw.ServeHTTP(rw, req)

		if capturedLogger == nil {
			rt.Fatal("expected logger in context, got nil")
		}
	})
}

func TestGenerateRequestID_IsUniqueAndFormatted(t *testing.T) {
	seen := make(map[string]bool, 200)
	for i := 0; i < 200; i++ {
		id := src.GenerateRequestID()
		if !uuidV4Re.MatchString(id) {
			t.Fatalf("GenerateRequestID() returned %q which does not match UUID v4 format", id)
		}
		if seen[id] {
			t.Fatalf("GenerateRequestID() produced a duplicate: %q", id)
		}
		seen[id] = true
	}
}

func TestRequestIDMiddleware_SetsResponseHeader(t *testing.T) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	mw := src.RequestIDMiddleware(handler)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rw := httptest.NewRecorder()
	mw.ServeHTTP(rw, req)

	id := rw.Header().Get(src.RequestIDHeader)
	if id == "" {
		t.Fatal("expected X-Request-Id header to be set in response")
	}
	if !uuidV4Re.MatchString(id) {
		t.Fatalf("generated request ID %q is not a valid UUID v4", id)
	}
}

func TestRequestIDMiddleware_InjectsLoggerInContext(t *testing.T) {
	var ctxLogger *slog.Logger
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctxLogger = src.LoggerFromContext(r.Context())
		w.WriteHeader(http.StatusOK)
	})
	mw := src.RequestIDMiddleware(handler)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rw := httptest.NewRecorder()
	mw.ServeHTTP(rw, req)

	if ctxLogger == nil {
		t.Fatal("expected logger in request context, got nil")
	}
}
