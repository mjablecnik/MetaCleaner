package source

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	stripe "github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/checkout/session"
	stripecustomer "github.com/stripe/stripe-go/v82/customer"
	stripesubscription "github.com/stripe/stripe-go/v82/subscription"
	stripesubschedule "github.com/stripe/stripe-go/v82/subscriptionschedule"
)

const (
	ErrBillingConflict           = "BILLING_CONFLICT"
	ErrBillingInvalidPlan        = "BILLING_INVALID_PLAN"
	ErrBillingStripeError        = "BILLING_STRIPE_ERROR"
	ErrBillingConfigError        = "BILLING_CONFIG_ERROR"
	ErrNoActiveSubscription      = "NO_ACTIVE_SUBSCRIPTION"
	ErrAlreadyCancelled          = "ALREADY_CANCELLED"
	ErrNoCancellingSubscription  = "NO_CANCELLING_SUBSCRIPTION"
)

// planHierarchy defines the upgrade/downgrade ordering for paid plans.
var planHierarchy = map[string]int{
	"free":    0,
	"pro":     1,
	"proplus": 2,
}

// CheckoutRequest is the request body for POST /api/billing/checkout.
type CheckoutRequest struct {
	PlanID        string `json:"plan_id"`
	BillingPeriod string `json:"billing_period"`
}

// CheckoutResponse is the response body for POST /api/billing/checkout.
type CheckoutResponse struct {
	URL       string `json:"url"`
	SessionID string `json:"session_id"`
}

// HandleCreateCheckout handles POST /api/billing/checkout.
// It creates a Stripe Checkout Session for the authenticated user.
func HandleCreateCheckout(cfg Config, db *SupabaseClient, authClient *SupabaseAuthClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		if userID == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "authentication required")
			return
		}

		var req CheckoutRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, ErrInvalidRequest, "invalid request body")
			return
		}

		// Validate plan + billing period and resolve the Stripe Price ID.
		priceID, mode, err := resolvePriceAndMode(cfg, req.PlanID, req.BillingPeriod)
		if err != nil {
			WriteError(w, http.StatusBadRequest, ErrBillingInvalidPlan, err.Error())
			return
		}

		// Reject if user already has an active subscription for the same plan (409 Conflict).
		if mode == string(stripe.CheckoutSessionModeSubscription) {
			existing, err := db.GetSubscriptionByUserID(r.Context(), userID)
			if err != nil {
				slog.Error("billing: failed to check existing subscription", "userID", userID, "error", err)
				WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to check subscription status")
				return
			}
			if existing != nil && existing.Status == "active" && existing.PlanID == req.PlanID {
				WriteError(w, http.StatusConflict, ErrBillingConflict, "you already have an active subscription for this plan")
				return
			}
		}

		if cfg.StripeSecretKey == "" {
			WriteError(w, http.StatusServiceUnavailable, ErrBillingConfigError, "billing is not configured")
			return
		}
		stripe.Key = cfg.StripeSecretKey

		// Get user email from profile (needed when creating a new Stripe customer).
		profile, err := authClient.GetProfile(r.Context(), userID)
		if err != nil || profile == nil {
			slog.Error("billing: failed to get user profile", "userID", userID, "error", err)
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to retrieve user profile")
			return
		}

		// Look up or create a Stripe customer for this user.
		stripeCustomerID, err := getOrCreateStripeCustomer(r.Context(), db, userID, profile.Email)
		if err != nil {
			slog.Error("billing: failed to get/create Stripe customer", "userID", userID, "error", err)
			WriteError(w, http.StatusBadGateway, ErrBillingStripeError, "failed to set up billing customer")
			return
		}

		frontendURL := cfg.FrontendURL
		if frontendURL == "" {
			frontendURL = "http://localhost:5173"
		}

		params := &stripe.CheckoutSessionParams{
			Customer: stripe.String(stripeCustomerID),
			Mode:     stripe.String(mode),
			LineItems: []*stripe.CheckoutSessionLineItemParams{
				{
					Price:    stripe.String(priceID),
					Quantity: stripe.Int64(1),
				},
			},
			SuccessURL: stripe.String(frontendURL + "/subscription/success?session_id={CHECKOUT_SESSION_ID}"),
			CancelURL:  stripe.String(frontendURL + "/subscription"),
			Metadata: map[string]string{
				"user_id":        userID,
				"plan_id":        req.PlanID,
				"billing_period": req.BillingPeriod,
			},
		}

		sess, err := session.New(params)
		if err != nil {
			slog.Error("billing: failed to create Stripe checkout session", "userID", userID, "planID", req.PlanID, "error", err)
			WriteError(w, http.StatusBadGateway, ErrBillingStripeError, "failed to create checkout session")
			return
		}

		slog.Info("billing: checkout session created", "userID", userID, "planID", req.PlanID, "sessionID", sess.ID)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(CheckoutResponse{
			URL:       sess.URL,
			SessionID: sess.ID,
		})
	}
}

// SubscriptionStatusResponse is the response body for GET /api/billing/subscription.
type SubscriptionStatusResponse struct {
	PlanID                 string     `json:"plan_id"`
	Status                 string     `json:"status"`
	BillingPeriod          string     `json:"billing_period,omitempty"`
	CurrentPeriodEnd       *time.Time `json:"current_period_end,omitempty"`
	SubscriptionCredits    int        `json:"subscription_credits"`
	PurchasedCredits       int        `json:"purchased_credits"`
	TotalCredits           int        `json:"total_credits"`
	ScheduledPlanID        *string    `json:"scheduled_plan_id,omitempty"`
	ScheduledBillingPeriod *string    `json:"scheduled_billing_period,omitempty"`
	ScheduledChangeDate    *time.Time `json:"scheduled_change_date,omitempty"`
}

// HandleGetSubscription handles GET /api/billing/subscription.
// It returns the authenticated user's current subscription status and credit balance.
func HandleGetSubscription(db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		if userID == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "authentication required")
			return
		}

		sub, err := db.GetSubscriptionByUserID(r.Context(), userID)
		if err != nil {
			slog.Error("billing: failed to get subscription", "userID", userID, "error", err)
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to retrieve subscription")
			return
		}

		subCredits, purchasedCredits, err := db.GetCreditBalance(r.Context(), userID)
		if err != nil {
			slog.Error("billing: failed to get credit balance", "userID", userID, "error", err)
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to retrieve credit balance")
			return
		}

		resp := SubscriptionStatusResponse{
			SubscriptionCredits: subCredits,
			PurchasedCredits:    purchasedCredits,
			TotalCredits:        subCredits + purchasedCredits,
		}

		if sub == nil || sub.Status == "cancelled" {
			resp.PlanID = "free"
			resp.Status = "free"
		} else {
			resp.PlanID = sub.PlanID
			resp.Status = sub.Status
			resp.BillingPeriod = sub.BillingPeriod
			resp.CurrentPeriodEnd = sub.CurrentPeriodEnd
			resp.ScheduledPlanID = sub.ScheduledPlanID
			resp.ScheduledBillingPeriod = sub.ScheduledBillingPeriod
			resp.ScheduledChangeDate = sub.ScheduledChangeDate
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}
}

// CreditTransactionResponse is the JSON representation of a single credit transaction.
type CreditTransactionResponse struct {
	ID           string    `json:"id"`
	Amount       int       `json:"amount"`
	Type         string    `json:"type"`
	CreditSource string    `json:"credit_source"`
	ReferenceID  string    `json:"reference_id,omitempty"`
	Description  string    `json:"description,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}

// CreditsResponse is the response body for GET /api/billing/credits.
type CreditsResponse struct {
	SubscriptionCredits int                          `json:"subscription_credits"`
	PurchasedCredits    int                          `json:"purchased_credits"`
	TotalCredits        int                          `json:"total_credits"`
	Transactions        []CreditTransactionResponse  `json:"transactions"`
}

// HandleGetCredits handles GET /api/billing/credits.
// It returns the authenticated user's credit balances and the last 50 transactions.
func HandleGetCredits(db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		if userID == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "authentication required")
			return
		}

		subCredits, purchasedCredits, err := db.GetCreditBalance(r.Context(), userID)
		if err != nil {
			slog.Error("billing: failed to get credit balance", "userID", userID, "error", err)
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to retrieve credit balance")
			return
		}

		txs, err := db.GetCreditTransactions(r.Context(), userID, 50)
		if err != nil {
			slog.Error("billing: failed to get credit transactions", "userID", userID, "error", err)
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to retrieve credit transactions")
			return
		}

		txResponses := make([]CreditTransactionResponse, len(txs))
		for i, tx := range txs {
			txResponses[i] = CreditTransactionResponse{
				ID:           tx.ID,
				Amount:       tx.Amount,
				Type:         tx.Type,
				CreditSource: tx.CreditSource,
				ReferenceID:  tx.ReferenceID,
				Description:  tx.Description,
				CreatedAt:    tx.CreatedAt,
			}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(CreditsResponse{
			SubscriptionCredits: subCredits,
			PurchasedCredits:    purchasedCredits,
			TotalCredits:        subCredits + purchasedCredits,
			Transactions:        txResponses,
		})
	}
}

// resolvePriceAndMode maps a plan ID + billing period to a Stripe Price ID and checkout mode.
func resolvePriceAndMode(cfg Config, planID, billingPeriod string) (priceID, mode string, err error) {
	switch planID {
	case "pro":
		switch billingPeriod {
		case "monthly":
			if cfg.StripePriceProMonth == "" {
				return "", "", fmt.Errorf("Stripe price for pro monthly is not configured")
			}
			return cfg.StripePriceProMonth, string(stripe.CheckoutSessionModeSubscription), nil
		case "yearly":
			if cfg.StripePriceProYear == "" {
				return "", "", fmt.Errorf("Stripe price for pro yearly is not configured")
			}
			return cfg.StripePriceProYear, string(stripe.CheckoutSessionModeSubscription), nil
		default:
			return "", "", fmt.Errorf("billing_period must be monthly or yearly for plan %q", planID)
		}
	case "proplus":
		switch billingPeriod {
		case "monthly":
			if cfg.StripePriceProPlusMonth == "" {
				return "", "", fmt.Errorf("Stripe price for pro+ monthly is not configured")
			}
			return cfg.StripePriceProPlusMonth, string(stripe.CheckoutSessionModeSubscription), nil
		case "yearly":
			if cfg.StripePriceProPlusYear == "" {
				return "", "", fmt.Errorf("Stripe price for pro+ yearly is not configured")
			}
			return cfg.StripePriceProPlusYear, string(stripe.CheckoutSessionModeSubscription), nil
		default:
			return "", "", fmt.Errorf("billing_period must be monthly or yearly for plan %q", planID)
		}
	case "credits":
		if cfg.StripePriceCreditPack == "" {
			return "", "", fmt.Errorf("Stripe price for credit pack is not configured")
		}
		return cfg.StripePriceCreditPack, string(stripe.CheckoutSessionModePayment), nil
	default:
		return "", "", fmt.Errorf("unknown plan_id %q: must be pro, proplus, or credits", planID)
	}
}

// ChangePlanRequest is the request body for POST /api/billing/change-plan.
type ChangePlanRequest struct {
	PlanID        string `json:"plan_id"`
	BillingPeriod string `json:"billing_period"`
}

// ChangePlanResponse is the response body for POST /api/billing/change-plan.
type ChangePlanResponse struct {
	PlanID              string  `json:"plan_id"`
	BillingPeriod       string  `json:"billing_period"`
	Status              string  `json:"status"`
	CurrentPeriodEnd    string  `json:"current_period_end"`
	ProratedAmount      *int64  `json:"prorated_amount,omitempty"`
	ScheduledChangeDate *string `json:"scheduled_change_date,omitempty"`
}

// CancelResponse is the response body for POST /api/billing/cancel.
type CancelResponse struct {
	CurrentPeriodEnd string `json:"current_period_end"`
}

// HandleChangePlan handles POST /api/billing/change-plan.
// It upgrades or downgrades the authenticated user's subscription plan via Stripe.
func HandleChangePlan(cfg Config, db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		if userID == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "authentication required")
			return
		}

		var req ChangePlanRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, ErrBillingInvalidPlan, "invalid request body")
			return
		}

		if req.PlanID == "" || req.BillingPeriod == "" {
			WriteError(w, http.StatusBadRequest, ErrBillingInvalidPlan, "plan_id and billing_period are required")
			return
		}
		if req.PlanID != "pro" && req.PlanID != "proplus" {
			WriteError(w, http.StatusBadRequest, ErrBillingInvalidPlan, "plan_id must be pro or proplus")
			return
		}
		if req.BillingPeriod != "monthly" && req.BillingPeriod != "yearly" {
			WriteError(w, http.StatusBadRequest, ErrBillingInvalidPlan, "billing_period must be monthly or yearly")
			return
		}

		existing, err := db.GetSubscriptionByUserID(r.Context(), userID)
		if err != nil {
			slog.Error("billing: change-plan: failed to get subscription", "userID", userID, "error", err)
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to retrieve subscription")
			return
		}
		if existing == nil || (existing.Status != "active" && existing.Status != "trialing") {
			WriteError(w, http.StatusBadRequest, ErrNoActiveSubscription, "no active subscription found")
			return
		}
		if existing.PlanID == req.PlanID && existing.BillingPeriod == req.BillingPeriod {
			WriteError(w, http.StatusConflict, ErrBillingConflict, "subscription is already on this plan and billing period")
			return
		}
		if existing.StripeSubscriptionID == "" {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "subscription has no Stripe ID")
			return
		}

		if cfg.StripeSecretKey == "" {
			WriteError(w, http.StatusServiceUnavailable, ErrBillingConfigError, "billing is not configured")
			return
		}
		stripe.Key = cfg.StripeSecretKey

		newPriceID, _, err := resolvePriceAndMode(cfg, req.PlanID, req.BillingPeriod)
		if err != nil {
			WriteError(w, http.StatusBadRequest, ErrBillingInvalidPlan, err.Error())
			return
		}

		targetRank := planHierarchy[req.PlanID]
		currentRank := planHierarchy[existing.PlanID]

		var respData ChangePlanResponse
		if targetRank >= currentRank {
			respData, err = changePlanUpgrade(r.Context(), db, existing, req.PlanID, req.BillingPeriod, newPriceID)
		} else {
			respData, err = changePlanDowngrade(r.Context(), cfg, db, existing, req.PlanID, req.BillingPeriod, newPriceID)
		}
		if err != nil {
			slog.Error("billing: change-plan failed", "userID", userID, "planID", req.PlanID, "error", err)
			WriteError(w, http.StatusBadGateway, ErrBillingStripeError, "plan change could not be processed")
			return
		}

		slog.Info("billing: plan changed", "userID", userID, "newPlanID", req.PlanID, "billingPeriod", req.BillingPeriod)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(respData)
	}
}

// changePlanUpgrade performs an immediate plan upgrade with proration via Stripe.
func changePlanUpgrade(ctx context.Context, db *SupabaseClient, existing *Subscription, planID, billingPeriod, newPriceID string) (ChangePlanResponse, error) {
	// Fetch current Stripe subscription to get item ID.
	getParams := &stripe.SubscriptionParams{}
	getParams.AddExpand("items")
	stripeSub, err := stripesubscription.Get(existing.StripeSubscriptionID, getParams)
	if err != nil {
		return ChangePlanResponse{}, fmt.Errorf("fetch stripe subscription: %w", err)
	}

	var itemID string
	if stripeSub.Items != nil && len(stripeSub.Items.Data) > 0 {
		itemID = stripeSub.Items.Data[0].ID
	}

	// Update subscription with new price and immediate proration.
	updateParams := &stripe.SubscriptionParams{
		Items: []*stripe.SubscriptionItemsParams{
			{
				ID:    stripe.String(itemID),
				Price: stripe.String(newPriceID),
			},
		},
		ProrationBehavior: stripe.String("always_invoice"),
	}
	updateParams.AddExpand("latest_invoice")

	updatedSub, err := stripesubscription.Update(existing.StripeSubscriptionID, updateParams)
	if err != nil {
		return ChangePlanResponse{}, fmt.Errorf("update stripe subscription: %w", err)
	}

	// Extract prorated amount from the invoice created by the upgrade.
	var proratedAmount *int64
	if updatedSub.LatestInvoice != nil {
		amount := updatedSub.LatestInvoice.Total
		proratedAmount = &amount
	}

	// Extract new period end from subscription items.
	var periodEnd *time.Time
	if updatedSub.Items != nil {
		for _, item := range updatedSub.Items.Data {
			if item.CurrentPeriodEnd != 0 {
				t := time.Unix(item.CurrentPeriodEnd, 0)
				periodEnd = &t
			}
			break
		}
	}

	if err := db.UpdateSubscriptionPlan(ctx, existing.StripeSubscriptionID, planID, billingPeriod, periodEnd); err != nil {
		return ChangePlanResponse{}, fmt.Errorf("update subscription in DB: %w", err)
	}

	// If there was a pending downgrade schedule, clear it since we're upgrading now.
	if existing.ScheduledPlanID != nil {
		if err := db.ClearScheduledDowngrade(ctx, existing.StripeSubscriptionID); err != nil {
			slog.Warn("billing: failed to clear scheduled downgrade on upgrade", "error", err)
		}
	}

	// Adjust credits: grant the new plan's allowance minus what was already consumed this cycle.
	oldAllowance := getCreditAllowance(existing.PlanID)
	newAllowance := getCreditAllowance(planID)

	currentSubCredits, _, err := db.GetCreditBalance(ctx, existing.UserID)
	if err != nil {
		return ChangePlanResponse{}, fmt.Errorf("get credit balance for upgrade: %w", err)
	}

	// consumed = what was used from the old plan's allowance this period
	consumed := oldAllowance - currentSubCredits
	if consumed < 0 {
		consumed = 0
	}

	// New credits = new allowance minus already consumed this period
	newCredits := newAllowance - consumed
	if newCredits < 0 {
		newCredits = 0
	}

	if err := db.SetSubscriptionCredits(ctx, existing.UserID, newCredits); err != nil {
		return ChangePlanResponse{}, fmt.Errorf("set upgraded credits: %w", err)
	}

	creditDelta := newCredits - currentSubCredits
	if creditDelta != 0 {
		if err := db.RecordCreditTransaction(ctx, existing.UserID, creditDelta, "subscription_renewal", "subscription", existing.StripeSubscriptionID, fmt.Sprintf("Plan upgrade: %s → %s", existing.PlanID, planID)); err != nil {
			slog.Warn("billing: failed to record upgrade credit transaction", "userID", existing.UserID, "error", err)
		}
	}

	slog.Info("billing: credits adjusted after upgrade", "userID", existing.UserID, "oldPlan", existing.PlanID, "newPlan", planID, "consumed", consumed, "newCredits", newCredits)

	var periodEndStr string
	if periodEnd != nil {
		periodEndStr = periodEnd.UTC().Format(time.RFC3339)
	}

	return ChangePlanResponse{
		PlanID:           planID,
		BillingPeriod:    billingPeriod,
		Status:           "active",
		CurrentPeriodEnd: periodEndStr,
		ProratedAmount:   proratedAmount,
	}, nil
}

// changePlanDowngrade schedules a plan downgrade at the end of the current billing period via a Stripe SubscriptionSchedule.
func changePlanDowngrade(ctx context.Context, cfg Config, db *SupabaseClient, existing *Subscription, planID, billingPeriod, newPriceID string) (ChangePlanResponse, error) {
	if existing.CurrentPeriodEnd == nil {
		return ChangePlanResponse{}, fmt.Errorf("subscription has no current_period_end")
	}

	// Resolve the existing plan's price ID for phase 1 of the schedule.
	existingPriceID, _, err := resolvePriceAndMode(cfg, existing.PlanID, existing.BillingPeriod)
	if err != nil {
		return ChangePlanResponse{}, fmt.Errorf("resolve existing price: %w", err)
	}

	// Step 1: If subscription already has an attached schedule, release it first.
	getParams := &stripe.SubscriptionParams{}
	getParams.AddExpand("schedule")
	stripeSub, err := stripesubscription.Get(existing.StripeSubscriptionID, getParams)
	if err != nil {
		return ChangePlanResponse{}, fmt.Errorf("fetch stripe subscription for schedule check: %w", err)
	}
	if stripeSub.Schedule != nil && stripeSub.Schedule.ID != "" {
		releaseParams := &stripe.SubscriptionScheduleReleaseParams{}
		if _, err := stripesubschedule.Release(stripeSub.Schedule.ID, releaseParams); err != nil {
			slog.Warn("billing: failed to release existing schedule, attempting to proceed", "scheduleID", stripeSub.Schedule.ID, "error", err)
		}
	}

	// Step 2: Create schedule from existing subscription (cannot set phases in the same call).
	createParams := &stripe.SubscriptionScheduleParams{
		FromSubscription: stripe.String(existing.StripeSubscriptionID),
	}
	schedule, err := stripesubschedule.New(createParams)
	if err != nil {
		return ChangePlanResponse{}, fmt.Errorf("create stripe subscription schedule: %w", err)
	}

	// Step 2: Update the schedule with desired phases (current plan until period end, then new plan).
	periodEndUnix := existing.CurrentPeriodEnd.Unix()

	// Phase 1 start date comes from the schedule's current phase.
	var phase1Start *int64
	if len(schedule.Phases) > 0 {
		phase1Start = &schedule.Phases[0].StartDate
	}

	updateParams := &stripe.SubscriptionScheduleParams{
		EndBehavior: stripe.String("release"),
		Phases: []*stripe.SubscriptionSchedulePhaseParams{
			{
				// Phase 1: retain current plan for remaining billing period.
				Items: []*stripe.SubscriptionSchedulePhaseItemParams{
					{Price: stripe.String(existingPriceID), Quantity: stripe.Int64(1)},
				},
				StartDate: phase1Start,
				EndDate:   &periodEndUnix,
			},
			{
				// Phase 2: switch to new plan at period end, no proration.
				Items: []*stripe.SubscriptionSchedulePhaseItemParams{
					{Price: stripe.String(newPriceID), Quantity: stripe.Int64(1)},
				},
				ProrationBehavior: stripe.String("none"),
			},
		},
	}

	if _, err := stripesubschedule.Update(schedule.ID, updateParams); err != nil {
		return ChangePlanResponse{}, fmt.Errorf("update stripe subscription schedule phases: %w", err)
	}

	// Persist the scheduled downgrade in DB so the UI can display it.
	scheduledDate := existing.CurrentPeriodEnd.UTC()
	if err := db.SetScheduledDowngrade(ctx, existing.StripeSubscriptionID, planID, billingPeriod, &scheduledDate); err != nil {
		slog.Error("billing: failed to persist scheduled downgrade", "error", err)
		// Non-fatal — the Stripe schedule was created successfully, so we return success.
	}

	// DB update for downgrade is handled by the webhook when the schedule executes.
	scheduledDateStr := scheduledDate.Format(time.RFC3339)

	return ChangePlanResponse{
		PlanID:              planID,
		BillingPeriod:       billingPeriod,
		Status:              "active",
		CurrentPeriodEnd:    scheduledDateStr,
		ScheduledChangeDate: &scheduledDateStr,
	}, nil
}

// HandleCancelSubscription handles POST /api/billing/cancel.
// It sets cancel_at_period_end on the Stripe subscription and marks the DB status as "cancelling".
func HandleCancelSubscription(cfg Config, db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		if userID == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "authentication required")
			return
		}

		existing, err := db.GetSubscriptionByUserID(r.Context(), userID)
		if err != nil {
			slog.Error("billing: cancel: failed to get subscription", "userID", userID, "error", err)
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to retrieve subscription")
			return
		}

		if existing == nil || (existing.Status != "active" && existing.Status != "trialing" && existing.Status != "cancelling") {
			WriteError(w, http.StatusBadRequest, ErrNoActiveSubscription, "no active subscription found")
			return
		}
		if existing.Status == "cancelling" {
			WriteError(w, http.StatusBadRequest, ErrAlreadyCancelled, "subscription is already scheduled for cancellation")
			return
		}
		if existing.StripeSubscriptionID == "" {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "subscription has no Stripe ID")
			return
		}

		if cfg.StripeSecretKey == "" {
			WriteError(w, http.StatusServiceUnavailable, ErrBillingConfigError, "billing is not configured")
			return
		}
		stripe.Key = cfg.StripeSecretKey

		params := &stripe.SubscriptionParams{
			CancelAtPeriodEnd: stripe.Bool(true),
		}
		updatedSub, err := stripesubscription.Update(existing.StripeSubscriptionID, params)
		if err != nil {
			slog.Error("billing: cancel: stripe update failed", "userID", userID, "subID", existing.StripeSubscriptionID, "error", err)
			WriteError(w, http.StatusBadGateway, ErrBillingStripeError, "cancellation could not be processed")
			return
		}

		// Extract current_period_end from updated subscription items.
		var periodEnd *time.Time
		if updatedSub.Items != nil {
			for _, item := range updatedSub.Items.Data {
				if item.CurrentPeriodEnd != 0 {
					t := time.Unix(item.CurrentPeriodEnd, 0)
					periodEnd = &t
				}
				break
			}
		}
		if periodEnd == nil {
			periodEnd = existing.CurrentPeriodEnd
		}

		if err := db.UpdateSubscription(r.Context(), existing.StripeSubscriptionID, "cancelling", "", nil, periodEnd); err != nil {
			slog.Error("billing: cancel: failed to update subscription status", "userID", userID, "error", err)
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to update subscription status")
			return
		}

		var periodEndStr string
		if periodEnd != nil {
			periodEndStr = periodEnd.UTC().Format(time.RFC3339)
		}

		slog.Info("billing: subscription cancelled at period end", "userID", userID, "subID", existing.StripeSubscriptionID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(CancelResponse{CurrentPeriodEnd: periodEndStr})
	}
}

// ReactivateResponse is the response body for POST /api/billing/reactivate.
type ReactivateResponse struct {
	PlanID           string `json:"plan_id"`
	Status           string `json:"status"`
	CurrentPeriodEnd string `json:"current_period_end"`
}

// HandleReactivateSubscription handles POST /api/billing/reactivate.
// It reverses a cancellation by setting cancel_at_period_end: false on Stripe.
func HandleReactivateSubscription(cfg Config, db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		if userID == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "authentication required")
			return
		}

		existing, err := db.GetSubscriptionByUserID(r.Context(), userID)
		if err != nil {
			slog.Error("billing: reactivate: failed to get subscription", "userID", userID, "error", err)
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to retrieve subscription")
			return
		}

		if existing == nil || existing.Status != "cancelling" {
			WriteError(w, http.StatusBadRequest, ErrNoCancellingSubscription, "no cancelling subscription found")
			return
		}
		if existing.StripeSubscriptionID == "" {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "subscription has no Stripe ID")
			return
		}

		if cfg.StripeSecretKey == "" {
			WriteError(w, http.StatusServiceUnavailable, ErrBillingConfigError, "billing is not configured")
			return
		}
		stripe.Key = cfg.StripeSecretKey

		params := &stripe.SubscriptionParams{
			CancelAtPeriodEnd: stripe.Bool(false),
		}
		updatedSub, err := stripesubscription.Update(existing.StripeSubscriptionID, params)
		if err != nil {
			slog.Error("billing: reactivate: stripe update failed", "userID", userID, "subID", existing.StripeSubscriptionID, "error", err)
			WriteError(w, http.StatusBadGateway, ErrBillingStripeError, "reactivation could not be processed")
			return
		}

		// Extract current_period_end from updated subscription items.
		var periodEnd *time.Time
		if updatedSub.Items != nil {
			for _, item := range updatedSub.Items.Data {
				if item.CurrentPeriodEnd != 0 {
					t := time.Unix(item.CurrentPeriodEnd, 0)
					periodEnd = &t
				}
				break
			}
		}
		if periodEnd == nil {
			periodEnd = existing.CurrentPeriodEnd
		}

		if err := db.UpdateSubscription(r.Context(), existing.StripeSubscriptionID, "active", "", nil, nil); err != nil {
			slog.Error("billing: reactivate: failed to update subscription status", "userID", userID, "error", err)
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to update subscription status")
			return
		}

		var periodEndStr string
		if periodEnd != nil {
			periodEndStr = periodEnd.UTC().Format(time.RFC3339)
		}

		slog.Info("billing: subscription reactivated", "userID", userID, "subID", existing.StripeSubscriptionID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(ReactivateResponse{
			PlanID:           existing.PlanID,
			Status:           "active",
			CurrentPeriodEnd: periodEndStr,
		})
	}
}

// getOrCreateStripeCustomer returns the Stripe customer ID for the user, creating one if needed.
func getOrCreateStripeCustomer(ctx context.Context, db *SupabaseClient, userID, email string) (string, error) {
	existing, err := db.GetStripeCustomer(ctx, userID)
	if err != nil {
		return "", fmt.Errorf("lookup customer: %w", err)
	}
	if existing != "" {
		// Validate that the customer still exists in Stripe.
		cust, err := stripecustomer.Get(existing, nil)
		if err != nil {
			// Any error from Stripe means the customer is not usable — recreate.
			slog.Warn("billing: stale Stripe customer (API error), recreating", "userID", userID, "oldCustomerID", existing, "error", err)
			if delErr := db.DeleteStripeCustomer(ctx, userID); delErr != nil {
				return "", fmt.Errorf("remove stale customer mapping: %w", delErr)
			}
		} else if cust.Deleted {
			// Customer exists but was soft-deleted in Stripe.
			slog.Warn("billing: stale Stripe customer (deleted), recreating", "userID", userID, "oldCustomerID", existing)
			if delErr := db.DeleteStripeCustomer(ctx, userID); delErr != nil {
				return "", fmt.Errorf("remove stale customer mapping: %w", delErr)
			}
		} else {
			return existing, nil
		}
	}

	params := &stripe.CustomerParams{
		Email: stripe.String(email),
		Metadata: map[string]string{
			"user_id": userID,
		},
	}
	c, err := stripecustomer.New(params)
	if err != nil {
		return "", fmt.Errorf("create Stripe customer: %w", err)
	}

	if err := db.CreateStripeCustomer(ctx, userID, c.ID); err != nil {
		return "", fmt.Errorf("store customer mapping: %w", err)
	}

	slog.Info("billing: created Stripe customer", "userID", userID, "stripeCustomerID", c.ID)
	return c.ID, nil
}
