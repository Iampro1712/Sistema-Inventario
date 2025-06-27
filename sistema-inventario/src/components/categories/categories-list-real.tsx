"use client";

import { useState, useEffect } from "react";
import { Trash2, Package, Tag, Calendar } from "lucide-react";
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

interface CategoriesListRealProps {
  refreshTrigger?: number;
  searchTerm?: string;
}

export function CategoriesListReal({ refreshTrigger, searchTerm }: CategoriesListRealProps) {
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
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Lista de Categorías ({filteredCategories.length}{categories.length !== filteredCategories.length ? ` de ${categories.length}` : ''})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Categoría</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Descripción</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Color</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Productos</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fecha Creación</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <Badge 
                          variant="outline"
                          style={{ 
                            borderColor: category.color,
                            color: category.color 
                          }}
                          className="text-xs"
                        >
                          {category.name}
                        </Badge>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-muted-foreground">
                      {category.description || 'Sin descripción'}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border shadow-sm"
                        style={{ backgroundColor: category.color }}
                      />
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {category.color}
                      </code>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{category._count.products}</span>
                      <span className="text-sm text-muted-foreground">
                        {category._count.products === 1 ? 'producto' : 'productos'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {category.createdAt 
                          ? new Date(category.createdAt).toLocaleDateString('es-ES')
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Información adicional */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredCategories.length} categorías{categories.length !== filteredCategories.length ? ` de ${categories.length} total` : ''}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              <span>
                {filteredCategories.reduce((acc, cat) => acc + cat._count.products, 0)} productos total
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
