"use client";

import { Bell, Menu, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/shared/UserMenu";
import { usePathname, useRouter } from "next/navigation";

export function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const pathSegments = pathname?.split("/").filter(Boolean) || [];
  const currentPage =
    pathSegments.length > 0
      ? pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1)
      : "Dashboard";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <div className="hidden md:flex flex-col">
          <nav className="text-xs text-muted-foreground">ProofX / {currentPage}</nav>
          <h1 className="text-sm font-semibold text-foreground">{currentPage}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick Record — navigates to the record page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/record")}
          className="hidden md:flex h-8 gap-2 items-center font-medium"
          title="Start a new recording (⌘R)"
        >
          <Mic className="h-3.5 w-3.5" />
          <span className="text-xs">Quick Record</span>
        </Button>

        {/* Notification bell — placeholder, disabled until implemented */}
        <div title="Notifications — coming soon" className="relative h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground cursor-not-allowed opacity-50">
          <Bell className="h-4 w-4" />
        </div>

        <div className="hidden md:flex">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
