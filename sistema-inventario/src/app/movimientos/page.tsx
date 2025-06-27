"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MovementsTableReal } from "@/components/movements/movements-table-real";
import { MovementsHeaderReal } from "@/components/movements/movements-header-real";

interface MovementFilters {
  search: string;
  type: string;
  productId: string;
  dateFrom: string;
  dateTo: string;
}

export default function MovementsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState<MovementFilters>({
    search: '',
    type: '',
    productId: '',
    dateFrom: '',
    dateTo: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [totalMovements, setTotalMovements] = useState(0);

  const handleMovementCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFiltersChange = (newFilters: MovementFilters) => {
    setFilters(newFilters);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  const handleDateRangeChange = (dateFrom: string, dateTo: string) => {
    setDateRange({ from: dateFrom, to: dateTo });
  };

  // Obtener el total de movimientos para el header
  useEffect(() => {
    const fetchTotalMovements = async () => {
      try {
        const response = await fetch('/api/movimientos?limit=1');
        if (response.ok) {
          const data = await response.json();
          setTotalMovements(data.pagination.total);
        }
      } catch (error) {
        console.error('Error al obtener total de movimientos:', error);
      }
    };

    fetchTotalMovements();
  }, [refreshTrigger]);

  // Combinar filtros para pasar a la tabla
  const combinedFilters = {
    ...filters,
    dateFrom: filters.dateFrom || dateRange.from,
    dateTo: filters.dateTo || dateRange.to
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <MovementsHeaderReal
          onMovementCreated={handleMovementCreated}
          onFiltersChange={handleFiltersChange}
          onSearchChange={handleSearchChange}
          onDateRangeChange={handleDateRangeChange}
          totalMovements={totalMovements}
        />
        <MovementsTableReal
          refreshTrigger={refreshTrigger}
          filters={combinedFilters}
          searchTerm={searchTerm}
        />
      </div>
    </DashboardLayout>
  );
}
