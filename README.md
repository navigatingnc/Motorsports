[README.md](https://github.com/user-attachments/files/25425880/README.md)
# 🏁 Motorsports Team Management

> An AI-powered, self-improving motorsports team management platform — built to evolve daily.

[![Daily Build](https://img.shields.io/badge/Daily%20Build-Active%20via%20Manus-brightgreen?style=flat-square&logo=github-actions)](https://github.com/navigatingnc/Motorsports)
[![Stack](https://img.shields.io/badge/Stack-TypeScript%20%2B%20Shell-blue?style=flat-square)](https://github.com/navigatingnc/Motorsports)
[![License](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)](LICENSE)

---

## 🚀 Overview

**Motorsports** is a team management platform tailored for motorsports organizations. It handles everything from driver and crew management to scheduling, race-day logistics, and performance tracking — with a backend built in TypeScript and automated tooling in Shell.

What makes this project unique is its **autonomous daily improvement cycle**: an AI agent (Manus) reviews the codebase each day, identifies gaps, and pushes enhancements automatically — so the platform gets smarter and more capable without manual intervention.

---

## 🤖 Daily Self-Building via Manus

> **⚡ This project is actively self-improving — every single day.**

This repository runs a **scheduled daily workflow powered by [Manus](https://manus.im)**, an autonomous AI agent capable of planning, coding, testing, and committing improvements on its own.

### How It Works

Each day, the Manus agent:

1. **Reviews** the current state of the codebase and reads `DAILY_PROMPT.md` for its standing instructions
2. **Analyzes** the `changelog.md` and `project_plan.md` to understand what's been done and what's next
3. **Implements** the next prioritized improvement — adding features, fixing bugs, refactoring, or extending the backend
4. **Tests** its changes against the existing backend logic
5. **Commits and documents** the work, updating `changelog.md` with a timestamped entry

### Key Files Driving the Automation

| File | Purpose |
|------|---------|
| [`DAILY_PROMPT.md`](./DAILY_PROMPT.md) | Standing instructions for Manus — defines goals, constraints, and improvement priorities |
| [`WORKFLOW.md`](./WORKFLOW.md) | Documents the full autonomous workflow Manus follows each session |
| [`project_plan.md`](./project_plan.md) | The living roadmap — Manus reads this to pick the next task |
| [`changelog.md`](./changelog.md) | Auto-updated log of every change Manus makes, with dates and descriptions |

### Why This Matters

Traditional projects require a developer to sit down, plan, and execute changes. This project **runs itself**. The daily build cycle means:

- Features ship continuously without manual sprints
- The codebase self-documents its own evolution
- Bugs get surfaced and resolved proactively
- The project plan stays in sync with actual progress

---

## 🗂️ Project Structure

```
Motorsports/
├── backend/              # TypeScript backend — core business logic
├── DAILY_PROMPT.md       # Manus's daily instructions
├── WORKFLOW.md           # Autonomous workflow documentation
├── project_plan.md       # Roadmap and task backlog
└── changelog.md          # Auto-generated change history
```

---

## 🛠️ Tech Stack

- **TypeScript** — Backend application logic
- **Shell** — Automation scripts, build tooling, and Manus workflow orchestration
- **Manus** — Autonomous AI agent running the daily improvement cycle

---

## 📋 Features (In Progress / Evolving Daily)

- [ ] Driver and crew roster management
- [ ] Race event scheduling and calendar
- [ ] Performance tracking and analytics
- [ ] Team communications and logistics
- [ ] Budget and resource management
- [ ] Live race-day dashboards

> *This list evolves as Manus ships new features each day. Check [`changelog.md`](./changelog.md) for the latest.*

---

## 🏃 Getting Started (Works even if `pnpm` is missing)

```bash
# Clone the repository
git clone https://github.com/navigatingnc/Motorsports.git
cd Motorsports

# One-time setup (installs backend + frontend deps and generates Prisma client)
./setup.sh

# Start backend + frontend together
./dev-start.sh
```

### What `setup.sh` does

- Uses `pnpm` if already installed.
- If `pnpm` is not installed, it bootstraps it with `corepack` automatically.
- Falls back to `npm` only when `pnpm` cannot be bootstrapped.
- Installs backend/frontend dependencies and runs Prisma client generation.

### Verified local run sequence

```bash
./setup.sh
./dev-start.sh
```

This sequence has been validated in this repository.

---

## 📅 Changelog

All changes are logged automatically by Manus in [`changelog.md`](./changelog.md). Each entry includes the date, a description of what was changed, and why.

---

## 🤝 Contributing

This project is primarily maintained by the Manus autonomous agent, but human contributions are welcome! If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request

Please review [`WORKFLOW.md`](./WORKFLOW.md) to understand how the automated build process works before contributing, to avoid conflicts with the daily Manus cycle.

---

## 📬 Contact

Built and maintained by [@navigatingnc](https://github.com/navigatingnc) with daily AI-powered improvements via **Manus**.

---

*This README was last manually updated: February 2026. For the latest project state, see [`changelog.md`](./changelog.md).*
