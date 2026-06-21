package source

import (
	"context"
	"log/slog"
	"sync"
)

// JobWorkerPool limits the number of concurrently processing cleaning jobs.
// When the pool is full, new jobs wait in a queue until a slot becomes available.
type JobWorkerPool struct {
	sem     chan struct{}
	wg      sync.WaitGroup
	pending int64
	mu      sync.Mutex
}

// NewJobWorkerPool creates a worker pool with the given max concurrency.
func NewJobWorkerPool(maxConcurrent int) *JobWorkerPool {
	if maxConcurrent <= 0 {
		maxConcurrent = 3
	}
	return &JobWorkerPool{
		sem: make(chan struct{}, maxConcurrent),
	}
}

// Submit enqueues a job for processing. The function returns immediately.
// The job will execute once a worker slot is available.
func (p *JobWorkerPool) Submit(jobID string, fn func()) {
	p.mu.Lock()
	p.pending++
	pending := p.pending
	p.mu.Unlock()

	slog.Info("job-pool: job submitted", "jobId", jobID, "pendingJobs", pending)

	p.wg.Add(1)
	go func() {
		defer p.wg.Done()

		// Acquire a slot — blocks if all slots are in use.
		p.sem <- struct{}{}
		defer func() { <-p.sem }()

		p.mu.Lock()
		p.pending--
		p.mu.Unlock()

		slog.Info("job-pool: job started", "jobId", jobID)
		fn()
		slog.Info("job-pool: job finished", "jobId", jobID)
	}()
}

// Wait blocks until all submitted jobs complete. Used for graceful shutdown.
func (p *JobWorkerPool) Wait() {
	p.wg.Wait()
}

// PendingCount returns the number of jobs waiting for a slot.
func (p *JobWorkerPool) PendingCount() int {
	p.mu.Lock()
	defer p.mu.Unlock()
	return int(p.pending)
}

// RunningCount returns the number of jobs currently executing.
func (p *JobWorkerPool) RunningCount() int {
	return len(p.sem)
}

// ProcessJobWithPool wraps the pipeline execution with all the post-processing
// (DB updates, report creation) in a single unit of work submitted to the pool.
func ProcessJobWithPool(pool *JobWorkerPool, ctx context.Context, cfg Config, db *SupabaseClient, hub *WebSocketHub, pl *CleaningPipeline, job *Job, files []FileRecord) {
	pool.Submit(job.ID, func() {
		progressFn := func(event ProgressEvent) { hub.Broadcast(job.ID, event) }
		if err := pl.ProcessJob(ctx, job, files, progressFn); err != nil {
			slog.Error("job: pipeline error", "jobId", job.ID, "error", err)
		}

		// Retry UpdateJob once — a transient DB error here leaves the job
		// stuck in "processing" with no way for the user to recover.
		if err := db.UpdateJob(ctx, job); err != nil {
			slog.Warn("job: UpdateJob failed, retrying", "jobId", job.ID, "error", err)
			if err2 := db.UpdateJob(ctx, job); err2 != nil {
				slog.Error("job: UpdateJob retry failed, broadcasting error", "jobId", job.ID, "error", err2)
				hub.Broadcast(job.ID, ProgressEvent{
					Type:    "job_error",
					JobID:   job.ID,
					Message: "Failed to save job results",
				})
				return
			}
		}

		// Batch update all file records in a single request instead of N individual calls.
		if err := db.BatchUpdateFileRecords(ctx, files); err != nil {
			slog.Warn("job: BatchUpdateFileRecords failed", "jobId", job.ID, "error", err)
		}

		createJobReport(ctx, cfg, db, hub, job, files)
	})
}
