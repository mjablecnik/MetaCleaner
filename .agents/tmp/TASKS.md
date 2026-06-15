# Security Audit Tasks

- [x] 1. [HIGH] Validate fileID against localIDPattern in HandleCreateJob before filepath.Glob — backend/metacleaner-server/source/handlers.go:222
- [x] 2. [HIGH] Validate fileID against localIDPattern in HandleFileDownload before filepath.Glob — backend/metacleaner-server/source/handlers.go:363
- [x] 3. [HIGH] Reject CORS requests when FRONTEND_ORIGIN is empty instead of allowing wildcard — backend/metacleaner-server/source/router.go:13-16
- [x] 4. [HIGH] Delete old-code/ecosystem.config.js and old-code/.env containing live Stripe/Brevo keys, then rotate all keys — old-code/ecosystem.config.js:10-16
- [ ] 5. [MEDIUM] Add security headers middleware (X-Content-Type-Options, X-Frame-Options, HSTS) — backend/metacleaner-server/source/router.go
- [ ] 6. [MEDIUM] Restrict WebSocket Upgrader CheckOrigin to configured FRONTEND_ORIGIN — backend/metacleaner-server/source/websocket.go:10-12
- [ ] 7. [MEDIUM] Add rate limiting to file download endpoints (HandleFileDownload, HandleJobDownload) — backend/metacleaner-server/source/router.go:163-168
- [ ] 8. [LOW] Add http.MaxBytesReader on JSON body endpoints to prevent memory exhaustion — backend/metacleaner-server/source/handlers.go:204
- [ ] 9. [LOW] Increase generateFileID entropy from 4 bytes to 16 bytes — backend/metacleaner-server/source/handlers.go:44-49
