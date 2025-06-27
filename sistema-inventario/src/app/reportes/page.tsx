"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ReportsHeader } from "@/components/reports/reports-header";
import { ReportsGrid } from "@/components/reports/reports-grid";
import { ReportsCharts } from "@/components/reports/reports-charts";
import { useState } from "react";

export default function ReportsPage() {
  const [periodo, setPeriodo] = useState('6m');
  const [filtros, setFiltros] = useState<any>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePeriodoChange = (nuevoPeriodo: string) => {
    setPeriodo(nuevoPeriodo);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFiltroChange = (nuevosFiltros: any) => {
    setFiltros(nuevosFiltros);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ReportsHeader
          onPeriodoChange={handlePeriodoChange}
          onFiltroChange={handleFiltroChange}
          currentPeriodo={periodo}
        />
        <ReportsGrid />
        <ReportsCharts
          periodo={periodo}
          filtros={filtros}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </DashboardLayout>
  );
}
