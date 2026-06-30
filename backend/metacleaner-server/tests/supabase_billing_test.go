package tests

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	src "metacleaner-server/source"
)

// ─── GetCreditBalance ────────────────────────────────────────────────────────

func TestGetCreditBalance_HasRow(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assertAuthHeaders(t, r)
		if !strings.Contains(r.URL.Path, "credit_balances") {
			t.Errorf("GetCreditBalance: unexpected path %q", r.URL.Path)
		}
		if !strings.Contains(r.URL.RawQuery, "user_id=eq.user-1") {
			t.Errorf("GetCreditBalance: missing user_id filter, query=%q", r.URL.RawQuery)
		}
		writeJSONResp(w, http.StatusOK, []map[string]interface{}{{
			"user_id":              "user-1",
			"subscription_credits": 10,
			"purchased_credits":    5,
		}})
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	sub, purchased, err := client.GetCreditBalance(context.Background(), "user-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if sub != 10 {
		t.Errorf("subscriptionCredits = %d, want 10", sub)
	}
	if purchased != 5 {
		t.Errorf("purchasedCredits = %d, want 5", purchased)
	}
}

func TestGetCreditBalance_NoRow(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writeJSONResp(w, http.StatusOK, []interface{}{})
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	sub, purchased, err := client.GetCreditBalance(context.Background(), "user-new")
	if err != nil {
		t.Fatalf("unexpected error on empty result: %v", err)
	}
	if sub != 0 || purchased != 0 {
		t.Errorf("expected (0, 0), got (%d, %d)", sub, purchased)
	}
}

// ─── UpsertCreditBalance ─────────────────────────────────────────────────────

func TestUpsertCreditBalance_SendsCorrectRequest(t *testing.T) {
	var gotMethod, gotPath string
	var gotPrefer string
	var gotBody map[string]int

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assertAuthHeaders(t, r)
		gotMethod = r.Method
		gotPath = r.URL.Path
		gotPrefer = r.Header.Get("Prefer")
		data, _ := io.ReadAll(r.Body)
		json.Unmarshal(data, &gotBody)
		w.WriteHeader(http.StatusOK)
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	err := client.UpsertCreditBalance(context.Background(), "user-1", 20, 7)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if gotMethod != http.MethodPatch {
		t.Errorf("method = %q, want PATCH", gotMethod)
	}
	if !strings.Contains(gotPath, "credit_balances") {
		t.Errorf("path %q does not contain credit_balances", gotPath)
	}
	if gotPrefer != "return=minimal" {
		t.Errorf("Prefer = %q, want return=minimal", gotPrefer)
	}
	if gotBody["subscription_credits"] != 20 {
		t.Errorf("subscription_credits = %d, want 20", gotBody["subscription_credits"])
	}
	if gotBody["purchased_credits"] != 7 {
		t.Errorf("purchased_credits = %d, want 7", gotBody["purchased_credits"])
	}
}

// ─── CreateCreditBalance ─────────────────────────────────────────────────────

func TestCreateCreditBalance_SendsCorrectRequest(t *testing.T) {
	var gotMethod, gotPath string
	var gotPrefer string
	var gotBody map[string]interface{}

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assertAuthHeaders(t, r)
		gotMethod = r.Method
		gotPath = r.URL.Path
		gotPrefer = r.Header.Get("Prefer")
		data, _ := io.ReadAll(r.Body)
		json.Unmarshal(data, &gotBody)
		w.WriteHeader(http.StatusCreated)
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	err := client.CreateCreditBalance(context.Background(), "user-2", 3, 0)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if gotMethod != http.MethodPost {
		t.Errorf("method = %q, want POST", gotMethod)
	}
	if !strings.Contains(gotPath, "credit_balances") {
		t.Errorf("path %q does not contain credit_balances", gotPath)
	}
	if gotPrefer != "return=minimal" {
		t.Errorf("Prefer = %q, want return=minimal", gotPrefer)
	}
	if gotBody["user_id"] != "user-2" {
		t.Errorf("user_id = %v, want user-2", gotBody["user_id"])
	}
}

// ─── DeductCredits ───────────────────────────────────────────────────────────

func TestDeductCredits_FromSubFirst(t *testing.T) {
	var upserted map[string]int
	callCount := 0

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		callCount++
		if r.Method == http.MethodGet {
			// GetCreditBalance: 10 sub, 5 purchased
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{{
				"subscription_credits": 10,
				"purchased_credits":    5,
			}})
		} else {
			// UpsertCreditBalance
			data, _ := io.ReadAll(r.Body)
			json.Unmarshal(data, &upserted)
			w.WriteHeader(http.StatusOK)
		}
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	if err := client.DeductCredits(context.Background(), "user-1", 3); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// 3 deducted from sub (10→7), purchased unchanged
	if upserted["subscription_credits"] != 7 {
		t.Errorf("subscription_credits = %d, want 7", upserted["subscription_credits"])
	}
	if upserted["purchased_credits"] != 5 {
		t.Errorf("purchased_credits = %d, want 5", upserted["purchased_credits"])
	}
}

func TestDeductCredits_SpillsIntoPurchased(t *testing.T) {
	var upserted map[string]int

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{{
				"subscription_credits": 2,
				"purchased_credits":    8,
			}})
		} else {
			data, _ := io.ReadAll(r.Body)
			json.Unmarshal(data, &upserted)
			w.WriteHeader(http.StatusOK)
		}
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	if err := client.DeductCredits(context.Background(), "user-1", 5); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// 5 deducted: 2 from sub (→0), 3 from purchased (8→5)
	if upserted["subscription_credits"] != 0 {
		t.Errorf("subscription_credits = %d, want 0", upserted["subscription_credits"])
	}
	if upserted["purchased_credits"] != 5 {
		t.Errorf("purchased_credits = %d, want 5", upserted["purchased_credits"])
	}
}

func TestDeductCredits_InsufficientBalance(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{{
				"subscription_credits": 1,
				"purchased_credits":    0,
			}})
		} else {
			t.Error("DeductCredits should not upsert when balance is insufficient")
			w.WriteHeader(http.StatusOK)
		}
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	err := client.DeductCredits(context.Background(), "user-1", 5)
	if err == nil {
		t.Fatal("expected error for insufficient balance, got nil")
	}
	if !strings.Contains(err.Error(), "insufficient") {
		t.Errorf("error %q should mention insufficient balance", err.Error())
	}
}

// ─── AddPurchasedCredits ─────────────────────────────────────────────────────

func TestAddPurchasedCredits_IncrementsCorrectly(t *testing.T) {
	var upserted map[string]int

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{{
				"subscription_credits": 5,
				"purchased_credits":    3,
			}})
		} else {
			data, _ := io.ReadAll(r.Body)
			json.Unmarshal(data, &upserted)
			w.WriteHeader(http.StatusOK)
		}
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	if err := client.AddPurchasedCredits(context.Background(), "user-1", 10); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if upserted["purchased_credits"] != 13 {
		t.Errorf("purchased_credits = %d, want 13 (3+10)", upserted["purchased_credits"])
	}
	if upserted["subscription_credits"] != 5 {
		t.Errorf("subscription_credits = %d, want 5 (unchanged)", upserted["subscription_credits"])
	}
}

// ─── SetSubscriptionCredits ──────────────────────────────────────────────────

func TestSetSubscriptionCredits_SetsExactValue(t *testing.T) {
	var upserted map[string]int

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			writeJSONResp(w, http.StatusOK, []map[string]interface{}{{
				"subscription_credits": 5,
				"purchased_credits":    7,
			}})
		} else {
			data, _ := io.ReadAll(r.Body)
			json.Unmarshal(data, &upserted)
			w.WriteHeader(http.StatusOK)
		}
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	if err := client.SetSubscriptionCredits(context.Background(), "user-1", 100); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if upserted["subscription_credits"] != 100 {
		t.Errorf("subscription_credits = %d, want 100", upserted["subscription_credits"])
	}
	if upserted["purchased_credits"] != 7 {
		t.Errorf("purchased_credits = %d, want 7 (unchanged)", upserted["purchased_credits"])
	}
}

// ─── RecordCreditTransaction ─────────────────────────────────────────────────

func TestRecordCreditTransaction_SendsCorrectBody(t *testing.T) {
	var gotBody map[string]interface{}

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assertAuthHeaders(t, r)
		if !strings.Contains(r.URL.Path, "credit_transactions") {
			t.Errorf("unexpected path %q", r.URL.Path)
		}
		data, _ := io.ReadAll(r.Body)
		json.Unmarshal(data, &gotBody)
		writeJSONResp(w, http.StatusCreated, []interface{}{gotBody})
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	err := client.RecordCreditTransaction(context.Background(), "user-1", -3, "deduction", "subscription", "ref-42", "metadata cleaning")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if gotBody["user_id"] != "user-1" {
		t.Errorf("user_id = %v, want user-1", gotBody["user_id"])
	}
	if int(gotBody["amount"].(float64)) != -3 {
		t.Errorf("amount = %v, want -3", gotBody["amount"])
	}
	if gotBody["type"] != "deduction" {
		t.Errorf("type = %v, want deduction", gotBody["type"])
	}
	if gotBody["credit_source"] != "subscription" {
		t.Errorf("credit_source = %v, want subscription", gotBody["credit_source"])
	}
	if gotBody["reference_id"] != "ref-42" {
		t.Errorf("reference_id = %v, want ref-42", gotBody["reference_id"])
	}
}

// ─── GetSubscriptionByUserID ─────────────────────────────────────────────────

func TestGetSubscriptionByUserID_Found(t *testing.T) {
	now := time.Now().UTC().Truncate(time.Second)

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assertAuthHeaders(t, r)
		if !strings.Contains(r.URL.Path, "subscriptions") {
			t.Errorf("unexpected path %q", r.URL.Path)
		}
		if !strings.Contains(r.URL.RawQuery, "user_id=eq.user-1") {
			t.Errorf("missing user_id filter, query=%q", r.URL.RawQuery)
		}
		writeJSONResp(w, http.StatusOK, []map[string]interface{}{{
			"id":                      "sub-abc",
			"user_id":                 "user-1",
			"stripe_subscription_id":  "sub_stripe_123",
			"stripe_customer_id":      "cus_123",
			"plan_id":                 "pro",
			"status":                  "active",
			"billing_period":          "monthly",
			"created_at":              now.Format(time.RFC3339),
			"updated_at":              now.Format(time.RFC3339),
		}})
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	sub, err := client.GetSubscriptionByUserID(context.Background(), "user-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if sub == nil {
		t.Fatal("expected non-nil subscription")
	}
	if sub.ID != "sub-abc" {
		t.Errorf("sub.ID = %q, want sub-abc", sub.ID)
	}
	if sub.PlanID != "pro" {
		t.Errorf("sub.PlanID = %q, want pro", sub.PlanID)
	}
	if sub.Status != "active" {
		t.Errorf("sub.Status = %q, want active", sub.Status)
	}
}

func TestGetSubscriptionByUserID_NotFound(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writeJSONResp(w, http.StatusOK, []interface{}{})
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	sub, err := client.GetSubscriptionByUserID(context.Background(), "user-none")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if sub != nil {
		t.Errorf("expected nil subscription, got %+v", sub)
	}
}

// ─── GetSubscriptionByStripeID ───────────────────────────────────────────────

func TestGetSubscriptionByStripeID_Found(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.Contains(r.URL.RawQuery, "stripe_subscription_id=eq.sub_stripe_456") {
			t.Errorf("missing stripe_subscription_id filter, query=%q", r.URL.RawQuery)
		}
		writeJSONResp(w, http.StatusOK, []map[string]interface{}{{
			"id":                     "sub-def",
			"user_id":                "user-2",
			"stripe_subscription_id": "sub_stripe_456",
			"stripe_customer_id":     "cus_456",
			"plan_id":                "basic",
			"status":                 "active",
		}})
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	sub, err := client.GetSubscriptionByStripeID(context.Background(), "sub_stripe_456")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if sub == nil {
		t.Fatal("expected non-nil subscription")
	}
	if sub.StripeSubscriptionID != "sub_stripe_456" {
		t.Errorf("StripeSubscriptionID = %q", sub.StripeSubscriptionID)
	}
}

func TestGetSubscriptionByStripeID_NotFound(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writeJSONResp(w, http.StatusOK, []interface{}{})
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	sub, err := client.GetSubscriptionByStripeID(context.Background(), "sub_none")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if sub != nil {
		t.Errorf("expected nil subscription, got %+v", sub)
	}
}

// ─── CreateSubscription ──────────────────────────────────────────────────────

func TestCreateSubscription_SendsCorrectBody(t *testing.T) {
	var gotBody map[string]interface{}

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assertAuthHeaders(t, r)
		if r.Method != http.MethodPost {
			t.Errorf("method = %q, want POST", r.Method)
		}
		if !strings.Contains(r.URL.Path, "subscriptions") {
			t.Errorf("unexpected path %q", r.URL.Path)
		}
		data, _ := io.ReadAll(r.Body)
		json.Unmarshal(data, &gotBody)
		writeJSONResp(w, http.StatusCreated, []map[string]interface{}{gotBody})
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	sub := &src.Subscription{
		UserID:               "user-3",
		StripeSubscriptionID: "sub_stripe_789",
		StripeCustomerID:     "cus_789",
		PlanID:               "pro",
		Status:               "active",
		BillingPeriod:        "annual",
	}
	if err := client.CreateSubscription(context.Background(), sub); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if gotBody["user_id"] != "user-3" {
		t.Errorf("user_id = %v, want user-3", gotBody["user_id"])
	}
	if gotBody["plan_id"] != "pro" {
		t.Errorf("plan_id = %v, want pro", gotBody["plan_id"])
	}
	if gotBody["billing_period"] != "annual" {
		t.Errorf("billing_period = %v, want annual", gotBody["billing_period"])
	}
}

// ─── UpdateSubscription ──────────────────────────────────────────────────────

func TestUpdateSubscription_SendsCorrectPatch(t *testing.T) {
	var gotBody map[string]interface{}

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assertAuthHeaders(t, r)
		if r.Method != http.MethodPatch {
			t.Errorf("method = %q, want PATCH", r.Method)
		}
		if !strings.Contains(r.URL.RawQuery, "stripe_subscription_id=eq.sub_stripe_abc") {
			t.Errorf("missing stripe_subscription_id filter, query=%q", r.URL.RawQuery)
		}
		data, _ := io.ReadAll(r.Body)
		json.Unmarshal(data, &gotBody)
		w.WriteHeader(http.StatusOK)
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	err := client.UpdateSubscription(context.Background(), "sub_stripe_abc", "canceled", "free", nil, nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if gotBody["status"] != "canceled" {
		t.Errorf("status = %v, want canceled", gotBody["status"])
	}
	if gotBody["plan_id"] != "free" {
		t.Errorf("plan_id = %v, want free", gotBody["plan_id"])
	}
}

// ─── UpdateSubscriptionPlan ──────────────────────────────────────────────────

func TestUpdateSubscriptionPlan_SendsCorrectPatch(t *testing.T) {
	var gotBody map[string]interface{}

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPatch {
			t.Errorf("method = %q, want PATCH", r.Method)
		}
		data, _ := io.ReadAll(r.Body)
		json.Unmarshal(data, &gotBody)
		w.WriteHeader(http.StatusOK)
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	err := client.UpdateSubscriptionPlan(context.Background(), "sub_stripe_xyz", "pro", "monthly", nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if gotBody["plan_id"] != "pro" {
		t.Errorf("plan_id = %v, want pro", gotBody["plan_id"])
	}
	if gotBody["billing_period"] != "monthly" {
		t.Errorf("billing_period = %v, want monthly", gotBody["billing_period"])
	}
}

// ─── SetScheduledDowngrade ───────────────────────────────────────────────────

func TestSetScheduledDowngrade_SendsScheduledFields(t *testing.T) {
	changeDate := time.Date(2026, 8, 1, 0, 0, 0, 0, time.UTC)
	var gotBody map[string]interface{}

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPatch {
			t.Errorf("method = %q, want PATCH", r.Method)
		}
		if !strings.Contains(r.URL.RawQuery, "stripe_subscription_id=eq.sub_xyz") {
			t.Errorf("missing stripe_subscription_id filter, query=%q", r.URL.RawQuery)
		}
		data, _ := io.ReadAll(r.Body)
		json.Unmarshal(data, &gotBody)
		w.WriteHeader(http.StatusOK)
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	err := client.SetScheduledDowngrade(context.Background(), "sub_xyz", "basic", "monthly", &changeDate)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if gotBody["scheduled_plan_id"] != "basic" {
		t.Errorf("scheduled_plan_id = %v, want basic", gotBody["scheduled_plan_id"])
	}
	if gotBody["scheduled_billing_period"] != "monthly" {
		t.Errorf("scheduled_billing_period = %v, want monthly", gotBody["scheduled_billing_period"])
	}
	if gotBody["scheduled_change_date"] == nil {
		t.Error("scheduled_change_date should not be nil")
	}
}

// ─── ClearScheduledDowngrade ─────────────────────────────────────────────────

func TestClearScheduledDowngrade_NullsScheduledFields(t *testing.T) {
	var gotBody map[string]interface{}

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPatch {
			t.Errorf("method = %q, want PATCH", r.Method)
		}
		data, _ := io.ReadAll(r.Body)
		json.Unmarshal(data, &gotBody)
		w.WriteHeader(http.StatusOK)
	}))
	defer srv.Close()

	client := src.NewSupabaseClient(newSupabaseConfig(srv.URL))
	err := client.ClearScheduledDowngrade(context.Background(), "sub_xyz")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	for _, field := range []string{"scheduled_plan_id", "scheduled_billing_period", "scheduled_change_date"} {
		if v, ok := gotBody[field]; !ok || v != nil {
			t.Errorf("expected %q to be null, got %v", field, v)
		}
	}
}
