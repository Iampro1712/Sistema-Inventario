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
    <div className="space-y-6">
      {/* Título y descripción */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Movimientos de Inventario</h1>
        <p className="text-muted-foreground">
          Gestiona y supervisa todos los movimientos de stock
        </p>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MovementExportModal 
            currentFilters={{
              search: searchTerm,
              type: filters.type,
              productId: filters.productId,
              dateFrom: filters.dateFrom || dateFrom,
              dateTo: filters.dateTo || dateTo
            }}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <MovementFormModal onMovementCreated={onMovementCreated} />
        </div>
      </div>

      {/* Búsqueda, filtros y rango de fechas */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Búsqueda */}
          <Input
            placeholder="Buscar por producto o razón..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="max-w-sm"
          />
          
          {/* Filtros */}
          <MovementFiltersModal 
            onFiltersChange={handleFiltersChange}
            activeFilters={filters}
          />

          {/* Rango de fechas */}
          <div className="flex items-center gap-2 border rounded-md p-1">
            <Calendar className="h-4 w-4 text-muted-foreground ml-2" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => handleDateFromChange(e.target.value)}
              className="border-0 shadow-none w-auto"
              placeholder="Desde"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => handleDateToChange(e.target.value)}
              className="border-0 shadow-none w-auto"
              placeholder="Hasta"
            />
            {(dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearDateRange}
                className="h-6 w-6 p-0 mr-1"
              >
                ×
              </Button>
            )}
          </div>
        </div>
        
        {/* Información de totales */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {totalMovements} {totalMovements === 1 ? 'movimiento' : 'movimientos'}
          </Badge>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="outline">
              {getActiveFiltersCount()} filtro{getActiveFiltersCount() !== 1 ? 's' : ''} activo{getActiveFiltersCount() !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Filtros activos */}
      {(searchTerm || filters.type || filters.productId || dateFrom || dateTo) && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">Filtros activos:</span>
          
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Búsqueda: "{searchTerm}"
              <button 
                onClick={() => handleSearchChange("")}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full w-4 h-4 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </Badge>
          )}
          
          {filters.type && (
            <Badge variant="secondary" className="gap-1">
              Tipo: {filters.type === 'IN' ? 'Entrada' : filters.type === 'OUT' ? 'Salida' : 'Ajuste'}
              <button 
                onClick={() => handleFiltersChange({...filters, type: ''})}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full w-4 h-4 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </Badge>
          )}
          
          {(dateFrom || dateTo) && (
            <Badge variant="secondary" className="gap-1">
              Fechas: {dateFrom || '∞'} - {dateTo || '∞'}
              <button 
                onClick={clearDateRange}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full w-4 h-4 flex items-center justify-center text-xs"
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
