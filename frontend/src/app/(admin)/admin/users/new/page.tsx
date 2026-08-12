"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Copy, CheckCircle2 } from "lucide-react";

const TEMP_PASSWORD = "12345678";

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<{ email: string; name: string; role: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    role: "employee",
    department: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Use Supabase admin endpoint via our backend API
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch("http://localhost:8000/api/v1/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: form.email,
          full_name: form.full_name,
          role: form.role,
          department: form.department,
          temp_password: TEMP_PASSWORD,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to create user.");
      }

      setCreatedUser({ email: form.email, name: form.full_name, role: form.role });
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(TEMP_PASSWORD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (createdUser) {
    return (
      <div className="max-w-md">
        <div className="bg-white border rounded-xl p-8 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">User Created</p>
              <p className="text-sm text-gray-500">{createdUser.name} ({createdUser.role})</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-amber-800 mb-1 uppercase tracking-wide">Temporary Password</p>
            <div className="flex items-center gap-2 mt-2">
              <code className="text-lg font-mono font-bold text-amber-900 flex-1">{TEMP_PASSWORD}</code>
              <button onClick={copyPassword} className="p-2 hover:bg-amber-100 rounded-md transition-colors">
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-amber-700" />}
              </button>
            </div>
            <p className="text-xs text-amber-700 mt-2">
              Share <strong>{createdUser.email}</strong> and this password with the user. They will be asked to change it on first login.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setCreatedUser(null)}
              className="flex-1 border-2 border-gray-900 text-gray-900 py-2.5 text-sm font-semibold rounded-md hover:bg-gray-50 transition-colors"
            >
              Create Another
            </button>
            <button
              onClick={() => router.push("/admin/users")}
              className="flex-1 bg-gray-900 text-white py-2.5 text-sm font-semibold rounded-md hover:bg-black transition-colors"
            >
              View All Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
        <p className="text-sm text-gray-500 mt-1">Add a new manager or employee to ProofX.</p>
      </div>

      <div className="bg-white border rounded-xl p-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name *</label>
            <input
              name="full_name" value={form.full_name} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Anirban Das"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Work Email *</label>
            <input
              name="email" type="email" value={form.email} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="anirban@company.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Role *</label>
            <select
              name="role" value={form.role} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Department</label>
            <input
              name="department" value={form.department} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Engineering, Product, Sales…"
            />
          </div>

          <div className="bg-gray-50 border rounded-lg px-4 py-3">
            <p className="text-xs text-gray-500">
              A temporary password <code className="font-mono font-bold text-gray-700">{TEMP_PASSWORD}</code> will be assigned.
              The user will be prompted to change it on first login.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 text-sm font-semibold rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating…" : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
}
