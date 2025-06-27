"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Users, Package, FileText, Settings, DollarSign, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions?: {
    [key: string]: boolean;
  };
}

interface PermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  currentUserRole: string;
  onSave: () => void;
}

interface PermissionInfo {
  name: string;
  description: string;
  category: string;
}

export function PermissionsDialog({ 
  open, 
  onOpenChange, 
  user, 
  currentUserRole, 
  onSave 
}: PermissionsDialogProps) {
  const [permissions, setPermissions] = useState<{[key: string]: boolean}>({});
  const [availablePermissions, setAvailablePermissions] = useState<{[key: string]: PermissionInfo}>({});
  const [loading, setLoading] = useState(false);
  const [loadingDefaults, setLoadingDefaults] = useState(false);

  // Verificar si el usuario actual puede gestionar permisos
  const canManagePermissions = currentUserRole === 'CEO' || currentUserRole === 'ADMIN';

  useEffect(() => {
    if (user && open) {
      setPermissions(user.permissions || {});
      fetchAvailablePermissions();
    }
  }, [user, open]);

  const fetchAvailablePermissions = async () => {
    try {
      const response = await fetch('/api/usuarios/permissions?action=available');
      const data = await response.json();
      
      if (response.ok) {
        setAvailablePermissions(data.permissions);
      }
    } catch (error) {
      console.error('Error al cargar permisos:', error);
    }
  };

  const handlePermissionChange = (permissionKey: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [permissionKey]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/usuarios/permissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          permissions,
          currentUserRole
        }),
      });

      if (response.ok) {
        toast.success('Permisos actualizados correctamente');
        onSave();
        onOpenChange(false);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar permisos');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar permisos');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDefaults = async () => {
    if (!user) return;

    setLoadingDefaults(true);
    try {
      const response = await fetch('/api/usuarios/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          role: user.role,
          currentUserRole
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions);
        toast.success('Permisos por defecto aplicados');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Error al aplicar permisos por defecto');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al aplicar permisos por defecto');
    } finally {
      setLoadingDefaults(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Usuarios':
        return Users;
      case 'Inventario':
        return Package;
      case 'Reportes':
        return FileText;
      case 'Sistema':
        return Settings;
      case 'Finanzas':
        return DollarSign;
      default:
        return Shield;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'CEO':
        return { variant: 'default' as const, text: 'CEO', color: 'bg-purple-600' };
      case 'ADMIN':
        return { variant: 'destructive' as const, text: 'Administrador', color: 'bg-red-600' };
      case 'MANAGER':
        return { variant: 'secondary' as const, text: 'Gerente', color: 'bg-blue-600' };
      case 'USER':
        return { variant: 'outline' as const, text: 'Usuario', color: 'bg-gray-600' };
      default:
        return { variant: 'outline' as const, text: 'Usuario', color: 'bg-gray-600' };
    }
  };

  if (!user) return null;

  if (!canManagePermissions) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Acceso Denegado
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No tienes permisos para gestionar permisos de usuarios.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Solo los usuarios con rol <strong>CEO</strong> o <strong>ADMIN</strong> pueden realizar esta acción.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const roleBadge = getRoleBadge(user.role);
  
  // Agrupar permisos por categoría
  const permissionsByCategory = Object.entries(availablePermissions).reduce((acc, [key, info]) => {
    if (!acc[info.category]) {
      acc[info.category] = [];
    }
    acc[info.category].push({ key, ...info });
    return acc;
  }, {} as {[category: string]: Array<{key: string} & PermissionInfo>});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gestionar Permisos
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Información del usuario */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Badge 
                  variant={roleBadge.variant}
                  className={`${roleBadge.color} text-white`}
                >
                  {roleBadge.text}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Botón para aplicar permisos por defecto */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Permisos del Usuario</h3>
              <p className="text-sm text-muted-foreground">
                Configura los permisos específicos para este usuario
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleApplyDefaults}
              disabled={loadingDefaults}
            >
              {loadingDefaults ? 'Aplicando...' : 'Permisos por Defecto'}
            </Button>
          </div>

          {/* Permisos por categoría */}
          <div className="space-y-4">
            {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => {
              const CategoryIcon = getCategoryIcon(category);
              
              return (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CategoryIcon className="h-4 w-4" />
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {categoryPermissions.map((permission) => (
                      <div key={permission.key} className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label htmlFor={permission.key} className="font-medium">
                            {permission.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                        <Switch
                          id={permission.key}
                          checked={permissions[permission.key] || false}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(permission.key, checked)
                          }
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Resumen de permisos activos */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="font-medium">Permisos Activos:</span>
                <Badge variant="secondary">
                  {Object.values(permissions).filter(Boolean).length} de {Object.keys(availablePermissions).length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Permisos'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
