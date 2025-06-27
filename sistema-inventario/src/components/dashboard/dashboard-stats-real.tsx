"use client";

import { useState, useEffect } from "react";
import { Package, Tag, Users, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalUsers: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  recentMovements: number;
  totalInventoryValue: number;
  lowStockProductsList: Array<{
    id: string;
    name: string;
    stock: number;
    minStock: number;
    category?: {
      name: string;
      color: string;
    };
  }>;
  recentMovementsList: Array<{
    id: string;
    type: string;
    quantity: number;
    reason: string;
    createdAt: string;
    product: {
      name: string;
      sku: string;
    };
    user: {
      name: string;
    };
  }>;
  categoryDistribution: Array<{
    id: string;
    name: string;
    color: string;
    _count: {
      products: number;
    };
  }>;
}

export function DashboardStatsReal() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Error al cargar estadísticas');
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="py-8">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Error al cargar las estadísticas
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMovementTypeText = (type: string) => {
    switch (type) {
      case 'IN':
        return 'Entrada';
      case 'OUT':
        return 'Salida';
      case 'ADJUSTMENT':
        return 'Ajuste';
      default:
        return type;
    }
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'IN':
        return 'text-green-600';
      case 'OUT':
        return 'text-red-600';
      case 'ADJUSTMENT':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-enhanced animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <Package className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.lowStockProducts > 0 && (
                <span className="text-orange-600">
                  {stats.lowStockProducts} con stock bajo
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="card-enhanced animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalInventoryValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor total estimado
            </p>
          </CardContent>
        </Card>

        <Card className="card-enhanced animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
              <Tag className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              Organizando productos
            </p>
          </CardContent>
        </Card>

        <Card className="card-enhanced animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimientos (7d)</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
              <Activity className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentMovements}</div>
            <p className="text-xs text-muted-foreground">
              Actividad reciente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas y movimientos recientes */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Productos con stock bajo */}
        <Card className="card-enhanced animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              Alertas de Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.lowStockProductsList.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                ¡Excelente! No hay productos con stock bajo.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.lowStockProductsList.map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      {product.category && (
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
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {product.stock} / {product.minStock}
                      </p>
                      <Badge variant={product.stock === 0 ? "destructive" : "secondary"}>
                        {product.stock === 0 ? "Sin Stock" : "Stock Bajo"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Movimientos recientes */}
        <Card className="card-enhanced animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              Movimientos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentMovementsList.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No hay movimientos recientes.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentMovementsList.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{movement.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {movement.reason} • {movement.user.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getMovementTypeColor(movement.type)}`}>
                        {movement.type === 'OUT' ? '-' : '+'}{movement.quantity}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getMovementTypeText(movement.type)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
