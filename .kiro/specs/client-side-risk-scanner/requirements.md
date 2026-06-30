# Requirements Document

## Introduction

The Client-Side Risk Scanner feature merges the file upload (step1) and risk analysis (step2) into a single unified page. When users upload files, metadata is automatically extracted and analyzed entirely in the browser — no server round-trip required. The risk scanner output dynamically appears alongside the upload zone, providing immediate privacy risk feedback. Users can continue adding files incrementally, with the risk analysis updating in real time, until they choose to proceed to metadata cleaning (step3).

## Glossary

- **Risk_Scanner**: The client-side module responsible for extracting metadata from uploaded files and computing risk scores per category (GPS, device identity, personal data, timestamps).
- **Metadata_Parser**: The browser-based subsystem that reads EXIF, XMP, IPTC, and video metadata from uploaded file blobs using JavaScript parsing libraries (exifr, ExifReader) and WebAssembly (mediainfo.js).
- **Upload_Page**: The merged single-page view (`/` route) combining the upload zone and risk scanner output.
- **Risk_Score**: A numeric value (0–100) representing the overall privacy risk level derived from aggregating individual metadata category scores.
- **Risk_Category**: One of four metadata risk dimensions: GPS coordinates, device identity, personal data, and timestamps.
- **File_Queue**: The reactive collection of user-uploaded files awaiting metadata analysis and eventual cleaning.
- **Scan_Result**: The structured output of the Metadata_Parser for a single file, containing detected metadata fields grouped by Risk_Category.

## Requirements

### Requirement 1: Unified Upload and Risk Scanner Page

**User Story:** As a user, I want to see the upload zone and risk analysis on a single page, so that I get immediate privacy feedback without navigating away.

#### Acceptance Criteria

1. WHEN the Upload_Page loads with no files in the File_Queue, THE Upload_Page SHALL display only the upload zone (UploadZoneCard) without the risk scanner panel.
2. WHEN one or more files are added to the File_Queue, THE Upload_Page SHALL display both the upload zone and the risk scanner panel on the same page.
3. WHILE the File_Queue contains at least one file, THE Upload_Page SHALL keep the risk scanner panel visible.
4. WHEN all files are removed from the File_Queue, THE Upload_Page SHALL hide the risk scanner panel and return to the upload-only layout.
5. THE Upload_Page SHALL arrange the upload zone and risk scanner panel side-by-side on desktop (≥1024px) and stacked vertically on mobile (<1024px).

### Requirement 2: Client-Side Metadata Extraction

**User Story:** As a user, I want my files scanned for metadata entirely in my browser, so that my files are never uploaded to a server during the analysis phase.

#### Acceptance Criteria

1. WHEN a file is added to the File_Queue, THE Metadata_Parser SHALL extract metadata from the file blob using browser-local APIs without initiating any network requests.
2. THE Metadata_Parser SHALL support JPEG files (.jpg, .jpeg) by extracting EXIF, XMP, and IPTC metadata segments using exifr.
3. THE Metadata_Parser SHALL support HEIC/HEIF files (.heic, .heif) by extracting EXIF metadata from the HEIF container using exifr.
4. THE Metadata_Parser SHALL support PNG files (.png) by extracting text chunks and XMP metadata using exifr.
5. THE Metadata_Parser SHALL support MP4 files (.mp4, .m4v) by extracting metadata (format, codec, duration, bitrate, resolution, embedded tags) using mediainfo.js.
6. IF the Metadata_Parser encounters an unsupported file format, THEN THE Metadata_Parser SHALL return an empty Scan_Result with zero detected fields for that file.
7. IF the Metadata_Parser encounters a corrupted or unreadable file, THEN THE Metadata_Parser SHALL return an error Scan_Result indicating the file could not be parsed, without crashing the application.
8. THE Metadata_Parser SHALL support WebP files (.webp) by extracting EXIF and XMP metadata using ExifReader.
9. THE Metadata_Parser SHALL support GIF files (.gif) by extracting XMP and comment block metadata using ExifReader.
10. THE Metadata_Parser SHALL support AVIF files (.avif) by extracting EXIF and XMP metadata using exifr.
11. THE Metadata_Parser SHALL support TIFF files (.tiff, .tif) by extracting EXIF, XMP, and IPTC metadata using exifr.
12. THE Metadata_Parser SHALL support DNG files (.dng) by extracting EXIF and XMP metadata using exifr.
13. THE Metadata_Parser SHALL support MOV files (.mov) by extracting metadata (format, codec, duration, bitrate, resolution, embedded tags) using mediainfo.js.
14. THE Metadata_Parser SHALL support AVI files (.avi) by extracting metadata (format, codec, duration, bitrate, resolution, embedded tags) using mediainfo.js.
15. THE Metadata_Parser SHALL support MKV files (.mkv) by extracting metadata (format, codec, duration, bitrate, resolution, embedded tags) using mediainfo.js.
16. THE Metadata_Parser SHALL support WebM files (.webm) by extracting metadata (format, codec, duration, bitrate, resolution, embedded tags) using mediainfo.js.
17. THE Metadata_Parser SHALL support WMV files (.wmv) by extracting metadata (format, codec, duration, bitrate, resolution, embedded tags) using mediainfo.js.
18. THE Metadata_Parser SHALL support FLV files (.flv) by extracting metadata (format, codec, duration, bitrate, resolution, embedded tags) using mediainfo.js.
19. THE Metadata_Parser SHALL support 3GP files (.3gp) by extracting metadata (format, codec, duration, bitrate, resolution, embedded tags) using mediainfo.js.
20. THE Metadata_Parser SHALL support MPEG files (.mpg, .mpeg) by extracting metadata (format, codec, duration, bitrate, resolution, embedded tags) using mediainfo.js.
21. THE Metadata_Parser SHALL support OGV files (.ogv) by extracting metadata (format, codec, duration, bitrate, resolution, embedded tags) using mediainfo.js.
22. THE Metadata_Parser SHALL support MTS/M2TS files (.mts, .m2ts) by extracting metadata (format, codec, duration, bitrate, resolution, embedded tags) using mediainfo.js.

### Requirement 3: Automatic Risk Scanning on File Addition

**User Story:** As a user, I want the risk scanner to run automatically when I upload files, so that I do not need to trigger scanning manually.

#### Acceptance Criteria

1. WHEN a file is added to the File_Queue, THE Risk_Scanner SHALL automatically begin metadata extraction and risk analysis for that file within 100ms of the file being added.
2. WHEN multiple files are added simultaneously (batch upload), THE Risk_Scanner SHALL process each file and update the aggregated risk score after each file completes.
3. WHILE the Risk_Scanner is processing a file, THE Upload_Page SHALL display a scanning-in-progress indicator for that file.
4. WHEN the Risk_Scanner completes analysis of a file, THE Upload_Page SHALL update the risk scanner panel with the new aggregated results.

### Requirement 4: Risk Scoring Algorithm

**User Story:** As a user, I want to see a clear risk score and breakdown so that I understand what metadata in my files poses a privacy risk.

#### Acceptance Criteria

1. THE Risk_Scanner SHALL compute a per-file risk score (0–100) based on the detected metadata fields across the four primary Risk_Categories, plus an optional AI-origin detection modifier.
2. THE Risk_Scanner SHALL compute a category score (0–100) for GPS coordinates based on the presence of GPS latitude, GPS longitude, and GPS altitude fields.
3. THE Risk_Scanner SHALL compute a category score (0–100) for device identity based on the presence of camera make, camera model, serial number, and software version fields.
4. THE Risk_Scanner SHALL compute a category score (0–100) for personal data based on the presence of author name, copyright, IPTC contact info, and XMP creator fields.
5. THE Risk_Scanner SHALL compute a category score (0–100) for timestamps based on the presence of original date/time, digitized date/time, and GPS timestamp fields.
6. THE Risk_Scanner SHALL compute an overall aggregated Risk_Score across all files in the File_Queue by combining individual file scores using a weighted maximum strategy (the overall score reflects the highest-risk file).
7. THE Risk_Scanner SHALL classify the overall Risk_Score into severity levels: critical (75–100), high (50–74), medium (25–49), low (0–24).
8. WHEN AI-origin indicators are detected in a file's metadata (e.g., specific XMP creator tools or model identifiers), THE Risk_Scanner SHALL apply an additive aiOrigin modifier (weight 0.65) to the per-file score to reflect the elevated privacy risk of AI-generated content containing embedded provenance data. The final per-file score is clamped to 0–100.

### Requirement 5: Incremental Updates on File Changes

**User Story:** As a user, I want the risk analysis to update whenever I add or remove files, so that the displayed risk always reflects my current file selection.

#### Acceptance Criteria

1. WHEN a new file is added to the File_Queue, THE Risk_Scanner SHALL re-compute the aggregated Risk_Score including the new file's Scan_Result.
2. WHEN a file is removed from the File_Queue, THE Risk_Scanner SHALL re-compute the aggregated Risk_Score excluding the removed file's Scan_Result.
3. WHEN all files are cleared from the File_Queue, THE Risk_Scanner SHALL reset the Risk_Score to zero and hide the risk scanner panel.
4. THE Upload_Page SHALL update the risk breakdown bars, score ring, and severity label within 200ms of a re-computation completing.

### Requirement 6: File List with Metadata Indicators

**User Story:** As a user, I want to see which metadata fields were found in each file, so that I know exactly what personal data is at risk.

#### Acceptance Criteria

1. WHILE the File_Queue contains files, THE Upload_Page SHALL display a scrollable file list showing each file's name, size, format badge, and metadata field count.
2. WHEN the Risk_Scanner completes analysis of a file, THE Upload_Page SHALL display the detected metadata field count and GPS presence indicator for that file in the file list.
3. THE Upload_Page SHALL display a device identifier (camera make/model) for each file where such metadata was detected.

### Requirement 7: Non-Blocking UI Performance

**User Story:** As a user, I want the scanning to happen without freezing the interface, so that I can continue adding files while analysis is in progress.

#### Acceptance Criteria

1. WHILE the Risk_Scanner is processing files, THE Upload_Page SHALL remain interactive and accept additional file uploads without delay.
2. THE Metadata_Parser SHALL process each file asynchronously so that the main UI thread is not blocked for more than 50ms per parsing operation.
3. IF a file exceeds 200MB in size, THEN THE Metadata_Parser SHALL read only the metadata header segments (first 512KB for images, first 2MB for videos) rather than the entire file.

### Requirement 8: Start Cleaning Transition

**User Story:** As a user, I want to proceed to metadata cleaning when I am satisfied with my file selection, so that I can initiate the cleaning process.

#### Acceptance Criteria

1. WHILE the File_Queue contains at least one file, THE Upload_Page SHALL display an enabled "Start Cleaning" button.
2. WHEN the File_Queue is empty, THE Upload_Page SHALL display the "Start Cleaning" button in a disabled state.
3. WHEN the user clicks the "Start Cleaning" button, THE Upload_Page SHALL navigate to the cleaning process (step3) passing the current File_Queue.
4. THE Upload_Page SHALL allow files to be added or removed at any time before the "Start Cleaning" button is clicked.

### Requirement 9: Mobile Risk Summary Banner

**User Story:** As a user on a mobile device, I want a compact risk summary visible without excessive scrolling, so that I can quickly understand my risk level on a small screen.

#### Acceptance Criteria

1. WHILE the File_Queue contains files and the viewport width is below 1024px, THE Upload_Page SHALL display a compact risk banner showing the overall Risk_Score and severity level.
2. THE Upload_Page SHALL position the mobile risk banner between the upload zone and the file list for easy visibility.
3. WHEN the aggregated Risk_Score changes, THE Upload_Page SHALL update the mobile risk banner within 200ms.
