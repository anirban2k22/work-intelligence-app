import { createClient } from "@/lib/supabase/server";
import { Users, Clock, AlertCircle, CheckSquare } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Team Dashboard | ProofX" };
export const dynamic = "force-dynamic";

export default async function ManagerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get assigned employees
  const { data: mappings } = await supabase
    .from("employee_manager_map")
    .select("employee_id")
    .eq("manager_id", user.id);

  const employeeIds = (mappings ?? []).map(m => m.employee_id);

  // Get employee profiles
  const { data: employees } = employeeIds.length > 0
    ? await supabase.from("profiles").select("user_id, full_name, display_name, department").in("user_id", employeeIds)
    : { data: [] };

  // Get today's entries from all assigned employees
  const today = new Date().toLocaleDateString("en-CA");
  const sevenAgo = new Date(Date.now() - 7 * 86400000).toLocaleDateString("en-CA");

  const { data: recentEntries } = employeeIds.length > 0
    ? await supabase
        .from("work_entries")
        .select("user_id, summary, entry_type, hours, work_date, created_at")
        .in("user_id", employeeIds)
        .gte("work_date", sevenAgo)
        .order("work_date", { ascending: false })
    : { data: [] };

  const todayEntries = (recentEntries ?? []).filter(e => e.work_date === today);
  const submittedToday = new Set(todayEntries.map(e => e.user_id)).size;
  const totalHoursToday = todayEntries.reduce((s, e) => s + parseFloat(e.hours || 0), 0);
  const missingToday = employeeIds.length - submittedToday;

  const profileMap: Record<string, string> = {};
  (employees ?? []).forEach((p: any) => {
    profileMap[p.user_id] = p.full_name ?? p.display_name ?? "Unknown";
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Monitoring {employeeIds.length} assigned employee{employeeIds.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Team Size", value: employeeIds.length, icon: Users, color: "bg-gray-900 text-white" },
          { label: "Submitted Today", value: submittedToday, icon: CheckSquare, color: "bg-green-600 text-white" },
          { label: "Missing Update", value: missingToday, icon: AlertCircle, color: missingToday > 0 ? "bg-red-500 text-white" : "bg-gray-200 text-gray-500" },
          { label: "Hours Logged Today", value: `${totalHoursToday.toFixed(1)}h`, icon: Clock, color: "bg-blue-600 text-white" },
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

      {/* Team members */}
      <div className="bg-white border rounded-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Team Members</h2>
          <Link href="/manager/team" className="text-xs text-blue-600 hover:underline font-medium">
            View All →
          </Link>
        </div>
        {(employees ?? []).length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">
            No employees assigned yet. Ask your admin to assign your team.
          </div>
        ) : (
          <div className="divide-y">
            {(employees ?? []).map((emp: any) => {
              const submitted = todayEntries.some(e => e.user_id === emp.user_id);
              return (
                <Link key={emp.user_id} href={`/manager/team/${emp.user_id}`}
                  className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                      {(emp.full_name ?? emp.display_name ?? "U").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{emp.full_name ?? emp.display_name ?? "—"}</p>
                      {emp.department && <p className="text-xs text-gray-400">{emp.department}</p>}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${submitted ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {submitted ? "✓ Submitted today" : "Missing update"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent team activity */}
      {(recentEntries ?? []).length > 0 && (
        <div className="bg-white border rounded-xl">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-gray-900">Recent Team Activity</h2>
          </div>
          <div className="divide-y">
            {(recentEntries ?? []).slice(0, 8).map((e, i) => (
              <div key={i} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                    {profileMap[e.user_id]?.slice(0, 2).toUpperCase() ?? "?"}
                  </div>
                  <p className="text-sm text-gray-700 truncate max-w-sm">{e.summary}</p>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded capitalize">{e.entry_type}</span>
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
