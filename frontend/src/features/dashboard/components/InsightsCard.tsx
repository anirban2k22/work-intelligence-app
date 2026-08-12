import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, TrendingUp, TrendingDown, Info } from "lucide-react";

interface InsightItem {
  id: string;
  text: string;
  type: string;
}

export function InsightsCard({ insights }: { insights: InsightItem[] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case "increase": return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case "decrease": return <TrendingDown className="w-4 h-4 text-rose-500" />;
      case "info":
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Card className="shadow-sm rounded-xl bg-gradient-to-br from-primary/5 via-background to-background border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold">AI Insights</h3>
        </div>
        <div className="space-y-4">
          {insights.length === 0 && (
            <div className="text-sm text-muted-foreground py-4 text-center">
              Record more work to generate AI insights.
            </div>
          )}
          {insights.map((insight) => (
            <div key={insight.id} className="flex items-start gap-3">
              <div className="mt-0.5">
                {getIcon(insight.type)}
              </div>
              <p className="text-sm leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
