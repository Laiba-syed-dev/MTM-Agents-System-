# Mind to Machine Hackathon — MTM Agent System
**Islamabad 2026 · Autonomous AI Event Planning System**

## 1. Executive Summary
The **MTM Agent System** is a message-driven AI event planning system developed for the *Mind to Machine Hackathon (18 November 2026)* in Islamabad.
It ingests an unseen collection of raw messages in English and Roman Urdu, extracts verified facts with provenance references, resolves conflicting and outdated assertions, defends against unauthorized proposals, and generates a verifiably valid 4-hour physical hackathon plan for 150 students in 50 teams.

## 2. Architectural Highlights
- **AI Language Engine**: Understands Roman Urdu and English unstructured messages; extracts candidate facts and source citations.
- **JavaScript Engine**: Deterministic arithmetic and hard constraint validator. The AI cannot approve its own calculations.
- **Trace Accountability**: Every actual model call is recorded with its real model ID, area tag (`reading`, `venue`, `schedule`, `food`, `judging`, `budget`), exact input, exact output, and provider-reported tokens.
- **Incremental Updates**: Accepts sequential judge updates and calls AI **only for affected areas** (strictly obeying the 5-call hard limit). Wrong messages are safely caught and rejected while preserving the valid plan.

## 3. Quick Start & Execution

### One-Command Full Pipeline (FR-02)
```bash
npm run mtm
```
Or specify a custom message pack:
```bash
npm run mtm -- path/to/unseen_messages.txt
```

### Run Full System (Frontend + Backend)
```bash
# Terminal 1: Backend API
npm run server

# Terminal 2: Vite React Frontend
npm run client
```
The React dashboard will be live at `http://localhost:5173`.

### Automated Testing Suite
```bash
npm test
```
All 10 unit and integration tests execute deterministic validation, conflict resolution, and sequential update pipelines.

## 4. Judging Score Alignment (100 Points + 10 Bonus)
- **Output (30 pts)**: Passes all 6 checks (correct figures, within PKR 650,000 budget, venue fits 177 attendees, valid 240-min schedule with prayer break, sufficient judges, all 5 areas covered).
- **Catching the Wrong Message (20 pts)**: Explains and records why constraint-violating messages (e.g. Caterer rounding down to 100 boxes) or unapproved proposals (e.g. DJ) are rejected while retaining the valid plan.
- **Understanding (20 pts)**: Clean modular code with explicit responsibilities.
- **Handling Change (10 pts)**: Selective updates make model calls only for affected areas (max 5 calls per update).
- **UI (10 pts)**: Professional 7-page React/Tailwind dashboard (Dashboard, Upload, Plan, Facts, Trace, Rejected, History).
- **Predicting a Change (5 pts)**: Impact analyzer accurately flags affected areas prior to model calls.
- **Token Use (5 pts + 10 Bonus)**: Lean token usage with complete token accounting and local/small-model support.
