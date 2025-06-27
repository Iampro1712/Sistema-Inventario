import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardStatsReal } from "@/components/dashboard/dashboard-stats-real";
import { InventoryChart } from "@/components/dashboard/inventory-chart";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen general del estado de tu inventario
          </p>
        </div>

        <DashboardStatsReal />

        <div className="grid gap-6 md:grid-cols-1">
          <InventoryChart />
        </div>
      </div>
    </DashboardLayout>
  );
}
