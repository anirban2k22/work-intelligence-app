import { Clock, Calendar, CheckSquare, Briefcase, Users, Target } from "lucide-react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { MetricCard } from "@/features/dashboard/components/MetricCard";
import { WorkDistributionCard } from "@/features/dashboard/components/WorkDistributionCard";
import { InsightsCard } from "@/features/dashboard/components/InsightsCard";
import { ProjectsWidget } from "@/features/dashboard/components/ProjectsWidget";
import { StakeholdersWidget } from "@/features/dashboard/components/StakeholdersWidget";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard | ProofX",
  description: "Your daily work intelligence dashboard",
};

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

function formatDateHeading(dateStr: string): string {
  const today = new Date().toLocaleDateString("en-CA");
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("en-CA");
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateSummary(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let entriesByDate: Record<string, any[]> = {};
  let todayHours = 0;
  let totalEntries = 0;

  if (user) {
    const today = new Date().toLocaleDateString("en-CA");
    // Calculate 7 days ago
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toLocaleDateString("en-CA");

    const { data: entries, error } = await supabase
      .from("work_entries")
      .select("*, kras(name)")
      .eq("user_id", user.id)
      .gte("work_date", sevenDaysAgo)
      .order("work_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) console.error("Dashboard fetch error:", error);

    if (entries && entries.length > 0) {
      totalEntries = entries.length;

      // Group by date
      for (const e of entries) {
        if (!entriesByDate[e.work_date]) entriesByDate[e.work_date] = [];
        entriesByDate[e.work_date].push(e);
      }

      // Today's hours
      const todayEntries = entriesByDate[today] || [];
      todayHours = todayEntries.reduce((sum, e) => sum + parseFloat(e.hours || 0), 0);
    }
  }

  const dateGroups = Object.keys(entriesByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <DashboardHeader />

      {/* Metrics Grid */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard
            title="Today's Time"
            value={todayHours > 0 ? `${todayHours.toFixed(1)}h` : "0h"}
            icon={<Clock className="w-4 h-4" />}
          />
          <MetricCard
            title="This Week"
            value={`${Object.values(entriesByDate).flat().reduce((s, e) => s + parseFloat(e.hours || 0), 0).toFixed(1)}h`}
            icon={<Calendar className="w-4 h-4" />}
          />
          <MetricCard
            title="Logged Today"
            value={String((entriesByDate[new Date().toLocaleDateString("en-CA")] || []).length)}
            icon={<CheckSquare className="w-4 h-4" />}
            description="tasks captured"
          />
          <MetricCard title="Active Projects" value="0" icon={<Briefcase className="w-4 h-4" />} />
          <MetricCard title="Stakeholders" value="0" icon={<Users className="w-4 h-4" />} />
          <MetricCard title="Total KRAs" value="0" icon={<Target className="w-4 h-4" />} />
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column — Activity History */}
        <div className="lg:col-span-2 space-y-8">

          {dateGroups.length === 0 ? (
            <div className="border rounded-xl p-8 text-center text-muted-foreground bg-white">
              <p className="font-medium">No recordings yet</p>
              <p className="text-sm mt-1">Hit <strong>Quick Record</strong> above to capture your first work entry.</p>
            </div>
          ) : (
            dateGroups.map((dateStr) => {
              const dayEntries = entriesByDate[dateStr];
              const dayHours = dayEntries.reduce((s, e) => s + parseFloat(e.hours || 0), 0);

              return (
                <section key={dateStr}>
                  {/* Date heading */}
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">
                        {formatDateHeading(dateStr)}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        On {formatDateSummary(dateStr)} you completed the following work —{" "}
                        <span className="font-medium">{dayHours.toFixed(1)}h total</span>
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {dayEntries.length} {dayEntries.length === 1 ? "entry" : "entries"}
                    </span>
                  </div>

                  {/* Timeline entries */}
                  <div className="bg-white border rounded-xl p-6 space-y-5">
                    {dayEntries.map((entry, idx) => (
                      <div key={entry.id} className="relative pl-7">
                        {/* Vertical line */}
                        {idx < dayEntries.length - 1 && (
                          <div className="absolute left-[9px] top-5 bottom-[-20px] w-[2px] bg-border" />
                        )}
                        {/* Dot */}
                        <div
                          className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-background ${ENTRY_TYPE_COLOR[entry.entry_type] || "bg-gray-400"}`}
                        />
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded capitalize">
                              {entry.entry_type}
                            </span>
                            {entry.kras?.name && (
                              <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                                {entry.kras.name}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground ml-auto">
                              {entry.hours}h
                            </span>
                          </div>
                          <p className="text-sm font-medium text-foreground">{entry.summary}</p>
                          {entry.details && (
                            <p className="text-xs text-muted-foreground">{entry.details}</p>
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

        {/* Right Column — Widgets */}
        <div className="space-y-8">
          <section>
            <WorkDistributionCard data={[]} />
          </section>
          <section>
            <InsightsCard insights={[]} />
          </section>
          <section>
            <ProjectsWidget projects={[]} />
          </section>
          <section>
            <StakeholdersWidget stakeholders={[]} />
          </section>
        </div>
      </div>
    </div>
  );
}
