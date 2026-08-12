import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, CheckSquare, Target } from "lucide-react";

export const dynamic = "force-dynamic";

const ENTRY_TYPE_COLOR: Record<string, string> = {
  meeting: "bg-blue-500",
  deliverable: "bg-green-500",
  bug: "bg-amber-500",
  feature: "bg-purple-500",
  documentation: "bg-cyan-500",
  learning: "bg-indigo-500",
  other: "bg-gray-400",
};

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Verify this manager is assigned to this employee
  const { data: mapping } = await supabase
    .from("employee_manager_map")
    .select("id")
    .eq("manager_id", user.id)
    .eq("employee_id", params.id)
    .single();

  // If not assigned (or if Admin is viewing, we'd skip this, but for now strict check)
  // Need to check if user is admin or if they are the assigned manager
  const { data: managerProfile } = await supabase.from("profiles").select("role").eq("user_id", user.id).single();
  const isAdmin = managerProfile?.role === "admin";
  
  if (!mapping && !isAdmin) {
    return notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, display_name, department, status, created_at")
    .eq("user_id", params.id)
    .single();

  if (!profile) return notFound();

  // Fetch recent work entries
  const sevenAgo = new Date(Date.now() - 7 * 86400000).toLocaleDateString("en-CA");
  const { data: entries } = await supabase
    .from("work_entries")
    .select("*, kras(name)")
    .eq("user_id", params.id)
    .gte("work_date", sevenAgo)
    .order("work_date", { ascending: false })
    .order("created_at", { ascending: false });

  // Fetch KRAs
  const { data: kras } = await supabase
    .from("kras")
    .select("*")
    .eq("user_id", params.id)
    .eq("is_active", true);

  const name = profile.full_name ?? profile.display_name ?? "Unknown";

  let entriesByDate: Record<string, any[]> = {};
  let totalHours = 0;

  if (entries && entries.length > 0) {
    for (const e of entries) {
      if (!entriesByDate[e.work_date]) entriesByDate[e.work_date] = [];
      entriesByDate[e.work_date].push(e);
      totalHours += parseFloat(e.hours || 0);
    }
  }

  const dateGroups = Object.keys(entriesByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div>
        <Link href="/manager/team" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Team
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700">
              {name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{profile.department ?? "No department"} · Joined {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
            profile.status === "active" ? "bg-emerald-100 text-emerald-700" :
            profile.status === "invited" ? "bg-amber-100 text-amber-700" :
            "bg-red-100 text-red-700"
          }`}>{profile.status ?? "active"}</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-5 flex flex-col gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
            <p className="text-xs text-gray-500">Hours (Last 7 Days)</p>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-5 flex flex-col gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{entries?.length ?? 0}</p>
            <p className="text-xs text-gray-500">Tasks Completed</p>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-5 flex flex-col gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{kras?.length ?? 0}</p>
            <p className="text-xs text-gray-500">Active KRAs</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column — Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          
          {dateGroups.length === 0 ? (
            <div className="bg-white border rounded-xl p-8 text-center text-gray-400 text-sm">
              No activity recorded in the last 7 days.
            </div>
          ) : (
            dateGroups.map((dateStr) => {
              const dayEntries = entriesByDate[dateStr];
              const dayHours = dayEntries.reduce((s, e) => s + parseFloat(e.hours || 0), 0);
              
              return (
                <section key={dateStr} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                    </h3>
                    <span className="text-xs font-medium text-gray-500">{dayHours.toFixed(1)}h</span>
                  </div>
                  
                  <div className="bg-white border rounded-xl p-6 space-y-5">
                    {dayEntries.map((entry, idx) => (
                      <div key={entry.id} className="relative pl-7">
                        {idx < dayEntries.length - 1 && (
                          <div className="absolute left-[9px] top-5 bottom-[-20px] w-[2px] bg-gray-100" />
                        )}
                        <div
                          className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white ${ENTRY_TYPE_COLOR[entry.entry_type] || "bg-gray-400"}`}
                        />
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded capitalize">
                              {entry.entry_type}
                            </span>
                            {entry.kras?.name && (
                              <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                                {entry.kras.name}
                              </span>
                            )}
                            <span className="text-xs text-gray-400 ml-auto">
                              {entry.hours}h
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{entry.summary}</p>
                          {entry.details && (
                            <p className="text-xs text-gray-500">{entry.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>

        {/* Right Column — KRAs */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Active KRAs</h2>
          
          <div className="bg-white border rounded-xl overflow-hidden">
            {(!kras || kras.length === 0) ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                No active KRAs for this employee.
              </div>
            ) : (
              <div className="divide-y">
                {kras.map(kra => (
                  <div key={kra.id} className="p-4">
                    <p className="text-sm font-medium text-gray-900">{kra.name}</p>
                    {kra.description && <p className="text-xs text-gray-500 mt-1">{kra.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
