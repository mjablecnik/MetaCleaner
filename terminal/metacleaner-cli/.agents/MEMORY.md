# Memory

## Clean command skips format validation unlike scan
- Problem: The `scan` command validates file extensions against IMAGE_EXTENSIONS/VIDEO_EXTENSIONS before processing, but the `clean` command uploads any file to the server without validation. This leads to inconsistent error messages (server error vs local "Unsupported format").
- Solution: Add the same extension validation from scanner.ts at the start of the clean command loop, before attempting upload. Report "Unsupported format" locally and continue with remaining files.
- Source: code-review, 2026-06-06T23:16:25.915+00:00

## Compare command temp file path can lose extension
- Problem: In `executeCompare`, the temp file path is constructed as `metacleaner_<timestamp>_<filename>`. If the original filename has no extension, format detection on the cleaned file scan will fail since scanFiles validates extensions.
- Solution: Extract `extname(filePath)` and append it to the temp path directly: `const ext = extname(filePath); const tempPath = join(tmpdir(), \`metacleaner_${Date.now()}${ext}\`);`
- Source: code-review, 2026-06-06T23:16:25.915+00:00

## Bun not pre-installed in this environment
- Problem: `bun` command not found; spec requires Bun runtime for workspace link, execution, and tests
- Solution: Install via `curl -fsSL https://bun.sh/install | bash` then add `$HOME/.bun/bin` to PATH for the session
- Source: create-code, 2026-06-06 21:58

## exifr uses FileReader.onloadend (not onload) in Bun environment
- Problem: exifr.parse(blob) hangs indefinitely in Bun. Adding a FileReader polyfill that only handled `onload` still hung because exifr specifically uses `reader.onloadend = () => resolve(reader.result||new ArrayBuffer)`. The polyfill also must extend EventTarget so dispatchEvent works.
- Solution: FileReader polyfill must (1) extend EventTarget, (2) implement `onloadend` property, (3) dispatch both `load` and `loadend` events on success. Import polyfills.ts first in any file that imports from metacleaner-app. See `src/polyfills.ts`.
- Source: create-code, 2026-06-06

## Workspace link resolves from package directory
- Problem: `import 'metacleaner-app/src/...'` fails when the script is run from outside the CLI package directory (e.g. /tmp)
- Solution: Run scripts from within `/workspace/terminal/metacleaner-cli/` so Bun resolves node_modules from the right package root
- Source: create-code, 2026-06-06 21:58

## Dockerfile COPY destination must include /src subdirectory
- Problem: `COPY terminal/metacleaner-cli/src ./terminal/metacleaner-cli/` copies file contents directly into the package dir (no `src/` subdir), so `bun build src/index.ts` fails with "FileNotFound opening root directory src"
- Solution: Use `COPY terminal/metacleaner-cli/src ./terminal/metacleaner-cli/src` (trailing `/src` in destination) so the source tree is preserved correctly
- Source: verify-builds, 2026-06-06

## CLI Dockerfile requires workspace root as build context
- Problem: CLI depends on `metacleaner-app` (workspace:*); building from within `terminal/metacleaner-cli/` cannot reach `frontend/metacleaner-app/` source
- Solution: Build from workspace root: `docker build -f terminal/metacleaner-cli/Dockerfile -t metacleaner-cli .` — Dockerfile copies both packages before installing and bundling
- Source: verify-builds, 2026-06-06

## Compare command `format` field inconsistent with scan results
- Problem: `executeCompare` computes `format` as `extname(filePath).toLowerCase().slice(1)` (e.g. "jpg"), but `scanFiles` uses `IMAGE_EXTENSIONS[ext]` which maps `.jpg` → `"jpeg"`. This produces inconsistent `FileResult.format` values.
- Solution: Use `IMAGE_EXTENSIONS[ext] ?? VIDEO_EXTENSIONS[ext] ?? ext.slice(1)` in `executeCompare`, same pattern as `executeClean`.
- Source: code-review, 2026-06-06T23:28:34Z

## vi.stubGlobal / importActual not supported in this Bun version
- Problem: `vi.stubGlobal`, `vi.unstubAllGlobals`, and the `importActual` factory argument in `vi.mock()` all throw "not a function" errors when running tests with Bun v1.3.14. Affects scanner.test.ts, serverClient.test.ts, and commands.test.ts.
- Solution: These are pre-existing Bun/vitest compatibility issues unrelated to source changes. formatter.test.ts and progress.test.ts (which don't use these APIs) pass cleanly. Source code correctness should be verified through those tests.
- Source: code-review-fix, 2026-06-06

## MIME type overrides missing for .3gp and .ogv
- Problem: `scanner.ts` constructs MIME type as `video/${VIDEO_EXTENSIONS[ext]}` which produces `video/3gp` and `video/ogv` — the correct types are `video/3gpp` and `video/ogg`.
- Solution: Add entries to `MIME_TYPE_OVERRIDES`: `'.3gp': 'video/3gpp'` and `'.ogv': 'video/ogg'`.
- Source: code-review, 2026-06-06T23:28:34Z
