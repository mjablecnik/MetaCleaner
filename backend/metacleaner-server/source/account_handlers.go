package source

import (
	"encoding/json"
	"net/http"
)

// HandleAccount handles GET /api/account.
// Returns the authenticated user's credits, plan, and rate limit.
func HandleAccount(cfg Config, db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		if userID == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "authentication required")
			return
		}

		subCredits, purchasedCredits, err := db.GetCreditBalance(r.Context(), userID)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to retrieve account information")
			return
		}

		plan := "free"
		sub, err := db.GetSubscriptionByUserID(r.Context(), userID)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to retrieve account information")
			return
		}
		if sub != nil && sub.Status == "active" {
			plan = sub.PlanID
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"credits_remaining": subCredits + purchasedCredits,
			"plan":              plan,
			"rate_limit_rpm":    cfg.RateLimitRPM,
		})
	}
}
