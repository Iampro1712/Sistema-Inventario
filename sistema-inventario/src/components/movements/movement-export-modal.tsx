"use client";

import { useState } from "react";
import { Download, FileText, Database, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MovementExportModalProps {
  currentFilters?: {
    search?: string;
    type?: string;
    productId?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export function MovementExportModal({ currentFilters }: MovementExportModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json'>('csv');
  const [exportFilters, setExportFilters] = useState({
    dateFrom: currentFilters?.dateFrom || '',
    dateTo: currentFilters?.dateTo || '',
    applyCurrentFilters: true
  });

  const handleExport = async () => {
    setLoading(true);
    
    try {
      let url = '/api/movimientos/export';
      let response;

      if (selectedFormat === 'csv') {
        // Para CSV, usar GET con query parameters
        const params = new URLSearchParams();
        
        if (exportFilters.applyCurrentFilters && currentFilters) {
          if (currentFilters.search) params.append('search', currentFilters.search);
          if (currentFilters.type) params.append('type', currentFilters.type);
          if (currentFilters.productId) params.append('productId', currentFilters.productId);
        }
        
        if (exportFilters.dateFrom) params.append('dateFrom', exportFilters.dateFrom);
        if (exportFilters.dateTo) params.append('dateTo', exportFilters.dateTo);
        
        if (params.toString()) {
          url += '?' + params.toString();
        }
        
        response = await fetch(url);
      } else {
        // Para JSON, usar POST con body
        const filters: any = {};
        
        if (exportFilters.applyCurrentFilters && currentFilters) {
          if (currentFilters.search) filters.search = currentFilters.search;
          if (currentFilters.type) filters.type = currentFilters.type;
          if (currentFilters.productId) filters.productId = currentFilters.productId;
        }
        
        if (exportFilters.dateFrom) filters.dateFrom = exportFilters.dateFrom;
        if (exportFilters.dateTo) filters.dateTo = exportFilters.dateTo;
        
        response = await fetch('/api/movimientos/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ format: 'json', filters }),
        });
      }

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Obtener nombre del archivo desde headers o generar uno
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `movimientos_${new Date().toISOString().split('T')[0]}.${selectedFormat}`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Error al exportar movimientos');
      }
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar movimientos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Movimientos
          </DialogTitle>
          <DialogDescription>
            Descarga los movimientos de inventario en el formato seleccionado.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Formato de exportación */}
          <div>
            <label className="text-sm font-medium mb-3 block">Formato de exportación:</label>
            <div className="space-y-2">
              <div 
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedFormat === 'csv' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => setSelectedFormat('csv')}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">CSV (Excel)</p>
                    <p className="text-sm text-muted-foreground">
                      Compatible con Excel, Google Sheets
                    </p>
                  </div>
                  <div className="ml-auto">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedFormat === 'csv' 
                        ? 'border-primary bg-primary' 
                        : 'border-muted'
                    }`}>
                      {selectedFormat === 'csv' && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedFormat === 'json' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => setSelectedFormat('json')}
              >
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">JSON</p>
                    <p className="text-sm text-muted-foreground">
                      Formato estructurado con datos enriquecidos
                    </p>
                  </div>
                  <div className="ml-auto">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedFormat === 'json' 
                        ? 'border-primary bg-primary' 
                        : 'border-muted'
                    }`}>
                      {selectedFormat === 'json' && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros de fecha */}
          <div>
            <label className="text-sm font-medium mb-2 block">Rango de fechas (opcional):</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Desde</label>
                <Input
                  type="date"
                  value={exportFilters.dateFrom}
                  onChange={(e) => setExportFilters(prev => ({
                    ...prev,
                    dateFrom: e.target.value
                  }))}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Hasta</label>
                <Input
                  type="date"
                  value={exportFilters.dateTo}
                  onChange={(e) => setExportFilters(prev => ({
                    ...prev,
                    dateTo: e.target.value
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Aplicar filtros actuales */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="applyFilters"
              checked={exportFilters.applyCurrentFilters}
              onChange={(e) => setExportFilters(prev => ({
                ...prev,
                applyCurrentFilters: e.target.checked
              }))}
              className="rounded"
            />
            <label htmlFor="applyFilters" className="text-sm">
              Aplicar filtros actuales de la vista
            </label>
          </div>

          {/* Información incluida */}
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Información incluida:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Fecha y hora del movimiento</li>
              <li>• Tipo de movimiento (Entrada/Salida/Ajuste)</li>
              <li>• Información del producto (nombre, SKU, categoría)</li>
              <li>• Cantidad y razón del movimiento</li>
              <li>• Referencia y notas</li>
              <li>• Usuario que creó el movimiento</li>
              {selectedFormat === 'json' && (
                <li>• Impacto en el stock calculado</li>
              )}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Download className="h-4 w-4 mr-2" />
            Exportar {selectedFormat.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
