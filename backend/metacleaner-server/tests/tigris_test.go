package tests

import (
	"bytes"
	"context"
	"errors"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	src "metacleaner-server/source"
)

// fakeS3Transport implements aws.HTTPClient, answering S3 REST calls in-process
// so TigrisClient can be exercised without a real Tigris endpoint or network access.
type fakeS3Transport struct {
	putErr    error
	getErr    error
	deleteErr error
	getBody   []byte

	uploadedBody        []byte
	uploadedContentType string
	deleteCalled        bool
}

func (f *fakeS3Transport) Do(req *http.Request) (*http.Response, error) {
	switch req.Method {
	case http.MethodPut:
		if f.putErr != nil {
			return nil, f.putErr
		}
		body, _ := io.ReadAll(req.Body)
		f.uploadedBody = body
		f.uploadedContentType = req.Header.Get("Content-Type")
		return &http.Response{
			StatusCode: http.StatusOK,
			Header:     http.Header{"ETag": []string{`"fake-etag"`}},
			Body:       io.NopCloser(bytes.NewReader(nil)),
		}, nil
	case http.MethodGet:
		if f.getErr != nil {
			return nil, f.getErr
		}
		return &http.Response{
			StatusCode: http.StatusOK,
			Header:     http.Header{},
			Body:       io.NopCloser(bytes.NewReader(f.getBody)),
		}, nil
	case http.MethodDelete:
		f.deleteCalled = true
		if f.deleteErr != nil {
			return nil, f.deleteErr
		}
		return &http.Response{
			StatusCode: http.StatusNoContent,
			Header:     http.Header{},
			Body:       io.NopCloser(bytes.NewReader(nil)),
		}, nil
	default:
		return nil, errors.New("fakeS3Transport: unexpected method " + req.Method)
	}
}

// newTestTigrisClient builds a TigrisClient wired to transport instead of a real
// network connection, via NewTigrisClient's optional s3.Options overrides.
func newTestTigrisClient(transport *fakeS3Transport) *src.TigrisClient {
	cfg := src.Config{
		TigrisAccessKey:     "test-access-key",
		TigrisSecretKey:     "test-secret-key",
		TigrisBucket:        "test-bucket",
		TigrisEndpoint:      "https://fake.tigris.test",
		TigrisPresignExpiry: time.Hour,
	}
	return src.NewTigrisClient(cfg, func(o *s3.Options) {
		o.HTTPClient = transport
	})
}

func TestTigrisClientUpload(t *testing.T) {
	transport := &fakeS3Transport{}
	client := newTestTigrisClient(transport)

	content := []byte("cleaned file bytes")
	err := client.Upload(context.Background(), "cleaned/f-abc12345_cleaned.jpg", bytes.NewReader(content), "image/jpeg")
	if err != nil {
		t.Fatalf("Upload returned error: %v", err)
	}
	if !bytes.Equal(transport.uploadedBody, content) {
		t.Errorf("uploaded body = %q, want %q", transport.uploadedBody, content)
	}
	if transport.uploadedContentType != "image/jpeg" {
		t.Errorf("uploaded Content-Type = %q, want image/jpeg", transport.uploadedContentType)
	}
}

func TestTigrisClientUploadError(t *testing.T) {
	transport := &fakeS3Transport{putErr: errors.New("connection refused")}
	client := newTestTigrisClient(transport)

	err := client.Upload(context.Background(), "cleaned/f-abc12345_cleaned.jpg", strings.NewReader("data"), "image/jpeg")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestTigrisClientPresignGetURL(t *testing.T) {
	transport := &fakeS3Transport{}
	client := newTestTigrisClient(transport)

	url, err := client.PresignGetURL(context.Background(), "cleaned/f-abc12345_cleaned.jpg", time.Hour)
	if err != nil {
		t.Fatalf("PresignGetURL returned error: %v", err)
	}
	if !strings.Contains(url, "test-bucket") {
		t.Errorf("presigned URL %q does not reference bucket", url)
	}
	if !strings.Contains(url, "cleaned/f-abc12345_cleaned.jpg") {
		t.Errorf("presigned URL %q does not reference key", url)
	}
	if !strings.Contains(url, "X-Amz-Signature=") {
		t.Errorf("presigned URL %q is not signed", url)
	}
	if !strings.Contains(url, "X-Amz-Expires=3600") {
		t.Errorf("presigned URL %q does not carry the requested expiry", url)
	}
}

func TestTigrisClientGetObject(t *testing.T) {
	content := []byte("cleaned file bytes")
	transport := &fakeS3Transport{getBody: content}
	client := newTestTigrisClient(transport)

	rc, err := client.GetObject(context.Background(), "cleaned/f-abc12345_cleaned.jpg")
	if err != nil {
		t.Fatalf("GetObject returned error: %v", err)
	}
	defer rc.Close()

	data, err := io.ReadAll(rc)
	if err != nil {
		t.Fatalf("failed to read object body: %v", err)
	}
	if !bytes.Equal(data, content) {
		t.Errorf("object content = %q, want %q", data, content)
	}
}

func TestTigrisClientGetObjectError(t *testing.T) {
	transport := &fakeS3Transport{getErr: errors.New("connection refused")}
	client := newTestTigrisClient(transport)

	_, err := client.GetObject(context.Background(), "cleaned/f-missing_cleaned.jpg")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestTigrisClientDelete(t *testing.T) {
	transport := &fakeS3Transport{}
	client := newTestTigrisClient(transport)

	if err := client.Delete(context.Background(), "cleaned/f-abc12345_cleaned.jpg"); err != nil {
		t.Fatalf("Delete returned error: %v", err)
	}
	if !transport.deleteCalled {
		t.Error("expected Delete to issue a DELETE request")
	}
}

func TestTigrisClientDeleteError(t *testing.T) {
	transport := &fakeS3Transport{deleteErr: errors.New("connection refused")}
	client := newTestTigrisClient(transport)

	if err := client.Delete(context.Background(), "cleaned/f-abc12345_cleaned.jpg"); err == nil {
		t.Fatal("expected error, got nil")
	}
}
