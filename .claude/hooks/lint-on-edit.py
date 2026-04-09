#!/usr/bin/env python3
"""PostToolUse[Edit|Write|MultiEdit] hook — runs ESLint on the touched .ts/.tsx
file and feeds findings back to Claude on exit code 2 (PostToolUse exit-2 is
non-blocking — the edit already happened — but the stderr is added to context
so Claude can self-correct on its next action).

Wired in: .claude/settings.json -> hooks.PostToolUse[matcher=Edit|Write|MultiEdit]

Skips:
  - Non-TypeScript files
  - Generated paths (.next/, node_modules/, next-env.d.ts)
  - Anything missing from disk (e.g. a delete)

If eslint isn't available locally (npx --no-install fails), the hook silently
no-ops so it never blocks on a tooling problem.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys

LINT_EXTENSIONS = (".ts", ".tsx")
SKIP_FRAGMENTS = (".next/", "node_modules/", "next-env.d.ts")


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    inp = payload.get("tool_input") or {}
    path = inp.get("file_path", "")
    if not path:
        sys.exit(0)
    if not path.endswith(LINT_EXTENSIONS):
        sys.exit(0)
    if any(seg in path for seg in SKIP_FRAGMENTS):
        sys.exit(0)
    if not os.path.exists(path):
        sys.exit(0)

    repo = os.environ.get("CLAUDE_PROJECT_DIR") or os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )

    try:
        rel = os.path.relpath(path, repo)
    except Exception:
        rel = path

    try:
        result = subprocess.run(
            ["npx", "--no-install", "eslint", "--no-warn-ignored", rel],
            cwd=repo,
            capture_output=True,
            text=True,
            timeout=90,
        )
    except FileNotFoundError:
        sys.exit(0)
    except subprocess.TimeoutExpired:
        print("[hook:lint-on-edit] eslint timed out — skipping.", file=sys.stderr)
        sys.exit(0)
    except Exception as exc:
        print(f"[hook:lint-on-edit] eslint skipped: {exc}", file=sys.stderr)
        sys.exit(0)

    if result.returncode != 0:
        details = (result.stdout or "") + (result.stderr or "")
        print(
            f"[hook:lint-on-edit] eslint flagged {rel}:\n{details}\n"
            "Fix these before declaring the task done (see /ship).",
            file=sys.stderr,
        )
        sys.exit(2)


if __name__ == "__main__":
    main()
