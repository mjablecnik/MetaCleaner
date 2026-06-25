package source

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"unicode/utf8"
)

// emailRegex validates the format: local-part@domain with at least one dot in domain.
var emailRegex = regexp.MustCompile(`^[^@\s]+@[^@\s]+\.[^@\s]+$`)

// HandleRegister handles POST /api/auth/register.
// Validates input, creates a Supabase auth user, and inserts a profile record.
func HandleRegister(authClient *SupabaseAuthClient, db *SupabaseClient) http.HandlerFunc {
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
			ID:        user.ID,
			FirstName: strings.TrimSpace(req.FirstName),
			LastName:  strings.TrimSpace(req.LastName),
			Email:     req.Email,
		}); err != nil {
			LoggerFromContext(r.Context()).Warn("register: failed to create profile", "userId", user.ID, "error", err)
			WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "authentication service temporarily unavailable")
			return
		}

		// Provision initial trial credits in credit_balances table.
		if err := db.UpsertCreditBalance(r.Context(), user.ID, 3, 0); err != nil {
			LoggerFromContext(r.Context()).Warn("register: failed to create credit balance", "userId", user.ID, "error", err)
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

// --- Magic link handlers ---

// HandleMagicLink handles POST /api/auth/magic-link.
// Validates the email format and triggers a Supabase magic link email.
// Always returns 200 for valid emails (Supabase creates accounts for new addresses).
func HandleMagicLink(authClient *SupabaseAuthClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req MagicLinkRequest
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

		if err := authClient.SignInWithOtp(r.Context(), req.Email); err != nil {
			if authErr, ok := err.(*SupabaseAuthError); ok && authErr.StatusCode >= 500 {
				WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "authentication service temporarily unavailable")
				return
			}
			// Non-5xx errors are intentionally swallowed.
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(MagicLinkResponse{
			Message: "If an account with that email exists, a magic link has been sent.",
		})
	}
}

// HandleMagicLinkCallback handles GET /api/auth/magic-link/callback.
// Supabase redirects here with token_hash and type query parameters after the user
// clicks the magic link or email confirmation link. The handler verifies the token,
// creates a profile for new users, and redirects to the frontend with tokens as query
// parameters. Email confirmations (type=signup) redirect to /email-verified; all other
// types (magic link, etc.) redirect to /login.
func HandleMagicLinkCallback(authClient *SupabaseAuthClient, db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		frontendLogin := authClient.frontendURL + "/login"
		frontendEmailVerified := authClient.frontendURL + "/email-verified"

		if errParam := r.URL.Query().Get("error"); errParam != "" {
			http.Redirect(w, r, frontendLogin+"?error="+url.QueryEscape(errParam), http.StatusFound)
			return
		}

		tokenHash := r.URL.Query().Get("token_hash")
		if tokenHash == "" {
			http.Redirect(w, r, frontendLogin+"?error="+url.QueryEscape("Magic link is invalid or expired"), http.StatusFound)
			return
		}

		tokenType := r.URL.Query().Get("type")
		if tokenType == "" {
			tokenType = "magiclink"
		}

		session, err := authClient.VerifyTokenHash(r.Context(), tokenHash, tokenType)
		if err != nil {
			if authErr, ok := err.(*SupabaseAuthError); ok && authErr.StatusCode >= 500 {
				http.Redirect(w, r, frontendLogin+"?error="+url.QueryEscape("Authentication service temporarily unavailable"), http.StatusFound)
				return
			}
			http.Redirect(w, r, frontendLogin+"?error="+url.QueryEscape("Magic link is invalid or expired"), http.StatusFound)
			return
		}

		// Create profile only for first-time magic link users.
		existing, _ := authClient.GetProfile(r.Context(), session.User.ID)
		if existing == nil {
			if createErr := authClient.CreateProfile(r.Context(), UserProfile{
				ID:        session.User.ID,
				FirstName: "",
				LastName:  "",
				Email:     session.User.Email,
			}); createErr != nil {
				LoggerFromContext(r.Context()).Warn("magic link callback: failed to create profile", "userId", session.User.ID, "error", createErr)
			}

			// Provision initial trial credits in credit_balances table.
			if err := db.UpsertCreditBalance(r.Context(), session.User.ID, 3, 0); err != nil {
				LoggerFromContext(r.Context()).Warn("magic link callback: failed to create credit balance", "userId", session.User.ID, "error", err)
			}
		}

		params := url.Values{}
		params.Set("access_token", session.AccessToken)
		params.Set("refresh_token", session.RefreshToken)
		params.Set("expires_in", strconv.Itoa(session.ExpiresIn))

		// Email confirmations (signup) land on the email-verified success page;
		// magic links and other types go to the login page to complete sign-in.
		if tokenType == "signup" {
			http.Redirect(w, r, frontendEmailVerified+"?"+params.Encode(), http.StatusFound)
		} else {
			http.Redirect(w, r, frontendLogin+"?"+params.Encode(), http.StatusFound)
		}
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

// --- PKCE helpers ---

const pkceVerifierCookie = "mc_pkce_verifier"

// generateCodeVerifier returns a cryptographically random base64url-encoded string
// suitable for use as a PKCE code verifier.
func generateCodeVerifier() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

// generateCodeChallenge returns the S256 code challenge derived from verifier.
func generateCodeChallenge(verifier string) string {
	h := sha256.Sum256([]byte(verifier))
	return base64.RawURLEncoding.EncodeToString(h[:])
}

// --- OAuth handlers ---

// HandleOAuthInitiate handles GET /api/auth/oauth/{provider}.
// Validates the provider, generates PKCE credentials, stores the verifier in a
// short-lived cookie, and redirects the user to the Supabase OAuth authorize URL.
func HandleOAuthInitiate(authClient *SupabaseAuthClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		provider := r.PathValue("provider")
		if provider != "google" && provider != "apple" {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidProvider, "unsupported OAuth provider")
			return
		}

		verifier, err := generateCodeVerifier()
		if err != nil {
			WriteError(w, http.StatusInternalServerError, ErrAuthInvalidRequest, "failed to initiate OAuth flow")
			return
		}
		challenge := generateCodeChallenge(verifier)

		http.SetCookie(w, &http.Cookie{
			Name:     pkceVerifierCookie,
			Value:    verifier,
			Path:     "/api/auth/oauth",
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
			MaxAge:   600,
		})

		oauthURL := authClient.GetOAuthURL(provider, challenge)
		http.Redirect(w, r, oauthURL, http.StatusFound)
	}
}

// HandleOAuthCallback handles GET /api/auth/oauth/callback.
// Reads the PKCE verifier from the cookie, exchanges the authorization code for a
// session, creates a profile for new OAuth users, and redirects to the frontend
// with tokens as query parameters.
func HandleOAuthCallback(authClient *SupabaseAuthClient, db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		frontendLogin := authClient.frontendURL + "/login"

		// Handle error from OAuth provider or Supabase.
		if errParam := r.URL.Query().Get("error"); errParam != "" {
			http.Redirect(w, r, frontendLogin+"?error="+url.QueryEscape(errParam), http.StatusFound)
			return
		}

		code := r.URL.Query().Get("code")
		if code == "" {
			http.Redirect(w, r, frontendLogin+"?error="+url.QueryEscape("OAuth authentication failed"), http.StatusFound)
			return
		}

		cookie, err := r.Cookie(pkceVerifierCookie)
		if err != nil || cookie.Value == "" {
			http.Redirect(w, r, frontendLogin+"?error="+url.QueryEscape("OAuth session expired, please try again"), http.StatusFound)
			return
		}
		verifier := cookie.Value

		// Clear the PKCE cookie immediately.
		http.SetCookie(w, &http.Cookie{
			Name:     pkceVerifierCookie,
			Value:    "",
			Path:     "/api/auth/oauth",
			HttpOnly: true,
			MaxAge:   -1,
		})

		session, err := authClient.ExchangeCodeForSession(r.Context(), code, verifier)
		if err != nil {
			if authErr, ok := err.(*SupabaseAuthError); ok && authErr.StatusCode >= 500 {
				http.Redirect(w, r, frontendLogin+"?error="+url.QueryEscape("Authentication service temporarily unavailable"), http.StatusFound)
				return
			}
			http.Redirect(w, r, frontendLogin+"?error="+url.QueryEscape("OAuth authentication failed"), http.StatusFound)
			return
		}

		// Create profile only for first-time OAuth logins.
		existing, _ := authClient.GetProfile(r.Context(), session.User.ID)
		if existing == nil {
			firstName, lastName := extractOAuthName(session.User)
			if createErr := authClient.CreateProfile(r.Context(), UserProfile{
				ID:        session.User.ID,
				FirstName: firstName,
				LastName:  lastName,
				Email:     session.User.Email,
			}); createErr != nil {
				LoggerFromContext(r.Context()).Warn("oauth callback: failed to create profile", "userId", session.User.ID, "error", createErr)
			}

			// Provision initial trial credits in credit_balances table.
			if err := db.UpsertCreditBalance(r.Context(), session.User.ID, 3, 0); err != nil {
				LoggerFromContext(r.Context()).Warn("oauth callback: failed to create credit balance", "userId", session.User.ID, "error", err)
			}
		}

		params := url.Values{}
		params.Set("access_token", session.AccessToken)
		params.Set("refresh_token", session.RefreshToken)
		params.Set("expires_in", strconv.Itoa(session.ExpiresIn))
		http.Redirect(w, r, frontendLogin+"?"+params.Encode(), http.StatusFound)
	}
}

// extractOAuthName returns first and last name from Supabase OAuth user metadata.
// Falls back to identity data, then empty strings if not available.
func extractOAuthName(user SupabaseAuthUser) (firstName, lastName string) {
	tryFullName := func(name string) (string, string, bool) {
		name = strings.TrimSpace(name)
		if name == "" {
			return "", "", false
		}
		parts := strings.SplitN(name, " ", 2)
		fn := parts[0]
		ln := ""
		if len(parts) > 1 {
			ln = parts[1]
		}
		return fn, ln, true
	}

	// Try user_metadata fields that OAuth providers typically populate.
	for _, key := range []string{"full_name", "name"} {
		if v, ok := user.UserMetadata[key].(string); ok {
			if fn, ln, ok := tryFullName(v); ok {
				return fn, ln
			}
		}
	}
	if v, ok := user.UserMetadata["first_name"].(string); ok {
		firstName = strings.TrimSpace(v)
	}
	if v, ok := user.UserMetadata["last_name"].(string); ok {
		lastName = strings.TrimSpace(v)
	}
	if firstName != "" || lastName != "" {
		return
	}

	// Fall back to identity data (Google sends given_name / family_name).
	for _, identity := range user.Identities {
		if v, ok := identity.IdentityData["full_name"].(string); ok {
			if fn, ln, ok := tryFullName(v); ok {
				return fn, ln
			}
		}
		if firstName == "" {
			if v, ok := identity.IdentityData["given_name"].(string); ok {
				firstName = strings.TrimSpace(v)
			}
		}
		if lastName == "" {
			if v, ok := identity.IdentityData["family_name"].(string); ok {
				lastName = strings.TrimSpace(v)
			}
		}
		if firstName != "" || lastName != "" {
			return
		}
	}
	return
}
