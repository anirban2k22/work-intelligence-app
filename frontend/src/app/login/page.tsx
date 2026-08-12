"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

      // Fetch role to redirect to the right dashboard
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication failed.");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, temp_password_used")
        .eq("user_id", user.id)
        .single();

      // Force password change if using temp password
      if (profile?.temp_password_used) {
        router.push("/change-password");
        return;
      }

      const role = profile?.role ?? "employee";
      router.push(ROLE_HOME[role] ?? "/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message === "Invalid login credentials"
        ? "Incorrect email or password. Please try again."
        : err.message || "Failed to sign in.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f2f2] flex items-center justify-center">
      <div className="w-full max-w-sm px-4">
        {/* Wordmark */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-[#1a1a1a] uppercase">
            Proof<em className="font-black italic not-italic" style={{ fontStyle: "italic" }}>X</em>
          </h1>
          <div className="border-t-2 border-[#1a1a1a] mt-3 pt-3">
            <p className="text-sm text-[#666]">Work Intelligence Platform</p>
          </div>
        </div>

        {/* Sign in card */}
        <div className="bg-white border-2 border-[#1a1a1a] p-8">
          <h2 className="text-base font-semibold text-[#1a1a1a] mb-1">Sign in</h2>
          <p className="text-sm text-[#666] mb-6">Use your email and password to continue.</p>

          {error && (
            <p className="text-sm text-red-600 mb-4 border border-red-200 bg-red-50 px-3 py-2">
              {error}
            </p>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border-2 border-[#1a1a1a] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full border-2 border-[#1a1a1a] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border-2 border-[#1a1a1a] px-4 py-3 text-sm font-medium text-white bg-[#1a1a1a] hover:bg-black transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-xs text-[#999] leading-relaxed border-t border-gray-100 pt-6">
            Access is by invitation only. Contact your administrator if you need an account.
          </p>
        </div>

        <p className="mt-6 text-xs text-[#999] text-center">ProofX · v0.1</p>
      </div>
    </div>
  );
}
