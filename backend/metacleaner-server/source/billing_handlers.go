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
)

const (
	ErrBillingConflict    = "BILLING_CONFLICT"
	ErrBillingInvalidPlan = "BILLING_INVALID_PLAN"
	ErrBillingStripeError = "BILLING_STRIPE_ERROR"
	ErrBillingConfigError = "BILLING_CONFIG_ERROR"
)

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
			SuccessURL: stripe.String(frontendURL + "/pricing/success?session_id={CHECKOUT_SESSION_ID}"),
			CancelURL:  stripe.String(frontendURL + "/pricing"),
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
	PlanID              string     `json:"plan_id"`
	Status              string     `json:"status"`
	BillingPeriod       string     `json:"billing_period,omitempty"`
	CurrentPeriodEnd    *time.Time `json:"current_period_end,omitempty"`
	SubscriptionCredits int        `json:"subscription_credits"`
	PurchasedCredits    int        `json:"purchased_credits"`
	TotalCredits        int        `json:"total_credits"`
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

// getOrCreateStripeCustomer returns the Stripe customer ID for the user, creating one if needed.
func getOrCreateStripeCustomer(ctx context.Context, db *SupabaseClient, userID, email string) (string, error) {
	existing, err := db.GetStripeCustomer(ctx, userID)
	if err != nil {
		return "", fmt.Errorf("lookup customer: %w", err)
	}
	if existing != "" {
		return existing, nil
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
