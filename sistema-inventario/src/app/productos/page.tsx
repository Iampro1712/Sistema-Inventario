"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProductsTableReal } from "@/components/products/products-table-real";
import { ProductsHeader } from "@/components/products/products-header";

interface ProductFilters {
  search: string;
  category: string;
  stockStatus: string;
  priceRange: {
    min: string;
    max: string;
  };
}

export default function ProductsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: '',
    stockStatus: '',
    priceRange: { min: '', max: '' }
  });
  const [searchTerm, setSearchTerm] = useState('');

  const handleProductCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFiltersChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ProductsHeader
          onProductCreated={handleProductCreated}
          onFiltersChange={handleFiltersChange}
          onSearchChange={handleSearchChange}
        />
        <ProductsTableReal
          refreshTrigger={refreshTrigger}
          filters={filters}
          searchTerm={searchTerm}
        />
      </div>
    </DashboardLayout>
  );
}
