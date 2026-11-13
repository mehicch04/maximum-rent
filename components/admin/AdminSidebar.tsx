"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgePercent,
  BarChart3,
  Building2,
  CalendarCheck,
  Car,
  Download,
  FileSignature,
  LogOut,
  MessageSquare,
  Package,
} from "lucide-react";

export type PendingCounts = { inquiries: number; messages: number };

const TABS = [
  { href: "/admin", label: "Rezervacije", icon: CalendarCheck, exact: true, badge: "inquiries" as const },
  { href: "/admin/vozila", label: "Vozila", icon: Car, exact: false },
  { href: "/admin/ugovori", label: "Ugovori", icon: FileSignature, exact: false },
  { href: "/admin/analitika", label: "Analitika", icon: BarChart3, exact: false },
  { href: "/admin/poruke", label: "Poruke", icon: MessageSquare, exact: false, badge: "messages" as const },
  { href: "/admin/oprema", label: "Oprema", icon: Package, exact: false },
  { href: "/admin/akcije", label: "Akcije", icon: BadgePercent, exact: false },
  { href: "/admin/izvoz", label: "Izvoz", icon: Download, exact: false },
  { href: "/admin/firma", label: "Firma", icon: Building2, exact: false },
];

export function AdminSidebar({
  counts = { inquiries: 0, messages: 0 },
}: {
  counts?: PendingCounts;
}) {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === "/admin/login") return null;

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 flex-col border-r border-border bg-background p-3 lg:flex">
      <nav className="flex flex-col gap-1">
        {TABS.map(({ href, label, icon: Icon, exact, badge }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          const pending = badge ? counts[badge] : 0;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-brand/10 font-semibold text-brand-strong"
                  : "font-medium text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-[19px] w-[19px] shrink-0" />
              {label}
              {pending > 0 && (
                <span
                  aria-label={`${pending} novih`}
                  className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold leading-none text-brand-foreground"
                >
                  {pending > 99 ? "99+" : pending}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-2">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <LogOut className="h-[19px] w-[19px] shrink-0" />
          Odjava
        </button>
      </div>
    </aside>
  );
}
