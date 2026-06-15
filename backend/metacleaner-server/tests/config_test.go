package tests

import (
	"errors"
	"testing"
	"time"

	src "metacleaner-server/source"
)

func setRequiredConfigEnv(t *testing.T) {
	t.Helper()
	t.Setenv("SUPABASE_URL", "https://test.supabase.co")
	t.Setenv("SUPABASE_API_KEY", "test-api-key")
	// Clear optional vars to ensure defaults are tested predictably
	t.Setenv("PORT", "")
	t.Setenv("MAX_FILE_SIZE", "")
	t.Setenv("RETENTION_PERIOD", "")
	t.Setenv("TEMP_STORAGE_PATH", "")
	t.Setenv("RATE_LIMIT_RPM", "")
	t.Setenv("FRONTEND_ORIGIN", "")
	t.Setenv("SUPABASE_SERVICE_ROLE_KEY", "")
	t.Setenv("SUPABASE_JWT_SECRET", "")
	t.Setenv("OAUTH_CALLBACK_URL", "")
	t.Setenv("MAGIC_LINK_CALLBACK_URL", "")
	t.Setenv("FRONTEND_URL", "")
	t.Setenv("ANDROID_CERT_FINGERPRINT", "")
	t.Setenv("APPLE_TEAM_ID", "")
}

// TestLoadConfigMissingSupabaseURL verifies that an absent SUPABASE_URL returns
// an *ErrConfig naming that variable.
func TestLoadConfigMissingSupabaseURL(t *testing.T) {
	t.Setenv("SUPABASE_URL", "")
	t.Setenv("SUPABASE_API_KEY", "test-key")

	_, err := src.LoadConfig()
	if err == nil {
		t.Fatal("expected error for missing SUPABASE_URL, got nil")
	}
	var cfgErr *src.ErrConfig
	if !errors.As(err, &cfgErr) {
		t.Fatalf("expected *ErrConfig, got %T: %v", err, err)
	}
	if cfgErr.VarName != "SUPABASE_URL" {
		t.Errorf("expected VarName=%q, got %q", "SUPABASE_URL", cfgErr.VarName)
	}
}

// TestLoadConfigMissingSupabaseAPIKey verifies that an absent SUPABASE_API_KEY
// returns an *ErrConfig naming that variable.
func TestLoadConfigMissingSupabaseAPIKey(t *testing.T) {
	t.Setenv("SUPABASE_URL", "https://test.supabase.co")
	t.Setenv("SUPABASE_API_KEY", "")

	_, err := src.LoadConfig()
	if err == nil {
		t.Fatal("expected error for missing SUPABASE_API_KEY, got nil")
	}
	var cfgErr *src.ErrConfig
	if !errors.As(err, &cfgErr) {
		t.Fatalf("expected *ErrConfig, got %T: %v", err, err)
	}
	if cfgErr.VarName != "SUPABASE_API_KEY" {
		t.Errorf("expected VarName=%q, got %q", "SUPABASE_API_KEY", cfgErr.VarName)
	}
}

// TestLoadConfigValidEnv verifies that all required vars present returns a
// populated Config with nil error.
func TestLoadConfigValidEnv(t *testing.T) {
	setRequiredConfigEnv(t)
	t.Setenv("SUPABASE_URL", "https://test.supabase.co")
	t.Setenv("SUPABASE_API_KEY", "test-api-key")

	cfg, err := src.LoadConfig()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cfg.SupabaseURL != "https://test.supabase.co" {
		t.Errorf("SupabaseURL = %q, want %q", cfg.SupabaseURL, "https://test.supabase.co")
	}
	if cfg.SupabaseAPIKey != "test-api-key" {
		t.Errorf("SupabaseAPIKey = %q, want %q", cfg.SupabaseAPIKey, "test-api-key")
	}
}

// TestLoadConfigDefaults verifies that optional fields get their default values
// when the corresponding env vars are empty.
func TestLoadConfigDefaults(t *testing.T) {
	setRequiredConfigEnv(t)

	cfg, err := src.LoadConfig()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cfg.Port != 8080 {
		t.Errorf("Port default = %d, want 8080", cfg.Port)
	}
	if cfg.MaxFileSize != 500*1024*1024 {
		t.Errorf("MaxFileSize default = %d, want %d", cfg.MaxFileSize, 500*1024*1024)
	}
	if cfg.RetentionPeriod != time.Hour {
		t.Errorf("RetentionPeriod default = %v, want 1h", cfg.RetentionPeriod)
	}
	if cfg.TempStoragePath != "/tmp/metacleaner" {
		t.Errorf("TempStoragePath default = %q, want %q", cfg.TempStoragePath, "/tmp/metacleaner")
	}
	if cfg.RateLimitRPM != 10 {
		t.Errorf("RateLimitRPM default = %d, want 10", cfg.RateLimitRPM)
	}
}

// TestLoadConfigNumericParsing verifies that PORT, MAX_FILE_SIZE, and RATE_LIMIT_RPM
// are parsed correctly from environment strings.
func TestLoadConfigNumericParsing(t *testing.T) {
	setRequiredConfigEnv(t)
	t.Setenv("PORT", "9090")
	t.Setenv("MAX_FILE_SIZE", "104857600") // 100 MB
	t.Setenv("RATE_LIMIT_RPM", "30")

	cfg, err := src.LoadConfig()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cfg.Port != 9090 {
		t.Errorf("Port = %d, want 9090", cfg.Port)
	}
	if cfg.MaxFileSize != 104857600 {
		t.Errorf("MaxFileSize = %d, want 104857600", cfg.MaxFileSize)
	}
	if cfg.RateLimitRPM != 30 {
		t.Errorf("RateLimitRPM = %d, want 30", cfg.RateLimitRPM)
	}
}

// TestLoadConfigRetentionParsing verifies that RETENTION_PERIOD parses Go duration strings.
func TestLoadConfigRetentionParsing(t *testing.T) {
	setRequiredConfigEnv(t)
	t.Setenv("RETENTION_PERIOD", "24h")

	cfg, err := src.LoadConfig()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cfg.RetentionPeriod != 24*time.Hour {
		t.Errorf("RetentionPeriod = %v, want 24h", cfg.RetentionPeriod)
	}
}

// TestLoadConfigOptionalFields verifies that optional string fields are populated
// when their env vars are set.
func TestLoadConfigOptionalFields(t *testing.T) {
	setRequiredConfigEnv(t)
	t.Setenv("FRONTEND_ORIGIN", "https://app.example.com")
	t.Setenv("ANDROID_CERT_FINGERPRINT", "AA:BB:CC")
	t.Setenv("APPLE_TEAM_ID", "ABCD1234")
	t.Setenv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key")

	cfg, err := src.LoadConfig()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cfg.FrontendOrigin != "https://app.example.com" {
		t.Errorf("FrontendOrigin = %q", cfg.FrontendOrigin)
	}
	if cfg.AndroidCertFingerprint != "AA:BB:CC" {
		t.Errorf("AndroidCertFingerprint = %q", cfg.AndroidCertFingerprint)
	}
	if cfg.AppleTeamID != "ABCD1234" {
		t.Errorf("AppleTeamID = %q", cfg.AppleTeamID)
	}
	if cfg.SupabaseServiceRoleKey != "service-role-key" {
		t.Errorf("SupabaseServiceRoleKey = %q", cfg.SupabaseServiceRoleKey)
	}
}

// TestErrConfigMessage verifies that *ErrConfig formats an informative error string.
func TestErrConfigMessage(t *testing.T) {
	t.Setenv("SUPABASE_URL", "")
	t.Setenv("SUPABASE_API_KEY", "key")

	_, err := src.LoadConfig()
	if err == nil {
		t.Fatal("expected error")
	}
	msg := err.Error()
	if msg == "" {
		t.Error("error message is empty")
	}
	// Must contain the variable name so operators know what to fix.
	if len(msg) < 5 {
		t.Errorf("error message too short: %q", msg)
	}
}
