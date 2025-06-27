"use client";

import { useState } from "react";
import { Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CategoryFormModal } from "./category-form-modal";
import { CategoryExportModal } from "./category-export-modal";
import { CategoryImportModal } from "./category-import-modal";

interface CategoriesHeaderProps {
  onCategoryCreated?: () => void;
  onSearchChange?: (search: string) => void;
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  viewMode?: 'grid' | 'list';
  totalCategories?: number;
}

export function CategoriesHeader({
  onCategoryCreated,
  onSearchChange,
  onViewModeChange,
  viewMode = 'grid',
  totalCategories = 0
}: CategoriesHeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange?.(value);
  };
  return (
    <div className="space-y-4">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Organiza tus productos por categorías
          </p>
        </div>
        {/* Botones de acción - responsive */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="grid grid-cols-3 sm:flex gap-2">
            <CategoryImportModal onImportCompleted={onCategoryCreated} />
            <CategoryExportModal />
            <CategoryFormModal onCategoryCreated={onCategoryCreated} />
          </div>
        </div>
      </div>

      {/* Búsqueda, vista y contador - responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
          <Input
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full sm:max-w-sm"
          />
          {/* Selector de vista - responsive */}
          <div className="flex items-center gap-1 border rounded-md w-full sm:w-auto">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange?.('grid')}
              className="rounded-r-none flex-1 sm:flex-none"
            >
              <Grid className="h-4 w-4 sm:mr-0" />
              <span className="ml-2 sm:hidden">Grid</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange?.('list')}
              className="rounded-l-none flex-1 sm:flex-none"
            >
              <List className="h-4 w-4 sm:mr-0" />
              <span className="ml-2 sm:hidden">Lista</span>
            </Button>
          </div>
        </div>

        {/* Badge contador - responsive */}
        <div className="flex justify-center sm:justify-end">
          <Badge variant="secondary" className="text-sm">
            {totalCategories} {totalCategories === 1 ? 'categoría' : 'categorías'}
          </Badge>
        </div>
      </div>
    </div>
  );
}
