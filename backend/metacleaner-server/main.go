package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"
	"os/signal"
	"syscall"
)

func checkTool(name string, args ...string) error {
	cmd := exec.Command(name, args...)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("%s not available: %w", name, err)
	}
	return nil
}

func main() {
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

	// TODO(task-14): wire router, WebSocketHub, CleaningPipeline and start HTTP server.
	log.Printf("startup: server ready (HTTP not yet wired — see task 14)")

	// Block until SIGINT/SIGTERM.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("shutdown: signal received")
	cancelScheduler()
	log.Println("shutdown: complete")
}
