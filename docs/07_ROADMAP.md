# PM Work Intelligence — Product Roadmap

- **Status:** Planning reference
- **Product:** PM Work Intelligence — AI Work Intelligence Platform
- **Document version:** 1.0
- **Applies to:** MVP scope (Horizon 1) with post-MVP horizons
- **Related docs:** 00_PRODUCT_VISION.md, 01_PRD.md, 02_ARCHITECTURE.md, 03_DATABASE.md, 04_API.md, 05_AI.md, 06_UI_UX.md

---

## 1. Purpose

This roadmap defines **how** the MVP is delivered: the sprint sequence, objectives, deliverables, dependencies, acceptance criteria, and risks for each of the seven MVP sprints. It translates the vision and PRD into an execution plan.

It is a living document. Dates are indicative; scope and sequence are the source of truth. Any change to scope must be reconciled against the PRD (`docs/01_PRD.md`) and recorded in an ADR (`docs/08_DECISIONS.md`).

---

## 2. Roadmap at a Glance

| Sprint | Theme | Primary FRs / US | Primary ACs | Exit Gate |
|--------|-------|-------------------|-------------|-----------|
| S1 | Foundation & Infrastructure | — | — | Green CI, migrated schema, deployed staging env |
| S2 | Auth & Profile | FR-1 / US-1 | AC-1 | Signup → login → profile |
| S3 | Configuration | FR-2 / US-2–6 | AC-2 | Fully configured AI context |
| S4 | Capture & AI Structuring | FR-3, FR-4 / US-7–12 | AC-3, AC-4 | Converse → structured entries, core loop proven |
| S5 | Work Log Management | FR-5, FR-8.1 / US-13–14 | AC-5 | Draft → confirmed lifecycle with feedback capture |
| S6 | Reports | FR-6 / US-15–17 | AC-6 | Daily/weekly/custom reports, Markdown/PDF export |
| S7 | Analytics, Insights & Hardening | FR-7, FR-8, FR-9 / US-18–21 | AC-7, AC-8, AC-9 | Analytics + data ownership + security review → MVP release |

**Cadence:** 2-week sprints → **7 sprints ≈ 14 weeks** to MVP. Add 1 release/verification buffer week → **target MVP in ~15 weeks**.

---

## 3. Guiding Principles

1. **Core loop first.** Sprint sequencing protects the value loop *converse → structure → validate → report → decide*. Each sprint ends with a demonstrable slice of that loop.
2. **Config precedes intelligence.** The AI cannot structure work against entities that don't exist (Sprint 3 must land before Sprint 4 quality work).
3. **Trust is engineered, not added.** Provenance, confidence, and no-fabrication behavior ship with the first AI feature (Sprint 4), not retrofitted.
4. **No scope creep.** Non-goals (N1–N10) are defended every sprint. New ideas go to the backlog or a future horizon, not the current sprint.
5. **Quality gates every sprint.** Each sprint's acceptance criteria and success metrics are checked before declaring the sprint done.
6. **Fail gracefully.** AI-provider degradation (NFR-2.3) is designed from Sprint 4 onward, not bolted on at the end.

---

## 4. Dependency Graph

```
S1 Foundation
 └─ S2 Auth & Profile
     └─ S3 Configuration
         └─ S4 Capture & AI Structuring
             ├─ S5 Work Log Management
             │    ├─ S6 Reports
             │    └─ S7 Analytics, Insights & Hardening
```

- S1 is the foundation for everything (schema, CI, envs, observability).
- S2 must precede S3 and S4 (single-user scoping still needs identity, row-level access).
- S3 must precede S4 (AI context comes from configuration).
- S4 must precede S5 (work log consumes structured entries).
- S5 must precede S6 and S7 (reports and analytics only operate on confirmed entries).
- S6 and S7 can run partially in parallel after S5; sequenced here to keep the MVP commit tight.

---

## 5. Sprint 1 — Foundation & Infrastructure

**Objectives**
- Stand up the full reference architecture (`02_ARCHITECTURE.md`) as runnable scaffolding.
- Make the development experience fast and safe: local dev parity, one-command setup, CI on every push.
- Establish the observability and security baseline before product code lands.

**Deliverables**
- Monorepo scaffold: `frontend/` (Next.js 15) and `backend/` (FastAPI) wired for local dev.
- PostgreSQL 16 schema migration set for all tables in `03_DATABASE.md`; seed/migration runner.
- Redis wiring for cache and job queue; S3-compatible storage for raw transcripts/audio.
- CI pipeline (lint, typecheck, unit tests, build, migrations) and a staging deployment (AWS: ECS/Fargate + RDS + CloudFront per architecture).
- Observability: structured logging, request tracing, error reporting, basic dashboards.
- Secrets management via env/secret manager (NFR-3.5); TLS on all staging traffic (NFR-3.1).
- API v1 skeleton: envelope, error codes, pagination, optimistic-locking helpers (`04_API.md`).
- Health/ready endpoints and `frontend`→`backend` connectivity proof (CORS, proxy).

**Dependencies**
- None (project bootstrap). Assumes approval of architecture and database designs (00–03 docs).

**Acceptance Criteria**
- `docker compose up` (or equivalent) runs the full stack locally with migrations applied.
- CI is green: lint, typecheck, and unit tests pass on every push.
- `/health` and `/ready` respond correctly; RDS, Redis, and S3 connections verified from staging.
- All 20 tables from `03_DATABASE.md` exist in the migrated schema.
- Staging environment is reachable over HTTPS; secrets are not committed to source control.

**Risks**
- R10 (security exposure): mitigations seeded now (secrets, TLS, least-privilege roles).
- Infrastructure complexity/time: reduce via managed services (RDS, ElastiCache, S3) and IaC templates.
- Schema churn later: freeze the contract early; changes go through migrations + ADR if breaking.

---

## 6. Sprint 2 — Authentication & User Profile

**Objectives**
- Deliver secure email/password auth with persistent sessions.
- Land the first screen users see: signup → onboarding/config entry (06_UI_UX.md).
- Establish row-level data isolation (NFR-3.4) as the default for all future queries.

**Deliverables**
- Backend: signup, login, logout, session refresh, password reset (email link), profile read/update (FR-1.1–1.4; API in `04_API.md`).
- Auth implementation per `02_ARCHITECTURE.md` (JWT in HttpOnly cookie, CSRF protection, rate limiting).
- Password hashing with bcrypt/argon2 (NFR-3.2); never plaintext.
- Frontend: auth screens (signup, login, reset), session handling, protected-route guard, onboarding entry point.
- Unit + integration tests for auth flows; OWASP basics check (injection, XSS, CSRF) (NFR-3.3).

**Dependencies**
- S1 (foundation, schema, CI, envs).

**Acceptance Criteria**
- **AC-1.1** Valid signup → account created, auto-login, land on onboarding/config screen.
- **AC-1.2** Invalid/duplicate email → clear validation error, no account created.
- Sessions persist securely across reloads; logout invalidates the session.
- All user-data queries are scoped to the authenticated user (row-level access).
- Password reset email link flow works end-to-end in staging.

**Risks**
- R10 (security): mitigated via hashing, HttpOnly cookies, rate limiting, CSRF tokens.
- Session/UX bugs: covered by integration tests and manual QA of the full auth journey.

---

## 7. Sprint 3 — Configurable Work Context

**Objectives**
- Make KRAs, projects, stakeholders, and time-allocation categories first-class, editable, archivable entities (FR-2).
- Deliver a guided onboarding experience that gets a new user to a usable configuration in minutes (R7 mitigation).
- Prove that configuration becomes AI context (feed config into prompt-building contract; end-to-end hookup lands with S4).

**Deliverables**
- Backend: CRUD + archive APIs for KRAs, projects, stakeholders, and time-allocation categories (FR-2.1–2.6; contract in `04_API.md`).
- Soft-archive semantics: archived entities are excluded from auto-assignment but historical references remain intact (FR-2.6, AC-2.2).
- Frontend: configuration screens and settings UI per `06_UI_UX.md` (Settings → KRAs / Projects / Stakeholders / Categories).
- Onboarding wizard: profile, first KRA, first project, first stakeholder, first capture attempt (US-2); "configure later" starter-template path.
- Validation: uniqueness, required fields, archive/ordering behavior; API tests.

**Dependencies**
- S2 (identity and row-level scoping).

**Acceptance Criteria**
- **AC-2.1** Adding a KRA persists it, lists it, and makes it available to the AI as a recognized value.
- **AC-2.2** Archiving a KRA stops auto-assignment but permits flagged, user-resolved mentions.
- A new user completes onboarding configuration in under 10 minutes (NFR-6.1 partial).
- Starter templates work for the "configure later" path (R7).

**Risks**
- R7 (config burden): mitigated by guided onboarding and starter templates.
- R2 (niche vocabulary): the configuration model is the foundation for injecting user-specific vocabulary into prompts (completes in S4).

---

## 8. Sprint 4 — Conversational Capture & AI Structuring

**Objectives**
- Deliver the heart of the product: natural-language capture becomes structured work-log entries (FR-3, FR-4).
- Engineer trust by default: provenance on every claim, confidence per field, clarify-don't-guess on ambiguity, and a strict no-fabrication contract (AC-3, AC-4).
- Keep capture fast (NFR-1.1) and resilient to AI-provider outages (NFR-2.3).

**Deliverables**
- Backend: capture-session + message APIs (FR-3.1–3.5), conversation context per session.
- Whisper integration for voice-dictation → text (per `05_AI.md`), with S3 storage of source audio/transcripts.
- AI structuring pipeline (`05_AI.md`): prompt building from config snapshots, closed-set entity matching, KRA/project/stakeholder/meeting/deliverable/documentation/learning/bug/feature detection, hour estimation via configured rules, deterministic confidence re-scoring, provenance mapping.
- Clarification flow: the pipeline returns a clarification request when matches are ambiguous (FR-4.5, AC-3.3).
- Inference labeling: assigned-but-not-stated values are explicitly labeled (AC-3.4); unknown entities are flagged, never invented (AC-4.1, FR-4.7).
- AI provider abstraction with graceful degradation: manual entry and existing features stay functional when the provider is down (NFR-2.3, R5).
- Frontend: capture screen (chat + paste + dictation) per `06_UI_UX.md`; entry-structuring review surface with confidence and provenance displays (US-10–12).
- Seed evaluation harness and fabrication test suite (`05_AI.md` eval section; M8, NFR-5.2).

**Dependencies**
- S3 (configuration exists and is consumed as AI context).

**Acceptance Criteria**
- **AC-3.1** A capture describing 3 activities returns 3 structured entries, each with summary, type, entities, confidence, and source reference.
- **AC-3.2** A unique configured match ("Project Phoenix") is attributed with high confidence.
- **AC-3.3** Ambiguous matches trigger a clarifying question instead of a guess.
- **AC-3.4** Non-stated project assignment is explicitly labeled as inference.
- **AC-4.1** Unknown stakeholders are not invented as typed entities — free text or flagged for creation.
- P95 capture → initial structured results ≤ 10s (NFR-1.1).
- Provider outage → manual entry remains fully functional (G-M3).

**Risks**
- R1 (fabrication): provenance + inference labeling + fabrication test suite + rate monitoring (M8).
- R2 (accuracy): config-driven context, clarify-don't-guess, correction loop starts in S5.
- R5 (LLM dependency/cost): provider abstraction, payload minimization, caching, graceful degradation.

---

## 9. Sprint 5 — Work Log Management & Feedback Loop

**Objectives**
- Give users full control over AI output: review, confirm, edit, split, merge, delete, reject (FR-5).
- Capture every correction as structured feedback that feeds the learning loop (FR-8.1).
- Close the loop from draft → confirmed → reported artifact foundation.

**Deliverables**
- Backend: work-log entry APIs — list with filters/date ranges, confirm, edit, split, merge, delete, reject; status lifecycle `draft → confirmed → (archived)` (FR-5.1–5.4; `04_API.md`).
- Manual entry fallback with the same field set (FR-5.3, US-14).
- Feedback recording: every user correction stored with session context and associated config (FR-5.5, FR-8.1) and exposed for model tuning (FR-8.2 groundwork).
- Frontend: work-log views (day/week, filters) and the review surface (confirm/edit/split/merge/reject) per `06_UI_UX.md`.
- Optimistic locking (`version` field) to prevent lost updates on concurrent edits (NFR; `04_API.md`).
- Tests for lifecycle transitions and feedback capture.

**Dependencies**
- S4 (structured entries exist to manage).

**Acceptance Criteria**
- **AC-5.1** Confirm → status becomes `confirmed`, entry appears in reports/analytics.
- **AC-5.2** Editing a field saves the correction, reflects in reports, and is recorded as feedback.
- Split/merge/reject/delete behave correctly across edge cases (multi-day entries, shared provenance).
- Manual entry produces the same schema as AI-generated entries.

**Risks**
- R3 (capture fatigue): the review surface must be fast and near-zero-effort (≤ 3 clicks, NFR-6.2).
- R2 (accuracy): correction feedback is the raw material for accuracy improvements.

---

## 10. Sprint 6 — Reports

**Objectives**
- Deliver daily, weekly, and custom-date-range narrative reports from confirmed work (FR-6).
- Make reports editable before export and exportable to Markdown and PDF (FR-6.4–6.5).
- Introduce configurable report templates (FR-6.6) with a sensible default that requires minimal editing (R6).

**Deliverables**
- Backend: report generation service — narrative prose grouped by configured entities (KRA/project/type) (FR-6.1–6.3; `04_API.md`).
- Report editing before export (FR-6.4); Markdown and PDF exporters (FR-6.5).
- Configurable report templates: sections, tone, verbosity (FR-6.6).
- Frontend: report screens and export actions per `06_UI_UX.md`.
- Report-quality sampling: capture edit-rate on generated reports to track M6/R6.
- Performance: month-of-data report ≤ 15s p95 (NFR-1.3).

**Dependencies**
- S5 (confirmed entries and feedback loop).

**Acceptance Criteria**
- **AC-6.1** A weekly report covers all confirmed entries in range, grouped by configured entities, exportable to PDF and Markdown.
- Custom date-range reports generate correctly, including empty/partial ranges.
- Editing a report before export persists the edited version for the export.
- Report templates can be customized without code changes.

**Risks**
- R6 (report quality): templates + tone settings + iterative prompt tuning with real corpus + edit-rate monitoring.
- R3 (capture fatigue): reports are the visible payoff that justifies capture.

---

## 11. Sprint 7 — Analytics, Insights, Data Ownership & Hardening

**Objectives**
- Turn validated records into decision-grade intelligence: analytics, insights, and data ownership (FR-7, FR-9).
- Close out the *decide* step of the core loop and ship a hardened, releasable MVP.
- Complete privacy, security, and quality gates ahead of MVP release (NFR-3/4/5).

**Deliverables**
- Backend: analytics service — effort distribution by KRA/project/category, actual vs. planned allocation (FR-7.1–7.2); insights engine with configurable, rule-based thresholds (FR-7.3–7.4).
- Insight acknowledgement/dismissal state (FR-7.5).
- Data ownership: full export (JSON/CSV/Markdown) and account deletion (FR-9.1–9.2, US-21, AC-9).
- AI behavior preferences: verbosity, clarification frequency, default attribution (FR-9.3).
- Learning loop hardening: apply correction feedback to prompt tuning; ship model-quality reports to ops (FR-8.3–8.4).
- Frontend: analytics dashboard, insights feed, settings screens, export/deletion flows per `06_UI_UX.md`.
- Final gate: security review + pen-test pass (R10), privacy compliance review (R4), eval suite runs green (M8, NFR-5.2), load/performance sanity (G-M1/M2), accessibility pass (WCAG 2.1 AA per 06_UI_UX.md).

**Dependencies**
- S5 and S6 (confirmed data and report layer feed analytics).

**Acceptance Criteria**
- **AC-7.1** Effort distribution charts render correct percentages summing to 100% over selected ranges.
- **AC-8.1** A zero-activity week surfaces a dismissible "No work logged" insight.
- **AC-9.1** Full export returns a valid archive of work logs, configs, and reports.
- **AC-9.2** Account deletion removes personal data from primary storage within 30 days and revokes login.
- AI-availability outage: all non-AI features (work log, reports, analytics, config) remain functional (G-M3).

**Risks**
- R4 (privacy): plain-language policy, consent, minimal AI payloads, no training without opt-in.
- R9 (data lock-in): open export formats and documented deletion path.
- R8 (scope creep): final MVP scope defense before release.

---

## 12. Post-MVP Horizons

| Horizon | Window | Focus | Source |
|---------|--------|-------|--------|
| H1 | 0–12 months | **Personal Work Intelligence** — this MVP (Sprints 1–7) | Vision §Horizon 1 |
| H2 | 12–24 months | **Team & Stakeholder Intelligence** — shared configs, team/org rollups, automated status briefs, meeting-driven capture, integrations (Slack, Teams, Jira, Calendar, email) | Vision §Horizon 2, PRD §15 |
| H3 | 24–36 months | **Organizational Work Intelligence** — org taxonomies, resource/capacity planning, benchmarking, SSO/provisioning/audit | Vision §Horizon 3, PRD §15 |
| H4 | 36+ months | **Autonomous Work Orchestration** — predictive insights, proactive status drafting, agentic assistance | Vision §Horizon 4, PRD §15 |

Backlog candidates from MVP non-goals (N1–N10) flow into H2/H3/H4; they are not added to H1 scope.

---

## 13. Success Metrics Tracking

| Metric | Target | When it's first measurable | Where it's verified |
|--------|--------|---------------------------|---------------------|
| M1 Activation (first confirmed log ≤ 48h) | ≥ 40% | S7 (post-release) | Product analytics |
| M2 Time to first confirmed log | ≤ 15 min | S5 | Product analytics |
| M3 Weekly capture sessions/active user | ≥ 3 | S7 (post-release) | Product analytics |
| M4 DAU/WAU | ≥ 0.5 | S7 (post-release) | Product analytics |
| M5 Report generation rate | ≥ 30% WAU | S7 (post-release) | Product analytics |
| M6 Confirmed-entry edit rate | ≤ 5% | S5 (seed), S7 (monitored) | Eval harness + prod logs |
| M7 Clarification rate | 5–15% | S4 | AI pipeline logs |
| M8 Fabrication rate | < 0.5% | S4 (suite), S7 (monitored) | Eval harness + audits |
| M10 Time saved | ≥ 30% | S7 (post-release) | Surveys + inferred |
| M11 Weekly retention | ≥ 80% | S7 (post-release) | Product analytics |
| G-M1 Capture latency p95 | ≤ 10s | S4 | Tracing |
| G-M2 Availability | ≥ 99.9% | S1 (baseline) | Uptime monitoring |
| G-M3 Manual entry on AI outage | Always | S4 | Chaos/failover test |

---

## 14. Release Milestones

| Milestone | Sprint | Definition |
|-----------|--------|------------|
| **Internal alpha** | End of S4 | Core loop works internally; structured entries with provenance/confidence land in the work log. |
| **Internal beta** | End of S6 | Capture, work log, and reports usable; feedback loop active; real usage in a pilot group. |
| **MVP launch** | End of S7 (+ buffer week) | All AC-1..9 green, guardrails met, security/privacy review passed. |
| **6-month checkpoint** | H1 mid-point | Review M1–M11 against targets; decide H2 investments. |

---

## 15. Roadmap Governance

- **Scope changes:** any change to sprint scope, sequencing, or MVP cut requires (a) an ADR entry in `docs/08_DECISIONS.md` and (b) a PRD version bump if functional/non-functional requirements change.
- **Sprint reviews:** end-of-sprint demo against the sprint's acceptance criteria and metric seeds.
- **Blockers:** surfaced at daily standups; if a sprint's exit gate is at risk, the owner proposes scope/schedule trade-offs in writing before deviating.
- **Definition of Done per sprint:** acceptance criteria pass, CI green, no unresolved security findings, metrics seeded, docs updated (`04_API.md` / `05_AI.md` / `06_UI_UX.md` as applicable).
