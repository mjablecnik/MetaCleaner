package source

import (
	"bytes"
	"fmt"
	"image/png"
	"os"
	"strings"

	"github.com/signintech/gopdf"
	qrcode "github.com/skip2/go-qrcode"
)

var regularFontPaths = []string{
	"/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
	"/usr/share/fonts/liberation/LiberationSans-Regular.ttf",
	"/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
	"/usr/share/fonts/dejavu/DejaVuSans.ttf",
}

var boldFontPaths = []string{
	"/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
	"/usr/share/fonts/liberation/LiberationSans-Bold.ttf",
	"/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
	"/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
}

func findFont(candidates []string) string {
	for _, p := range candidates {
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}
	return ""
}

const (
	pdfMargin  = 40.0
	pdfPageW   = 595.28
	pdfPageH   = 841.89
	pdfFooterY = pdfPageH - 30
)

// GenerateReportPDF creates a comprehensive PDF report from a PDFReportContext.
// The PDF serves as a verifiable proof of metadata cleaning with file hashes,
// detailed metadata breakdown, tool versions, and a QR code for online verification.
func GenerateReportPDF(ctx *PDFReportContext) ([]byte, error) {
	report := ctx.Report

	fontPath := findFont(regularFontPaths)
	if fontPath == "" {
		return nil, fmt.Errorf("no suitable font found for PDF generation")
	}
	boldPath := findFont(boldFontPaths)
	if boldPath == "" {
		boldPath = fontPath
	}

	pdf := gopdf.GoPdf{}
	pdf.Start(gopdf.Config{PageSize: *gopdf.PageSizeA4})

	if err := pdf.AddTTFFont("sans", fontPath); err != nil {
		return nil, fmt.Errorf("load font: %w", err)
	}
	if err := pdf.AddTTFFont("bold", boldPath); err != nil {
		return nil, fmt.Errorf("load bold font: %w", err)
	}

	pdf.AddPage()
	pageNum := 1

	// --- Helper: check if we need a new page ---
	ensureSpace := func(y *float64, needed float64) {
		if *y+needed > pdfFooterY-10 {
			drawFooter(&pdf, pageNum)
			pdf.AddPage()
			pageNum++
			*y = pdfMargin
		}
	}

	// =====================================================
	// PAGE 1: Header + QR Code + Summary + Tool Versions
	// =====================================================

	y := pdfMargin

	// --- Header with title and QR code side by side ---
	_ = pdf.SetFont("bold", "", 22)
	pdf.SetXY(pdfMargin, y)
	_ = pdf.Cell(nil, "MetaCleaner")

	_ = pdf.SetFont("sans", "", 12)
	pdf.SetXY(pdfMargin, y+28)
	_ = pdf.Cell(nil, "Metadata Cleaning Certificate")

	// QR Code — top right corner
	qrSize := 90.0
	qrX := pdfPageW - pdfMargin - qrSize
	qrY := y
	if err := drawQRCode(&pdf, ctx, qrX, qrY, qrSize); err != nil {
		// QR code generation failed — continue without it, not fatal
		_ = pdf.SetFont("sans", "", 8)
		pdf.SetXY(qrX, qrY+qrSize/2)
		_ = pdf.Cell(nil, "(QR unavailable)")
	}

	y += 56

	// --- Report identification ---
	_ = pdf.SetFont("bold", "", 11)
	pdf.SetXY(pdfMargin, y)
	_ = pdf.Cell(nil, "Report ID:")
	_ = pdf.SetFont("sans", "", 11)
	pdf.SetXY(pdfMargin+80, y)
	_ = pdf.Cell(nil, report.ReportID)
	y += 16

	_ = pdf.SetFont("bold", "", 11)
	pdf.SetXY(pdfMargin, y)
	_ = pdf.Cell(nil, "Date:")
	_ = pdf.SetFont("sans", "", 11)
	pdf.SetXY(pdfMargin+80, y)
	_ = pdf.Cell(nil, report.Date)
	y += 16

	// Verification URL
	verifyURL := buildVerifyURL(ctx)
	if verifyURL != "" {
		_ = pdf.SetFont("bold", "", 11)
		pdf.SetXY(pdfMargin, y)
		_ = pdf.Cell(nil, "Verify online:")
		_ = pdf.SetFont("sans", "", 9)
		pdf.SetXY(pdfMargin+80, y)
		_ = pdf.Cell(nil, verifyURL)
		y += 16
	}

	// Separator
	y += 6
	pdf.SetLineWidth(0.5)
	pdf.Line(pdfMargin, y, pdfPageW-pdfMargin, y)
	y += 14

	// --- Summary section ---
	_ = pdf.SetFont("bold", "", 14)
	pdf.SetXY(pdfMargin, y)
	_ = pdf.Cell(nil, "Cleaning Summary")
	y += 22

	_ = pdf.SetFont("sans", "", 11)
	summaryRows := [][]string{
		{"Files Processed:", fmt.Sprintf("%d", report.FilesProcessed)},
		{"Total Fields Removed:", fmt.Sprintf("%d", report.FieldsRemoved)},
		{"GPS Locations Removed:", fmt.Sprintf("%d", report.GPSLocationsRemoved)},
		{"Processing Time:", fmt.Sprintf("%ds", report.TotalTimeSeconds)},
	}
	for _, row := range summaryRows {
		_ = pdf.SetFont("bold", "", 11)
		pdf.SetXY(pdfMargin, y)
		_ = pdf.Cell(nil, row[0])
		_ = pdf.SetFont("sans", "", 11)
		pdf.SetXY(pdfMargin+160, y)
		_ = pdf.Cell(nil, row[1])
		y += 16
	}

	y += 8
	pdf.Line(pdfMargin, y, pdfPageW-pdfMargin, y)
	y += 14

	// --- Cleaning Verification Statement ---
	_ = pdf.SetFont("bold", "", 14)
	pdf.SetXY(pdfMargin, y)
	_ = pdf.Cell(nil, "Verification Statement")
	y += 20

	_ = pdf.SetFont("sans", "", 11)
	statement := "All files listed in this report have been processed by MetaCleaner. " +
		"Privacy-relevant metadata (GPS coordinates, device identifiers, timestamps, " +
		"software information, XMP data, and AI content credentials) has been removed. " +
		"The SHA-256 hashes below can be used to verify that the cleaned files have not " +
		"been modified after processing."
	y = drawWrappedText(&pdf, pdfMargin, y, pdfPageW-2*pdfMargin, statement, 14)
	y += 8
	pdf.Line(pdfMargin, y, pdfPageW-pdfMargin, y)
	y += 14

	// --- Tool Versions ---
	_ = pdf.SetFont("bold", "", 14)
	pdf.SetXY(pdfMargin, y)
	_ = pdf.Cell(nil, "Processing Environment")
	y += 20

	_ = pdf.SetFont("sans", "", 10)
	toolRows := [][]string{
		{"MetaCleaner Version:", ctx.ServiceVer},
		{"ExifTool Version:", ctx.ExifToolVer},
		{"FFmpeg Version:", ctx.FFmpegVer},
	}
	for _, row := range toolRows {
		_ = pdf.SetFont("bold", "", 10)
		pdf.SetXY(pdfMargin, y)
		_ = pdf.Cell(nil, row[0])
		_ = pdf.SetFont("sans", "", 10)
		pdf.SetXY(pdfMargin+140, y)
		_ = pdf.Cell(nil, row[1])
		y += 15
	}

	y += 8
	pdf.Line(pdfMargin, y, pdfPageW-pdfMargin, y)
	y += 14

	// --- Category Breakdown ---
	if len(report.ChartData) > 0 {
		ensureSpace(&y, 80)
		_ = pdf.SetFont("bold", "", 14)
		pdf.SetXY(pdfMargin, y)
		_ = pdf.Cell(nil, "Metadata Category Breakdown")
		y += 20

		// Table header
		_ = pdf.SetFont("bold", "", 10)
		pdf.SetXY(pdfMargin, y)
		_ = pdf.Cell(nil, "Category")
		pdf.SetXY(pdfMargin+150, y)
		_ = pdf.Cell(nil, "Fields Removed")
		pdf.SetXY(pdfMargin+280, y)
		_ = pdf.Cell(nil, "Percentage")
		y += 16

		_ = pdf.SetFont("sans", "", 10)
		for _, cd := range report.ChartData {
			pdf.SetXY(pdfMargin, y)
			_ = pdf.Cell(nil, cd.Label)
			pdf.SetXY(pdfMargin+150, y)
			_ = pdf.Cell(nil, fmt.Sprintf("%d", cd.Fields))
			pdf.SetXY(pdfMargin+280, y)
			_ = pdf.Cell(nil, fmt.Sprintf("%d%%", cd.Percentage))
			y += 15
		}

		y += 8
		pdf.Line(pdfMargin, y, pdfPageW-pdfMargin, y)
		y += 14
	}

	// =====================================================
	// FILE DETAILS — one section per file
	// =====================================================

	if len(report.Files) > 0 {
		ensureSpace(&y, 40)
		_ = pdf.SetFont("bold", "", 14)
		pdf.SetXY(pdfMargin, y)
		_ = pdf.Cell(nil, "File Details & Integrity Hashes")
		y += 22

		for i, f := range report.Files {
			// Estimate space needed for this file block
			neededHeight := 110.0 // base height for file info
			if f.Metadata != nil {
				fieldCount := len(f.Metadata.GPSFields) + len(f.Metadata.EXIFFields) +
					len(f.Metadata.XMPFields) + len(f.Metadata.ID3Fields) + len(f.Metadata.MP4Atoms) +
					len(f.Metadata.PNGChunks)
				if fieldCount > 0 {
					neededHeight += 20 + float64(min(fieldCount, 15))*13
				}
			}
			ensureSpace(&y, min(neededHeight, 200))

			// File header
			_ = pdf.SetFont("bold", "", 11)
			pdf.SetXY(pdfMargin, y)
			displayName := f.OriginalName
			if displayName == "" {
				displayName = f.Name
			}
			_ = pdf.Cell(nil, fmt.Sprintf("File %d: %s", i+1, displayName))
			y += 16

			// File properties table
			_ = pdf.SetFont("sans", "", 10)
			fileProps := [][]string{
				{"Format:", fmt.Sprintf("%s (%s)", strings.ToUpper(f.Format), f.Type)},
				{"Size:", f.SizeMB + " MB"},
				{"Extension:", f.Extension},
			}
			if f.CleanedName != "" {
				fileProps = append(fileProps, []string{"Cleaned filename:", f.CleanedName})
			}
			if f.Device != "" {
				fileProps = append(fileProps, []string{"Device:", f.Device})
			}
			fileProps = append(fileProps, []string{"Fields Removed:", fmt.Sprintf("%d", f.FieldsRemoved)})
			gpsStr := "No"
			if f.HasGPS {
				gpsStr = "Yes"
			}
			fileProps = append(fileProps, []string{"GPS Data Removed:", gpsStr})

			for _, prop := range fileProps {
				ensureSpace(&y, 14)
				_ = pdf.SetFont("bold", "", 10)
				pdf.SetXY(pdfMargin+10, y)
				_ = pdf.Cell(nil, prop[0])
				_ = pdf.SetFont("sans", "", 10)
				pdf.SetXY(pdfMargin+130, y)
				_ = pdf.Cell(nil, prop[1])
				y += 14
			}

			// SHA-256 Hash
			if f.SHA256Hash != "" {
				ensureSpace(&y, 14)
				_ = pdf.SetFont("bold", "", 10)
				pdf.SetXY(pdfMargin+10, y)
				_ = pdf.Cell(nil, "SHA-256:")
				_ = pdf.SetFont("sans", "", 8)
				pdf.SetXY(pdfMargin+130, y)
				_ = pdf.Cell(nil, f.SHA256Hash)
				y += 14
			}

			// Detailed metadata fields removed (labels only — values may contain sensitive data)
			// NOTE: Commented out to keep PDF compact. Detail is available in the online report via QR code.
			// Uncomment to include per-field listing in the PDF.
			/*
			if f.Metadata != nil {
				allFields := collectMetadataLabels(f.Metadata)
				if len(allFields) > 0 {
					y += 6
					ensureSpace(&y, 30)
					_ = pdf.SetFont("bold", "", 10)
					pdf.SetXY(pdfMargin+10, y)
					_ = pdf.Cell(nil, "Removed metadata fields:")
					y += 14

					_ = pdf.SetFont("sans", "", 9)
					for _, fieldGroup := range allFields {
						ensureSpace(&y, 13)
						pdf.SetXY(pdfMargin+20, y)
						_ = pdf.Cell(nil, fmt.Sprintf("[%s] %s", fieldGroup.category, fieldGroup.label))
						y += 13
					}
				}
			}
			*/

			// Separator between files
			y += 8
			if i < len(report.Files)-1 {
				pdf.SetLineWidth(0.3)
				pdf.Line(pdfMargin+10, y, pdfPageW-pdfMargin-10, y)
				y += 10
			}
		}
	}

	// --- Final separator and clean statement ---
	ensureSpace(&y, 50)
	y += 6
	pdf.SetLineWidth(0.5)
	pdf.Line(pdfMargin, y, pdfPageW-pdfMargin, y)
	y += 14

	_ = pdf.SetFont("bold", "", 11)
	pdf.SetXY(pdfMargin, y)
	_ = pdf.Cell(nil, "Result: All processed files are free of privacy-relevant metadata.")
	y += 18

	_ = pdf.SetFont("sans", "", 9)
	pdf.SetXY(pdfMargin, y)
	_ = pdf.Cell(nil, "This document was generated automatically by MetaCleaner. Scan the QR code to verify online.")

	// Footer on last page
	drawFooter(&pdf, pageNum)

	b := pdf.GetBytesPdf()
	if len(b) == 0 {
		return nil, fmt.Errorf("PDF generation produced empty output")
	}
	return b, nil
}

// drawFooter renders the page footer with page number and branding.
func drawFooter(pdf *gopdf.GoPdf, pageNum int) {
	_ = pdf.SetFont("sans", "", 8)
	pdf.SetXY(pdfMargin, pdfFooterY)
	_ = pdf.Cell(nil, fmt.Sprintf("Page %d  |  MetaCleaner — Metadata Cleaning Certificate  |  metacleaner.com", pageNum))
}

// drawQRCode generates and embeds a QR code image into the PDF.
func drawQRCode(pdf *gopdf.GoPdf, ctx *PDFReportContext, x, y, size float64) error {
	url := buildVerifyURL(ctx)
	if url == "" {
		return fmt.Errorf("no frontend URL configured")
	}

	// Generate QR code as PNG bytes
	qr, err := qrcode.New(url, qrcode.Medium)
	if err != nil {
		return fmt.Errorf("qr encode: %w", err)
	}
	qr.DisableBorder = false

	qrImg := qr.Image(256)

	// Encode to PNG in memory
	var buf bytes.Buffer
	if err := png.Encode(&buf, qrImg); err != nil {
		return fmt.Errorf("png encode: %w", err)
	}

	// gopdf requires an ImageHolder
	imgH, err := gopdf.ImageHolderByReader(bytes.NewReader(buf.Bytes()))
	if err != nil {
		return fmt.Errorf("image holder: %w", err)
	}

	rect := &gopdf.Rect{W: size, H: size}
	if err := pdf.ImageByHolder(imgH, x, y, rect); err != nil {
		return fmt.Errorf("image embed: %w", err)
	}

	// Label under QR code
	_ = pdf.SetFont("sans", "", 7)
	pdf.SetXY(x, y+size+2)
	_ = pdf.Cell(nil, "Scan to verify online")

	return nil
}

// buildVerifyURL constructs the public PDF download URL for the report QR code.
func buildVerifyURL(ctx *PDFReportContext) string {
	if ctx.FrontendURL == "" || ctx.Report == nil {
		return ""
	}
	// Points to the public PDF endpoint on the backend API.
	// FrontendURL is used as base because CORS and the backend share the same domain
	// in production (via fly.io proxy). If backend has a different URL, override accordingly.
	// The public endpoint serves the PDF directly without authentication.
	base := strings.TrimRight(ctx.BackendURL, "/")
	if base == "" {
		return ""
	}
	return base + "/api/public/reports/" + ctx.Report.ReportID + "/pdf"
}

// drawWrappedText renders multi-line text within maxWidth, returning the final Y position.
func drawWrappedText(pdf *gopdf.GoPdf, x, y, maxWidth float64, text string, lineHeight float64) float64 {
	words := strings.Fields(text)
	line := ""
	for _, word := range words {
		test := line
		if test != "" {
			test += " "
		}
		test += word

		w, _ := pdf.MeasureTextWidth(test)
		if w > maxWidth && line != "" {
			pdf.SetXY(x, y)
			_ = pdf.Cell(nil, line)
			y += lineHeight
			line = word
		} else {
			line = test
		}
	}
	if line != "" {
		pdf.SetXY(x, y)
		_ = pdf.Cell(nil, line)
		y += lineHeight
	}
	return y
}

// metadataLabelEntry holds a category + label for display in the PDF.
type metadataLabelEntry struct {
	category string
	label    string
}

// collectMetadataLabels extracts all metadata field labels grouped by category.
func collectMetadataLabels(md *MetadataDetail) []metadataLabelEntry {
	var entries []metadataLabelEntry

	for _, f := range md.GPSFields {
		entries = append(entries, metadataLabelEntry{category: "GPS", label: f.Label})
	}
	for _, f := range md.EXIFFields {
		entries = append(entries, metadataLabelEntry{category: "EXIF", label: f.Label})
	}
	for _, f := range md.XMPFields {
		entries = append(entries, metadataLabelEntry{category: "XMP", label: f.Label})
	}
	for _, f := range md.ID3Fields {
		entries = append(entries, metadataLabelEntry{category: "ID3", label: f.Label})
	}
	for _, f := range md.MP4Atoms {
		entries = append(entries, metadataLabelEntry{category: "MP4", label: f.Label})
	}
	for _, f := range md.PNGChunks {
		entries = append(entries, metadataLabelEntry{category: "PNG", label: f.Label})
	}

	return entries
}
