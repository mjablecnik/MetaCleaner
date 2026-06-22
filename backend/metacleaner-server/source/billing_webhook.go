package source

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"time"

	stripe "github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/webhook"
)

const maxWebhookBodyBytes = 65536 // 64 KB — Stripe events are never larger

// HandleStripeWebhook handles POST /api/billing/webhook.
// It verifies the Stripe signature and dispatches to the appropriate event handler.
func HandleStripeWebhook(cfg Config, db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if cfg.StripeWebhookSecret == "" {
			slog.Error("webhook: STRIPE_WEBHOOK_SECRET not configured")
			WriteError(w, http.StatusServiceUnavailable, ErrBillingConfigError, "webhook is not configured")
			return
		}

		body, err := io.ReadAll(io.LimitReader(r.Body, maxWebhookBodyBytes))
		if err != nil {
			WriteError(w, http.StatusBadRequest, ErrInvalidRequest, "failed to read request body")
			return
		}

		sig := r.Header.Get("Stripe-Signature")
		event, err := webhook.ConstructEvent(body, sig, cfg.StripeWebhookSecret)
		if err != nil {
			slog.Warn("webhook: signature verification failed", "error", err)
			WriteError(w, http.StatusBadRequest, ErrInvalidRequest, "invalid webhook signature")
			return
		}

		slog.Info("webhook: received event", "type", event.Type, "id", event.ID)

		ctx := r.Context()

		switch event.Type {
		case "checkout.session.completed":
			var sess stripe.CheckoutSession
			if err := json.Unmarshal(event.Data.Raw, &sess); err != nil {
				slog.Error("webhook: failed to parse checkout.session.completed", "error", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			if err := handleCheckoutSessionCompleted(ctx, db, &sess); err != nil {
				slog.Error("webhook: checkout.session.completed handler error", "sessionID", sess.ID, "error", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

		case "customer.subscription.updated":
			var sub stripe.Subscription
			if err := json.Unmarshal(event.Data.Raw, &sub); err != nil {
				slog.Error("webhook: failed to parse customer.subscription.updated", "error", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			if err := handleSubscriptionUpdated(ctx, db, &sub); err != nil {
				slog.Error("webhook: customer.subscription.updated handler error", "subID", sub.ID, "error", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

		case "customer.subscription.deleted":
			var sub stripe.Subscription
			if err := json.Unmarshal(event.Data.Raw, &sub); err != nil {
				slog.Error("webhook: failed to parse customer.subscription.deleted", "error", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			if err := handleSubscriptionDeleted(ctx, db, &sub); err != nil {
				slog.Error("webhook: customer.subscription.deleted handler error", "subID", sub.ID, "error", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

		case "invoice.paid":
			var inv stripe.Invoice
			if err := json.Unmarshal(event.Data.Raw, &inv); err != nil {
				slog.Error("webhook: failed to parse invoice.paid", "error", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			if err := handleInvoicePaid(ctx, db, &inv); err != nil {
				slog.Error("webhook: invoice.paid handler error", "invoiceID", inv.ID, "error", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

		case "invoice.payment_failed":
			var inv stripe.Invoice
			if err := json.Unmarshal(event.Data.Raw, &inv); err != nil {
				slog.Error("webhook: failed to parse invoice.payment_failed", "error", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			if err := handleInvoicePaymentFailed(ctx, db, &inv); err != nil {
				slog.Error("webhook: invoice.payment_failed handler error", "invoiceID", inv.ID, "error", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

		default:
			slog.Info("webhook: unhandled event type", "type", event.Type)
		}

		w.WriteHeader(http.StatusOK)
	}
}

func handleCheckoutSessionCompleted(ctx context.Context, db *SupabaseClient, sess *stripe.CheckoutSession) error {
	if sess.Mode == stripe.CheckoutSessionModePayment {
		userID := sess.Metadata["user_id"]
		if userID == "" {
			slog.Warn("webhook: checkout.session.completed (payment) missing user_id metadata", "sessionID", sess.ID)
			return nil
		}
		if err := db.AddPurchasedCredits(ctx, userID, 50); err != nil {
			return fmt.Errorf("credit pack purchase: add credits: %w", err)
		}
		if err := db.RecordCreditTransaction(ctx, userID, 50, "purchase", "purchased", sess.ID, "Credit pack purchase"); err != nil {
			return fmt.Errorf("credit pack purchase: record transaction: %w", err)
		}
		slog.Info("webhook: credit pack purchased", "userID", userID, "sessionID", sess.ID)
		return nil
	}

	if sess.Mode != stripe.CheckoutSessionModeSubscription {
		slog.Info("webhook: checkout completed in unsupported mode, skipping", "mode", sess.Mode, "sessionID", sess.ID)
		return nil
	}

	userID := sess.Metadata["user_id"]
	planID := sess.Metadata["plan_id"]
	billingPeriod := sess.Metadata["billing_period"]

	if userID == "" || planID == "" {
		slog.Warn("webhook: checkout.session.completed missing metadata", "sessionID", sess.ID)
		return nil
	}

	var stripeSubID string
	if sess.Subscription != nil {
		stripeSubID = sess.Subscription.ID
	}

	var stripeCustomerID string
	if sess.Customer != nil {
		stripeCustomerID = sess.Customer.ID
	}

	// Extract period dates from the first subscription item (where stripe-go v82 stores them).
	var periodStart, periodEnd *time.Time
	if sess.Subscription != nil && sess.Subscription.Items != nil {
		for _, item := range sess.Subscription.Items.Data {
			if item.CurrentPeriodStart != 0 {
				t := time.Unix(item.CurrentPeriodStart, 0)
				periodStart = &t
			}
			if item.CurrentPeriodEnd != 0 {
				t := time.Unix(item.CurrentPeriodEnd, 0)
				periodEnd = &t
			}
			break
		}
	}

	sub := &Subscription{
		UserID:               userID,
		StripeSubscriptionID: stripeSubID,
		StripeCustomerID:     stripeCustomerID,
		PlanID:               planID,
		Status:               "active",
		BillingPeriod:        billingPeriod,
		CurrentPeriodStart:   periodStart,
		CurrentPeriodEnd:     periodEnd,
	}

	if err := db.CreateSubscription(ctx, sub); err != nil {
		return err
	}

	if err := db.SetSubscriptionCredits(ctx, userID, 100); err != nil {
		return fmt.Errorf("subscription activation: set credits: %w", err)
	}
	if err := db.RecordCreditTransaction(ctx, userID, 100, "subscription_renewal", "subscription", stripeSubID, "Subscription activated"); err != nil {
		return fmt.Errorf("subscription activation: record transaction: %w", err)
	}

	slog.Info("webhook: subscription activated", "userID", userID, "planID", planID, "stripeSubID", stripeSubID)
	return nil
}

func handleSubscriptionUpdated(ctx context.Context, db *SupabaseClient, sub *stripe.Subscription) error {
	status := string(sub.Status)

	// In stripe-go v82, period dates are on subscription items.
	var periodStart, periodEnd *time.Time
	if sub.Items != nil {
		for _, item := range sub.Items.Data {
			if item.CurrentPeriodStart != 0 {
				t := time.Unix(item.CurrentPeriodStart, 0)
				periodStart = &t
			}
			if item.CurrentPeriodEnd != 0 {
				t := time.Unix(item.CurrentPeriodEnd, 0)
				periodEnd = &t
			}
			break
		}
	}

	if err := db.UpdateSubscription(ctx, sub.ID, status, "", periodStart, periodEnd); err != nil {
		return err
	}

	slog.Info("webhook: subscription updated", "stripeSubID", sub.ID, "status", status)
	return nil
}

func handleSubscriptionDeleted(ctx context.Context, db *SupabaseClient, sub *stripe.Subscription) error {
	if err := db.UpdateSubscription(ctx, sub.ID, "cancelled", "", nil, nil); err != nil {
		return err
	}

	slog.Info("webhook: subscription cancelled", "stripeSubID", sub.ID)
	return nil
}

func handleInvoicePaid(ctx context.Context, db *SupabaseClient, inv *stripe.Invoice) error {
	// Skip the initial subscription invoice — credits are granted by handleCheckoutSessionCompleted.
	if inv.BillingReason == stripe.InvoiceBillingReasonSubscriptionCreate {
		slog.Info("webhook: invoice.paid is initial subscription invoice, skipping", "invoiceID", inv.ID)
		return nil
	}

	var stripeSubID string
	if inv.Parent != nil && inv.Parent.SubscriptionDetails != nil && inv.Parent.SubscriptionDetails.Subscription != nil {
		stripeSubID = inv.Parent.SubscriptionDetails.Subscription.ID
	}
	if stripeSubID == "" {
		slog.Warn("webhook: invoice.paid has no subscription, skipping", "invoiceID", inv.ID)
		return nil
	}

	sub, err := db.GetSubscriptionByStripeID(ctx, stripeSubID)
	if err != nil {
		return fmt.Errorf("invoice paid: lookup subscription: %w", err)
	}
	if sub == nil {
		slog.Warn("webhook: invoice.paid subscription not found in DB, skipping", "stripeSubID", stripeSubID)
		return nil
	}

	if err := db.SetSubscriptionCredits(ctx, sub.UserID, 100); err != nil {
		return fmt.Errorf("invoice paid: set subscription credits: %w", err)
	}
	if err := db.RecordCreditTransaction(ctx, sub.UserID, 100, "subscription_renewal", "subscription", stripeSubID, "Subscription renewed"); err != nil {
		return fmt.Errorf("invoice paid: record transaction: %w", err)
	}

	slog.Info("webhook: subscription credits renewed", "userID", sub.UserID, "stripeSubID", stripeSubID, "invoiceID", inv.ID)
	return nil
}

func handleInvoicePaymentFailed(ctx context.Context, db *SupabaseClient, inv *stripe.Invoice) error {
	// In stripe-go v82, subscription info is under Parent.SubscriptionDetails.
	var stripeSubID string
	if inv.Parent != nil && inv.Parent.SubscriptionDetails != nil && inv.Parent.SubscriptionDetails.Subscription != nil {
		stripeSubID = inv.Parent.SubscriptionDetails.Subscription.ID
	}
	if stripeSubID == "" {
		slog.Warn("webhook: invoice.payment_failed has no subscription", "invoiceID", inv.ID)
		return nil
	}

	if err := db.UpdateSubscription(ctx, stripeSubID, "past_due", "", nil, nil); err != nil {
		return err
	}

	slog.Info("webhook: subscription marked past_due", "stripeSubID", stripeSubID, "invoiceID", inv.ID)
	return nil
}
