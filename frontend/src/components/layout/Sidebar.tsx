"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  FileText,
  LayoutDashboard,
  Mic,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { UserMenu } from "@/components/shared/UserMenu";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Record", href: "/record", icon: Mic },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background hidden md:flex">
      <div className="flex h-14 items-center px-4 border-b">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <UserMenu />
      </div>
    </aside>
  );
}
