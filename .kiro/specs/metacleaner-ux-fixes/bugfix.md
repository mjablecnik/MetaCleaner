# Bugfix Requirements Document

## Introduction

This document covers 9 UX bugs in the MetaCleaner application affecting download behavior, navigation, report functionality, video file handling, and visual consistency. These bugs degrade the user experience across the cleaning workflow — from upload through results and report viewing.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN only 1 file is cleaned and the user clicks the download button THEN the system creates a ZIP archive containing a single file instead of offering a direct file download

1.2 WHEN the user is on the results page (success state at path `/`) and clicks the MetaCleaner logo THEN the system does nothing because `logoHref` is not set when the route path is `/`

1.3 WHEN the user clicks the "Stáhnout PDF" (Download PDF) button on the report detail page THEN the system fails to download the PDF because the frontend does not correctly call the backend PDF endpoint or the PDF generation/upload pipeline has not completed

1.4 WHEN the user clicks the "Zpět na výsledky" (Back to results) button on the report detail page THEN the system navigates to a hardcoded route (`/reports`) instead of using browser history to return to the specific cleaning results page

1.5 WHEN the user opens the user dropdown menu THEN the system does not show a "Report history" option — only "Settings" and "Logout" are available

1.6 WHEN the user views the report history list page THEN the photo/image icon for file type indicators is displayed in green color instead of the expected blue color

1.7 WHEN the user uploads a video file (e.g., MP4) and the risk scanner attempts to analyze it THEN the system shows "Nelze naskenovat" (Cannot scan) error because the client-side video parser (mediainfo.js) fails or throws an unhandled exception

1.8 WHEN the user views the report detail for a cleaned video file THEN the system does not show detailed metadata field changes (which fields were removed) — unlike images which display field-level breakdown per category

1.9 WHEN the user views the report detail page THEN file names show hashed internal IDs (e.g., "f-fbe455fb.mp4") instead of the original file names (e.g., "firefly-kling-3.0.mp4") that appear on the results page

### Expected Behavior (Correct)

2.1 WHEN only 1 file is cleaned and the user clicks the download button THEN the system SHALL offer a direct single-file download (using the individual file download endpoint) without creating a ZIP archive; ZIP SHALL only be created when 2 or more files are cleaned

2.2 WHEN the user is on the results page (success state) and clicks the MetaCleaner logo THEN the system SHALL reset the app state and navigate back to step 1 (upload/idle state), regardless of the current route path

2.3 WHEN the user clicks the "Stáhnout PDF" button on the report detail page THEN the system SHALL download the PDF report by calling `GET /api/reports/{id}/pdf` and initiating a file download in the browser

2.4 WHEN the user clicks the "Zpět na výsledky" (Back to results) button on the report detail page THEN the system SHALL use `history.back()` (browser back navigation) to return to the previous page, preserving the cleaning results context of that specific job

2.5 WHEN the user opens the user dropdown menu THEN the system SHALL display a "Report history" button that navigates to the reports list page (`/reports`)

2.6 WHEN the user views the report history list page THEN the photo/image icon for file type indicators SHALL be displayed in blue color (matching the filter section styling, using `text-brand-blue`)

2.7 WHEN the user uploads a video file (e.g., MP4) and the risk scanner attempts to analyze it THEN the system SHALL successfully parse video metadata using mediainfo.js and display the risk analysis results without errors

2.8 WHEN the user views the report detail for a cleaned video file THEN the system SHALL show detailed metadata field changes grouped by category (GPS, ID3, MP4 atoms) — the same level of detail that images receive (GPS, EXIF, XMP fields)

2.9 WHEN the user views the report detail page THEN file names SHALL show the original upload file names (e.g., "firefly-kling-3.0.mp4") consistently across both the results page and the report detail page

### Unchanged Behavior (Regression Prevention)

3.1 WHEN 2 or more files are cleaned and the user downloads them THEN the system SHALL CONTINUE TO create a ZIP archive containing all cleaned files

3.2 WHEN the user is on non-success pages (idle, files-ready, processing, error) at the root path THEN the system SHALL CONTINUE TO display the logo without a navigation link (or with existing behavior for that state)

3.3 WHEN the backend generates and uploads the PDF report after job completion THEN the system SHALL CONTINUE TO store the PDF in Supabase Storage and update the report record with the PDF path and status

3.4 WHEN the user clicks the dedicated "Back to results" button on the reports list page (not report detail) THEN the system SHALL CONTINUE TO navigate using the existing hardcoded link behavior for that page

3.5 WHEN the user opens the user dropdown menu THEN the system SHALL CONTINUE TO display the existing "Settings" and "Logout" options with their current functionality

3.6 WHEN the user views the report history list page THEN other icons (video, document) SHALL CONTINUE TO display in their current correct colors

3.7 WHEN the user uploads an image file (JPEG, PNG, HEIC, etc.) and the risk scanner analyzes it THEN the system SHALL CONTINUE TO parse image EXIF/XMP/GPS metadata correctly and display risk analysis results

3.8 WHEN the user views the report detail for a cleaned image file THEN the system SHALL CONTINUE TO show detailed metadata field changes grouped by category (GPS, EXIF, XMP)

3.9 WHEN the user views the results page after cleaning THEN file names SHALL CONTINUE TO show correctly on the results page using the original upload names
