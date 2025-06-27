"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileText, Database } from "lucide-react";
import { toast } from "sonner";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: {
    search: string;
    role: string;
    status: string;
    department: string;
  };
  totalUsers: number;
}

export function ExportDialog({ open, onOpenChange, currentFilters, totalUsers }: ExportDialogProps) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [includeFilters, setIncludeFilters] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (includeFilters) {
        if (currentFilters.search) params.append('search', currentFilters.search);
        if (currentFilters.role) params.append('role', currentFilters.role);
        if (currentFilters.status) params.append('status', currentFilters.status);
        if (currentFilters.department) params.append('department', currentFilters.department);
      }

      const response = await fetch(`/api/usuarios/export?${params.toString()}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `usuarios_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success(`Usuarios exportados correctamente en formato ${format.toUpperCase()}`);
        onOpenChange(false);
      } else {
        throw new Error('Error al exportar usuarios');
      }
    } catch (error) {
      toast.error('Error al exportar usuarios');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCount = () => {
    if (!includeFilters) return totalUsers;
    
    // En una implementación real, esto vendría de la API
    // Por ahora, simulamos el conteo basado en filtros
    let count = totalUsers;
    if (currentFilters.search) count = Math.floor(count * 0.7);
    if (currentFilters.role) count = Math.floor(count * 0.6);
    if (currentFilters.status) count = Math.floor(count * 0.8);
    if (currentFilters.department) count = Math.floor(count * 0.5);
    
    return Math.max(1, count);
  };

  const hasActiveFilters = () => {
    return !!(currentFilters.search || currentFilters.role || currentFilters.status || currentFilters.department);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Usuarios
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Formato de exportación */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Formato de exportación</Label>
            <RadioGroup value={format} onValueChange={(value: 'csv' | 'json') => setFormat(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  CSV (Excel compatible)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer">
                  <Database className="h-4 w-4" />
                  JSON (Datos estructurados)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Opciones de filtrado */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Opciones de exportación</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeFilters"
                checked={includeFilters}
                onCheckedChange={(checked) => setIncludeFilters(checked as boolean)}
              />
              <Label htmlFor="includeFilters" className="cursor-pointer">
                Aplicar filtros actuales
              </Label>
            </div>

            {hasActiveFilters() && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-2">Filtros activos:</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {currentFilters.search && (
                      <p>• Búsqueda: "{currentFilters.search}"</p>
                    )}
                    {currentFilters.role && (
                      <p>• Rol: {currentFilters.role === 'ADMIN' ? 'Administrador' : 
                                currentFilters.role === 'MANAGER' ? 'Gerente' : 'Usuario'}</p>
                    )}
                    {currentFilters.status && (
                      <p>• Estado: {currentFilters.status === 'active' ? 'Activo' : 'Inactivo'}</p>
                    )}
                    {currentFilters.department && (
                      <p>• Departamento: {currentFilters.department}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Resumen */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Usuarios a exportar:</p>
                  <p className="text-sm text-muted-foreground">
                    {includeFilters ? getFilteredCount() : totalUsers} de {totalUsers} usuarios
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Formato:</p>
                  <p className="text-sm text-muted-foreground">
                    {format.toUpperCase()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Información incluida:</strong> Nombre, email, rol, departamento, teléfono, 
              estado, último acceso y fecha de creación.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
