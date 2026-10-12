"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Building2, CalendarCheck, Car, Download, FileSignature, MessageSquare, Package } from "lucide-react";

export type PendingCounts = { inquiries: number; messages: number };

/** Which counter, if any, belongs on a tab. */
const TABS = [
  { href: "/admin", label: "Rezervacije", icon: CalendarCheck, exact: true, badge: "inquiries" as const },
  { href: "/admin/vozila", label: "Vozila", icon: Car, exact: false },
  { href: "/admin/ugovori", label: "Ugovori", icon: FileSignature, exact: false },
  { href: "/admin/analitika", label: "Analitika", icon: BarChart3, exact: false },
  { href: "/admin/poruke", label: "Poruke", icon: MessageSquare, exact: false, badge: "messages" as const },
  { href: "/admin/oprema", label: "Oprema", icon: Package, exact: false },
  { href: "/admin/izvoz", label: "Izvoz", icon: Download, exact: false },
  { href: "/admin/firma", label: "Firma", icon: Building2, exact: false },
];

export function AdminNav({
  counts = { inquiries: 0, messages: 0 },
}: {
  counts?: PendingCounts;
}) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
        {TABS.map(({ href, label, icon: Icon, exact, badge }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          const pending = badge ? counts[badge] : 0;
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

              {pending > 0 && (
                <span
                  aria-label={`${pending} novih`}
                  className="ml-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold leading-none text-brand-foreground"
                >
                  {pending > 99 ? "99+" : pending}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
