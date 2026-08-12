import { buttonVariants } from "@/components/ui/button";
import { Plus, BarChart3, Play } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Good Morning, Anirban 👋</h1>
        <p className="text-muted-foreground">{currentDate}</p>
      </div>
      
      <div className="flex items-center gap-2">
        <Link href="/settings/kras" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          <Plus className="w-4 h-4 mr-2" />
          Add KRA
        </Link>
        <Link href="/reports" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          <BarChart3 className="w-4 h-4 mr-2" />
          View Reports
        </Link>
        <Link href="/record" className={cn(buttonVariants({ size: "sm" }))}>
          <Play className="w-4 h-4 mr-2" />
          Record Day
        </Link>
      </div>
    </div>
  );
}
