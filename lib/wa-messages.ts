import { tidyName } from "@/lib/hours";

export type WaLang = "HR" | "EN" | "DE" | "ES";

export type WaGuest = {
  firstName: string;
  reference: string;
  status: string;
  carTitle?: string | null;
  pickupAt: Date | string;
  returnAt: Date | string;
  pickupLocation?: string | null;
  returnLocation?: string | null;
  reviewUrl?: string | null;
};

export const WA_LANG_LABEL: Record<WaLang, string> = { HR: "", EN: " (engleski)", DE: " (njemački)", ES: " (španski)" };

const ORDER: Record<string, string[]> = {
  NEW: ["confirm", "docs", "unavailable", "hello"],
  CONTACTED: ["confirm", "docs", "unavailable", "hello"],
  CONFIRMED: ["docs", "pickup", "confirm", "hello"],
  IN_PROGRESS: ["return", "hello"],
  COMPLETED: ["thanks", "hello"],
  CANCELLED: ["hello"],
};

function when(d: Date | string, lang: WaLang) {
  const x = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(x.getTime())) return "";
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Sarajevo",
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(x)
      .map((q) => [q.type, q.value]),
  );
  const t = `${p.hour}:${p.minute}`;
  const day = Number(p.day);
  const month = Number(p.month);
  if (lang === "EN") {
    const m = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Sarajevo", month: "short" }).format(x);
    return `${day} ${m} at ${t}`;
  }
  if (lang === "DE") return `${day}.${month}.${p.year} um ${t} Uhr`;
  if (lang === "ES") return `${day}/${month}/${p.year} a las ${t}`;
  return `${day}.${month}.${p.year}. u ${t}`;
}

function digits(phone: string) {
  const v = phone.trim();
  const d = v.replace(/\D/g, "");
  if (v.startsWith("+")) return d;
  if (d.startsWith("00")) return d.slice(2);
  if (d.startsWith("0")) return `387${d.slice(1)}`;
  return d;
}

export const waLink = (phone: string, text?: string) =>
  `https://wa.me/${digits(phone)}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export function guestTemplates(g: WaGuest, lang: WaLang) {
  const name = g.firstName.trim();
  const ref = g.reference;
  const car = g.carTitle ?? "";
  const from = when(g.pickupAt, lang);
  const to = when(g.returnAt, lang);
  const loc = g.pickupLocation ? tidyName(g.pickupLocation) : "";
  const back = g.returnLocation ? tidyName(g.returnLocation) : loc;
  const review = g.reviewUrl ?? "";

  const all: Record<WaLang, Record<string, { label: string; text: string }>> = {
    HR: {
      hello: { label: "Pozdrav", text: `Pozdrav ${name}, ovdje Maximum Rent a Car. Javljamo se u vezi vaše rezervacije ${ref}.` },
      confirm: {
        label: "Potvrda",
        text: `Pozdrav ${name}, vaša rezervacija ${ref} je potvrđena. ${car}, preuzimanje ${from}${loc ? `, ${loc}` : ""}, povrat ${to}. Vidimo se!`,
      },
      docs: {
        label: "Dokumenti",
        text: `Pozdrav ${name}, kako bi sve bilo spremno za preuzimanje, molimo vas da nam ovdje pošaljete fotografiju osobne iskaznice ili putovnice i vozačke dozvole. Rezervacija ${ref}.`,
      },
      pickup: {
        label: "Preuzimanje",
        text: `Pozdrav ${name}, očekujemo vas ${from}${loc ? `, ${loc}` : ""}. Kad sletite ili stignete, javite nam se ovdje i dolazimo do vas.`,
      },
      return: {
        label: "Povrat",
        text: `Pozdrav ${name}, podsjećamo vas da je povrat vozila ${car} ${to}${back ? `, ${back}` : ""}. Ako želite produžiti najam, samo nam napišite ovdje.`,
      },
      unavailable: {
        label: "Nije slobodno",
        text: `Pozdrav ${name}, nažalost vozilo ${car} nije slobodno u terminu koji ste odabrali. Možemo vam ponuditi drugo vozilo iste klase, javite nam odgovara li vam.`,
      },
      thanks: {
        label: "Zahvala",
        text: review
          ? `Pozdrav ${name}, hvala što ste izabrali Maximum Rent a Car! Ako ste bili zadovoljni, bit ćemo vam zahvalni na kratkoj recenziji: ${review}`
          : `Pozdrav ${name}, hvala što ste izabrali Maximum Rent a Car! Nadamo se da ćemo se uskoro opet vidjeti.`,
      },
    },
    EN: {
      hello: { label: "Hello", text: `Hello ${name}, this is Maximum Rent a Car about your booking ${ref}.` },
      confirm: {
        label: "Confirmed",
        text: `Hello ${name}, your booking ${ref} is confirmed. ${car}, pickup on ${from}${loc ? ` at ${loc}` : ""}, return on ${to}. See you soon!`,
      },
      docs: {
        label: "Documents",
        text: `Hello ${name}, so everything is ready for your pickup, please send us a photo of your ID card or passport and your driving licence here. Booking ${ref}.`,
      },
      pickup: {
        label: "Pickup",
        text: `Hello ${name}, we are expecting you on ${from}${loc ? ` at ${loc}` : ""}. Message us here when you land or arrive and we will come to you.`,
      },
      return: {
        label: "Return",
        text: `Hello ${name}, a quick reminder that the ${car} is due back on ${to}${back ? ` at ${back}` : ""}. If you would like to extend the rental, just message us here.`,
      },
      unavailable: {
        label: "Not available",
        text: `Hello ${name}, unfortunately the ${car} is not available for the dates you selected. We can offer you another car of the same class, please let us know if that works for you.`,
      },
      thanks: {
        label: "Thank you",
        text: review
          ? `Hello ${name}, thank you for choosing Maximum Rent a Car! If you enjoyed it, we would really appreciate a short review: ${review}`
          : `Hello ${name}, thank you for choosing Maximum Rent a Car! We hope to see you again soon.`,
      },
    },
    DE: {
      hello: { label: "Hallo", text: `Hallo ${name}, hier ist Maximum Rent a Car wegen Ihrer Buchung ${ref}.` },
      confirm: {
        label: "Bestätigung",
        text: `Hallo ${name}, Ihre Buchung ${ref} ist bestätigt. ${car}, Abholung am ${from}${loc ? `, ${loc}` : ""}, Rückgabe am ${to}. Bis bald!`,
      },
      docs: {
        label: "Dokumente",
        text: `Hallo ${name}, damit bei der Abholung alles bereit ist, senden Sie uns bitte hier ein Foto Ihres Personalausweises oder Reisepasses und Ihres Führerscheins. Buchung ${ref}.`,
      },
      pickup: {
        label: "Abholung",
        text: `Hallo ${name}, wir erwarten Sie am ${from}${loc ? `, ${loc}` : ""}. Schreiben Sie uns hier, sobald Sie gelandet oder angekommen sind, und wir kommen zu Ihnen.`,
      },
      return: {
        label: "Rückgabe",
        text: `Hallo ${name}, eine kurze Erinnerung: Die Rückgabe Ihres Fahrzeugs ${car} ist am ${to}${back ? `, ${back}` : ""}. Wenn Sie die Miete verlängern möchten, schreiben Sie uns einfach hier.`,
      },
      unavailable: {
        label: "Nicht verfügbar",
        text: `Hallo ${name}, leider ist das Fahrzeug ${car} zu Ihrem Wunschtermin nicht verfügbar. Wir können Ihnen ein anderes Fahrzeug derselben Klasse anbieten. Geben Sie uns bitte Bescheid, ob das für Sie passt.`,
      },
      thanks: {
        label: "Danke",
        text: review
          ? `Hallo ${name}, vielen Dank, dass Sie sich für Maximum Rent a Car entschieden haben! Wenn Sie zufrieden waren, freuen wir uns über eine kurze Bewertung: ${review}`
          : `Hallo ${name}, vielen Dank, dass Sie sich für Maximum Rent a Car entschieden haben! Wir hoffen, Sie bald wiederzusehen.`,
      },
    },
    ES: {
      hello: { label: "Hola", text: `Hola ${name}, te escribimos de Maximum Rent a Car sobre tu reserva ${ref}.` },
      confirm: {
        label: "Confirmación",
        text: `Hola ${name}, tu reserva ${ref} está confirmada. ${car}, recogida el ${from}${loc ? ` en ${loc}` : ""}, devolución el ${to}. ¡Hasta pronto!`,
      },
      docs: {
        label: "Documentos",
        text: `Hola ${name}, para tenerlo todo listo para la recogida, envíanos por aquí una foto de tu DNI o pasaporte y de tu carnet de conducir. Reserva ${ref}.`,
      },
      pickup: {
        label: "Recogida",
        text: `Hola ${name}, te esperamos el ${from}${loc ? ` en ${loc}` : ""}. Escríbenos por aquí cuando aterrices o llegues y vamos a buscarte.`,
      },
      return: {
        label: "Devolución",
        text: `Hola ${name}, te recordamos que la devolución del vehículo ${car} es el ${to}${back ? ` en ${back}` : ""}. Si quieres ampliar el alquiler, escríbenos por aquí.`,
      },
      unavailable: {
        label: "No disponible",
        text: `Hola ${name}, lamentablemente el vehículo ${car} no está disponible en las fechas que elegiste. Podemos ofrecerte otro vehículo de la misma categoría, dinos si te parece bien.`,
      },
      thanks: {
        label: "Gracias",
        text: review
          ? `Hola ${name}, ¡gracias por elegir Maximum Rent a Car! Si quedaste contento, te agradeceríamos mucho una breve reseña: ${review}`
          : `Hola ${name}, ¡gracias por elegir Maximum Rent a Car! Esperamos verte pronto.`,
      },
    },
  };

  const set = all[lang];
  return (ORDER[g.status] ?? ORDER.CANCELLED).map((key) => ({ key, ...set[key] }));
}
