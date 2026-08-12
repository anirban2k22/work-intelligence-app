import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Target, FileText, Activity } from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  text: string;
  timestamp: string;
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case "review": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "kra": return <Target className="w-4 h-4 text-amber-500" />;
      case "doc": return <FileText className="w-4 h-4 text-blue-500" />;
      case "ticket": return <Activity className="w-4 h-4 text-purple-500" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="shadow-sm rounded-xl">
      <CardContent className="p-6">
        <div className="space-y-4">
          {items.length === 0 && (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No recent activity.
            </div>
          )}
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <div className="mt-0.5 bg-muted/50 p-1.5 rounded-md">
                {getIcon(item.type)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm">{item.text}</span>
                <span className="text-xs text-muted-foreground">{item.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
