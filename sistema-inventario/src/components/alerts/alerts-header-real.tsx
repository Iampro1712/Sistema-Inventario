"use client";

import { useState } from "react";
import { RefreshCw, Search, Filter, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AlertsHeaderRealProps {
  onRefresh?: () => void;
  onSearchChange?: (search: string) => void;
  onFilterChange?: (type: string) => void;
  onMarkAllRead?: () => void;
  activeFilter?: string;
  totalAlerts?: number;
  unreadAlerts?: number;
}

export function AlertsHeaderReal({ 
  onRefresh, 
  onSearchChange, 
  onFilterChange,
  onMarkAllRead,
  activeFilter,
  totalAlerts = 0,
  unreadAlerts = 0
}: AlertsHeaderRealProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    onRefresh?.();
    // Simular delay de refresh
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange?.(value);
  };

  const handleFilterClick = (type: string) => {
    if (activeFilter === type) {
      onFilterChange?.(''); // Quitar filtro si ya está activo
    } else {
      onFilterChange?.(type);
    }
  };

  const filterButtons = [
    { type: 'CRITICAL', label: 'Críticas', color: 'bg-red-100 text-red-800 border-red-300' },
    { type: 'WARNING', label: 'Advertencias', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    { type: 'INFO', label: 'Informativas', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { type: 'read', label: 'Leídas', color: 'bg-green-100 text-green-800 border-green-300' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Título y descripción responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Alertas del Sistema</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Monitorea y gestiona las notificaciones importantes del inventario
          </p>
        </div>

        {/* Badges de información responsive */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
          <Badge variant="secondary" className="text-xs sm:text-sm">
            {totalAlerts} {totalAlerts === 1 ? 'alerta' : 'alertas'}
          </Badge>
          {unreadAlerts > 0 && (
            <Badge variant="destructive" className="text-xs sm:text-sm">
              {unreadAlerts} sin leer
            </Badge>
          )}
        </div>
      </div>

      {/* Botones de acción principales responsive */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
        <div className="grid grid-cols-2 sm:flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-1 w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>

          {unreadAlerts > 0 && (
            <Button
              size="sm"
              onClick={onMarkAllRead}
              className="flex items-center justify-center gap-1 w-full sm:w-auto"
            >
              <EyeOff className="h-4 w-4" />
              <span className="hidden sm:inline">Marcar Todas Leídas</span>
              <span className="sm:hidden">Marcar Leídas</span>
            </Button>
          )}
        </div>
      </div>

      {/* Búsqueda y filtros responsive */}
      <div className="space-y-4">
        {/* Búsqueda */}
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar alertas..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 w-full text-mobile"
          />
        </div>

        {/* Filtros rápidos responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>
          <div className="grid grid-cols-2 sm:flex gap-2">
            {filterButtons.map((filter) => (
              <Button
                key={filter.type}
                variant={activeFilter === filter.type ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterClick(filter.type)}
                className={`text-xs w-full sm:w-auto touch-target ${
                  activeFilter === filter.type
                    ? ''
                    : `hover:${filter.color.replace('text-', 'text-').replace('bg-', 'bg-').replace('border-', 'border-')}`
                }`}
              >
                <span className="hidden sm:inline">{filter.label}</span>
                <span className="sm:hidden">
                  {filter.label === 'Críticas' ? 'Críticas' :
                   filter.label === 'Advertencias' ? 'Avisos' :
                   filter.label === 'Informativas' ? 'Info' : 'Leídas'}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Filtros activos responsive */}
      {(searchTerm || activeFilter) && (
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

          {activeFilter && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Tipo: {filterButtons.find(f => f.type === activeFilter)?.label}
              <button
                onClick={() => onFilterChange?.('')}
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
