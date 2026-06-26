workspace "MetaCleaner" "Privacy-focused SaaS platform for metadata removal from photos and videos." {

    !identifiers hierarchical

    configuration {
        scope softwaresystem
    }

    model {

        # ==========================================================================
        # PEOPLE
        # ==========================================================================

        user = person "User" "Wants to remove metadata from photos/videos for privacy. Uses web or Android app." {
            tags "Person"
        }

        developer = person "Developer" "Integrates MetaCleaner into scripts or CI/CD via CLI or REST API." {
            tags "Person"
        }

        # ==========================================================================
        # EXTERNAL SYSTEMS
        # ==========================================================================

        supabase = softwareSystem "Supabase" "Managed PostgreSQL, Auth (JWT), and S3 file storage." {
            tags "External System"
        }

        stripe = softwareSystem "Stripe" "Subscription billing and credit pack payments." {
            tags "External System"
        }

        exiftool = softwareSystem "ExifTool" "CLI tool for reading/removing image metadata." {
            tags "External System" "System Tool"
        }

        ffmpeg = softwareSystem "FFmpeg" "CLI tool for removing video metadata." {
            tags "External System" "System Tool"
        }

        brevo = softwareSystem "Brevo" "Email service for contact form submissions." {
            tags "External System"
        }

        # ==========================================================================
        # METACLEANER — MAIN SOFTWARE SYSTEM
        # ==========================================================================

        metacleaner = softwareSystem "MetaCleaner" "Removes hidden metadata (EXIF, GPS, XMP, ID3, MP4) from 20+ image and video formats. Web, mobile, and CLI." {

            # ------------------------------------------------------------------
            # CONTAINER: Marketing Website
            # ------------------------------------------------------------------
            marketingWebsite = container "Marketing Website" "Static landing page with features, pricing, and contact form." "SvelteKit, Tailwind, nginx" {
                tags "Static Site"
            }

            # ------------------------------------------------------------------
            # CONTAINER: Shared Component Library
            # ------------------------------------------------------------------
            sharedLib = container "Shared Library" "Reusable pricing UI components and tier data shared by Web App and Marketing Website." "TypeScript, Svelte 5" {
                tags "Library"
            }

            # ------------------------------------------------------------------
            # CONTAINER: Web Application
            # ------------------------------------------------------------------
            webApp = container "Web App" "SPA for file upload, risk analysis, real-time cleaning, reports, and account management." "SvelteKit, Svelte 5, TypeScript, Capacitor" {
                tags "Web Browser"

                authModule = component "Auth Module" "Login, registration, OAuth, magic link, token refresh." "TypeScript"

                apiClient = component "API Client" "HTTP + WebSocket client for backend communication." "TypeScript, Fetch"

                metadataScanner = component "Metadata Scanner" "Client-side EXIF/media metadata extraction." "exifr, mediainfo.js"

                riskAnalyzer = component "Risk Analyzer" "Computes privacy risk scores and severity levels." "TypeScript"

                uploadWizard = component "Upload Wizard" "Multi-step workflow: upload → scan → clean → download." "Svelte 5"

                billingUI = component "Billing UI" "Plan status, upgrades, credit purchases." "Svelte 5"

                reportViewer = component "Report Viewer" "Cleaning history and per-file report details." "Svelte 5"

                apiKeysUI = component "API Keys Manager" "CRUD interface for user API keys." "Svelte 5"
            }

            # ------------------------------------------------------------------
            # CONTAINER: Mobile Application
            # ------------------------------------------------------------------
            mobileApp = container "Android App" "Native Android wrapper via Capacitor with deep-link support." "SvelteKit, Capacitor 8" {
                tags "Mobile App"
            }

            # ------------------------------------------------------------------
            # CONTAINER: CLI Tool
            # ------------------------------------------------------------------
            cliTool = container "CLI Tool" "Terminal tool for scan, clean, and compare commands. Exit codes: 0/1/2." "Bun, TypeScript" {
                tags "CLI Tool"

                commandParser = component "Command Parser" "Parses args, dispatches to command handlers." "TypeScript"

                cliServerClient = component "Server Client" "HTTP client for upload, job creation, polling, download." "TypeScript, Fetch"

                cliScanner = component "Local Scanner" "Reads file metadata locally without server call." "TypeScript"

                cliFormatter = component "Output Formatter" "Formats results as text tables or JSON." "TypeScript"
            }

            # ------------------------------------------------------------------
            # CONTAINER: Backend API
            # ------------------------------------------------------------------
            backendApi = container "Backend API" "REST/WebSocket server: cleaning pipeline, auth, billing, reports, PDF generation." "Go 1.23, gorilla/websocket" {
                tags "Server"

                requestPipeline = component "Request Pipeline" "Dispatches requests, validates tokens, enforces rate limits." "Go, net/http, x/time/rate"

                cleaningPipeline = component "Cleaning Pipeline" "Upload, job orchestration, ExifTool/FFmpeg execution, file downloads." "Go, os/exec"

                websocketHub = component "WebSocket Hub" "Per-job real-time progress broadcasting." "Go, gorilla/websocket"

                authService = component "Auth Service" "User lifecycle: login, OAuth, magic link, profile, account." "Go"

                billingService = component "Billing Service" "Stripe checkout, webhooks, subscriptions, credits." "Go, stripe-go"

                apiKeyService = component "API Key Service" "API key CRUD and App Links endpoints." "Go"

                supabaseClient = component "Supabase Client" "HTTP client for PostgREST, Auth, and Storage APIs." "Go, net/http"

                pdfGenerator = component "PDF Generator" "Creates branded PDF reports with QR codes." "Go, gopdf"
            }
        }

        # ==========================================================================
        # RELATIONSHIPS — LEVEL 1: System Context
        # ==========================================================================

        user -> metacleaner "Removes metadata from files" "HTTPS"
        developer -> metacleaner "Automates via CLI or API keys" "HTTPS / CLI"
        metacleaner -> supabase "Stores data and authenticates users" "HTTPS"
        metacleaner -> stripe "Processes payments" "HTTPS"
        stripe -> metacleaner "Sends webhook events" "HTTPS"
        metacleaner -> exiftool "Strips image metadata" "Subprocess"
        metacleaner -> ffmpeg "Strips video metadata" "Subprocess"
        metacleaner -> brevo "Sends contact form emails" "HTTPS"

        # ==========================================================================
        # RELATIONSHIPS — LEVEL 2: Containers
        # ==========================================================================

        user -> metacleaner.marketingWebsite "Reads product info" "HTTPS"
        user -> metacleaner.webApp "Cleans files" "HTTPS"
        user -> metacleaner.mobileApp "Cleans files on Android" "HTTPS"
        developer -> metacleaner.cliTool "Runs from terminal" "CLI"

        metacleaner.webApp -> metacleaner.backendApi "REST API calls" "HTTPS"
        metacleaner.webApp -> metacleaner.backendApi "Progress streaming" "WebSocket"
        metacleaner.mobileApp -> metacleaner.backendApi "REST API calls" "HTTPS"
        metacleaner.mobileApp -> metacleaner.backendApi "Progress streaming" "WebSocket"
        metacleaner.cliTool -> metacleaner.backendApi "Upload, poll, download" "HTTP"

        metacleaner.webApp -> metacleaner.sharedLib "Uses pricing components" "npm workspace"
        metacleaner.marketingWebsite -> metacleaner.sharedLib "Uses pricing components" "npm workspace"

        metacleaner.backendApi -> supabase "DB + Auth + Storage" "HTTPS"
        metacleaner.backendApi -> stripe "Checkout + webhooks" "HTTPS"
        metacleaner.backendApi -> exiftool "Strips image metadata" "Subprocess"
        metacleaner.backendApi -> ffmpeg "Strips video metadata" "Subprocess"
        metacleaner.marketingWebsite -> brevo "Contact form" "HTTPS"
        stripe -> metacleaner.backendApi "Webhook events" "HTTPS"

        # ==========================================================================
        # RELATIONSHIPS — LEVEL 3: Components — Backend API
        # ==========================================================================

        metacleaner.webApp -> metacleaner.backendApi.requestPipeline "All requests" "HTTPS"
        metacleaner.mobileApp -> metacleaner.backendApi.requestPipeline "All requests" "HTTPS"
        metacleaner.cliTool -> metacleaner.backendApi.requestPipeline "All requests" "HTTP"
        stripe -> metacleaner.backendApi.requestPipeline "Webhook POST" "HTTPS"

        metacleaner.backendApi.requestPipeline -> metacleaner.backendApi.cleaningPipeline "Upload + job requests" "Function call"
        metacleaner.backendApi.requestPipeline -> metacleaner.backendApi.authService "Auth requests" "Function call"
        metacleaner.backendApi.requestPipeline -> metacleaner.backendApi.billingService "Billing requests" "Function call"
        metacleaner.backendApi.requestPipeline -> metacleaner.backendApi.apiKeyService "API key requests" "Function call"

        metacleaner.backendApi.cleaningPipeline -> metacleaner.backendApi.websocketHub "Emits progress events" "Function call"
        metacleaner.backendApi.cleaningPipeline -> metacleaner.backendApi.supabaseClient "CRUD jobs + files" "Function call"
        metacleaner.backendApi.cleaningPipeline -> metacleaner.backendApi.pdfGenerator "Generates report PDF" "Function call"
        metacleaner.backendApi.cleaningPipeline -> exiftool "Strips image metadata" "Subprocess"
        metacleaner.backendApi.cleaningPipeline -> ffmpeg "Strips video metadata" "Subprocess"

        metacleaner.backendApi.authService -> metacleaner.backendApi.supabaseClient "Manages users" "Function call"
        metacleaner.backendApi.billingService -> metacleaner.backendApi.supabaseClient "Updates billing data" "Function call"
        metacleaner.backendApi.billingService -> stripe "Creates sessions" "HTTPS"
        metacleaner.backendApi.apiKeyService -> metacleaner.backendApi.supabaseClient "CRUD API keys" "Function call"
        metacleaner.backendApi.pdfGenerator -> metacleaner.backendApi.supabaseClient "Uploads PDF" "Function call"

        metacleaner.backendApi.supabaseClient -> supabase "All data operations" "HTTPS"

        # ==========================================================================
        # RELATIONSHIPS — LEVEL 3: Components — Web Application
        # ==========================================================================

        metacleaner.webApp.uploadWizard -> metacleaner.webApp.metadataScanner "Scans files locally" "Function call"
        metacleaner.webApp.uploadWizard -> metacleaner.webApp.riskAnalyzer "Calculates risk scores" "Function call"
        metacleaner.webApp.uploadWizard -> metacleaner.webApp.apiClient "Uploads and monitors jobs" "Function call"
        metacleaner.webApp.billingUI -> metacleaner.webApp.apiClient "Manages subscription" "Function call"
        metacleaner.webApp.reportViewer -> metacleaner.webApp.apiClient "Fetches reports" "Function call"
        metacleaner.webApp.apiKeysUI -> metacleaner.webApp.apiClient "Manages API keys" "Function call"
        metacleaner.webApp.authModule -> metacleaner.webApp.apiClient "Auth requests" "Function call"
        metacleaner.webApp.apiClient -> metacleaner.backendApi "HTTP + WebSocket" "HTTPS"

        # ==========================================================================
        # RELATIONSHIPS — LEVEL 3: Components — CLI Tool
        # ==========================================================================

        metacleaner.cliTool.commandParser -> metacleaner.cliTool.cliScanner "Invokes for scan/compare" "Function call"
        metacleaner.cliTool.commandParser -> metacleaner.cliTool.cliServerClient "Invokes for clean" "Function call"
        metacleaner.cliTool.commandParser -> metacleaner.cliTool.cliFormatter "Formats output" "Function call"
        metacleaner.cliTool.cliServerClient -> metacleaner.backendApi "Upload, poll, download" "HTTP"

        # ==========================================================================
        # DEPLOYMENT ENVIRONMENTS
        # ==========================================================================

        production = deploymentEnvironment "Production" {

            deploymentNode "Fly.io Frankfurt" "" "Fly.io PaaS" {

                deploymentNode "Backend Container" "" "Docker, debian-slim, Go 1.23" {
                    properties {
                        "Instances"    "1 (auto-stop)"
                        "Memory"       "256 MB"
                        "Health Check" "GET /api/health"
                    }
                    containerInstance metacleaner.backendApi
                }

                deploymentNode "Web App Container" "" "Docker, nginx" {
                    containerInstance metacleaner.webApp
                }

                deploymentNode "Persistent Volume" "" "Fly.io Volumes" {
                    properties {
                        "Mount"     "/tmp/metacleaner"
                        "Retention" "1 hour (auto-cleanup)"
                    }
                }
            }

            deploymentNode "CDN / Static Host" "" "nginx or CDN" {
                containerInstance metacleaner.marketingWebsite
            }

            deploymentNode "Supabase Cloud" "" "PostgreSQL 15, Auth, Storage" {
                softwareSystemInstance supabase
            }

            deploymentNode "Stripe" "" "Payment platform" {
                softwareSystemInstance stripe
            }
        }

        development = deploymentEnvironment "Development" {

            deploymentNode "Developer Machine" "" "Linux / macOS / Windows" {

                deploymentNode "Backend (local)" "" "go run or Docker, port 8080" {
                    containerInstance metacleaner.backendApi
                }

                deploymentNode "Web App (local)" "" "Bun + Vite, port 3000" {
                    containerInstance metacleaner.webApp
                }

                deploymentNode "Marketing Website (local)" "" "Bun + Vite, port 5173" {
                    containerInstance metacleaner.marketingWebsite
                }

                deploymentNode "CLI (local)" "" "Bun runtime" {
                    containerInstance metacleaner.cliTool
                }
            }

            deploymentNode "Supabase (dev)" "" "Supabase Cloud or local CLI" {
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
        systemContext metacleaner "SystemContext" {
            include *
            autoLayout lr 400 200
        }

        # ------------------------------------------------------------------
        # LEVEL 2 — Containers
        # ------------------------------------------------------------------
        container metacleaner "Containers" {
            include *
            autoLayout lr 400 200
        }

        # ------------------------------------------------------------------
        # LEVEL 3 — Components: Backend API
        # ------------------------------------------------------------------
        component metacleaner.backendApi "BackendAPIComponents" {
            include *
            autoLayout tb 300 200
        }

        # ------------------------------------------------------------------
        # DYNAMIC — Cleaning Job Flow
        # ------------------------------------------------------------------
        dynamic metacleaner.backendApi "CleaningJobFlow" "Lifecycle of a cleaning job from upload to PDF report." {
            metacleaner.webApp -> metacleaner.backendApi.requestPipeline "1. POST /api/upload (multipart files)"
            metacleaner.backendApi.requestPipeline -> metacleaner.backendApi.cleaningPipeline "2. Saves files to temp storage"
            metacleaner.webApp -> metacleaner.backendApi.requestPipeline "3. POST /api/jobs (file IDs)"
            metacleaner.backendApi.requestPipeline -> metacleaner.backendApi.cleaningPipeline "4. Creates job, starts pipeline"
            metacleaner.backendApi.cleaningPipeline -> metacleaner.backendApi.supabaseClient "5. Persists job + file records"
            metacleaner.webApp -> metacleaner.backendApi.websocketHub "6. WebSocket connect for progress"
            metacleaner.backendApi.cleaningPipeline -> exiftool "7. Strips image metadata"
            metacleaner.backendApi.cleaningPipeline -> ffmpeg "8. Strips video metadata"
            metacleaner.backendApi.cleaningPipeline -> metacleaner.backendApi.websocketHub "9. Broadcasts per-file progress"
            metacleaner.backendApi.websocketHub -> metacleaner.webApp "10. Streams events to client"
            metacleaner.backendApi.cleaningPipeline -> metacleaner.backendApi.supabaseClient "11. Updates job + file results"
            metacleaner.backendApi.cleaningPipeline -> metacleaner.backendApi.pdfGenerator "12. Generates PDF report"
            metacleaner.backendApi.pdfGenerator -> metacleaner.backendApi.supabaseClient "13. Uploads PDF to Storage"
            metacleaner.backendApi.cleaningPipeline -> metacleaner.backendApi.websocketHub "14. Broadcasts report_ready"
            metacleaner.webApp -> metacleaner.backendApi.requestPipeline "15. GET /api/files/{id}/download"

            autoLayout tb 300 150
        }

        # ------------------------------------------------------------------
        # LEVEL 3 — Components: Web Application
        # ------------------------------------------------------------------
        component metacleaner.webApp "WebAppComponents" {
            include *
            autoLayout lr 400 200
        }

        # ------------------------------------------------------------------
        # LEVEL 3 — Components: CLI Tool
        # ------------------------------------------------------------------
        component metacleaner.cliTool "CLIComponents" {
            include *
            autoLayout lr 400 200
        }

        # ------------------------------------------------------------------
        # DEPLOYMENT — Production
        # ------------------------------------------------------------------
        deployment * "Production" "ProductionDeployment" {
            include *
            autoLayout lr 400 200
        }

        # ------------------------------------------------------------------
        # DEPLOYMENT — Development
        # ------------------------------------------------------------------
        deployment * "Development" "DevelopmentDeployment" {
            include *
            autoLayout lr 400 200
        }

        # ==========================================================================
        # STYLES
        # ==========================================================================

        styles {

            element "Person" {
                shape Person
                background #08427B
                color #ffffff
                fontSize 24
            }

            element "Software System" {
                background #1168BD
                color #ffffff
                shape RoundedBox
                fontSize 24
            }

            element "External System" {
                background #6B6B6B
                color #ffffff
                shape RoundedBox
                fontSize 24
            }

            element "System Tool" {
                background #8B4513
                color #ffffff
                shape RoundedBox
            }

            element "Container" {
                background #438DD5
                color #ffffff
                fontSize 22
            }

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

            element "Mobile App" {
                shape MobileDeviceLandscape
                background #438DD5
                color #ffffff
            }

            element "CLI Tool" {
                shape RoundedBox
                background #2E8B57
                color #ffffff
            }

            element "Library" {
                shape Component
                background #85BBF0
                color #000000
            }

            element "Server" {
                shape RoundedBox
                background #1168BD
                color #ffffff
            }

            element "Component" {
                shape Component
                background #85BBF0
                color #000000
                fontSize 20
            }

            element "Deployment Node" {
                color #000000
                background #ffffff
                fontSize 20
            }

            relationship "Relationship" {
                fontSize 18
            }
        }

        theme default
    }
}
