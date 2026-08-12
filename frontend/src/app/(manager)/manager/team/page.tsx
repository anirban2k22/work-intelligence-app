import { createClient } from "@/lib/supabase/server";
import { Users } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "My Team | ProofX" };
export const dynamic = "force-dynamic";

export default async function ManagerTeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get assigned employees
  const { data: mappings } = await supabase
    .from("employee_manager_map")
    .select("employee_id")
    .eq("manager_id", user.id);

  const employeeIds = (mappings ?? []).map(m => m.employee_id);

  const { data: employees } = employeeIds.length > 0
    ? await supabase.from("profiles").select("user_id, full_name, display_name, department, status, created_at").in("user_id", employeeIds)
    : { data: [] };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-gray-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Team</h1>
            <p className="text-sm text-gray-500 mt-1">{employeeIds.length} team members assigned to you</p>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        {(!employees || employees.length === 0) ? (
          <div className="p-8 text-center text-gray-400">
            You don&apos;t have any employees assigned to you yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {employees.map((p) => {
                const name = p.full_name ?? p.display_name ?? "—";
                const initials = name.slice(0, 2).toUpperCase();
                return (
                  <tr key={p.user_id} className="hover:bg-gray-50 transition-colors group relative cursor-pointer">
                    <td className="px-6 py-4">
                      <Link href={`/manager/team/${p.user_id}`} className="absolute inset-0 z-10" />
                      <div className="flex items-center gap-3 relative z-20">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 relative z-20">{p.department ?? "—"}</td>
                    <td className="px-6 py-4 relative z-20">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                        p.status === "active" ? "bg-emerald-100 text-emerald-700" :
                        p.status === "invited" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>{p.status ?? "active"}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs relative z-20">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
