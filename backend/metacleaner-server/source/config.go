package source

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                   int
	FrontendOrigin         string
	MaxFileSize            int64
	RetentionPeriod        time.Duration
	TempStoragePath        string
	SupabaseURL            string
	SupabaseAPIKey         string
	SupabaseServiceRoleKey string
	SupabaseJWTSecret      string
	OAuthCallbackURL       string
	MagicLinkCallbackURL   string
	FrontendURL            string
	RateLimitRPM           int
	AndroidCertFingerprint string
	AppleTeamID            string
}

func LoadConfig() Config {
	_ = godotenv.Load()

	cfg := Config{
		Port:            8080,
		MaxFileSize:     500 * 1024 * 1024, // 500 MB
		RetentionPeriod: time.Hour,
		TempStoragePath: "/tmp/metacleaner",
		RateLimitRPM:    10,
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

	cfg.SupabaseURL = os.Getenv("SUPABASE_URL")
	cfg.SupabaseAPIKey = os.Getenv("SUPABASE_API_KEY")
	cfg.SupabaseServiceRoleKey = os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	cfg.SupabaseJWTSecret = os.Getenv("SUPABASE_JWT_SECRET")
	cfg.OAuthCallbackURL = os.Getenv("OAUTH_CALLBACK_URL")
	cfg.MagicLinkCallbackURL = os.Getenv("MAGIC_LINK_CALLBACK_URL")
	cfg.FrontendURL = os.Getenv("FRONTEND_URL")
	cfg.AndroidCertFingerprint = os.Getenv("ANDROID_CERT_FINGERPRINT")
	cfg.AppleTeamID = os.Getenv("APPLE_TEAM_ID")

	if cfg.SupabaseURL == "" {
		log.Fatal("SUPABASE_URL environment variable is required")
	}
	if cfg.SupabaseAPIKey == "" {
		log.Fatal("SUPABASE_API_KEY environment variable is required")
	}

	log.Printf("Config loaded: port=%d, maxFileSize=%s, retentionPeriod=%s",
		cfg.Port, formatBytes(cfg.MaxFileSize), cfg.RetentionPeriod)

	return cfg
}

func formatBytes(b int64) string {
	const mb = 1024 * 1024
	if b >= mb {
		return fmt.Sprintf("%d MB", b/mb)
	}
	return fmt.Sprintf("%d B", b)
}
