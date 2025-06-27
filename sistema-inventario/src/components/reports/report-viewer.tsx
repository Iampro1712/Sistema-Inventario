"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Package,
  DollarSign,
  Users,
  BarChart3
} from "lucide-react";

interface ReportViewerProps {
  data: any;
  onClose: () => void;
}

export function ReportViewer({ data, onClose }: ReportViewerProps) {
  const getReportIcon = (tipo: string) => {
    const iconMap: { [key: string]: any } = {
      'inventario': Package,
      'movimientos': BarChart3,
      'valoracion': DollarSign,
      'criticos': AlertTriangle,
      'ventas': TrendingUp,
      'usuarios': Users,
      'mensual': Calendar,
      'rotacion': FileText
    };
    return iconMap[tipo] || FileText;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.titulo?.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderInventarioReport = () => (
    <div className="space-y-6">
      {/* Resumen */}
      {data.resumen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Resumen General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{data.resumen.totalProductos}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Total Productos</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {formatCurrency(data.resumen.valorTotalInventario)}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Valor Total</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-red-600">{data.resumen.productosCriticos}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Productos Críticos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de productos */}
      {data.productos && data.productos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalle de Productos</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Vista de tabla para desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Producto</th>
                    <th className="text-left py-2 px-4 font-medium">SKU</th>
                    <th className="text-left py-2 px-4 font-medium">Categoría</th>
                    <th className="text-left py-2 px-4 font-medium">Stock</th>
                    <th className="text-left py-2 px-4 font-medium">Precio</th>
                    <th className="text-left py-2 px-4 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.productos.map((producto: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4 font-medium">{producto.nombre}</td>
                      <td className="py-2 px-4 text-muted-foreground">{producto.sku}</td>
                      <td className="py-2 px-4">{producto.categoria}</td>
                      <td className="py-2 px-4">{producto.stock}</td>
                      <td className="py-2 px-4">{formatCurrency(producto.precio)}</td>
                      <td className="py-2 px-4">
                        <Badge variant={
                          producto.estado === 'Crítico' ? 'destructive' :
                          producto.estado === 'Bajo' ? 'secondary' : 'default'
                        }>
                          {producto.estado}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista de cards para móvil */}
            <div className="lg:hidden space-y-3 max-h-96 overflow-y-auto custom-scroll">
              {data.productos.map((producto: any, index: number) => (
                <div key={index} className="border rounded-lg p-3 bg-card">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm truncate flex-1">{producto.nombre}</h4>
                      <Badge variant={
                        producto.estado === 'Crítico' ? 'destructive' :
                        producto.estado === 'Bajo' ? 'secondary' : 'default'
                      } className="text-xs ml-2">
                        {producto.estado}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">SKU:</span>
                        <p className="font-mono">{producto.sku}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Categoría:</span>
                        <p>{producto.categoria}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Stock:</span>
                        <p className="font-medium">{producto.stock}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Precio:</span>
                        <p className="font-medium">{formatCurrency(producto.precio)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderMovimientosReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Movimientos del Período</CardTitle>
          <p className="text-sm text-muted-foreground">Período: {data.periodo}</p>
        </CardHeader>
        <CardContent>
          {data.movimientos && data.movimientos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Fecha</th>
                    <th className="text-left py-2 px-4 font-medium">Tipo</th>
                    <th className="text-left py-2 px-4 font-medium">Producto</th>
                    <th className="text-left py-2 px-4 font-medium">Cantidad</th>
                    <th className="text-left py-2 px-4 font-medium">Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.movimientos.map((mov: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">{formatDate(mov.fecha)}</td>
                      <td className="py-2 px-4">
                        <Badge variant={mov.tipo === 'Entrada' ? 'default' : 'secondary'}>
                          {mov.tipo}
                        </Badge>
                      </td>
                      <td className="py-2 px-4 font-medium">{mov.producto}</td>
                      <td className="py-2 px-4">{mov.cantidad}</td>
                      <td className="py-2 px-4 text-muted-foreground">{mov.motivo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay movimientos en este período
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderValoracionReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Valoración Total del Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {formatCurrency(data.valorTotal)}
            </div>
            <div className="text-muted-foreground">Valor Total del Inventario</div>
          </div>
        </CardContent>
      </Card>

      {data.productos && (
        <Card>
          <CardHeader>
            <CardTitle>Productos por Valor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Producto</th>
                    <th className="text-left py-2 px-4 font-medium">Stock</th>
                    <th className="text-left py-2 px-4 font-medium">Precio Unit.</th>
                    <th className="text-left py-2 px-4 font-medium">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.productos.map((producto: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4 font-medium">{producto.nombre}</td>
                      <td className="py-2 px-4">{producto.stock}</td>
                      <td className="py-2 px-4">{formatCurrency(producto.precio)}</td>
                      <td className="py-2 px-4 font-bold text-green-600">
                        {formatCurrency(producto.valorIndividual)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCriticosReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Productos Críticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.productos && data.productos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Producto</th>
                    <th className="text-left py-2 px-4 font-medium">SKU</th>
                    <th className="text-left py-2 px-4 font-medium">Stock Actual</th>
                    <th className="text-left py-2 px-4 font-medium">Stock Mínimo</th>
                    <th className="text-left py-2 px-4 font-medium">Estado</th>
                    <th className="text-left py-2 px-4 font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {data.productos.map((producto: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4 font-medium">{producto.nombre}</td>
                      <td className="py-2 px-4 text-muted-foreground">{producto.sku}</td>
                      <td className="py-2 px-4">
                        <span className={producto.stockActual === 0 ? 'text-red-600 font-bold' : 'text-orange-600'}>
                          {producto.stockActual}
                        </span>
                      </td>
                      <td className="py-2 px-4">{producto.stockMinimo}</td>
                      <td className="py-2 px-4">
                        <Badge variant={producto.stockActual === 0 ? 'destructive' : 'secondary'}>
                          {producto.estado}
                        </Badge>
                      </td>
                      <td className="py-2 px-4">
                        <Badge variant="outline" className="text-xs">
                          {producto.accionRequerida}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <div className="text-lg font-medium text-green-600">¡Excelente!</div>
              <div className="text-muted-foreground">No hay productos críticos en este momento</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderVentasReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análisis de Ventas - {data.periodo}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.productos && data.productos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Producto</th>
                    <th className="text-left py-2 px-4 font-medium">Categoría</th>
                    <th className="text-left py-2 px-4 font-medium">Cantidad Vendida</th>
                    <th className="text-left py-2 px-4 font-medium">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {data.productos.map((producto: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4 font-medium">{producto.producto}</td>
                      <td className="py-2 px-4">{producto.categoria}</td>
                      <td className="py-2 px-4">{producto.cantidadVendida} unidades</td>
                      <td className="py-2 px-4 font-bold text-green-600">
                        {formatCurrency(producto.ingresos)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay datos de ventas en este período
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderUsuariosReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Actividad de Usuarios - {data.periodo}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {data.totalMovimientos}
              </div>
              <div className="text-muted-foreground">Total de Movimientos</div>
            </div>
            <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {data.usuarios?.length || 0}
              </div>
              <div className="text-muted-foreground">Usuarios Activos</div>
            </div>
          </div>

          {data.usuarios && data.usuarios.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Detalle por Usuario</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 font-medium">Usuario</th>
                      <th className="text-left py-2 px-4 font-medium">Movimientos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.usuarios.map((usuario: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4 font-medium">{usuario.nombre}</td>
                        <td className="py-2 px-4">{usuario.movimientos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderMensualReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reporte Mensual - {data.mes}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.resumen && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {data.resumen.totalProductos}
                </div>
                <div className="text-muted-foreground">Total de Productos</div>
              </div>
              <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {data.resumen.movimientosDelMes}
                </div>
                <div className="text-muted-foreground">Movimientos del Mes</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderRotacionReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Rotación de Inventario
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.categorias && data.categorias.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Categoría</th>
                    <th className="text-left py-2 px-4 font-medium">Total Productos</th>
                    <th className="text-left py-2 px-4 font-medium">Rotación</th>
                  </tr>
                </thead>
                <tbody>
                  {data.categorias.map((categoria: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4 font-medium">{categoria.categoria}</td>
                      <td className="py-2 px-4">{categoria.totalProductos}</td>
                      <td className="py-2 px-4">
                        <Badge variant="outline">{categoria.rotacion}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay datos de rotación disponibles
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderGenericReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos del Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );

  const renderReportContent = () => {
    const tipo = data.tipo?.toLowerCase() || '';

    if (tipo.includes('inventario') || (data.productos && data.resumen)) {
      return renderInventarioReport();
    } else if (tipo.includes('movimientos') || data.movimientos) {
      return renderMovimientosReport();
    } else if (tipo.includes('valoracion') || data.valorTotal !== undefined) {
      return renderValoracionReport();
    } else if (tipo.includes('criticos')) {
      return renderCriticosReport();
    } else if (tipo.includes('ventas') || (data.productos && data.periodo)) {
      return renderVentasReport();
    } else if (tipo.includes('usuarios') || data.totalMovimientos !== undefined) {
      return renderUsuariosReport();
    } else if (tipo.includes('mensual') || data.mes) {
      return renderMensualReport();
    } else if (tipo.includes('rotacion') || data.categorias) {
      return renderRotacionReport();
    } else {
      return renderGenericReport();
    }
  };

  const ReportIcon = getReportIcon(data.tipo?.toLowerCase() || '');

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto safe-area custom-scroll">
      <div className="container mx-auto p-3 sm:p-6 max-w-7xl min-h-screen">
        {/* Header responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <ReportIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold truncate">{data.titulo || data.tipoDisplay || 'Reporte'}</h1>
              <p className="text-muted-foreground text-sm">
                Generado el: {data.exportedAt ? formatDate(data.exportedAt) : 'Ahora'}
              </p>
            </div>
          </div>

          {/* Botones responsive */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleDownload} className="w-full sm:w-auto touch-target">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Descargar JSON</span>
              <span className="sm:hidden">Descargar</span>
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto touch-target">
              Cerrar
            </Button>
          </div>
        </div>

        {/* Content responsive */}
        <div className="pb-6">
          {renderReportContent()}
        </div>
      </div>
    </div>
  );
}
