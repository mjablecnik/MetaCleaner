package tests

// Property test: Account endpoint returns correct computed state (rapid)
//
// Feature: complete-api-docs, Property 2: Account endpoint returns correct computed state
//
// For any valid authenticated user with subscription credits >= 0, purchased
// credits >= 0, a plan value from {"free", "pro", "proplus"}, and a positive
// rate limit RPM, the GET /api/account handler SHALL return:
//   - credits_remaining == subscriptionCredits + purchasedCredits
//   - plan == active subscription planID (or "free" if no active subscription)
//   - rate_limit_rpm == cfg.RateLimitRPM
//
// Validates: Requirement 10.2

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"pgregory.net/rapid"

	src "metacleaner-server/source"
)

// accountState holds the DB state for one property test iteration.
type accountState struct {
	subCredits       int
	purchasedCredits int
	planID           string // empty string means no active subscription
	subStatus        string // "active" or "" (inactive/none)
}

// newMockSupabaseAccountProperty creates a Supabase test server whose responses
// are driven by the supplied *accountState pointer. Changing the pointer fields
// between rapid iterations lets the same server serve different inputs.
func newMockSupabaseAccountProperty(t *testing.T, st *accountState) *httptest.Server {
	t.Helper()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		path := r.URL.Path

		switch {
		case strings.HasSuffix(path, "/credit_balances"):
			fmt.Fprintf(w, `[{"user_id":"u","subscription_credits":%d,"purchased_credits":%d}]`,
				st.subCredits, st.purchasedCredits)
		case strings.Contains(path, "/subscriptions"):
			if st.subStatus == "active" && st.planID != "" {
				fmt.Fprintf(w, `[{"id":"s1","user_id":"u","plan_id":%q,"status":"active","stripe_customer_id":"cus_x"}]`,
					st.planID)
			} else {
				w.Write([]byte(`[]`))
			}
		default:
			w.Write([]byte(`[]`))
		}
	}))
	t.Cleanup(srv.Close)
	return srv
}

// drawNonNegativeInt generates a non-negative integer up to maxVal using rapid.
func drawNonNegativeInt(rt *rapid.T, maxVal int, label string) int {
	return rapid.IntRange(0, maxVal).Draw(rt, label)
}

// TestProperty_AccountEndpointComputedState verifies Property 2:
// For randomly generated credit amounts, plan IDs, and rate limits, the
// GET /api/account handler always returns the mathematically correct response.
func TestProperty_AccountEndpointComputedState(t *testing.T) {
	st := &accountState{}

	srv := newMockSupabaseAccountProperty(t, st)

	plans := []string{"pro", "proplus"}

	rapid.Check(t, func(rt *rapid.T) {
		// Draw random inputs
		st.subCredits = drawNonNegativeInt(rt, 10000, "subCredits")
		st.purchasedCredits = drawNonNegativeInt(rt, 10000, "purchasedCredits")
		hasActiveSub := rapid.Bool().Draw(rt, "hasActiveSub")
		if hasActiveSub {
			st.planID = plans[rapid.IntRange(0, len(plans)-1).Draw(rt, "planIdx")]
			st.subStatus = "active"
		} else {
			st.planID = ""
			st.subStatus = ""
		}
		rateLimitRPM := rapid.IntRange(1, 1000).Draw(rt, "rateLimitRPM")

		cfg := src.Config{SupabaseURL: srv.URL, RateLimitRPM: rateLimitRPM}
		db := src.NewSupabaseClient(cfg)

		req := httptest.NewRequest(http.MethodGet, "/api/account", nil)
		req = req.WithContext(src.ContextWithUserID(req.Context(), "u"))
		rr := httptest.NewRecorder()
		src.HandleAccount(cfg, db)(rr, req)

		if rr.Code != http.StatusOK {
			rt.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
		}

		var resp map[string]interface{}
		if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
			rt.Fatalf("decode error: %v", err)
		}

		// Property: credits_remaining == subCredits + purchasedCredits
		expectedCredits := float64(st.subCredits + st.purchasedCredits)
		if resp["credits_remaining"] != expectedCredits {
			rt.Fatalf("credits_remaining: expected %v, got %v (sub=%d, purchased=%d)",
				expectedCredits, resp["credits_remaining"], st.subCredits, st.purchasedCredits)
		}

		// Property: plan == active planID or "free"
		expectedPlan := "free"
		if hasActiveSub {
			expectedPlan = st.planID
		}
		if resp["plan"] != expectedPlan {
			rt.Fatalf("plan: expected %q, got %v (hasActiveSub=%v, planID=%q)",
				expectedPlan, resp["plan"], hasActiveSub, st.planID)
		}

		// Property: rate_limit_rpm == cfg.RateLimitRPM
		if resp["rate_limit_rpm"] != float64(rateLimitRPM) {
			rt.Fatalf("rate_limit_rpm: expected %d, got %v", rateLimitRPM, resp["rate_limit_rpm"])
		}
	})
}
