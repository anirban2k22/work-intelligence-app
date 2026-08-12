"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Update password in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;

      // Mark temp_password_used = false in profiles
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ temp_password_used: false })
          .eq("user_id", user.id);

        // Get role for redirect
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        const roleHome: Record<string, string> = {
          admin: "/admin/dashboard",
          manager: "/manager/dashboard",
          employee: "/dashboard",
        };

        router.push(roleHome[profile?.role ?? "employee"] ?? "/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f2f2] flex items-center justify-center">
      <div className="w-full max-w-sm px-4">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Set Your Password</h1>
          <p className="text-sm text-gray-500 mt-1">You&apos;re using a temporary password. Please set a new one to continue.</p>
        </div>

        <div className="bg-white border-2 border-[#1a1a1a] p-8">
          {error && (
            <p className="text-sm text-red-600 mb-4 border border-red-200 bg-red-50 px-3 py-2">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full border-2 border-[#1a1a1a] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
                placeholder="Minimum 8 characters"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full border-2 border-[#1a1a1a] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
                placeholder="Repeat your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1a1a] text-white py-3 text-sm font-semibold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Saving…" : "Set Password & Continue"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-xs text-center text-gray-400">ProofX · Secure Password Change</p>
      </div>
    </div>
  );
}
