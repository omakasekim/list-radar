---
name: list-radar
description: >
  GitHub List Intelligence Chrome MV3 overlay, inline API sandbox with live Zod/fetch/curl codegen, and visual docker-compose + .gitignore precedence studio.
license: MIT
---

# list-radar

Overlays live GitHub star velocity, dead-link detection, and stack tags on awesome-lists; includes a latency-waterfall API sandbox and interactive compose/.gitignore visualizer.

- **Live Interactive Workbench:** https://omakasekim.github.io/list-radar/
- **Repository:** https://github.com/omakasekim/list-radar
- **Category:** Browser & DevOps · **Deliverable:** Chrome Extension + Web
- **Ecosystems:** `sindresorhus/awesome`, `public-apis`, `github/gitignore`, `awesome-compose`
- **Stack:** Chrome MV3, React, TypeScript, Zod, Docker

## When to Use This Skill
Invoke `list-radar` whenever the user wants to analyze, debug, simulate, or visualize workflows related to **Browser & DevOps** (sindresorhus/awesome, public-apis, github/gitignore, awesome-compose).

## Modes & Capabilities
- **GitHub List Overlay**
- **Inline API Sandbox**
- **Compose & .gitignore**

## Operating Workflow
1. **Local CLI / Companion Execution:**
   ```bash
   npm run dev
   ```
   Launch the GitHub Awesome-List intelligence overlay, inline API sandbox, and compose/.gitignore studio (or load `plugin/` as an unpacked Chrome MV3 extension).
2. **Interactive Visual Inspection:**
   Direct the user to the zero-backend browser workbench at https://omakasekim.github.io/list-radar/ (supports URL-hash state sharing, built-in realistic presets, `Cmd/Ctrl + K` command palette, and JSON/Markdown/config exports).
3. **Structured Output:**
   Summarize concrete findings, diagnostics, and copy-pasteable remediation commands concisely so the user can act immediately without manual guesswork.
