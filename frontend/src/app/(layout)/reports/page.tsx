import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Reports"
        description="Generate daily, weekly, or custom narrative status reports."
        action={<Button>+ New report</Button>}
      />
      <div className="flex-1 mt-6">
        <EmptyState
          icon={FileText}
          title="Generate your first report"
          description="You haven't generated any reports yet. Reports summarize your confirmed work logs."
        />
      </div>
    </div>
  );
}
