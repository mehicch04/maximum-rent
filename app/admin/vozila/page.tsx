import { prisma } from "@/lib/prisma";
import { VehicleManager } from "@/components/admin/VehicleManager";
import type { AdminVehicle } from "@/lib/vehicle-options";
import { saveVehicle, deleteVehicle } from "./actions";
import { busyCarsFor, getCarOccupancy } from "@/lib/extras-availability";
import type { LiveStatus } from "@/components/admin/VehicleManager";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function VehiclesPage({
  searchParams = {},
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const one = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;
  const blocked =
    one(searchParams.msg) === "hasbookings" ? one(searchParams.count) : null;

  const cars = await prisma.car.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const live: Record<string, LiveStatus> = {};
  try {
    const now = new Date();
    const occupancy = await getCarOccupancy();
    // A one-second window asks a simple question: is it out right now?
    const busy = busyCarsFor(occupancy, now, new Date(now.getTime() + 1000));
    const fmt = new Intl.DateTimeFormat("hr-HR", {
      timeZone: "Europe/Sarajevo",
      day: "2-digit",
      month: "2-digit",
    });

    for (const car of cars) {
      const reason = busy.get(car.id);
      if (!reason) {
        live[car.id] = { busy: false, reason: "", until: "" };
        continue;
      }
      // The period that is running now decides when the car is back.
      const current = occupancy
        .filter((o) => o.carId === car.id && o.from <= now && o.to >= now)
        .sort((a, b) => b.to.getTime() - a.to.getTime())[0];

      live[car.id] = {
        busy: true,
        reason: reason === "rezervisano" ? "U najmu" : reason,
        until: current ? fmt.format(current.to) : "",
      };
    }
  } catch (err) {
    // A status column must never take the vehicles screen down.
    console.error("[vozila] live status failed:", err);
  }

  // Convert Prisma Decimal/Date to client-serializable primitives.
  const vehicles: AdminVehicle[] = cars.map((c) => ({
    ...c,
    pricePerDay: c.pricePerDay != null ? Number(c.pricePerDay) : null,
    seasonalPrice: c.seasonalPrice != null ? Number(c.seasonalPrice) : null,
    plate: c.plate,
    deposit: c.deposit != null ? Number(c.deposit) : null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return (
    <>
      {blocked && (
        <div className="mb-4 rounded-xl border border-brand/40 bg-brand/[0.06] p-3 text-sm text-foreground">
          Vozilo nije obrisano: ima {blocked}{" "}
          {blocked === "1"
            ? "aktivnu ili nadolazeću rezervaciju"
            : "aktivnih ili nadolazećih rezervacija"}
          . Otkažite ih ili prebacite na drugo vozilo, ili vozilo samo
          isključite iz ponude.
        </div>
      )}
      <VehicleManager
        vehicles={vehicles}
        saveAction={saveVehicle}
        deleteAction={deleteVehicle}
        live={live}
      />
    </>
  );
}
