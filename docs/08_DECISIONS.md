# PM Work Intelligence — Architecture Decision Records (ADR)

- **Status:** Living document — maintained for the life of the project
- **Document version:** 1.0
- **Applies to:** MVP scope (Horizon 1), context carries forward
- **Related docs:** 00_PRODUCT_VISION.md, 01_PRD.md, 02_ARCHITECTURE.md, 03_DATABASE.md, 04_API.md, 05_AI.md

---

## 1. Purpose

This document records the key technical and product decisions behind PM Work Intelligence — *why* we chose each component, what we considered, what we rejected, and what the consequences are.

Every entry is an **Architecture Decision Record (ADR)** in the format: **Context → Decision → Consequences**. Future decisions follow the template in §10.

---

## 2. ADR-001: Why Next.js (React) for the Frontend

### Status
Accepted (MVP). Revisit if a native mobile strategy emerges (H2/H4).

### Context
The product is an interactive, conversation-first web app: a chat/capture interface, real-time-ish review surfaces, dashboards, and reports. It must be responsive (desktop/tablet/mobile browser, NFR-6.3), fast on modest hardware (NFR-1.2), and maintainable by a small team. No native apps in MVP (N5).

### Decision
Use **Next.js (App Router) + React + TypeScript** for the frontend. Server-side rendering and server components for content-heavy pages (work log, reports, dashboard), client components for interactive surfaces (capture chat, review/editing), and the App Router for file-based routing.

### Alternatives considered & rejected
- **React SPA (Vite/CRA):** rejected — no SSR, worse SEO/perceived performance for report-heavy content, more manual routing/config.
- **Vue/Svelte:** viable, but the team and ecosystem are React-first; TypeScript + Next gives the fastest path to a robust product.
- **Native mobile (React Native/Flutter):** rejected for MVP (N5); the PWA/responsive approach covers mobile capture today.

### Consequences
- Strong SSR/ISR for reports and dashboards; predictable performance.
- Single codebase for web + future mobile (React Native) reuse of components/types.
- TypeScript end-to-end shares API contracts with the FastAPI backend (generated OpenAPI types).
- Server-component boundary must be respected to avoid accidentally serializing secrets to the client.

---

## 3. ADR-002: Why FastAPI (Python) for the Backend

### Status
Accepted (MVP). Revisit only if a non-Python AI stack becomes dominant.

### Context
The product's core differentiator is AI structuring of natural language (Whisper + LLM pipelines), plus a conventional CRUD/data layer. The AI layer benefits from Python's ML/NLP ecosystem, while the CRUD layer needs to be fast, typed, and easy to secure.

### Decision
Use **FastAPI (Python) + Pydantic** for the backend. Async endpoints for I/O-heavy AI orchestration, typed request/response models, automatic OpenAPI docs (NFR-7.3), and native access to the Python AI ecosystem.

### Alternatives considered & rejected
- **Node.js (Express/Nest):** rejected — weaker first-class access to the Python AI/ML ecosystem; would require a sidecar service for Whisper/LLM orchestration.
- **Django:** heavier than needed; DRF's style adds friction for a high-throughput async AI pipeline; single-process async model is a better fit.
- **Go/Rust:** excellent performance but slow to iterate on AI orchestration and prompt engineering.

### Consequences
- Fast iteration on prompt engineering and AI pipelines (the highest-risk area).
- Automatic OpenAPI → generated TypeScript clients for the Next.js frontend (NFR-7.3).
- Async model suits concurrent AI provider calls; Pydantic enforces the typed API contract (`04_API.md`).
- Python performance is sufficient for this workload (NFR-1.x); hot paths (confidence re-scoring) are deterministic and cheap.

---

## 4. ADR-003: Why Supabase (managed PostgreSQL) for the Data Layer

### Status
Accepted (MVP). Supabase is the **managed PostgreSQL** for MVP. The schema and SQL remain provider-agnostic (see `03_DATABASE.md`) so migration to AWS RDS/PostgreSQL is low-cost if constraints change.

### Context
We need durable, relational storage for 20+ tables (work logs, configs, AI analyses, reports), row-level security, and object storage for transcripts/audio. `03_DATABASE.md` defines a pure PostgreSQL 16 schema. `02_ARCHITECTURE.md` references AWS RDS as the production Postgres option.

### Decision
Use **Supabase** as the managed PostgreSQL provider for the MVP:
- **Postgres 16** runs the exact schema in `03_DATABASE.md` — no vendor-specific lock-in; the same DDL runs on RDS later.
- **RLS (Row-Level Security)** natively enforces NFR-3.4 (single-user scoping now, multi-tenant later) at the database layer.
- **Auth** (email/password, password reset) maps to FR-1; we still enforce sessions via JWT HttpOnly cookies in our backend for control and auditability.
- **Storage** (Supabase Storage / S3-compatible) holds raw transcripts and dictation audio (Whisper pipeline).
- Removes self-managed RDS operations during the small-team MVP window.

### Alternatives considered & rejected
- **AWS RDS (as primary now):** deferred — adds operational overhead (patches, scaling, backups management) with no MVP benefit; remains the documented scaling/enterprise path (H3).
- **DynamoDB/Mongo:** rejected — the relational model (joins across entries/configs/analyses) and SQL reporting need a relational store.
- **SQLite/Postgres on a single box:** rejected for MVP durability and the need for RLS-ready isolation.

### Consequences
- Fast time-to-value: schema, RLS, auth, and storage available on day one.
- RDS migration path preserved: DDL is standard PostgreSQL, so swapping the provider is a configuration/deploy change, not a schema rewrite.
- Supabase auth exists but our backend owns sessions; keep one auth authority (backend) to avoid divergence.
- Track Supabase service-region/compliance posture against NFR-4 and future enterprise needs.

---

## 5. ADR-004: Why Whisper for Speech-to-Text

### Status
Accepted (MVP) for voice-dictation → text.

### Context
FR-3 supports "voice-dictation via browser (text output)". We need accurate, private-enough transcription of work descriptions without building our own STT.

### Decision
Use **OpenAI Whisper** for transcription. MVP path: browser capture of audio → backend → Whisper (hosted or self-hosted) → text → the standard text structuring pipeline (`05_AI.md`). Keep transcription decoupled behind a speech-to-text abstraction so the model/provider can swap.

### Alternatives considered & rejected
- **Browser-native Web Speech API:** rejected as the primary path — inconsistent accuracy and no server-side record of the source (needed for provenance).
- **Commercial STT (Google/Azure):** viable, but Whisper gives good quality with an open, swappable model and no per-call STT vendor lock-in.
- **Full audio understanding via a multimodal LLM:** rejected for MVP cost/latency; text remains the structuring input.

### Consequences
- Consistent, high-quality dictation; provenance keeps the source audio/transcript.
- Whisper cost/latency is additive to LLM cost — mitigated by batching and only transcribing when audio capture is used.
- Abstraction allows future providers (including on-prem/BYO, NFR/H4) without touching the structuring pipeline.

---

## 6. ADR-005: Why a GPT-class LLM for Structuring (AI Provider Abstraction)

### Status
Accepted (MVP), with a provider abstraction.

### Context
The AI structuring pipeline must convert free-text into typed, provenance-bound work-log entries with confidence scores (FR-4), and generate narrative reports (FR-6). We need state-of-the-art language understanding with minimal prompt-engineering friction.

### Decision
Use a **GPT-class LLM (OpenAI GPT series, configurable model)** as the default structuring/generation engine, called **only through the AI provider abstraction** defined in `02_ARCHITECTURE.md` and `05_AI.md`.

Why a frontier model rather than a small/local model:
- **Structuring quality is the product.** NFR-5.1 (≥ 95% no-edit on routine input) and M8 (< 0.5% fabrication) are easier to hit with frontier reasoning and instruction-following.
- **Closed-set grounding beats open invention.** We engineer prompts with the user's configured KRAs/projects/stakeholders, enforce allow-list matching, and pair the model with a deterministic re-scoring layer (`05_AI.md`), so the model proposes and the system constrains — this is the anti-fabrication mechanism (R1).

### Alternatives considered & rejected
- **Small open-source models (Llama/Mistral, local):** deferred — quality gap on multi-entity extraction and clarification; revisit for BYO-model enterprise (H4).
- **Fine-tuned custom model:** rejected for MVP — insufficient labeled corpus yet; the correction loop (FR-8) is the seed for future fine-tuning.
- **No LLM (rules/NLP only):** rejected — cannot handle free-form multi-part conversation or narrative report generation.

### Consequences
- Best-in-class extraction and reporting quality out of the box.
- Cost and latency are real (R5): mitigated by payload minimization, caching, and graceful degradation to manual entry (NFR-2.3).
- Provider abstraction keeps swapability; every structured claim stays bounded by provenance + confidence + deterministic re-scoring.
- We never train on user data without explicit opt-in (NFR-4.2).

---

## 7. ADR-006: Why Configurable KRAs (and Entities) Rather Than Hardcoded Domains

### Status
Accepted. Foundational product principle (Core Principle #2).

### Context
No two roles/orgs define work the same way (Vision §Product Philosophy, "Configuration over Convention"). A hardcoded taxonomy cannot attribute work to the right KRA, project, or stakeholder for real users, and R2 (niche vocabulary) would crush accuracy.

### Decision
Make **KRAs, projects, stakeholders, meeting types, deliverable types, categories, and report templates first-class, user-editable entities** (FR-2). The AI's interpretative context is **built from the user's configuration at structuring time** — the configured vocabulary is injected into prompts as the allowed/known set, and anything outside it is flagged or clarified, never invented (FR-4.3, AC-4).

### Alternatives considered & rejected
- **Hardcoded taxonomy in code:** rejected — directly contradicts product philosophy; guarantees misfit for PMs/EMs with real organizational vocabulary.
- **Free-text tagging only:** rejected — no shared closed set for matching, no attribution consistency, no analytics integrity.
- **Vendor taxonomies (industry-standard lists):** rejected — still not organization-specific; we offer starter templates as a convenience, not a fixed schema.

### Consequences
- Accuracy comes from matching against the user's real vocabulary (R2 mitigation).
- Configuration becomes the "interpretive lens" — a defensible, explainable reason for every attribution.
- Every config change must propagate to prompt building (FR-2.5), hence config snapshots per AI analysis (`05_AI.md`).
- Slightly higher setup burden, mitigated by onboarding + starter templates (R7).

---

## 8. ADR-007: Why "Review Before Save" (Human-in-the-Loop)

### Status
Accepted. Non-negotiable product behavior (Core Principle #5, Vision "AI Is Augmentation, Not Magic").

### Context
Accuracy is the currency (Vision). A wrong work log is worse than none. Users (especially persona Derek) will adopt only if they can see and fix whatever the AI gets wrong. AI output must never silently become the record.

### Decision
AI-generated entries land in the work log as **`draft`** and become `confirmed` **only when the user reviews and confirms them** (FR-5.4, AC-5). Drafts carry per-field confidence and provenance (US-10–12). Corrections are stored as feedback and feed the learning loop (FR-8).

### Alternatives considered & rejected
- **Auto-save as confirmed:** rejected — violates the trust contract; destroys M6 (edit-rate ≤ 5%) measurement and R1 protection.
- **Background/ambient capture:** rejected (N4) — capture is conversational and intentional; no screen/session monitoring.

### Consequences
- Trust is earned: everything is verifiable, editable, and traceable to source.
- Every confirmation is a training signal; every correction is feedback (R2 mitigation).
- Extra click cost on draft → confirmed, minimized by design (NFR-6.2 ≤ 3 clicks).
- Reports and analytics only ever operate on confirmed entries — reports are trustworthy by construction.

---

## 9. ADR-008: Why Documentation-First Development

### Status
Accepted. Project convention, maintained for the life of the project.

### Context
This is an AI-heavy product with many interacting decisions (providers, prompt contracts, schema, API semantics, UX flows). A small team and a long product horizon (H1→H4) mean shared, accurate context is the highest-leverage asset. Several early decisions (e.g., AWS vs. Supabase) benefit from being written down with their *why*.

### Decision
Write the following docs **before** significant implementation, and keep them current as the source of truth:
- `00_PRODUCT_VISION.md` — why we exist.
- `01_PRD.md` — what we build (FR/NFR/US/AC/metrics/risks).
- `02_ARCHITECTURE.md` — how it fits together.
- `03_DATABASE.md` — the data contract.
- `04_API.md` — the API contract.
- `05_AI.md` — the AI pipeline contract.
- `06_UI_UX.md` — the experience contract.
- `07_ROADMAP.md` — the delivery plan.
- `08_DECISIONS.md` (this file) — why we chose what we chose.

Implementation in each sprint updates the relevant docs (Definition of Done, `07_ROADMAP.md` §15).

### Alternatives considered & rejected
- **Write code first, document later:** rejected — for an AI product, contracts (prompt schema, API, DB) are the coordination surface; rework from undocumented decisions is costlier.
- **Wiki-only, no repo docs:** rejected — docs should live beside code, versioned with it.

### Consequences
- New team members and reviewers converge fast on shared context.
- "Configuration drives intelligence" and other principles are enforced because they're written down and referenced.
- Docs need maintenance discipline; the Definition of Done makes that a sprint requirement, not a nice-to-have.

---

## 10. How Future Decisions Should Be Recorded

**When to write an ADR:** whenever a decision affects the product, architecture, AI pipeline, data model, API, UX, or the roadmap — including scope changes, provider swaps, schema changes, and sprint-goal changes. If in doubt, write it.

**Process:**
1. Copy the template below as the next `ADR-0NN: <Title>` section.
2. Set **Status** to `Proposed`.
3. Write **Context** (problem, constraints, options) — one short paragraph.
4. Write **Decision** (what we chose and why, in 2–4 sentences).
5. List **Alternatives considered & rejected** with one-line reasons.
6. Write **Consequences** (positive and negative, including cost/risk).
7. Get agreement in the next sprint review; set Status to `Accepted` or `Superseded`.
8. If a decision changes later, mark the old ADR `Superseded by ADR-0NN` and link them.

**ADR template:**

```markdown
### ADR-0NN: <Title>

**Status:** Proposed | Accepted | Superseded

**Context:**
<What problem/constraint/opportunity drove this? What options were on the table?>

**Decision:**
<What we chose, and why, concisely.>

**Alternatives considered & rejected:**
- <Option A>: <why rejected>
- <Option B>: <why rejected>

**Consequences:**
- <positive outcomes>
- <negative outcomes / costs>
- <migration or compatibility notes>
```

**Mandatory checks before accepting an ADR:**
- Does it conflict with any principle in `00_PRODUCT_VISION.md` (§Core Principles)? If so, resolve the conflict explicitly.
- Does it change the PRD (FR/NFR/US/AC/metrics/risks)? If so, bump the PRD version and note it.
- Does it touch the data model (`03_DATABASE.md`), API (`04_API.md`), or AI pipeline (`05_AI.md`)? If so, update those docs in the same change.
- Does it affect sprint scope (`07_ROADMAP.md`)? If so, update the roadmap and re-check dependencies.
