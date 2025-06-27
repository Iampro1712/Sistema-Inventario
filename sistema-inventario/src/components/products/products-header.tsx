"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProductFormModal } from "./product-form-modal";
import { ExportModal } from "./export-modal";
import { ImportModal } from "./import-modal";
import { FiltersModal } from "./filters-modal";

interface ProductFilters {
  search: string;
  category: string;
  stockStatus: string;
  priceRange: {
    min: string;
    max: string;
  };
}

interface ProductsHeaderProps {
  onProductCreated?: () => void;
  onFiltersChange?: (filters: ProductFilters) => void;
  onSearchChange?: (search: string) => void;
}

export function ProductsHeader({ onProductCreated, onFiltersChange, onSearchChange }: ProductsHeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: '',
    stockStatus: '',
    priceRange: { min: '', max: '' }
  });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange?.(value);
  };

  const handleFiltersChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">
            Gestiona tu inventario de productos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ImportModal onImportCompleted={onProductCreated} />
          <ExportModal />
          <ProductFormModal onProductCreated={onProductCreated} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="max-w-sm"
          />
          <FiltersModal
            onFiltersChange={handleFiltersChange}
            activeFilters={filters}
          />
        </div>
      </div>
    </div>
  );
}
