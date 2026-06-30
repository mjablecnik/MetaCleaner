package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/stripe/stripe-go/v82/webhook"

	src "metacleaner-server/source"
)

const testWebhookSecret = "whsec_test_secret_for_unit_tests"

// buildStripeEvent serializes a minimal Stripe event envelope and signs it.
func buildStripeEvent(t *testing.T, eventType string, dataObject interface{}) (payload []byte, sigHeader string) {
	t.Helper()
	objBytes, err := json.Marshal(dataObject)
	if err != nil {
		t.Fatalf("marshal data object: %v", err)
	}
	event := map[string]interface{}{
		"id":          "evt_test_" + eventType,
		"type":        eventType,
		"api_version": "2024-06-20",
		"data": map[string]interface{}{
			"object": json.RawMessage(objBytes),
		},
	}
	eventBytes, err := json.Marshal(event)
	if err != nil {
		t.Fatalf("marshal event: %v", err)
	}
	signed := webhook.GenerateTestSignedPayload(&webhook.UnsignedPayload{
		Payload:   eventBytes,
		Secret:    testWebhookSecret,
		Timestamp: time.Now(),
	})
	return signed.Payload, signed.Header
}

func postWebhook(t *testing.T, handler http.HandlerFunc, payload []byte, sigHeader string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodPost, "/api/billing/webhook", bytes.NewReader(payload))
	if sigHeader != "" {
		req.Header.Set("Stripe-Signature", sigHeader)
	}
	rr := httptest.NewRecorder()
	handler(rr, req)
	return rr
}

// ─── Missing secret ──────────────────────────────────────────────────────────

func TestHandleStripeWebhook_MissingSecret_Returns503(t *testing.T) {
	db := newBillingDB(t, http.NotFoundHandler())
	handler := src.HandleStripeWebhook(src.Config{}, db)

	rr := postWebhook(t, handler, []byte(`{}`), "")
	if rr.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d: %s", rr.Code, rr.Body.String())
	}
	resp := decodeErrResp(t, rr)
	if resp.Error != src.ErrBillingConfigError {
		t.Errorf("error = %q, want %q", resp.Error, src.ErrBillingConfigError)
	}
}

// ─── Invalid signature ───────────────────────────────────────────────────────

func TestHandleStripeWebhook_InvalidSignature_Returns400(t *testing.T) {
	db := newBillingDB(t, http.NotFoundHandler())
	cfg := src.Config{StripeWebhookSecret: testWebhookSecret}
	handler := src.HandleStripeWebhook(cfg, db)

	rr := postWebhook(t, handler, []byte(`{"id":"evt_1","type":"foo"}`), "v1=badsig,t=1234567890")
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
	resp := decodeErrResp(t, rr)
	if resp.Error != src.ErrInvalidRequest {
		t.Errorf("error = %q, want %q", resp.Error, src.ErrInvalidRequest)
	}
}

// ─── Unknown event type ──────────────────────────────────────────────────────

func TestHandleStripeWebhook_UnknownEventType_Returns200(t *testing.T) {
	db := newBillingDB(t, http.NotFoundHandler())
	cfg := src.Config{StripeWebhookSecret: testWebhookSecret}
	handler := src.HandleStripeWebhook(cfg, db)

	payload, sig := buildStripeEvent(t, "payment_intent.succeeded", map[string]interface{}{
		"id": "pi_test_123",
	})
	rr := postWebhook(t, handler, payload, sig)
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200 for unknown event type, got %d: %s", rr.Code, rr.Body.String())
	}
}

// ─── customer.subscription.updated ──────────────────────────────────────────

func TestHandleStripeWebhook_SubscriptionUpdated_Updates200(t *testing.T) {
	var patchedStatus string
	db := newBillingDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPatch && strings.Contains(r.URL.Path, "subscriptions") {
			var body map[string]interface{}
			json.NewDecoder(r.Body).Decode(&body)
			if s, ok := body["status"].(string); ok {
				patchedStatus = s
			}
			w.WriteHeader(http.StatusOK)
		}
	}))
	cfg := src.Config{StripeWebhookSecret: testWebhookSecret}
	handler := src.HandleStripeWebhook(cfg, db)

	stripeSubObj := map[string]interface{}{
		"id":                   "sub_stripe_upd",
		"status":               "active",
		"cancel_at_period_end": false,
	}
	payload, sig := buildStripeEvent(t, "customer.subscription.updated", stripeSubObj)
	rr := postWebhook(t, handler, payload, sig)
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	if patchedStatus != "active" {
		t.Errorf("subscription status patched as %q, want active", patchedStatus)
	}
}

func TestHandleStripeWebhook_SubscriptionUpdated_CancelAtPeriodEnd_SetsCancelling(t *testing.T) {
	var patchedStatus string
	db := newBillingDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPatch && strings.Contains(r.URL.Path, "subscriptions") {
			var body map[string]interface{}
			json.NewDecoder(r.Body).Decode(&body)
			if s, ok := body["status"].(string); ok {
				patchedStatus = s
			}
			w.WriteHeader(http.StatusOK)
		}
	}))
	cfg := src.Config{StripeWebhookSecret: testWebhookSecret}
	handler := src.HandleStripeWebhook(cfg, db)

	stripeSubObj := map[string]interface{}{
		"id":                   "sub_stripe_cancel",
		"status":               "active",
		"cancel_at_period_end": true,
	}
	payload, sig := buildStripeEvent(t, "customer.subscription.updated", stripeSubObj)
	rr := postWebhook(t, handler, payload, sig)
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	if patchedStatus != "cancelling" {
		t.Errorf("status = %q, want cancelling (cancel_at_period_end=true + active should map to cancelling)", patchedStatus)
	}
}

// ─── customer.subscription.deleted ──────────────────────────────────────────

func TestHandleStripeWebhook_SubscriptionDeleted_ZerosCredits(t *testing.T) {
	var upsertedCredits int
	requestCount := 0

	db := newBillingDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestCount++
		switch {
		case r.Method == http.MethodPatch && strings.Contains(r.URL.RawQuery, "subscriptions"):
			// UpdateSubscription call
			w.WriteHeader(http.StatusOK)
		case r.Method == http.MethodGet && strings.Contains(r.URL.Path, "subscriptions"):
			// GetSubscriptionByStripeID
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{subRow("pro", "active", "sub_stripe_del")})
		case r.Method == http.MethodGet && strings.Contains(r.URL.Path, "credit_balances"):
			// GetCreditBalance (for SetSubscriptionCredits → UpsertCreditBalance)
			writeJSONResp(w, http.StatusOK, balanceRows(100, 5))
		case r.Method == http.MethodPatch && strings.Contains(r.URL.Path, "credit_balances"):
			// UpsertCreditBalance (from SetSubscriptionCredits)
			var body map[string]int
			json.NewDecoder(r.Body).Decode(&body)
			upsertedCredits = body["subscription_credits"]
			w.WriteHeader(http.StatusOK)
		}
	}))
	cfg := src.Config{StripeWebhookSecret: testWebhookSecret}
	handler := src.HandleStripeWebhook(cfg, db)

	stripeSubObj := map[string]interface{}{
		"id":     "sub_stripe_del",
		"status": "canceled",
	}
	payload, sig := buildStripeEvent(t, "customer.subscription.deleted", stripeSubObj)
	rr := postWebhook(t, handler, payload, sig)
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	if upsertedCredits != 0 {
		t.Errorf("subscription_credits = %d, want 0 (credits zeroed on deletion)", upsertedCredits)
	}
}

// ─── invoice.paid ─────────────────────────────────────────────────────────

func TestHandleStripeWebhook_InvoicePaid_RenewsCredits(t *testing.T) {
	var renewedCredits int

	db := newBillingDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodGet && strings.Contains(r.URL.Path, "subscriptions"):
			// GetSubscriptionByStripeID: return pro subscription
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{subRow("pro", "active", "sub_stripe_inv")})
		case r.Method == http.MethodGet && strings.Contains(r.URL.Path, "credit_balances"):
			// GetCreditBalance (called by SetSubscriptionCredits)
			writeJSONResp(w, http.StatusOK, balanceRows(0, 5))
		case r.Method == http.MethodPatch && strings.Contains(r.URL.Path, "credit_balances"):
			// UpsertCreditBalance
			var body map[string]int
			json.NewDecoder(r.Body).Decode(&body)
			renewedCredits = body["subscription_credits"]
			w.WriteHeader(http.StatusOK)
		case r.Method == http.MethodPost && strings.Contains(r.URL.Path, "credit_transactions"):
			// RecordCreditTransaction
			writeJSONResp(w, http.StatusCreated, []interface{}{})
		}
	}))
	cfg := src.Config{StripeWebhookSecret: testWebhookSecret}
	handler := src.HandleStripeWebhook(cfg, db)

	// billing_reason must be "subscription_cycle" (not create/update) to trigger credit renewal
	invoiceObj := map[string]interface{}{
		"id":             "inv_test_paid",
		"billing_reason": "subscription_cycle",
		"parent": map[string]interface{}{
			"subscription_details": map[string]interface{}{
				"subscription": map[string]interface{}{
					"id": "sub_stripe_inv",
				},
			},
		},
	}
	payload, sig := buildStripeEvent(t, "invoice.paid", invoiceObj)
	rr := postWebhook(t, handler, payload, sig)
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	if renewedCredits != 100 {
		t.Errorf("renewed credits = %d, want 100 (pro plan allowance)", renewedCredits)
	}
}

// ─── checkout.session.completed (payment mode) ───────────────────────────────

func TestHandleStripeWebhook_CheckoutSessionCompleted_PaymentMode_AddsPurchasedCredits(t *testing.T) {
	var upsertedPurchasedCredits int

	db := newBillingDB(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodGet && strings.Contains(r.URL.Path, "credit_balances"):
			// GetCreditBalance
			writeJSONResp(w, http.StatusOK, balanceRows(10, 0))
		case r.Method == http.MethodPatch && strings.Contains(r.URL.Path, "credit_balances"):
			// UpsertCreditBalance (AddPurchasedCredits)
			var body map[string]int
			json.NewDecoder(r.Body).Decode(&body)
			upsertedPurchasedCredits = body["purchased_credits"]
			w.WriteHeader(http.StatusOK)
		case r.Method == http.MethodPost && strings.Contains(r.URL.Path, "credit_transactions"):
			writeJSONResp(w, http.StatusCreated, []interface{}{})
		}
	}))
	cfg := src.Config{StripeWebhookSecret: testWebhookSecret}
	handler := src.HandleStripeWebhook(cfg, db)

	sessObj := map[string]interface{}{
		"id":   "cs_test_payment",
		"mode": "payment",
		"metadata": map[string]interface{}{
			"user_id": "user-credits",
		},
	}
	payload, sig := buildStripeEvent(t, "checkout.session.completed", sessObj)
	rr := postWebhook(t, handler, payload, sig)
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	// 0 (existing) + 50 (credit pack) = 50
	if upsertedPurchasedCredits != 50 {
		t.Errorf("purchased_credits = %d, want 50 (0 existing + 50 pack)", upsertedPurchasedCredits)
	}
}
