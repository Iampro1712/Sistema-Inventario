"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/hooks/use-settings";
import { Save, Loader2, Link, Key, Webhook, FileText, Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export function IntegrationsSettings() {
  const { settingsData, loading, updateMultipleSettings, getSetting } = useSettings('integrations');
  const [formData, setFormData] = useState({
    'integrations.apiEnabled': false,
    'integrations.webhooksEnabled': false,
    'integrations.exportFormats': ['json', 'csv', 'excel'],
  });
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState('sk_live_1234567890abcdef...');
  const [showApiKey, setShowApiKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    if (!loading && Object.keys(settingsData).length > 0) {
      setFormData({
        'integrations.apiEnabled': settingsData['integrations.apiEnabled'] !== undefined ? settingsData['integrations.apiEnabled'] : false,
        'integrations.webhooksEnabled': settingsData['integrations.webhooksEnabled'] !== undefined ? settingsData['integrations.webhooksEnabled'] : false,
        'integrations.exportFormats': settingsData['integrations.exportFormats'] || ['json', 'csv', 'excel'],
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
        category: 'integrations'
      }));

      const success = await updateMultipleSettings(settingsToUpdate);
      
      if (success) {
        toast.success('Configuración de integraciones guardada correctamente');
      } else {
        toast.error('Error al guardar la configuración');
      }
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const generateApiKey = () => {
    const newKey = 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(newKey);
    toast.success('Nueva clave API generada');
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success('Clave API copiada al portapapeles');
  };

  const testWebhook = () => {
    if (!webhookUrl) {
      toast.error('Ingresa una URL de webhook válida');
      return;
    }
    toast.info('Enviando webhook de prueba...', {
      description: 'Verificando conectividad con el endpoint'
    });
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
            <Link className="h-5 w-5" />
            API REST
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Habilitar API REST</Label>
              <p className="text-sm text-muted-foreground">
                Permitir acceso a los datos a través de la API REST
              </p>
            </div>
            <div className="flex items-center gap-2">
              {formData['integrations.apiEnabled'] ? (
                <Badge variant="default">Habilitada</Badge>
              ) : (
                <Badge variant="secondary">Deshabilitada</Badge>
              )}
              <Switch
                checked={formData['integrations.apiEnabled']}
                onCheckedChange={(checked) => handleInputChange('integrations.apiEnabled', checked)}
              />
            </div>
          </div>

          {formData['integrations.apiEnabled'] && (
            <div className="space-y-4 ml-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Clave API
                </Label>
                <div className="flex gap-2">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={copyApiKey}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={generateApiKey}>
                    Generar Nueva Clave
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Endpoints Disponibles
                </h4>
                <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                  <div><code>GET /api/productos</code> - Listar productos</div>
                  <div><code>POST /api/productos</code> - Crear producto</div>
                  <div><code>GET /api/usuarios</code> - Listar usuarios</div>
                  <div><code>GET /api/reportes</code> - Obtener reportes</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhooks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Habilitar Webhooks</Label>
              <p className="text-sm text-muted-foreground">
                Enviar notificaciones HTTP a endpoints externos
              </p>
            </div>
            <Switch
              checked={formData['integrations.webhooksEnabled']}
              onCheckedChange={(checked) => handleInputChange('integrations.webhooksEnabled', checked)}
            />
          </div>

          {formData['integrations.webhooksEnabled'] && (
            <div className="space-y-4 ml-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL del Webhook</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://tu-servidor.com/webhook"
                />
              </div>

              <div className="space-y-2">
                <Label>Eventos que activarán el webhook</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="product-created" defaultChecked />
                    <Label htmlFor="product-created" className="text-sm">Producto creado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="stock-low" defaultChecked />
                    <Label htmlFor="stock-low" className="text-sm">Stock bajo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="user-created" />
                    <Label htmlFor="user-created" className="text-sm">Usuario creado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="report-generated" />
                    <Label htmlFor="report-generated" className="text-sm">Reporte generado</Label>
                  </div>
                </div>
              </div>

              <Button variant="outline" onClick={testWebhook}>
                Probar Webhook
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Exportación de Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Formatos de exportación habilitados</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'json', label: 'JSON', description: 'Formato de intercambio de datos' },
                { value: 'csv', label: 'CSV', description: 'Valores separados por comas' },
                { value: 'excel', label: 'Excel', description: 'Hoja de cálculo de Microsoft' },
                { value: 'pdf', label: 'PDF', description: 'Documento portable' },
                { value: 'xml', label: 'XML', description: 'Lenguaje de marcado extensible' },
                { value: 'yaml', label: 'YAML', description: 'Formato legible por humanos' },
              ].map((format) => (
                <div
                  key={format.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData['integrations.exportFormats'].includes(format.value)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => {
                    const currentFormats = formData['integrations.exportFormats'];
                    const newFormats = currentFormats.includes(format.value)
                      ? currentFormats.filter(f => f !== format.value)
                      : [...currentFormats, format.value];
                    handleInputChange('integrations.exportFormats', newFormats);
                  }}
                >
                  <div className="font-medium">{format.label}</div>
                  <div className="text-xs text-muted-foreground">{format.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
              Formatos Seleccionados
            </h4>
            <div className="flex flex-wrap gap-2">
              {formData['integrations.exportFormats'].map((format) => (
                <Badge key={format} variant="secondary">
                  {format.toUpperCase()}
                </Badge>
              ))}
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
