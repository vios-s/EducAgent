# EducAgent Demo App

This folder contains the static EducAgent demo served on GitHub Pages.

The demo is designed for CHAI Fest visitors and other public audiences who may be new to causality. It presents causal thinking through stories, visuals, and quick checks rather than technical notation first.

## Demo Highlights

- Public homepage introducing EducAgent as a low-barrier causality tutor.
- Booth Mode at `#booth` for a 90-second stand-up challenge with a QR handoff.
- Study Mode for guided learning.
- Three audience profiles:
  - **For everyone**: a beginner lesson built around the tutoring puzzle.
  - **CS student**: a DAG course shell for learners with a computing background.
  - **Healthcare**: a non-diagnostic CHAI bridge about clinic reminders and appointment attendance.
- A 30-second feedback page at `#feedback`.
- Mobile-friendly lesson layout and homepage sections.
- Project links for @VIOS Group at the University of Edinburgh and CHAI funding support.

## Demo URL

[https://vios-s.github.io/EducAgent/](https://vios-s.github.io/EducAgent/)

## Main Files

- `index.html` - page metadata, theme tokens, font loading, and script bootstrapping.
- `app.jsx` - homepage, lesson view, audience-profile switching, and project links.
- `content.jsx` - course configuration and lesson content loading.
- `components.jsx` - shared interface pieces such as the top bar, logo, and text formatting.
- `quiz.jsx` - interactive understanding checks.
- `icons.jsx` - local inline icon set.
- `assets/` - generated logo, social preview, teaser images, QR codes, and site imagery.
- `data/` - copied learner content used by the static demo.
