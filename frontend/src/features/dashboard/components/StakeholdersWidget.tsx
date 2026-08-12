import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface StakeholderItem {
  id: string;
  name: string;
  avatar: string;
  hours: string;
  sessions: number;
  role: string;
}

export function StakeholdersWidget({ stakeholders }: { stakeholders: StakeholderItem[] }) {
  return (
    <Card className="shadow-sm rounded-xl">
      <CardContent className="p-6">
        <div className="space-y-4">
          {stakeholders.length === 0 && (
            <div className="text-sm text-muted-foreground py-4 text-center">
              No stakeholders added yet.
            </div>
          )}
          {stakeholders.map((person) => (
            <div key={person.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {person.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none mb-1">{person.name}</span>
                  <span className="text-xs text-muted-foreground">{person.role}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium">{person.hours}</span>
                <span className="text-xs text-muted-foreground">{person.sessions} sessions</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
