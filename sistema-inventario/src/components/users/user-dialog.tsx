"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PasswordInput } from "@/components/ui/password-input";
import { usePermissions } from "@/hooks/use-permissions";
import { Loader2 } from "lucide-react";
import { hashPassword, validatePasswordStrength } from "@/lib/password";
import { toast } from "sonner";

interface User {
  id?: number;
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  isActive: boolean;
  password?: string;
}

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSave: () => void;
}

export function UserDialog({ open, onOpenChange, user, onSave }: UserDialogProps) {
  const { canChangeUserPasswords, getAssignableRoles, canChangeUserRole } = usePermissions();
  const [formData, setFormData] = useState<User>({
    name: "",
    email: "",
    role: "VENDEDOR",
    department: "",
    phone: "",
    isActive: true,
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({ ...user, password: "" });
      setShowPasswordField(false);
    } else {
      setFormData({
        name: "",
        email: "",
        role: "VENDEDOR",
        department: "",
        phone: "",
        isActive: true,
        password: "",
      });
      setShowPasswordField(true); // Mostrar campo de contraseña para nuevos usuarios
    }
    setGeneratedPassword("");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar contraseña si se está creando un usuario o cambiando contraseña
      if ((!user || showPasswordField) && formData.password) {
        const validation = validatePasswordStrength(formData.password);
        if (!validation.isValid) {
          toast.error('La contraseña no cumple con los requisitos de seguridad');
          setLoading(false);
          return;
        }
      }

      // Preparar datos para enviar
      let bodyData = { ...formData };

      // Hashear contraseña si se proporciona
      if (formData.password && (showPasswordField || !user)) {
        bodyData.password = await hashPassword(formData.password);
      } else if (!showPasswordField && user) {
        // Si no se está cambiando la contraseña, no incluirla en la actualización
        delete bodyData.password;
      }

      const url = '/api/usuarios';
      const method = user ? 'PUT' : 'POST';
      const body = user ? { ...bodyData, id: user.id } : bodyData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const successMessage = user
          ? (showPasswordField ? 'Usuario y contraseña actualizados correctamente' : 'Usuario actualizado correctamente')
          : 'Usuario creado correctamente';

        toast.success(successMessage);

        // Mostrar contraseña generada si se usó
        if (generatedPassword && !user) {
          toast.info(`Contraseña generada: ${generatedPassword}`, {
            duration: 10000,
            description: "Guarda esta contraseña, no se mostrará nuevamente"
          });
        }

        onSave();
        onOpenChange(false);
      } else {
        throw new Error('Error al guardar usuario');
      }
    } catch (error) {
      toast.error('Error al guardar usuario');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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

  const assignableRoles = getAssignableRoles();

  const handlePasswordGenerate = (password: string) => {
    setGeneratedPassword(password);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Juan Pérez"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="juan@empresa.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {assignableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role === 'CEO' ? 'Director Ejecutivo' :
                       role === 'ADMIN' ? 'Administrador' :
                       role === 'MANAGER' ? 'Gerente' :
                       role === 'VENDEDOR' ? 'Vendedor' : role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+34 612 345 678"
            />
          </div>

          {/* Campo de contraseña */}
          {canChangeUserPasswords() && (
            <>
              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Contraseña</Label>
                  {user && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswordField(!showPasswordField)}
                    >
                      {showPasswordField ? 'Cancelar cambio' : 'Cambiar contraseña'}
                    </Button>
                  )}
                </div>

                {(showPasswordField || !user) && (
                  <PasswordInput
                    value={formData.password || ""}
                    onChange={(value) => setFormData({ ...formData, password: value })}
                    label={user ? "Nueva contraseña" : "Contraseña"}
                    placeholder={user ? "Ingresa la nueva contraseña" : "Ingresa una contraseña segura"}
                    showStrengthIndicator={true}
                    showGenerateButton={true}
                    required={!user} // Requerida solo para nuevos usuarios
                    onGenerate={handlePasswordGenerate}
                  />
                )}

                {user && !showPasswordField && (
                  <p className="text-sm text-muted-foreground">
                    La contraseña actual se mantendrá sin cambios.
                  </p>
                )}
              </div>
            </>
          )}

          <Separator />

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Usuario activo</Label>
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
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                user ? 'Actualizar' : 'Crear'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
