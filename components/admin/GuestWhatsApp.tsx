import { WA_LANG_LABEL, guestTemplates, waLink, type WaGuest, type WaLang } from "@/lib/wa-messages";
import { WaMenu } from "@/components/admin/WaMenu";

export function GuestWhatsApp({ phone, guest, lang }: { phone: string; guest: WaGuest; lang: WaLang }) {
  const items = guestTemplates(guest, lang).map((m) => ({ ...m, href: waLink(phone, m.text) }));
  return <WaMenu items={items} blank={waLink(phone)} title={`Poruka gostu${WA_LANG_LABEL[lang]}`} />;
}
