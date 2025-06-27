"use client";

import { useState } from "react";
import { Download, FileText, Database, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CategoryExportModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json'>('csv');

  const handleExport = async () => {
    setLoading(true);
    
    try {
      let response;
      
      if (selectedFormat === 'csv') {
        response = await fetch('/api/categorias/export');
      } else {
        response = await fetch('/api/categorias/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ format: 'json' }),
        });
      }

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Obtener nombre del archivo desde headers o generar uno
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `categorias_${new Date().toISOString().split('T')[0]}.${selectedFormat}`;
        
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
        alert(error.error || 'Error al exportar categorías');
      }
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar categorías');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <Download className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Exportar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Categorías
          </DialogTitle>
          <DialogDescription>
            Descarga todas las categorías en el formato seleccionado.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
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
                      Formato estructurado con métricas adicionales
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

          <div className="bg-muted p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Información incluida:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Nombre y descripción</li>
              <li>• Color de identificación</li>
              <li>• Cantidad de productos asociados</li>
              <li>• Fechas de creación y actualización</li>
              {selectedFormat === 'json' && (
                <>
                  <li>• Estado de la categoría</li>
                  <li>• Nivel de actividad</li>
                </>
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
