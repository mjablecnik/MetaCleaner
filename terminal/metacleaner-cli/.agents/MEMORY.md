# Memory

## Bun not pre-installed in this environment
- Problem: `bun` command not found; spec requires Bun runtime for workspace link, execution, and tests
- Solution: Install via `curl -fsSL https://bun.sh/install | bash` then add `$HOME/.bun/bin` to PATH for the session
- Source: create-code, 2026-06-06 21:58

## Workspace link resolves from package directory
- Problem: `import 'metacleaner-app/src/...'` fails when the script is run from outside the CLI package directory (e.g. /tmp)
- Solution: Run scripts from within `/workspace/terminal/metacleaner-cli/` so Bun resolves node_modules from the right package root
- Source: create-code, 2026-06-06 21:58
