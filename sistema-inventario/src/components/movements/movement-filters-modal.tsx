"use client";

import { useState, useEffect } from "react";
import { Filter, X, RotateCcw, TrendingUp, TrendingDown, RotateCcw as Adjust } from "lucide-react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface MovementFilters {
  search: string;
  type: string;
  productId: string;
  dateFrom: string;
  dateTo: string;
}

interface MovementFiltersModalProps {
  onFiltersChange: (filters: MovementFilters) => void;
  activeFilters: MovementFilters;
}

export function MovementFiltersModal({ onFiltersChange, activeFilters }: MovementFiltersModalProps) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<MovementFilters>(activeFilters);

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/productos');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const handleFilterChange = (key: keyof MovementFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(filters);
    setOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters: MovementFilters = {
      search: '',
      type: '',
      productId: '',
      dateFrom: '',
      dateTo: ''
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
    setOpen(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (activeFilters.search) count++;
    if (activeFilters.type) count++;
    if (activeFilters.productId) count++;
    if (activeFilters.dateFrom || activeFilters.dateTo) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'OUT':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'ADJUSTMENT':
        return <Adjust className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getMovementTypeName = (type: string) => {
    switch (type) {
      case 'IN':
        return 'Entrada';
      case 'OUT':
        return 'Salida';
      case 'ADJUSTMENT':
        return 'Ajuste';
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative w-full sm:w-auto">
          <Filter className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Filtros</span>
          {activeFiltersCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtrar Movimientos
          </DialogTitle>
          <DialogDescription>
            Aplica filtros para encontrar movimientos específicos.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Búsqueda por texto */}
          <div>
            <label className="text-sm font-medium">Buscar por producto o razón</label>
            <Input
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Escribe para buscar..."
              className="mt-1"
            />
          </div>

          {/* Filtro por tipo de movimiento */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de Movimiento</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleFilterChange('type', '')}
                className={`p-2 border rounded-lg text-sm transition-all ${
                  filters.type === '' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                Todos
              </button>
              {[
                { value: 'IN', label: 'Entrada', icon: TrendingUp, color: 'text-green-600' },
                { value: 'OUT', label: 'Salida', icon: TrendingDown, color: 'text-red-600' },
                { value: 'ADJUSTMENT', label: 'Ajuste', icon: Adjust, color: 'text-blue-600' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleFilterChange('type', type.value)}
                  className={`p-2 border rounded-lg transition-all ${
                    filters.type === type.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <type.icon className={`h-4 w-4 ${type.color}`} />
                    <span className="text-xs">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filtro por producto */}
          <div>
            <label className="text-sm font-medium">Producto</label>
            <select
              value={filters.productId}
              onChange={(e) => handleFilterChange('productId', e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="">Todos los productos</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por rango de fechas */}
          <div>
            <label className="text-sm font-medium">Rango de Fechas</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <label className="text-xs text-muted-foreground">Desde</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Hasta</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Vista previa de filtros activos */}
          {activeFiltersCount > 0 && (
            <div className="bg-muted p-3 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Filtros activos:</h4>
              <div className="flex flex-wrap gap-2">
                {activeFilters.search && (
                  <Badge variant="secondary">
                    Búsqueda: "{activeFilters.search}"
                  </Badge>
                )}
                {activeFilters.type && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getMovementTypeIcon(activeFilters.type)}
                    Tipo: {getMovementTypeName(activeFilters.type)}
                  </Badge>
                )}
                {activeFilters.productId && (
                  <Badge variant="secondary">
                    Producto: {products.find(p => p.id === activeFilters.productId)?.name}
                  </Badge>
                )}
                {(activeFilters.dateFrom || activeFilters.dateTo) && (
                  <Badge variant="secondary">
                    Fechas: {activeFilters.dateFrom || '∞'} - {activeFilters.dateTo || '∞'}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleResetFilters}
            disabled={activeFiltersCount === 0}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button onClick={handleApplyFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
