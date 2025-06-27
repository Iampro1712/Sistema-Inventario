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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
            <p className="text-muted-foreground">
              Gestiona los usuarios del sistema
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PermissionGuard permission="users.export">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportDialog(true)}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </PermissionGuard>
            <PermissionGuard permission="users.create">
              <Button
                size="sm"
                onClick={() => setShowUserDialog(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </PermissionGuard>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Input
              placeholder="Buscar usuarios..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltersDialog(true)}
              className="relative"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
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

          <div className="flex items-center gap-2">
            <Badge variant="secondary">{stats.total} usuarios</Badge>
            <Badge variant="outline">{stats.active} activos</Badge>
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
