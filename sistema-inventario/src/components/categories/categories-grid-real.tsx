"use client";

import { useState, useEffect } from "react";
import { Trash2, Package, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryDetailsModal } from "./category-details-modal";
import { CategoryEditModal } from "./category-edit-modal";

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  _count: {
    products: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface CategoriesGridRealProps {
  refreshTrigger?: number;
  searchTerm?: string;
}

export function CategoriesGridReal({ refreshTrigger, searchTerm }: CategoriesGridRealProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, [refreshTrigger]);

  useEffect(() => {
    applySearch();
  }, [categories, searchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categorias');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Error al cargar categorías');
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    let filtered = [...categories];

    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredCategories(filtered);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      return;
    }

    try {
      const response = await fetch(`/api/categorias/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategories(categories.filter(c => c.id !== categoryId));
      } else {
        const error = await response.json();
        alert(error.error || 'Error al eliminar categoría');
      }
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      alert('Error al eliminar categoría');
    }
  };

  if (loading) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Cargando categorías...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (categories.length === 0) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-8">
          <div className="text-center">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay categorías</h3>
            <p className="text-muted-foreground">
              Comienza creando tu primera categoría para organizar los productos.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredCategories.length === 0 && searchTerm) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-8">
          <div className="text-center">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No se encontraron categorías</h3>
            <p className="text-muted-foreground">
              Intenta ajustar el término de búsqueda.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredCategories.map((category) => (
        <Card key={category.id} className="animate-fade-in hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <div className="flex items-center gap-1">
                <CategoryDetailsModal category={category} />
                <CategoryEditModal
                  category={category}
                  onCategoryUpdated={fetchCategories}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  title="Eliminar categoría"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {category.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {category._count.products} productos
                  </span>
                </div>
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: category.color,
                    color: category.color 
                  }}
                >
                  {category.name}
                </Badge>
              </div>

              <div className="pt-2">
                <div 
                  className="h-2 rounded-full opacity-20"
                  style={{ backgroundColor: category.color }}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: category.color,
                      width: `${Math.min((category._count.products / 10) * 100, 100)}%`
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Actividad de productos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
