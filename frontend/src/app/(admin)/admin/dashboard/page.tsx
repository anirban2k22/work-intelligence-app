import { createClient } from "@/lib/supabase/server";
import { Users, UserCheck, AlertCircle, Activity } from "lucide-react";

export const metadata = { title: "Admin Dashboard | ProofX" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("role, status, full_name, display_name, created_at, user_id");

  const { data: authUsers } = await supabase
    .from("users")
    .select("id, email");

  const emailMap: Record<string, string> = {};
  (authUsers ?? []).forEach((u: any) => { emailMap[u.id] = u.email; });

  if (error) {
    console.error("Error fetching profiles:", error);
  }

  const safeProfiles = profiles ?? [];
  const total = safeProfiles.length;
  const admins = safeProfiles.filter(p => p.role === "admin").length;
  const managers = safeProfiles.filter(p => p.role === "manager").length;
  const employees = safeProfiles.filter(p => p.role === "employee").length;
  const active = safeProfiles.filter(p => p.status === "active").length;
  const invited = safeProfiles.filter(p => p.status === "invited").length;

  // Recent work entries (last 7 days)
  const sevenAgo = new Date(Date.now() - 7 * 86400000).toLocaleDateString("en-CA");
  const { data: recentEntries } = await supabase
    .from("work_entries")
    .select("user_id, work_date, summary, entry_type")
    .gte("work_date", sevenAgo)
    .order("work_date", { ascending: false })
    .limit(10);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Organization overview and activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: total, icon: Users, color: "bg-gray-900 text-white" },
          { label: "Managers", value: managers, icon: UserCheck, color: "bg-blue-600 text-white" },
          { label: "Employees", value: employees, icon: Users, color: "bg-green-600 text-white" },
          { label: "Pending Invites", value: invited, icon: AlertCircle, color: "bg-amber-500 text-white" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border rounded-xl p-5 flex flex-col gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* All Users table */}
      <div className="bg-white border rounded-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">All Users</h2>
          <a href="/admin/users/new" className="text-xs font-semibold bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-black transition-colors">
            + New User
          </a>
        </div>
        <div className="divide-y">
          {(profiles ?? []).map((p, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                  {(p.full_name ?? p.display_name ?? "U").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.full_name ?? p.display_name ?? "—"}</p>
                  <p className="text-xs text-gray-500">{emailMap[p.user_id] ?? "No email"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                  p.role === "admin" ? "bg-gray-900 text-white" :
                  p.role === "manager" ? "bg-blue-100 text-blue-700" :
                  "bg-green-100 text-green-700"
                }`}>{p.role ?? "employee"}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                  p.status === "active" ? "bg-emerald-100 text-emerald-700" :
                  p.status === "invited" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                }`}>{p.status ?? "active"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {recentEntries && recentEntries.length > 0 && (
        <div className="bg-white border rounded-xl">
          <div className="flex items-center gap-2 px-6 py-4 border-b">
            <Activity className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Recent Submissions (Last 7 Days)</h2>
          </div>
          <div className="divide-y">
            {recentEntries.map((e, i) => (
              <div key={i} className="px-6 py-3 flex items-center justify-between">
                <p className="text-sm text-gray-700 truncate max-w-md">{e.summary}</p>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded capitalize">{e.entry_type}</span>
                  <span className="text-xs text-gray-400">{e.work_date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
