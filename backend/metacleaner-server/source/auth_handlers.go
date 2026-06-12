package source

import (
	"encoding/json"
	"log"
	"net/http"
	"regexp"
	"strings"
	"unicode/utf8"
)

// emailRegex validates the format: local-part@domain with at least one dot in domain.
var emailRegex = regexp.MustCompile(`^[^@\s]+@[^@\s]+\.[^@\s]+$`)

// HandleRegister handles POST /api/auth/register.
// Validates input, creates a Supabase auth user, and inserts a profile record.
func HandleRegister(authClient *SupabaseAuthClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req RegisterRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "invalid request body")
			return
		}

		if req.Email == "" {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "email is required")
			return
		}
		if req.FirstName == "" || strings.TrimSpace(req.FirstName) == "" {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "first_name is required and must not be empty")
			return
		}
		if req.LastName == "" || strings.TrimSpace(req.LastName) == "" {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "last_name is required and must not be empty")
			return
		}
		if req.Password == "" {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidRequest, "password is required")
			return
		}

		if !emailRegex.MatchString(req.Email) {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidEmail, "invalid email format")
			return
		}

		passLen := utf8.RuneCountInString(req.Password)
		if passLen < 8 || passLen > 72 {
			WriteError(w, http.StatusBadRequest, ErrAuthInvalidPassword, "password must be between 8 and 72 characters")
			return
		}

		user, err := authClient.SignUp(r.Context(), req.Email, req.Password, map[string]interface{}{
			"first_name": strings.TrimSpace(req.FirstName),
			"last_name":  strings.TrimSpace(req.LastName),
		})
		if err != nil {
			if authErr, ok := err.(*SupabaseAuthError); ok {
				if isEmailExistsError(authErr) {
					WriteError(w, http.StatusConflict, ErrAuthEmailExists, "an account with this email already exists")
					return
				}
				if authErr.StatusCode >= 500 {
					WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "authentication service temporarily unavailable")
					return
				}
			}
			WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "authentication service temporarily unavailable")
			return
		}

		if err := authClient.CreateProfile(r.Context(), UserProfile{
			ID:               user.ID,
			FirstName:        strings.TrimSpace(req.FirstName),
			LastName:         strings.TrimSpace(req.LastName),
			Email:            req.Email,
			SubscriptionType: "free",
			Credits:          3,
		}); err != nil {
			log.Printf("register: failed to create profile for user %s: %v", user.ID, err)
			WriteError(w, http.StatusServiceUnavailable, ErrAuthProviderUnavailable, "authentication service temporarily unavailable")
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(RegisterResponse{
			Message: "Registration successful. Please check your email to confirm your account.",
		})
	}
}

// isEmailExistsError reports whether the Supabase error indicates a duplicate email.
func isEmailExistsError(e *SupabaseAuthError) bool {
	if e.StatusCode == 422 {
		switch e.ErrorCode {
		case "user_already_exists", "email_exists", "email_address_already_registered":
			return true
		}
		msg := strings.ToLower(e.Message)
		if strings.Contains(msg, "already registered") || strings.Contains(msg, "already exists") {
			return true
		}
	}
	return false
}
