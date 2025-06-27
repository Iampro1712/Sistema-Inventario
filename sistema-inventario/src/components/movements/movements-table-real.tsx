"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RotateCcw, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Movement {
  id: string;
  type: string;
  quantity: number;
  reason: string;
  reference?: string;
  notes?: string;
  createdAt: string;
  createdBy?: string;
  product: {
    id: string;
    name: string;
    sku: string;
    category?: {
      name: string;
      color: string;
    };
  };
}

interface MovementFilters {
  search: string;
  type: string;
  productId: string;
  dateFrom: string;
  dateTo: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface MovementsTableRealProps {
  refreshTrigger?: number;
  filters?: MovementFilters;
  searchTerm?: string;
}

export function MovementsTableReal({ refreshTrigger, filters, searchTerm }: MovementsTableRealProps) {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
    fetchMovements();
  }, [refreshTrigger, filters, searchTerm, pagination.page]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      
      // Construir URL con parámetros
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      // Agregar filtros
      if (searchTerm) params.append('search', searchTerm);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.productId) params.append('productId', filters.productId);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      const response = await api.get(`/api/movimientos?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setMovements(data.movimientos);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
          hasNextPage: data.pagination.hasNextPage,
          hasPrevPage: data.pagination.hasPrevPage
        }));
      } else {
        console.error('Error al cargar movimientos');
      }
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'OUT':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'ADJUSTMENT':
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getMovementTypeBadge = (type: string) => {
    switch (type) {
      case 'IN':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Entrada</Badge>;
      case 'OUT':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Salida</Badge>;
      case 'ADJUSTMENT':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Ajuste</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatQuantity = (type: string, quantity: number) => {
    switch (type) {
      case 'IN':
        return `+${quantity}`;
      case 'OUT':
        return `-${quantity}`;
      case 'ADJUSTMENT':
        return `=${quantity}`;
      default:
        return quantity.toString();
    }
  };

  if (loading) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Cargando movimientos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (movements.length === 0) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-8">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm || filters ? 'No se encontraron movimientos' : 'No hay movimientos'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || filters 
                ? 'Intenta ajustar los filtros o términos de búsqueda.'
                : 'Los movimientos de inventario aparecerán aquí.'
              }
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
          Movimientos de Inventario ({pagination.total} total)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fecha</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tipo</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Producto</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cantidad</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Razón</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Referencia</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Usuario</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(movement.createdAt).toLocaleDateString('es-ES')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(movement.createdAt).toLocaleTimeString('es-ES')}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getMovementTypeIcon(movement.type)}
                      {getMovementTypeBadge(movement.type)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{movement.product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-muted px-1 rounded">
                          {movement.product.sku}
                        </code>
                        {movement.product.category && (
                          <Badge 
                            variant="outline"
                            style={{ 
                              borderColor: movement.product.category.color,
                              color: movement.product.category.color 
                            }}
                            className="text-xs"
                          >
                            {movement.product.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-mono font-medium ${
                      movement.type === 'IN' ? 'text-green-600' :
                      movement.type === 'OUT' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {formatQuantity(movement.type, movement.quantity)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm">{movement.reason}</p>
                    {movement.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {movement.notes}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm">
                      {movement.reference || '-'}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm">
                      {movement.createdBy || 'Sistema'}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} movimientos
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
