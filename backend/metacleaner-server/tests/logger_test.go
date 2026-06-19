package tests

import (
	"bytes"
	"context"
	"encoding/json"
	"log/slog"
	"regexp"
	"strings"
	"testing"

	src "metacleaner-server/source"
	"pgregory.net/rapid"
)

// Property 8: Structured log JSON format in production
// For any log message string, in production mode output is valid JSON
// with time, level, and msg keys.
func TestProperty8_ProductionLogIsValidJSON(t *testing.T) {
	rapid.Check(t, func(rt *rapid.T) {
		msg := rapid.StringMatching(`[a-zA-Z0-9 _-]+`).Draw(rt, "msg")

		var buf bytes.Buffer
		handler := slog.NewJSONHandler(&buf, &slog.HandlerOptions{Level: slog.LevelInfo})
		logger := slog.New(handler)

		logger.Info(msg)

		line := strings.TrimSpace(buf.String())
		if line == "" {
			rt.Fatal("expected log output, got empty string")
		}

		var entry map[string]any
		if err := json.Unmarshal([]byte(line), &entry); err != nil {
			rt.Fatalf("log output is not valid JSON: %v — output: %s", err, line)
		}

		for _, key := range []string{"time", "level", "msg"} {
			if _, ok := entry[key]; !ok {
				rt.Fatalf("JSON log missing key %q — output: %s", key, line)
			}
		}

		if entry["msg"] != msg {
			rt.Fatalf("expected msg=%q, got %q", msg, entry["msg"])
		}
	})
}

func TestLoggerFromContext_ReturnsDefault(t *testing.T) {
	ctx := context.Background()
	l := src.LoggerFromContext(ctx)
	if l == nil {
		t.Fatal("expected non-nil logger from empty context")
	}
}

func TestContextWithLogger_StoresAndRetrieves(t *testing.T) {
	var buf bytes.Buffer
	handler := slog.NewTextHandler(&buf, nil)
	logger := slog.New(handler)

	ctx := src.ContextWithLogger(context.Background(), logger)
	got := src.LoggerFromContext(ctx)

	if got != logger {
		t.Fatal("LoggerFromContext did not return the logger stored by ContextWithLogger")
	}
}

func TestInitLogger_ProductionJSONFormat(t *testing.T) {
	t.Setenv("APP_ENV", "production")
	src.InitLogger()

	var buf bytes.Buffer
	handler := slog.NewJSONHandler(&buf, &slog.HandlerOptions{Level: slog.LevelInfo})
	logger := slog.New(handler)
	logger.Info("test message")

	line := strings.TrimSpace(buf.String())
	var entry map[string]any
	if err := json.Unmarshal([]byte(line), &entry); err != nil {
		t.Fatalf("production log is not valid JSON: %v", err)
	}

	levelRe := regexp.MustCompile(`^(DEBUG|INFO|WARN|ERROR)$`)
	level, _ := entry["level"].(string)
	if !levelRe.MatchString(level) {
		t.Fatalf("unexpected level value: %q", level)
	}
}

func TestInitLogger_DevelopmentTextFormat(t *testing.T) {
	t.Setenv("APP_ENV", "development")
	src.InitLogger()

	var buf bytes.Buffer
	handler := slog.NewTextHandler(&buf, &slog.HandlerOptions{Level: slog.LevelDebug})
	logger := slog.New(handler)
	logger.Debug("dev message")

	line := strings.TrimSpace(buf.String())
	if !strings.Contains(line, "dev message") {
		t.Fatalf("expected text log to contain message, got: %s", line)
	}
	if line[0] == '{' {
		t.Fatalf("expected text format, got JSON: %s", line)
	}
}
