---
name: skill-builder
description: Create new Claude Code skills following the official SKILL.md standard. Use when building, scaffolding, or generating a new skill for this project.
argument-hint: "<skill-name> [description]"
disable-model-invocation: true
---

# Skill Builder

Build a new Claude Code skill following the official Agent Skills standard.

## What you will create

A skill named `$ARGUMENTS[0]` with the description: $ARGUMENTS[1]

## Step 1 — Gather requirements

Before writing anything, determine:

1. **What does the skill do?** (reference content, task automation, or both)
2. **Who invokes it?** (user only, Claude only, or both)
3. **Does it need isolation?** (should it run in a forked subagent?)
4. **Does it need arguments?** (what inputs does the user pass?)
5. **Does it need supporting files?** (templates, scripts, examples)

## Step 2 — Create the directory structure

Every skill lives in its own directory with `SKILL.md` as the entrypoint:

```
.claude/skills/<skill-name>/
├── SKILL.md           # Main instructions (required)
├── template.md        # Template for Claude to fill in (optional)
├── examples/          # Example outputs (optional)
└── scripts/           # Scripts Claude can execute (optional)
```

Create the directory:

```bash
mkdir -p .claude/skills/<skill-name>
```

## Step 3 — Write SKILL.md

Use this exact structure. All frontmatter fields are optional except `description` (recommended).

### Frontmatter template

```yaml
---
name: <skill-name>
description: <What the skill does and when to use it. Front-load the key use case. Max 250 chars before truncation.>
argument-hint: <hint shown during autocomplete, e.g. "[filename] [format]">
disable-model-invocation: <true if user-only invoke, omit or false otherwise>
user-invocable: <false if Claude-only, omit or true otherwise>
allowed-tools: <space-separated list of tools, e.g. "Read Grep Glob Bash">
context: <"fork" to run in isolated subagent, omit for inline>
agent: <subagent type when context is fork, e.g. "Explore", "Plan", "general-purpose">
model: <model override, omit to inherit>
effort: <"low", "medium", "high", or "max", omit to inherit>
paths: <glob patterns to limit activation, e.g. "src/**/*.ts, tests/**">
---
```

### Frontmatter field reference

| Field                      | Required    | Description                                                              |
|:---------------------------|:------------|:-------------------------------------------------------------------------|
| `name`                     | No          | Display name. Lowercase, numbers, hyphens. Max 64 chars. Defaults to dir name. |
| `description`              | Recommended | What it does + when to use. Claude uses this to decide auto-activation.  |
| `argument-hint`            | No          | Hint shown in autocomplete. e.g. `[issue-number]`                        |
| `disable-model-invocation` | No          | `true` = only user can invoke via `/name`. Default: `false`.             |
| `user-invocable`           | No          | `false` = hidden from `/` menu, only Claude invokes. Default: `true`.    |
| `allowed-tools`            | No          | Tools allowed without permission prompts. Space-separated or YAML list.  |
| `context`                  | No          | `fork` = runs in isolated subagent. Omit for inline.                     |
| `agent`                    | No          | Subagent type when `context: fork`. e.g. `Explore`, `Plan`.             |
| `model`                    | No          | Model override for this skill.                                           |
| `effort`                   | No          | Effort level: `low`, `medium`, `high`, `max`.                            |
| `paths`                    | No          | Glob patterns limiting auto-activation to matching files.                |
| `hooks`                    | No          | Hooks scoped to this skill's lifecycle.                                  |
| `shell`                    | No          | `bash` (default) or `powershell` for inline shell commands.              |

### Content body

After the frontmatter `---`, write markdown instructions. Guidelines:

- **Keep SKILL.md under 500 lines.** Move detailed reference to supporting files.
- **Be specific and actionable.** Claude follows these instructions literally.
- **Use `$ARGUMENTS` for user input.** `$ARGUMENTS[0]` or `$0` for first arg, etc.
- **Use `${CLAUDE_SKILL_DIR}`** to reference files bundled with the skill.
- **Use `` !`command` ``** for dynamic context injection (runs before Claude sees content).
- **Reference supporting files** so Claude knows when to load them.

### String substitutions available

| Variable               | Description                                          |
|:-----------------------|:-----------------------------------------------------|
| `$ARGUMENTS`           | All arguments passed when invoking                   |
| `$ARGUMENTS[N]` / `$N`| Specific argument by 0-based index                   |
| `${CLAUDE_SESSION_ID}` | Current session ID                                   |
| `${CLAUDE_SKILL_DIR}`  | Directory containing this SKILL.md                   |

## Step 4 — Choose the invocation model

| You want                                     | Frontmatter                      |
|:---------------------------------------------|:---------------------------------|
| User and Claude can both invoke              | _(defaults, no special fields)_  |
| User-only (side effects, deploy, send, etc.) | `disable-model-invocation: true` |
| Claude-only (background knowledge)           | `user-invocable: false`          |

## Step 5 — Validate

After creating the skill:

1. Verify the file exists at `.claude/skills/<skill-name>/SKILL.md`
2. Check frontmatter YAML is valid (no tabs, proper indentation)
3. Test invocation: `/skill-name` or `/skill-name arg1 arg2`
4. If the skill should auto-trigger, test by asking something matching the description
5. Confirm the skill appears when asking "What skills are available?"

## Example: minimal task skill

```yaml
---
name: deploy-preview
description: Deploy a preview build to Vercel
disable-model-invocation: true
argument-hint: "[branch-name]"
---

Deploy a preview of branch `$ARGUMENTS` to Vercel:

1. Run `npm run build` to verify the build passes
2. Run `vercel --preview` to deploy
3. Report the preview URL
```

## Example: reference skill (Claude auto-loads)

```yaml
---
name: api-conventions
description: API design patterns and naming conventions for this project
user-invocable: false
---

When writing API routes:
- Use RESTful naming: plural nouns, no verbs
- Return `{ data, error, meta }` envelope
- Validate request body with zod schemas
```

## Example: forked research skill

```yaml
---
name: deep-research
description: Research a topic thoroughly across the codebase
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:

1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
```

## Example: skill with supporting files

```
my-skill/
├── SKILL.md
├── template.md
└── examples/
    └── sample.md
```

In SKILL.md, reference them:

```markdown
## Resources
- For the output template, read [template.md](template.md)
- For example output, see [examples/sample.md](examples/sample.md)
```

## Where skills live (priority order)

| Level      | Path                                         | Scope                          |
|:-----------|:---------------------------------------------|:-------------------------------|
| Enterprise | Managed settings                             | All users in org               |
| Personal   | `~/.claude/skills/<name>/SKILL.md`           | All your projects              |
| Project    | `.claude/skills/<name>/SKILL.md`             | This project only              |
| Plugin     | `<plugin>/skills/<name>/SKILL.md`            | Where plugin is enabled        |

Higher-priority locations win when names collide.

---

Now create the skill for `$ARGUMENTS`.
