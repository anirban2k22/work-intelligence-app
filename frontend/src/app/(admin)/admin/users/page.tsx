import { createClient } from "@/lib/supabase/server";
import { Users } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Users | ProofX Admin" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name, display_name, role, status, department, created_at")
    .order("created_at", { ascending: false });

  // Get emails from auth.users — we join via user_id
  const { data: authUsers } = await supabase
    .from("users")
    .select("id, email");

  const emailMap: Record<string, string> = {};
  (authUsers ?? []).forEach((u: any) => { emailMap[u.id] = u.email; });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{profiles?.length ?? 0} total accounts</p>
        </div>
        <Link
          href="/admin/users/new"
          className="bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-black transition-colors flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          New User
        </Link>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(profiles ?? []).map((p) => {
              const name = p.full_name ?? p.display_name ?? "—";
              const initials = name.slice(0, 2).toUpperCase();
              return (
                <tr key={p.user_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{name}</p>
                        <p className="text-xs text-gray-400">{emailMap[p.user_id] ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                      p.role === "admin" ? "bg-gray-900 text-white" :
                      p.role === "manager" ? "bg-blue-100 text-blue-700" :
                      "bg-green-100 text-green-700"
                    }`}>{p.role ?? "employee"}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{p.department ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                      p.status === "active" ? "bg-emerald-100 text-emerald-700" :
                      p.status === "invited" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>{p.status ?? "active"}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
