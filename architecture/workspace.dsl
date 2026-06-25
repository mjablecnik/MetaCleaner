workspace "MetaCleaner" "Privacy-focused SaaS platform for stripping hidden metadata from photos and videos. Built as a monorepo with Go backend, SvelteKit frontends, Capacitor Android app, and Bun CLI tool." {

    !identifiers hierarchical

    configuration {
        scope softwaresystem
    }

    model {

        # ==========================================================================
        # PEOPLE
        # ==========================================================================

        user = person "User" "Privacy-conscious individual who wants to strip metadata (EXIF, GPS coordinates, camera info, timestamps) from photos and videos. Accesses MetaCleaner via a web browser or Android mobile app." {
            tags "Person"
        }

        developer = person "Developer / Power User" "Technical user who integrates MetaCleaner into scripts or automated CI/CD pipelines via the CLI tool or the REST API using API keys." {
            tags "Person"
        }

        # ==========================================================================
        # EXTERNAL SYSTEMS
        # ==========================================================================

        supabase = softwareSystem "Supabase" "Cloud platform providing managed PostgreSQL database, JWT-based authentication (email/password, OAuth, magic link), and S3-compatible file storage for PDF cleaning reports." {
            tags "External System"
        }

        stripe = softwareSystem "Stripe" "Payment processing platform for subscription management (Pro, ProPlus — monthly and yearly tiers) and credit pack purchases." {
            tags "External System"
        }

        exiftool = softwareSystem "ExifTool" "Command-line tool executed by the backend to read and remove metadata from image files. Supports JPEG, PNG, HEIC, HEIF, AVIF, TIFF, DNG, WebP, and GIF." {
            tags "External System" "System Tool"
        }

        ffmpeg = softwareSystem "FFmpeg" "Command-line tool executed by the backend to remove metadata from video files. Supports MP4, MOV, AVI, MKV, WebM, WMV, FLV, 3GP, MPEG, OGV, and MTS." {
            tags "External System" "System Tool"
        }

        brevo = softwareSystem "Brevo" "Email marketing platform used to handle contact form submissions from the MetaCleaner marketing website." {
            tags "External System"
        }

        # ==========================================================================
        # METACLEANER — MAIN SOFTWARE SYSTEM
        # ==========================================================================

        metacleaner = softwareSystem "MetaCleaner" "Privacy-focused SaaS platform that removes hidden metadata (EXIF, GPS, camera info, timestamps, XMP, ID3, MP4 atoms) from photos and videos. Supports 20+ image and video formats. Offers web, mobile (Android), and terminal interfaces." {

            # ------------------------------------------------------------------
            # CONTAINER: Marketing Website
            # ------------------------------------------------------------------
            marketingWebsite = container "Marketing Website" "Public-facing static website presenting MetaCleaner's features, pricing plans, and company information. Includes a contact form. Fully pre-rendered static HTML/CSS/JS — no server runtime required." "SvelteKit 2, Svelte 5, TypeScript, Tailwind CSS 4, Paraglide JS (i18n en/cs), nginx" {
                tags "Static Site"
            }

            # ------------------------------------------------------------------
            # CONTAINER: Shared Component Library
            # ------------------------------------------------------------------
            sharedLib = container "Shared Component Library" "Internal npm workspace package (metacleaner-shared) providing reusable Svelte 5 pricing UI components (PricingCard, PricingPlansSection, BillingToggle, EnterpriseBanner) and shared TypeScript pricing tier data. Consumed by both the Web App and the Marketing Website." "TypeScript, Svelte 5" {
                tags "Library"
            }

            # ------------------------------------------------------------------
            # CONTAINER: Web Application
            # ------------------------------------------------------------------
            webApp = container "Web Application" "Single-page application for the complete MetaCleaner user workflow. Users upload files, view a client-side privacy risk analysis, monitor real-time cleaning progress via WebSocket, download cleaned files, and manage their account, subscription, and API keys. Deployed as a static build." "SvelteKit 2, Svelte 5, TypeScript, Tailwind CSS 4, Paraglide JS (i18n en/cs), Capacitor (Android build)" {
                tags "Web Browser"

                authModule = component "Auth Module" "Manages the complete authentication lifecycle: login, registration, logout, OAuth social login, magic link (passwordless), and password reset flows. Stores JWT access and refresh tokens in localStorage. Automatically refreshes expired access tokens." "Svelte 5 Runes, TypeScript"

                apiClient = component "API Client" "Central HTTP client for all REST API calls to the backend. Builds and manages WebSocket connections for job progress streaming. Attaches Bearer tokens to every authenticated request." "TypeScript, Fetch API, WebSocket"

                metadataScanner = component "Client-side Metadata Scanner" "Reads and parses EXIF and media metadata directly in the browser before any file is uploaded. Gives the user an instant privacy risk preview without a server round-trip." "exifr, exifreader, mediainfo.js"

                riskAnalyzer = component "Risk Analyzer" "Calculates privacy risk scores and severity levels (low / medium / high / critical) for each detected metadata field based on configurable rules. Includes AI-generated content detection." "TypeScript"

                uploadWizard = component "Upload Wizard" "Orchestrates the multi-step guided workflow: Step 1 (file selection) → Step 2 (risk analysis preview) → Step 3 (real-time processing with progress) → Step 4 (error handling) → Step 5 (download cleaned results)." "Svelte 5 Components"

                billingUI = component "Billing & Subscription UI" "Displays the user's current plan, credit balance, and transaction history. Initiates Stripe checkout sessions for plan upgrades and credit pack purchases." "Svelte 5 Components"

                reportViewer = component "Report Viewer" "Displays the user's full cleaning history list and per-file metadata removal report details. Supports PDF download and QR-code-based public report sharing." "Svelte 5 Components"

                apiKeysUI = component "API Keys Manager" "Allows users to create, list, revoke, and activate API keys for programmatic access to the MetaCleaner REST API." "Svelte 5 Components"
            }

            # ------------------------------------------------------------------
            # CONTAINER: Mobile Application
            # ------------------------------------------------------------------
            mobileApp = container "Mobile Application (Android)" "Native Android application built from the same SvelteKit codebase wrapped with Capacitor 8. Supports Android App Links for OAuth and magic link deep-link callbacks. Distributed as an APK/AAB. App ID: com.metacleaner.app." "SvelteKit 2, Svelte 5, TypeScript, Capacitor 8, Android" {
                tags "Mobile App"
            }

            # ------------------------------------------------------------------
            # CONTAINER: CLI Tool
            # ------------------------------------------------------------------
            cliTool = container "CLI Tool" "Command-line tool for scanning, cleaning, and comparing file metadata from the terminal. Designed for developer automation and CI/CD pipelines. Uses structured exit codes (0 = safe, 1 = high-risk found, 2 = runtime error) for script integration." "Bun runtime, TypeScript" {
                tags "CLI Tool"

                commandParser = component "Command Parser" "Parses CLI arguments and dispatches to the appropriate command handler (scan, clean, compare, help, version). Handles global flags: --server, --json, --quiet, --verbose, --output, --timeout." "TypeScript"

                cliServerClient = component "Server Client" "HTTP client wrapping all backend API calls: health checks, multipart file uploads, job creation, job status polling (with timeout), and cleaned file downloads." "TypeScript, Fetch API"

                cliScanner = component "Local Metadata Scanner" "Reads and parses file metadata locally on the developer's machine without a server call. Used by the scan command for local-only analysis and by the compare command to show before/after diff." "TypeScript"

                cliFormatter = component "Output Formatter" "Formats command results as human-readable text tables or structured JSON (via --json flag). Renders progress indicators, severity badges, and metadata field tables." "TypeScript"
            }

            # ------------------------------------------------------------------
            # CONTAINER: Backend API
            # ------------------------------------------------------------------
            backendApi = container "Backend API" "Core HTTP/WebSocket server implementing the complete MetaCleaner REST API. Orchestrates the metadata cleaning pipeline, manages authentication, billing, API keys, PDF report generation, and real-time progress streaming via WebSocket. Deployed as a Docker container on Fly.io." "Go 1.23, net/http, gorilla/websocket, Docker" {
                tags "Server"

                httpRouter = component "HTTP Router & Middleware" "Central request dispatcher using gorilla/mux. Applies CORS policy, security response headers (HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection), and request ID injection. Composes per-route middleware chains." "Go, gorilla/mux"

                authMiddleware = component "Auth Middleware" "Validates Bearer JWT tokens signed by Supabase using the configured JWT secret. Extracts user ID and API key ID from token claims. Rejects unauthenticated requests on protected routes." "Go"

                rateLimiter = component "Rate Limiter" "Multi-layer rate limiting: IP-based token bucket for the upload endpoint (default 60 req/min), per-email address for auth endpoints, and per-API-key rate limits for programmatic access." "Go, golang.org/x/time/rate"

                uploadHandler = component "Upload Handler" "Accepts multipart file uploads (configurable max size, default 500 MB per file). Saves originals to temporary local storage (/tmp/metacleaner/uploads/), extracts basic file metadata, and returns assigned file UUIDs. Route: POST /api/upload." "Go"

                jobHandler = component "Job Handler" "Creates and manages cleaning jobs (cleaning_jobs, job_files tables). Spawns the cleaning pipeline, subscribes to WebSocket progress events, saves job/report records to the database, generates PDF reports, and serves download endpoints. Routes: /api/jobs/*, /api/files/*, /api/reports/*, /api/public/reports/*." "Go"

                authHandler = component "Auth Handler" "Handles all authentication flows: email/password register and login, JWT token refresh, logout, OAuth initiation and callback (Google, GitHub), passwordless magic link request and verification, and password reset with code verification. Routes: /api/auth/*." "Go"

                billingHandler = component "Billing Handler" "Creates Stripe Checkout sessions for plan upgrades (Pro, ProPlus monthly/yearly) and credit pack purchases. Verifies Stripe webhook HMAC signatures and updates subscription and credit balance data. Routes: /api/billing/*." "Go, stripe-go"

                apiKeyHandler = component "API Key Handler" "CRUD endpoints for user API keys: create, list all, delete, revoke (deactivate), and activate (reactivate). Routes: /api/keys/*." "Go"

                accountHandler = component "Account Handler" "Returns combined user account information: auth profile data merged with billing subscription status and credit balance. Route: GET /api/account." "Go"

                wellKnownHandler = component "Well-Known Handler" "Serves /.well-known/assetlinks.json for Android App Links deep-link verification and /.well-known/apple-app-site-association for iOS Universal Links support." "Go"

                websocketHub = component "WebSocket Hub" "Manages per-job WebSocket connection registries. Broadcasts typed real-time events to all clients connected to a given job: file_progress, file_complete (with metadata field counts and GPS removal flag), file_error, job_progress, and job_complete (with reportId)." "Go, gorilla/websocket"

                cleaningPipeline = component "Cleaning Pipeline" "Core metadata removal engine. Determines the correct tool per file type, then executes ExifTool (images) or FFmpeg (videos) as child subprocesses. Parses stdout to count removed metadata fields (EXIF, GPS, XMP, ID3, MP4 atoms). Emits typed progress events to the WebSocket Hub after each file." "Go, os/exec"

                supabaseClient = component "Supabase Client" "HTTP client for all Supabase interactions: PostgREST API for database CRUD (cleaning_jobs, job_files, cleaning_reports, user_profiles, api_keys, credit_balances, billing_customers), Supabase Auth API for user management and JWT operations, and Supabase Storage API for PDF report upload and signed-URL generation." "Go, net/http"

                pdfGenerator = component "PDF Report Generator" "Generates a branded PDF cleaning report for each completed job, containing per-file metadata removal breakdown, summary statistics, and a QR code for public sharing. Uploads the finished PDF to the Supabase Storage bucket (cleaning-reports)." "Go, gopdf, go-qrcode"

                cleanupScheduler = component "Cleanup Scheduler" "Background goroutine running on a configurable interval. Queries the database for jobs whose retention period has expired (default 1 hour) and deletes the corresponding temporary files from local storage (/tmp/metacleaner/)." "Go"
            }
        }

        # ==========================================================================
        # RELATIONSHIPS — LEVEL 1: System Context
        # ==========================================================================

        user -> metacleaner "Removes metadata from photos and videos using" "HTTPS"
        developer -> metacleaner "Automates metadata scanning and cleaning via CLI tool or REST API keys using" "HTTPS / CLI"
        metacleaner -> supabase "Stores user accounts, job records, reports, API keys, billing data, and PDF files in" "HTTPS"
        metacleaner -> stripe "Processes subscription payments and credit pack purchases via" "HTTPS"
        stripe -> metacleaner "Sends payment confirmation and subscription update events to" "HTTPS Webhooks"
        metacleaner -> exiftool "Removes image metadata by invoking" "Subprocess"
        metacleaner -> ffmpeg "Removes video metadata by invoking" "Subprocess"
        metacleaner -> brevo "Routes contact form submissions via" "HTTPS"

        # ==========================================================================
        # RELATIONSHIPS — LEVEL 2: Containers
        # ==========================================================================

        user -> metacleaner.marketingWebsite "Discovers the product, reads pricing, and submits contact form via" "HTTPS"
        user -> metacleaner.webApp "Uploads files, reviews risk analysis, monitors progress, and downloads cleaned files via" "HTTPS"
        user -> metacleaner.mobileApp "Uploads files and downloads cleaned files on Android via" "HTTPS"
        developer -> metacleaner.cliTool "Scans, cleans, and compares file metadata from the terminal using" "CLI"

        metacleaner.webApp -> metacleaner.backendApi "Uploads files, creates jobs, and manages account via" "HTTPS REST API"
        metacleaner.webApp -> metacleaner.backendApi "Streams real-time cleaning progress via" "WebSocket (wss://)"
        metacleaner.mobileApp -> metacleaner.backendApi "Uploads files, creates jobs, and manages account via" "HTTPS REST API"
        metacleaner.mobileApp -> metacleaner.backendApi "Streams real-time cleaning progress via" "WebSocket (wss://)"
        metacleaner.cliTool -> metacleaner.backendApi "Uploads files, polls job status, and downloads cleaned files via" "HTTP REST API"

        metacleaner.webApp -> metacleaner.sharedLib "Uses pricing UI components and tier data from" "npm workspace"
        metacleaner.marketingWebsite -> metacleaner.sharedLib "Uses pricing UI components and tier data from" "npm workspace"

        metacleaner.backendApi -> supabase "Reads and writes job records, reports, profiles, API keys, and billing data via" "HTTPS — PostgREST API"
        metacleaner.backendApi -> supabase "Registers, authenticates, and manages users; validates JWTs; handles OAuth and magic links via" "HTTPS — Supabase Auth API"
        metacleaner.backendApi -> supabase "Uploads generated PDF reports and retrieves signed download URLs via" "HTTPS — Supabase Storage API"
        metacleaner.backendApi -> stripe "Creates Stripe Checkout sessions and verifies incoming webhook signatures via" "HTTPS — Stripe API"
        metacleaner.backendApi -> exiftool "Strips image metadata by executing as a child process" "Subprocess (stdin/stdout)"
        metacleaner.backendApi -> ffmpeg "Strips video metadata by executing as a child process" "Subprocess (stdin/stdout)"
        metacleaner.marketingWebsite -> brevo "Sends contact form payload to" "HTTPS — Brevo API"
        stripe -> metacleaner.backendApi "Delivers payment and subscription lifecycle events to" "HTTPS Webhook — POST /api/billing/webhook"

        # ==========================================================================
        # RELATIONSHIPS — LEVEL 3: Components — Backend API
        # ==========================================================================

        metacleaner.webApp -> metacleaner.backendApi.httpRouter "Sends all HTTP and WebSocket requests to" "HTTPS"
        metacleaner.mobileApp -> metacleaner.backendApi.httpRouter "Sends all HTTP and WebSocket requests to" "HTTPS"
        metacleaner.cliTool -> metacleaner.backendApi.httpRouter "Sends all HTTP requests to" "HTTP"
        stripe -> metacleaner.backendApi.httpRouter "Delivers webhook POST requests to" "HTTPS"

        metacleaner.backendApi.httpRouter -> metacleaner.backendApi.authMiddleware "Validates JWT / API key tokens for protected routes via" "Function call"
        metacleaner.backendApi.httpRouter -> metacleaner.backendApi.rateLimiter "Enforces per-route rate limits via" "Function call"
        metacleaner.backendApi.httpRouter -> metacleaner.backendApi.uploadHandler "Routes POST /api/upload to" "Function call"
        metacleaner.backendApi.httpRouter -> metacleaner.backendApi.jobHandler "Routes /api/jobs/*, /api/files/*, /api/reports/*, /api/public/reports/* to" "Function call"
        metacleaner.backendApi.httpRouter -> metacleaner.backendApi.authHandler "Routes /api/auth/* to" "Function call"
        metacleaner.backendApi.httpRouter -> metacleaner.backendApi.billingHandler "Routes /api/billing/* to" "Function call"
        metacleaner.backendApi.httpRouter -> metacleaner.backendApi.apiKeyHandler "Routes /api/keys/* to" "Function call"
        metacleaner.backendApi.httpRouter -> metacleaner.backendApi.accountHandler "Routes GET /api/account to" "Function call"
        metacleaner.backendApi.httpRouter -> metacleaner.backendApi.wellKnownHandler "Routes /.well-known/* to" "Function call"

        metacleaner.backendApi.authMiddleware -> metacleaner.backendApi.supabaseClient "Validates JWT signature and API key hashes via" "Function call"

        metacleaner.backendApi.uploadHandler -> metacleaner.backendApi.supabaseClient "Records uploaded file metadata in the database via" "Function call"

        metacleaner.backendApi.jobHandler -> metacleaner.backendApi.cleaningPipeline "Starts and monitors the metadata removal pipeline via" "Function call"
        metacleaner.backendApi.jobHandler -> metacleaner.backendApi.websocketHub "Subscribes to and forwards real-time progress events from" "Function call"
        metacleaner.backendApi.jobHandler -> metacleaner.backendApi.supabaseClient "Creates, updates, and queries cleaning job records in the database via" "Function call"
        metacleaner.backendApi.jobHandler -> metacleaner.backendApi.pdfGenerator "Requests PDF report generation after job completion from" "Function call"

        metacleaner.backendApi.cleaningPipeline -> metacleaner.backendApi.websocketHub "Publishes file_progress, file_complete, file_error, and job_complete events to" "Function call"
        metacleaner.backendApi.cleaningPipeline -> exiftool "Executes to strip metadata from image files" "Subprocess"
        metacleaner.backendApi.cleaningPipeline -> ffmpeg "Executes to strip metadata from video files" "Subprocess"

        metacleaner.backendApi.authHandler -> metacleaner.backendApi.supabaseClient "Registers, authenticates, and manages user sessions via" "Function call"
        metacleaner.backendApi.billingHandler -> metacleaner.backendApi.supabaseClient "Updates subscription records and credit balances via" "Function call"
        metacleaner.backendApi.billingHandler -> stripe "Creates Checkout sessions and verifies webhook HMAC signatures via" "HTTPS"
        metacleaner.backendApi.apiKeyHandler -> metacleaner.backendApi.supabaseClient "Creates, retrieves, revokes, and deletes API key records via" "Function call"
        metacleaner.backendApi.accountHandler -> metacleaner.backendApi.supabaseClient "Reads user profile and billing subscription data via" "Function call"

        metacleaner.backendApi.pdfGenerator -> metacleaner.backendApi.supabaseClient "Uploads generated PDF to Supabase Storage and retrieves signed URL via" "Function call"

        metacleaner.backendApi.supabaseClient -> supabase "Reads and writes all application data via" "HTTPS — PostgREST + Auth + Storage APIs"

        metacleaner.backendApi.cleanupScheduler -> metacleaner.backendApi.supabaseClient "Queries expired job records to identify temporary files ready for deletion via" "Function call"

        # ==========================================================================
        # RELATIONSHIPS — LEVEL 3: Components — Web Application
        # ==========================================================================

        metacleaner.webApp.uploadWizard -> metacleaner.webApp.metadataScanner "Triggers browser-side pre-scan of selected files via" "Function call"
        metacleaner.webApp.uploadWizard -> metacleaner.webApp.riskAnalyzer "Calculates per-field privacy risk scores via" "Function call"
        metacleaner.webApp.uploadWizard -> metacleaner.webApp.apiClient "Uploads files, creates jobs, and monitors job status via" "Function call"
        metacleaner.webApp.uploadWizard -> metacleaner.webApp.apiClient "Opens WebSocket connection for real-time progress streaming via" "WebSocket"
        metacleaner.webApp.billingUI -> metacleaner.webApp.apiClient "Fetches subscription status and initiates Stripe Checkout session via" "Function call"
        metacleaner.webApp.reportViewer -> metacleaner.webApp.apiClient "Fetches cleaning report list and report details via" "Function call"
        metacleaner.webApp.apiKeysUI -> metacleaner.webApp.apiClient "Sends API key create, revoke, activate, and delete requests via" "Function call"
        metacleaner.webApp.authModule -> metacleaner.webApp.apiClient "Sends authentication and token refresh requests via" "Function call"
        metacleaner.webApp.apiClient -> metacleaner.backendApi "Sends all HTTP and WebSocket requests to" "HTTPS REST + WebSocket"

        # ==========================================================================
        # RELATIONSHIPS — LEVEL 3: Components — CLI Tool
        # ==========================================================================

        metacleaner.cliTool.commandParser -> metacleaner.cliTool.cliScanner "Invokes for the scan and compare commands" "Function call"
        metacleaner.cliTool.commandParser -> metacleaner.cliTool.cliServerClient "Invokes for the clean command and all backend API interactions" "Function call"
        metacleaner.cliTool.commandParser -> metacleaner.cliTool.cliFormatter "Passes results to for terminal or JSON output" "Function call"
        metacleaner.cliTool.cliServerClient -> metacleaner.backendApi "Uploads files, creates jobs, polls job status, and downloads cleaned results from" "HTTP REST"

        # ==========================================================================
        # DEPLOYMENT ENVIRONMENTS
        # ==========================================================================

        production = deploymentEnvironment "Production" {

            deploymentNode "Fly.io — Frankfurt (fra)" "European Fly.io region hosting all containerised MetaCleaner services." "Fly.io Cloud PaaS" {

                deploymentNode "Backend Container" "Multi-stage Docker image: Go 1.23 builder stage → debian-slim runtime stage. ExifTool and FFmpeg binaries are installed during the image build." "Docker, debian-slim, Go 1.23" {
                    properties {
                        "Instances"   "1 (auto-stop when idle)"
                        "Memory"      "256 MB"
                        "Concurrency" "soft 20 / hard 25 connections"
                        "Health Check" "GET /api/health — every 15 s, timeout 5 s"
                        "HTTPS"       "Enforced (force_https on port 80)"
                    }
                    containerInstance metacleaner.backendApi
                }

                deploymentNode "Frontend App Container" "Static SvelteKit build served by nginx. Configured with try_files fallback for SPA client-side routing." "Docker, nginx" {
                    containerInstance metacleaner.webApp
                }

                deploymentNode "Fly.io Persistent Volume" "Persistent volume attached to the backend container for temporary file storage during the cleaning process." "Fly.io Volumes" {
                    properties {
                        "Volume Name"  "metacleaner_tmp"
                        "Mount Point"  "/tmp/metacleaner"
                        "Contents"     "Original uploads + cleaned output files"
                        "Retention"    "Max 1 hour — auto-deleted by Cleanup Scheduler"
                    }
                }
            }

            deploymentNode "CDN / Static Hosting" "Marketing website served via nginx Docker container or any CDN-compatible static host (Cloudflare Pages, Vercel, Netlify, AWS S3)." "nginx, Docker, or CDN" {
                containerInstance metacleaner.marketingWebsite
            }

            deploymentNode "Supabase Cloud" "Managed Supabase project providing PostgreSQL 15, JWT-based Auth, and S3-compatible object storage. Hosts all permanent application data." "Supabase Cloud, PostgreSQL 15" {
                properties {
                    "Database Tables" "cleaning_jobs, job_files, cleaning_reports, user_profiles, api_keys, credit_balances, billing_customers, auth.users"
                    "Storage Bucket"  "cleaning-reports (PDF report files)"
                    "Auth Methods"    "Email/password, OAuth (Google/GitHub), Magic link, Password reset"
                }
                softwareSystemInstance supabase
            }

            deploymentNode "Stripe" "Stripe payment processing platform. Sends signed HMAC webhook events to the backend after successful payments and subscription changes." "Stripe" {
                softwareSystemInstance stripe
            }
        }

        development = deploymentEnvironment "Development" {

            deploymentNode "Developer Machine" "Local development environment running all MetaCleaner services concurrently." "Linux / macOS / Windows" {

                deploymentNode "Backend (local)" "Go development server started directly or via Docker. Connects to a cloud or local Supabase project." "go run ./cmd/main.go  or  Docker" {
                    properties {
                        "Default Port" "8080"
                        "Config"       ".env file (see .env.example)"
                    }
                    containerInstance metacleaner.backendApi
                }

                deploymentNode "Web App (local)" "SvelteKit dev server with Vite HMR. Configured via PUBLIC_API_URL to proxy API calls to the local backend." "Bun, Vite, SvelteKit" {
                    properties {
                        "Default Port" "3000"
                        "Config"       ".env file (PUBLIC_API_URL=http://localhost:8080)"
                    }
                    containerInstance metacleaner.webApp
                }

                deploymentNode "Marketing Website (local)" "SvelteKit dev server for the marketing site." "Bun, Vite, SvelteKit" {
                    properties {
                        "Default Port" "5173"
                    }
                    containerInstance metacleaner.marketingWebsite
                }

                deploymentNode "CLI (local)" "CLI tool invoked directly via the Bun runtime. Targets the local backend by default via the METACLEANER_SERVER_URL environment variable." "Bun" {
                    properties {
                        "Default Server" "http://localhost:8080"
                        "Config"         ".env or METACLEANER_SERVER_URL env var"
                    }
                    containerInstance metacleaner.cliTool
                }
            }

            deploymentNode "Supabase (dev project)" "Shared development Supabase project or a locally-running Supabase stack via the supabase CLI." "Supabase Cloud or supabase CLI" {
                softwareSystemInstance supabase
            }
        }
    }

    # ==========================================================================
    # VIEWS
    # ==========================================================================

    views {

        # ------------------------------------------------------------------
        # LEVEL 1 — System Context
        # ------------------------------------------------------------------
        systemContext metacleaner "SystemContext" "MetaCleaner in context: how end-users and developers interact with the system, and which external platforms it depends on." {
            include *
            autoLayout lr
        }

        # ------------------------------------------------------------------
        # LEVEL 2 — Containers
        # ------------------------------------------------------------------
        container metacleaner "Containers" "All deployable units and internal libraries that make up MetaCleaner: the marketing site, web application, Android mobile app, CLI tool, shared Svelte component library, and the Go backend API." {
            include *
            autoLayout lr
        }

        # ------------------------------------------------------------------
        # LEVEL 3 — Components: Backend API
        # ------------------------------------------------------------------
        component metacleaner.backendApi "BackendAPIComponents" "Internal components of the Go Backend API: the HTTP router with middleware, domain-specific handlers (upload, jobs, auth, billing, API keys, account), the cleaning pipeline, WebSocket hub, Supabase client, PDF generator, and cleanup scheduler." {
            include *
            autoLayout lr
        }

        # ------------------------------------------------------------------
        # LEVEL 3 — Components: Web Application
        # ------------------------------------------------------------------
        component metacleaner.webApp "WebAppComponents" "Internal modules of the SvelteKit Web Application: auth module, central API client, client-side metadata scanner, risk analyzer, and the major UI feature areas (wizard, billing, reports, API keys)." {
            include *
            autoLayout lr
        }

        # ------------------------------------------------------------------
        # LEVEL 3 — Components: CLI Tool
        # ------------------------------------------------------------------
        component metacleaner.cliTool "CLIComponents" "Internal components of the Bun CLI Tool: the command parser, backend server client, local metadata scanner, and output formatter." {
            include *
            autoLayout lr
        }

        # ------------------------------------------------------------------
        # DEPLOYMENT — Production
        # ------------------------------------------------------------------
        deployment * "Production" "ProductionDeployment" "Production deployment: Go backend on Fly.io Frankfurt with a persistent volume, static web app on Fly.io nginx, marketing site on CDN, application data on Supabase Cloud, and payments via Stripe." {
            include *
            autoLayout lr
        }

        # ------------------------------------------------------------------
        # DEPLOYMENT — Development
        # ------------------------------------------------------------------
        deployment * "Development" "DevelopmentDeployment" "Local development setup: all services (backend, web app, marketing site, CLI) run on the developer's machine; data is stored in a shared Supabase dev project." {
            include *
            autoLayout lr
        }

        # ==========================================================================
        # STYLES
        # ==========================================================================

        styles {

            # People
            element "Person" {
                shape Person
                background #08427B
                color #ffffff
            }

            # Internal software systems
            element "Software System" {
                background #1168BD
                color #ffffff
                shape RoundedBox
            }

            # Third-party / external systems
            element "External System" {
                background #6B6B6B
                color #ffffff
                shape RoundedBox
            }

            # System-level tools installed on the server (ExifTool, FFmpeg)
            element "System Tool" {
                background #8B4513
                color #ffffff
                shape RoundedBox
            }

            # Default container style
            element "Container" {
                background #438DD5
                color #ffffff
            }

            # Web browser containers (static sites and SPAs)
            element "Static Site" {
                shape WebBrowser
                background #438DD5
                color #ffffff
            }

            element "Web Browser" {
                shape WebBrowser
                background #438DD5
                color #ffffff
            }

            # Android mobile app
            element "Mobile App" {
                shape MobileDeviceLandscape
                background #438DD5
                color #ffffff
            }

            # CLI / terminal tool
            element "CLI Tool" {
                shape RoundedBox
                background #2E8B57
                color #ffffff
            }

            # Shared library / internal package
            element "Library" {
                shape Component
                background #85BBF0
                color #000000
            }

            # Backend server
            element "Server" {
                shape RoundedBox
                background #1168BD
                color #ffffff
            }

            # Default component style
            element "Component" {
                shape Component
                background #85BBF0
                color #000000
            }

            # Deployment node labels
            element "Deployment Node" {
                color #000000
                background #ffffff
            }
        }

        theme default
    }
}
