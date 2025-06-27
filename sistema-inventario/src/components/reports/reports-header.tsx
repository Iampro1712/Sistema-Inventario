"use client";

import { Download, Calendar, Filter, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ReportsHeaderProps {
  onPeriodoChange?: (periodo: string) => void;
  onFiltroChange?: (filtro: any) => void;
  currentPeriodo?: string;
}

export function ReportsHeader({
  onPeriodoChange,
  onFiltroChange,
  currentPeriodo = '6m'
}: ReportsHeaderProps) {
  const [isExporting, setIsExporting] = useState(false);

  const periodos = [
    { value: '1m', label: '1 Mes' },
    { value: '3m', label: '3 Meses' },
    { value: '6m', label: '6 Meses' },
    { value: '1y', label: '1 Año' }
  ];

  const filtros = [
    { value: 'todos', label: 'Todos los productos' },
    { value: 'electronicos', label: 'Electrónicos' },
    { value: 'accesorios', label: 'Accesorios' },
    { value: 'audio', label: 'Audio' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'otros', label: 'Otros' }
  ];

  const handlePeriodoChange = (periodo: string) => {
    onPeriodoChange?.(periodo);
    toast.success(`Período cambiado a ${periodos.find(p => p.value === periodo)?.label}`);
  };

  const handleFiltroChange = (filtro: string) => {
    onFiltroChange?.({ categoria: filtro });
    toast.success(`Filtro aplicado: ${filtros.find(f => f.value === filtro)?.label}`);
  };

  const handleExportarTodo = async () => {
    try {
      setIsExporting(true);
      toast.loading('Generando reporte completo...');

      const response = await fetch(`/api/reportes/export?tipo=general&formato=json&periodo=${currentPeriodo}`);

      if (response.ok) {
        const data = await response.json();

        // Crear y descargar archivo JSON
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_completo_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.dismiss();
        toast.success('Reporte exportado exitosamente');
      } else {
        throw new Error('Error al exportar');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Error al exportar el reporte');
      console.error('Error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">
            Análisis y estadísticas de tu inventario
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Período
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {periodos.map((periodo) => (
                <DropdownMenuItem
                  key={periodo.value}
                  onClick={() => handlePeriodoChange(periodo.value)}
                  className={currentPeriodo === periodo.value ? 'bg-accent' : ''}
                >
                  {periodo.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {filtros.map((filtro) => (
                <DropdownMenuItem
                  key={filtro.value}
                  onClick={() => handleFiltroChange(filtro.value)}
                >
                  {filtro.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            onClick={handleExportarTodo}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isExporting ? 'Exportando...' : 'Exportar Todo'}
          </Button>
        </div>
      </div>
    </div>
  );
}
