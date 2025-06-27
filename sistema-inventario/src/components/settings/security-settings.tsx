"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/hooks/use-settings";
import { Save, Loader2, Shield, Lock, Clock, Key } from "lucide-react";
import { toast } from "sonner";

export function SecuritySettings() {
  const { settingsData, loading, updateMultipleSettings, getSetting } = useSettings('security');
  const [formData, setFormData] = useState({
    'security.twoFactor': false,
    'security.multipleSessions': true,
    'security.sessionTimeout': 60,
    'security.passwordMinLength': 8,
    'security.passwordRequireSpecial': true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && Object.keys(settingsData).length > 0) {
      setFormData({
        'security.twoFactor': settingsData['security.twoFactor'] !== undefined ? settingsData['security.twoFactor'] : false,
        'security.multipleSessions': settingsData['security.multipleSessions'] !== undefined ? settingsData['security.multipleSessions'] : true,
        'security.sessionTimeout': settingsData['security.sessionTimeout'] || 60,
        'security.passwordMinLength': settingsData['security.passwordMinLength'] || 8,
        'security.passwordRequireSpecial': settingsData['security.passwordRequireSpecial'] !== undefined ? settingsData['security.passwordRequireSpecial'] : true,
      });
    }
  }, [settingsData, loading]);

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsToUpdate = Object.entries(formData).map(([key, value]) => ({
        key,
        value,
        category: 'security'
      }));

      const success = await updateMultipleSettings(settingsToUpdate);
      
      if (success) {
        toast.success('Configuración de seguridad guardada correctamente');
      } else {
        toast.error('Error al guardar la configuración');
      }
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Autenticación y Acceso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Autenticación de dos factores (2FA)</Label>
              <p className="text-sm text-muted-foreground">
                Requiere verificación adicional para iniciar sesión
              </p>
            </div>
            <div className="flex items-center gap-2">
              {formData['security.twoFactor'] ? (
                <Badge variant="default">Habilitado</Badge>
              ) : (
                <Badge variant="destructive">Deshabilitado</Badge>
              )}
              <Switch
                checked={formData['security.twoFactor']}
                onCheckedChange={(checked) => handleInputChange('security.twoFactor', checked)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Sesiones múltiples</Label>
              <p className="text-sm text-muted-foreground">
                Permitir que un usuario tenga múltiples sesiones activas
              </p>
            </div>
            <Switch
              checked={formData['security.multipleSessions']}
              onCheckedChange={(checked) => handleInputChange('security.multipleSessions', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-timeout" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tiempo de expiración de sesión (minutos)
            </Label>
            <Input
              id="session-timeout"
              type="number"
              min="5"
              max="1440"
              value={formData['security.sessionTimeout']}
              onChange={(e) => handleInputChange('security.sessionTimeout', parseInt(e.target.value) || 60)}
            />
            <p className="text-sm text-muted-foreground">
              Las sesiones se cerrarán automáticamente después de este tiempo de inactividad
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Políticas de Contraseñas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password-length" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Longitud mínima de contraseña
            </Label>
            <Input
              id="password-length"
              type="number"
              min="6"
              max="32"
              value={formData['security.passwordMinLength']}
              onChange={(e) => handleInputChange('security.passwordMinLength', parseInt(e.target.value) || 8)}
            />
            <p className="text-sm text-muted-foreground">
              Número mínimo de caracteres requeridos para las contraseñas
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Requerir caracteres especiales</Label>
              <p className="text-sm text-muted-foreground">
                Las contraseñas deben incluir al menos un carácter especial (!@#$%^&*)
              </p>
            </div>
            <Switch
              checked={formData['security.passwordRequireSpecial']}
              onCheckedChange={(checked) => handleInputChange('security.passwordRequireSpecial', checked)}
            />
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Requisitos actuales de contraseña:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Mínimo {formData['security.passwordMinLength']} caracteres</li>
              <li>• Al menos una letra mayúscula</li>
              <li>• Al menos una letra minúscula</li>
              <li>• Al menos un número</li>
              {formData['security.passwordRequireSpecial'] && (
                <li>• Al menos un carácter especial (!@#$%^&*)</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acciones de Seguridad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Cerrar todas las sesiones</Label>
              <p className="text-sm text-muted-foreground">
                Forzar el cierre de todas las sesiones activas en el sistema
              </p>
            </div>
            <Button variant="outline" onClick={() => toast.info('Funcionalidad en desarrollo')}>
              Cerrar Sesiones
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Auditoría de seguridad</Label>
              <p className="text-sm text-muted-foreground">
                Generar reporte de eventos de seguridad recientes
              </p>
            </div>
            <Button variant="outline" onClick={() => toast.info('Funcionalidad en desarrollo')}>
              Generar Reporte
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
