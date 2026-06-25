package source

import (
	"encoding/json"
	"net/http"
	"strings"
	"unicode/utf8"
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

// HandleChangeEmail handles POST /api/auth/change-email.
// Validates the new email and initiates a Supabase email change (sends verification email).
func HandleChangeEmail(authClient *SupabaseAuthClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		if userID == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "authentication required")
			return
		}

		var req ChangeEmailRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "invalid request body")
			return
		}

		newEmail := strings.TrimSpace(req.NewEmail)
		if newEmail == "" || !emailRegex.MatchString(newEmail) {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidEmail, "invalid email format")
			return
		}

		if _, err := authClient.AdminUpdateUser(r.Context(), userID, map[string]interface{}{
			"email": newEmail,
		}); err != nil {
			if authErr, ok := err.(*SupabaseAuthError); ok {
				if isEmailExistsError(authErr) {
					WriteError(w, http.StatusConflict, ErrAuthEmailExists, "an account with this email already exists")
					return
				}
				if authErr.StatusCode >= 500 {
					WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "authentication service temporarily unavailable")
					return
				}
			}
			WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "authentication service temporarily unavailable")
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Verification email sent"})
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
// Permanently removes the authenticated user via the Supabase Admin API.
func HandleDeleteAccount(authClient *SupabaseAuthClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		if userID == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "authentication required")
			return
		}

		if err := authClient.AdminDeleteUser(r.Context(), userID); err != nil {
			if authErr, ok := err.(*SupabaseAuthError); ok && authErr.StatusCode >= 500 {
				WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "authentication service temporarily unavailable")
				return
			}
			WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "authentication service temporarily unavailable")
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Account deleted successfully"})
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
		if sub != nil && sub.Status == "active" {
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
