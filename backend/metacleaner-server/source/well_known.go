package source

import (
	"encoding/json"
	"net/http"
)

// assetLinksEntry represents one entry in the Digital Asset Links JSON file.
type assetLinksEntry struct {
	Relation []string         `json:"relation"`
	Target   assetLinksTarget `json:"target"`
}

type assetLinksTarget struct {
	Namespace              string   `json:"namespace"`
	PackageName            string   `json:"package_name"`
	SHA256CertFingerprints []string `json:"sha256_cert_fingerprints"`
}

// appleAppSiteAssociation represents the Apple App Site Association JSON file.
type appleAppSiteAssociation struct {
	Applinks appleApplinks `json:"applinks"`
}

type appleApplinks struct {
	Apps    []string         `json:"apps"`
	Details []appleAppDetail `json:"details"`
}

type appleAppDetail struct {
	AppID string   `json:"appID"`
	Paths []string `json:"paths"`
}

// HandleAssetLinks serves GET /.well-known/assetlinks.json for Android App Links domain verification.
func HandleAssetLinks(cfg Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fingerprint := cfg.AndroidCertFingerprint
		if fingerprint == "" {
			fingerprint = "PLACEHOLDER:CONFIGURE:ANDROID_CERT_FINGERPRINT"
		}

		payload := []assetLinksEntry{
			{
				Relation: []string{"delegate_permission/common.handle_all_urls"},
				Target: assetLinksTarget{
					Namespace:              "android_app",
					PackageName:            "com.metacleaner.app",
					SHA256CertFingerprints: []string{fingerprint},
				},
			},
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(payload)
	}
}

// HandleAppleAppSiteAssociation serves GET /.well-known/apple-app-site-association for iOS Universal Links.
func HandleAppleAppSiteAssociation(cfg Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		teamID := cfg.AppleTeamID
		if teamID == "" {
			teamID = "PLACEHOLDER"
		}

		payload := appleAppSiteAssociation{
			Applinks: appleApplinks{
				Apps: []string{},
				Details: []appleAppDetail{
					{
						AppID: teamID + ".com.metacleaner.app",
						Paths: []string{
							"/api/auth/oauth/callback",
							"/api/auth/magic-link/callback",
						},
					},
				},
			},
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(payload)
	}
}
