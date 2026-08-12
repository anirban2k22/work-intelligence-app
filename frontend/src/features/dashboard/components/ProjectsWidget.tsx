import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProjectItem {
  id: string;
  name: string;
  status: string;
  progress: number;
  color: string;
}

export function ProjectsWidget({ projects }: { projects: ProjectItem[] }) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "text-emerald-500 bg-emerald-500/10";
      case "at risk": return "text-rose-500 bg-rose-500/10";
      case "on hold": return "text-amber-500 bg-amber-500/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  return (
    <Card className="shadow-sm rounded-xl">
      <CardContent className="p-6">
        <div className="space-y-6">
          {projects.length === 0 && (
            <div className="text-sm text-muted-foreground py-4 text-center">
              No active projects.
            </div>
          )}
          {projects.map((project) => (
            <div key={project.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{project.name}</span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={project.progress} className="h-2" />
                <span className="text-xs text-muted-foreground min-w-[3ch]">{project.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
