"use client";

import { Download, TrendingUp, Package, DollarSign, AlertTriangle, BarChart3, Users, Calendar, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { ReportViewer } from "./report-viewer";

const reports = [
  {
    id: 1,
    title: "Inventario General",
    description: "Estado actual de todos los productos",
    icon: Package,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    lastGenerated: "Hace 2 horas",
    status: "ready",
  },
  {
    id: 2,
    title: "Movimientos del Mes",
    description: "Entradas y salidas del período actual",
    icon: TrendingUp,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/20",
    lastGenerated: "Hace 1 día",
    status: "ready",
  },
  {
    id: 3,
    title: "Valoración de Stock",
    description: "Valor monetario del inventario",
    icon: DollarSign,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    lastGenerated: "Hace 3 horas",
    status: "ready",
  },
  {
    id: 4,
    title: "Productos Críticos",
    description: "Stock bajo y productos sin existencias",
    icon: AlertTriangle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/20",
    lastGenerated: "Hace 30 min",
    status: "ready",
  },
  {
    id: 5,
    title: "Análisis de Ventas",
    description: "Productos más vendidos y tendencias",
    icon: BarChart3,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
    lastGenerated: "Generando...",
    status: "generating",
  },
  {
    id: 6,
    title: "Actividad de Usuarios",
    description: "Movimientos por usuario y período",
    icon: Users,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
    lastGenerated: "Hace 1 semana",
    status: "outdated",
  },
  {
    id: 7,
    title: "Reporte Mensual",
    description: "Resumen completo del mes",
    icon: Calendar,
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-100 dark:bg-teal-900/20",
    lastGenerated: "Hace 2 días",
    status: "ready",
  },
  {
    id: 8,
    title: "Rotación de Inventario",
    description: "Análisis de rotación por categoría",
    icon: BarChart3,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
    lastGenerated: "Hace 5 días",
    status: "ready",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ready":
      return { variant: "default" as const, text: "Listo", color: "text-green-600" };
    case "generating":
      return { variant: "secondary" as const, text: "Generando...", color: "text-blue-600" };
    case "outdated":
      return { variant: "destructive" as const, text: "Desactualizado", color: "text-orange-600" };
    case "error":
      return { variant: "destructive" as const, text: "Error", color: "text-red-600" };
    default:
      return { variant: "secondary" as const, text: "Pendiente", color: "text-gray-600" };
  }
};

export function ReportsGrid() {
  const [downloadingReports, setDownloadingReports] = useState<Set<number>>(new Set());
  const [viewingReport, setViewingReport] = useState<number | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [regeneratingReports, setRegeneratingReports] = useState<Set<number>>(new Set());
  const [reportStates, setReportStates] = useState<{[key: number]: {status: string, lastGenerated: string}}>({});

  // Función para actualizar timestamps de reportes listos
  const updateTimestamps = () => {
    const now = new Date();
    setReportStates(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        const reportId = parseInt(key);
        if (updated[reportId]?.status === 'ready') {
          const timeDiff = Math.floor((now.getTime() - new Date().getTime()) / 1000);
          if (timeDiff > 0) {
            updated[reportId] = {
              ...updated[reportId],
              lastGenerated: `Hace ${Math.floor(timeDiff / 60)} minutos`
            };
          }
        }
      });
      return updated;
    });
  };

  const handleDownload = async (report: typeof reports[0]) => {
    try {
      setDownloadingReports(prev => new Set(prev).add(report.id));

      // Mapear tipos de reporte
      const tipoMap: { [key: string]: string } = {
        'Inventario General': 'inventario',
        'Movimientos del Mes': 'movimientos',
        'Valoración de Stock': 'valoracion',
        'Productos Críticos': 'criticos',
        'Análisis de Ventas': 'ventas',
        'Actividad de Usuarios': 'usuarios',
        'Reporte Mensual': 'mensual',
        'Rotación de Inventario': 'rotacion'
      };

      const tipo = tipoMap[report.title] || 'general';

      toast.loading(`Generando ${report.title}...`);

      const response = await fetch(`/api/reportes/export?tipo=${tipo}&formato=json&periodo=6m`);

      if (response.ok) {
        const data = await response.json();

        // Crear y descargar archivo
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.dismiss();
        toast.success(`${report.title} descargado exitosamente`);
      } else {
        throw new Error('Error al generar reporte');
      }
    } catch (error) {
      toast.dismiss();
      toast.error(`Error al descargar ${report.title}`);
      console.error('Error:', error);
    } finally {
      setDownloadingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(report.id);
        return newSet;
      });
    }
  };

  const handleView = async (report: typeof reports[0]) => {
    try {
      setViewingReport(report.id);

      const tipoMap: { [key: string]: string } = {
        'Inventario General': 'inventario',
        'Movimientos del Mes': 'movimientos',
        'Valoración de Stock': 'valoracion',
        'Productos Críticos': 'criticos',
        'Análisis de Ventas': 'ventas',
        'Actividad de Usuarios': 'usuarios',
        'Reporte Mensual': 'mensual',
        'Rotación de Inventario': 'rotacion'
      };

      const tipo = tipoMap[report.title] || 'general';

      const response = await fetch(`/api/reportes/export?tipo=${tipo}&formato=json&periodo=6m`);

      if (response.ok) {
        const data = await response.json();
        setReportData(data);
        setShowViewer(true);
        toast.success(`${report.title} cargado exitosamente`);
      } else {
        throw new Error('Error al cargar reporte');
      }
    } catch (error) {
      toast.error(`Error al ver ${report.title}`);
      console.error('Error:', error);
    } finally {
      setViewingReport(null);
    }
  };

  const handleCloseViewer = () => {
    setShowViewer(false);
    setReportData(null);
  };

  const handleRegenerateReport = async (report: typeof reports[0]) => {
    try {
      setRegeneratingReports(prev => new Set(prev).add(report.id));

      // Actualizar estado inmediatamente a "generando"
      setReportStates(prev => ({
        ...prev,
        [report.id]: {
          status: 'generating',
          lastGenerated: 'Generando...'
        }
      }));

      const tipoMap: { [key: string]: string } = {
        'Inventario General': 'inventario',
        'Movimientos del Mes': 'movimientos',
        'Valoración de Stock': 'valoracion',
        'Productos Críticos': 'criticos',
        'Análisis de Ventas': 'ventas',
        'Actividad de Usuarios': 'usuarios',
        'Reporte Mensual': 'mensual',
        'Rotación de Inventario': 'rotacion'
      };

      const tipo = tipoMap[report.title] || 'general';

      // Simular tiempo de regeneración (2-3 segundos)
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Forzar regeneración del reporte
      const response = await fetch(`/api/reportes/export?tipo=${tipo}&formato=json&periodo=6m&force=true`);

      if (response.ok) {
        // Actualizar estado a "listo" con timestamp actual
        setReportStates(prev => ({
          ...prev,
          [report.id]: {
            status: 'ready',
            lastGenerated: 'Hace unos segundos'
          }
        }));

        toast.success(`${report.title} regenerado exitosamente`);
      } else {
        // Actualizar estado a "error"
        setReportStates(prev => ({
          ...prev,
          [report.id]: {
            status: 'error',
            lastGenerated: 'Error en la generación'
          }
        }));
        throw new Error('Error al regenerar reporte');
      }
    } catch (error) {
      // Actualizar estado a "error"
      setReportStates(prev => ({
        ...prev,
        [report.id]: {
          status: 'error',
          lastGenerated: 'Error en la generación'
        }
      }));

      toast.error(`Error al regenerar ${report.title}`);
      console.error('Error:', error);
    } finally {
      setRegeneratingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(report.id);
        return newSet;
      });
    }
  };

  return (
    <>
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {reports.map((report) => {
          // Usar estado dinámico si existe, sino usar el estado original
          const currentState = reportStates[report.id];
          const currentStatus = currentState?.status || report.status;
          const currentLastGenerated = currentState?.lastGenerated || report.lastGenerated;

          const statusBadge = getStatusBadge(currentStatus);
          const isDownloading = downloadingReports.has(report.id);
          const isViewing = viewingReport === report.id;
          const isRegenerating = regeneratingReports.has(report.id);
          const needsAction = currentStatus === 'generating' || currentStatus === 'outdated' || currentStatus === 'error';

          return (
            <Card key={report.id} className="animate-fade-in hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg ${report.bgColor} flex items-center justify-center shrink-0`}>
                      <report.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${report.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg truncate">{report.title}</CardTitle>
                    </div>
                  </div>
                  <Badge variant={statusBadge.variant} className="text-xs shrink-0">
                    {statusBadge.text}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {report.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-muted-foreground">
                  <span>Última actualización:</span>
                  <span className="font-medium">{currentLastGenerated}</span>
                </div>

                <div className="space-y-2">
                  {/* Botón de acción principal para reportes problemáticos */}
                  {needsAction && (
                    <Button
                      variant={currentStatus === 'error' ? 'destructive' : 'default'}
                      size="sm"
                      className="w-full touch-target"
                      disabled={isRegenerating}
                      onClick={() => handleRegenerateReport(report)}
                    >
                      {isRegenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 sm:mr-2 animate-spin" />
                          <span className="hidden sm:inline">Regenerando...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">
                            {currentStatus === 'generating' ? 'Reiniciar' :
                             currentStatus === 'outdated' ? 'Actualizar' : 'Reintentar'}
                          </span>
                          <span className="sm:hidden">
                            {currentStatus === 'generating' ? 'Reiniciar' :
                             currentStatus === 'outdated' ? 'Actualizar' : 'Reintentar'}
                          </span>
                        </>
                      )}
                    </Button>
                  )}

                  {/* Botones normales responsive */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 touch-target"
                      disabled={currentStatus === "generating" || isDownloading || isRegenerating}
                      onClick={() => handleDownload(report)}
                    >
                      <Download className={`h-4 w-4 sm:mr-2 ${isDownloading ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">{isDownloading ? 'Descargando...' : 'Descargar'}</span>
                      <span className="sm:hidden">{isDownloading ? '...' : 'Descargar'}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="touch-target"
                      disabled={currentStatus === "generating" || isViewing || isRegenerating}
                      onClick={() => handleView(report)}
                    >
                      {isViewing ? 'Abriendo...' : 'Ver'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Viewer Modal */}
      {showViewer && reportData && (
        <ReportViewer
          data={reportData}
          onClose={handleCloseViewer}
        />
      )}
    </>
  );
}
