export const SITE = {
  name: "Maximum Rent a Car",
  domain: "maximum-rent.com",
  email: "info@maximum-rent.com",
  phones: [
    { label: "Tel", value: "+387 (0) 63 660 444", href: "tel:+38763660444" },
    { label: "Mob", value: "+387 (0) 63 660 555", href: "tel:+38763660555" },
    { label: "Fax", value: "+387 (0) 36 644 158", href: "tel:+38736644158" },
  ],
  whatsapp: "38763660444",
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
  { href: "/vozila", key: "vehicles" },
  { href: "/poslovna-ponuda", key: "business" },
  { href: "/vodici", key: "guides" },
  { href: "/uvjeti-najma", key: "terms" },
  { href: "/o-nama", key: "about" },
  { href: "/kontakt", key: "contact" },
] as const;
