package source

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

// --- Billing DB types ---

type dbStripeCustomer struct {
	ID               string     `json:"id,omitempty"`
	UserID           string     `json:"user_id"`
	StripeCustomerID string     `json:"stripe_customer_id"`
	CreatedAt        *time.Time `json:"created_at,omitempty"`
}

type dbSubscription struct {
	ID                   string     `json:"id,omitempty"`
	UserID               string     `json:"user_id"`
	StripeSubscriptionID string     `json:"stripe_subscription_id,omitempty"`
	StripeCustomerID     string     `json:"stripe_customer_id"`
	PlanID               string     `json:"plan_id"`
	Status               string     `json:"status"`
	BillingPeriod        string     `json:"billing_period,omitempty"`
	CurrentPeriodStart   *time.Time `json:"current_period_start,omitempty"`
	CurrentPeriodEnd     *time.Time `json:"current_period_end,omitempty"`
	CreatedAt            *time.Time `json:"created_at,omitempty"`
	UpdatedAt            *time.Time `json:"updated_at,omitempty"`
}

// Subscription is the application-level representation of a user subscription.
type Subscription struct {
	ID                   string
	UserID               string
	StripeSubscriptionID string
	StripeCustomerID     string
	PlanID               string
	Status               string
	BillingPeriod        string
	CurrentPeriodStart   *time.Time
	CurrentPeriodEnd     *time.Time
	CreatedAt            time.Time
	UpdatedAt            time.Time
}

// --- Stripe customer operations ---

// GetStripeCustomer returns the Stripe customer ID for a user, or "" if no mapping exists.
func (c *SupabaseClient) GetStripeCustomer(ctx context.Context, userID string) (string, error) {
	var rows []dbStripeCustomer
	url := c.restURL("stripe_customers?user_id=eq." + userID + "&limit=1")
	if err := c.doJSON(ctx, http.MethodGet, url, nil, &rows); err != nil {
		return "", fmt.Errorf("get stripe customer: %w", err)
	}
	if len(rows) == 0 {
		return "", nil
	}
	return rows[0].StripeCustomerID, nil
}

// CreateStripeCustomer stores a new Supabase user → Stripe customer ID mapping.
func (c *SupabaseClient) CreateStripeCustomer(ctx context.Context, userID, stripeCustomerID string) error {
	rec := dbStripeCustomer{
		UserID:           userID,
		StripeCustomerID: stripeCustomerID,
	}
	var rows []dbStripeCustomer
	return c.doJSON(ctx, http.MethodPost, c.restURL("stripe_customers"), rec, &rows)
}

// --- Subscription operations ---

// GetSubscriptionByUserID returns the most recent subscription for a user, or nil if none exists.
func (c *SupabaseClient) GetSubscriptionByUserID(ctx context.Context, userID string) (*Subscription, error) {
	var rows []dbSubscription
	url := c.restURL("subscriptions?user_id=eq." + userID + "&order=created_at.desc&limit=1")
	if err := c.doJSON(ctx, http.MethodGet, url, nil, &rows); err != nil {
		return nil, fmt.Errorf("get subscription: %w", err)
	}
	if len(rows) == 0 {
		return nil, nil
	}
	r := rows[0]
	sub := &Subscription{
		ID:                   r.ID,
		UserID:               r.UserID,
		StripeSubscriptionID: r.StripeSubscriptionID,
		StripeCustomerID:     r.StripeCustomerID,
		PlanID:               r.PlanID,
		Status:               r.Status,
		BillingPeriod:        r.BillingPeriod,
		CurrentPeriodStart:   r.CurrentPeriodStart,
		CurrentPeriodEnd:     r.CurrentPeriodEnd,
	}
	if r.CreatedAt != nil {
		sub.CreatedAt = *r.CreatedAt
	}
	if r.UpdatedAt != nil {
		sub.UpdatedAt = *r.UpdatedAt
	}
	return sub, nil
}

// CreateSubscription inserts a new subscription record.
func (c *SupabaseClient) CreateSubscription(ctx context.Context, sub *Subscription) error {
	rec := dbSubscription{
		UserID:               sub.UserID,
		StripeSubscriptionID: sub.StripeSubscriptionID,
		StripeCustomerID:     sub.StripeCustomerID,
		PlanID:               sub.PlanID,
		Status:               sub.Status,
		BillingPeriod:        sub.BillingPeriod,
		CurrentPeriodStart:   sub.CurrentPeriodStart,
		CurrentPeriodEnd:     sub.CurrentPeriodEnd,
	}
	var rows []dbSubscription
	return c.doJSON(ctx, http.MethodPost, c.restURL("subscriptions"), rec, &rows)
}

// UpdateSubscription patches an existing subscription by its Stripe subscription ID.
func (c *SupabaseClient) UpdateSubscription(ctx context.Context, stripeSubID string, status, planID string, periodStart, periodEnd *time.Time) error {
	patch := map[string]interface{}{
		"status": status,
	}
	if planID != "" {
		patch["plan_id"] = planID
	}
	if periodStart != nil {
		patch["current_period_start"] = periodStart
	}
	if periodEnd != nil {
		patch["current_period_end"] = periodEnd
	}
	url := c.restURL("subscriptions?stripe_subscription_id=eq." + stripeSubID)
	return c.doJSON(ctx, http.MethodPatch, url, patch, nil)
}

// --- Credit balance operations ---

type dbCreditBalance struct {
	UserID              string     `json:"user_id"`
	SubscriptionCredits int        `json:"subscription_credits"`
	PurchasedCredits    int        `json:"purchased_credits"`
	UpdatedAt           *time.Time `json:"updated_at,omitempty"`
}

// GetCreditBalance returns the subscription and purchased credit counts for a user.
// Returns (0, 0, nil) when no credit balance row exists yet.
func (c *SupabaseClient) GetCreditBalance(ctx context.Context, userID string) (subscriptionCredits, purchasedCredits int, err error) {
	var rows []dbCreditBalance
	url := c.restURL("credit_balances?user_id=eq." + userID + "&limit=1")
	if err := c.doJSON(ctx, http.MethodGet, url, nil, &rows); err != nil {
		return 0, 0, fmt.Errorf("get credit balance: %w", err)
	}
	if len(rows) == 0 {
		return 0, 0, nil
	}
	return rows[0].SubscriptionCredits, rows[0].PurchasedCredits, nil
}

// GetSubscriptionByStripeID returns a subscription by its Stripe subscription ID.
func (c *SupabaseClient) GetSubscriptionByStripeID(ctx context.Context, stripeSubID string) (*Subscription, error) {
	var rows []dbSubscription
	url := c.restURL("subscriptions?stripe_subscription_id=eq." + stripeSubID + "&limit=1")
	if err := c.doJSON(ctx, http.MethodGet, url, nil, &rows); err != nil {
		return nil, fmt.Errorf("get subscription by stripe id: %w", err)
	}
	if len(rows) == 0 {
		return nil, nil
	}
	r := rows[0]
	sub := &Subscription{
		ID:                   r.ID,
		UserID:               r.UserID,
		StripeSubscriptionID: r.StripeSubscriptionID,
		StripeCustomerID:     r.StripeCustomerID,
		PlanID:               r.PlanID,
		Status:               r.Status,
		BillingPeriod:        r.BillingPeriod,
		CurrentPeriodStart:   r.CurrentPeriodStart,
		CurrentPeriodEnd:     r.CurrentPeriodEnd,
	}
	if r.CreatedAt != nil {
		sub.CreatedAt = *r.CreatedAt
	}
	if r.UpdatedAt != nil {
		sub.UpdatedAt = *r.UpdatedAt
	}
	return sub, nil
}
