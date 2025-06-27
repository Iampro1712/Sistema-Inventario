"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Trash2, Package, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductDetailsModal } from "./product-details-modal";
import { ProductEditModal } from "./product-edit-modal";

interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  createdAt: string;
  updatedAt: string;
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

interface ProductsTableRealProps {
  refreshTrigger?: number;
  filters?: ProductFilters;
  searchTerm?: string;
}

export function ProductsTableReal({ refreshTrigger, filters, searchTerm }: ProductsTableRealProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingProducts, setDeletingProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  useEffect(() => {
    applyFilters();
  }, [products, filters, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/productos');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Error al cargar productos');
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Filtro por búsqueda de texto
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtros adicionales
    if (filters) {
      // Filtro por categoría
      if (filters.category) {
        filtered = filtered.filter(product => product.categoryId === filters.category);
      }

      // Filtro por estado de stock
      if (filters.stockStatus) {
        filtered = filtered.filter(product => {
          switch (filters.stockStatus) {
            case 'in_stock':
              return product.stock > product.minStock;
            case 'low_stock':
              return product.stock > 0 && product.stock <= product.minStock;
            case 'out_of_stock':
              return product.stock === 0;
            default:
              return true;
          }
        });
      }

      // Filtro por rango de precios
      if (filters.priceRange.min) {
        filtered = filtered.filter(product => product.price >= parseFloat(filters.priceRange.min));
      }
      if (filters.priceRange.max) {
        filtered = filtered.filter(product => product.price <= parseFloat(filters.priceRange.max));
      }
    }

    setFilteredProducts(filtered);
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) {
      return { variant: "destructive" as const, text: "Sin Stock" };
    } else if (stock <= minStock) {
      return { variant: "secondary" as const, text: "Stock Bajo" };
    } else {
      return { variant: "outline" as const, text: "En Stock" };
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    if (deletingProducts.has(productId)) return;

    setDeletingProducts(prev => new Set(prev).add(productId));
    try {
      const response = await fetch(`/api/productos/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
      } else {
        const error = await response.json();
        alert(error.error || 'Error al eliminar producto');
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar producto');
    } finally {
      setDeletingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Cargando productos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-8">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay productos</h3>
            <p className="text-muted-foreground">
              Comienza agregando tu primer producto al inventario.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredProducts.length === 0 && (searchTerm || filters)) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-8">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No se encontraron productos</h3>
            <p className="text-muted-foreground">
              Intenta ajustar los filtros o términos de búsqueda.
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
          <Package className="h-5 w-5" />
          Lista de Productos ({filteredProducts.length}{products.length !== filteredProducts.length ? ` de ${products.length}` : ''})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Vista de tabla para desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Producto</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">SKU</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Categoría</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Precio</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock, product.minStock);

                return (
                  <tr key={product.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.description && (
                          <p className="text-sm text-muted-foreground">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {product.sku}
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      {product.category ? (
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: product.category.color,
                            color: product.category.color
                          }}
                        >
                          {product.category.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sin categoría</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">${product.price.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          Costo: ${product.cost.toFixed(2)}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{product.stock} unidades</p>
                        <p className="text-sm text-muted-foreground">
                          Mín: {product.minStock}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={stockStatus.variant}>
                        {stockStatus.text}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <ProductDetailsModal product={product} />
                        <ProductEditModal
                          product={product}
                          onProductUpdated={fetchProducts}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingProducts.has(product.id)}
                          title={deletingProducts.has(product.id) ? "Eliminando..." : "Eliminar producto"}
                          className={deletingProducts.has(product.id) ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          {deletingProducts.has(product.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" title="Más opciones">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Vista de cards para móvil y tablet */}
        <div className="lg:hidden space-y-4">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock, product.minStock);

            return (
              <Card key={product.id} className="border border-border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header del producto */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-base truncate">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <Badge variant={stockStatus.variant} className="ml-2 shrink-0">
                        {stockStatus.text}
                      </Badge>
                    </div>

                    {/* Información del producto */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">SKU:</span>
                        <code className="ml-1 bg-muted px-1 py-0.5 rounded text-xs">
                          {product.sku}
                        </code>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Categoría:</span>
                        <div className="mt-1">
                          {product.category ? (
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: product.category.color,
                                color: product.category.color
                              }}
                            >
                              {product.category.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">Sin categoría</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Precio:</span>
                        <p className="font-medium">${product.price.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          Costo: ${product.cost.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Stock:</span>
                        <p className="font-medium">{product.stock} unidades</p>
                        <p className="text-xs text-muted-foreground">
                          Mín: {product.minStock}
                        </p>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center justify-end gap-1 pt-2 border-t">
                      <ProductDetailsModal product={product} />
                      <ProductEditModal
                        product={product}
                        onProductUpdated={fetchProducts}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingProducts.has(product.id)}
                        title={deletingProducts.has(product.id) ? "Eliminando..." : "Eliminar producto"}
                        className={deletingProducts.has(product.id) ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        {deletingProducts.has(product.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" title="Más opciones">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Paginación responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-4 border-t">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Mostrando {filteredProducts.length} productos{products.length !== filteredProducts.length ? ` de ${products.length} total` : ''}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled className="hidden sm:inline-flex">
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled className="sm:hidden">
              ←
            </Button>
            <Button variant="outline" size="sm">
              1
            </Button>
            <Button variant="outline" size="sm" disabled className="hidden sm:inline-flex">
              Siguiente
            </Button>
            <Button variant="outline" size="sm" disabled className="sm:hidden">
              →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
