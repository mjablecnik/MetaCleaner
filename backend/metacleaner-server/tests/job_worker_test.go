package tests

import (
	"fmt"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	src "metacleaner-server/source"
)

func TestJobWorkerPool_Submit_RunsFunction(t *testing.T) {
	pool := src.NewJobWorkerPool(1)

	var called bool
	pool.Submit("test-job", func() {
		called = true
	})
	pool.Wait()

	if !called {
		t.Error("expected submitted function to be called after Wait")
	}
}

func TestJobWorkerPool_MultipleJobs_AllExecute(t *testing.T) {
	const n = 10
	pool := src.NewJobWorkerPool(3)

	var results [n]int32
	for i := 0; i < n; i++ {
		i := i
		pool.Submit(fmt.Sprintf("job-%d", i), func() {
			atomic.StoreInt32(&results[i], 1)
		})
	}

	pool.Wait()

	for i, v := range results {
		if v != 1 {
			t.Errorf("job %d did not execute", i)
		}
	}
}

func TestJobWorkerPool_Wait_BlocksUntilAllJobsDone(t *testing.T) {
	pool := src.NewJobWorkerPool(2)

	var done int32
	for i := 0; i < 5; i++ {
		pool.Submit(fmt.Sprintf("j%d", i), func() {
			time.Sleep(5 * time.Millisecond)
			atomic.AddInt32(&done, 1)
		})
	}

	pool.Wait()

	if n := atomic.LoadInt32(&done); n != 5 {
		t.Errorf("expected 5 jobs done after Wait, got %d", n)
	}
}

func TestJobWorkerPool_ConcurrencyNeverExceedsMax(t *testing.T) {
	const max = 2
	pool := src.NewJobWorkerPool(max)

	var mu sync.Mutex
	var current, peak int

	gate := make(chan struct{})
	started := make(chan struct{}, 20)

	for i := 0; i < 10; i++ {
		pool.Submit(fmt.Sprintf("j%d", i), func() {
			mu.Lock()
			current++
			if current > peak {
				peak = current
			}
			mu.Unlock()

			started <- struct{}{}
			<-gate // blocks until gate is closed

			mu.Lock()
			current--
			mu.Unlock()
		})
	}

	// Wait for the first batch (max goroutines) to enter and block.
	for i := 0; i < max; i++ {
		<-started
	}

	// Semaphore is full: no additional goroutines can enter.
	close(gate)
	pool.Wait()

	if peak > max {
		t.Errorf("peak concurrency = %d, want <= %d", peak, max)
	}
}

func TestJobWorkerPool_PendingCount_PositiveWhileJobsQueued(t *testing.T) {
	pool := src.NewJobWorkerPool(1) // single-slot: queues all but the first

	gate := make(chan struct{})
	// Buffer of 1: only the first goroutine signals; subsequent goroutines use
	// the non-blocking default branch so they don't deadlock on a full buffer.
	started := make(chan struct{}, 1)

	// Submit 4 jobs — only 1 can run at a time.
	for i := 0; i < 4; i++ {
		pool.Submit(fmt.Sprintf("j%d", i), func() {
			select {
			case started <- struct{}{}: // signal once; ignore if buffer already full
			default:
			}
			<-gate
		})
	}

	// Wait for the first job to start.
	<-started

	// 3 jobs are pending (submitted but not yet holding a semaphore slot).
	if pc := pool.PendingCount(); pc != 3 {
		t.Errorf("expected PendingCount=3 while 3 jobs are queued, got %d", pc)
	}

	close(gate)
	pool.Wait()

	if pc := pool.PendingCount(); pc != 0 {
		t.Errorf("expected PendingCount=0 after all jobs complete, got %d", pc)
	}
}

func TestJobWorkerPool_RunningCount_ReflectsActiveConcurrency(t *testing.T) {
	const max = 3
	pool := src.NewJobWorkerPool(max)

	gate := make(chan struct{})
	started := make(chan struct{}, max)

	for i := 0; i < max; i++ {
		pool.Submit(fmt.Sprintf("j%d", i), func() {
			started <- struct{}{}
			<-gate
		})
	}

	// Wait for all max slots to be filled.
	for i := 0; i < max; i++ {
		<-started
	}

	if rc := pool.RunningCount(); rc != max {
		t.Errorf("expected RunningCount=%d with %d jobs running, got %d", max, max, rc)
	}

	close(gate)
	pool.Wait()

	if rc := pool.RunningCount(); rc != 0 {
		t.Errorf("expected RunningCount=0 after all jobs complete, got %d", rc)
	}
}

func TestJobWorkerPool_DefaultsToThreeWhenMaxIsZero(t *testing.T) {
	// MaxConcurrent <= 0 should default to 3 per the implementation.
	pool := src.NewJobWorkerPool(0)

	gate := make(chan struct{})
	started := make(chan struct{}, 10)

	for i := 0; i < 5; i++ {
		pool.Submit(fmt.Sprintf("j%d", i), func() {
			started <- struct{}{}
			<-gate
		})
	}

	// Wait for 3 goroutines to start (the default max).
	for i := 0; i < 3; i++ {
		<-started
	}

	// 4th start attempt should be blocked (semaphore full at 3).
	if rc := pool.RunningCount(); rc != 3 {
		t.Errorf("expected RunningCount=3 for default max, got %d", rc)
	}

	close(gate)
	pool.Wait()
}
