package tests

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	src "metacleaner-server/source"
)

func newCleanupAuthClient(t *testing.T, srv *httptest.Server) *src.SupabaseAuthClient {
	t.Helper()
	cfg := src.Config{
		SupabaseURL:            srv.URL,
		SupabaseServiceRoleKey: "test-service-key",
		SupabaseAPIKey:         "test-anon-key",
	}
	return src.NewSupabaseAuthClient(cfg)
}

func newCleanupDB(t *testing.T, srv *httptest.Server) *src.SupabaseClient {
	t.Helper()
	cfg := src.Config{
		SupabaseURL:            srv.URL,
		SupabaseServiceRoleKey: "test-service-key",
	}
	return src.NewSupabaseClient(cfg)
}


func TestRunCleanup_NoExpiredUsers_NoDeleteCalled(t *testing.T) {
	var deleteCalled int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if r.Method == http.MethodDelete {
			atomic.AddInt32(&deleteCalled, 1)
		}
		json.NewEncoder(w).Encode([]interface{}{})
	}))
	defer srv.Close()

	authClient := newCleanupAuthClient(t, srv)
	db := newCleanupDB(t, srv)
	scheduler := src.NewAccountCleanupScheduler(30*24*time.Hour, authClient, db)
	scheduler.RunCleanup(context.Background())

	if n := atomic.LoadInt32(&deleteCalled); n != 0 {
		t.Errorf("expected no delete calls when no expired users, got %d", n)
	}
}

func TestRunCleanup_SingleExpiredUser_DeletesUser(t *testing.T) {
	var (
		mu             sync.Mutex
		deletedUserIDs []string
	)

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch {
		case r.Method == http.MethodGet && strings.Contains(r.URL.Path, "/rest/v1/profiles"):
			json.NewEncoder(w).Encode([]map[string]string{{"id": "expired-user-1"}})

		case r.Method == http.MethodDelete && strings.Contains(r.URL.Path, "/auth/v1/admin/users/"):
			parts := strings.Split(r.URL.Path, "/")
			userID := parts[len(parts)-1]
			mu.Lock()
			deletedUserIDs = append(deletedUserIDs, userID)
			mu.Unlock()
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]interface{}{})

		default:
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	defer srv.Close()

	authClient := newCleanupAuthClient(t, srv)
	db := newCleanupDB(t, srv)
	scheduler := src.NewAccountCleanupScheduler(30*24*time.Hour, authClient, db)
	scheduler.RunCleanup(context.Background())

	mu.Lock()
	defer mu.Unlock()

	if len(deletedUserIDs) != 1 {
		t.Fatalf("expected 1 user deleted, got %d: %v", len(deletedUserIDs), deletedUserIDs)
	}
	if deletedUserIDs[0] != "expired-user-1" {
		t.Errorf("expected user expired-user-1 deleted, got %q", deletedUserIDs[0])
	}
}

func TestRunCleanup_MultipleExpiredUsers_AllDeleted(t *testing.T) {
	expiredIDs := []string{"uid-a", "uid-b", "uid-c"}
	var deleteCount int32

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch {
		case r.Method == http.MethodGet && strings.Contains(r.URL.Path, "/rest/v1/profiles"):
			rows := make([]map[string]string, len(expiredIDs))
			for i, id := range expiredIDs {
				rows[i] = map[string]string{"id": id}
			}
			json.NewEncoder(w).Encode(rows)

		case r.Method == http.MethodDelete && strings.Contains(r.URL.Path, "/auth/v1/admin/users/"):
			atomic.AddInt32(&deleteCount, 1)
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]interface{}{})

		default:
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	defer srv.Close()

	authClient := newCleanupAuthClient(t, srv)
	db := newCleanupDB(t, srv)
	scheduler := src.NewAccountCleanupScheduler(30*24*time.Hour, authClient, db)
	scheduler.RunCleanup(context.Background())

	if n := atomic.LoadInt32(&deleteCount); n != int32(len(expiredIDs)) {
		t.Errorf("expected %d deletes, got %d", len(expiredIDs), n)
	}
}

func TestRunCleanup_QueryFails_NoPanic(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"message":"db error"}`))
	}))
	defer srv.Close()

	authClient := newCleanupAuthClient(t, srv)
	db := newCleanupDB(t, srv)
	scheduler := src.NewAccountCleanupScheduler(30*24*time.Hour, authClient, db)

	defer func() {
		if r := recover(); r != nil {
			t.Errorf("RunCleanup panicked on query error: %v", r)
		}
	}()
	scheduler.RunCleanup(context.Background())
}

func TestRunCleanup_DeleteFails_ContinuesWithRemainingUsers(t *testing.T) {
	expiredIDs := []string{"del-ok", "del-fail", "del-ok-2"}
	var deleteAttempts int32

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch {
		case r.Method == http.MethodGet && strings.Contains(r.URL.Path, "/rest/v1/profiles"):
			rows := make([]map[string]string, len(expiredIDs))
			for i, id := range expiredIDs {
				rows[i] = map[string]string{"id": id}
			}
			json.NewEncoder(w).Encode(rows)

		case r.Method == http.MethodDelete && strings.Contains(r.URL.Path, "/auth/v1/admin/users/"):
			atomic.AddInt32(&deleteAttempts, 1)
			if strings.HasSuffix(r.URL.Path, "/del-fail") {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]interface{}{"message": "delete failed"})
			} else {
				w.WriteHeader(http.StatusOK)
				json.NewEncoder(w).Encode(map[string]interface{}{})
			}

		default:
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	defer srv.Close()

	authClient := newCleanupAuthClient(t, srv)
	db := newCleanupDB(t, srv)
	scheduler := src.NewAccountCleanupScheduler(30*24*time.Hour, authClient, db)

	defer func() {
		if r := recover(); r != nil {
			t.Errorf("RunCleanup panicked on delete error: %v", r)
		}
	}()
	scheduler.RunCleanup(context.Background())

	// All 3 deletes should be attempted even though one fails.
	if n := atomic.LoadInt32(&deleteAttempts); n != int32(len(expiredIDs)) {
		t.Errorf("expected %d delete attempts, got %d", len(expiredIDs), n)
	}
}
