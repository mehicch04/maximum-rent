import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Variant = "brand" | "light" | "dark" | "outline";

const BASE =
  "group relative inline-flex shrink-0 items-center gap-3 overflow-hidden rounded-full font-semibold transition-[background-color,border-color,transform] duration-300 active:scale-[0.98]";

const VARIANTS: Record<Variant, { btn: string; dot: string }> = {
  brand: {
    btn: "bg-brand text-brand-foreground hover:bg-brand-700",
    dot: "bg-white text-brand",
  },
  light: {
    btn: "bg-white text-ink hover:bg-white/90",
    dot: "bg-ink text-white",
  },
  dark: {
    btn: "bg-ink text-white hover:bg-ink-700 dark:bg-white dark:text-ink dark:hover:bg-white/90",
    dot: "bg-white text-ink dark:bg-ink dark:text-white",
  },
  outline: {
    btn: "border border-border bg-surface text-foreground hover:border-foreground/30",
    dot: "bg-ink text-white dark:bg-white dark:text-ink",
  },
};

export function PillLink({
  href,
  children,
  variant = "brand",
  size = "md",
  icon,
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: "sm" | "md";
  icon?: ReactNode;
  className?: string;
}) {
  const v = VARIANTS[variant];
  const pad = size === "sm" ? "py-1 pl-4 pr-1 text-xs" : "py-1.5 pl-5 pr-1.5 text-sm";
  const dot = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const cls = `${BASE} ${pad} ${v.btn} ${className}`;
  const inner = (
    <>
      <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25 opacity-0 transition-[transform,opacity] duration-700 group-hover:translate-x-[480%] group-hover:opacity-100" />
      {children}
      <span
        className={`inline-flex ${dot} items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-45 ${v.dot}`}
      >
        {icon ?? <ArrowUpRight className="h-4 w-4" />}
      </span>
    </>
  );

  if (/^(https?:|tel:|mailto:|#)/.test(href)) {
    const ext = href.startsWith("http");
    return (
      <a
        href={href}
        className={cls}
        {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
