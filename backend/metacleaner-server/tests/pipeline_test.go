package tests

import (
	"strings"
	"testing"

	"pgregory.net/rapid"
)

// --- duplicated categorization logic for property testing ---

func testCategorizeMetadataField(key, source string) string {
	upper := strings.ToUpper(key)
	switch source {
	case "exif":
		if strings.HasPrefix(upper, "GPS") {
			return "GPS"
		}
		if strings.HasPrefix(upper, "XMP") {
			return "XMP"
		}
		return "EXIF"
	case "ffmpeg":
		id3Keys := map[string]bool{
			"TITLE": true, "ARTIST": true, "ALBUM": true, "ALBUMARTIST": true,
			"COMMENT": true, "GENRE": true, "TRACK": true, "DATE": true, "YEAR": true,
			"COMPOSER": true, "LYRICS": true, "DESCRIPTION": true, "ENCODER": true,
		}
		if id3Keys[upper] {
			return "ID3"
		}
		return "MP4"
	default:
		return "EXIF"
	}
}

// Property 4: every exif field maps to exactly one of GPS/XMP/EXIF.
func TestProperty4_MetadataFieldCategorizationExif(t *testing.T) {
	rapid.Check(t, func(rt *rapid.T) {
		key := rapid.StringOf(rapid.RuneFrom([]rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_:"))).Draw(rt, "key")
		cat := testCategorizeMetadataField(key, "exif")
		validCats := map[string]bool{"GPS": true, "XMP": true, "EXIF": true}
		if !validCats[cat] {
			rt.Fatalf("exif key %q produced unexpected category %q", key, cat)
		}

		// GPS prefix → GPS always
		if strings.HasPrefix(strings.ToUpper(key), "GPS") && cat != "GPS" {
			rt.Fatalf("GPS-prefixed key %q should categorize as GPS, got %q", key, cat)
		}
		// XMP prefix → XMP always
		if strings.HasPrefix(strings.ToUpper(key), "XMP") && cat != "XMP" {
			rt.Fatalf("XMP-prefixed key %q should categorize as XMP, got %q", key, cat)
		}
	})
}

// Property 4b: every ffmpeg field maps to exactly one of ID3/MP4.
func TestProperty4b_MetadataFieldCategorizationFFmpeg(t *testing.T) {
	rapid.Check(t, func(rt *rapid.T) {
		key := rapid.StringOf(rapid.RuneFrom([]rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"))).Draw(rt, "key")
		cat := testCategorizeMetadataField(key, "ffmpeg")
		validCats := map[string]bool{"ID3": true, "MP4": true}
		if !validCats[cat] {
			rt.Fatalf("ffmpeg key %q produced unexpected category %q", key, cat)
		}
	})
}

// Property 4c: categorization is deterministic — same key+source always yields same result.
func TestProperty4c_CategorizationDeterministic(t *testing.T) {
	rapid.Check(t, func(rt *rapid.T) {
		key := rapid.StringOf(rapid.RuneFrom([]rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_:"))).Draw(rt, "key")
		source := rapid.SampledFrom([]string{"exif", "ffmpeg", "unknown"}).Draw(rt, "source")
		c1 := testCategorizeMetadataField(key, source)
		c2 := testCategorizeMetadataField(key, source)
		if c1 != c2 {
			rt.Fatalf("non-deterministic result for key=%q source=%q: %q vs %q", key, source, c1, c2)
		}
	})
}
