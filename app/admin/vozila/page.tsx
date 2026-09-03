import { prisma } from "@/lib/prisma";
import { VehicleManager } from "@/components/admin/VehicleManager";
import type { AdminVehicle } from "@/lib/vehicle-options";
import { saveVehicle, deleteVehicle } from "./actions";

export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const cars = await prisma.car.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

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
    <VehicleManager
      vehicles={vehicles}
      saveAction={saveVehicle}
      deleteAction={deleteVehicle}
    />
  );
}
