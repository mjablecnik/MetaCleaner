package source

import (
	"context"
	"fmt"
	"log"
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
	cfg := LoadConfig()

	// Startup: verify ExifTool in PATH.
	if err := checkTool("exiftool", "-ver"); err != nil {
		log.Fatalf("startup: %v", err)
	}
	log.Println("startup: exiftool OK")

	// Startup: verify FFmpeg in PATH.
	if err := checkTool("ffmpeg", "-version"); err != nil {
		log.Fatalf("startup: %v", err)
	}
	log.Println("startup: ffmpeg OK")

	// Startup: create temp storage directories.
	for _, dir := range []string{"uploads", "cleaned"} {
		path := cfg.TempStoragePath + "/" + dir
		if err := os.MkdirAll(path, 0755); err != nil {
			log.Fatalf("startup: failed to create temp directory %s: %v", path, err)
		}
	}
	log.Printf("startup: temp storage ready at %s", cfg.TempStoragePath)

	// Startup: verify Supabase DB connectivity.
	db := NewSupabaseClient(cfg)
	startupCtx := context.Background()
	if err := db.Ping(startupCtx); err != nil {
		log.Fatalf("startup: Supabase not reachable: %v", err)
	}
	log.Println("startup: Supabase DB OK")

	// Start cleanup scheduler.
	scheduler := NewCleanupScheduler(cfg.RetentionPeriod, cfg.TempStoragePath)
	schedulerCtx, cancelScheduler := context.WithCancel(startupCtx)
	defer cancelScheduler()
	scheduler.Start(schedulerCtx)
	log.Println("startup: cleanup scheduler started")

	// Initialize WebSocketHub and CleaningPipeline.
	hub := NewWebSocketHub()
	pl := NewCleaningPipeline(cfg)

	// Build router.
	router := NewRouter(cfg, db, hub, pl)

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      router,
		ReadTimeout:  60 * time.Second,
		WriteTimeout: 300 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Start server in background.
	go func() {
		log.Printf("startup: HTTP server listening on :%d", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server: %v", err)
		}
	}()

	// Block until SIGINT/SIGTERM.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("shutdown: signal received")

	// Graceful shutdown with 30s timeout.
	shutdownCtx, cancelShutdown := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancelShutdown()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("shutdown: HTTP server error: %v", err)
	}

	cancelScheduler()
	log.Println("shutdown: complete")
}
