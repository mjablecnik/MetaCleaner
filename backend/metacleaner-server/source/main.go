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

	// Start cleanup scheduler.
	scheduler := NewCleanupScheduler(cfg.RetentionPeriod, cfg.TempStoragePath)
	schedulerCtx, cancelScheduler := context.WithCancel(startupCtx)
	defer cancelScheduler()
	scheduler.Start(schedulerCtx)
	slog.Info("startup: cleanup scheduler started")

	// Initialize WebSocketHub and CleaningPipeline.
	hub := NewWebSocketHub()
	pl := NewCleaningPipeline(cfg)

	// Initialize Supabase Auth client.
	authClient := NewSupabaseAuthClient(cfg)

	// Build router.
	router := NewRouter(cfg, db, hub, pl, authClient)

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      router,
		ReadTimeout:  60 * time.Second,
		WriteTimeout: 300 * time.Second,
		IdleTimeout:  120 * time.Second,
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

	cancelScheduler()
	slog.Info("shutdown: complete")
}
