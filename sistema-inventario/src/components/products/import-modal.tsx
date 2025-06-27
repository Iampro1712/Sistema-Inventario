"use client";

import { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";
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

interface ImportModalProps {
  onImportCompleted?: () => void;
}

interface ImportResult {
  success: number;
  errors: number;
  skipped: number;
  details: string[];
}

export function ImportModal({ onImportCompleted }: ImportModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setImportResult(null);
    } else {
      alert('Por favor selecciona un archivo CSV válido');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/productos/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setImportResult(result.results);
        if (result.results.success > 0) {
          onImportCompleted?.();
        }
      } else {
        alert(result.error || 'Error al importar productos');
      }
    } catch (error) {
      console.error('Error al importar:', error);
      alert('Error al importar productos');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Nombre,Descripción,SKU,Precio,Costo,Stock,Stock Mínimo,Categoría
"Producto Ejemplo","Descripción del producto",PROD-001,99.99,59.99,10,5,Electrónicos
"Otro Producto","Otra descripción",PROD-002,149.99,89.99,15,3,Gaming`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_productos.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const resetModal = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetModal();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <Upload className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Importar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Productos
          </DialogTitle>
          <DialogDescription>
            Carga productos masivamente desde un archivo CSV.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!importResult ? (
            <>
              {/* Instrucciones */}
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Formato requerido:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Archivo CSV con encabezados</li>
                  <li>• Campos requeridos: Nombre, SKU, Precio, Costo, Stock</li>
                  <li>• Campos opcionales: Descripción, Stock Mínimo, Categoría</li>
                  <li>• Los SKUs deben ser únicos</li>
                </ul>
              </div>

              {/* Descargar plantilla */}
              <div className="flex justify-center">
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <FileText className="h-4 w-4 mr-2" />
                  Descargar Plantilla CSV
                </Button>
              </div>

              {/* Selector de archivo */}
              <div className="border-2 border-dashed border-muted rounded-lg p-6">
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium mb-1">
                    {selectedFile ? selectedFile.name : 'Selecciona un archivo CSV'}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Arrastra y suelta o haz clic para seleccionar
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Seleccionar Archivo
                  </Button>
                </div>
              </div>

              {selectedFile && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      Archivo seleccionado: {selectedFile.name}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Resultados de importación */
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center">
                  <CheckCircle className="h-6 w-6 mx-auto text-green-600 mb-1" />
                  <p className="text-lg font-bold text-green-800">{importResult.success}</p>
                  <p className="text-xs text-green-700">Exitosos</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg text-center">
                  <AlertCircle className="h-6 w-6 mx-auto text-orange-600 mb-1" />
                  <p className="text-lg font-bold text-orange-800">{importResult.skipped}</p>
                  <p className="text-xs text-orange-700">Omitidos</p>
                </div>
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-center">
                  <XCircle className="h-6 w-6 mx-auto text-red-600 mb-1" />
                  <p className="text-lg font-bold text-red-800">{importResult.errors}</p>
                  <p className="text-xs text-red-700">Errores</p>
                </div>
              </div>

              {/* Detalles */}
              <div className="max-h-40 overflow-y-auto border rounded-lg p-3">
                <h4 className="text-sm font-medium mb-2">Detalles:</h4>
                <div className="space-y-1">
                  {importResult.details.map((detail, index) => (
                    <p key={index} className="text-xs text-muted-foreground">
                      {detail}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            {importResult ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!importResult && (
            <Button 
              onClick={handleImport} 
              disabled={!selectedFile || loading}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Upload className="h-4 w-4 mr-2" />
              Importar Productos
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
