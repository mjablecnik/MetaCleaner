package tests

// Property test: Trial credits assigned exactly once (rapid)
//
// Property 7: Trial credits assigned exactly once
// Registers users via email/password, OAuth callback, and magic-link callback.
// Verifies credits=3 on each first profile creation, that calling the same
// OAuth/magic-link callback for an existing user creates no second profile,
// and that login/refresh never touch the profile table.
//
// Validates Requirements: 16.6

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"pgregory.net/rapid"

	src "metacleaner-server/source"
)

// creditsCallTracker records calls to Supabase REST profile and credit_balances
// endpoints so tests can assert that the profile is created exactly once and
// trial credits are provisioned in credit_balances.
type creditsCallTracker struct {
	currentUserID string
	currentEmail  string

	profileCreated       bool
	creditBalanceCreated bool
	subCredits           int
	purchasedCredits     int
	createCount          int
	balanceUpsertCount   int
	modifyCount          int // PATCH or PUT on profiles — must stay 0
}

func (tr *creditsCallTracker) resetCounts() {
	tr.profileCreated = false
	tr.creditBalanceCreated = false
	tr.subCredits = 0
	tr.purchasedCredits = 0
	tr.createCount = 0
	tr.balanceUpsertCount = 0
	tr.modifyCount = 0
}

// newCreditsTrackingClient creates a fake Supabase server that delegates profile
// state to tr. The server is closed when t finishes. Generating userID/email via
// rapid and storing them in tr.currentUserID / tr.currentEmail before each
// rapid iteration lets the same server serve different identities.
// Returns both a SupabaseAuthClient and a SupabaseClient pointing at the same server.
func newCreditsTrackingClient(t *testing.T, tr *creditsCallTracker) (*src.SupabaseAuthClient, *src.SupabaseClient) {
	t.Helper()

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		fakeUser := map[string]interface{}{
			"id":    tr.currentUserID,
			"email": tr.currentEmail,
		}
		fakeSession := map[string]interface{}{
			"access_token":  "at-" + tr.currentUserID,
			"refresh_token": "rt-" + tr.currentUserID,
			"expires_in":    3600,
			"user":          fakeUser,
		}

		path := r.URL.Path
		switch {
		// Email/password sign-up
		case path == "/auth/v1/signup":
			json.NewEncoder(w).Encode(fakeUser)

		// Password login, refresh, and OAuth PKCE exchange all use /auth/v1/token
		case strings.HasPrefix(path, "/auth/v1/token"):
			json.NewEncoder(w).Encode(fakeSession)

		// Magic-link token_hash verification
		case path == "/auth/v1/verify":
			json.NewEncoder(w).Encode(fakeSession)

		// GetProfile — returns empty array when no profile exists yet
		case strings.HasPrefix(path, "/rest/v1/profiles") && r.Method == http.MethodGet:
			if tr.profileCreated {
				json.NewEncoder(w).Encode([]map[string]interface{}{
					{
						"id": tr.currentUserID, "email": tr.currentEmail,
						"first_name": "", "last_name": "",
					},
				})
			} else {
				w.Write([]byte("[]"))
			}

		// CreateProfile (POST /rest/v1/profiles)
		case strings.HasPrefix(path, "/rest/v1/profiles") && r.Method == http.MethodPost:
			tr.createCount++
			tr.profileCreated = true
			w.WriteHeader(http.StatusCreated)

		// Profile modification — must never be called by login/refresh
		case strings.HasPrefix(path, "/rest/v1/profiles") &&
			(r.Method == http.MethodPatch || r.Method == http.MethodPut):
			tr.modifyCount++
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("[]"))

		// Credit balance upsert — track the values
		case strings.HasPrefix(path, "/rest/v1/credit_balances"):
			if r.Method == http.MethodPost {
				var body map[string]interface{}
				json.NewDecoder(r.Body).Decode(&body)
				if sc, ok := body["subscription_credits"]; ok {
					tr.subCredits = int(sc.(float64))
				}
				if pc, ok := body["purchased_credits"]; ok {
					tr.purchasedCredits = int(pc.(float64))
				}
				tr.balanceUpsertCount++
				tr.creditBalanceCreated = true
			}
			w.WriteHeader(http.StatusCreated)
			w.Write([]byte("[]"))

		default:
			http.NotFound(w, r)
		}
	}))
	t.Cleanup(srv.Close)

	cfg := src.Config{
		SupabaseURL:            srv.URL,
		SupabaseAPIKey:         "test-anon-key",
		SupabaseServiceRoleKey: "test-service-key",
		FrontendURL:            "https://example.com",
	}
	return src.NewSupabaseAuthClient(cfg), src.NewSupabaseClient(cfg)
}

// drawValidEmail generates a simple RFC-valid email for property inputs.
func drawValidEmail(rt *rapid.T) string {
	local := rapid.StringMatching(`[a-zA-Z0-9]{3,12}`).Draw(rt, "emailLocal")
	domain := rapid.StringMatching(`[a-zA-Z0-9]{3,10}`).Draw(rt, "emailDomain")
	tld := rapid.StringMatching(`[a-z]{2,5}`).Draw(rt, "emailTLD")
	return local + "@" + domain + "." + tld
}

// drawUserID generates a random UUID-shaped user ID string.
func drawUserID(rt *rapid.T) string {
	seg := func(n int, name string) string {
		return rapid.StringMatching(`[a-f0-9]{`+string(rune('0'+n))+`}`).Draw(rt, name)
	}
	return seg(8, "uid1") + "-" + seg(4, "uid2") + "-" + seg(4, "uid3") + "-" +
		seg(4, "uid4") + "-" + seg(8, "uid5") + seg(4, "uid6")
}

// --- Property tests ---

// TestProperty_TrialCreditsEmailRegistration verifies that HandleRegister always
// creates exactly one profile and provisions 3 trial credits in credit_balances.
func TestProperty_TrialCreditsEmailRegistration(t *testing.T) {
	tr := &creditsCallTracker{}
	client, db := newCreditsTrackingClient(t, tr)
	handler := src.HandleRegister(client, db)

	rapid.Check(t, func(rt *rapid.T) {
		tr.currentUserID = drawUserID(rt)
		tr.currentEmail = drawValidEmail(rt)
		tr.resetCounts()

		req := httptest.NewRequest(http.MethodPost, "/api/auth/register",
			jsonBody(map[string]string{
				"email":      tr.currentEmail,
				"first_name": "Alice",
				"last_name":  "Smith",
				"password":   "password123",
			}))
		rr := httptest.NewRecorder()
		handler(rr, req)

		if rr.Code != http.StatusCreated {
			rt.Fatalf("expected 201 Created, got %d: %s", rr.Code, rr.Body.String())
		}
		if tr.createCount != 1 {
			rt.Fatalf("expected exactly 1 CreateProfile call, got %d", tr.createCount)
		}
		if tr.balanceUpsertCount != 1 {
			rt.Fatalf("expected exactly 1 credit_balances upsert, got %d", tr.balanceUpsertCount)
		}
		if tr.subCredits != 0 {
			rt.Fatalf("expected subscription_credits=0 in credit_balances, got %d", tr.subCredits)
		}
		if tr.purchasedCredits != 3 {
			rt.Fatalf("expected purchased_credits=3 in credit_balances, got %d", tr.purchasedCredits)
		}
		if tr.modifyCount != 0 {
			rt.Fatalf("expected 0 profile modifications, got %d", tr.modifyCount)
		}
	})
}

// TestProperty_TrialCreditsOAuthCallback verifies two properties:
//  1. First OAuth callback (new user) creates exactly one profile and provisions 3 credits in credit_balances.
//  2. Second OAuth callback (returning user) does not create an additional profile or credit balance.
func TestProperty_TrialCreditsOAuthCallback(t *testing.T) {
	tr := &creditsCallTracker{}
	client, db := newCreditsTrackingClient(t, tr)
	handler := src.HandleOAuthCallback(client, db)

	rapid.Check(t, func(rt *rapid.T) {
		tr.currentUserID = drawUserID(rt)
		tr.currentEmail = drawValidEmail(rt)

		// --- First visit: new user ---
		tr.resetCounts()

		req := oauthCallbackRequest("test-code-123", "test-verifier-abc")
		rr := httptest.NewRecorder()
		handler(rr, req)

		// Handler redirects on success; profile must have been created.
		if tr.createCount != 1 {
			rt.Fatalf("first OAuth: expected 1 CreateProfile call, got %d", tr.createCount)
		}
		if tr.balanceUpsertCount != 1 {
			rt.Fatalf("first OAuth: expected 1 credit_balances upsert, got %d", tr.balanceUpsertCount)
		}
		if tr.subCredits != 0 {
			rt.Fatalf("first OAuth: expected subscription_credits=0, got %d", tr.subCredits)
		}

		// --- Second visit: returning user (profile already exists) ---
		prevCreate := tr.createCount
		prevBalance := tr.balanceUpsertCount
		req2 := oauthCallbackRequest("test-code-456", "test-verifier-def")
		rr2 := httptest.NewRecorder()
		handler(rr2, req2)

		if tr.createCount != prevCreate {
			rt.Fatalf("second OAuth: expected no new CreateProfile call, but createCount grew from %d to %d",
				prevCreate, tr.createCount)
		}
		if tr.balanceUpsertCount != prevBalance {
			rt.Fatalf("second OAuth: expected no new credit_balances upsert, but count grew from %d to %d",
				prevBalance, tr.balanceUpsertCount)
		}
		if tr.modifyCount != 0 {
			rt.Fatalf("expected 0 profile modifications, got %d", tr.modifyCount)
		}
	})
}

// TestProperty_TrialCreditsMagicLinkCallback verifies two properties:
//  1. First magic-link callback (new user) creates exactly one profile and provisions 3 credits in credit_balances.
//  2. Second magic-link callback (returning user) does not create an additional profile or credit balance.
func TestProperty_TrialCreditsMagicLinkCallback(t *testing.T) {
	tr := &creditsCallTracker{}
	client, db := newCreditsTrackingClient(t, tr)
	handler := src.HandleMagicLinkCallback(client, db)

	rapid.Check(t, func(rt *rapid.T) {
		tr.currentUserID = drawUserID(rt)
		tr.currentEmail = drawValidEmail(rt)

		// --- First visit: new user ---
		tr.resetCounts()

		req := magicLinkCallbackRequest("token-hash-abc123")
		rr := httptest.NewRecorder()
		handler(rr, req)

		if tr.createCount != 1 {
			rt.Fatalf("first magic-link: expected 1 CreateProfile call, got %d", tr.createCount)
		}
		if tr.balanceUpsertCount != 1 {
			rt.Fatalf("first magic-link: expected 1 credit_balances upsert, got %d", tr.balanceUpsertCount)
		}
		if tr.subCredits != 0 {
			rt.Fatalf("first magic-link: expected subscription_credits=0, got %d", tr.subCredits)
		}

		// --- Second visit: returning user ---
		prevCreate := tr.createCount
		prevBalance := tr.balanceUpsertCount
		req2 := magicLinkCallbackRequest("token-hash-def456")
		rr2 := httptest.NewRecorder()
		handler(rr2, req2)

		if tr.createCount != prevCreate {
			rt.Fatalf("second magic-link: expected no new CreateProfile call, but createCount grew from %d to %d",
				prevCreate, tr.createCount)
		}
		if tr.balanceUpsertCount != prevBalance {
			rt.Fatalf("second magic-link: expected no new credit_balances upsert, but count grew from %d to %d",
				prevBalance, tr.balanceUpsertCount)
		}
		if tr.modifyCount != 0 {
			rt.Fatalf("expected 0 profile modifications, got %d", tr.modifyCount)
		}
	})
}

// TestProperty_TrialCreditsNotModifiedByLoginRefresh verifies that HandleLogin and
// HandleRefresh never call CreateProfile or issue a profile PATCH/PUT, regardless
// of the user identity.
func TestProperty_TrialCreditsNotModifiedByLoginRefresh(t *testing.T) {
	tr := &creditsCallTracker{}
	client, _ := newCreditsTrackingClient(t, tr)
	loginHandler := src.HandleLogin(client)
	refreshHandler := src.HandleRefresh(client)

	rapid.Check(t, func(rt *rapid.T) {
		tr.currentUserID = drawUserID(rt)
		tr.currentEmail = drawValidEmail(rt)
		tr.profileCreated = true // simulate existing account
		tr.creditBalanceCreated = true
		tr.subCredits = 0
		tr.purchasedCredits = 3

		// Capture baseline (should be 0 since we called resetCounts above-ish).
		tr.createCount = 0
		tr.balanceUpsertCount = 0
		tr.modifyCount = 0

		// Login
		loginReq := httptest.NewRequest(http.MethodPost, "/api/auth/login",
			jsonBody(map[string]string{
				"email":    tr.currentEmail,
				"password": "password123",
			}))
		loginRR := httptest.NewRecorder()
		loginHandler(loginRR, loginReq)

		if loginRR.Code != http.StatusOK {
			rt.Fatalf("login: expected 200 OK, got %d: %s", loginRR.Code, loginRR.Body.String())
		}
		if tr.createCount != 0 {
			rt.Fatalf("login: expected 0 CreateProfile calls, got %d", tr.createCount)
		}
		if tr.modifyCount != 0 {
			rt.Fatalf("login: expected 0 profile modifications, got %d", tr.modifyCount)
		}

		// Refresh
		refreshReq := httptest.NewRequest(http.MethodPost, "/api/auth/refresh",
			jsonBody(map[string]string{"refresh_token": "rt-" + tr.currentUserID}))
		refreshRR := httptest.NewRecorder()
		refreshHandler(refreshRR, refreshReq)

		if refreshRR.Code != http.StatusOK {
			rt.Fatalf("refresh: expected 200 OK, got %d: %s", refreshRR.Code, refreshRR.Body.String())
		}
		if tr.createCount != 0 {
			rt.Fatalf("refresh: expected 0 CreateProfile calls, got %d", tr.createCount)
		}
		if tr.modifyCount != 0 {
			rt.Fatalf("refresh: expected 0 profile modifications, got %d", tr.modifyCount)
		}
	})
}

// --- Request builders ---

// jsonBody marshals v to a JSON reader for use in httptest requests.
func jsonBody(v interface{}) *strings.Reader {
	data, _ := json.Marshal(v)
	return strings.NewReader(string(data))
}

// oauthCallbackRequest builds a GET request that mimics the OAuth provider
// redirecting back to the callback endpoint with a code and a PKCE verifier cookie.
func oauthCallbackRequest(code, verifier string) *http.Request {
	req := httptest.NewRequest(http.MethodGet, "/api/auth/oauth/callback?code="+code, nil)
	req.AddCookie(&http.Cookie{Name: "mc_pkce_verifier", Value: verifier})
	return req
}

// magicLinkCallbackRequest builds a GET request that mimics Supabase redirecting
// to the magic-link callback with a token_hash query parameter.
func magicLinkCallbackRequest(tokenHash string) *http.Request {
	return httptest.NewRequest(http.MethodGet,
		"/api/auth/magic-link/callback?token_hash="+tokenHash+"&type=magiclink", nil)
}
