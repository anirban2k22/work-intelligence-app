import type { ReactNode } from "react";
import { ManagerSidebar } from "@/components/layout/ManagerSidebar";

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-muted/20">
      <ManagerSidebar />
      <div className="flex flex-col md:pl-64 flex-1">
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
