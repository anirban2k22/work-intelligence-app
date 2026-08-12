import * as React from "react";
import { cn } from "@/lib/utils";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon = FolderOpen, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed bg-muted/30 animate-in fade-in duration-500", className)} {...props}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
