"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Edit, Trash2, Eye, Users, Shield, User, ChevronLeft, ChevronRight, Settings, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { UserDialog } from "./user-dialog";
import { UserDetailsDialog } from "./user-details-dialog";
import { PermissionsDialog } from "./permissions-dialog";
import { toast } from "sonner";
import { PermissionGuard } from "@/components/auth/permission-guard";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

interface UsersTableProps {
  searchTerm: string;
  filters: {
    role: string;
    status: string;
    department: string;
  };
  onDataChange: () => void;
  currentUserRole?: string;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "CEO":
      return Shield;
    case "ADMIN":
      return Shield;
    case "MANAGER":
      return Users;
    case "VENDEDOR":
      return User;
    default:
      return User;
  }
};

const getRoleBadge = (role: string) => {
  switch (role) {
    case "CEO":
      return { variant: "default" as const, text: "CEO" };
    case "ADMIN":
      return { variant: "destructive" as const, text: "Administrador" };
    case "MANAGER":
      return { variant: "secondary" as const, text: "Gerente" };
    case "USER":
      return { variant: "outline" as const, text: "Usuario" };
    default:
      return { variant: "outline" as const, text: "Usuario" };
  }
};

const getStatusBadge = (isActive: boolean) => {
  return isActive 
    ? { variant: "secondary" as const, text: "Activo" }
    : { variant: "destructive" as const, text: "Inactivo" };
};

export function UsersTable({ searchTerm, filters, onDataChange, currentUserRole = 'USER' }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Estados para diálogos
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Cargar usuarios
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '6',
        search: searchTerm,
        role: filters.role,
        status: filters.status,
        department: filters.department
      });

      const response = await fetch(`/api/usuarios?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setPagination(data.pagination);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error('Error al cargar usuarios');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Efectos
  useEffect(() => {
    fetchUsers(1);
    setCurrentPage(1);
  }, [searchTerm, filters]);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  // Funciones de manejo
  const handleView = (user: User) => {
    setSelectedUser(user);
    setShowDetailsDialog(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleManagePermissions = (user: User) => {
    setSelectedUser(user);
    setShowPermissionsDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser || deleting) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/usuarios?id=${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Usuario eliminado correctamente');
        fetchUsers(currentPage);
        onDataChange();
      } else {
        throw new Error('Error al eliminar usuario');
      }
    } catch (error) {
      toast.error('Error al eliminar usuario');
      console.error('Error:', error);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setSelectedUser(null);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const response = await fetch('/api/usuarios', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          isActive: !user.isActive
        }),
      });

      if (response.ok) {
        toast.success(`Usuario ${!user.isActive ? 'activado' : 'desactivado'} correctamente`);
        fetchUsers(currentPage);
        onDataChange();
      } else {
        throw new Error('Error al cambiar estado del usuario');
      }
    } catch (error) {
      toast.error('Error al cambiar estado del usuario');
      console.error('Error:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  if (loading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron usuarios</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Usuario</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rol</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Último Acceso</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
              {users.map((user) => {
                const RoleIcon = getRoleIcon(user.role);
                const roleBadge = getRoleBadge(user.role);
                const statusBadge = getStatusBadge(user.isActive);
                
                return (
                  <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Miembro desde {new Date(user.createdAt).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{user.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <RoleIcon className="h-4 w-4 text-muted-foreground" />
                        <Badge variant={roleBadge.variant}>
                          {roleBadge.text}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusBadge.variant}>
                        {statusBadge.text}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) : "Nunca"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {(currentUserRole === 'CEO' || currentUserRole === 'ADMIN') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleManagePermissions(user)}
                            title="Gestionar Permisos"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <PermissionGuard permission="users.edit">
                              <DropdownMenuItem onClick={() => handleEdit(user)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            </PermissionGuard>
                            <PermissionGuard permission="users.manage_permissions">
                              <DropdownMenuItem onClick={() => handleManagePermissions(user)}>
                                <Settings className="h-4 w-4 mr-2" />
                                Gestionar Permisos
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </PermissionGuard>
                            <PermissionGuard permission="users.edit">
                              <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                                {user.isActive ? 'Desactivar' : 'Activar'} usuario
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </PermissionGuard>
                            <PermissionGuard permission="users.delete">
                              <DropdownMenuItem
                                onClick={() => handleDelete(user)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </PermissionGuard>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
                    </tbody>
                  </table>
                </div>

              {/* Paginación */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} usuarios
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrev}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>

                  {/* Números de página */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, pagination.page - 2) + i;
                    if (pageNum > pagination.totalPages) return null;

                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNext}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Diálogos */}
      <UserDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        user={selectedUser}
        onSave={() => {
          fetchUsers(currentPage);
          onDataChange();
        }}
      />

      <UserDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        user={selectedUser}
      />

      <PermissionsDialog
        open={showPermissionsDialog}
        onOpenChange={setShowPermissionsDialog}
        user={selectedUser}
        currentUserRole={currentUserRole}
        onSave={() => {
          fetchUsers(currentPage);
          onDataChange();
        }}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{' '}
              <strong>{selectedUser?.name}</strong> del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className={`bg-destructive text-destructive-foreground hover:bg-destructive/90 ${deleting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
