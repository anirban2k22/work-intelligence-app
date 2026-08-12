import { Card, CardContent } from "@/components/ui/card";

interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description: string;
  color: string;
}

export function TimelineCard({ items }: { items: TimelineItem[] }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    gray: "bg-gray-500",
  };

  return (
    <Card className="shadow-sm rounded-xl">
      <CardContent className="p-6">
        <div className="space-y-6">
          {items.length === 0 && (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No activity recorded yet today. Hit the Record button to capture your work!
            </div>
          )}
          {items.map((item, index) => (
            <div key={item.id} className="relative pl-6">
              {/* Timeline line */}
              {index !== items.length - 1 && (
                <div className="absolute left-[9px] top-6 bottom-[-24px] w-[2px] bg-border" />
              )}
              {/* Timeline dot */}
              <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-background ${colorMap[item.color] || "bg-primary"}`} />
              
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground mb-1">{item.time}</span>
                <span className="text-sm font-medium">{item.title}</span>
                <span className="text-sm text-muted-foreground">{item.description}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
