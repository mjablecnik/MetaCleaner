package source

import (
	"net/url"
	"strings"
	"testing"
)

// newTestAuthClient constructs a SupabaseAuthClient with known field values for
// deterministic testing of pure URL/error helpers.
func newTestAuthClient(baseURL, oauthCallback string) *SupabaseAuthClient {
	return &SupabaseAuthClient{
		baseURL:       baseURL,
		oauthCallback: oauthCallback,
	}
}

// ─── authURL ─────────────────────────────────────────────────────────────────

func TestAuthURL_SimplePathAppended(t *testing.T) {
	c := newTestAuthClient("https://abc.supabase.co", "")
	got := c.authURL("signup")
	want := "https://abc.supabase.co/auth/v1/signup"
	if got != want {
		t.Errorf("authURL(%q) = %q, want %q", "signup", got, want)
	}
}

func TestAuthURL_ContainsAuthV1Prefix(t *testing.T) {
	c := newTestAuthClient("https://proj.supabase.co", "")
	got := c.authURL("token?grant_type=password")
	if !strings.Contains(got, "/auth/v1/") {
		t.Errorf("authURL result %q does not contain /auth/v1/", got)
	}
}

func TestAuthURL_EmptyPathGivesTrailingSlashInV1Segment(t *testing.T) {
	c := newTestAuthClient("https://x.supabase.co", "")
	got := c.authURL("")
	want := "https://x.supabase.co/auth/v1/"
	if got != want {
		t.Errorf("authURL(\"\") = %q, want %q", got, want)
	}
}

func TestAuthURL_NoDoubleSlash(t *testing.T) {
	c := newTestAuthClient("https://x.supabase.co", "")
	got := c.authURL("authorize")
	if strings.Contains(got, "//auth") {
		t.Errorf("authURL result %q contains double slash before /auth", got)
	}
}

// ─── restURL ─────────────────────────────────────────────────────────────────

func TestRestURL_SimplePathAppended(t *testing.T) {
	c := newTestAuthClient("https://abc.supabase.co", "")
	got := c.restURL("profiles")
	want := "https://abc.supabase.co/rest/v1/profiles"
	if got != want {
		t.Errorf("restURL(%q) = %q, want %q", "profiles", got, want)
	}
}

func TestRestURL_ContainsRestV1Prefix(t *testing.T) {
	c := newTestAuthClient("https://proj.supabase.co", "")
	got := c.restURL("profiles?id=eq.123")
	if !strings.Contains(got, "/rest/v1/") {
		t.Errorf("restURL result %q does not contain /rest/v1/", got)
	}
}

func TestRestURL_EmptyPath(t *testing.T) {
	c := newTestAuthClient("https://x.supabase.co", "")
	got := c.restURL("")
	want := "https://x.supabase.co/rest/v1/"
	if got != want {
		t.Errorf("restURL(\"\") = %q, want %q", got, want)
	}
}

// ─── GetOAuthURL ─────────────────────────────────────────────────────────────

func TestGetOAuthURL_ContainsProvider(t *testing.T) {
	c := newTestAuthClient("https://abc.supabase.co", "https://app.example.com/callback")
	raw := c.GetOAuthURL("google", "")
	parsed, err := url.Parse(raw)
	if err != nil {
		t.Fatalf("GetOAuthURL returned unparseable URL: %v", err)
	}
	q := parsed.Query()
	if got := q.Get("provider"); got != "google" {
		t.Errorf("provider param = %q, want %q", got, "google")
	}
}

func TestGetOAuthURL_ContainsRedirectTo(t *testing.T) {
	cb := "https://app.example.com/callback"
	c := newTestAuthClient("https://abc.supabase.co", cb)
	raw := c.GetOAuthURL("apple", "")
	parsed, _ := url.Parse(raw)
	q := parsed.Query()
	if got := q.Get("redirect_to"); got != cb {
		t.Errorf("redirect_to = %q, want %q", got, cb)
	}
}

func TestGetOAuthURL_WithCodeChallenge_IncludesPKCEParams(t *testing.T) {
	c := newTestAuthClient("https://abc.supabase.co", "https://app.example.com/callback")
	challenge := "abc123challenge"
	raw := c.GetOAuthURL("google", challenge)
	parsed, _ := url.Parse(raw)
	q := parsed.Query()

	if got := q.Get("code_challenge"); got != challenge {
		t.Errorf("code_challenge = %q, want %q", got, challenge)
	}
	if got := q.Get("code_challenge_method"); got != "s256" {
		t.Errorf("code_challenge_method = %q, want %q", got, "s256")
	}
}

func TestGetOAuthURL_WithoutCodeChallenge_OmitsPKCEParams(t *testing.T) {
	c := newTestAuthClient("https://abc.supabase.co", "https://app.example.com/callback")
	raw := c.GetOAuthURL("google", "")
	parsed, _ := url.Parse(raw)
	q := parsed.Query()

	if q.Has("code_challenge") {
		t.Errorf("expected no code_challenge param when codeChallenge is empty, got %q", q.Get("code_challenge"))
	}
	if q.Has("code_challenge_method") {
		t.Errorf("expected no code_challenge_method param when codeChallenge is empty, got %q", q.Get("code_challenge_method"))
	}
}

func TestGetOAuthURL_URLEncodesSpecialCharacters(t *testing.T) {
	c := newTestAuthClient("https://abc.supabase.co", "https://app.example.com/callback")
	challenge := "abc+/=challenge with spaces"
	raw := c.GetOAuthURL("google", challenge)
	// The raw URL string should not contain unencoded spaces or + signs in query
	// Verify the URL is parseable and the param round-trips correctly
	parsed, err := url.Parse(raw)
	if err != nil {
		t.Fatalf("GetOAuthURL returned unparseable URL with special chars: %v", err)
	}
	if got := parsed.Query().Get("code_challenge"); got != challenge {
		t.Errorf("code_challenge round-trip failed: got %q, want %q", got, challenge)
	}
}

func TestGetOAuthURL_PathIsAuthorize(t *testing.T) {
	c := newTestAuthClient("https://abc.supabase.co", "https://app.example.com/callback")
	raw := c.GetOAuthURL("google", "")
	parsed, _ := url.Parse(raw)
	if !strings.HasSuffix(parsed.Path, "/authorize") {
		t.Errorf("GetOAuthURL path = %q, want suffix /authorize", parsed.Path)
	}
}

// ─── SupabaseAuthError.Error() ───────────────────────────────────────────────

func TestSupabaseAuthError_Error_WithErrorCode(t *testing.T) {
	e := &SupabaseAuthError{
		StatusCode: 400,
		ErrorCode:  "invalid_credentials",
		Message:    "wrong password",
	}
	got := e.Error()
	want := "supabase auth 400 [invalid_credentials]: wrong password"
	if got != want {
		t.Errorf("Error() = %q, want %q", got, want)
	}
}

func TestSupabaseAuthError_Error_WithoutErrorCode(t *testing.T) {
	e := &SupabaseAuthError{
		StatusCode: 500,
		ErrorCode:  "",
		Message:    "internal server error",
	}
	got := e.Error()
	want := "supabase auth 500: internal server error"
	if got != want {
		t.Errorf("Error() = %q, want %q", got, want)
	}
}

func TestSupabaseAuthError_Error_EmptyErrorCodeFallsBackToSimpleFormat(t *testing.T) {
	e := &SupabaseAuthError{
		StatusCode: 401,
		Message:    "unauthorized",
	}
	got := e.Error()
	if strings.Contains(got, "[]") {
		t.Errorf("Error() should not include empty brackets: %q", got)
	}
	if !strings.Contains(got, "401") {
		t.Errorf("Error() should include status code: %q", got)
	}
}

func TestSupabaseAuthError_ImplementsErrorInterface(t *testing.T) {
	var err error = &SupabaseAuthError{StatusCode: 404, Message: "not found"}
	if err.Error() == "" {
		t.Error("Error() should return a non-empty string")
	}
}
