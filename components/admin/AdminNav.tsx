"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Car, MessageSquare, Settings } from "lucide-react";

const TABS = [
  { href: "/admin", label: "Rezervacije", icon: CalendarCheck, exact: true },
  { href: "/admin/vozila", label: "Vozila", icon: Car, exact: false },
  { href: "/admin/poruke", label: "Poruke", icon: MessageSquare, exact: false },
  { href: "/admin/postavke", label: "Postavke", icon: Settings, exact: false },
];

export function AdminNav() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-6xl gap-1 px-4 sm:px-6">
        {TABS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                active
                  ? "border-brand text-brand"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
