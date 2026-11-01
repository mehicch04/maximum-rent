import type { ReactNode } from "react";

export function Band({
  children,
  id,
  className = "",
  inner = "",
}: {
  children: ReactNode;
  id?: string;
  className?: string;
  inner?: string;
}) {
  return (
    <section id={id} className={`px-3 py-5 sm:px-4 sm:py-8 ${className}`}>
      <div className={`dark relative isolate overflow-hidden rounded-[28px] bg-ink text-foreground ${inner}`}>
        <div aria-hidden className="pointer-events-none absolute -top-56 left-1/2 -z-10 h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-brand/20 blur-[130px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-24 -z-10 h-[320px] w-[320px] rounded-full bg-brand/10 blur-[100px]" />
        {children}
      </div>
    </section>
  );
}
