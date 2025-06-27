"use client";

import { useState, useEffect } from 'react';

export interface Setting {
  id: string;
  key: string;
  value: any;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsData {
  [key: string]: any;
}

export function useSettings(category?: string) {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [settingsData, setSettingsData] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar configuraciones
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const url = category 
        ? `/api/configuracion?category=${category}`
        : '/api/configuracion';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al cargar configuraciones');
      }

      const data = await response.json();
      setSettings(data.settings);
      
      // Convertir array a objeto para fácil acceso
      const settingsObj: SettingsData = {};
      data.settings.forEach((setting: Setting) => {
        settingsObj[setting.key] = setting.value;
      });
      setSettingsData(settingsObj);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar una configuración
  const updateSetting = async (key: string, value: any, category: string) => {
    try {
      const response = await fetch('/api/configuracion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value, category }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar configuración');
      }

      // Actualizar estado local
      setSettingsData(prev => ({
        ...prev,
        [key]: value
      }));

      // Recargar configuraciones
      await fetchSettings();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar');
      return false;
    }
  };

  // Actualizar múltiples configuraciones
  const updateMultipleSettings = async (settingsToUpdate: Array<{key: string, value: any, category: string}>) => {
    try {
      const response = await fetch('/api/configuracion', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: settingsToUpdate }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar configuraciones');
      }

      // Recargar configuraciones
      await fetchSettings();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar');
      return false;
    }
  };

  // Obtener valor de configuración específica
  const getSetting = (key: string, defaultValue?: any) => {
    return settingsData[key] ?? defaultValue;
  };

  // Obtener configuraciones por categoría
  const getSettingsByCategory = (cat: string) => {
    return settings.filter(setting => setting.category === cat);
  };

  // Restablecer todas las configuraciones a valores por defecto
  const resetAllSettings = async () => {
    try {
      const response = await fetch('/api/configuracion', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al restablecer configuraciones');
      }

      // Recargar configuraciones
      await fetchSettings();

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restablecer');
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    settings,
    settingsData,
    loading,
    error,
    updateSetting,
    updateMultipleSettings,
    getSetting,
    getSettingsByCategory,
    resetAllSettings,
    refetch: fetchSettings
  };
}
