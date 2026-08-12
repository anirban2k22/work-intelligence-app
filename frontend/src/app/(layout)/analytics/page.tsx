import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { BarChart2 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Analytics"
        description="Deep dive into your effort trends, time allocation, and stakeholder engagement."
      />
      <div className="flex-1 mt-6">
        <EmptyState
          icon={BarChart2}
          title="Analytics Coming Soon"
          description="Detailed analytics will be available in Sprint 2."
        />
      </div>
    </div>
  );
}
