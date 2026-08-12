"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Loader2, AlertCircle, Sparkles, Check } from "lucide-react";

const ROLE_HOME: Record<string, string> = {
  admin: "/admin/dashboard",
  manager: "/manager/dashboard",
  employee: "/dashboard",
};

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication failed.");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, temp_password_used")
        .eq("user_id", user.id)
        .single();

      if (profile?.temp_password_used) {
        router.push("/change-password");
        return;
      }

      const role = profile?.role ?? "employee";
      router.push(ROLE_HOME[role] ?? "/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(
        err.message === "Invalid login credentials"
          ? "Incorrect email or password. Please try again."
          : err.message || "Failed to sign in."
      );
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        .login-root {
          min-height: 100vh;
          background: #08080A;
          color: #FAFAFA;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          display: flex;
        }

        /* Left panel — branding + social proof */
        .login-left {
          display: none;
          position: relative;
          flex: 1;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          background: #0B0B0E;
          border-right: 1px solid #232329;
          overflow: hidden;
        }
        @media (min-width: 1024px) { .login-left { display: flex; } }

        .login-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(55% 45% at 20% 10%, rgba(99,102,241,.18), transparent 70%);
          pointer-events: none;
        }

        .login-grid-bg {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(35,35,41,.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(35,35,41,.5) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse 80% 80% at 20% 20%, black 30%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 80% at 20% 20%, black 30%, transparent 100%);
        }

        .login-logo {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1;
        }
        .login-logo-glyph {
          width: 28px; height: 28px; border-radius: 8px;
          background: #FAFAFA;
          display: flex; align-items: center; justify-content: center;
        }
        .login-logo-glyph-inner {
          width: 10px; height: 10px; border-radius: 3px; background: #08080A;
        }

        .login-hero {
          position: relative;
          z-index: 1;
        }
        .login-hero h2 {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1.08;
          color: #FAFAFA;
          margin-bottom: 20px;
        }
        .login-hero p {
          font-size: 15px;
          color: #9B9BA6;
          line-height: 1.65;
          max-width: 380px;
        }

        .login-proof {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .login-proof-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13.5px;
          color: #9B9BA6;
          line-height: 1.5;
        }
        .login-proof-item .check-icon {
          width: 16px; height: 16px;
          color: #34D399;
          margin-top: 1px;
          flex-shrink: 0;
        }

        /* Right panel — form */
        .login-right {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          flex: 1;
          padding: 32px 24px;
          min-height: 100vh;
          position: relative;
        }
        .login-right::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(40% 40% at 80% 80%, rgba(129,140,248,.06), transparent 70%);
          pointer-events: none;
        }

        /* Mobile logo */
        .login-mobile-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 40px;
        }
        @media (min-width: 1024px) { .login-mobile-logo { display: none; } }

        .login-card {
          position: relative;
          width: 100%;
          max-width: 400px;
          z-index: 1;
        }

        .login-card-header {
          margin-bottom: 32px;
        }
        .login-card-header h1 {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.025em;
          color: #FAFAFA;
          margin-bottom: 6px;
        }
        .login-card-header p {
          font-size: 14px;
          color: #6E6E7A;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .login-label {
          font-size: 12px;
          font-weight: 600;
          color: #9B9BA6;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .login-input {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          background: #101014;
          border: 1px solid #232329;
          border-radius: 8px;
          color: #FAFAFA;
          font-size: 14px;
          font-family: inherit;
          transition: border-color .18s ease, box-shadow .18s ease;
          outline: none;
          box-sizing: border-box;
        }
        .login-input::placeholder { color: #3E3E4A; }
        .login-input:focus {
          border-color: #818CF8;
          box-shadow: 0 0 0 3px rgba(129,140,248,.12);
        }

        .login-btn {
          width: 100%;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #FAFAFA;
          color: #09090B;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background-color .18s ease, transform .18s ease;
          margin-top: 4px;
        }
        .login-btn:hover:not(:disabled) {
          background: #FFFFFF;
          transform: translateY(-1px);
        }
        .login-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .login-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          background: rgba(239,68,68,.08);
          border: 1px solid rgba(239,68,68,.2);
          border-radius: 8px;
          font-size: 13px;
          color: #FCA5A5;
          line-height: 1.5;
        }
        .login-error svg { flex-shrink: 0; margin-top: 1px; }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #3E3E4A;
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .login-divider::before, .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #232329;
        }

        .login-footer {
          margin-top: 28px;
          font-size: 12px;
          color: #3E3E4A;
          text-align: center;
          line-height: 1.6;
        }
        .login-footer a {
          color: #6E6E7A;
          text-decoration: none;
          transition: color .15s ease;
        }
        .login-footer a:hover { color: #FAFAFA; }

        .login-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(129,140,248,.1);
          border: 1px solid rgba(129,140,248,.2);
          border-radius: 999px;
          font-size: 11px;
          color: #818CF8;
          font-weight: 500;
          margin-bottom: 20px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin { animation: spin .8s linear infinite; }
      `}</style>

      <div className="login-root">
        {/* ── Left branding panel ── */}
        <div className="login-left">
          <div className="login-glow" />
          <div className="login-grid-bg" />

          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo-glyph">
              <div className="login-logo-glyph-inner" />
            </div>
            <span style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.02em" }}>ProofX</span>
          </div>

          {/* Hero copy */}
          <div className="login-hero">
            <h2>
              Your team already did the work.<br />
              We write it down.
            </h2>
            <p>
              30 seconds of voice or text. ProofX turns it into structured daily reports, team rollups, and blocker lists — automatically.
            </p>
          </div>

          {/* Social proof bullets */}
          <div className="login-proof">
            {[
              "Row-level security on every table — enforced in Postgres",
              "AI summaries that never train a model on your data",
              "Roles for employees, managers, and admins with instant revocation",
            ].map((t) => (
              <div key={t} className="login-proof-item">
                <Check className="check-icon" strokeWidth={2.5} />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="login-right">
          {/* Mobile logo */}
          <div className="login-mobile-logo">
            <div className="login-logo-glyph" style={{ width: 24, height: 24, borderRadius: 6 }}>
              <div className="login-logo-glyph-inner" style={{ width: 8, height: 8 }} />
            </div>
            <span style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.02em", color: "#FAFAFA" }}>ProofX</span>
          </div>

          <div className="login-card">
            <div className="login-badge">
              <Sparkles style={{ width: 11, height: 11 }} />
              Work Intelligence Platform
            </div>

            <div className="login-card-header">
              <h1>Welcome back</h1>
              <p>Sign in to your workspace to continue.</p>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              {error && (
                <div className="login-error">
                  <AlertCircle style={{ width: 15, height: 15 }} />
                  <span>{error}</span>
                </div>
              )}

              <div className="login-field">
                <label className="login-label" htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="login-input"
                  placeholder="name@company.com"
                />
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="login-input"
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? (
                  <><Loader2 style={{ width: 15, height: 15 }} className="spin" /> Signing in…</>
                ) : (
                  <>Sign in <ArrowRight style={{ width: 15, height: 15 }} strokeWidth={2.5} /></>
                )}
              </button>
            </form>

            <div className="login-divider" style={{ marginTop: 28 }}>Access is by invitation</div>

            <div className="login-footer">
              Don&apos;t have an account?{" "}
              <a href="mailto:admin@proofx.io">Contact your administrator</a>
              <br /><br />
              <a href="/home">← Back to ProofX</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
