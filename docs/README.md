# EducAgent — GitHub Pages Learner Preview

A static GitHub Pages preview that reuses the `design/educagent-ui` visual system and ships learner course data from `data/`.

## Quick start

Serve this folder with any static server and open `index.html`.

```bash
cd docs
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## File map

- `index.html`        — Entry point, theme tokens, fonts, root mount
- `app.jsx`           — Main App: public homepage, content-only lesson view, learner switcher wiring
- `components.jsx`    — TopBar, Logo, FormattedText (inline md)
- `quiz.jsx`          — InteractiveQuiz component (states: default / picked / correct / wrong + explanation)
- `content.jsx`       — learner_0 structured content plus learner_1 DAG loader/transform
- `icons.jsx`         — Lucide-style inline SVG icon set
- `assets/educagent-logo.png` — Generated EducAgent logo mark
- `assets/homepage-hero.png` — Generated public-facing homepage illustration
- `data/`             — Copied GitHub Pages data payloads for learner_0 and learner_1

## Tokens & theming

CSS custom properties live in `index.html` under `:root`.
Alternate palettes are toggled via `data-theme="meadow|bluebird|berry"` on `<html>`.

## Porting back to Next.js / Tailwind

The visual system is token-based, so it ports cleanly:
- Move the `:root` palette + radius/shadow tokens into `globals.css` (or extend Tailwind theme).
- Re-implement `Sidebar`, `TopBar`, `LessonHero`, `InteractiveQuiz`, `CausalGraph`,
  `ObjectivesBlock`, `VariableCards`, `RoadsBlock`, `CalloutBlock`, `Figure`, `CodeBox`
  as Next.js client components (1:1 mapping from these JSX files).
- The content blocks in `content.jsx` can be generated from your existing markdown
  provider — just emit `{kind, ...}` instead of raw md.

## Fonts

- `Bricolage Grotesque` (display) + `Lexend` (body) + `JetBrains Mono` (code).
  Loaded via Google Fonts in `index.html`.
