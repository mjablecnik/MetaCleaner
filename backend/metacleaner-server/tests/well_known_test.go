package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	src "metacleaner-server/source"
)

// TestHandleAssetLinks_ConfiguredFingerprint verifies that a configured
// AndroidCertFingerprint appears in the response JSON.
func TestHandleAssetLinks_ConfiguredFingerprint(t *testing.T) {
	const fingerprint = "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
	cfg := src.Config{AndroidCertFingerprint: fingerprint}

	req := httptest.NewRequest(http.MethodGet, "/.well-known/assetlinks.json", nil)
	rr := httptest.NewRecorder()
	src.HandleAssetLinks(cfg)(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	if ct := rr.Header().Get("Content-Type"); ct != "application/json" {
		t.Errorf("Content-Type = %q, want %q", ct, "application/json")
	}

	var payload []map[string]any
	if err := json.NewDecoder(rr.Body).Decode(&payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if len(payload) == 0 {
		t.Fatal("expected non-empty assetlinks payload")
	}
	body := rr.Body.String()
	// Re-read body since json.Decoder consumed it
	rr2 := httptest.NewRecorder()
	src.HandleAssetLinks(cfg)(rr2, req)
	if !strings.Contains(rr2.Body.String(), fingerprint) {
		t.Errorf("expected fingerprint %q in response, got: %s", fingerprint, rr2.Body.String())
	}
	_ = body
}

// TestHandleAssetLinks_EmptyFingerprint verifies that when AndroidCertFingerprint
// is empty, the response uses a placeholder value rather than an empty string.
func TestHandleAssetLinks_EmptyFingerprint(t *testing.T) {
	cfg := src.Config{AndroidCertFingerprint: ""}

	req := httptest.NewRequest(http.MethodGet, "/.well-known/assetlinks.json", nil)
	rr := httptest.NewRecorder()
	src.HandleAssetLinks(cfg)(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	body := rr.Body.String()
	if strings.Contains(body, `""`) {
		t.Error("empty fingerprint should use a placeholder, not an empty string")
	}
	if !strings.Contains(body, "PLACEHOLDER") {
		t.Errorf("expected PLACEHOLDER in response when fingerprint is empty, got: %s", body)
	}
}

// TestHandleAssetLinks_ValidJSONStructure verifies the response is a valid
// assetlinks JSON array with the expected namespace and package fields.
func TestHandleAssetLinks_ValidJSONStructure(t *testing.T) {
	cfg := src.Config{AndroidCertFingerprint: "AA:BB:CC"}

	req := httptest.NewRequest(http.MethodGet, "/.well-known/assetlinks.json", nil)
	rr := httptest.NewRecorder()
	src.HandleAssetLinks(cfg)(rr, req)

	var payload []struct {
		Relation []string `json:"relation"`
		Target   struct {
			Namespace              string   `json:"namespace"`
			PackageName            string   `json:"package_name"`
			SHA256CertFingerprints []string `json:"sha256_cert_fingerprints"`
		} `json:"target"`
	}
	if err := json.NewDecoder(rr.Body).Decode(&payload); err != nil {
		t.Fatalf("decode assetlinks JSON: %v", err)
	}
	if len(payload) == 0 {
		t.Fatal("assetlinks payload is empty")
	}
	entry := payload[0]
	if len(entry.Relation) == 0 {
		t.Error("assetlinks entry should have at least one relation")
	}
	if entry.Target.Namespace != "android_app" {
		t.Errorf("target namespace = %q, want %q", entry.Target.Namespace, "android_app")
	}
	if entry.Target.PackageName == "" {
		t.Error("target package_name should not be empty")
	}
	if len(entry.Target.SHA256CertFingerprints) == 0 {
		t.Error("sha256_cert_fingerprints should not be empty")
	}
	if entry.Target.SHA256CertFingerprints[0] != "AA:BB:CC" {
		t.Errorf("fingerprint = %q, want %q", entry.Target.SHA256CertFingerprints[0], "AA:BB:CC")
	}
}

// TestHandleAppleAppSiteAssociation_ConfiguredTeamID verifies that a configured
// AppleTeamID appears in the appID of the AASA response.
func TestHandleAppleAppSiteAssociation_ConfiguredTeamID(t *testing.T) {
	const teamID = "ABCD1234"
	cfg := src.Config{AppleTeamID: teamID}

	req := httptest.NewRequest(http.MethodGet, "/.well-known/apple-app-site-association", nil)
	rr := httptest.NewRecorder()
	src.HandleAppleAppSiteAssociation(cfg)(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	if ct := rr.Header().Get("Content-Type"); ct != "application/json" {
		t.Errorf("Content-Type = %q, want %q", ct, "application/json")
	}
	body := rr.Body.String()
	if !strings.Contains(body, teamID) {
		t.Errorf("expected teamID %q in response, got: %s", teamID, body)
	}
}

// TestHandleAppleAppSiteAssociation_EmptyTeamID verifies that when AppleTeamID
// is empty, the response uses a placeholder rather than an empty prefix.
func TestHandleAppleAppSiteAssociation_EmptyTeamID(t *testing.T) {
	cfg := src.Config{AppleTeamID: ""}

	req := httptest.NewRequest(http.MethodGet, "/.well-known/apple-app-site-association", nil)
	rr := httptest.NewRecorder()
	src.HandleAppleAppSiteAssociation(cfg)(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
	body := rr.Body.String()
	if strings.Contains(body, `".com.metacleaner.app"`) {
		t.Error("empty teamID should not produce an appID starting with a dot")
	}
	if !strings.Contains(body, "PLACEHOLDER") {
		t.Errorf("expected PLACEHOLDER when teamID is empty, got: %s", body)
	}
}

// TestHandleAppleAppSiteAssociation_ValidJSONStructure verifies the response has
// a valid AASA structure with applinks, details, and expected paths.
func TestHandleAppleAppSiteAssociation_ValidJSONStructure(t *testing.T) {
	cfg := src.Config{AppleTeamID: "TEAM0001"}

	req := httptest.NewRequest(http.MethodGet, "/.well-known/apple-app-site-association", nil)
	rr := httptest.NewRecorder()
	src.HandleAppleAppSiteAssociation(cfg)(rr, req)

	var payload struct {
		Applinks struct {
			Apps    []string `json:"apps"`
			Details []struct {
				AppID string   `json:"appID"`
				Paths []string `json:"paths"`
			} `json:"details"`
		} `json:"applinks"`
	}
	if err := json.NewDecoder(rr.Body).Decode(&payload); err != nil {
		t.Fatalf("decode AASA JSON: %v", err)
	}
	if len(payload.Applinks.Details) == 0 {
		t.Fatal("AASA details should not be empty")
	}
	detail := payload.Applinks.Details[0]
	if !strings.HasPrefix(detail.AppID, "TEAM0001.") {
		t.Errorf("appID should start with teamID, got %q", detail.AppID)
	}
	if len(detail.Paths) == 0 {
		t.Error("AASA detail paths should not be empty")
	}
}
