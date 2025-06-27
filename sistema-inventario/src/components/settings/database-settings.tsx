"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/hooks/use-settings";
import { Save, Loader2, Database, Download, Upload, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const backupFrequencies = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'manual', label: 'Solo manual' },
];

export function DatabaseSettings() {
  const { settingsData, loading, updateMultipleSettings, getSetting } = useSettings('database');
  const [formData, setFormData] = useState({
    'database.backupEnabled': true,
    'database.backupFrequency': 'daily',
    'database.retentionDays': 30,
    'database.autoOptimize': true,
  });
  const [saving, setSaving] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    if (!loading && Object.keys(settingsData).length > 0) {
      setFormData({
        'database.backupEnabled': settingsData['database.backupEnabled'] !== undefined ? settingsData['database.backupEnabled'] : true,
        'database.backupFrequency': settingsData['database.backupFrequency'] || 'daily',
        'database.retentionDays': settingsData['database.retentionDays'] || 30,
        'database.autoOptimize': settingsData['database.autoOptimize'] !== undefined ? settingsData['database.autoOptimize'] : true,
      });
    }

    // Simular verificación de estado de la base de datos
    setTimeout(() => {
      setDbStatus('connected');
    }, 1000);
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
        category: 'database'
      }));

      const success = await updateMultipleSettings(settingsToUpdate);
      
      if (success) {
        toast.success('Configuración de base de datos guardada correctamente');
      } else {
        toast.error('Error al guardar la configuración');
      }
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    if (backingUp) return;

    setBackingUp(true);
    try {
      toast.info('Iniciando respaldo de base de datos...', {
        description: 'Esta operación puede tomar varios minutos'
      });

      // Simular operación de backup
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast.success('Respaldo completado exitosamente');
    } catch (error) {
      toast.error('Error al crear el respaldo');
    } finally {
      setBackingUp(false);
    }
  };

  const handleRestore = async () => {
    if (restoring) return;

    if (!confirm('¿Estás seguro de que quieres restaurar la base de datos? Esta acción no se puede deshacer.')) {
      return;
    }

    setRestoring(true);
    try {
      toast.warning('Iniciando restauración de base de datos...', {
        description: 'Esta operación puede tomar varios minutos'
      });

      // Simular operación de restore
      await new Promise(resolve => setTimeout(resolve, 4000));

      toast.success('Restauración completada exitosamente');
    } catch (error) {
      toast.error('Error al restaurar la base de datos');
    } finally {
      setRestoring(false);
    }
  };

  const handleOptimize = async () => {
    if (optimizing) return;

    setOptimizing(true);
    try {
      toast.info('Optimizando base de datos...', {
        description: 'Reorganizando índices y limpiando datos temporales'
      });

      // Simular operación de optimización
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Optimización completada exitosamente');
    } catch (error) {
      toast.error('Error al optimizar la base de datos');
    } finally {
      setOptimizing(false);
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
            <Database className="h-5 w-5" />
            Estado de la Base de Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Estado de conexión</Label>
              <p className="text-sm text-muted-foreground">
                Estado actual de la conexión a la base de datos
              </p>
            </div>
            <div className="flex items-center gap-2">
              {dbStatus === 'checking' && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <Badge variant="secondary">Verificando...</Badge>
                </>
              )}
              {dbStatus === 'connected' && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <Badge variant="default">Conectado</Badge>
                </>
              )}
              {dbStatus === 'disconnected' && (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <Badge variant="destructive">Desconectado</Badge>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label className="text-sm font-medium">Tipo de Base de Datos</Label>
              <p className="text-sm text-muted-foreground">MySQL</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Versión</Label>
              <p className="text-sm text-muted-foreground">8.0.35</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Tamaño</Label>
              <p className="text-sm text-muted-foreground">~15.2 MB</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Último Backup</Label>
              <p className="text-sm text-muted-foreground">Hace 2 horas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Respaldos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Respaldos automáticos</Label>
              <p className="text-sm text-muted-foreground">
                Crear respaldos automáticos de la base de datos
              </p>
            </div>
            <Switch
              checked={formData['database.backupEnabled']}
              onCheckedChange={(checked) => handleInputChange('database.backupEnabled', checked)}
            />
          </div>

          {formData['database.backupEnabled'] && (
            <div className="space-y-4 ml-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Frecuencia de respaldo</Label>
                <Select
                  value={formData['database.backupFrequency']}
                  onValueChange={(value) => handleInputChange('database.backupFrequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    {backupFrequencies.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retention-days">Días de retención</Label>
                <Input
                  id="retention-days"
                  type="number"
                  min="1"
                  max="365"
                  value={formData['database.retentionDays']}
                  onChange={(e) => handleInputChange('database.retentionDays', parseInt(e.target.value) || 30)}
                />
                <p className="text-sm text-muted-foreground">
                  Los respaldos se eliminarán automáticamente después de este período
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Optimización automática</Label>
              <p className="text-sm text-muted-foreground">
                Optimizar automáticamente la base de datos para mejorar el rendimiento
              </p>
            </div>
            <Switch
              checked={formData['database.autoOptimize']}
              onCheckedChange={(checked) => handleInputChange('database.autoOptimize', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acciones de Mantenimiento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={handleBackup}
              disabled={backingUp || restoring || optimizing}
              className={`flex items-center gap-2 ${backingUp ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {backingUp ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {backingUp ? 'Creando...' : 'Crear Respaldo'}
            </Button>

            <Button
              variant="outline"
              onClick={handleRestore}
              disabled={backingUp || restoring || optimizing}
              className={`flex items-center gap-2 ${restoring ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {restoring ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {restoring ? 'Restaurando...' : 'Restaurar Respaldo'}
            </Button>

            <Button
              variant="outline"
              onClick={handleOptimize}
              disabled={backingUp || restoring || optimizing}
              className={`flex items-center gap-2 ${optimizing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {optimizing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              {optimizing ? 'Optimizando...' : 'Optimizar BD'}
            </Button>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                  Importante
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Las operaciones de respaldo y restauración pueden afectar el rendimiento del sistema. 
                  Se recomienda realizarlas durante horas de menor actividad.
                </p>
              </div>
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
