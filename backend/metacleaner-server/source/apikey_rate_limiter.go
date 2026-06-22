package source

import (
	"sync"
	"time"

	"golang.org/x/time/rate"
)

// APIKeyRateLimiter enforces an independent per-key token bucket rate limit.
// Each key gets its own bucket so exhausting one key's quota never affects others.
type APIKeyRateLimiter struct {
	mu       sync.Mutex
	limiters map[string]*rateLimiterEntry
	rpm      int
}

// NewAPIKeyRateLimiter creates an APIKeyRateLimiter with the given requests-per-minute
// limit and starts a background goroutine to evict stale buckets.
func NewAPIKeyRateLimiter(rpm int) *APIKeyRateLimiter {
	rl := &APIKeyRateLimiter{
		limiters: make(map[string]*rateLimiterEntry),
		rpm:      rpm,
	}
	go rl.cleanup()
	return rl
}

// Allow checks whether a request for the given key ID is within the rate limit.
// Returns (true, 0) if allowed, or (false, retryAfterSeconds) if the limit is exceeded.
func (rl *APIKeyRateLimiter) Allow(keyID string) (bool, int) {
	rl.mu.Lock()
	entry, ok := rl.limiters[keyID]
	if !ok {
		r := rate.Every(time.Minute / time.Duration(rl.rpm))
		entry = &rateLimiterEntry{
			limiter: rate.NewLimiter(r, rl.rpm),
		}
		rl.limiters[keyID] = entry
	}
	entry.lastSeen = time.Now()
	limiter := entry.limiter
	rl.mu.Unlock()

	reservation := limiter.Reserve()
	delay := reservation.Delay()
	if delay > 0 {
		reservation.Cancel()
		return false, int(delay.Seconds()) + 1
	}
	return true, 0
}

// cleanup evicts buckets that haven't been used in the last 10 minutes.
func (rl *APIKeyRateLimiter) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		rl.mu.Lock()
		cutoff := time.Now().Add(-10 * time.Minute)
		for id, entry := range rl.limiters {
			if entry.lastSeen.Before(cutoff) {
				delete(rl.limiters, id)
			}
		}
		rl.mu.Unlock()
	}
}
