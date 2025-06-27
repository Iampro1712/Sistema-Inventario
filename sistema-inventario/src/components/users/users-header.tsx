"use client";

import { useState } from "react";
import { Plus, Download, Filter, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserDialog } from "./user-dialog";
import { FiltersDialog } from "./filters-dialog";
import { ExportDialog } from "./export-dialog";
import { PermissionGuard } from "@/components/auth/permission-guard";

interface UsersHeaderProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  filters: {
    role: string;
    status: string;
    department: string;
  };
  onFiltersChange: (filters: { role: string; status: string; department: string }) => void;
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
  onUserCreated: () => void;
}

export function UsersHeader({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  stats,
  onUserCreated
}: UsersHeaderProps) {
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showFiltersDialog, setShowFiltersDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Usuarios</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gestiona los usuarios del sistema
            </p>
          </div>

          {/* Botones de acción responsive */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="grid grid-cols-2 sm:flex gap-2">
              <PermissionGuard permission="users.export">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExportDialog(true)}
                  className="w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
              </PermissionGuard>
              <PermissionGuard permission="users.create">
                <Button
                  size="sm"
                  onClick={() => setShowUserDialog(true)}
                  className="w-full sm:w-auto"
                >
                  <UserPlus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Nuevo Usuario</span>
                  <span className="sm:hidden">Nuevo</span>
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </div>

        {/* Búsqueda, filtros y estadísticas responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
            <Input
              placeholder="Buscar usuarios..."
              className="w-full sm:max-w-sm text-mobile"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltersDialog(true)}
              className="relative w-full sm:w-auto"
            >
              <Filter className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Filtros</span>
              {getActiveFiltersCount() > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </div>

          {/* Estadísticas responsive */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
            <Badge variant="secondary" className="text-xs sm:text-sm">{stats.total} usuarios</Badge>
            <Badge variant="outline" className="text-xs sm:text-sm">{stats.active} activos</Badge>
          </div>
        </div>
      </div>

      {/* Diálogos */}
      <UserDialog
        open={showUserDialog}
        onOpenChange={setShowUserDialog}
        onSave={onUserCreated}
      />

      <FiltersDialog
        open={showFiltersDialog}
        onOpenChange={setShowFiltersDialog}
        filters={filters}
        onFiltersChange={onFiltersChange}
      />

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        currentFilters={{
          search: searchTerm,
          ...filters
        }}
        totalUsers={stats.total}
      />
    </>
  );
}
