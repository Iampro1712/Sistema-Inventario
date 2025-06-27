"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/hooks/use-settings";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function GeneralSettings() {
  const { settingsData, loading, updateMultipleSettings, getSetting } = useSettings('general');
  const [formData, setFormData] = useState({
    'company.name': '',
    'company.ruc': '',
    'company.address': '',
    'company.phone': '',
    'company.email': '',
    'inventory.defaultMinStock': 5,
    'inventory.currency': 'USD',
    'inventory.autoAlerts': true,
    'inventory.autoSku': true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && Object.keys(settingsData).length > 0) {
      setFormData({
        'company.name': settingsData['company.name'] || 'Mi Empresa S.A.',
        'company.ruc': settingsData['company.ruc'] || '12345678901',
        'company.address': settingsData['company.address'] || 'Av. Principal 123, Ciudad',
        'company.phone': settingsData['company.phone'] || '+1 234 567 8900',
        'company.email': settingsData['company.email'] || 'contacto@miempresa.com',
        'inventory.defaultMinStock': settingsData['inventory.defaultMinStock'] || 5,
        'inventory.currency': settingsData['inventory.currency'] || 'USD',
        'inventory.autoAlerts': settingsData['inventory.autoAlerts'] !== undefined ? settingsData['inventory.autoAlerts'] : true,
        'inventory.autoSku': settingsData['inventory.autoSku'] !== undefined ? settingsData['inventory.autoSku'] : true,
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
        category: 'general'
      }));

      const success = await updateMultipleSettings(settingsToUpdate);
      
      if (success) {
        toast.success('Configuración guardada correctamente');
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
          <CardTitle>Información de la Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nombre de la Empresa</Label>
              <Input
                id="company-name"
                value={formData['company.name']}
                onChange={(e) => handleInputChange('company.name', e.target.value)}
                placeholder="Nombre de la empresa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-ruc">RUC/NIT</Label>
              <Input
                id="company-ruc"
                value={formData['company.ruc']}
                onChange={(e) => handleInputChange('company.ruc', e.target.value)}
                placeholder="RUC o NIT"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-address">Dirección</Label>
            <Input
              id="company-address"
              value={formData['company.address']}
              onChange={(e) => handleInputChange('company.address', e.target.value)}
              placeholder="Dirección de la empresa"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-phone">Teléfono</Label>
              <Input
                id="company-phone"
                value={formData['company.phone']}
                onChange={(e) => handleInputChange('company.phone', e.target.value)}
                placeholder="Teléfono de contacto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-email">Email</Label>
              <Input
                id="company-email"
                type="email"
                value={formData['company.email']}
                onChange={(e) => handleInputChange('company.email', e.target.value)}
                placeholder="Email de contacto"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Inventario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-stock">Stock Mínimo por Defecto</Label>
              <Input
                id="min-stock"
                type="number"
                min="0"
                value={formData['inventory.defaultMinStock']}
                onChange={(e) => handleInputChange('inventory.defaultMinStock', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Input
                id="currency"
                value={formData['inventory.currency']}
                onChange={(e) => handleInputChange('inventory.currency', e.target.value)}
                placeholder="USD, EUR, etc."
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertas automáticas de stock bajo</Label>
                <p className="text-sm text-muted-foreground">
                  Generar alertas cuando el stock esté por debajo del mínimo
                </p>
              </div>
              <Switch
                checked={formData['inventory.autoAlerts']}
                onCheckedChange={(checked) => handleInputChange('inventory.autoAlerts', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Generar códigos SKU automáticamente</Label>
                <p className="text-sm text-muted-foreground">
                  Crear códigos SKU únicos para nuevos productos
                </p>
              </div>
              <Switch
                checked={formData['inventory.autoSku']}
                onCheckedChange={(checked) => handleInputChange('inventory.autoSku', checked)}
              />
            </div>
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
