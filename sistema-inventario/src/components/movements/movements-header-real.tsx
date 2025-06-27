"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MovementFormModal } from "./movement-form-modal";
import { MovementExportModal } from "./movement-export-modal";
import { MovementFiltersModal } from "./movement-filters-modal";

interface MovementFilters {
  search: string;
  type: string;
  productId: string;
  dateFrom: string;
  dateTo: string;
}

interface MovementsHeaderRealProps {
  onMovementCreated?: () => void;
  onFiltersChange?: (filters: MovementFilters) => void;
  onSearchChange?: (search: string) => void;
  onDateRangeChange?: (dateFrom: string, dateTo: string) => void;
  totalMovements?: number;
}

export function MovementsHeaderReal({ 
  onMovementCreated, 
  onFiltersChange, 
  onSearchChange,
  onDateRangeChange,
  totalMovements = 0
}: MovementsHeaderRealProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filters, setFilters] = useState<MovementFilters>({
    search: '',
    type: '',
    productId: '',
    dateFrom: '',
    dateTo: ''
  });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange?.(value);
  };

  const handleFiltersChange = (newFilters: MovementFilters) => {
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    onDateRangeChange?.(value, dateTo);
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    onDateRangeChange?.(dateFrom, value);
  };

  const clearDateRange = () => {
    setDateFrom("");
    setDateTo("");
    onDateRangeChange?.("", "");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type) count++;
    if (filters.productId) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (dateFrom || dateTo) count++;
    return count;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Título y descripción responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Movimientos de Inventario</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gestiona y supervisa todos los movimientos de stock
          </p>
        </div>

        {/* Botones de acción responsive */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="grid grid-cols-2 sm:flex gap-2">
            <MovementExportModal
              currentFilters={{
                search: searchTerm,
                type: filters.type,
                productId: filters.productId,
                dateFrom: filters.dateFrom || dateFrom,
                dateTo: filters.dateTo || dateTo
              }}
            />
            <MovementFormModal onMovementCreated={onMovementCreated} />
          </div>
        </div>
      </div>

      {/* Búsqueda, filtros y rango de fechas responsive */}
      <div className="space-y-4">
        {/* Primera fila: Búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
            {/* Búsqueda */}
            <Input
              placeholder="Buscar por producto..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full sm:max-w-sm"
            />

            {/* Filtros */}
            <div className="w-full sm:w-auto">
              <MovementFiltersModal
                onFiltersChange={handleFiltersChange}
                activeFilters={filters}
              />
            </div>
          </div>
        </div>

        {/* Segunda fila: Rango de fechas y totales */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Rango de fechas responsive */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-2 border rounded-md p-1 w-full sm:w-auto">
              <Calendar className="h-4 w-4 text-muted-foreground ml-2" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="border-0 shadow-none w-full sm:w-auto text-mobile"
                placeholder="Desde"
              />
              <span className="text-muted-foreground hidden sm:inline">-</span>
            </div>
            <div className="flex items-center gap-2 border rounded-md p-1 w-full sm:w-auto">
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="border-0 shadow-none w-full sm:w-auto text-mobile"
                placeholder="Hasta"
              />
              {(dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearDateRange}
                  className="h-6 w-6 p-0 mr-1 touch-target"
                >
                  ×
                </Button>
              )}
            </div>
          </div>

          {/* Información de totales responsive */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {totalMovements} {totalMovements === 1 ? 'movimiento' : 'movimientos'}
            </Badge>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="outline" className="text-xs sm:text-sm">
                {getActiveFiltersCount()} filtro{getActiveFiltersCount() !== 1 ? 's' : ''} activo{getActiveFiltersCount() !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Filtros activos responsive */}
      {(searchTerm || filters.type || filters.productId || dateFrom || dateTo) && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium w-full sm:w-auto mb-2 sm:mb-0">Filtros activos:</span>

          {searchTerm && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Búsqueda: "{searchTerm.length > 15 ? searchTerm.substring(0, 15) + '...' : searchTerm}"
              <button
                onClick={() => handleSearchChange("")}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full w-4 h-4 flex items-center justify-center text-xs touch-target"
              >
                ×
              </button>
            </Badge>
          )}

          {filters.type && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Tipo: {filters.type === 'IN' ? 'Entrada' : filters.type === 'OUT' ? 'Salida' : 'Ajuste'}
              <button
                onClick={() => handleFiltersChange({...filters, type: ''})}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full w-4 h-4 flex items-center justify-center text-xs touch-target"
              >
                ×
              </button>
            </Badge>
          )}

          {(dateFrom || dateTo) && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <span className="hidden sm:inline">Fechas: {dateFrom || '∞'} - {dateTo || '∞'}</span>
              <span className="sm:hidden">Fechas</span>
              <button
                onClick={clearDateRange}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full w-4 h-4 flex items-center justify-center text-xs touch-target"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
