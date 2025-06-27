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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground">
            Organiza tus productos por categorías
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CategoryImportModal onImportCompleted={onCategoryCreated} />
          <CategoryExportModal />
          <CategoryFormModal onCategoryCreated={onCategoryCreated} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Input
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex items-center gap-1 border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange?.('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange?.('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Badge variant="secondary">
          {totalCategories} {totalCategories === 1 ? 'categoría' : 'categorías'}
        </Badge>
      </div>
    </div>
  );
}
