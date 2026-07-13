package source

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"syscall"
	"time"
)

func checkTool(name string, args ...string) error {
	cmd := exec.Command(name, args...)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("%s not available: %w", name, err)
	}
	return nil
}

// Run is the main entry point for the metacleaner server.
func Run() {
	InitLogger()

	cfg, err := LoadConfig()
	if err != nil {
		slog.Error("startup: configuration error", "error", err)
		os.Exit(1)
	}

	// Fail-closed in production: FRONTEND_ORIGIN is required so CORS and the
	// WebSocket origin check are never silently disabled by a misconfigured deploy.
	if os.Getenv("APP_ENV") == "production" && cfg.FrontendOrigin == "" {
		slog.Error("startup: FRONTEND_ORIGIN must be set in production (required for CORS and WebSocket origin protection)")
		os.Exit(1)
	}

	// Startup: verify ExifTool in PATH.
	if err := checkTool("exiftool", "-ver"); err != nil {
		slog.Error("startup", "error", err)
		os.Exit(1)
	}
	slog.Info("startup: exiftool OK")

	// Startup: verify FFmpeg in PATH.
	if err := checkTool("ffmpeg", "-version"); err != nil {
		slog.Error("startup", "error", err)
		os.Exit(1)
	}
	slog.Info("startup: ffmpeg OK")

	// Startup: create temp storage directories.
	for _, dir := range []string{"uploads", "cleaned"} {
		path := cfg.TempStoragePath + "/" + dir
		if err := os.MkdirAll(path, 0755); err != nil {
			slog.Error("startup: failed to create temp directory", "path", path, "error", err)
			os.Exit(1)
		}
	}
	slog.Info("startup: temp storage ready", "path", cfg.TempStoragePath)

	// Startup: verify Supabase DB connectivity.
	db := NewSupabaseClient(cfg)
	startupCtx := context.Background()
	if err := db.Ping(startupCtx); err != nil {
		slog.Error("startup: Supabase not reachable", "error", err)
		os.Exit(1)
	}
	slog.Info("startup: Supabase DB OK")

	// Initialize WebSocketHub and CleaningPipeline. TigrisClient is only attached
	// when TIGRIS_ENDPOINT is configured — an empty endpoint means local dev without
	// Tigris, and the pipeline falls back to keeping cleaned files on local disk.
	hub := NewWebSocketHub()
	var pl *CleaningPipeline
	var tigris *TigrisClient
	if cfg.TigrisEndpoint == "" {
		slog.Warn("startup: TIGRIS_ENDPOINT not set, cleaned files will be kept on local disk")
		pl = NewCleaningPipeline(cfg)
	} else {
		tigris = NewTigrisClient(cfg)
		pl = NewCleaningPipelineWithTigris(cfg, tigris)
		slog.Info("startup: Tigris storage configured", "bucket", cfg.TigrisBucket, "endpoint", cfg.TigrisEndpoint)
	}

	// Initialize Supabase Auth client.
	authClient := NewSupabaseAuthClient(cfg)

	// Start account cleanup scheduler (hard-deletes accounts deactivated for 30+ days).
	accountCleanup := NewAccountCleanupScheduler(30*24*time.Hour, authClient, db)
	accountCleanupCtx, cancelAccountCleanup := context.WithCancel(startupCtx)
	defer cancelAccountCleanup()
	accountCleanup.Start(accountCleanupCtx)
	slog.Info("startup: account cleanup scheduler started")

	// Build router.
	router := NewRouter(cfg, db, hub, pl, authClient, tigris)

	srv := &http.Server{
		Addr:              fmt.Sprintf(":%d", cfg.Port),
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       60 * time.Second,
		WriteTimeout:      300 * time.Second,
		IdleTimeout:       120 * time.Second,
		MaxHeaderBytes:    1 << 20, // 1 MB
	}

	// Start server in background.
	go func() {
		slog.Info("startup: HTTP server listening", "port", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("server error", "error", err)
			os.Exit(1)
		}
	}()

	// Block until SIGINT/SIGTERM.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	slog.Info("shutdown: signal received")

	// Graceful shutdown with 30s timeout.
	shutdownCtx, cancelShutdown := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancelShutdown()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		slog.Error("shutdown: HTTP server error", "error", err)
	}

	cancelAccountCleanup()
	slog.Info("shutdown: complete")
}
