"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CategoriesGridReal } from "@/components/categories/categories-grid-real";
import { CategoriesListReal } from "@/components/categories/categories-list-real";
import { CategoriesHeader } from "@/components/categories/categories-header";

export default function CategoriesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [totalCategories, setTotalCategories] = useState(0);

  const handleCategoryCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  // Obtener el total de categorías
  useEffect(() => {
    const fetchTotalCategories = async () => {
      try {
        const response = await fetch('/api/categorias');
        if (response.ok) {
          const data = await response.json();
          setTotalCategories(data.length);
        }
      } catch (error) {
        console.error('Error al obtener total de categorías:', error);
      }
    };

    fetchTotalCategories();
  }, [refreshTrigger]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <CategoriesHeader
          onCategoryCreated={handleCategoryCreated}
          onSearchChange={handleSearchChange}
          onViewModeChange={handleViewModeChange}
          viewMode={viewMode}
          totalCategories={totalCategories}
        />
        {viewMode === 'grid' ? (
          <CategoriesGridReal
            refreshTrigger={refreshTrigger}
            searchTerm={searchTerm}
          />
        ) : (
          <CategoriesListReal
            refreshTrigger={refreshTrigger}
            searchTerm={searchTerm}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
