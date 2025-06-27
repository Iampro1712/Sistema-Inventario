"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, PieChart, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ReportsChartsProps {
  periodo?: string;
  filtros?: any;
  refreshTrigger?: number;
}

interface SalesData {
  month: string;
  sales: number;
  purchases: number;
}

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
  trend: number;
}

export function ReportsCharts({
  periodo = '6m',
  filtros,
  refreshTrigger = 0
}: ReportsChartsProps) {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchReportsData();

    const interval = setInterval(fetchReportsData, 30000);

    return () => clearInterval(interval);
  }, [periodo, filtros, refreshTrigger]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        periodo,
        ...(filtros?.categoria && { categoria: filtros.categoria })
      });
      
      const response = await fetch(`/api/reportes?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setSalesData(data.salesData || []);
        setCategoryData(data.categoryDistribution || []);
        setTopProducts(data.topProducts || []);
        setLastUpdate(new Date());
      } else {
        console.error('Error al cargar datos de reportes');
      }
    } catch (error) {
      console.error('Error al cargar datos de reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchReportsData();
  };

  const maxSalesValue = salesData.length > 0 
    ? Math.max(...salesData.map(d => Math.max(d.sales, d.purchases))) 
    : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {mounted ? `Última actualización: ${lastUpdate.toLocaleTimeString()}` : 'Cargando...'}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="animate-fade-in lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ventas vs Compras ({periodo === '1m' ? '1 mes' : periodo === '3m' ? '3 meses' : periodo === '6m' ? '6 meses' : '1 año'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 w-full flex items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : salesData.length === 0 ? (
              <div className="h-80 w-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-lg font-medium mb-2">No hay datos disponibles</div>
                  <div className="text-sm">Los gráficos aparecerán cuando haya datos de ventas y compras</div>
                </div>
              </div>
            ) : (
              <div className="h-80 w-full overflow-hidden">
                <div className="flex items-end justify-between h-48 gap-1 mb-4 px-2">
                  {salesData.map((data, index) => {
                    const salesHeight = maxSalesValue > 0 ? Math.max((data.sales / maxSalesValue) * 120, data.sales > 0 ? 4 : 0) : 0;
                    const purchasesHeight = maxSalesValue > 0 ? Math.max((data.purchases / maxSalesValue) * 120, data.purchases > 0 ? 4 : 0) : 0;

                    return (
                      <div key={data.month} className="flex flex-col items-center flex-1 min-w-0 max-w-[80px]">
                        <div className="flex flex-col items-center justify-end h-full gap-0.5 w-full max-w-[60px]">
                          {/* Barra de Ventas */}
                          <div
                            className="w-full bg-blue-500 rounded-t-sm opacity-80 hover:opacity-100 transition-all duration-200 cursor-pointer"
                            style={{
                              height: `${salesHeight}px`,
                              maxHeight: '120px',
                              minHeight: data.sales > 0 ? '4px' : '0px'
                            }}
                            title={`Ventas ${data.month}: ${data.sales} unidades`}
                          />
                          {/* Barra de Compras */}
                          <div
                            className="w-full bg-green-500 rounded-b-sm opacity-80 hover:opacity-100 transition-all duration-200 cursor-pointer"
                            style={{
                              height: `${purchasesHeight}px`,
                              maxHeight: '120px',
                              minHeight: data.purchases > 0 ? '4px' : '0px'
                            }}
                            title={`Compras ${data.month}: ${data.purchases} unidades`}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 font-medium truncate">
                          {data.month}
                        </span>
                        <div className="text-xs text-center">
                          <div className="text-blue-600 font-medium text-[10px]">{data.sales}</div>
                          <div className="text-green-600 font-medium text-[10px]">{data.purchases}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                    <span className="text-muted-foreground">Ventas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-sm" />
                    <span className="text-muted-foreground">Compras</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribución por Categorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-40 w-full flex items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {categoryData.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-sm"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${category.percentage}%`,
                            backgroundColor: category.color
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">
                        {category.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
                {categoryData.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No hay datos de categorías disponibles
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Productos */}
        <Card className="animate-fade-in lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Productos Más Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-40 w-full flex items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 font-medium text-muted-foreground">Producto</th>
                      <th className="text-left py-2 px-4 font-medium text-muted-foreground">Ventas</th>
                      <th className="text-left py-2 px-4 font-medium text-muted-foreground">Ingresos</th>
                      <th className="text-left py-2 px-4 font-medium text-muted-foreground">Tendencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, index) => (
                      <tr key={product.name} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground">
                              #{index + 1}
                            </span>
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{product.sales} unidades</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">${product.revenue.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600 dark:text-green-400">
                              +{product.trend}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {topProducts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          No hay datos de productos disponibles
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
