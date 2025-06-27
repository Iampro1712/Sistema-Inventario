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
    <div className="space-y-6">
      {/* Título y descripción */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alertas del Sistema</h1>
        <p className="text-muted-foreground">
          Monitorea y gestiona las notificaciones importantes del inventario
        </p>
      </div>

      {/* Botones de acción principales */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
          {unreadAlerts > 0 && (
            <Button 
              size="sm"
              onClick={onMarkAllRead}
              className="flex items-center gap-1"
            >
              <EyeOff className="h-4 w-4" />
              Marcar Todas Leídas
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {totalAlerts} {totalAlerts === 1 ? 'alerta' : 'alertas'}
          </Badge>
          {unreadAlerts > 0 && (
            <Badge variant="destructive">
              {unreadAlerts} sin leer
            </Badge>
          )}
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Búsqueda */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar alertas..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filtros rápidos */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-1">
              {filterButtons.map((filter) => (
                <Button
                  key={filter.type}
                  variant={activeFilter === filter.type ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterClick(filter.type)}
                  className={`text-xs ${
                    activeFilter === filter.type 
                      ? '' 
                      : `hover:${filter.color.replace('text-', 'text-').replace('bg-', 'bg-').replace('border-', 'border-')}`
                  }`}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filtros activos */}
      {(searchTerm || activeFilter) && (
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
          
          {activeFilter && (
            <Badge variant="secondary" className="gap-1">
              Tipo: {filterButtons.find(f => f.type === activeFilter)?.label}
              <button 
                onClick={() => onFilterChange?.('')}
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
