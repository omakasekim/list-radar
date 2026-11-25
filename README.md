# list-radar

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-22d3ee?style=flat-square)](https://aetherx86.github.io/list-radar/)
[![Plugin: Chrome MV3](https://img.shields.io/badge/Plugin-Chrome%20MV3-10b981?style=flat-square)](plugin/manifest.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-38bdf8?style=flat-square)](LICENSE)

> **GitHub List Intelligence Overlay, Inline API Sandbox, `docker-compose` Stack Composer & `.gitignore` Rule-Precedence Studio.**

## Covered Top-50 GitHub Ecosystems
| Ecosystem | Capability in `list-radar` |
| :--- | :--- |
| `awesome`, `awesome-python`, `awesome-go`, `HelloGitHub` | Live Chrome MV3 overlay injecting star-velocity sparklines, freshness badges, licenses & dead-link detection |
| `public-apis`, `free-programming-books`, `prompts.chat` | Inline API Sandbox with latency waterfall, JSON tree explorer, `fetch`/`curl` & Zod schema generation |
| `awesome-selfhosted`, `project-based-learning`, `secret-knowledge` | Multi-select container network diagrammer & production `docker-compose.yml` generator |
| `github/gitignore` | Interactive line-by-line `.gitignore` precedence & negation (`!pattern`) evaluator |

## 1-Step Plugin Install (Chrome Manifest V3)
1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select the `./plugin` directory.

## Architecture
```mermaid
flowchart LR
  GH[GitHub Awesome README] -->|MV3 Content Script| OV[Star Velocity & Dead-Link HUD]
  OV -->|Test Live| API[Inline API Sandbox + Zod Gen]
  OV -->|+ Compose| DC[docker-compose Network Studio]
  GI[.gitignore Rules] --> EVAL[Precedence & Negation Tree]
```

## Quickstart
```bash
npm install && npm run dev
```
