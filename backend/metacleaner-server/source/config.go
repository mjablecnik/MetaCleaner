package source

import (
	"fmt"
	"log/slog"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// ErrConfig is returned by LoadConfig when a required environment variable is missing.
type ErrConfig struct {
	VarName string
	Hint    string
}

func (e *ErrConfig) Error() string {
	return fmt.Sprintf("missing required environment variable %s — %s", e.VarName, e.Hint)
}

type Config struct {
	Port                    int
	FrontendOrigin          string
	MaxFileSize             int64
	RetentionPeriod         time.Duration
	TempStoragePath         string
	SupabaseURL             string
	SupabaseAPIKey          string
	SupabaseServiceRoleKey  string
	SupabaseJWTSecret       string
	OAuthCallbackURL        string
	MagicLinkCallbackURL    string
	FrontendURL             string
	RateLimitRPM            int
	AndroidCertFingerprint  string
	AppleTeamID             string
	SupabaseTimeout         time.Duration
	MaxConcurrentJobs       int
	StripeSecretKey         string
	StripeWebhookSecret     string
	StripePriceProMonth     string
	StripePriceProYear      string
	StripePriceProPlusMonth string
	StripePriceProPlusYear  string
	StripePriceCreditPack   string
	BrevoAPIKey             string
	BrevoSenderEmail        string
	TigrisAccessKey         string
	TigrisSecretKey         string
	TigrisBucket            string
	TigrisEndpoint          string
	TigrisPresignExpiry     time.Duration
}

func LoadConfig() (Config, error) {
	_ = godotenv.Load()

	cfg := Config{
		Port:                8080,
		MaxFileSize:         500 * 1024 * 1024, // 500 MB
		RetentionPeriod:     time.Hour,
		TempStoragePath:     "/tmp/metacleaner",
		RateLimitRPM:        10,
		SupabaseTimeout:     30 * time.Second,
		MaxConcurrentJobs:   3,
		TigrisBucket:        "metacleaner-files",
		TigrisEndpoint:      "https://fly.storage.tigris.dev",
		TigrisPresignExpiry: time.Hour,
	}

	if v := os.Getenv("PORT"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			cfg.Port = n
		}
	}

	if v := os.Getenv("FRONTEND_ORIGIN"); v != "" {
		cfg.FrontendOrigin = v
	}

	if v := os.Getenv("MAX_FILE_SIZE"); v != "" {
		if n, err := strconv.ParseInt(v, 10, 64); err == nil {
			cfg.MaxFileSize = n
		}
	}

	if v := os.Getenv("RETENTION_PERIOD"); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			cfg.RetentionPeriod = d
		}
	}

	if v := os.Getenv("TEMP_STORAGE_PATH"); v != "" {
		cfg.TempStoragePath = v
	}

	if v := os.Getenv("RATE_LIMIT_RPM"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			cfg.RateLimitRPM = n
		}
	}

	if v := os.Getenv("SUPABASE_TIMEOUT"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			cfg.SupabaseTimeout = time.Duration(n) * time.Second
		}
	}

	if v := os.Getenv("MAX_CONCURRENT_JOBS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			cfg.MaxConcurrentJobs = n
		}
	}

	cfg.SupabaseURL = os.Getenv("SUPABASE_URL")
	cfg.SupabaseAPIKey = os.Getenv("SUPABASE_API_KEY")
	cfg.SupabaseServiceRoleKey = os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	cfg.SupabaseJWTSecret = os.Getenv("SUPABASE_JWT_SECRET")
	cfg.OAuthCallbackURL = os.Getenv("OAUTH_CALLBACK_URL")
	cfg.MagicLinkCallbackURL = os.Getenv("MAGIC_LINK_CALLBACK_URL")
	cfg.FrontendURL = os.Getenv("FRONTEND_URL")
	cfg.AndroidCertFingerprint = os.Getenv("ANDROID_CERT_FINGERPRINT")
	cfg.AppleTeamID = os.Getenv("APPLE_TEAM_ID")
	cfg.StripeSecretKey = os.Getenv("STRIPE_SECRET_KEY")
	cfg.StripeWebhookSecret = os.Getenv("STRIPE_WEBHOOK_SECRET")
	cfg.StripePriceProMonth = os.Getenv("STRIPE_PRICE_PRO_MONTH")
	cfg.StripePriceProYear = os.Getenv("STRIPE_PRICE_PRO_YEAR")
	cfg.StripePriceProPlusMonth = os.Getenv("STRIPE_PRICE_PROPLUS_MONTH")
	cfg.StripePriceProPlusYear = os.Getenv("STRIPE_PRICE_PROPLUS_YEAR")
	cfg.StripePriceCreditPack = os.Getenv("STRIPE_PRICE_CREDIT_PACK")
	cfg.BrevoAPIKey = os.Getenv("BREVO_API_KEY")
	cfg.BrevoSenderEmail = os.Getenv("BREVO_SENDER_EMAIL")
	if cfg.BrevoSenderEmail == "" {
		cfg.BrevoSenderEmail = "noreply@metacleaner.app"
	}

	cfg.TigrisAccessKey = os.Getenv("TIGRIS_ACCESS_KEY")
	cfg.TigrisSecretKey = os.Getenv("TIGRIS_SECRET_KEY")

	if v := os.Getenv("TIGRIS_BUCKET"); v != "" {
		cfg.TigrisBucket = v
	}

	// TIGRIS_ENDPOINT uses LookupEnv (not a plain != "" check) so that setting it to an
	// explicit empty string in .env disables Tigris and falls back to local file storage,
	// while leaving it unset keeps the production endpoint default.
	if v, ok := os.LookupEnv("TIGRIS_ENDPOINT"); ok {
		cfg.TigrisEndpoint = v
	}

	if v := os.Getenv("TIGRIS_PRESIGN_EXPIRY"); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			cfg.TigrisPresignExpiry = d
		}
	}

	if cfg.SupabaseURL == "" {
		return Config{}, &ErrConfig{
			VarName: "SUPABASE_URL",
			Hint:    "set it in .env or as an environment variable (e.g. SUPABASE_URL=https://xxx.supabase.co)",
		}
	}
	if cfg.SupabaseAPIKey == "" {
		return Config{}, &ErrConfig{
			VarName: "SUPABASE_API_KEY",
			Hint:    "set it in .env or as an environment variable; find it in the Supabase dashboard under Settings → API",
		}
	}

	slog.Info("config loaded", "port", cfg.Port, "maxFileSize", formatBytes(cfg.MaxFileSize), "retentionPeriod", cfg.RetentionPeriod)

	return cfg, nil
}

func formatBytes(b int64) string {
	const mb = 1024 * 1024
	if b >= mb {
		return fmt.Sprintf("%d MB", b/mb)
	}
	return fmt.Sprintf("%d B", b)
}
