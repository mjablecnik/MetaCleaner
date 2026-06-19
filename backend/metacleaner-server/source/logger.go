package source

import (
	"context"
	"log/slog"
	"os"
)

type loggerContextKey string

const loggerKey loggerContextKey = "logger"

// InitLogger configures the default slog logger based on APP_ENV.
// Production: JSON handler at Info level.
// Development: Text handler at Debug level.
func InitLogger() {
	env := os.Getenv("APP_ENV")
	var handler slog.Handler
	if env == "production" {
		handler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
			Level: slog.LevelInfo,
		})
	} else {
		handler = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
			Level: slog.LevelDebug,
		})
	}
	slog.SetDefault(slog.New(handler))
}

// LoggerFromContext retrieves the request-scoped logger.
func LoggerFromContext(ctx context.Context) *slog.Logger {
	if l, ok := ctx.Value(loggerKey).(*slog.Logger); ok {
		return l
	}
	return slog.Default()
}

// ContextWithLogger stores a logger in the context.
func ContextWithLogger(ctx context.Context, l *slog.Logger) context.Context {
	return context.WithValue(ctx, loggerKey, l)
}
