---
description: Drive the running portfolio inside Claude Desktop's preview and run a full smoke test
---

This is the project's testing protocol. Testing happens INSIDE Claude Desktop,
against the running dev server at http://localhost:3000 — you (Claude) drive
the preview yourself. Do not ask the user to click around.

If you cannot interact with the preview from your current environment, say so
explicitly and stop. Do not fake the report.

## Pre-flight

1. Confirm the dev server is up — if not, run `/dev` first.
2. Open http://localhost:3000 in Claude Desktop's preview pane.
3. Open the browser devtools console so you can see runtime errors.

## Smoke test plan (run in order)

### 1. Boot
- Hard refresh the page.
- The Preloader should play once and reveal the rest of the page cleanly.
- Scroll position must be at the top after refresh (scroll restoration is disabled in `src/app/layout.tsx`).
- The CustomCursor should follow the pointer (desktop sizes only).

### 2. Hero
- The WebGL canvas (`src/components/three/HeroCanvas.tsx`) must mount without error.
- Hero copy must reveal.
- Hover the magnetic button — it should track the cursor.

### 3. Navbar & Hamburger
- Click each Navbar link — page should scroll-snap to the right section.
- Resize the preview to <768px wide → the HamburgerMenu should appear.
- Open the HamburgerMenu, click each item, confirm it closes and navigates.

### 4. Sections (scroll top → bottom)
- **About**: typewriter cursor must track the text reveal in real time (regression area — see commit `c2ec7b6`).
- **Skills**: cards animate in once on scroll into view.
- **Experience**: timeline rows reveal in sequence.
- **Projects**: cards animate; any links/CTAs work.
- **Education**: rows reveal.
- **Contact**: tab through every form field, type a value, blur, confirm validation states. Submit if applicable.

### 5. Floating actions
- Click each (WhatsApp, GitHub, LinkedIn). Each should open the correct external URL in a new tab.
- Confirm the resume download works from `/Tan Yew Leong_Resume.docx` (now in `public/`).

### 6. Responsive sweep
Resize the preview to each width and re-scroll the full page:
- 360 × 800 (mobile S)
- 768 × 1024 (tablet)
- 1280 × 800 (laptop)
- 1920 × 1080 (desktop)

Watch for: clipped text, broken layouts, animations that don't trigger, fixed elements that overlap content.

### 7. Console
- ZERO red errors.
- ZERO React hydration warnings.
- Note any yellow warnings in the report.

## Reporting format

Return a section-by-section table: `Section | PASS / FAIL | Notes`.
For any FAIL, include a screenshot reference and the file you suspect.
Do NOT declare done until every row is PASS.
