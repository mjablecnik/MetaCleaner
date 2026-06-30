package tests

import (
	"testing"

	src "metacleaner-server/source"
)

func TestAPIKeyRateLimiter_AllowsWithinRPM(t *testing.T) {
	const rpm = 5
	rl := src.NewAPIKeyRateLimiter(rpm)

	for i := 0; i < rpm; i++ {
		allowed, retry := rl.Allow("key-A")
		if !allowed {
			t.Fatalf("request %d/%d: expected allowed=true, got false (retry=%d)", i+1, rpm, retry)
		}
		if retry != 0 {
			t.Fatalf("request %d/%d: expected retry=0 when allowed, got %d", i+1, rpm, retry)
		}
	}
}

func TestAPIKeyRateLimiter_BlocksWhenRPMExceeded(t *testing.T) {
	const rpm = 5
	rl := src.NewAPIKeyRateLimiter(rpm)

	// Exhaust the burst quota.
	for i := 0; i < rpm; i++ {
		rl.Allow("key-B")
	}

	allowed, retry := rl.Allow("key-B")
	if allowed {
		t.Fatal("expected allowed=false after RPM exhausted, got true")
	}
	if retry <= 0 {
		t.Errorf("expected retry>0 when rate limited, got %d", retry)
	}
}

func TestAPIKeyRateLimiter_RetrySecondsIsPositive(t *testing.T) {
	const rpm = 3
	rl := src.NewAPIKeyRateLimiter(rpm)

	for i := 0; i < rpm; i++ {
		rl.Allow("key-C")
	}

	_, retry := rl.Allow("key-C")
	if retry < 1 {
		t.Errorf("expected Retry-After >= 1 second, got %d", retry)
	}
}

func TestAPIKeyRateLimiter_PerKeyIsolation_ExhaustingOneKeyDoesNotBlockAnother(t *testing.T) {
	const rpm = 4
	rl := src.NewAPIKeyRateLimiter(rpm)

	// Exhaust key-D
	for i := 0; i < rpm; i++ {
		rl.Allow("key-D")
	}
	allowed, _ := rl.Allow("key-D")
	if allowed {
		t.Fatal("key-D should be rate limited after exhaustion")
	}

	// key-E must have its own independent quota
	allowed, _ = rl.Allow("key-E")
	if !allowed {
		t.Error("key-E should not be rate limited by key-D exhaustion")
	}
}

func TestAPIKeyRateLimiter_MultipleKeysMaintainSeparateBuckets(t *testing.T) {
	const rpm = 2
	rl := src.NewAPIKeyRateLimiter(rpm)

	keys := []string{"key-alpha", "key-beta", "key-gamma"}

	// Each key independently gets rpm requests
	for _, key := range keys {
		for i := 0; i < rpm; i++ {
			allowed, _ := rl.Allow(key)
			if !allowed {
				t.Errorf("key %s request %d/%d: expected allowed, got blocked", key, i+1, rpm)
			}
		}
	}

	// Each key is now exhausted individually
	for _, key := range keys {
		allowed, _ := rl.Allow(key)
		if allowed {
			t.Errorf("key %s should be rate limited after exhaustion", key)
		}
	}
}

func TestAPIKeyRateLimiter_AllowReturnsTrueForNewKey(t *testing.T) {
	rl := src.NewAPIKeyRateLimiter(10)

	// Brand new key should always be allowed for the first request.
	allowed, retry := rl.Allow("brand-new-key")
	if !allowed {
		t.Fatalf("first request for new key: expected allowed=true, got false (retry=%d)", retry)
	}
}

func TestAPIKeyRateLimiter_ZeroRetryWhenAllowed(t *testing.T) {
	rl := src.NewAPIKeyRateLimiter(10)

	_, retry := rl.Allow("key-Z")
	if retry != 0 {
		t.Errorf("expected retry=0 when request is allowed, got %d", retry)
	}
}
