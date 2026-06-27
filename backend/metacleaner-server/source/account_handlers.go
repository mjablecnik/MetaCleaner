package source

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strings"
	"unicode/utf8"

	stripe "github.com/stripe/stripe-go/v82"
	stripesubscription "github.com/stripe/stripe-go/v82/subscription"
)

// HandleUpdateProfile handles PATCH /api/auth/profile.
// Validates and updates the authenticated user's first_name and last_name.
func HandleUpdateProfile(authClient *SupabaseAuthClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		if userID == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "authentication required")
			return
		}

		var req UpdateProfileRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "invalid request body")
			return
		}

		firstName := strings.TrimSpace(req.FirstName)
		lastName := strings.TrimSpace(req.LastName)

		if firstName == "" || utf8.RuneCountInString(firstName) > 100 {
			WriteError(w, http.StatusBadRequest, ErrValidationError, "first_name must be between 1 and 100 characters")
			return
		}
		if lastName == "" || utf8.RuneCountInString(lastName) > 100 {
			WriteError(w, http.StatusBadRequest, ErrValidationError, "last_name must be between 1 and 100 characters")
			return
		}

		profile, err := authClient.UpdateProfile(r.Context(), userID, firstName, lastName)
		if err != nil {
			WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "authentication service temporarily unavailable")
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(profile)
	}
}

// HandleChangePassword handles POST /api/auth/change-password.
// Verifies the current password via Supabase sign-in, then updates to the new password.
func HandleChangePassword(authClient *SupabaseAuthClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		if userID == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "authentication required")
			return
		}

		var req ChangePasswordRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "invalid request body")
			return
		}

		if strings.TrimSpace(req.CurrentPassword) == "" {
			WriteError(w, http.StatusBadRequest, ErrValidationError, "current_password is required")
			return
		}

		newPassLen := utf8.RuneCountInString(req.NewPassword)
		if newPassLen < 8 || newPassLen > 72 {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidPassword, "new_password must be between 8 and 72 characters")
			return
		}

		profile, err := authClient.GetProfile(r.Context(), userID)
		if err != nil || profile == nil {
			WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "authentication service temporarily unavailable")
			return
		}

		if _, err := authClient.SignInWithPassword(r.Context(), profile.Email, req.CurrentPassword); err != nil {
			WriteError(w, http.StatusUnauthorized, ErrAuthInvalidCredentials, "current password is incorrect")
			return
		}

		if _, err := authClient.AdminUpdateUser(r.Context(), userID, map[string]interface{}{
			"password": req.NewPassword,
		}); err != nil {
			if authErr, ok := err.(*SupabaseAuthError); ok && authErr.StatusCode >= 500 {
				WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "authentication service temporarily unavailable")
				return
			}
			WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "authentication service temporarily unavailable")
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Password changed successfully"})
	}
}

// HandleDeleteAccount handles DELETE /api/auth/account.
// Deactivates the account (soft delete with 30-day grace period).
// The user can reactivate by logging in within 30 days.
// After 30 days, a background cleanup job permanently deletes the account.
func HandleDeleteAccount(cfg Config, authClient *SupabaseAuthClient, db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		if userID == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "authentication required")
			return
		}

		ctx := r.Context()

		// 1. Cancel Stripe subscription immediately (if any).
		sub, _ := db.GetSubscriptionByUserID(ctx, userID)
		if sub != nil && sub.StripeSubscriptionID != "" && cfg.StripeSecretKey != "" {
			stripe.Key = cfg.StripeSecretKey
			_, err := stripesubscription.Cancel(sub.StripeSubscriptionID, nil)
			if err != nil {
				slog.Warn("delete-account: failed to cancel Stripe subscription", "userID", userID, "error", err)
			} else {
				_ = db.UpdateSubscription(ctx, sub.StripeSubscriptionID, "cancelled", "", nil, nil)
			}
		}

		// 2. Revoke all API keys.
		if err := db.RevokeAllAPIKeys(ctx, userID); err != nil {
			slog.Warn("delete-account: failed to revoke API keys", "userID", userID, "error", err)
		}

		// 3. Zero out credits.
		_ = db.UpsertCreditBalance(ctx, userID, 0, 0)

		// 4. Deactivate profile (set deactivated_at).
		if err := authClient.DeactivateProfile(ctx, userID); err != nil {
			slog.Error("delete-account: failed to deactivate profile", "userID", userID, "error", err)
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to deactivate account")
			return
		}

		slog.Info("delete-account: account deactivated", "userID", userID)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Account deactivated. It will be permanently deleted after 30 days. Log in again to cancel deletion.",
		})
	}
}

// HandleAccount handles GET /api/account.
// Returns the authenticated user's credits, plan, and rate limit.
func HandleAccount(cfg Config, db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		if userID == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "authentication required")
			return
		}

		subCredits, purchasedCredits, err := db.GetCreditBalance(r.Context(), userID)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to retrieve account information")
			return
		}

		plan := "free"
		sub, err := db.GetSubscriptionByUserID(r.Context(), userID)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to retrieve account information")
			return
		}
		if sub != nil && (sub.Status == "active" || sub.Status == "trialing" || sub.Status == "cancelling") {
			plan = sub.PlanID
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"credits_remaining": subCredits + purchasedCredits,
			"plan":              plan,
			"rate_limit_rpm":    cfg.RateLimitRPM,
		})
	}
}
