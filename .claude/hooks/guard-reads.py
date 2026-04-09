#!/usr/bin/env python3
"""PreToolUse[Read|Grep|Glob] guard.

Wired in: .claude/settings.json -> hooks.PreToolUse[matcher=Read|Grep|Glob]

Blocks reads against generated/noisy trees so Claude does not waste context on
build artefacts. Allows the one carve-out documented in AGENTS.md:
node_modules/next/dist/docs/** is REQUIRED reading because this is Next.js 16
and the APIs differ from anything in training data.

Exit 2 = block + send the stderr message back to Claude so it knows why.
"""
from __future__ import annotations

import json
import sys

DENY_PREFIXES = (
    ".next/",
    ".git/",
    "node_modules/",
    "build/",
    "out/",
    ".vercel/",
)

# Carve-outs that override DENY_PREFIXES.
ALLOW_OVERRIDES = (
    "node_modules/next/dist/docs/",
)

DENY_SUFFIXES = (".tsbuildinfo",)
DENY_FILENAMES = ("package-lock.json",)


def deny(message: str) -> None:
    print(f"[hook:guard-reads] BLOCKED: {message}", file=sys.stderr)
    sys.exit(2)


def normalise(path: str) -> str:
    """Strip leading ./ and absolute repo prefix so checks work uniformly.

    NOTE: do NOT use str.lstrip("./") here — that strips a character set,
    so '.next/' would become 'next/' and the .next/ deny rule would silently
    miss. Use removeprefix() to strip the literal './' prefix only.
    """
    if not path:
        return ""
    norm = path
    # Drop a leading absolute repo prefix if present.
    marker = "/portfolio/"
    if marker in norm:
        norm = norm.split(marker, 1)[1]
    if norm.startswith("./"):
        norm = norm[2:]
    return norm


def is_blocked(path: str) -> bool:
    norm = normalise(path)
    if not norm:
        return False
    if any(norm.startswith(a) for a in ALLOW_OVERRIDES):
        return False
    if any(norm.startswith(d) for d in DENY_PREFIXES):
        return True
    if any(norm.endswith(s) for s in DENY_SUFFIXES):
        return True
    if norm.split("/")[-1] in DENY_FILENAMES:
        return True
    return False


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    tool = payload.get("tool_name", "")
    inp = payload.get("tool_input") or {}

    candidates: list[str] = []
    if tool == "Read":
        candidates.append(inp.get("file_path", ""))
    elif tool == "Glob":
        candidates.append(inp.get("path", ""))
        candidates.append(inp.get("pattern", ""))
    elif tool == "Grep":
        candidates.append(inp.get("path", ""))
        candidates.append(inp.get("glob", ""))

    for c in candidates:
        if is_blocked(c):
            deny(
                f"'{c}' is in a generated/forbidden tree. "
                "Allowed exception: node_modules/next/dist/docs/** "
                "(read these BEFORE writing Next.js 16 routing/cache/server-action code)."
            )


if __name__ == "__main__":
    main()
