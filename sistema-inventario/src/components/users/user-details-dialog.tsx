"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, User, Mail, Phone, Building, Calendar, Clock } from "lucide-react";

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

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function UserDetailsDialog({ open, onOpenChange, user }: UserDetailsDialogProps) {
  if (!user) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
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

  const getRoleText = (role: string) => {
    switch (role) {
      case "CEO":
        return "CEO";
      case "ADMIN":
        return "Administrador";
      case "MANAGER":
        return "Gerente";
      case "VENDEDOR":
        return "Vendedor";
      default:
        return "Vendedor";
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
      case "VENDEDOR":
        return { variant: "outline" as const, text: "Vendedor" };
      default:
        return { variant: "outline" as const, text: "Vendedor" };
    }
  };

  const RoleIcon = getRoleIcon(user.role);
  const roleBadge = getRoleBadge(user.role);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs sm:text-sm font-medium text-primary">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <span className="text-base sm:text-lg">Detalles del Usuario</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 overflow-y-auto flex-1 pr-2 custom-scroll">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Nombre completo</p>
                  <p className="text-base sm:text-lg font-semibold break-words">{user.name}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Estado</p>
                  <Badge variant={user.isActive ? "secondary" : "destructive"} className="text-xs">
                    {user.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm break-all">{user.email}</span>
                </div>

                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información laboral */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Información Laboral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Rol</p>
                  <div className="flex items-center gap-2 mt-1">
                    <RoleIcon className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={roleBadge.variant} className="text-xs">
                      {roleBadge.text}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Departamento</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm break-words">{user.department}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de actividad */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Actividad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Último acceso</p>
                  <div className="flex items-start gap-2 mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm break-words">
                      {user.lastLogin ?
                        new Date(user.lastLogin).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) : "Nunca"
                      }
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Miembro desde</p>
                  <div className="flex items-start gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm break-words">
                      {new Date(user.createdAt).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permisos y accesos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Permisos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.role === 'CEO' && (
                  <>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 bg-purple-500 rounded-full shrink-0 mt-1.5"></div>
                      <span className="text-xs sm:text-sm break-words">Acceso total al sistema</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 bg-purple-500 rounded-full shrink-0 mt-1.5"></div>
                      <span className="text-xs sm:text-sm break-words">Gestión completa de usuarios y permisos</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 bg-purple-500 rounded-full shrink-0 mt-1.5"></div>
                      <span className="text-xs sm:text-sm break-words">Acceso a información financiera</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 bg-purple-500 rounded-full shrink-0 mt-1.5"></div>
                      <span className="text-xs sm:text-sm break-words">Configuración avanzada del sistema</span>
                    </div>
                  </>
                )}

                {user.role === 'ADMIN' && (
                  <>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full shrink-0 mt-1.5"></div>
                      <span className="text-xs sm:text-sm break-words">Acceso completo al sistema</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full shrink-0 mt-1.5"></div>
                      <span className="text-xs sm:text-sm break-words">Gestión de usuarios</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full shrink-0 mt-1.5"></div>
                      <span className="text-xs sm:text-sm break-words">Configuración del sistema</span>
                    </div>
                  </>
                )}
                
                {user.role === 'MANAGER' && (
                  <>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full shrink-0 mt-1.5"></div>
                      <span className="text-xs sm:text-sm break-words">Gestión de inventario</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full shrink-0 mt-1.5"></div>
                      <span className="text-xs sm:text-sm break-words">Reportes avanzados</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full shrink-0 mt-1.5"></div>
                      <span className="text-xs sm:text-sm break-words">Supervisión de equipo</span>
                    </div>
                  </>
                )}

                {user.role === 'VENDEDOR' && (
                  <>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 bg-gray-500 rounded-full shrink-0 mt-1.5"></div>
                      <span className="text-xs sm:text-sm break-words">Consulta de inventario</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 bg-gray-500 rounded-full shrink-0 mt-1.5"></div>
                      <span className="text-xs sm:text-sm break-words">Registro de movimientos</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 bg-gray-500 rounded-full shrink-0 mt-1.5"></div>
                      <span className="text-xs sm:text-sm break-words">Reportes básicos</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
