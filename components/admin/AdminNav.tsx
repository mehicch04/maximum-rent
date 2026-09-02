"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Building2, CalendarCheck, Car, Download, MessageSquare, Package } from "lucide-react";

const TABS = [
  { href: "/admin", label: "Rezervacije", icon: CalendarCheck, exact: true },
  { href: "/admin/vozila", label: "Vozila", icon: Car, exact: false },
  { href: "/admin/analitika", label: "Analitika", icon: BarChart3, exact: false },
  { href: "/admin/poruke", label: "Poruke", icon: MessageSquare, exact: false },
  { href: "/admin/oprema", label: "Oprema", icon: Package, exact: false },
  { href: "/admin/izvoz", label: "Izvoz", icon: Download, exact: false },
  { href: "/admin/firma", label: "Firma", icon: Building2, exact: false },
];

export function AdminNav() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <nav className="border-b border-border bg-background">
      {/* Seven tabs are about 710px wide, well past a phone screen. Without a
          scroller here the whole admin page stretches and the browser zooms
          out, which is why every screen looked shrunken on mobile. */}
      <div className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
        {TABS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`-mb-px inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
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
