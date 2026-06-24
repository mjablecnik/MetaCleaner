package source

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

// SupabaseAuthSession is the session response from Supabase Auth.
type SupabaseAuthSession struct {
	AccessToken  string           `json:"access_token"`
	RefreshToken string           `json:"refresh_token"`
	ExpiresIn    int              `json:"expires_in"`
	TokenType    string           `json:"token_type"`
	User         SupabaseAuthUser `json:"user"`
}

// SupabaseAuthUser is the user object returned by Supabase Auth.
type SupabaseAuthUser struct {
	ID               string                 `json:"id"`
	Email            string                 `json:"email"`
	EmailConfirmedAt *time.Time             `json:"email_confirmed_at"`
	UserMetadata     map[string]interface{} `json:"user_metadata"`
	AppMetadata      map[string]interface{} `json:"app_metadata"`
	Identities       []SupabaseIdentity     `json:"identities"`
}

// SupabaseIdentity represents a linked OAuth provider identity for a user.
type SupabaseIdentity struct {
	Provider     string                 `json:"provider"`
	IdentityData map[string]interface{} `json:"identity_data"`
}

// SupabaseAuthError wraps error responses from the Supabase Auth API.
type SupabaseAuthError struct {
	StatusCode int
	ErrorCode  string
	Message    string
}

func (e *SupabaseAuthError) Error() string {
	if e.ErrorCode != "" {
		return fmt.Sprintf("supabase auth %d [%s]: %s", e.StatusCode, e.ErrorCode, e.Message)
	}
	return fmt.Sprintf("supabase auth %d: %s", e.StatusCode, e.Message)
}

// supabaseAuthErrBody is the JSON error shape Supabase Auth returns.
type supabaseAuthErrBody struct {
	Message   string `json:"message"`
	Msg       string `json:"msg"`
	ErrorCode string `json:"error_code"`
	Code      int    `json:"code"`
}

// UserProfile is the profile record stored in the profiles table.
type UserProfile struct {
	ID               string     `json:"id"`
	FirstName        string     `json:"first_name"`
	LastName         string     `json:"last_name"`
	Email            string     `json:"email"`
	SubscriptionType string     `json:"subscription_type"`
	CreatedAt        *time.Time `json:"created_at,omitempty"`
	UpdatedAt        *time.Time `json:"updated_at,omitempty"`
}

// SupabaseAuthClient handles all Supabase Auth API interactions.
type SupabaseAuthClient struct {
	httpClient    *http.Client
	baseURL       string
	apiKey        string // anon key
	serviceKey    string // service role key — required for admin and profile operations
	jwtSecret     string
	oauthCallback string
	magicCallback string
	frontendURL   string
	timeout       time.Duration
}

// NewSupabaseAuthClient creates a new SupabaseAuthClient from the given config.
func NewSupabaseAuthClient(cfg Config) *SupabaseAuthClient {
	timeout := cfg.SupabaseTimeout
	if timeout == 0 {
		timeout = 10 * time.Second
	}
	return &SupabaseAuthClient{
		httpClient:    &http.Client{Timeout: 30 * time.Second},
		baseURL:       cfg.SupabaseURL,
		apiKey:        cfg.SupabaseAPIKey,
		serviceKey:    cfg.SupabaseServiceRoleKey,
		jwtSecret:     cfg.SupabaseJWTSecret,
		oauthCallback: cfg.OAuthCallbackURL,
		magicCallback: cfg.MagicLinkCallbackURL,
		frontendURL:   cfg.FrontendURL,
		timeout:       timeout,
	}
}

func (c *SupabaseAuthClient) doWithTimeout(req *http.Request) (*http.Response, error) {
	ctx, cancel := context.WithTimeout(req.Context(), c.timeout)
	defer cancel()
	return c.httpClient.Do(req.WithContext(ctx))
}

// --- URL helpers ---

func (c *SupabaseAuthClient) authURL(path string) string {
	return c.baseURL + "/auth/v1/" + path
}

func (c *SupabaseAuthClient) restURL(path string) string {
	return c.baseURL + "/rest/v1/" + path
}

// --- Request builders ---

func (c *SupabaseAuthClient) newAnonRequest(ctx context.Context, method, rawURL string, body io.Reader) (*http.Request, error) {
	req, err := http.NewRequestWithContext(ctx, method, rawURL, body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("apikey", c.apiKey)
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")
	return req, nil
}

func (c *SupabaseAuthClient) newUserRequest(ctx context.Context, method, rawURL, accessToken string, body io.Reader) (*http.Request, error) {
	req, err := http.NewRequestWithContext(ctx, method, rawURL, body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("apikey", c.apiKey)
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Content-Type", "application/json")
	return req, nil
}

func (c *SupabaseAuthClient) newAdminRequest(ctx context.Context, method, rawURL string, body io.Reader) (*http.Request, error) {
	req, err := http.NewRequestWithContext(ctx, method, rawURL, body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("apikey", c.serviceKey)
	req.Header.Set("Authorization", "Bearer "+c.serviceKey)
	req.Header.Set("Content-Type", "application/json")
	return req, nil
}

// --- Response handler ---

func (c *SupabaseAuthClient) doRequest(req *http.Request, result interface{}) error {
	resp, err := c.doWithTimeout(req)
	if err != nil {
		return fmt.Errorf("supabase auth request: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		var errBody supabaseAuthErrBody
		if json.Unmarshal(body, &errBody) == nil {
			msg := errBody.Message
			if msg == "" {
				msg = errBody.Msg
			}
			return &SupabaseAuthError{
				StatusCode: resp.StatusCode,
				ErrorCode:  errBody.ErrorCode,
				Message:    msg,
			}
		}
		return &SupabaseAuthError{
			StatusCode: resp.StatusCode,
			Message:    string(body),
		}
	}

	if result != nil && len(body) > 0 {
		if err := json.Unmarshal(body, result); err != nil {
			return fmt.Errorf("unmarshal auth response: %w", err)
		}
	}
	return nil
}

// --- Auth methods ---

// SignUp creates a new user with email/password. Metadata (first_name, last_name) is stored
// in user_metadata. When email confirmation is required, returns the user with no session.
func (c *SupabaseAuthClient) SignUp(ctx context.Context, email, password string, metadata map[string]interface{}) (*SupabaseAuthUser, error) {
	payload := map[string]interface{}{
		"email":    email,
		"password": password,
		"data":     metadata,
	}
	data, _ := json.Marshal(payload)
	req, err := c.newAnonRequest(ctx, http.MethodPost, c.authURL("signup"), bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	var user SupabaseAuthUser
	if err := c.doRequest(req, &user); err != nil {
		return nil, err
	}
	return &user, nil
}

// SignInWithPassword authenticates an existing user with email and password.
func (c *SupabaseAuthClient) SignInWithPassword(ctx context.Context, email, password string) (*SupabaseAuthSession, error) {
	payload := map[string]string{
		"email":    email,
		"password": password,
	}
	data, _ := json.Marshal(payload)
	req, err := c.newAnonRequest(ctx, http.MethodPost, c.authURL("token?grant_type=password"), bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	var session SupabaseAuthSession
	if err := c.doRequest(req, &session); err != nil {
		return nil, err
	}
	return &session, nil
}

// SignInWithOtp sends a magic link to the given email address. The link redirects
// to the configured MagicLinkCallbackURL.
func (c *SupabaseAuthClient) SignInWithOtp(ctx context.Context, email string) error {
	payload := map[string]interface{}{
		"email": email,
		"options": map[string]string{
			"email_redirect_to": c.magicCallback,
		},
	}
	data, _ := json.Marshal(payload)
	req, err := c.newAnonRequest(ctx, http.MethodPost, c.authURL("otp"), bytes.NewReader(data))
	if err != nil {
		return err
	}
	return c.doRequest(req, nil)
}

// RefreshToken exchanges a refresh token for a new session.
func (c *SupabaseAuthClient) RefreshToken(ctx context.Context, refreshToken string) (*SupabaseAuthSession, error) {
	payload := map[string]string{"refresh_token": refreshToken}
	data, _ := json.Marshal(payload)
	req, err := c.newAnonRequest(ctx, http.MethodPost, c.authURL("token?grant_type=refresh_token"), bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	var session SupabaseAuthSession
	if err := c.doRequest(req, &session); err != nil {
		return nil, err
	}
	return &session, nil
}

// SignOut invalidates the user's current session (both access and refresh tokens).
func (c *SupabaseAuthClient) SignOut(ctx context.Context, accessToken string) error {
	req, err := c.newUserRequest(ctx, http.MethodPost, c.authURL("logout"), accessToken, nil)
	if err != nil {
		return err
	}
	req.Header.Del("Content-Type")
	return c.doRequest(req, nil)
}

// ResetPasswordForEmail triggers a password-reset email to the given address. Always
// returns nil even for unregistered emails (Supabase handles anti-enumeration).
func (c *SupabaseAuthClient) ResetPasswordForEmail(ctx context.Context, email string) error {
	payload := map[string]interface{}{
		"email": email,
		"options": map[string]string{
			"email_redirect_to": c.frontendURL + "/forgot-password",
		},
	}
	data, _ := json.Marshal(payload)
	req, err := c.newAnonRequest(ctx, http.MethodPost, c.authURL("recover"), bytes.NewReader(data))
	if err != nil {
		return err
	}
	return c.doRequest(req, nil)
}

// VerifyOTP verifies a one-time code for the given email and token type.
// Use tokenType "recovery" for password-reset codes and "magiclink" for magic links.
// Returns a session on success.
func (c *SupabaseAuthClient) VerifyOTP(ctx context.Context, email, token, tokenType string) (*SupabaseAuthSession, error) {
	payload := map[string]string{
		"email": email,
		"token": token,
		"type":  tokenType,
	}
	data, _ := json.Marshal(payload)
	req, err := c.newAnonRequest(ctx, http.MethodPost, c.authURL("verify"), bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	var session SupabaseAuthSession
	if err := c.doRequest(req, &session); err != nil {
		return nil, err
	}
	return &session, nil
}

// VerifyTokenHash verifies a magic link token_hash received as a query parameter
// in the callback URL. tokenType should be "magiclink" or "email".
func (c *SupabaseAuthClient) VerifyTokenHash(ctx context.Context, tokenHash, tokenType string) (*SupabaseAuthSession, error) {
	payload := map[string]string{
		"token_hash": tokenHash,
		"type":       tokenType,
	}
	data, _ := json.Marshal(payload)
	req, err := c.newAnonRequest(ctx, http.MethodPost, c.authURL("verify"), bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	var session SupabaseAuthSession
	if err := c.doRequest(req, &session); err != nil {
		return nil, err
	}
	return &session, nil
}

// UpdateUser updates the authenticated user's attributes (e.g., password).
// Pass attrs as a map, e.g., {"password": "new_password"}.
func (c *SupabaseAuthClient) UpdateUser(ctx context.Context, accessToken string, attrs map[string]interface{}) (*SupabaseAuthUser, error) {
	data, _ := json.Marshal(attrs)
	req, err := c.newUserRequest(ctx, http.MethodPut, c.authURL("user"), accessToken, bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	var user SupabaseAuthUser
	if err := c.doRequest(req, &user); err != nil {
		return nil, err
	}
	return &user, nil
}

// GetOAuthURL returns the Supabase Auth URL to which the user should be redirected to
// initiate the OAuth flow for the given provider ("google" or "apple"). The configured
// OAuthCallbackURL will receive the authorization code on completion.
// If codeChallenge is non-empty, PKCE S256 params are included in the URL.
func (c *SupabaseAuthClient) GetOAuthURL(provider, codeChallenge string) string {
	params := url.Values{}
	params.Set("provider", provider)
	params.Set("redirect_to", c.oauthCallback)
	if codeChallenge != "" {
		params.Set("code_challenge", codeChallenge)
		params.Set("code_challenge_method", "s256")
	}
	return c.authURL("authorize") + "?" + params.Encode()
}

// ExchangeCodeForSession exchanges an OAuth authorization code for a session using PKCE.
// codeVerifier must match the code_challenge included in the original authorize request.
func (c *SupabaseAuthClient) ExchangeCodeForSession(ctx context.Context, code, codeVerifier string) (*SupabaseAuthSession, error) {
	payload := map[string]string{
		"auth_code":     code,
		"code_verifier": codeVerifier,
	}
	data, _ := json.Marshal(payload)
	req, err := c.newAnonRequest(ctx, http.MethodPost, c.authURL("token?grant_type=pkce"), bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	var session SupabaseAuthSession
	if err := c.doRequest(req, &session); err != nil {
		return nil, err
	}
	return &session, nil
}

// GetUser retrieves the authenticated user's details using the provided access token.
func (c *SupabaseAuthClient) GetUser(ctx context.Context, accessToken string) (*SupabaseAuthUser, error) {
	req, err := c.newUserRequest(ctx, http.MethodGet, c.authURL("user"), accessToken, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Del("Content-Type")
	var user SupabaseAuthUser
	if err := c.doRequest(req, &user); err != nil {
		return nil, err
	}
	return &user, nil
}

// --- Profile management (uses service role to bypass RLS) ---

// CreateProfile inserts a new row into the profiles table with default free tier.
func (c *SupabaseAuthClient) CreateProfile(ctx context.Context, profile UserProfile) error {
	if profile.SubscriptionType == "" {
		profile.SubscriptionType = "free"
	}
	data, _ := json.Marshal(profile)
	req, err := c.newAdminRequest(ctx, http.MethodPost, c.restURL("profiles"), bytes.NewReader(data))
	if err != nil {
		return err
	}
	req.Header.Set("Prefer", "return=minimal")

	resp, err := c.doWithTimeout(req)
	if err != nil {
		return fmt.Errorf("create profile: %w", err)
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 300 {
		return fmt.Errorf("create profile: status %d: %s", resp.StatusCode, body)
	}
	return nil
}

// GetProfile retrieves a user's profile record by user ID. Returns nil when not found.
func (c *SupabaseAuthClient) GetProfile(ctx context.Context, userID string) (*UserProfile, error) {
	req, err := c.newAdminRequest(ctx, http.MethodGet, c.restURL("profiles?id=eq."+userID), nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Del("Content-Type")

	resp, err := c.doWithTimeout(req)
	if err != nil {
		return nil, fmt.Errorf("get profile: %w", err)
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 300 {
		return nil, fmt.Errorf("get profile: status %d: %s", resp.StatusCode, body)
	}

	var profiles []UserProfile
	if err := json.Unmarshal(body, &profiles); err != nil {
		return nil, fmt.Errorf("unmarshal profile: %w", err)
	}
	if len(profiles) == 0 {
		return nil, nil
	}
	return &profiles[0], nil
}
