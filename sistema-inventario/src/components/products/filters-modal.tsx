"use client";

import { useState, useEffect } from "react";
import { Filter, X, RotateCcw } from "lucide-react";
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

interface Category {
  id: string;
  name: string;
  color: string;
}

interface ProductFilters {
  search: string;
  category: string;
  stockStatus: string;
  priceRange: {
    min: string;
    max: string;
  };
}

interface FiltersModalProps {
  onFiltersChange: (filters: ProductFilters) => void;
  activeFilters: ProductFilters;
}

export function FiltersModal({ onFiltersChange, activeFilters }: FiltersModalProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<ProductFilters>(activeFilters);

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categorias');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
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
    const resetFilters: ProductFilters = {
      search: '',
      category: '',
      stockStatus: '',
      priceRange: { min: '', max: '' }
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
    setOpen(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (activeFilters.search) count++;
    if (activeFilters.category) count++;
    if (activeFilters.stockStatus) count++;
    if (activeFilters.priceRange.min || activeFilters.priceRange.max) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

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
            Filtrar Productos
          </DialogTitle>
          <DialogDescription>
            Aplica filtros para encontrar productos específicos.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Búsqueda por texto */}
          <div>
            <label className="text-sm font-medium">Buscar por nombre o SKU</label>
            <Input
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Escribe para buscar..."
              className="mt-1"
            />
          </div>

          {/* Filtro por categoría */}
          <div>
            <label className="text-sm font-medium">Categoría</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por estado de stock */}
          <div>
            <label className="text-sm font-medium">Estado de Stock</label>
            <select
              value={filters.stockStatus}
              onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="">Todos los estados</option>
              <option value="in_stock">En Stock</option>
              <option value="low_stock">Stock Bajo</option>
              <option value="out_of_stock">Sin Stock</option>
            </select>
          </div>

          {/* Filtro por rango de precios */}
          <div>
            <label className="text-sm font-medium">Rango de Precios</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Input
                type="number"
                step="0.01"
                value={filters.priceRange.min}
                onChange={(e) => handleFilterChange('priceRange', {
                  ...filters.priceRange,
                  min: e.target.value
                })}
                placeholder="Precio mínimo"
              />
              <Input
                type="number"
                step="0.01"
                value={filters.priceRange.max}
                onChange={(e) => handleFilterChange('priceRange', {
                  ...filters.priceRange,
                  max: e.target.value
                })}
                placeholder="Precio máximo"
              />
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
                {activeFilters.category && (
                  <Badge variant="secondary">
                    Categoría: {categories.find(c => c.id === activeFilters.category)?.name}
                  </Badge>
                )}
                {activeFilters.stockStatus && (
                  <Badge variant="secondary">
                    Estado: {
                      activeFilters.stockStatus === 'in_stock' ? 'En Stock' :
                      activeFilters.stockStatus === 'low_stock' ? 'Stock Bajo' :
                      'Sin Stock'
                    }
                  </Badge>
                )}
                {(activeFilters.priceRange.min || activeFilters.priceRange.max) && (
                  <Badge variant="secondary">
                    Precio: ${activeFilters.priceRange.min || '0'} - ${activeFilters.priceRange.max || '∞'}
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
