package source

import (
	"testing"
)

// formatBytes is defined in config.go: formats bytes as MB when >= 1MB, else as bytes.

func TestFormatBytes_BelowOneMB(t *testing.T) {
	cases := []struct {
		input    int64
		expected string
	}{
		{0, "0 B"},
		{1, "1 B"},
		{1023, "1023 B"},
		{1024, "1024 B"},
		{1024*1024 - 1, "1048575 B"},
	}
	for _, tc := range cases {
		got := formatBytes(tc.input)
		if got != tc.expected {
			t.Errorf("formatBytes(%d) = %q, want %q", tc.input, got, tc.expected)
		}
	}
}

func TestFormatBytes_AtAndAboveOneMB(t *testing.T) {
	cases := []struct {
		input    int64
		expected string
	}{
		{1024 * 1024, "1 MB"},
		{5 * 1024 * 1024, "5 MB"},
		{100 * 1024 * 1024, "100 MB"},
		{1024 * 1024 * 1024, "1024 MB"},
	}
	for _, tc := range cases {
		got := formatBytes(tc.input)
		if got != tc.expected {
			t.Errorf("formatBytes(%d) = %q, want %q", tc.input, got, tc.expected)
		}
	}
}

func TestFormatBytes_NegativeDoesNotPanic(t *testing.T) {
	// Negative values should not panic; exact output is unspecified but must not crash.
	defer func() {
		if r := recover(); r != nil {
			t.Errorf("formatBytes(-1) panicked: %v", r)
		}
	}()
	_ = formatBytes(-1)
}

// formatBytesHuman is defined in handlers.go: formats bytes as GB (1 decimal),
// MB (1 decimal), or raw bytes.

func TestFormatBytesHuman_Bytes(t *testing.T) {
	cases := []struct {
		input    int64
		expected string
	}{
		{0, "0 B"},
		{1, "1 B"},
		{999, "999 B"},
		{1023, "1023 B"},
	}
	for _, tc := range cases {
		got := formatBytesHuman(tc.input)
		if got != tc.expected {
			t.Errorf("formatBytesHuman(%d) = %q, want %q", tc.input, got, tc.expected)
		}
	}
}

func TestFormatBytesHuman_Megabytes(t *testing.T) {
	const mb = int64(1024 * 1024)
	cases := []struct {
		input    int64
		expected string
	}{
		{1 * mb, "1.0 MB"},
		{5 * mb, "5.0 MB"},
		{512 * mb, "512.0 MB"},
	}
	for _, tc := range cases {
		got := formatBytesHuman(tc.input)
		if got != tc.expected {
			t.Errorf("formatBytesHuman(%d) = %q, want %q", tc.input, got, tc.expected)
		}
	}
}

func TestFormatBytesHuman_Gigabytes(t *testing.T) {
	const gb = int64(1024 * 1024 * 1024)
	cases := []struct {
		input    int64
		expected string
	}{
		{1 * gb, "1.0 GB"},
		{2 * gb, "2.0 GB"},
		{10 * gb, "10.0 GB"},
	}
	for _, tc := range cases {
		got := formatBytesHuman(tc.input)
		if got != tc.expected {
			t.Errorf("formatBytesHuman(%d) = %q, want %q", tc.input, got, tc.expected)
		}
	}
}

func TestFormatBytesHuman_NegativeDoesNotPanic(t *testing.T) {
	defer func() {
		if r := recover(); r != nil {
			t.Errorf("formatBytesHuman(-1) panicked: %v", r)
		}
	}()
	_ = formatBytesHuman(-1)
}
