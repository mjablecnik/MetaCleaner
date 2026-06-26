package source

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"
)

// --- In-memory email change token store ---

type emailChangeRequest struct {
	UserID    string
	NewEmail  string
	CreatedAt time.Time
}

type emailChangeStore struct {
	mu      sync.Mutex
	pending map[string]emailChangeRequest // token → request
	ttl     time.Duration
}

func newEmailChangeStore(ttl time.Duration) *emailChangeStore {
	s := &emailChangeStore{
		pending: make(map[string]emailChangeRequest),
		ttl:     ttl,
	}
	go s.cleanupLoop()
	return s
}

func (s *emailChangeStore) Create(userID, newEmail string) (string, error) {
	token, err := generateSecureToken(32)
	if err != nil {
		return "", err
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	// Remove any existing pending request for this user
	for k, v := range s.pending {
		if v.UserID == userID {
			delete(s.pending, k)
		}
	}

	s.pending[token] = emailChangeRequest{
		UserID:    userID,
		NewEmail:  newEmail,
		CreatedAt: time.Now(),
	}
	return token, nil
}

func (s *emailChangeStore) Verify(token string) (emailChangeRequest, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	req, found := s.pending[token]
	if !found {
		return emailChangeRequest{}, false
	}

	if time.Since(req.CreatedAt) > s.ttl {
		delete(s.pending, token)
		return emailChangeRequest{}, false
	}

	delete(s.pending, token)
	return req, true
}

func (s *emailChangeStore) cleanupLoop() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		s.mu.Lock()
		now := time.Now()
		for k, v := range s.pending {
			if now.Sub(v.CreatedAt) > s.ttl {
				delete(s.pending, k)
			}
		}
		s.mu.Unlock()
	}
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
// Generates a verification token, sends a confirmation email via Brevo,
// and responds with success. The email changes only after the user clicks the link.
func HandleChangeEmail(cfg Config, authClient *SupabaseAuthClient, store *emailChangeStore) http.HandlerFunc {
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

		// Check if the Brevo API key is configured
		if cfg.BrevoAPIKey == "" {
			LoggerFromContext(r.Context()).Error("change-email: BREVO_API_KEY not configured")
			WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "email service not configured")
			return
		}

		// Generate verification token
		token, err := store.Create(userID, newEmail)
		if err != nil {
			LoggerFromContext(r.Context()).Error("change-email: failed to generate token", "error", err)
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to initiate email change")
			return
		}

		// Build confirmation URL — points to the backend's public endpoint
		// Derive backend base URL from OAUTH_CALLBACK_URL (e.g., "https://metacleaner-server.fly.dev/api/auth/oauth/callback")
		backendBaseURL := cfg.FrontendURL // fallback
		if cfg.OAuthCallbackURL != "" {
			// Extract base from "https://host.com/api/auth/oauth/callback" → "https://host.com"
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

		LoggerFromContext(r.Context()).Info("change-email: verification email sent", "userId", userID, "newEmail", newEmail)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Verification email sent to the new address. Please check your inbox."})
	}
}

// HandleConfirmEmailChange handles GET /api/auth/confirm-email-change?token=...
// This is a PUBLIC endpoint (no auth required) — called when the user clicks the link in the email.
// Verifies the token, updates email in Supabase Auth (Admin API) and profiles table,
// then redirects the user back to the frontend settings page.
func HandleConfirmEmailChange(cfg Config, authClient *SupabaseAuthClient, store *emailChangeStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := r.URL.Query().Get("token")
		if token == "" {
			redirectWithError(w, r, cfg.FrontendURL, "missing_token")
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
			// Non-fatal — auth email already changed, profiles will sync via HandleMe lazy sync
		}

		// Redirect to frontend settings with success indicator
		redirectURL := fmt.Sprintf("%s/settings?email_changed=true", cfg.FrontendURL)
		http.Redirect(w, r, redirectURL, http.StatusFound)
	}
}

func redirectWithError(w http.ResponseWriter, r *http.Request, frontendURL, errorCode string) {
	redirectURL := fmt.Sprintf("%s/settings?email_change_error=%s", frontendURL, errorCode)
	http.Redirect(w, r, redirectURL, http.StatusFound)
}
