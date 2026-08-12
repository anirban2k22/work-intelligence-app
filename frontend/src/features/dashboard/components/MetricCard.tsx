import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
}

export function MetricCard({ title, value, icon, description, trend }: MetricCardProps) {
  return (
    <Card className="shadow-sm rounded-xl transition-all hover:shadow-md hover:border-border/80">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <p className="text-xs mt-1">
            <span className={trend.positive ? "text-emerald-500" : "text-rose-500"}>
              {trend.positive ? "+" : "-"}{Math.abs(trend.value)}%
            </span>{" "}
            <span className="text-muted-foreground">{trend.label}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
