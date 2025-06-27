"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/hooks/use-settings";
import { Save, Loader2, Bell, Mail } from "lucide-react";
import { toast } from "sonner";
import { NotificationTestPanel } from "@/components/notifications/notification-test-panel";
import { PermissionGuard } from "@/components/auth/permission-guard";

export function NotificationsSettings() {
  const { settingsData, loading, updateMultipleSettings, getSetting } = useSettings('notifications');
  const [formData, setFormData] = useState({
    'notifications.lowStock': true,
    'notifications.outOfStock': true,
    'notifications.highVolume': false,
    'notifications.email': true,
    'notifications.system': true,
    'notifications.emailAddress': '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && Object.keys(settingsData).length > 0) {
      setFormData({
        'notifications.lowStock': settingsData['notifications.lowStock'] !== undefined ? settingsData['notifications.lowStock'] : true,
        'notifications.outOfStock': settingsData['notifications.outOfStock'] !== undefined ? settingsData['notifications.outOfStock'] : true,
        'notifications.highVolume': settingsData['notifications.highVolume'] !== undefined ? settingsData['notifications.highVolume'] : false,
        'notifications.email': settingsData['notifications.email'] !== undefined ? settingsData['notifications.email'] : true,
        'notifications.system': settingsData['notifications.system'] !== undefined ? settingsData['notifications.system'] : true,
        'notifications.emailAddress': settingsData['notifications.emailAddress'] || 'admin@empresa.com',
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
        category: 'notifications'
      }));

      const success = await updateMultipleSettings(settingsToUpdate);
      
      if (success) {
        toast.success('Configuración de notificaciones guardada correctamente');
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
            <Bell className="h-5 w-5" />
            Alertas de Inventario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Stock bajo</Label>
              <p className="text-sm text-muted-foreground">
                Notificar cuando el stock esté por debajo del mínimo establecido
              </p>
            </div>
            <Switch
              checked={formData['notifications.lowStock']}
              onCheckedChange={(checked) => handleInputChange('notifications.lowStock', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Sin stock</Label>
              <p className="text-sm text-muted-foreground">
                Notificar cuando un producto se agote completamente
              </p>
            </div>
            <Switch
              checked={formData['notifications.outOfStock']}
              onCheckedChange={(checked) => handleInputChange('notifications.outOfStock', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Movimientos de gran volumen</Label>
              <p className="text-sm text-muted-foreground">
                Notificar cuando se registren movimientos importantes de inventario
              </p>
            </div>
            <Switch
              checked={formData['notifications.highVolume']}
              onCheckedChange={(checked) => handleInputChange('notifications.highVolume', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Métodos de Notificación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Notificaciones por email</Label>
              <p className="text-sm text-muted-foreground">
                Recibir alertas por correo electrónico
              </p>
            </div>
            <Switch
              checked={formData['notifications.email']}
              onCheckedChange={(checked) => handleInputChange('notifications.email', checked)}
            />
          </div>

          {formData['notifications.email'] && (
            <div className="space-y-2 ml-4 p-4 bg-muted/50 rounded-lg">
              <Label htmlFor="email-address">Dirección de email para notificaciones</Label>
              <Input
                id="email-address"
                type="email"
                value={formData['notifications.emailAddress']}
                onChange={(e) => handleInputChange('notifications.emailAddress', e.target.value)}
                placeholder="admin@empresa.com"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Notificaciones en el sistema</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar notificaciones en la interfaz del sistema
              </p>
            </div>
            <Switch
              checked={formData['notifications.system']}
              onCheckedChange={(checked) => handleInputChange('notifications.system', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sección del sistema de notificaciones - Solo para CEO y ADMIN */}
      <PermissionGuard permissions={['settings.edit']}>
        <NotificationTestPanel configuredEmail={formData['notifications.emailAddress']} />
      </PermissionGuard>

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
