#!/usr/bin/env bash
# SessionStart hook — prints dev-server + branch state into Claude's context
# so the very first thing Claude knows is whether to attach or start, and
# whether it's safe to make changes (i.e. NOT on main).
#
# Wired in: .claude/settings.json -> hooks.SessionStart
# Edit this file if the bootstrap banner needs more context.

set -eo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"

branch="$(git symbolic-ref --short HEAD 2>/dev/null || echo 'detached')"

if lsof -ti:3000 >/dev/null 2>&1; then
  pid="$(lsof -ti:3000 | head -1)"
  server="Dev server ALREADY RUNNING on http://localhost:3000 (PID ${pid}). ATTACH to it — do NOT spawn a new one."
else
  server="Dev server NOT running on :3000. Use the /dev slash command to start it (which respects .claude/launch.json)."
fi

if [ "$branch" = "main" ]; then
  branch_msg="WARNING: current branch is main. main is production. Create a feat/|fix/|refactor/|perf/|chore/|docs/|style/|test/ branch BEFORE making any changes — git commit/push on main will be blocked by the PreToolUse hook."
else
  branch_msg="Current branch: ${branch}"
fi

printf '[harness] portfolio session bootstrap\n%s\n%s\n' "$server" "$branch_msg"
