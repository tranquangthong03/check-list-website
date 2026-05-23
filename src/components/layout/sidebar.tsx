"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { navItems } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 border-r border-border/70 bg-sidebar/60 p-5 lg:block">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="rounded-2xl bg-primary p-2 text-primary-foreground">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Ứng dụng cá nhân</p>
          <p className="text-lg font-semibold">Check List Website</p>
        </div>
      </Link>
      <nav className="space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
