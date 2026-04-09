---
description: Pre-flight gate before declaring a task done — lint, build, smoke, branch hygiene
---

Run this gate before telling the user a task is done. Stop on the first failure
and fix it — do NOT report PASS with caveats.

## 1. Lint

```bash
npm run lint
```

Must complete with no new warnings introduced by your change. If a warning is
yours, fix it. Do NOT silence with `eslint-disable` unless you have a written
reason.

## 2. Build

```bash
npm run build
```

Must complete without errors. If you hit a Next.js 16 / React 19 specific
error, read the matching doc under `node_modules/next/dist/docs/` BEFORE
guessing — this codebase is intentionally on bleeding-edge versions and your
training data is wrong about the APIs.

## 3. Smoke test

Confirm `/smoke` has been run against the running preview for every surface
your change touched. Do not skip this even for "small" changes — the typewriter
cursor regression in commit `c2ec7b6` was a "small" change.

## 4. Branch hygiene

```bash
git symbolic-ref --short HEAD
git log --oneline main..HEAD
```

- Branch name MUST match `<feat|fix|refactor|perf|chore|docs|style|test>/<kebab-name>`.
- Every commit MUST be a Conventional Commit (`type(scope): summary`).
- You must NOT be on `main`. The PreToolUse hook would have blocked you, but verify anyway.

## 5. Report

If all four gates pass, return:

- Branch name
- Commit list (oneline)
- 2–3 line summary of what changed and why
- Smoke test outcome (link or paste the section table)

DO NOT push or open a PR unless the user explicitly asks. Shipping the local
gate is one job; pushing is a separate, explicit decision.
