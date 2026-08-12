"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface DistributionItem {
  name: string;
  value: number;
  color: string;
}

export function WorkDistributionCard({ data }: { data: DistributionItem[] }) {
  return (
    <Card className="shadow-sm rounded-xl">
      <CardContent className="p-6 flex flex-col items-center justify-center h-[300px]">
        {data.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center">
            Log time to see your work distribution.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`${value || 0}%`, "Effort"]}
              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: "12px" }}
            />
          </PieChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
