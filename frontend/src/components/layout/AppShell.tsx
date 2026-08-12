import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      <Sidebar />
      <div className="flex flex-col md:pl-64 flex-1">
        <TopNavbar />
        <main className="flex-1 p-4 md:p-6 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
