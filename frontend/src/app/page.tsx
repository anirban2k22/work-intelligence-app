"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Check,
  Sun,
  Moon,
  FileText,
  ShieldCheck,
  Users,
  Building2,
  Clock,
  AlertTriangle,
  LayoutGrid,
  Lock,
  Zap,
  Square,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  ProofX — marketing landing page                                            */
/* -------------------------------------------------------------------------- */

const SCENARIOS = [
  {
    who: "Dev Sharma",
    role: "Employee",
    date: "Tue, 11 Aug",
    raw: "uh so today I finally got the stripe webhook retries working, took most of the morning. then standup, we talked about the onboarding drop-off. I'm blocked on design tokens for the settings page, still waiting on Priya. oh and I reviewed two PRs on the auth refactor.",
    lines: [
      {
        tag: "Development",
        tone: "indigo",
        title: "Shipped idempotent retries for Stripe webhooks",
        detail: "Replay-safe handler with exponential backoff. ~3h.",
      },
      {
        tag: "Code review",
        tone: "neutral",
        title: "Reviewed 2 PRs on the auth refactor",
        detail: "Both approved, no changes requested.",
      },
      {
        tag: "Meeting",
        tone: "neutral",
        title: "Standup — onboarding drop-off",
        detail: "Team flagged step 3 of signup as the leak.",
      },
    ],
    blocker: {
      title: "Design tokens for Settings",
      detail: "Waiting on Priya · 2 days · escalated to manager",
    },
    time: [
      ["Billing", "3h 10m"],
      ["Auth", "1h 20m"],
      ["Meetings", "45m"],
    ],
  },
  {
    who: "Dev Sharma",
    role: "Employee",
    date: "Wed, 12 Aug",
    raw: "spent basically the whole day on the CSV importer, mostly error states and partial-row handling. customer call with Northwind at two, they want SSO before they renew. and I still can't reproduce that timezone bug from support.",
    lines: [
      {
        tag: "Development",
        tone: "indigo",
        title: "CSV importer — error and partial-row states",
        detail: "Row-level failures now surface without dropping the batch.",
      },
      {
        tag: "Customer",
        tone: "emerald",
        title: "Call with Northwind — SSO required before renewal",
        detail: "Flagged to manager. Renewal date: 30 Sep.",
      },
    ],
    blocker: {
      title: "Timezone bug from support ticket #4482",
      detail: "Not reproducible locally · needs production logs",
    },
    time: [
      ["Imports", "5h 05m"],
      ["Customer", "1h 00m"],
      ["Support", "50m"],
    ],
  },
];

const ROLES = [
  {
    name: "Employee",
    badge: "employee",
    line: "Log the day in 30 seconds, typed or spoken.",
    points: [
      "Voice-to-text brain dump, no formatting required",
      "Entry types for development, meetings, planning, bug fixes",
      "Personal insights on where the week actually went",
    ],
  },
  {
    name: "Manager",
    badge: "manager",
    line: "Read what the team did without asking anyone.",
    points: [
      "One digest per team, written from real entries",
      "Blockers surfaced with how long they've been open",
      "Drill into any direct report's history",
    ],
  },
  {
    name: "Admin",
    badge: "admin",
    line: "Run the org: people, roles, and access.",
    points: [
      "Add users, change roles, suspend or delete accounts",
      "Visual team map of who reports to whom",
      "Company-wide settings and integrations",
    ],
  },
];

const STEPS = [
  {
    n: "01",
    title: "Capture",
    body: "Someone taps the mic and talks for half a minute, or types a few lines. Whatever comes out is fine — fragments, tangents, half-sentences.",
  },
  {
    n: "02",
    title: "Synthesize",
    body: "A background service picks up the entry and runs it through a model that knows your projects, your people, and what you called things last week.",
  },
  {
    n: "03",
    title: "Report",
    body: "Out comes a structured daily report: what shipped, what's blocked, where the hours went — grouped by project instead of by whoever remembered to write it down.",
  },
  {
    n: "04",
    title: "Oversee",
    body: "Managers get a team rollup. Admins get org health, team structure, and access control. Nobody schedules a status meeting.",
  },
];

const FEATURES = [
  {
    icon: Mic,
    title: "Voice capture",
    body: "Speak the update. Transcription and cleanup happen on the way to the database.",
  },
  {
    icon: FileText,
    title: "Structured reports",
    body: "Daily and weekly markdown reports, grouped by project, with blockers pulled to the top.",
  },
  {
    icon: Users,
    title: "Team rollups",
    body: "Every direct report's week condensed into one page a manager can read before coffee.",
  },
  {
    icon: LayoutGrid,
    title: "Team map",
    body: "A live org chart built from reporting lines, not from a slide someone made in March.",
  },
  {
    icon: Lock,
    title: "Row-level security",
    body: "Access rules live in Postgres. An employee's entries are unreadable to anyone outside their line.",
  },
  {
    icon: Zap,
    title: "Fits the stack",
    body: "Next.js app, FastAPI worker, Supabase underneath. Deploy it beside what you already run.",
  },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

function RoleBadge({ kind, children }: { kind: string; children: React.ReactNode }) {
  return <span className={`px-badge px-badge-${kind}`}>{children}</span>;
}

function Tag({ tone = "neutral", children }: { tone?: string; children: React.ReactNode }) {
  return <span className={`px-tag px-tag-${tone}`}>{children}</span>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="px-dot" />
      <span className="px-mono px-faint text-[11px] uppercase tracking-[0.18em]">
        {children}
      </span>
    </div>
  );
}

function Waveform({ active }: { active: boolean }) {
  const bars = 34;
  return (
    <div className="flex h-10 items-center gap-[3px]" aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={`px-bar ${active ? "px-bar-live" : ""}`}
          style={{
            animationDelay: `${(i % 7) * 90}ms`,
            animationDuration: `${760 + ((i * 53) % 420)}ms`,
            height: `${18 + ((i * 37) % 22)}%`,
          }}
        />
      ))}
    </div>
  );
}

function TransformPanel() {
  const reduced = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"listening" | "thinking" | "report">("listening");
  const [spoken, setSpoken] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const scenario = SCENARIOS[idx];
  const words = scenario.raw.split(" ");

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const goTo = useCallback((n: number) => {
    clear();
    setIdx(n);
    setSpoken(0);
    setPhase("listening");
  }, []);

  useEffect(() => {
    if (reduced) {
      setSpoken(words.length);
      setPhase("report");
      return;
    }
    if (phase !== "listening") return;
    if (spoken >= words.length) {
      const t = setTimeout(() => setPhase("thinking"), 520);
      timers.current.push(t);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setSpoken((s) => s + 1), 52);
    timers.current.push(t);
    return () => clearTimeout(t);
  }, [phase, spoken, words.length, reduced]);

  useEffect(() => {
    if (reduced) return;
    if (phase === "thinking") {
      const t = setTimeout(() => setPhase("report"), 1000);
      timers.current.push(t);
      return () => clearTimeout(t);
    }
    if (phase === "report") {
      const t = setTimeout(() => {
        setIdx((i) => (i + 1) % SCENARIOS.length);
        setSpoken(0);
        setPhase("listening");
      }, 6800);
      timers.current.push(t);
      return () => clearTimeout(t);
    }
  }, [phase, reduced]);

  useEffect(() => clear, []);

  const listening = phase === "listening";
  const showReport = phase === "report";
  const transcript = reduced ? scenario.raw : words.slice(0, spoken).join(" ");

  return (
    <div className="px-card overflow-hidden">
      <div className="px-divide flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className={`px-live-dot ${listening ? "px-live-dot-on" : ""}`} />
          <span className="px-mono px-faint text-[11px] uppercase tracking-[0.16em]">
            {listening ? "Recording" : phase === "thinking" ? "Writing report" : "Report ready"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-mono px-faint text-[11px]">{scenario.date}</span>
          <div className="flex items-center gap-1.5">
            {SCENARIOS.map((s, i) => (
              <button
                key={s.date}
                onClick={() => goTo(i)}
                aria-label={`Show entry from ${s.date}`}
                className={`px-pip ${i === idx ? "px-pip-on" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2">
        <div className="px-inset px-divide flex flex-col gap-5 border-b p-6 md:border-b-0 md:border-r md:p-8">
          <div className="flex items-center justify-between">
            <span className="px-mono px-faint text-[11px] uppercase tracking-[0.16em]">What they said</span>
            <RoleBadge kind="employee">{scenario.who}</RoleBadge>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => goTo(idx)}
              aria-label="Restart the recording"
              className={`px-mic ${listening ? "px-mic-live" : ""}`}
            >
              {listening ? <Square className="h-4 w-4" strokeWidth={2.5} /> : <Mic className="h-4 w-4" strokeWidth={2.5} />}
            </button>
            <Waveform active={listening} />
          </div>
          <p className="px-mono min-h-[132px] text-[13px] leading-[1.75] text-[color:var(--text)]">
            {transcript}
            {listening && <span className="px-caret" />}
          </p>
          <p className="px-faint text-xs">No template, no formatting, no editing. That is the entire input.</p>
        </div>

        <div className="relative flex flex-col gap-4 p-6 md:p-8">
          <div className="flex items-center justify-between">
            <span className="px-mono px-faint text-[11px] uppercase tracking-[0.16em]">What their manager reads</span>
            <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
          </div>

          {!showReport ? (
            <div className="flex min-h-[240px] flex-col justify-center gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="px-skeleton" style={{ width: ["72%", "94%", "60%", "84%"][i], animationDelay: `${i * 140}ms` }} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[240px] flex-col gap-4">
              {scenario.lines.map((line, i) => (
                <div key={line.title} className="px-rise flex flex-col gap-1.5" style={{ animationDelay: `${i * 110}ms` }}>
                  <div className="flex items-center gap-2">
                    <Tag tone={line.tone}>{line.tag}</Tag>
                  </div>
                  <p className="text-[15px] font-semibold leading-snug tracking-[-0.01em]">{line.title}</p>
                  <p className="px-muted text-[13px] leading-relaxed">{line.detail}</p>
                </div>
              ))}
              <div className="px-rise px-blocker" style={{ animationDelay: `${scenario.lines.length * 110}ms` }}>
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-[13px] font-semibold">Blocked: {scenario.blocker.title}</p>
                  <p className="px-mono text-[11px] opacity-80">{scenario.blocker.detail}</p>
                </div>
              </div>
              <div className="px-rise px-divide flex flex-wrap gap-2 border-t pt-4" style={{ animationDelay: `${(scenario.lines.length + 1) * 110}ms` }}>
                {scenario.time.map(([label, value]) => (
                  <span key={label} className="px-chip">
                    <Clock className="h-3 w-3" />
                    {label}
                    <span className="px-mono px-faint">{value}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProofXLanding() {
  const [theme, setTheme] = useState("dark");

  return (
    <div data-theme={theme} className="px-root min-h-screen antialiased">
      <Styles />

      {/* nav */}
      <header className="px-divide sticky top-0 z-50 border-b px-nav">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="px-glyph"><span className="px-glyph-inner" /></span>
            <span className="text-[15px] font-bold tracking-[-0.02em]">ProofX</span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {[["How it works", "#how"], ["Roles", "#roles"], ["Features", "#features"], ["Security", "#security"]].map(([label, href]) => (
              <a key={href} href={href} className="px-navlink text-[13px]">{label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="px-icon-btn"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={2} /> : <Moon className="h-4 w-4" strokeWidth={2} />}
            </button>
            <a href="/login" className="px-btn px-btn-ghost hidden sm:inline-flex">Sign in</a>
            <a href="/login" className="px-btn px-btn-primary">Start free</a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* hero */}
        <section className="relative overflow-hidden">
          <div className="px-glow" aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-16 sm:px-8 sm:pt-24">
            <div className="max-w-3xl">
              <div className="px-eyebrow">
                <span className="px-live-dot px-live-dot-on" />
                Voice capture is live for every plan
              </div>
              <h1 className="mt-7 text-[40px] font-extrabold leading-[1.04] tracking-[-0.035em] sm:text-[62px]">
                Your team already did<br className="hidden sm:block" /> the work.{" "}
                <span className="px-muted-head">ProofX writes it down.</span>
              </h1>
              <p className="px-muted mt-6 max-w-xl text-[16px] leading-relaxed sm:text-[17px]">
                People talk about their day for thirty seconds. ProofX turns it into the daily report, the weekly rollup, and the blocker list — so status updates stop being a second job.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a href="/login" className="px-btn px-btn-primary px-btn-lg">
                  Start free <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </a>
                <a href="#panel" className="px-btn px-btn-ghost px-btn-lg">See a real entry</a>
              </div>
              <div className="px-faint mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
                {["Row-level security in Postgres", "SSO-ready", "Your entries never train a model"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* signature panel */}
        <section id="panel" className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
          <TransformPanel />
        </section>

        {/* how it works */}
        <section id="how" className="px-divide border-t">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <SectionLabel>The loop</SectionLabel>
            <h2 className="mt-5 max-w-2xl text-[30px] font-bold leading-[1.12] tracking-[-0.028em] sm:text-[38px]">
              Four steps, and only the first one costs anyone time.
            </h2>
            <div className="mt-12 grid gap-px px-grid sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s) => (
                <div key={s.n} className="px-step">
                  <span className="px-mono px-step-n">{s.n}</span>
                  <h3 className="mt-4 text-[17px] font-semibold tracking-[-0.015em]">{s.title}</h3>
                  <p className="px-muted mt-2.5 text-[13.5px] leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* roles */}
        <section id="roles" className="px-divide border-t">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <SectionLabel>Access</SectionLabel>
            <h2 className="mt-5 max-w-2xl text-[30px] font-bold leading-[1.12] tracking-[-0.028em] sm:text-[38px]">Three views of the same work.</h2>
            <p className="px-muted mt-4 max-w-xl text-[15px] leading-relaxed">Everyone sees exactly their slice — enforced in the database, not in the interface.</p>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {ROLES.map((r) => (
                <div key={r.name} className="px-card px-hover flex flex-col p-6">
                  <RoleBadge kind={r.badge}>{r.name}</RoleBadge>
                  <p className="mt-5 text-[17px] font-semibold leading-snug tracking-[-0.015em]">{r.line}</p>
                  <ul className="mt-6 flex flex-col gap-3">
                    {r.points.map((p) => (
                      <li key={p} className="flex gap-2.5">
                        <Check className="mt-[3px] h-3.5 w-3.5 shrink-0" strokeWidth={2.5} style={{ color: "var(--accent)" }} />
                        <span className="px-muted text-[13.5px] leading-relaxed">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* manager proof */}
        <section className="px-divide border-t">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2">
            <div>
              <SectionLabel>Monday morning</SectionLabel>
              <h2 className="mt-5 text-[30px] font-bold leading-[1.12] tracking-[-0.028em] sm:text-[38px]">The meeting you can delete.</h2>
              <p className="px-muted mt-5 max-w-md text-[15px] leading-relaxed">
                A manager opens one page and knows what six people shipped, what slipped, and who has been stuck since Thursday. No one prepared anything for it.
              </p>
              <a href="/login" className="px-link mt-7 inline-flex items-center gap-1.5 text-[14px] font-semibold">
                See a team digest <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
              </a>
            </div>
            <div className="px-card p-6">
              <div className="px-divide flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5" style={{ color: "var(--muted)" }} />
                  <span className="text-[13px] font-semibold">Platform team · week 33</span>
                </div>
                <RoleBadge kind="manager">Manager view</RoleBadge>
              </div>
              <div className="grid grid-cols-3 gap-4 py-5">
                {[["Entries", "41"], ["Shipped", "17"], ["Open blockers", "3"]].map(([l, v]) => (
                  <div key={l}>
                    <p className="text-[24px] font-bold tracking-[-0.03em]">{v}</p>
                    <p className="px-faint px-mono mt-1 text-[10px] uppercase tracking-[0.14em]">{l}</p>
                  </div>
                ))}
              </div>
              <div className="px-divide flex flex-col gap-3 border-t pt-4">
                {[
                  ["Dev Sharma", "Billing retries shipped", "on track"],
                  ["Priya Nair", "Design tokens — 2 days open", "blocked"],
                  ["Marcus Reid", "CSV importer in review", "on track"],
                ].map(([name, note, state]) => (
                  <div key={name} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="px-avatar">{name[0]}</span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium">{name}</p>
                        <p className="px-faint truncate text-[12px]">{note}</p>
                      </div>
                    </div>
                    <Tag tone={state === "blocked" ? "amber" : "emerald"}>{state}</Tag>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* features */}
        <section id="features" className="px-divide border-t">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <SectionLabel>What&apos;s in the box</SectionLabel>
            <h2 className="mt-5 max-w-2xl text-[30px] font-bold leading-[1.12] tracking-[-0.028em] sm:text-[38px]">Built for the work, not the reporting on it.</h2>
            <div className="mt-12 grid gap-px px-grid sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div key={title} className="px-step">
                  <Icon className="h-4 w-4" strokeWidth={2} style={{ color: "var(--accent)" }} />
                  <h3 className="mt-4 text-[16px] font-semibold tracking-[-0.015em]">{title}</h3>
                  <p className="px-muted mt-2 text-[13.5px] leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* security */}
        <section id="security" className="px-divide border-t">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <div className="px-card flex flex-col gap-8 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <ShieldCheck className="h-5 w-5" style={{ color: "var(--accent-2)" }} />
                <h2 className="mt-5 text-[26px] font-bold leading-tight tracking-[-0.025em] sm:text-[30px]">Daily logs are sensitive. We treat them that way.</h2>
                <p className="px-muted mt-4 text-[15px] leading-relaxed">
                  Every row carries its owner and reporting line. Postgres row-level security decides who can read it, so a broken query or a stray API route can&apos;t hand an employee&apos;s entries to the wrong person.
                </p>
              </div>
              <ul className="flex shrink-0 flex-col gap-3">
                {["Row-level security on every table", "Roles: employee, manager, admin", "Suspension revokes access instantly", "Export or delete a user's data on request"].map((t) => (
                  <li key={t} className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} style={{ color: "var(--accent-2)" }} />
                    <span className="text-[13.5px]">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="start" className="px-divide border-t">
          <div className="mx-auto max-w-6xl px-5 py-24 text-center sm:px-8">
            <h2 className="mx-auto max-w-2xl text-[34px] font-extrabold leading-[1.08] tracking-[-0.032em] sm:text-[46px]">Start with one week of logs.</h2>
            <p className="px-muted mx-auto mt-5 max-w-md text-[15px] leading-relaxed">
              Bring in a single team. If Friday&apos;s rollup isn&apos;t more useful than your standup notes, walk away — nothing to migrate back.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a href="/login" className="px-btn px-btn-primary px-btn-lg">
                Start free <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </a>
              <a href="/login" className="px-btn px-btn-ghost px-btn-lg">Talk to us</a>
            </div>
            <p className="px-faint mt-6 text-[12px]">Free for up to 10 people. No card.</p>
          </div>
        </section>
      </main>

      {/* footer */}
      <footer className="px-divide border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="px-glyph"><span className="px-glyph-inner" /></span>
            <span className="text-[13px] font-bold tracking-[-0.02em]">ProofX</span>
            <span className="px-faint px-mono text-[11px]">Work intelligence</span>
          </div>
          <div className="px-faint flex flex-wrap gap-x-6 gap-y-2 text-[12px]">
            {["Privacy", "Terms", "Security", "Status", "Docs"].map((l) => (
              <a key={l} href="#top" className="px-navlink">{l}</a>
            ))}
          </div>
          <p className="px-faint px-mono text-[11px]">© 2026 ProofX</p>
        </div>
      </footer>
    </div>
  );
}

function Styles() {
  return (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

[data-theme="dark"]{
  --bg:#08080A;--bg-2:#0B0B0E;--surface:#101014;--surface-2:#17171C;--border:#232329;
  --text:#FAFAFA;--muted:#9B9BA6;--muted-head:#5E5E6B;--faint:#6E6E7A;
  --accent:#818CF8;--accent-soft:rgba(129,140,248,.14);
  --accent-2:#34D399;--accent-2-soft:rgba(52,211,153,.14);
  --amber:#FBBF24;--amber-soft:rgba(251,191,36,.13);
  --inv-bg:#FAFAFA;--inv-bg-hover:#FFFFFF;--inv-text:#09090B;
  --nav-bg:rgba(8,8,10,.72);--neutral-soft:rgba(255,255,255,.06);
  --shadow:0 1px 2px rgba(0,0,0,.4);
  --glow:radial-gradient(60% 55% at 18% 0%, rgba(99,102,241,.16), transparent 70%);
  --avatar:#1D1D23;
}
[data-theme="light"]{
  --bg:#FFFFFF;--bg-2:#FAFAFA;--surface:#FFFFFF;--surface-2:#F4F4F5;--border:#E4E4E7;
  --text:#09090B;--muted:#52525B;--muted-head:#A1A1AA;--faint:#71717A;
  --accent:#4F46E5;--accent-soft:rgba(79,70,229,.09);
  --accent-2:#059669;--accent-2-soft:rgba(5,150,105,.10);
  --amber:#B45309;--amber-soft:rgba(180,83,9,.10);
  --inv-bg:#18181B;--inv-bg-hover:#000000;--inv-text:#FFFFFF;
  --nav-bg:rgba(255,255,255,.78);--neutral-soft:rgba(9,9,11,.05);
  --shadow:0 1px 2px rgba(9,9,11,.06);
  --glow:radial-gradient(60% 55% at 18% 0%, rgba(79,70,229,.09), transparent 70%);
  --avatar:#F4F4F5;
}

.px-root{background:var(--bg);color:var(--text);font-family:'Inter','Geist',system-ui,-apple-system,sans-serif;transition:background-color .25s ease,color .25s ease;}
.px-root *:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:4px;}
.px-mono{font-family:'JetBrains Mono','Geist Mono',ui-monospace,SFMono-Regular,monospace;}
.px-muted{color:var(--muted);}.px-faint{color:var(--faint);}.px-muted-head{color:var(--muted-head);}
.px-divide{border-color:var(--border);}
.px-nav{background:var(--nav-bg);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);}
.px-navlink{color:var(--muted);text-decoration:none;transition:color .15s ease;}.px-navlink:hover{color:var(--text);}
.px-link{color:var(--text);text-decoration:none;}.px-link:hover{color:var(--accent);}
.px-glyph{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:6px;background:var(--inv-bg);}
.px-glyph-inner{width:7px;height:7px;border-radius:2px;background:var(--inv-text);}
.px-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:36px;padding:0 14px;border-radius:6px;font-size:13px;font-weight:600;letter-spacing:-.01em;text-decoration:none;white-space:nowrap;transition:background-color .18s ease,border-color .18s ease,color .18s ease,transform .18s ease;}
.px-btn-lg{height:44px;padding:0 20px;font-size:14px;}
.px-btn-primary{background:var(--inv-bg);color:var(--inv-text);border:1px solid transparent;}.px-btn-primary:hover{background:var(--inv-bg-hover);transform:translateY(-1px);}
.px-btn-ghost{background:transparent;color:var(--text);border:1px solid var(--border);}.px-btn-ghost:hover{background:var(--surface-2);border-color:var(--faint);}
.px-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:background-color .18s ease,color .18s ease;}.px-icon-btn:hover{background:var(--surface-2);color:var(--text);}
.px-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow);}
.px-hover{transition:border-color .2s ease,transform .2s ease;}.px-hover:hover{border-color:var(--faint);transform:translateY(-2px);}
.px-inset{background:var(--bg-2);}
.px-eyebrow{display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border:1px solid var(--border);border-radius:999px;background:var(--surface);font-size:12px;font-weight:500;color:var(--muted);}
.px-dot{width:5px;height:5px;border-radius:999px;background:var(--accent);}
.px-badge{display:inline-flex;align-items:center;gap:6px;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:600;letter-spacing:.01em;border:1px solid;}
.px-badge-employee{color:var(--accent-2);background:var(--accent-2-soft);border-color:var(--accent-2-soft);}
.px-badge-manager{color:var(--accent);background:var(--accent-soft);border-color:var(--accent-soft);}
.px-badge-admin{color:var(--muted);background:var(--neutral-soft);border-color:var(--border);}
.px-tag{display:inline-flex;align-items:center;padding:2px 8px;border-radius:5px;font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;}
.px-tag-neutral{color:var(--muted);background:var(--neutral-soft);}
.px-tag-indigo{color:var(--accent);background:var(--accent-soft);}
.px-tag-emerald{color:var(--accent-2);background:var(--accent-2-soft);}
.px-tag-amber{color:var(--amber);background:var(--amber-soft);}
.px-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border:1px solid var(--border);border-radius:999px;font-size:11.5px;color:var(--muted);}
.px-blocker{display:flex;gap:10px;padding:12px;border-radius:8px;color:var(--amber);background:var(--amber-soft);border:1px solid var(--amber-soft);}
.px-avatar{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px;background:var(--avatar);border:1px solid var(--border);font-size:11px;font-weight:700;color:var(--muted);}
.px-grid{background:var(--border);border:1px solid var(--border);border-radius:12px;overflow:hidden;}
.px-step{background:var(--bg);padding:26px 22px;}
.px-step-n{font-size:11px;letter-spacing:.16em;color:var(--faint);}
.px-glow{position:absolute;inset:0;background:var(--glow);pointer-events:none;}
.px-mic{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:999px;border:1px solid var(--border);background:var(--surface);color:var(--muted);cursor:pointer;transition:all .2s ease;flex-shrink:0;}
.px-mic:hover{color:var(--text);border-color:var(--faint);}
.px-mic-live{background:var(--accent);border-color:var(--accent);color:#fff;box-shadow:0 0 0 4px var(--accent-soft);}
.px-bar{display:block;width:2px;border-radius:2px;background:var(--border);transform-origin:center;}
.px-bar-live{background:var(--accent);animation-name:pxBar;animation-iteration-count:infinite;animation-timing-function:ease-in-out;}
@keyframes pxBar{0%,100%{transform:scaleY(.35);}50%{transform:scaleY(2.6);}}
.px-caret{display:inline-block;width:7px;height:14px;margin-left:2px;vertical-align:-2px;background:var(--accent);animation:pxBlink 1s steps(2) infinite;}
@keyframes pxBlink{0%,49%{opacity:1}50%,100%{opacity:0}}
.px-live-dot{width:6px;height:6px;border-radius:999px;background:var(--faint);display:inline-block;}
.px-live-dot-on{background:var(--accent-2);box-shadow:0 0 0 3px var(--accent-2-soft);animation:pxPulse 2s ease-in-out infinite;}
@keyframes pxPulse{0%,100%{opacity:1}50%{opacity:.55}}
.px-pip{width:16px;height:3px;border-radius:2px;background:var(--border);border:0;padding:0;cursor:pointer;transition:background-color .2s ease;}
.px-pip-on{background:var(--accent);}
.px-skeleton{height:11px;border-radius:5px;background:linear-gradient(90deg,var(--surface-2) 0%,var(--border) 50%,var(--surface-2) 100%);background-size:200% 100%;animation:pxShimmer 1.3s linear infinite;}
@keyframes pxShimmer{0%{background-position:120% 0}100%{background-position:-120% 0}}
.px-rise{animation:pxRise .45s cubic-bezier(.16,1,.3,1) both;}
@keyframes pxRise{from{opacity:0;transform:translateY(8px) scale(.985);}to{opacity:1;transform:none;}}
@media (prefers-reduced-motion: reduce){.px-root *,.px-root *::before,.px-root *::after{animation-duration:.001ms !important;animation-iteration-count:1 !important;transition-duration:.001ms !important;}}
`}</style>
  );
}
