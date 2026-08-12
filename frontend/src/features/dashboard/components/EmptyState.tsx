import { FileX2, LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon: Icon = FileX2, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg bg-muted/10">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 mb-4">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
