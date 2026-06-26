package tests

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	src "metacleaner-server/source"
)

// newMockSupabaseAccount returns a test server simulating Supabase billing endpoints
// for account handler tests.
func newMockSupabaseAccount(t *testing.T, subStatus, planID string, subCredits, purchasedCredits int, returnErr bool) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		path := r.URL.Path

		if returnErr {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(`{"message":"db error"}`))
			return
		}

		switch {
		case strings.HasSuffix(path, "/credit_balances"):
			fmt.Fprintf(w, `[{"user_id":"test-user","subscription_credits":%d,"purchased_credits":%d}]`,
				subCredits, purchasedCredits)
		case strings.Contains(path, "/subscriptions"):
			if subStatus == "" {
				w.Write([]byte(`[]`))
			} else {
				fmt.Fprintf(w, `[{"id":"sub1","user_id":"test-user","plan_id":%q,"status":%q,"stripe_customer_id":"cus_test"}]`,
					planID, subStatus)
			}
		default:
			w.Write([]byte(`[]`))
		}
	}))
}

func TestHandleAccount_NoAuth_Returns401(t *testing.T) {
	cfg := src.Config{RateLimitRPM: 10}
	srv := newMockSupabaseAccount(t, "active", "pro", 100, 50, false)
	defer srv.Close()
	cfg.SupabaseURL = srv.URL
	db := src.NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/account", nil)
	rr := httptest.NewRecorder()
	src.HandleAccount(cfg, db)(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp src.ErrorResponse
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp.Error != src.ErrAuthUnauthorized {
		t.Errorf("expected error %q, got %q", src.ErrAuthUnauthorized, resp.Error)
	}
}

func TestHandleAccount_ActiveSubscription_Returns200WithPlan(t *testing.T) {
	cfg := src.Config{RateLimitRPM: 10}
	srv := newMockSupabaseAccount(t, "active", "pro", 100, 50, false)
	defer srv.Close()
	cfg.SupabaseURL = srv.URL
	db := src.NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/account", nil)
	req = req.WithContext(src.ContextWithUserID(req.Context(), "test-user"))
	rr := httptest.NewRecorder()
	src.HandleAccount(cfg, db)(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp map[string]interface{}
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if resp["plan"] != "pro" {
		t.Errorf("expected plan 'pro', got %v", resp["plan"])
	}
	if resp["credits_remaining"] != float64(150) {
		t.Errorf("expected credits_remaining 150, got %v", resp["credits_remaining"])
	}
	if resp["rate_limit_rpm"] != float64(10) {
		t.Errorf("expected rate_limit_rpm 10, got %v", resp["rate_limit_rpm"])
	}
}

func TestHandleAccount_CancellingSubscription_ReturnsPlan(t *testing.T) {
	cfg := src.Config{RateLimitRPM: 10}
	srv := newMockSupabaseAccount(t, "cancelling", "pro", 80, 0, false)
	defer srv.Close()
	cfg.SupabaseURL = srv.URL
	db := src.NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/account", nil)
	req = req.WithContext(src.ContextWithUserID(req.Context(), "test-user"))
	rr := httptest.NewRecorder()
	src.HandleAccount(cfg, db)(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp map[string]interface{}
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if resp["plan"] != "pro" {
		t.Errorf("expected plan 'pro' for cancelling subscription, got %v", resp["plan"])
	}
	if resp["credits_remaining"] != float64(80) {
		t.Errorf("expected credits_remaining 80, got %v", resp["credits_remaining"])
	}
}

func TestHandleAccount_NoSubscription_ReturnsFree(t *testing.T) {
	cfg := src.Config{RateLimitRPM: 5}
	srv := newMockSupabaseAccount(t, "", "", 0, 0, false)
	defer srv.Close()
	cfg.SupabaseURL = srv.URL
	db := src.NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/account", nil)
	req = req.WithContext(src.ContextWithUserID(req.Context(), "test-user"))
	rr := httptest.NewRecorder()
	src.HandleAccount(cfg, db)(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp map[string]interface{}
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp["plan"] != "free" {
		t.Errorf("expected plan 'free', got %v", resp["plan"])
	}
	if resp["credits_remaining"] != float64(0) {
		t.Errorf("expected credits_remaining 0, got %v", resp["credits_remaining"])
	}
}

func TestHandleAccount_DBError_Returns500(t *testing.T) {
	cfg := src.Config{RateLimitRPM: 10}
	srv := newMockSupabaseAccount(t, "", "", 0, 0, true)
	defer srv.Close()
	cfg.SupabaseURL = srv.URL
	db := src.NewSupabaseClient(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/account", nil)
	req = req.WithContext(src.ContextWithUserID(req.Context(), "test-user"))
	rr := httptest.NewRecorder()
	src.HandleAccount(cfg, db)(rr, req)

	if rr.Code != http.StatusInternalServerError {
		t.Fatalf("expected 500, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp src.ErrorResponse
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp.Error != src.ErrDatabaseError {
		t.Errorf("expected error %q, got %q", src.ErrDatabaseError, resp.Error)
	}
}
