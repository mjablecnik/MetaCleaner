import { writeFile } from 'fs/promises';
import type { UploadedFile, JobResponse, JobStatus } from './types.js';
import type { ProgressIndicator } from './progress.js';

export class TimeoutError extends Error {
  constructor(
    public readonly elapsedSeconds: number,
    public readonly timeoutSeconds: number,
  ) {
    super(
      `Server job timed out after ${elapsedSeconds}s (configured timeout: ${timeoutSeconds}s)`,
    );
    this.name = 'TimeoutError';
  }
}

export class ServerError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ServerError';
  }
}

async function assertOk(response: Response): Promise<void> {
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as { message?: string; error?: string };
      message = body.message ?? body.error ?? message;
    } catch {
      // ignore JSON parse errors
    }
    throw new ServerError(response.status, message);
  }
}

export async function checkHealth(serverUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${serverUrl}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function uploadFiles(serverUrl: string, filePaths: string[]): Promise<UploadedFile[]> {
  const form = new FormData();

  for (const filePath of filePaths) {
    const file = Bun.file(filePath);
    const fileName = filePath.split('/').pop() ?? filePath;
    form.append('files', new File([await file.arrayBuffer()], fileName, { type: file.type || 'application/octet-stream' }));
  }

  const response = await fetch(`${serverUrl}/api/upload`, {
    method: 'POST',
    body: form,
  });

  await assertOk(response);

  const body = (await response.json()) as { files: UploadedFile[] };
  return body.files;
}

export async function createJob(serverUrl: string, fileIds: string[]): Promise<JobResponse> {
  const response = await fetch(`${serverUrl}/api/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileIds }),
  });

  await assertOk(response);

  return (await response.json()) as JobResponse;
}

export async function waitForJob(
  serverUrl: string,
  jobId: string,
  timeoutSeconds: number,
  progress: ProgressIndicator,
): Promise<JobStatus> {
  const startTime = Date.now();
  let pollInterval = 1000;

  progress.start(`Waiting for job ${jobId}...`);

  while (true) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    const elapsedMs = Date.now() - startTime;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);

    if (elapsedSeconds >= timeoutSeconds) {
      progress.stop();
      throw new TimeoutError(elapsedSeconds, timeoutSeconds);
    }

    const response = await fetch(`${serverUrl}/api/jobs/${jobId}`);
    await assertOk(response);

    const status = (await response.json()) as JobStatus;

    progress.update(
      `Processing... ${status.filesCompleted}/${status.totalFiles} files (${elapsedSeconds}s)`,
    );

    if (status.status === 'completed' || status.status === 'failed') {
      progress.stop();
      return status;
    }

    // Back off slightly after first few polls (max 3s)
    if (pollInterval < 3000) {
      pollInterval = Math.min(pollInterval * 1.5, 3000);
    }
  }
}

export async function downloadFile(
  serverUrl: string,
  fileId: string,
  outputPath: string,
): Promise<void> {
  const response = await fetch(`${serverUrl}/api/files/${fileId}/download`);
  await assertOk(response);

  const buffer = await response.arrayBuffer();
  await writeFile(outputPath, Buffer.from(buffer));
}
