# Memory

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
