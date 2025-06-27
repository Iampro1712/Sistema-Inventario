"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface Filters {
  role: string;
  status: string;
  department: string;
}

interface FiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function FiltersDialog({ open, onOpenChange, filters, onFiltersChange }: FiltersDialogProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  useEffect(() => {
    // Convertir filtros vacíos a "all" para la UI
    setLocalFilters({
      role: filters.role || 'all',
      status: filters.status || 'all',
      department: filters.department || 'all'
    });
  }, [filters]);

  const handleApply = () => {
    // Convertir "all" a cadena vacía para mantener compatibilidad
    const processedFilters = {
      role: localFilters.role === "all" ? "" : localFilters.role,
      status: localFilters.status === "all" ? "" : localFilters.status,
      department: localFilters.department === "all" ? "" : localFilters.department,
    };
    onFiltersChange(processedFilters);
    onOpenChange(false);
  };

  const handleClear = () => {
    const clearedFilters = { role: 'all', status: 'all', department: 'all' };
    setLocalFilters(clearedFilters);
    // Enviar filtros vacíos al componente padre
    onFiltersChange({ role: '', status: '', department: '' });
    onOpenChange(false);
  };

  const departments = [
    "Dirección General",
    "Administración",
    "Ventas",
    "Almacén",
    "Contabilidad",
    "Compras",
    "Recursos Humanos",
    "Sistemas",
    "Marketing"
  ];

  const getActiveFiltersCount = () => {
    return Object.values(localFilters).filter(value => value !== '' && value !== 'all').length;
  };

  const getFilterLabel = (key: string, value: string) => {
    switch (key) {
      case 'role':
        return value === 'CEO' ? 'CEO' :
               value === 'ADMIN' ? 'Administrador' :
               value === 'MANAGER' ? 'Gerente' : 'Usuario';
      case 'status':
        return value === 'active' ? 'Activo' : 'Inactivo';
      case 'department':
        return value;
      default:
        return value;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Filtros de Usuarios
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} filtro{getActiveFiltersCount() > 1 ? 's' : ''} activo{getActiveFiltersCount() > 1 ? 's' : ''}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Filtros activos */}
          {getActiveFiltersCount() > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Filtros activos:</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(localFilters).map(([key, value]) => {
                  if (!value || value === 'all') return null;
                  return (
                    <Badge key={key} variant="outline" className="flex items-center gap-1">
                      {getFilterLabel(key, value)}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setLocalFilters({ ...localFilters, [key]: 'all' })}
                      />
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filtro por rol */}
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select
              value={localFilters.role}
              onValueChange={(value) => setLocalFilters({ ...localFilters, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="CEO">CEO</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
                <SelectItem value="MANAGER">Gerente</SelectItem>
                <SelectItem value="USER">Usuario</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por estado */}
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              value={localFilters.status}
              onValueChange={(value) => setLocalFilters({ ...localFilters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por departamento */}
          <div className="space-y-2">
            <Label htmlFor="department">Departamento</Label>
            <Select
              value={localFilters.department}
              onValueChange={(value) => setLocalFilters({ ...localFilters, department: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los departamentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los departamentos</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resumen de filtros */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {getActiveFiltersCount() === 0 
                ? "No hay filtros aplicados. Se mostrarán todos los usuarios."
                : `Se aplicarán ${getActiveFiltersCount()} filtro${getActiveFiltersCount() > 1 ? 's' : ''} a la lista de usuarios.`
              }
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={getActiveFiltersCount() === 0}
          >
            Limpiar filtros
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleApply}>
              Aplicar filtros
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
