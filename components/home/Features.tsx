import { Headset, MapPin, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

const ICONS = [MapPin, ShieldCheck, Headset];

export function Features() {
  const t = useTranslations("Features");
  const items = t.raw("items") as { title: string; body: string }[];

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="grid gap-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-border">
        {items.map((item, i) => {
          const Icon = ICONS[i] ?? MapPin;
          return (
            <div key={item.title} className="flex gap-4 md:flex-col md:gap-3 md:px-5 md:first:pl-0 md:last:pr-0 lg:flex-row lg:gap-4 lg:px-8">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand-strong">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-base font-bold text-foreground">{item.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
