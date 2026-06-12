package source

import (
	"encoding/json"
	"log"
	"net/http"
	"regexp"
	"strings"
	"unicode/utf8"
)

// emailRegex validates the format: local-part@domain with at least one dot in domain.
var emailRegex = regexp.MustCompile(`^[^@\s]+@[^@\s]+\.[^@\s]+$`)

// HandleRegister handles POST /api/auth/register.
// Validates input, creates a Supabase auth user, and inserts a profile record.
func HandleRegister(authClient *SupabaseAuthClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req RegisterRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "invalid request body")
			return
		}

		if req.Email == "" {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "email is required")
			return
		}
		if req.FirstName == "" || strings.TrimSpace(req.FirstName) == "" {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "first_name is required and must not be empty")
			return
		}
		if req.LastName == "" || strings.TrimSpace(req.LastName) == "" {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "last_name is required and must not be empty")
			return
		}
		if req.Password == "" {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "password is required")
			return
		}

		if !emailRegex.MatchString(req.Email) {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidEmail, "invalid email format")
			return
		}

		passLen := utf8.RuneCountInString(req.Password)
		if passLen < 8 || passLen > 72 {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidPassword, "password must be between 8 and 72 characters")
			return
		}

		user, err := authClient.SignUp(r.Context(), req.Email, req.Password, map[string]interface{}{
			"first_name": strings.TrimSpace(req.FirstName),
			"last_name":  strings.TrimSpace(req.LastName),
		})
		if err != nil {
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

		if err := authClient.CreateProfile(r.Context(), UserProfile{
			ID:               user.ID,
			FirstName:        strings.TrimSpace(req.FirstName),
			LastName:         strings.TrimSpace(req.LastName),
			Email:            req.Email,
			SubscriptionType: "free",
			Credits:          3,
		}); err != nil {
			log.Printf("register: failed to create profile for user %s: %v", user.ID, err)
			WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "authentication service temporarily unavailable")
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(RegisterResponse{
			Message: "Registration successful. Please check your email to confirm your account.",
		})
	}
}

// HandleLogin handles POST /api/auth/login.
// Validates email and password, authenticates via Supabase, and returns a session.
func HandleLogin(authClient *SupabaseAuthClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "invalid request body")
			return
		}

		if strings.TrimSpace(req.Email) == "" {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "email is required")
			return
		}
		if req.Password == "" {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "password is required")
			return
		}

		session, err := authClient.SignInWithPassword(r.Context(), req.Email, req.Password)
		if err != nil {
			if authErr, ok := err.(*SupabaseAuthError); ok {
				if isEmailNotConfirmedError(authErr) {
					WriteError(w, http.StatusForbidden, ErrAuthEmailNotConfirmed, "email confirmation required")
					return
				}
				if authErr.StatusCode >= 500 {
					WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "authentication service temporarily unavailable")
					return
				}
			}
			WriteError(w, http.StatusUnauthorized, ErrAuthInvalidCredentials, "invalid email or password")
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(AuthSession{
			AccessToken:  session.AccessToken,
			RefreshToken: session.RefreshToken,
			ExpiresIn:    session.ExpiresIn,
			User: AuthUser{
				ID:    session.User.ID,
				Email: session.User.Email,
			},
		})
	}
}

// HandleLogout handles POST /api/auth/logout.
// Requires a valid Bearer token in the Authorization header. Invalidates the session
// via Supabase and returns HTTP 200. Returns HTTP 401 for missing or invalid tokens.
func HandleLogout(authClient *SupabaseAuthClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			WriteError(w, http.StatusUnauthorized, ErrAuthTokenInvalid, "missing or invalid Authorization header")
			return
		}
		accessToken := strings.TrimPrefix(authHeader, "Bearer ")

		if err := authClient.SignOut(r.Context(), accessToken); err != nil {
			if authErr, ok := err.(*SupabaseAuthError); ok {
				if authErr.StatusCode == http.StatusUnauthorized || authErr.StatusCode == http.StatusForbidden {
					WriteError(w, http.StatusUnauthorized, ErrAuthTokenInvalid, "token is invalid or expired")
					return
				}
			}
			WriteError(w, http.StatusUnauthorized, ErrAuthTokenInvalid, "token is invalid or expired")
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(LogoutResponse{Message: "Logged out successfully"})
	}
}

// HandleRefresh handles POST /api/auth/refresh.
// Accepts a JSON body with refresh_token and exchanges it for a new session via Supabase.
func HandleRefresh(authClient *SupabaseAuthClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req RefreshRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "invalid request body")
			return
		}

		if strings.TrimSpace(req.RefreshToken) == "" {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "refresh_token is required")
			return
		}

		session, err := authClient.RefreshToken(r.Context(), req.RefreshToken)
		if err != nil {
			if authErr, ok := err.(*SupabaseAuthError); ok {
				if authErr.StatusCode >= 500 {
					WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "authentication service temporarily unavailable")
					return
				}
			}
			WriteError(w, http.StatusUnauthorized, ErrAuthSessionExpired, "session has expired")
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(AuthSession{
			AccessToken:  session.AccessToken,
			RefreshToken: session.RefreshToken,
			ExpiresIn:    session.ExpiresIn,
			User: AuthUser{
				ID:    session.User.ID,
				Email: session.User.Email,
			},
		})
	}
}

// HandleMe handles GET /api/auth/me.
// Requires a valid Bearer token (enforced by AuthMiddleware on non-exempt paths).
// Returns the authenticated user's profile from the profiles table.
func HandleMe(authClient *SupabaseAuthClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		if userID == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "unauthorized")
			return
		}

		profile, err := authClient.GetProfile(r.Context(), userID)
		if err != nil {
			WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "authentication service temporarily unavailable")
			return
		}
		if profile == nil {
			WriteError(w, http.StatusNotFound, ErrAuthInvalidRequest, "user profile not found")
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(profile)
	}
}

// HandleForgotPassword handles POST /api/auth/forgot-password.
// Validates the email format and triggers a Supabase password-reset email.
// Always returns 200 for valid email formats (even unregistered emails) to prevent enumeration.
func HandleForgotPassword(authClient *SupabaseAuthClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req ForgotPasswordRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "invalid request body")
			return
		}

		if strings.TrimSpace(req.Email) == "" {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "email is required")
			return
		}
		if !emailRegex.MatchString(req.Email) {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidEmail, "invalid email format")
			return
		}

		if err := authClient.ResetPasswordForEmail(r.Context(), req.Email); err != nil {
			if authErr, ok := err.(*SupabaseAuthError); ok && authErr.StatusCode >= 500 {
				WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "authentication service temporarily unavailable")
				return
			}
			// Non-5xx errors (e.g. unregistered email) are swallowed to prevent enumeration.
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(ForgotPasswordResponse{
			Message: "If an account with that email exists, a password reset code has been sent.",
		})
	}
}

// HandleVerifyResetCode handles POST /api/auth/verify-reset-code.
// Verifies the OTP code sent by Supabase and returns a short-lived access token
// that authorises only the /api/auth/reset-password endpoint.
func HandleVerifyResetCode(authClient *SupabaseAuthClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req VerifyResetCodeRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "invalid request body")
			return
		}

		if strings.TrimSpace(req.Email) == "" {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "email is required")
			return
		}
		if strings.TrimSpace(req.Code) == "" {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "code is required")
			return
		}

		session, err := authClient.VerifyOTP(r.Context(), req.Email, req.Code, "recovery")
		if err != nil {
			if authErr, ok := err.(*SupabaseAuthError); ok {
				if authErr.StatusCode >= 500 {
					WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "authentication service temporarily unavailable")
					return
				}
			}
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidCode, "invalid or expired reset code")
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(VerifyResetCodeResponse{
			AccessToken: session.AccessToken,
		})
	}
}

// HandleResetPassword handles POST /api/auth/reset-password.
// Requires a valid Bearer token obtained from /api/auth/verify-reset-code.
// Validates the new password length (8–128) and updates the user's password via Supabase.
func HandleResetPassword(authClient *SupabaseAuthClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			WriteError(w, http.StatusUnauthorized, ErrAuthResetTokenInvalid, "missing or invalid Authorization header")
			return
		}
		accessToken := strings.TrimPrefix(authHeader, "Bearer ")

		var req ResetPasswordRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "invalid request body")
			return
		}

		if req.Password == "" {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "password is required")
			return
		}

		passLen := utf8.RuneCountInString(req.Password)
		if passLen < 8 || passLen > 128 {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidPassword, "password must be between 8 and 128 characters")
			return
		}

		_, err := authClient.UpdateUser(r.Context(), accessToken, map[string]interface{}{
			"password": req.Password,
		})
		if err != nil {
			if authErr, ok := err.(*SupabaseAuthError); ok {
				if authErr.StatusCode >= 500 {
					WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "authentication service temporarily unavailable")
					return
				}
				if authErr.StatusCode == http.StatusUnauthorized || authErr.StatusCode == http.StatusForbidden {
					WriteError(w, http.StatusUnauthorized, ErrAuthResetTokenInvalid, "reset session is invalid or expired")
					return
				}
			}
			WriteError(w, http.StatusUnauthorized, ErrAuthResetTokenInvalid, "reset session is invalid or expired")
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(ResetPasswordResponse{Message: "Password has been reset successfully."})
	}
}

// isEmailNotConfirmedError reports whether the Supabase error indicates an unconfirmed email.
func isEmailNotConfirmedError(e *SupabaseAuthError) bool {
	if e.ErrorCode == "email_not_confirmed" {
		return true
	}
	msg := strings.ToLower(e.Message)
	return strings.Contains(msg, "email not confirmed") || strings.Contains(msg, "confirm your email")
}

// isEmailExistsError reports whether the Supabase error indicates a duplicate email.
func isEmailExistsError(e *SupabaseAuthError) bool {
	if e.StatusCode == 422 {
		switch e.ErrorCode {
		case "user_already_exists", "email_exists", "email_address_already_registered":
			return true
		}
		msg := strings.ToLower(e.Message)
		if strings.Contains(msg, "already registered") || strings.Contains(msg, "already exists") {
			return true
		}
	}
	return false
}
