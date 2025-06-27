"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

interface ChartData {
  name: string;
  entradas: number;
  salidas: number;
  stock: number;
}

export function InventoryChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reportes?periodo=6m');

      if (response.ok) {
        const data = await response.json();

        // Convertir salesData a formato del gráfico
        const formattedData = data.salesData?.map((item: any) => ({
          name: item.month,
          entradas: item.purchases || 0,
          salidas: item.sales || 0,
          stock: Math.max(1000 + (item.purchases - item.sales) * 10, 0) // Estimación del stock
        })) || [];

        setChartData(formattedData);
      } else {
        console.error('Error al cargar datos del inventario');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchInventoryData();

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchInventoryData, 30000);

    return () => clearInterval(interval);
  }, []);
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Tendencia de Inventario
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          {loading ? (
            <div className="h-64 w-full flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-64 w-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-lg font-medium mb-2">No hay datos disponibles</div>
                <div className="text-sm">Los gráficos aparecerán cuando haya datos de inventario</div>
              </div>
            </div>
          ) : (
            <div className="flex items-end justify-between h-48 gap-1 mb-4 overflow-hidden">
              {chartData.map((data, index) => {
                const maxValue = Math.max(...chartData.map(d => Math.max(d.entradas, d.salidas)));
                const entradasHeight = maxValue > 0 ? Math.max((data.entradas / maxValue) * 120, data.entradas > 0 ? 4 : 0) : 0;
                const salidasHeight = maxValue > 0 ? Math.max((data.salidas / maxValue) * 120, data.salidas > 0 ? 4 : 0) : 0;

                return (
                  <div key={data.name} className="flex flex-col items-center flex-1 min-w-0 max-w-[80px]">
                    <div className="flex flex-col items-center justify-end h-full gap-0.5 w-full max-w-[60px]">
                      {/* Barra de entradas */}
                      <div
                        className="w-full bg-green-500 rounded-t-sm opacity-80 hover:opacity-100 transition-all duration-200 cursor-pointer"
                        style={{
                          height: `${entradasHeight}px`,
                          maxHeight: '120px',
                          minHeight: data.entradas > 0 ? '4px' : '0px'
                        }}
                        title={`Entradas ${data.name}: ${data.entradas}`}
                      />
                      {/* Barra de salidas */}
                      <div
                        className="w-full bg-red-500 rounded-b-sm opacity-80 hover:opacity-100 transition-all duration-200 cursor-pointer"
                        style={{
                          height: `${salidasHeight}px`,
                          maxHeight: '120px',
                          minHeight: data.salidas > 0 ? '4px' : '0px'
                        }}
                        title={`Salidas ${data.name}: ${data.salidas}`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 font-medium truncate">
                      {data.name}
                    </span>
                    <div className="text-xs text-center">
                      <div className="text-green-600 font-medium text-[10px]">{data.entradas}</div>
                      <div className="text-red-600 font-medium text-[10px]">{data.salidas}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Leyenda */}
          {!loading && chartData.length > 0 && (
            <>
              <div className="flex justify-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-sm" />
                  <span className="text-muted-foreground">Entradas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-sm" />
                  <span className="text-muted-foreground">Salidas</span>
                </div>
              </div>

              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {mounted ? chartData[chartData.length - 1]?.entradas || 0 : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Entradas este mes</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {mounted ? chartData[chartData.length - 1]?.salidas || 0 : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Salidas este mes</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {mounted ? chartData[chartData.length - 1]?.stock || 0 : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Stock estimado</p>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
