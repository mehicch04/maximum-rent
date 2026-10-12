// Static brand + contact data, extracted verbatim from the old site (footer).
export const SITE = {
  name: "Maximum Rent a Car",
  domain: "maximum-rent.com",
  email: "info@maximum-rent.com",
  phones: [
    { label: "Tel", value: "+387 (0) 63 660 444", href: "tel:+38763660444" },
    { label: "Mob", value: "+387 (0) 63 660 555", href: "tel:+38763660555" },
    { label: "Fax", value: "+387 (0) 36 644 158", href: "tel:+38736644158" },
  ],
  whatsapp: "38763660444", // E.164 digits only
  hours: "07:30 – 20:30h",
  map: {
    lat: 43.2114694,
    lng: 17.677979,
    link: "https://maps.app.goo.gl/4Ae8FABt9T1dLbes6",
  },
  rating: { score: 4.8, count: 108 },
  socials: {
    facebook: "https://www.facebook.com/maximumrentacarmedugorije",
    instagram: "https://www.instagram.com/rentacarmaximum/",
  },
} as const;

export const NAV_LINKS = [
  { href: "/", key: "home" },
  { href: "/poslovna-ponuda", key: "business" },
  { href: "/o-nama", key: "about" },
  { href: "/vozila", key: "vehicles" },
  { href: "/uvjeti-najma", key: "terms" },
  { href: "/kontakt", key: "contact" },
] as const;

// The six branches (footer). Mirrors prisma/seed.ts; used for the footer + contact page.
export const LOCATIONS = [
  { name: "Glavni ured – Čitluk", street: "Potpolje b.b.", city: "88260 Čitluk" },
  { name: "Međugorje – Autobusni kolodvor", street: "Lišnjačine", city: "88266 Međugorje" },
  { name: "Mostar – Zračna luka", street: "Gnojnice", city: "88000 Mostar" },
  { name: "Mostar – Vukovarska", street: "Vukovarska", city: "88000 Mostar" },
  { name: "Čapljina – Autobusni kolodvor", street: "Silvija Strahimira Kranjčevića", city: "88300 Čapljina" },
  { name: "Ljubuški", street: "Jadranska cesta 38", city: "88320 Ljubuški" },
] as const;
