# EducAgent Demo

EducAgent is a learner-facing demo that makes causality feel approachable. It introduces causal reasoning through short stories, visual examples, and lightweight checks instead of asking visitors to start with technical notation.

**Live demo:** [vios-s.github.io/EducAgent](https://vios-s.github.io/EducAgent/)

## What This Demo Shows

- A friendly homepage for a broad public audience: anyone should be able to understand the promise without already knowing causal inference.
- A mobile-first learning experience with compact navigation, responsive lesson layouts, and visual lesson headers.
- Study Mode as the main path into causality basics.
- A learner switch in the top-right corner for previewing different learning tracks.
- Partner links and QR codes for VIOS Group and CHAI at the bottom of the homepage.

## Learning Paths

### learner_0: The Tutoring Puzzle

The first learner path asks a familiar question:

> If students who attended tutoring scored higher, does that mean tutoring caused the higher scores?

The lesson introduces the difference between seeing a pattern and proving a cause. It uses a tutoring story to explain why groups may already be different before an intervention, and why random assignment can help us test causal claims more carefully.

### learner_1: Directed Acyclic Graph (DAG)

The second learner path currently provides the shell for a DAG-focused course. It previews the structure for learning causal graphs, including nodes, arrows, paths, and why causal graphs cannot loop.

## Current Demo Scope

This is an early public-facing prototype, not a full course platform yet. The current demo focuses on:

- presenting the EducAgent concept clearly,
- testing a warm visual direction,
- showing one complete beginner-friendly lesson path,
- previewing a second DAG learning path,
- keeping the experience usable on phones.

Future features marked as **coming soon** on the homepage, such as hidden-path guidance and team-based learning, are intentionally shown as upcoming capabilities.

## Partners

- [VIOS Group](https://vios.science/) - AI for Life Sciences
- [CHAI](https://www.chai.ac.uk/) - Causality in Healthcare AI

## Repository Notes

The demo is served from the `docs/` directory. The root `index.html` redirects visitors into the GitHub Pages version of the app.
