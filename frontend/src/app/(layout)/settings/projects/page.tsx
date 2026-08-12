export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-medium">Projects</h3>
        <p className="text-sm text-muted-foreground">
          Manage the projects the AI uses to categorize your work.
        </p>
      </div>
      <div className="border border-dashed rounded-lg h-64 flex items-center justify-center text-muted-foreground bg-muted/20">
        Project Settings (Coming Soon)
      </div>
    </div>
  );
}
