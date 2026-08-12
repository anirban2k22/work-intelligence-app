"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";

const settingsNav = [
  { name: "Profile", href: "/settings/profile" },
  { name: "KRAs", href: "/settings/kras" },
  { name: "Projects", href: "/settings/projects" },
  { name: "Stakeholders", href: "/settings/stakeholders" },
  { name: "Notifications", href: "/settings/notifications" },
  { name: "AI Preferences", href: "/settings/ai-preferences" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Settings"
        description="Manage your account, context, and preferences."
      />
      <div className="flex flex-col md:flex-row gap-8 mt-6 flex-1">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
            {settingsNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 min-w-0 max-w-4xl">
          {children}
        </main>
      </div>
    </div>
  );
}
