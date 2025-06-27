"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/hooks/use-settings";
import { Save, Loader2, Palette, Monitor, Sun, Moon } from "lucide-react";
import { toast } from "sonner";

const themes = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
];

const colors = [
  { value: 'blue', label: 'Azul', color: 'bg-blue-500' },
  { value: 'green', label: 'Verde', color: 'bg-green-500' },
  { value: 'purple', label: 'Morado', color: 'bg-purple-500' },
  { value: 'red', label: 'Rojo', color: 'bg-red-500' },
  { value: 'orange', label: 'Naranja', color: 'bg-orange-500' },
  { value: 'pink', label: 'Rosa', color: 'bg-pink-500' },
];

const languages = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
];

const dateFormats = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (31-12-2024)' },
];

export function AppearanceSettings() {
  const { settingsData, loading, updateMultipleSettings, getSetting } = useSettings('appearance');
  const [formData, setFormData] = useState({
    'appearance.theme': 'system',
    'appearance.primaryColor': 'blue',
    'appearance.language': 'es',
    'appearance.dateFormat': 'DD/MM/YYYY',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && Object.keys(settingsData).length > 0) {
      const newFormData = {
        'appearance.theme': settingsData['appearance.theme'] || 'system',
        'appearance.primaryColor': settingsData['appearance.primaryColor'] || 'blue',
        'appearance.language': settingsData['appearance.language'] || 'es',
        'appearance.dateFormat': settingsData['appearance.dateFormat'] || 'DD/MM/YYYY',
      };
      setFormData(newFormData);

      // Aplicar configuración inicial
      applyTheme(newFormData['appearance.theme']);
      applyPrimaryColor(newFormData['appearance.primaryColor']);
    }
  }, [settingsData, loading]);

  // Cargar configuración desde localStorage al montar el componente
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    const savedColor = localStorage.getItem('primaryColor') || 'blue';

    applyTheme(savedTheme);
    applyPrimaryColor(savedColor);
  }, []);

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));

    // Aplicar cambios inmediatamente
    if (key === 'appearance.theme') {
      applyTheme(value);
    } else if (key === 'appearance.primaryColor') {
      applyPrimaryColor(value);
    } else if (key === 'appearance.language') {
      applyLanguage(value);
    } else if (key === 'appearance.dateFormat') {
      applyDateFormat(value);
    }
  };

  const applyTheme = (theme: string) => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else if (theme === 'system') {
      localStorage.setItem('theme', 'system');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const applyPrimaryColor = (color: string) => {
    const root = document.documentElement;

    // Definir colores primarios
    const colorMap: { [key: string]: { light: string; dark: string } } = {
      blue: { light: '217 91% 60%', dark: '217 91% 65%' },
      green: { light: '142 76% 36%', dark: '142 76% 45%' },
      purple: { light: '280 100% 70%', dark: '280 100% 75%' },
      red: { light: '0 84% 60%', dark: '0 84% 65%' },
      orange: { light: '25 95% 53%', dark: '25 95% 58%' },
      pink: { light: '330 81% 60%', dark: '330 81% 65%' },
    };

    if (colorMap[color]) {
      root.style.setProperty('--primary', colorMap[color].light);
      root.style.setProperty('--primary-foreground', '220 20% 98%');

      // Guardar en localStorage
      localStorage.setItem('primaryColor', color);
    }
  };

  const applyLanguage = (language: string) => {
    // Guardar idioma en localStorage
    localStorage.setItem('language', language);

    // Aplicar idioma al documento
    document.documentElement.lang = language;

    // Mostrar notificación
    const languageNames: { [key: string]: string } = {
      es: 'Español',
      en: 'English',
      pt: 'Português'
    };

    toast.success(`Idioma cambiado a ${languageNames[language] || language}`);
  };

  const applyDateFormat = (format: string) => {
    // Guardar formato de fecha en localStorage
    localStorage.setItem('dateFormat', format);

    // Mostrar vista previa del formato
    const now = new Date();
    let preview = '';

    switch (format) {
      case 'DD/MM/YYYY':
        preview = now.toLocaleDateString('es-ES');
        break;
      case 'MM/DD/YYYY':
        preview = now.toLocaleDateString('en-US');
        break;
      case 'YYYY-MM-DD':
        preview = now.toISOString().split('T')[0];
        break;
      case 'DD-MM-YYYY':
        preview = now.toLocaleDateString('es-ES').replace(/\//g, '-');
        break;
      default:
        preview = now.toLocaleDateString();
    }

    toast.success(`Formato de fecha cambiado: ${preview}`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsToUpdate = Object.entries(formData).map(([key, value]) => ({
        key,
        value,
        category: 'appearance'
      }));

      const success = await updateMultipleSettings(settingsToUpdate);
      
      if (success) {
        toast.success('Configuración de apariencia guardada correctamente');
        // Aquí podrías aplicar los cambios de tema inmediatamente
        applyThemeChanges();
      } else {
        toast.error('Error al guardar la configuración');
      }
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const applyThemeChanges = () => {
    // Aplicar tema
    const theme = formData['appearance.theme'];
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Sistema - detectar preferencia del usuario
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Aplicar color primario (esto requeriría CSS variables personalizadas)
    document.documentElement.style.setProperty('--primary-color', formData['appearance.primaryColor']);
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
            <Palette className="h-5 w-5" />
            Tema y Colores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Tema de la aplicación</Label>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((theme) => {
                const Icon = theme.icon;
                return (
                  <Button
                    key={theme.value}
                    variant={formData['appearance.theme'] === theme.value ? "default" : "outline"}
                    className="h-20 flex-col gap-2"
                    onClick={() => handleInputChange('appearance.theme', theme.value)}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm">{theme.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Color principal</Label>
            <div className="grid grid-cols-6 gap-3">
              {colors.map((color) => (
                <Button
                  key={color.value}
                  variant="outline"
                  className={`h-16 flex-col gap-2 ${
                    formData['appearance.primaryColor'] === color.value 
                      ? 'ring-2 ring-primary' 
                      : ''
                  }`}
                  onClick={() => handleInputChange('appearance.primaryColor', color.value)}
                >
                  <div className={`w-6 h-6 rounded-full ${color.color}`} />
                  <span className="text-xs">{color.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración Regional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">Idioma</Label>
            <Select
              value={formData['appearance.language']}
              onValueChange={(value) => handleInputChange('appearance.language', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar idioma" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-format">Formato de fecha</Label>
            <Select
              value={formData['appearance.dateFormat']}
              onValueChange={(value) => handleInputChange('appearance.dateFormat', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar formato" />
              </SelectTrigger>
              <SelectContent>
                {dateFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vista Previa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg bg-card">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Ejemplo de Interfaz</h3>
                <div className={`w-3 h-3 rounded-full ${colors.find(c => c.value === formData['appearance.primaryColor'])?.color}`} />
              </div>
              <p className="text-sm text-muted-foreground">
                Esta es una vista previa de cómo se verá la interfaz con la configuración actual.
              </p>
              <div className="flex gap-2">
                <Button size="sm" className="text-xs">Botón Principal</Button>
                <Button size="sm" variant="outline" className="text-xs">Botón Secundario</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Fecha de ejemplo: {new Date().toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista Previa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Vista Previa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-card">
              <h4 className="font-medium mb-2">Configuración Actual</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Tema:</span>
                  <p className="font-medium capitalize">{formData['appearance.theme']}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Color:</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colors.find(c => c.value === formData['appearance.primaryColor'])?.color}`} />
                    <span className="font-medium">{colors.find(c => c.value === formData['appearance.primaryColor'])?.label}</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Idioma:</span>
                  <p className="font-medium">{languages.find(l => l.value === formData['appearance.language'])?.label}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Fecha:</span>
                  <p className="font-medium">{(() => {
                    const now = new Date();
                    switch (formData['appearance.dateFormat']) {
                      case 'DD/MM/YYYY':
                        return now.toLocaleDateString('es-ES');
                      case 'MM/DD/YYYY':
                        return now.toLocaleDateString('en-US');
                      case 'YYYY-MM-DD':
                        return now.toISOString().split('T')[0];
                      case 'DD-MM-YYYY':
                        return now.toLocaleDateString('es-ES').replace(/\//g, '-');
                      default:
                        return now.toLocaleDateString();
                    }
                  })()}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <h4 className="font-medium mb-2">Ejemplo de Interfaz</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">Producto de ejemplo</span>
                  <Button size="sm" className="h-6 px-2 text-xs">Ver</Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">Movimiento reciente</span>
                  <span className="text-xs text-muted-foreground">
                    {(() => {
                      const now = new Date();
                      switch (formData['appearance.dateFormat']) {
                        case 'DD/MM/YYYY':
                          return now.toLocaleDateString('es-ES');
                        case 'MM/DD/YYYY':
                          return now.toLocaleDateString('en-US');
                        case 'YYYY-MM-DD':
                          return now.toISOString().split('T')[0];
                        case 'DD-MM-YYYY':
                          return now.toLocaleDateString('es-ES').replace(/\//g, '-');
                        default:
                          return now.toLocaleDateString();
                      }
                    })()}
                  </span>
                </div>
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
              Aplicando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Aplicar Cambios
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
