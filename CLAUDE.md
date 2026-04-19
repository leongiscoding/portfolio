@AGENTS.md

# Portfolio — Claude Operating Manual

This file is the **single source of truth** for how Claude must work in this
repository. It is enforced by hooks (`.claude/settings.json` →
`.claude/hooks/*`), supported by slash commands (`.claude/commands/*`), and
bound to the existing GitHub workflow skill (`.claude/skills/github-workflow/`).

> If you ever feel a rule here is in your way, **ask the user** before working
> around it. Do NOT silently bypass. The hooks will block you anyway.

---

## 0. What this project is

- **Stack:** Next.js **16.2.2** (App Router) + React **19.2.4**, TypeScript strict, Tailwind **v4**, GSAP, Three.js / `@react-three/fiber`, `@studio-freight/lenis`. ESLint flat config.
- **Deployment:** Vercel, auto-deploys from `main`.
- **Owner:** Tan Yew Leong (Edwin Tan). Personal portfolio site.
- **Important:** This is **not** the Next.js / React you were trained on. See `AGENTS.md`. Before writing routing, server-action, cache, metadata, or middleware code, **read the relevant doc under `node_modules/next/dist/docs/`** — it is the only authoritative reference. The `guard-reads.py` hook explicitly carves these docs OUT of the deny list so you can read them.

---

## 1. Server lifecycle — never spawn a duplicate

The user usually has the dev server running already (in their own terminal, or
in Claude Desktop's preview pane). Spawning a second one is a footgun: it
collides on `:3000`, makes "what's broken?" debugging impossible, and pollutes
their workflow.

**Rule:** detect first, attach if running, only start if not.

### How to start/attach
- **Always use the `/dev` slash command** (`.claude/commands/dev.md`). It runs the detect-then-start logic and reports the URL.
- The wrapper script in `.claude/launch.json` does the same thing: `lsof -ti:3000 >/dev/null 2>&1 && echo Attaching || npm run dev`.
- Never run `next dev` / `npm run dev` directly without the detection step. The PreToolUse hook (`guard-git.py`, item 7) will block you if `:3000` is already taken.
- If startup fails, **diagnose** the tail of `.claude/dev.log` — do not retry blindly.

### How to verify it's reachable
```bash
lsof -ti:3000 && echo RUNNING || echo NOT_RUNNING
curl -sI http://localhost:3000 | head -1
```

### Where to test what you start
**Always inside Claude Desktop's preview pane**, never by asking the user to click around. See section 5.

---

## 2. Branching, commits, and PRs — delegate to the existing skill

This repo already has a complete GitHub workflow skill at
`.claude/skills/github-workflow/SKILL.md`. **Do not invent a parallel
convention.** When you need to branch, commit, merge, or release:

> **Run the `github-workflow` skill.** Don't reinvent it.

### Hard rules (enforced by `.claude/hooks/guard-git.py`)

1. **`main` is production.** Never `git commit`, `git push`, `git merge`, or `git rebase` while on `main`. The hook will hard-block these (exit 2).
2. **Always branch off the latest `main` first**, then make changes. Pick the prefix from the table below according to user intent — Claude decides which one to use based on what the user asked for.
3. **Branch name must match `<type>/<kebab-name>`.** The hook blocks `git checkout -b` / `git switch -c` with anything else.
4. **Conventional Commits only:** `type(scope): summary` — e.g. `feat(hero): add particle field`, `fix(about): typewriter cursor desync`.
5. **Never** `--no-verify`, `--no-gpg-sign`, `git push --force`, or `git reset --hard` on `main`.
6. **Never** push or open a PR unless the user explicitly asks.
7. **Never create branches via `git worktree add`.** Use the standard `github-workflow` skill flow (plain `git checkout -b <prefix>/<name>` from `main`). Branches created inside a worktree fragment env files and dev-server state, are hidden from the main checkout's default view, and are easy to orphan when the worktree is pruned. If a previous session created worktrees under `.claude/worktrees/`, treat them as cleanup candidates, not as a place to do new work.

### Branch prefix → user intent mapping

Claude must read the user's request and pick the right prefix on its own:

| User asks for…            | Prefix       | Example                          |
|---------------------------|--------------|----------------------------------|
| New feature / new section | `feat/`      | `feat/blog-section`              |
| Bug fix                   | `fix/`       | `fix/mobile-responsive`          |
| Improvement (cleanup, restructure, no behaviour change) | `refactor/` | `refactor/animation-hooks`  |
| Improvement (faster, leaner, same behaviour) | `perf/` | `perf/image-lazy-load` |
| Visual / CSS only         | `style/`     | `style/hero-spacing`             |
| Tooling / config / deps   | `chore/`     | `chore/upgrade-next`             |
| Docs only                 | `docs/`      | `docs/readme-update`             |
| Tests only                | `test/`      | `test/contact-form`              |

When in doubt between `refactor/` and `perf/`: did behaviour or output change?
If yes, neither — it's `feat/` or `fix/`. If no, `perf/` if it's measurably
faster, else `refactor/`.

### The flow you must follow

```bash
git checkout main
git pull origin main
git checkout -b <prefix>/<kebab-name>   # hook validates the name
# … make changes …
git add <specific files>                 # never `git add .` or `-A`
git commit -m "type(scope): summary"     # conventional commit
# Run /ship before declaring done
# Push only if the user asks
```

---

## 3. Architecture — reusability and section ownership

The `src/` tree is intentionally narrow. **Each folder owns one concern.** Do
not mix concerns across folders, and do not invent new top-level folders.

```
src/
├── app/              # Next.js App Router ONLY (layout.tsx, page.tsx, globals.css, route handlers)
├── components/
│   ├── layout/       # Site chrome that wraps every page: Navbar, Footer, FloatingActions
│   ├── sections/     # One-screen-per-file page sections: Hero, About, Skills, Experience, Projects, Education, Contact
│   ├── three/        # React-Three-Fiber canvases (HeroCanvas, etc.)
│   └── ui/           # Reusable primitives: Preloader, CustomCursor, MagneticButton, HamburgerMenu
├── lib/              # Cross-cutting infra: gsap.ts, lenis.tsx
├── hooks/            # Reusable React hooks (currently empty placeholder)
├── animations/       # Reusable GSAP timeline factories (currently empty placeholder)
├── constants/        # Static config & data tables (currently empty placeholder)
├── types/            # Shared TypeScript types (currently empty placeholder)
└── styles/           # Global CSS partials (most styling lives in app/globals.css under Tailwind v4 @theme layers)
```

### Ownership rules — read these before touching any file

1. **One section = one file.** If the user says "fix the About section," the
   answer lives in `src/components/sections/About.tsx`. Do NOT touch other
   sections to fix it. Sibling sections are independent on purpose.

2. **UI primitives are shared.** Editing `src/components/ui/CustomCursor.tsx`
   ripples into every page that uses it. Before modifying any file under
   `ui/`, **grep for every callsite** and verify your change won't break them.

3. **Layout chrome is site-wide.** `Navbar`, `Footer`, `FloatingActions` are
   visible on every screen. Treat them like UI primitives — verify all routes
   after editing.

4. **Lift, don't copy.** If a piece of JSX is needed by ≥2 sections, lift it
   into `components/ui/` (visual) or `lib/` / `hooks/` (logic) and import.
   No copy-paste. No "I'll deduplicate later."

5. **Three.js code is isolated.** Anything pulling `three`, `@react-three/*`,
   or shaders lives under `components/three/`. Do not import these from
   `sections/` directly — import the wrapping component instead.

6. **App router is reserved.** `src/app/` is for Next.js routing primitives
   (`layout.tsx`, `page.tsx`, `route.ts`, `error.tsx`, etc.) and `globals.css`
   only. Do **not** put components, hooks, or utilities here.

### Comment header convention

Every component file should open with a 2–4 line block describing:

```tsx
// COMPONENT: <Name>
// OWNS: <what visual/behavioural surface this file is responsible for>
// DO NOT TOUCH FROM OUTSIDE: <internal helpers/state that callers shouldn't poke>
// CALLED BY: <who imports this — keep this in sync if you add a callsite>
```

When you create or significantly edit a component, write/update this header
**so the next Claude session knows what's in scope and what isn't**.

### Reusability checklist before adding a new component

- [ ] Does this already exist under `components/ui/`? Use it.
- [ ] Will ≥2 sections use it? → it belongs in `ui/`, not in a section file.
- [ ] Is it pure visual? → `ui/`. Pure logic? → `hooks/` or `lib/`. Animation timeline? → `animations/`. Static data? → `constants/`. Shared type? → `types/`.
- [ ] Did you add a comment header (above)?
- [ ] Did you import via `@/...` not relative `../../`?

---

## 4. Implementation — folder hygiene

The clean `src/` tree is fragile. The following rules keep it that way:

1. **No new files at `src/` root.** Pick a folder.
2. **No new files inside `src/app/` other than App Router primitives.**
3. **Static assets belong in `public/`.** The resume lives at `public/Tan Yew Leong_Resume.docx`. Images/videos go under `public/images/` and `public/videos/`. Fonts under `public/fonts/`.
4. **Path alias:** import via `@/...` (configured in `tsconfig.json`). Do not write `../../components/...`.
5. **Tailwind v4:** design tokens go in `src/app/globals.css` under `@theme`. There is **no** `tailwind.config.js` and there should not be one — that is the v3 convention.
6. **TypeScript strict is on.** No `any` unless there is a one-line `// reason:` comment. Prefer `unknown` + narrowing.
7. **ESLint:** flat config in `eslint.config.mjs`. Run `npm run lint` before committing. The PostToolUse hook lints touched `.ts/.tsx` files automatically.
8. **Forbidden trees** (the PreToolUse hook blocks reads): `.next/`, `.git/`, `node_modules/` (except `node_modules/next/dist/docs/**`), `build/`, `out/`, `.vercel/`, `*.tsbuildinfo`, `package-lock.json`.
9. **Generated files are never edited by hand:** `.next/`, `next-env.d.ts`, `package-lock.json`, anything under `node_modules/`.
10. **Empty folders with `.gitkeep`** (`hooks/`, `animations/`, `constants/`, `types/`, `styles/`) are intentional placeholders. Leave the `.gitkeep` until the folder has a real file.
11. **`.env*` files live at the repo root ONLY.** Never create `.env.local`, `.env.development.local`, etc. inside `.claude/worktrees/` — they're invisible to other checkouts and vanish when the worktree is pruned. A committed [.env.example](./.env.example) at the repo root is the source of truth for which keys the project expects; copy it to `.env.local` and fill in real values. `.env*.local` stays gitignored.

### Configuration & packages — keep them clean

- **Do not add a new dependency unless it solves a problem the existing stack cannot.** GSAP + Tailwind v4 covers ~all animation/styling needs. Three.js + R3F covers WebGL. Lenis covers smooth scroll. If you reach for `framer-motion`, `styled-components`, `zustand`, etc., **stop and ask the user first.**
- **Do not bump major versions of `next`, `react`, or `react-dom` casually.** Next 16 + React 19 are pinned intentionally.
- **Do not introduce a CSS-in-JS library.** Tailwind v4 + `globals.css` is the system.
- **Do not add a state management library.** Local state + props is sufficient for a portfolio.
- **Do not add a testing framework without asking.** Testing here is interactive (see section 5).

---

## 5. Testing — interactive in Claude Desktop's preview

This project has **no automated test runner**. Testing happens **inside Claude
Desktop**, where Claude can drive the running preview at http://localhost:3000
end-to-end. **You (Claude) are the QA harness.**

### Workflow

1. Server is up (section 1). Branch is correct (section 2).
2. Make the change.
3. **Run `/smoke`** (`.claude/commands/smoke.md`). The slash command expands
   into a full top-to-bottom test plan covering boot, hero, nav, every
   section, floating actions, responsive sweep, and the console.
4. You drive it: scroll the page, click buttons, hover components, fill in
   the contact form, resize the preview to 360 / 768 / 1280 / 1920, watch the
   console for errors.
5. **Do not ask the user to click around.** That's your job in this project.
6. If you cannot drive the preview from your current environment, **say so
   explicitly and stop**. Do not produce a fake PASS report.

### What to look for (the regression hot list)

- **Preloader**: plays exactly once on hard refresh, scroll restoration starts at top, no flash of unstyled content.
- **CustomCursor**: tracks the pointer on desktop, hides on touch devices, hover targets light up.
- **About — typewriter**: cursor must track the text reveal in real time. This regressed recently (commit `c2ec7b6`); always re-test after any change to `About.tsx` or `Preloader.tsx`.
- **Hero canvas**: WebGL mounts without console errors, animations run, no perf collapse on mobile.
- **Navbar / HamburgerMenu**: scroll-snap to each section, hamburger appears below 768px.
- **Contact form**: tab order, validation states, submit path.
- **Responsive sweep**: 360 / 768 / 1280 / 1920 — clipped text, broken layouts, fixed-position overlap.
- **Console**: zero red errors, zero React hydration warnings.

### The done gate

A task is **not done** until `/ship` (`.claude/commands/ship.md`) passes:

1. `npm run lint` clean
2. `npm run build` clean
3. `/smoke` PASS for every affected surface
4. Branch + commit hygiene per section 2
5. You are not on `main`

---

## 6. The harness (so you know what's enforced, not just suggested)

Configured in `.claude/settings.json`, scripts in `.claude/hooks/`:

| Hook                                       | What it does                                                                                                          |
|--------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| `SessionStart` → `session-start.sh`        | Prints dev-server status (running PID or "not running") and current branch (warns hard if `main`).                    |
| `PreToolUse[Bash]` → `guard-git.py`        | Blocks: commit/push/merge/rebase on `main`; non-conforming branch names; `--no-verify`; force push; `rm -rf` on protected paths; spawning a 2nd dev server. |
| `PreToolUse[Read\|Grep\|Glob]` → `guard-reads.py` | Blocks reads under `.next/`, `.git/`, `node_modules/`, `build/`, `out/`, `.vercel/`, `*.tsbuildinfo`, `package-lock.json`. **Carve-out:** `node_modules/next/dist/docs/**` is allowed. |
| `PostToolUse[Edit\|Write\|MultiEdit]` → `lint-on-edit.py` | Runs `eslint` on the touched `.ts/.tsx` file and feeds findings back via stderr (exit 2, non-blocking on PostToolUse). |

Slash commands in `.claude/commands/`:

| Command  | Purpose                                                                       |
|----------|-------------------------------------------------------------------------------|
| `/dev`   | Detect-or-start the dev server safely. Reports URL and branch state.          |
| `/smoke` | Drive the running preview through the full smoke test plan.                   |
| `/ship`  | Pre-flight gate before declaring done: lint, build, smoke, branch hygiene.    |

If a hook misfires (blocks something legitimate), **fix the hook script** —
don't disable the hook in `settings.json`. The hook scripts are in
`.claude/hooks/` and are commented; they're meant to evolve.

---

## 7. What NOT to do (quick reference)

- Do **not** run `next dev` / `npm run dev` directly. Use `/dev`.
- Do **not** make changes on `main`. Branch first via the `github-workflow` skill.
- Do **not** create branches via `git worktree add`. Use plain `git checkout -b` per the `github-workflow` skill.
- Do **not** place `.env*` files anywhere except the repo root. Worktrees must not have their own env.
- Do **not** use `--no-verify`, force push, or `git reset --hard` on `main`.
- Do **not** add files at `src/` root, or under `src/app/` other than App Router primitives.
- Do **not** read or grep `.next/`, `node_modules/` (except `next/dist/docs/`), `*.tsbuildinfo`, `package-lock.json`.
- Do **not** hand-edit generated files (`.next/`, `next-env.d.ts`, `package-lock.json`).
- Do **not** bump `next` / `react` / `react-dom` major versions.
- Do **not** add a new dependency, CSS framework, animation library, or state library without asking.
- Do **not** use `sed`, `awk`, `cat`, `find`, or `grep` (the binaries) for file work — use the `Read`, `Edit`, `Write`, `Grep`, `Glob` tools.
- Do **not** ask the user to test for you. You drive the preview.
- Do **not** declare a task done before `/ship` passes.
- Do **not** push or open a PR without an explicit user request.

---

## 8. When you're stuck

1. **Read the relevant doc** under `node_modules/next/dist/docs/` (allowed by the read guard). Your training data is wrong about Next 16 / React 19 specifics.
2. **Check the existing skill** at `.claude/skills/github-workflow/SKILL.md` for git questions.
3. **Re-read this file.** It exists so you don't have to guess.
4. **Ask the user.** Do not silently work around a hook block, do not invent a parallel convention, do not "fix" something the user didn't ask you to fix.

---

*This file is maintained as part of the harness. If a rule here turns out to
be wrong or annoying in practice, update this file AND the matching hook in
the same PR — never let the documentation and the enforcement drift apart.*
