import { PrismaClient, LocationType, CarClass, Transmission, FuelType } from "@prisma/client";

const prisma = new PrismaClient();

const locations = [
  { slug: "citluk-glavni-ured", name: "Glavni ured – Čitluk", type: LocationType.HEAD_OFFICE, street: "Potpolje b.b.", city: "Čitluk", postalCode: "88260", sortOrder: 0 },
  { slug: "medugorje-autobusni-kolodvor", name: "Međugorje – Autobusni kolodvor", type: LocationType.BUS_STATION, street: "Lišnjačine", city: "Međugorje", postalCode: "88266", sortOrder: 1 },
  { slug: "mostar-zracna-luka", name: "Mostar – Zračna luka", type: LocationType.AIRPORT, street: "Gnojnice", city: "Mostar", postalCode: "88000", sortOrder: 2 },
  { slug: "mostar-vukovarska", name: "Mostar – Vukovarska", type: LocationType.CITY_OFFICE, street: "Vukovarska", city: "Mostar", postalCode: "88000", sortOrder: 3 },
  { slug: "capljina-autobusni-kolodvor", name: "Čapljina – Autobusni kolodvor", type: LocationType.BUS_STATION, street: "Silvija Strahimira Kranjčevića", city: "Čapljina", postalCode: "88300", sortOrder: 4 },
  { slug: "ljubuski", name: "Ljubuški", type: LocationType.CITY_OFFICE, street: "Jadranska cesta 38", city: "Ljubuški", postalCode: "88320", sortOrder: 5 },
];

const cars = [
  { slug: "vw-up-manual-2022", brand: "Volkswagen", model: "Up!", title: "VW UP!", year: 2022, carClass: CarClass.CITY_CAR, transmission: Transmission.MANUAL, passengers: 4, doors: 4, fuelType: FuelType.PETROL, emissionClass: "Euro 6", pricePerDay: 45, isFeatured: false, sortOrder: 10 },
  { slug: "smart-forfour-manual", brand: "Smart", model: "Forfour", title: "Smart Forfour", year: 2021, carClass: CarClass.CITY_CAR, transmission: Transmission.MANUAL, passengers: 5, doors: 5, fuelType: FuelType.PETROL, emissionClass: "Euro 6", pricePerDay: 45, sortOrder: 11 },
  { slug: "vw-golf-8-r-line", brand: "Volkswagen", model: "Golf 8.5 R-Line", title: "VW Golf 8.5 R-Line", year: 2024, carClass: CarClass.COMPACT, transmission: Transmission.AUTOMATIC, passengers: 5, doors: 5, fuelType: FuelType.DIESEL, emissionClass: "Euro 6", pricePerDay: 95, isFeatured: true, sortOrder: 5 },
  { slug: "audi-a6-2025", brand: "Audi", model: "A6", title: "Audi A6 (2025)", year: 2025, carClass: CarClass.FULLSIZE, transmission: Transmission.AUTOMATIC, passengers: 5, doors: 5, fuelType: FuelType.DIESEL, emissionClass: "Euro 6", pricePerDay: 160, deposit: 800, isFeatured: true, sortOrder: 2 },
  { slug: "audi-a8-long", brand: "Audi", model: "A8 L", title: "Audi A8 Long", year: 2024, carClass: CarClass.LUXURY, transmission: Transmission.AUTOMATIC, passengers: 5, doors: 5, fuelType: FuelType.DIESEL, emissionClass: "Euro 6", pricePerDay: 290, deposit: 1500, isFeatured: true, sortOrder: 0 },
  { slug: "audi-q8", brand: "Audi", model: "Q8", title: "Audi Q8", year: 2024, carClass: CarClass.SUV, transmission: Transmission.AUTOMATIC, passengers: 5, doors: 5, fuelType: FuelType.DIESEL, emissionClass: "Euro 6", pricePerDay: 250, deposit: 1500, isFeatured: true, sortOrder: 1 },
  { slug: "vw-passat-variant", brand: "Volkswagen", model: "Passat Variant", title: "VW Passat Variant", year: 2023, carClass: CarClass.MIDSIZE, transmission: Transmission.AUTOMATIC, passengers: 5, doors: 5, fuelType: FuelType.DIESEL, emissionClass: "Euro 6", pricePerDay: 85, sortOrder: 6 },
  { slug: "vw-transporter-t6", brand: "Volkswagen", model: "Transporter T6", title: "VW Transporter (8+1)", year: 2022, carClass: CarClass.VAN, transmission: Transmission.MANUAL, passengers: 9, doors: 5, fuelType: FuelType.DIESEL, emissionClass: "Euro 6", pricePerDay: 120, sortOrder: 8 },
];

async function main() {
  for (const loc of locations) {
    await prisma.location.upsert({ where: { slug: loc.slug }, update: loc, create: loc });
  }
  for (const car of cars) {
    await prisma.car.upsert({
      where: { slug: car.slug },
      update: { ...car, images: [] },
      create: { ...car, images: [] },
    });
  }
  console.log(`✓ Seeded ${locations.length} locations and ${cars.length} cars`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
