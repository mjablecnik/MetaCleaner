package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	src "metacleaner-server/source"
)

// subRow returns a JSON subscription row for the mock Supabase server.
func subRow(planID, status, stripeSubID string) map[string]interface{} {
	return map[string]interface{}{
		"id":                     "sub-test-1",
		"user_id":                "user-billing",
		"stripe_subscription_id": stripeSubID,
		"stripe_customer_id":     "cus_test",
		"plan_id":                planID,
		"status":                 status,
		"billing_period":         "monthly",
		"created_at":             time.Now().UTC().Format(time.RFC3339),
		"updated_at":             time.Now().UTC().Format(time.RFC3339),
	}
}

// balanceRows returns a JSON credit balance row.
func balanceRows(subCreds, purCreds int) []map[string]interface{} {
	return []map[string]interface{}{{
		"user_id":              "user-billing",
		"subscription_credits": subCreds,
		"purchased_credits":    purCreds,
	}}
}

// newBillingDB creates a SupabaseClient pointing at a fake Supabase handler.
func newBillingDB(t *testing.T, handler http.Handler) *src.SupabaseClient {
	t.Helper()
	srv := httptest.NewServer(handler)
	t.Cleanup(srv.Close)
	return src.NewSupabaseClient(newSupabaseConfig(srv.URL))
}

// withUserID wraps a request with a user ID in the context.
func withUserID(r *http.Request, userID string) *http.Request {
	return r.WithContext(src.ContextWithUserID(r.Context(), userID))
}

// ─── HandleGetCredits ────────────────────────────────────────────────────────

func TestHandleGetCredits_MissingUserID_Returns401(t *testing.T) {
	db := newBillingDB(t, http.NotFoundHandler())
	handler := src.HandleGetCredits(db)

	req := httptest.NewRequest(http.MethodGet, "/api/billing/credits", nil)
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestHandleGetCredits_Success_Returns200WithBalance(t *testing.T) {
	db := newBillingDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.Path, "credit_balances") {
			writeJSONResp(w, http.StatusOK, balanceRows(10, 5))
		} else if strings.Contains(r.URL.Path, "credit_transactions") {
			writeJSONResp(w, http.StatusOK, []interface{}{})
		}
	}))
	handler := src.HandleGetCredits(db)

	req := httptest.NewRequest(http.MethodGet, "/api/billing/credits", nil)
	req = withUserID(req, "user-billing")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp map[string]interface{}
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if resp["subscription_credits"] != float64(10) {
		t.Errorf("subscription_credits = %v, want 10", resp["subscription_credits"])
	}
	if resp["purchased_credits"] != float64(5) {
		t.Errorf("purchased_credits = %v, want 5", resp["purchased_credits"])
	}
	if resp["total_credits"] != float64(15) {
		t.Errorf("total_credits = %v, want 15", resp["total_credits"])
	}
}

// ─── HandleGetSubscription ───────────────────────────────────────────────────

func TestHandleGetSubscription_MissingUserID_Returns401(t *testing.T) {
	db := newBillingDB(t, http.NotFoundHandler())
	handler := src.HandleGetSubscription(db)

	req := httptest.NewRequest(http.MethodGet, "/api/billing/subscription", nil)
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
}

func TestHandleGetSubscription_ActiveSub_Returns200(t *testing.T) {
	db := newBillingDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.Path, "subscriptions") {
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{subRow("pro", "active", "sub_stripe_1")})
		} else if strings.Contains(r.URL.Path, "credit_balances") {
			writeJSONResp(w, http.StatusOK, balanceRows(20, 0))
		}
	}))
	handler := src.HandleGetSubscription(db)

	req := httptest.NewRequest(http.MethodGet, "/api/billing/subscription", nil)
	req = withUserID(req, "user-billing")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp map[string]interface{}
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp["plan_id"] != "pro" {
		t.Errorf("plan_id = %v, want pro", resp["plan_id"])
	}
	if resp["status"] != "active" {
		t.Errorf("status = %v, want active", resp["status"])
	}
	if resp["subscription_credits"] != float64(20) {
		t.Errorf("subscription_credits = %v, want 20", resp["subscription_credits"])
	}
}

func TestHandleGetSubscription_NoSub_ReturnsFreeStatus(t *testing.T) {
	db := newBillingDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.Path, "subscriptions") {
			writeJSONResp(w, http.StatusOK, []interface{}{})
		} else if strings.Contains(r.URL.Path, "credit_balances") {
			writeJSONResp(w, http.StatusOK, balanceRows(3, 0))
		}
	}))
	handler := src.HandleGetSubscription(db)

	req := httptest.NewRequest(http.MethodGet, "/api/billing/subscription", nil)
	req = withUserID(req, "user-billing")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp map[string]interface{}
	json.NewDecoder(rr.Body).Decode(&resp)
	if resp["plan_id"] != "free" {
		t.Errorf("plan_id = %v, want free", resp["plan_id"])
	}
}

// ─── HandleChangePlan ────────────────────────────────────────────────────────

func TestHandleChangePlan_MissingUserID_Returns401(t *testing.T) {
	db := newBillingDB(t, http.NotFoundHandler())
	handler := src.HandleChangePlan(src.Config{}, db)

	req := httptest.NewRequest(http.MethodPost, "/api/billing/change-plan", nil)
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
}

func TestHandleChangePlan_InvalidPlanID_Returns400(t *testing.T) {
	db := newBillingDB(t, http.NotFoundHandler())
	handler := src.HandleChangePlan(src.Config{}, db)

	body, _ := json.Marshal(map[string]string{"plan_id": "enterprise", "billing_period": "monthly"})
	req := httptest.NewRequest(http.MethodPost, "/api/billing/change-plan", bytes.NewReader(body))
	req = withUserID(req, "user-billing")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
	resp := decodeErrResp(t, rr)
	if resp.Error != src.ErrBillingInvalidPlan {
		t.Errorf("error = %q, want %q", resp.Error, src.ErrBillingInvalidPlan)
	}
}

func TestHandleChangePlan_InvalidBillingPeriod_Returns400(t *testing.T) {
	db := newBillingDB(t, http.NotFoundHandler())
	handler := src.HandleChangePlan(src.Config{}, db)

	body, _ := json.Marshal(map[string]string{"plan_id": "pro", "billing_period": "weekly"})
	req := httptest.NewRequest(http.MethodPost, "/api/billing/change-plan", bytes.NewReader(body))
	req = withUserID(req, "user-billing")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestHandleChangePlan_NoActiveSubscription_Returns400(t *testing.T) {
	db := newBillingDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.Path, "subscriptions") {
			writeJSONResp(w, http.StatusOK, []interface{}{})
		}
	}))
	handler := src.HandleChangePlan(src.Config{}, db)

	body, _ := json.Marshal(map[string]string{"plan_id": "pro", "billing_period": "monthly"})
	req := httptest.NewRequest(http.MethodPost, "/api/billing/change-plan", bytes.NewReader(body))
	req = withUserID(req, "user-billing")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
	resp := decodeErrResp(t, rr)
	if resp.Error != src.ErrNoActiveSubscription {
		t.Errorf("error = %q, want %q", resp.Error, src.ErrNoActiveSubscription)
	}
}

func TestHandleChangePlan_SamePlanConflict_Returns409(t *testing.T) {
	db := newBillingDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.Path, "subscriptions") {
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{subRow("pro", "active", "sub_xyz")})
		}
	}))
	handler := src.HandleChangePlan(src.Config{}, db)

	// Same plan_id and billing_period as the existing subscription
	body, _ := json.Marshal(map[string]string{"plan_id": "pro", "billing_period": "monthly"})
	req := httptest.NewRequest(http.MethodPost, "/api/billing/change-plan", bytes.NewReader(body))
	req = withUserID(req, "user-billing")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusConflict {
		t.Fatalf("expected 409, got %d: %s", rr.Code, rr.Body.String())
	}
	resp := decodeErrResp(t, rr)
	if resp.Error != src.ErrBillingConflict {
		t.Errorf("error = %q, want %q", resp.Error, src.ErrBillingConflict)
	}
}

func TestHandleChangePlan_MissingStripeKey_Returns503(t *testing.T) {
	db := newBillingDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.Path, "subscriptions") {
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{subRow("pro", "active", "sub_xyz")})
		}
	}))
	// No StripeSecretKey set, but requesting proplus (different from existing pro)
	handler := src.HandleChangePlan(src.Config{StripePriceProPlusMonth: "price_pp_month"}, db)

	body, _ := json.Marshal(map[string]string{"plan_id": "proplus", "billing_period": "monthly"})
	req := httptest.NewRequest(http.MethodPost, "/api/billing/change-plan", bytes.NewReader(body))
	req = withUserID(req, "user-billing")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d: %s", rr.Code, rr.Body.String())
	}
	resp := decodeErrResp(t, rr)
	if resp.Error != src.ErrBillingConfigError {
		t.Errorf("error = %q, want %q", resp.Error, src.ErrBillingConfigError)
	}
}

// ─── HandleCancelSubscription ────────────────────────────────────────────────

func TestHandleCancelSubscription_MissingUserID_Returns401(t *testing.T) {
	db := newBillingDB(t, http.NotFoundHandler())
	handler := src.HandleCancelSubscription(src.Config{}, db)

	req := httptest.NewRequest(http.MethodPost, "/api/billing/cancel", nil)
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
}

func TestHandleCancelSubscription_NoActiveSub_Returns400(t *testing.T) {
	db := newBillingDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.Path, "subscriptions") {
			writeJSONResp(w, http.StatusOK, []interface{}{})
		}
	}))
	handler := src.HandleCancelSubscription(src.Config{}, db)

	req := httptest.NewRequest(http.MethodPost, "/api/billing/cancel", nil)
	req = withUserID(req, "user-billing")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
	resp := decodeErrResp(t, rr)
	if resp.Error != src.ErrNoActiveSubscription {
		t.Errorf("error = %q, want %q", resp.Error, src.ErrNoActiveSubscription)
	}
}

func TestHandleCancelSubscription_AlreadyCancelling_Returns400(t *testing.T) {
	db := newBillingDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.Path, "subscriptions") {
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{subRow("pro", "cancelling", "sub_xyz")})
		}
	}))
	handler := src.HandleCancelSubscription(src.Config{}, db)

	req := httptest.NewRequest(http.MethodPost, "/api/billing/cancel", nil)
	req = withUserID(req, "user-billing")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
	resp := decodeErrResp(t, rr)
	if resp.Error != src.ErrAlreadyCancelled {
		t.Errorf("error = %q, want %q", resp.Error, src.ErrAlreadyCancelled)
	}
}

func TestHandleCancelSubscription_MissingStripeKey_Returns503(t *testing.T) {
	db := newBillingDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.Path, "subscriptions") {
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{subRow("pro", "active", "sub_xyz")})
		}
	}))
	handler := src.HandleCancelSubscription(src.Config{}, db)

	req := httptest.NewRequest(http.MethodPost, "/api/billing/cancel", nil)
	req = withUserID(req, "user-billing")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d: %s", rr.Code, rr.Body.String())
	}
}

// ─── HandleReactivateSubscription ───────────────────────────────────────────

func TestHandleReactivateSubscription_MissingUserID_Returns401(t *testing.T) {
	db := newBillingDB(t, http.NotFoundHandler())
	handler := src.HandleReactivateSubscription(src.Config{}, db)

	req := httptest.NewRequest(http.MethodPost, "/api/billing/reactivate", nil)
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
}

func TestHandleReactivateSubscription_NoCancellingSub_Returns400(t *testing.T) {
	db := newBillingDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.Path, "subscriptions") {
			// Status is "active", not "cancelling" — reactivate has nothing to do
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{subRow("pro", "active", "sub_xyz")})
		}
	}))
	handler := src.HandleReactivateSubscription(src.Config{}, db)

	req := httptest.NewRequest(http.MethodPost, "/api/billing/reactivate", nil)
	req = withUserID(req, "user-billing")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
}

// ─── HandleCancelDowngrade ───────────────────────────────────────────────────

func TestHandleCancelDowngrade_MissingUserID_Returns401(t *testing.T) {
	db := newBillingDB(t, http.NotFoundHandler())
	handler := src.HandleCancelDowngrade(src.Config{}, db)

	req := httptest.NewRequest(http.MethodPost, "/api/billing/cancel-downgrade", nil)
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
}

func TestHandleCancelDowngrade_NoScheduledDowngrade_Returns400(t *testing.T) {
	db := newBillingDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.Path, "subscriptions") {
			// No scheduled_plan_id
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{subRow("pro", "active", "sub_xyz")})
		}
	}))
	handler := src.HandleCancelDowngrade(src.Config{}, db)

	req := httptest.NewRequest(http.MethodPost, "/api/billing/cancel-downgrade", nil)
	req = withUserID(req, "user-billing")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
	resp := decodeErrResp(t, rr)
	if resp.Error != src.ErrNoScheduledDowngrade {
		t.Errorf("error = %q, want %q", resp.Error, src.ErrNoScheduledDowngrade)
	}
}

// ─── HandleCreateCheckout ────────────────────────────────────────────────────

func TestHandleCreateCheckout_MissingUserID_Returns401(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	db := newBillingDB(t, http.NotFoundHandler())
	handler := src.HandleCreateCheckout(src.Config{}, db, authClient)

	req := httptest.NewRequest(http.MethodPost, "/api/billing/checkout", nil)
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
}

func TestHandleCreateCheckout_InvalidPlanID_Returns400(t *testing.T) {
	authClient := newFakeAuthClient(t, http.NotFoundHandler())
	db := newBillingDB(t, http.NotFoundHandler())
	handler := src.HandleCreateCheckout(src.Config{}, db, authClient)

	body, _ := json.Marshal(map[string]string{"plan_id": "ultimate", "billing_period": "monthly"})
	req := httptest.NewRequest(http.MethodPost, "/api/billing/checkout", bytes.NewReader(body))
	req = withUserID(req, "user-billing")
	rr := httptest.NewRecorder()
	handler(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
	resp := decodeErrResp(t, rr)
	if resp.Error != src.ErrBillingInvalidPlan {
		t.Errorf("error = %q, want %q", resp.Error, src.ErrBillingInvalidPlan)
	}
}
