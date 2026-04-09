#!/usr/bin/env python3
"""PreToolUse[Bash] guard for the portfolio harness.

Wired in: .claude/settings.json -> hooks.PreToolUse[matcher=Bash]

Blocks (exit 2 = block + send stderr back to Claude):
  1. --no-verify and --no-gpg-sign bypass flags (always)
  2. git commit/push/merge/rebase while on main (production protection)
  3. git push --force (any branch, any form)
  4. git reset --hard while on main
  5. Branch creation (checkout -b / switch -c) with a name that does not match
     <feat|fix|refactor|perf|chore|docs|style|test>/<kebab-name>
     (mirrors .claude/skills/github-workflow/SKILL.md so the rule is enforced,
     not just documented).
  6. rm -rf on protected paths (/, ~, .git, src, public, .claude, node_modules)
  7. Starting a SECOND dev server when :3000 is already in use
     (the launch.json wrapper attaches; this hook stops Claude from bypassing it).

If you change the allowed branch prefixes here, also update CLAUDE.md and the
github-workflow skill so all three sources agree.
"""
from __future__ import annotations

import json
import re
import shlex
import subprocess
import sys

ALLOWED_BRANCH = re.compile(
    r"^(feat|fix|refactor|perf|chore|docs|style|test)/[a-z0-9._-]+$"
)
PROTECTED_RM = {
    "/", "~", ".git", "src", "public", ".claude", "node_modules", "..",
}


def deny(message: str) -> None:
    print(f"[hook:guard-git] BLOCKED: {message}", file=sys.stderr)
    sys.exit(2)


def current_branch() -> str:
    try:
        return (
            subprocess.check_output(
                ["git", "symbolic-ref", "--short", "HEAD"],
                stderr=subprocess.DEVNULL,
            )
            .decode()
            .strip()
        )
    except Exception:
        return ""


def port_in_use(port: int) -> bool:
    return (
        subprocess.call(
            ["lsof", "-ti", f":{port}"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        == 0
    )


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    cmd: str = (payload.get("tool_input") or {}).get("command", "") or ""
    if not cmd.strip():
        sys.exit(0)

    branch = current_branch()

    # 1. Bypass flags — never allowed unless the user explicitly demands it.
    if "--no-verify" in cmd:
        deny("--no-verify is forbidden. Fix the underlying hook failure instead of bypassing it.")
    if "--no-gpg-sign" in cmd:
        deny("--no-gpg-sign is forbidden.")

    # 2. Mutating git ops on main are forbidden.
    if branch == "main":
        for op in ("git commit", "git push", "git merge", "git rebase"):
            if op in cmd:
                deny(
                    f"'{op}' on main is forbidden. main is production and auto-deploys to Vercel. "
                    "Create a feat/|fix/|refactor/|perf/|chore/|docs/|style/|test/ branch first."
                )

    # 3. Force push.
    padded = f" {cmd} "
    if "git push" in cmd and ("--force" in cmd or " -f " in padded or "--force-with-lease" in cmd):
        deny("force push is forbidden in this repo.")

    # 4. git reset --hard on main.
    if "git reset --hard" in cmd and branch == "main":
        deny("git reset --hard on main is forbidden.")

    # 5. Branch creation must follow naming convention.
    branch_match = re.search(
        r"git\s+(?:checkout\s+-b|switch\s+-c)\s+(\S+)", cmd
    )
    if branch_match:
        candidate = branch_match.group(1)
        if not ALLOWED_BRANCH.match(candidate):
            deny(
                f"branch name '{candidate}' does not match <type>/<kebab-name>. "
                "Allowed types: feat, fix, refactor, perf, chore, docs, style, test. "
                "See .claude/skills/github-workflow/SKILL.md."
            )

    # 6. Destructive rm -rf on protected paths.
    if "rm -rf" in cmd or "rm -fr" in cmd or "rm -Rf" in cmd:
        try:
            tokens = shlex.split(cmd)
        except ValueError:
            tokens = cmd.split()
        for tok in tokens:
            stripped = tok.lstrip("./").rstrip("/")
            if stripped in PROTECTED_RM or tok in PROTECTED_RM:
                deny(f"destructive rm -rf on protected path: {tok}")
            if tok.startswith("/") and tok.count("/") <= 2 and tok != "/dev/null":
                deny(f"destructive rm -rf on system path: {tok}")

    # 7. Don't spawn a second dev server.
    dev_starters = (
        "npm run dev",
        "next dev",
        "yarn dev",
        "yarn run dev",
        "pnpm dev",
        "pnpm run dev",
        "bun run dev",
    )
    if any(s in cmd for s in dev_starters):
        if port_in_use(3000):
            deny(
                "dev server already running on :3000. ATTACH to it (open http://localhost:3000) "
                "instead of spawning a duplicate. The launch.json wrapper handles attach-vs-start."
            )


if __name__ == "__main__":
    main()
