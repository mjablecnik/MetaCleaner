package source

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	smithyhttp "github.com/aws/smithy-go/transport/http"
)

// TigrisClient wraps S3-compatible object storage operations against Tigris.
type TigrisClient struct {
	client   *s3.Client
	uploader *manager.Uploader
	presign  *s3.PresignClient
	bucket   string
}

// NewTigrisClient builds a TigrisClient from config, using static credentials
// and Tigris's custom S3-compatible endpoint. Extra optFns are applied after
// the endpoint override, letting tests substitute the HTTP transport.
func NewTigrisClient(cfg Config, optFns ...func(*s3.Options)) *TigrisClient {
	awsCfg := aws.Config{
		Region:      "auto",
		Credentials: credentials.NewStaticCredentialsProvider(cfg.TigrisAccessKey, cfg.TigrisSecretKey, ""),
	}

	opts := append([]func(*s3.Options){
		func(o *s3.Options) { o.BaseEndpoint = aws.String(cfg.TigrisEndpoint) },
	}, optFns...)
	client := s3.NewFromConfig(awsCfg, opts...)

	return &TigrisClient{
		client:   client,
		uploader: manager.NewUploader(client),
		presign:  s3.NewPresignClient(client),
		bucket:   cfg.TigrisBucket,
	}
}

// Upload writes body to the bucket at key, using multipart upload for large files.
func (t *TigrisClient) Upload(ctx context.Context, key string, body io.Reader, contentType string) error {
	_, err := t.uploader.Upload(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(t.bucket),
		Key:         aws.String(key),
		Body:        body,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return fmt.Errorf("tigris upload %q: %w", key, err)
	}
	return nil
}

// PresignGetURL returns a presigned GET URL for key, valid for expiry.
func (t *TigrisClient) PresignGetURL(ctx context.Context, key string, expiry time.Duration) (string, error) {
	req, err := t.presign.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(t.bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(expiry))
	if err != nil {
		return "", fmt.Errorf("tigris presign %q: %w", key, err)
	}
	return req.URL, nil
}

// GetObject returns a stream of the object's content at key; the caller must close it.
func (t *TigrisClient) GetObject(ctx context.Context, key string) (io.ReadCloser, error) {
	out, err := t.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(t.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, fmt.Errorf("tigris get object %q: %w", key, err)
	}
	return out.Body, nil
}

// Delete removes the object at key from the bucket.
func (t *TigrisClient) Delete(ctx context.Context, key string) error {
	_, err := t.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(t.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("tigris delete %q: %w", key, err)
	}
	return nil
}

// Exists checks whether an object exists at key in the bucket.
func (t *TigrisClient) Exists(ctx context.Context, key string) (bool, error) {
	_, err := t.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(t.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		// NoSuchKey / NotFound → object doesn't exist.
		// The S3 SDK wraps this; check the HTTP status via the error string.
		// A cleaner approach: use smithy error codes, but string check is pragmatic.
		var nsk *types.NoSuchKey
		if errors.As(err, &nsk) {
			return false, nil
		}
		// For HeadObject, S3 returns 404 as a generic error (not NoSuchKey type).
		// Check via smithy's ResponseError.
		var respErr *smithyhttp.ResponseError
		if errors.As(err, &respErr) && respErr.HTTPStatusCode() == 404 {
			return false, nil
		}
		return false, fmt.Errorf("tigris head %q: %w", key, err)
	}
	return true, nil
}

// Download downloads the object at key to localPath on disk.
func (t *TigrisClient) Download(ctx context.Context, key, localPath string) error {
	body, err := t.GetObject(ctx, key)
	if err != nil {
		return err
	}
	defer body.Close()

	f, err := os.Create(localPath)
	if err != nil {
		return fmt.Errorf("tigris download create file: %w", err)
	}
	defer f.Close()

	if _, err := io.Copy(f, body); err != nil {
		os.Remove(localPath)
		return fmt.Errorf("tigris download copy: %w", err)
	}
	return nil
}
