import { WA_LANGS, guestTemplates, waLink, type WaGuest, type WaLang } from "@/lib/wa-messages";
import { WaMenu } from "@/components/admin/WaMenu";

export function GuestWhatsApp({ phone, guest, lang }: { phone: string; guest: WaGuest; lang: WaLang }) {
  const items = Object.fromEntries(
    WA_LANGS.map((l) => [l, guestTemplates(guest, l).map((m) => ({ ...m, href: waLink(phone, m.text) }))]),
  ) as Record<WaLang, { key: string; label: string; text: string; href: string }[]>;
  return <WaMenu items={items} lang={lang} blank={waLink(phone)} />;
}
