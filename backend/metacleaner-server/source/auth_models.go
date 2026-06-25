package source

// Auth error codes — returned in ErrorResponse.Error field.
const (
	ErrAuthInvalidRequest      = "AUTH_INVALID_REQUEST"
	ErrAuthInvalidEmail        = "AUTH_INVALID_EMAIL"
	ErrAuthInvalidPassword     = "AUTH_INVALID_PASSWORD"
	ErrAuthEmailExists         = "AUTH_EMAIL_EXISTS"
	ErrAuthEmailNotConfirmed   = "AUTH_EMAIL_NOT_CONFIRMED"
	ErrAuthInvalidCredentials  = "AUTH_INVALID_CREDENTIALS"
	ErrAuthSessionExpired      = "AUTH_SESSION_EXPIRED"
	ErrAuthProviderUnavailable = "AUTH_PROVIDER_UNAVAILABLE"
	ErrAuthInvalidCode         = "AUTH_INVALID_CODE"
	ErrAuthInvalidProvider   = "AUTH_INVALID_PROVIDER"
	ErrAuthResetTokenInvalid = "AUTH_RESET_TOKEN_INVALID"
)

// --- Request structs ---

// RegisterRequest is the body expected at POST /api/auth/register.
type RegisterRequest struct {
	Email     string `json:"email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Password  string `json:"password"`
}

// LoginRequest is the body expected at POST /api/auth/login.
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// RefreshRequest is the body expected at POST /api/auth/refresh.
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

// ForgotPasswordRequest is the body expected at POST /api/auth/forgot-password.
type ForgotPasswordRequest struct {
	Email string `json:"email"`
}

// VerifyResetCodeRequest is the body expected at POST /api/auth/verify-reset-code.
type VerifyResetCodeRequest struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

// ResetPasswordRequest is the body expected at POST /api/auth/reset-password.
type ResetPasswordRequest struct {
	Password string `json:"password"`
}

// MagicLinkRequest is the body expected at POST /api/auth/magic-link.
type MagicLinkRequest struct {
	Email string `json:"email"`
}

// UpdateProfileRequest is the body expected at PATCH /api/auth/profile.
type UpdateProfileRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

// ChangeEmailRequest is the body expected at POST /api/auth/change-email.
type ChangeEmailRequest struct {
	NewEmail string `json:"new_email"`
}

// ChangePasswordRequest is the body expected at POST /api/auth/change-password.
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

// --- Response structs ---

// AuthUser contains the subset of user data returned to the frontend.
type AuthUser struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

// AuthSession wraps the token fields returned after a successful login or refresh.
type AuthSession struct {
	AccessToken  string   `json:"access_token"`
	RefreshToken string   `json:"refresh_token"`
	ExpiresIn    int      `json:"expires_in"`
	User         AuthUser `json:"user"`
}

// RegisterResponse is returned on HTTP 201 after a successful registration.
type RegisterResponse struct {
	Message string `json:"message"`
}

// LogoutResponse is returned on HTTP 200 after a successful logout.
type LogoutResponse struct {
	Message string `json:"message"`
}

// ForgotPasswordResponse is returned on HTTP 200 after a forgot-password request
// (regardless of whether the email exists, to prevent enumeration).
type ForgotPasswordResponse struct {
	Message string `json:"message"`
}

// VerifyResetCodeResponse is returned on HTTP 200 after a successful OTP verification.
// The AccessToken authorises only the reset-password endpoint.
type VerifyResetCodeResponse struct {
	AccessToken string `json:"access_token"`
}

// ResetPasswordResponse is returned on HTTP 200 after a successful password reset.
type ResetPasswordResponse struct {
	Message string `json:"message"`
}

// MagicLinkResponse is returned on HTTP 200 after a magic-link request.
type MagicLinkResponse struct {
	Message string `json:"message"`
}
