package source

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"time"
)

// AccountCleanupScheduler periodically hard-deletes accounts that have been
// deactivated for longer than the grace period (30 days).
type AccountCleanupScheduler struct {
	gracePeriod time.Duration
	authClient  *SupabaseAuthClient
	db          *SupabaseClient
}

// NewAccountCleanupScheduler creates a scheduler with the given grace period.
func NewAccountCleanupScheduler(gracePeriod time.Duration, authClient *SupabaseAuthClient, db *SupabaseClient) *AccountCleanupScheduler {
	return &AccountCleanupScheduler{
		gracePeriod: gracePeriod,
		authClient:  authClient,
		db:          db,
	}
}

// Start runs an immediate check then schedules one every 6 hours until ctx is cancelled.
func (s *AccountCleanupScheduler) Start(ctx context.Context) {
	go s.RunCleanup(ctx)

	ticker := time.NewTicker(6 * time.Hour)
	go func() {
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				s.RunCleanup(ctx)
			case <-ctx.Done():
				return
			}
		}
	}()
}

// RunCleanup finds all profiles where deactivated_at < now - gracePeriod and hard-deletes them.
func (s *AccountCleanupScheduler) RunCleanup(ctx context.Context) {
	cutoff := time.Now().UTC().Add(-s.gracePeriod).Format(time.RFC3339)

	// Query profiles that have been deactivated longer than the grace period.
	userIDs, err := s.getExpiredDeactivatedUsers(ctx, cutoff)
	if err != nil {
		slog.Error("account-cleanup: failed to query expired accounts", "error", err)
		return
	}

	if len(userIDs) == 0 {
		return
	}

	slog.Info("account-cleanup: found expired deactivated accounts", "count", len(userIDs))

	for _, userID := range userIDs {
		if err := s.hardDeleteUser(ctx, userID); err != nil {
			slog.Error("account-cleanup: failed to hard-delete user", "userID", userID, "error", err)
		} else {
			slog.Info("account-cleanup: user permanently deleted", "userID", userID)
		}
	}
}

// getExpiredDeactivatedUsers queries profiles with deactivated_at before the cutoff time.
func (s *AccountCleanupScheduler) getExpiredDeactivatedUsers(ctx context.Context, cutoff string) ([]string, error) {
	url := s.authClient.restURL("profiles?deactivated_at=not.is.null&deactivated_at=lt." + cutoff + "&select=id")

	req, err := s.authClient.newAdminRequest(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Del("Content-Type")

	resp, err := s.authClient.doWithTimeout(req)
	if err != nil {
		return nil, fmt.Errorf("query expired profiles: %w", err)
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 300 {
		return nil, fmt.Errorf("query expired profiles: status %d: %s", resp.StatusCode, body)
	}

	var profiles []struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal(body, &profiles); err != nil {
		return nil, fmt.Errorf("unmarshal expired profiles: %w", err)
	}

	ids := make([]string, len(profiles))
	for i, p := range profiles {
		ids[i] = p.ID
	}
	return ids, nil
}

// hardDeleteUser permanently removes a user from auth.users, triggering SET NULL
// on cleaning_jobs, job_files, and cleaning_reports, and CASCADE on everything else.
func (s *AccountCleanupScheduler) hardDeleteUser(ctx context.Context, userID string) error {
	return s.authClient.AdminDeleteUser(ctx, userID)
}
