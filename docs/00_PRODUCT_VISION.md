# PM Work Intelligence — Product Vision

## Vision

A world where every knowledge worker's daily effort is captured effortlessly, understood deeply, and transformed into strategic value — without a single manual timesheet, status update, or retrospective.

PM Work Intelligence makes **work itself** the input, and **intelligence** the output. We envision a platform where talking about your work — naturally, in your own words — is enough to generate accurate work logs, credible reports, meaningful analytics, and actionable insights for individuals, teams, and organizations.

## Mission

Our mission is to eliminate the friction of work documentation by building an AI-powered platform that:

1. **Listens** to how knowledge workers describe their work through natural conversations.
2. **Understands** work in the context of configurable organizational constructs — KRAs, projects, stakeholders, meetings, deliverables, and more.
3. **Transforms** that understanding into structured, accurate, and audit-ready artifacts — work logs, reports, analytics, and insights.
4. **Adapts** continuously to every user's unique role, team, and organizational context.

We succeed when PMs and engineering leaders spend less time documenting and more time leading.

## Why This Product Exists

Program Managers, Project Managers, Product Managers, and Engineering Managers spend a disproportionate amount of their week on **work capture** and **work reporting**:

- Daily standups require accurate recall of what was done.
- Weekly status reports require aggregation and summarization of scattered activity.
- Performance reviews rely on reconstructed — often incomplete or inaccurate — records of contributions.
- Resource planning and time allocation decisions are made on gut feel because reliable data does not exist.
- Compliance, audit, and invoicing requirements demand evidence that workers rarely capture systematically.

The irony is that knowledge workers are already **talking about their work** — in chat messages, meeting notes, emails, and 1:1s. The work data exists; it is simply unstructured, scattered, and disconnected from the organizational constructs (KRAs, projects, stakeholders) that make it meaningful.

PM Work Intelligence exists to connect the dots: capture the natural language that already describes work, structure it, and turn it into decision-grade intelligence.

## Problem Statement

Knowledge workers lack a low-friction, accurate, and context-aware way to record and report their work. The current alternatives force users to choose between two bad options:

1. **Manual tracking** (timesheets, spreadsheets, status docs): highly accurate but burdensome, error-prone, abandoned within weeks, and disconnected from how people actually work.
2. **No tracking at all**: zero burden but no records — leading to unreliable status updates, inflated effort estimates in retrospectives, lost contribution evidence at review time, and decision-making on incomplete information.

Existing "auto-capture" tools capture raw activity (apps used, files touched, screenshots) but fail to capture **intent** — what the work meant, which project it served, which KRA it advanced, or who was involved. Raw activity data is noisy, privacy-invasive, and disconnected from organizational goals.

Additionally, existing tools are **hardcoded and rigid**. Organizational vocabulary — the KRAs, projects, and stakeholders a person actually works with — differs across teams and companies. Generic tools cannot interpret work in a way that is meaningful to a specific organization without customization, and most tools offer none.

The result: leaders make decisions on incomplete, inaccurate, or stale information, and individual contributors are evaluated on poorly evidenced, reconstructed narratives.

## Opportunity

The opportunity sits at the intersection of three converging trends:

1. **LLM capability**: Modern large language models can interpret natural language, extract structured entities, classify intent, and reason about context with human-level (and improving) quality. The technical bottleneck of "understanding natural descriptions of work" has effectively been solved.

2. **Conversational-first workflows**: Chat interfaces are now the default way knowledge workers communicate. AI-native work tools (Copilots, AI assistants, agentic platforms) have made "describe it, don't type it" a mainstream expectation.

3. **The reporting burden is growing**: As organizations scale, the overhead of status reporting, alignment documentation, and evidence-based performance management grows. Leaders explicitly ask for AI assistance in writing reports, creating alignment, and extracting insights from work data.

The market opportunity is a **horizontal platform** for work intelligence that serves:

- Individual PMs and ICs who want automatic, accurate work records.
- Managers and leaders who want reliable status, effort, and insight without chasing people.
- Organizations that want structured, consistent, and configurable work data aligned to their own operating model (KRAs, projects, stakeholders, deliverable types).

There is no dominant incumbent in "natural-language work capture → structured intelligence." The space is fragmented between timesheet tools, note-taking apps, meeting note takers, and project trackers — none of which own the end-to-end flow of *conversation → structured work record → reports/analytics/insights*.

## Product Philosophy

**The user never documents for the sake of documentation — they document to be understood. Our job is to make being understood effortless and valuable.**

### Work First, Tracking Second

The product is not a tracking tool that users must remember to update. It is a background intelligence layer that understands work the user already does. Capture is a by-product of doing work, not a separate activity.

### Conversation Is the Interface

Natural language is the primary interface. Users describe what they did, the AI structures it. The system never demands a specific form format before it will listen.

### Configuration over Convention

No two organizations (or roles) define work the same way. KRAs, projects, stakeholders, meeting types, deliverable types, and time-allocation categories must be **configurable first-class entities**, not hardcoded lists. The AI uses these configurations as its interpretative context.

### AI Is Augmentation, Not Magic

The AI generates, the user validates. Every auto-generated artifact must be reviewable, editable, and correctable. The system learns from corrections. Confidence matters: the AI must communicate when it is unsure and ask rather than guess.

### Accuracy Is the Currency

A work log that is wrong is worse than no work log. Structured output must be grounded in what the user actually said, with provenance (the source conversation, meeting, or note) attached to every claim.

### Privacy Is Non-Negotiable

Work data is sensitive. The platform must be transparent about what it captures, allow users to control what is stored and what the AI is allowed to infer, and never use a user's work data for purposes they have not consented to.

## Core Principles

| # | Principle | Description |
|---|-----------|-------------|
| 1 | **Natural in, structured out** | All input is conversational; all stored data is structured and queryable. |
| 2 | **Everything is configurable** | No hardcoded domains. KRAs, projects, stakeholders, meetings, deliverables, categories, and templates are all editable, organization- and role-scoped. |
| 3 | **Configuration drives intelligence** | The AI interprets work *using* the user's configured context. Configurations are the interpretive lens, not decoration. |
| 4 | **Provenance on everything** | Every structured claim traces back to the source conversation, note, or meeting it came from. |
| 5 | **Human-in-the-loop** | AI proposes, humans dispose. Edits, corrections, and confirmations are first-class, and the system learns from them. |
| 6 | **Confidence transparency** | The system surfaces its confidence and asks for clarification rather than silently guessing. |
| 7 | **Zero-burden capture** | The default capture path requires zero proactive effort from the user. Manual entry is a fallback, not the norm. |
| 8 | **Reports, not raw data** | Users consume intelligence — summaries, reports, analytics — not raw event streams. |
| 9 | **Scale from individual to organization** | The same model powers a single user's log and an organization's aggregated insight. |
| 10 | **Open, standard foundations** | Built on configurable taxonomies and exportable data. No proprietary lock-in of the user's work records. |

## Long-Term Vision

### Horizon 1 — Personal Work Intelligence (0–12 months)
A single-user intelligent work log. Users converse with the AI daily, the AI generates structured work logs aligned to their configured KRAs and projects, and users get daily/weekly summaries, simple analytics, and exportable reports. This establishes the core loop: *converse → structure → validate → report*.

### Horizon 2 — Team & Stakeholder Intelligence (12–24 months)
Multi-user collaboration: shared projects and stakeholders, team-level reporting, automated status briefs for leadership, cross-user analytics, and meeting-driven capture. The platform begins to aggregate individual work records into team-level intelligence.

### Horizon 3 — Organizational Work Intelligence (24–36 months)
Organization-wide deployment: configurable organizational taxonomies, department and BU rollups, strategic reporting, resource and capacity planning based on real work records, and insight engines that surface risks, bottlenecks, and opportunities across the organization.

### Horizon 4 — Autonomous Work Orchestration (36+ months)
The platform evolves from a *recorder of work* to an *active partner in work*: proactively reminding, suggesting, and eventually orchestrating. It anticipates reporting deadlines, drafts status updates from work data, and helps managers allocate resources from predictive models of actual work patterns.

**The enduring ambition:** become the de facto system of record for knowledge work — the layer that knows what work happened, who did it, what it meant, and what it will take to do the next thing.

## Success Definition

### Product-Level Success
PM Work Intelligence is successful when **accurate work records become a by-product of doing work, not an obligation**.

Success is measured across three tiers:

#### Tier 1 — Capture Without Friction
- A user can produce a complete, accurate work log for a day by having a 3–5 minute conversation, with **zero manual form-filling**.
- The majority of a user's work records require no editing after AI generation (low edit rate on generated artifacts).

#### Tier 2 — Contextually Accurate Intelligence
- The AI correctly attributes work to the user's configured KRAs, projects, stakeholders, and deliverables at ≥ 95% user-confirmed accuracy for routine work descriptions.
- Reports, summaries, and analytics generated from work records are directly usable in real business contexts (status updates, 1:1s, performance reviews) without rework.

#### Tier 3 — Strategic Value
- Leaders make resource, prioritization, and performance decisions using platform-generated insights.
- The platform produces measurable time savings: **at least 30% reduction in time spent on work capture and status reporting** for active users.
- Strong retention: the tool is used daily because it pays for itself in recovered time.

### Metric Definition
- **Core North Star Metric**: **Weekly Active Structured Work Sessions** — the number of users who produce or validate at least one AI-generated work record in a given week.
- **Activation**: First AI-generated, user-confirmed work log within the first 48 hours.
- **Engagement**: Daily capture sessions per active user; weekly report generation rate.
- **Quality**: User-confirmed accuracy (accepted vs. generated records); edit frequency on AI output; clarification request rate.
- **Business**: Time saved per user per week (self-reported + inferred from reduced manual entry); report reuse rate; paid conversion and retention.

### Success Is Not
- Success is **not** measured by raw event-capture volume, screenshots, or "activity" streams. Volume without meaning is noise.
- Success is **not** a timesheet-compliance tool. We succeed when users *choose* to use it because it saves time and improves decisions — not because a policy requires it.
