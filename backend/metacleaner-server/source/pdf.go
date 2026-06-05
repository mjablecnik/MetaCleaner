package source

import (
	"fmt"
	"os"

	"github.com/signintech/gopdf"
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

// GenerateReportPDF creates a PDF report from a ReportDetail and returns the raw bytes.
func GenerateReportPDF(report *ReportDetail) ([]byte, error) {
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

	const (
		margin  = 40.0
		pageW   = 595.28
		pageH   = 841.89
		footerY = pageH - 25
	)

	pageNum := 1

	// --- Header ---
	_ = pdf.SetFont("bold", "", 20)
	pdf.SetXY(margin, margin)
	_ = pdf.Cell(nil, "MetaCleaner Report")

	_ = pdf.SetFont("sans", "", 12)
	pdf.SetXY(margin, margin+30)
	_ = pdf.Cell(nil, "Report ID: "+report.ReportID)
	pdf.SetXY(margin, margin+46)
	_ = pdf.Cell(nil, "Date: "+report.Date)

	// Header separator
	y := margin + 66.0
	pdf.SetLineWidth(0.5)
	pdf.Line(margin, y, pageW-margin, y)
	y += 14

	// --- Summary section ---
	_ = pdf.SetFont("bold", "", 14)
	pdf.SetXY(margin, y)
	_ = pdf.Cell(nil, "Summary")
	y += 20

	_ = pdf.SetFont("sans", "", 12)
	rows := [][]string{
		{"Files Processed:", fmt.Sprintf("%d", report.FilesProcessed)},
		{"Fields Removed:", fmt.Sprintf("%d", report.FieldsRemoved)},
		{"GPS Locations Removed:", fmt.Sprintf("%d", report.GPSLocationsRemoved)},
		{"Total Processing Time:", fmt.Sprintf("%ds", report.TotalTimeSeconds)},
	}
	for _, row := range rows {
		pdf.SetXY(margin, y)
		_ = pdf.Cell(nil, row[0])
		pdf.SetXY(margin+200, y)
		_ = pdf.Cell(nil, row[1])
		y += 18
	}

	// Separator
	y += 8
	pdf.Line(margin, y, pageW-margin, y)
	y += 14

	// --- Category Breakdown ---
	if len(report.ChartData) > 0 {
		_ = pdf.SetFont("bold", "", 14)
		pdf.SetXY(margin, y)
		_ = pdf.Cell(nil, "Metadata Category Breakdown")
		y += 20

		_ = pdf.SetFont("bold", "", 11)
		pdf.SetXY(margin, y)
		_ = pdf.Cell(nil, "Category")
		pdf.SetXY(margin+150, y)
		_ = pdf.Cell(nil, "Fields Removed")
		pdf.SetXY(margin+280, y)
		_ = pdf.Cell(nil, "Percentage")
		y += 16

		_ = pdf.SetFont("sans", "", 11)
		for _, cd := range report.ChartData {
			pdf.SetXY(margin, y)
			_ = pdf.Cell(nil, cd.Label)
			pdf.SetXY(margin+150, y)
			_ = pdf.Cell(nil, fmt.Sprintf("%d", cd.Fields))
			pdf.SetXY(margin+280, y)
			_ = pdf.Cell(nil, fmt.Sprintf("%d%%", cd.Percentage))
			y += 16
		}

		y += 8
		pdf.Line(margin, y, pageW-margin, y)
		y += 14
	}

	// --- File Details table ---
	if len(report.Files) > 0 {
		_ = pdf.SetFont("bold", "", 14)
		pdf.SetXY(margin, y)
		_ = pdf.Cell(nil, "File Details")
		y += 20

		// Table header row
		_ = pdf.SetFont("bold", "", 10)
		headers := []struct {
			label string
			x     float64
		}{
			{"#", margin},
			{"File Name", margin + 20},
			{"Type", margin + 180},
			{"Device", margin + 220},
			{"Fields", margin + 340},
			{"GPS", margin + 390},
		}
		for _, h := range headers {
			pdf.SetXY(h.x, y)
			_ = pdf.Cell(nil, h.label)
		}
		y += 16

		// Table rows
		_ = pdf.SetFont("sans", "", 10)
		for i, f := range report.Files {
			// New page if needed
			if y > footerY-20 {
				// Footer on current page
				_ = pdf.SetFont("sans", "", 9)
				pdf.SetXY(margin, footerY)
				_ = pdf.Cell(nil, fmt.Sprintf("Page %d  |  MetaCleaner", pageNum))

				pdf.AddPage()
				pageNum++
				y = margin

				// Re-print table header on new page
				_ = pdf.SetFont("bold", "", 10)
				for _, h := range headers {
					pdf.SetXY(h.x, y)
					_ = pdf.Cell(nil, h.label)
				}
				y += 16
				_ = pdf.SetFont("sans", "", 10)
			}

			name := f.Name
			if len(name) > 28 {
				name = name[:25] + "..."
			}
			device := f.Device
			if len(device) > 16 {
				device = device[:13] + "..."
			}
			gpsStr := "No"
			if f.HasGPS {
				gpsStr = "Yes"
			}

			pdf.SetXY(margin, y)
			_ = pdf.Cell(nil, fmt.Sprintf("%d", i+1))
			pdf.SetXY(margin+20, y)
			_ = pdf.Cell(nil, name)
			pdf.SetXY(margin+180, y)
			_ = pdf.Cell(nil, f.Type)
			pdf.SetXY(margin+220, y)
			_ = pdf.Cell(nil, device)
			pdf.SetXY(margin+340, y)
			_ = pdf.Cell(nil, fmt.Sprintf("%d", f.FieldsRemoved))
			pdf.SetXY(margin+390, y)
			_ = pdf.Cell(nil, gpsStr)
			y += 14
		}
	}

	// Footer on last page
	_ = pdf.SetFont("sans", "", 9)
	pdf.SetXY(margin, footerY)
	_ = pdf.Cell(nil, fmt.Sprintf("Page %d of %d  |  MetaCleaner", pageNum, pdf.GetNumberOfPages()))

	b := pdf.GetBytesPdf()
	if len(b) == 0 {
		return nil, fmt.Errorf("PDF generation produced empty output")
	}
	return b, nil
}
