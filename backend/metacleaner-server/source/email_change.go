package source

import (
	"bytes"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"
)

// emailChangeTokenPattern validates the 64-hex-character email-change token.
var emailChangeTokenPattern = regexp.MustCompile(`^[0-9a-f]{64}$`)

// --- Database-backed email change token store (via Supabase PostgREST) ---

type emailChangeRequest struct {
	UserID   string
	NewEmail string
}

type emailChangeStore struct {
	restURL    string
	serviceKey string
	timeout    time.Duration
}

func newEmailChangeStore(supabaseURL, serviceRoleKey string, timeout time.Duration) *emailChangeStore {
	return &emailChangeStore{
		restURL:    supabaseURL + "/rest/v1/email_change_tokens",
		serviceKey: serviceRoleKey,
		timeout:    timeout,
	}
}

// Create inserts a new token into the database, removing any prior pending request for the user.
func (s *emailChangeStore) Create(userID, newEmail string) (string, error) {
	token, err := generateSecureToken(32)
	if err != nil {
		return "", err
	}

	// Delete existing pending tokens for this user
	delReq, err := http.NewRequest(http.MethodDelete, s.restURL+"?user_id=eq."+url.QueryEscape(userID), nil)
	if err != nil {
		return "", fmt.Errorf("email change store: create delete request: %w", err)
	}
	s.setHeaders(delReq)
	client := &http.Client{Timeout: s.timeout}
	resp, err := client.Do(delReq)
	if err != nil {
		return "", fmt.Errorf("email change store: delete old tokens: %w", err)
	}
	resp.Body.Close()

	// Insert token hash — raw token is returned to caller and sent in email link;
	// only the hash is persisted so a DB breach cannot be replayed directly.
	payload := map[string]string{
		"user_id":   userID,
		"token":     hashToken(token),
		"new_email": newEmail,
	}
	data, _ := json.Marshal(payload)
	insertReq, err := http.NewRequest(http.MethodPost, s.restURL, bytes.NewReader(data))
	if err != nil {
		return "", fmt.Errorf("email change store: create insert request: %w", err)
	}
	s.setHeaders(insertReq)
	insertReq.Header.Set("Prefer", "return=minimal")

	resp, err = client.Do(insertReq)
	if err != nil {
		return "", fmt.Errorf("email change store: insert token: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("email change store: insert status %d: %s", resp.StatusCode, body)
	}

	return token, nil
}

// Verify retrieves and deletes the token if it exists and hasn't expired.
// The raw token is hashed before lookup; the DB only ever holds hashes.
func (s *emailChangeStore) Verify(token string) (emailChangeRequest, bool) {
	tokenHash := hashToken(token)
	// Fetch token where hash matches and expires_at > now
	fetchURL := s.restURL + "?token=eq." + url.QueryEscape(tokenHash) + "&expires_at=gt.now()&select=user_id,new_email"
	getReq, err := http.NewRequest(http.MethodGet, fetchURL, nil)
	if err != nil {
		return emailChangeRequest{}, false
	}
	s.setHeaders(getReq)
	getReq.Header.Set("Accept", "application/json")

	client := &http.Client{Timeout: s.timeout}
	resp, err := client.Do(getReq)
	if err != nil {
		return emailChangeRequest{}, false
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 300 {
		return emailChangeRequest{}, false
	}

	var results []struct {
		UserID   string `json:"user_id"`
		NewEmail string `json:"new_email"`
	}
	if err := json.Unmarshal(body, &results); err != nil || len(results) == 0 {
		return emailChangeRequest{}, false
	}

	// Delete the token hash (consumed)
	delReq, err := http.NewRequest(http.MethodDelete, s.restURL+"?token=eq."+url.QueryEscape(tokenHash), nil)
	if err == nil {
		s.setHeaders(delReq)
		delResp, err := client.Do(delReq)
		if err == nil {
			delResp.Body.Close()
		}
	}

	return emailChangeRequest{
		UserID:   results[0].UserID,
		NewEmail: results[0].NewEmail,
	}, true
}

func (s *emailChangeStore) setHeaders(req *http.Request) {
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", s.serviceKey)
	req.Header.Set("Authorization", "Bearer "+s.serviceKey)
}

// hashToken returns the hex-encoded SHA-256 digest of token.
// Tokens are stored as hashes so a DB breach does not expose bearer secrets.
func hashToken(token string) string {
	h := sha256.Sum256([]byte(token))
	return hex.EncodeToString(h[:])
}

func generateSecureToken(length int) (string, error) {
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// --- Brevo email sending ---

const brevoAPIURL = "https://api.brevo.com/v3/smtp/email"

type brevoEmailPayload struct {
	Sender      brevoContact   `json:"sender"`
	To          []brevoContact `json:"to"`
	Subject     string         `json:"subject"`
	HTMLContent string         `json:"htmlContent"`
}

type brevoContact struct {
	Name  string `json:"name,omitempty"`
	Email string `json:"email"`
}

func sendBrevoEmail(apiKey, senderEmail, recipientEmail, subject, htmlContent string) error {
	payload := brevoEmailPayload{
		Sender:      brevoContact{Name: "MetaCleaner", Email: senderEmail},
		To:          []brevoContact{{Email: recipientEmail}},
		Subject:     subject,
		HTMLContent: htmlContent,
	}

	data, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPost, brevoAPIURL, bytes.NewReader(data))
	if err != nil {
		return fmt.Errorf("brevo: create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("api-key", apiKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("brevo: send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("brevo: status %d: %s", resp.StatusCode, body)
	}
	return nil
}

func buildEmailChangeHTML(confirmURL string) string {
	return fmt.Sprintf(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a1628; color: #ffffff; padding: 40px 20px;">
  <div style="max-width: 500px; margin: 0 auto; background-color: #111d33; border-radius: 16px; padding: 40px; border: 1px solid #1e293b;">
    <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 16px;">Confirm your new email</h1>
    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      You requested to change your email address on MetaCleaner. Click the button below to confirm this change.
    </p>
    <a href="%s" style="display: inline-block; background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 16px;">
      Confirm email change
    </a>
    <p style="color: #64748b; font-size: 13px; margin: 24px 0 0; line-height: 1.5;">
      This link expires in 1 hour. If you did not request this change, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`, confirmURL)
}

// --- Handlers ---

// HandleChangeEmail handles POST /api/auth/change-email.
// Generates a verification token stored in DB, sends a confirmation email via Brevo,
// and responds with success. The email changes only after the user clicks the link.
func HandleChangeEmail(cfg Config, authClient *SupabaseAuthClient, store *emailChangeStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		if userID == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "authentication required")
			return
		}

		r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
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

		// Check if the Brevo API key is configured
		if cfg.BrevoAPIKey == "" {
			LoggerFromContext(r.Context()).Error("change-email: BREVO_API_KEY not configured")
			WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "email service not configured")
			return
		}

		// Generate verification token and store in DB
		token, err := store.Create(userID, newEmail)
		if err != nil {
			LoggerFromContext(r.Context()).Error("change-email: failed to store token", "error", err)
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to initiate email change")
			return
		}

		// Build confirmation URL — points to the backend's public endpoint
		backendBaseURL := cfg.FrontendURL // fallback
		if cfg.OAuthCallbackURL != "" {
			if idx := strings.Index(cfg.OAuthCallbackURL, "/api/"); idx > 0 {
				backendBaseURL = cfg.OAuthCallbackURL[:idx]
			}
		}
		confirmURL := fmt.Sprintf("%s/api/auth/confirm-email-change?token=%s", backendBaseURL, token)

		// Send verification email via Brevo
		htmlContent := buildEmailChangeHTML(confirmURL)
		if err := sendBrevoEmail(cfg.BrevoAPIKey, cfg.BrevoSenderEmail, newEmail, "Confirm your new email — MetaCleaner", htmlContent); err != nil {
			LoggerFromContext(r.Context()).Error("change-email: failed to send verification email", "userId", userID, "error", err)
			WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "failed to send verification email")
			return
		}

		LoggerFromContext(r.Context()).Info("change-email: verification email sent", "userId", userID)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Verification email sent to the new address. Please check your inbox."})
	}
}

// HandleConfirmEmailChange handles GET /api/auth/confirm-email-change?token=...
// This is a PUBLIC endpoint (no auth required) — called when the user clicks the link in the email.
// Verifies the token from DB, updates email in Supabase Auth (Admin API) and profiles table,
// then redirects the user back to the frontend settings page.
func HandleConfirmEmailChange(cfg Config, authClient *SupabaseAuthClient, store *emailChangeStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := r.URL.Query().Get("token")
		if token == "" {
			redirectWithError(w, r, cfg.FrontendURL, "missing_token")
			return
		}
		if !emailChangeTokenPattern.MatchString(token) {
			redirectWithError(w, r, cfg.FrontendURL, "invalid_or_expired_token")
			return
		}

		req, valid := store.Verify(token)
		if !valid {
			redirectWithError(w, r, cfg.FrontendURL, "invalid_or_expired_token")
			return
		}

		// Update email in Supabase Auth via Admin API
		if _, err := authClient.AdminUpdateUser(r.Context(), req.UserID, map[string]interface{}{
			"email":         req.NewEmail,
			"email_confirm": true,
		}); err != nil {
			LoggerFromContext(r.Context()).Error("confirm-email-change: admin update failed", "userId", req.UserID, "error", err)
			redirectWithError(w, r, cfg.FrontendURL, "update_failed")
			return
		}

		// Update email in profiles table
		if err := authClient.UpdateProfileEmail(r.Context(), req.UserID, req.NewEmail); err != nil {
			LoggerFromContext(r.Context()).Warn("confirm-email-change: profiles table update failed", "userId", req.UserID, "error", err)
		}

		// Redirect to frontend email change confirmation page
		redirectURL := fmt.Sprintf("%s/email-changed", cfg.FrontendURL)
		http.Redirect(w, r, redirectURL, http.StatusFound)
	}
}

func redirectWithError(w http.ResponseWriter, r *http.Request, frontendURL, errorCode string) {
	redirectURL := fmt.Sprintf("%s/email-changed?error=%s", frontendURL, errorCode)
	http.Redirect(w, r, redirectURL, http.StatusFound)
}
