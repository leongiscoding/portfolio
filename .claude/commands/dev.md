---
description: Attach to or safely start the Next.js dev server on :3000 (no duplicates)
---

Goal: get the portfolio dev server reachable at http://localhost:3000 without
ever spawning a duplicate. The user often runs the server in their own terminal
or in Claude Desktop already — your job is to detect that and attach, not
restart.

Steps:

1. Check whether port 3000 is in use:

   ```bash
   lsof -ti:3000 && echo RUNNING || echo NOT_RUNNING
   ```

2. If RUNNING:
   - Report the existing PID and the URL: http://localhost:3000
   - Tell the user to attach in Claude Desktop's preview pane (or their existing browser tab).
   - DO NOT start a second server. The PreToolUse[Bash] hook will block you anyway, but don't even try.
   - Stop here.

3. If NOT_RUNNING, start it in the background and verify it came up:

   ```bash
   nohup npm run dev > .claude/dev.log 2>&1 & disown
   sleep 3
   lsof -ti:3000 && echo STARTED || tail -n 60 .claude/dev.log
   ```

4. On STARTED: report the URL (http://localhost:3000) and the log path (`.claude/dev.log`). Tell the user to open the preview pane in Claude Desktop.

5. On startup failure: surface the tail of `.claude/dev.log` and explain the failure. Do NOT retry blindly — diagnose first.

6. Finally, remind the user of the current branch:

   ```bash
   git symbolic-ref --short HEAD
   ```

   If the answer is `main`, tell the user a working branch is required before any code changes (per CLAUDE.md section on branching).
