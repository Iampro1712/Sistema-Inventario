'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Key, Plus, Trash2, Eye, EyeOff, Copy, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  isActive: boolean;
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
}

interface ApiPermissions {
  [key: string]: string;
}

export function ApiKeysSettings() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [permissions, setPermissions] = useState<ApiPermissions>({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    permissions: [] as string[],
    expiresAt: '',
  });
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [fullKeys, setFullKeys] = useState<Map<string, string>>(new Map());
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; apiKey: ApiKey | null }>({
    open: false,
    apiKey: null
  });
  const [deleting, setDeleting] = useState(false);

  const getApiKeyStatus = (apiKey: ApiKey) => {
    if (!apiKey.isActive) {
      return { status: 'Inactiva', variant: 'secondary' as const, expired: false };
    }

    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      return { status: 'Expirada', variant: 'destructive' as const, expired: true };
    }

    return { status: 'Activa', variant: 'default' as const, expired: false };
  };

  const formatExpirationDate = (expiresAt: string, expired: boolean) => {
    const expirationDate = new Date(expiresAt);
    const today = new Date();
    const isToday = expirationDate.toDateString() === today.toDateString();

    if (isToday) {
      return `Hoy ${expirationDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    }

    return expirationDate.toLocaleDateString('es-ES');
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/api-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.apiKeys);
        setPermissions(data.permissions);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Error cargando API Keys');
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyData.name || newKeyData.permissions.length === 0) {
      toast.error('Nombre y al menos un permiso son requeridos');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKeyData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('API Key creada exitosamente');
        setFullKeys(prev => new Map(prev).set(data.apiKey.id, data.apiKey.key));
        navigator.clipboard.writeText(data.apiKey.key);
        toast.success('API Key copiada al portapapeles');
        setShowCreateDialog(false);
        setNewKeyData({ name: '', permissions: [], expiresAt: '' });
        fetchApiKeys();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error creando API Key');
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Error creando API Key');
    } finally {
      setCreating(false);
    }
  };

  const openDeleteModal = (apiKey: ApiKey) => {
    setDeleteModal({ open: true, apiKey });
  };

  const closeDeleteModal = () => {
    if (deleting) return; // Prevenir cerrar modal mientras se está eliminando
    setDeleteModal({ open: false, apiKey: null });
    setDeleting(false);
  };

  const confirmDeleteApiKey = async () => {
    if (!deleteModal.apiKey || deleting) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/api-keys?id=${deleteModal.apiKey.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('API Key eliminada exitosamente');
        fetchApiKeys();
        closeDeleteModal();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error eliminando API Key');
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Error eliminando API Key');
    } finally {
      setDeleting(false);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = async (keyId: string) => {
    try {
      if (fullKeys.has(keyId)) {
        const fullKey = fullKeys.get(keyId)!;
        navigator.clipboard.writeText(fullKey);
        toast.success('API Key copiada al portapapeles');
        return;
      }

      const response = await fetch('/api/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId }),
      });

      if (response.ok) {
        const data = await response.json();
        setFullKeys(prev => new Map(prev).set(keyId, data.key));
        navigator.clipboard.writeText(data.key);
        toast.success('API Key copiada al portapapeles');
      } else {
        toast.error('Error obteniendo API Key completa');
      }
    } catch (error) {
      console.error('Error copiando API Key:', error);
      toast.error('Error copiando API Key');
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setNewKeyData(prev => ({
        ...prev,
        permissions: [...prev.permissions, permission]
      }));
    } else {
      setNewKeyData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== permission)
      }));
    }
  };

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement(Card, null,
      React.createElement(CardHeader, null,
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement(CardTitle, { className: 'flex items-center gap-2' },
            React.createElement(Key, { className: 'h-5 w-5' }),
            'API Keys'
          ),
          React.createElement(Button, {
            onClick: () => setShowCreateDialog(true),
            className: 'flex items-center gap-2'
          },
            React.createElement(Plus, { className: 'h-4 w-4' }),
            'Nueva API Key'
          )
        )
      ),
      React.createElement(CardContent, null,
        React.createElement('div', { className: 'mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg' },
          React.createElement('div', { className: 'flex items-center gap-2 mb-2' },
            React.createElement(Shield, { className: 'h-4 w-4 text-blue-600' }),
            React.createElement('span', { className: 'font-medium text-blue-800 dark:text-blue-200' },
              'Información de Seguridad'
            )
          ),
          React.createElement('p', { className: 'text-sm text-blue-700 dark:text-blue-300 mb-2' },
            'Las API Keys permiten acceso programático a la API. Incluye el header: ',
            React.createElement('code', { className: 'bg-blue-100 dark:bg-blue-800 px-1 rounded mx-1' },
              'X-API-Key: tu_api_key'
            ),
            ' o ',
            React.createElement('code', { className: 'bg-blue-100 dark:bg-blue-800 px-1 rounded mx-1' },
              'Authorization: Bearer tu_api_key'
            )
          )
        ),
        loading ?
          React.createElement('div', { className: 'text-center py-8' },
            'Cargando API Keys...'
          ) :
          apiKeys.length === 0 ?
            React.createElement('div', { className: 'text-center py-8 text-gray-500' },
              'No hay API Keys configuradas'
            ) :
            React.createElement(Table, null,
              React.createElement(TableHeader, null,
                React.createElement(TableRow, null,
                  React.createElement(TableHead, null, 'Nombre'),
                  React.createElement(TableHead, null, 'API Key'),
                  React.createElement(TableHead, null, 'Permisos'),
                  React.createElement(TableHead, null, 'Estado'),
                  React.createElement(TableHead, null, 'Último Uso'),
                  React.createElement(TableHead, null, 'Acciones')
                )
              ),
              React.createElement(TableBody, null,
                apiKeys.map((apiKey) =>
                  React.createElement(TableRow, { key: apiKey.id },
                    React.createElement(TableCell, { className: 'font-medium' }, apiKey.name),
                    React.createElement(TableCell, null,
                      React.createElement('div', { className: 'flex items-center gap-2' },
                        React.createElement('code', { className: 'text-sm' },
                          visibleKeys.has(apiKey.id) ? apiKey.key : '••••••••••••••••'
                        ),
                        React.createElement(Button, {
                          variant: 'ghost',
                          size: 'sm',
                          onClick: () => toggleKeyVisibility(apiKey.id)
                        },
                          visibleKeys.has(apiKey.id) ?
                            React.createElement(EyeOff, { className: 'h-4 w-4' }) :
                            React.createElement(Eye, { className: 'h-4 w-4' })
                        ),
                        React.createElement(Button, {
                          variant: 'ghost',
                          size: 'sm',
                          onClick: () => copyToClipboard(apiKey.id)
                        },
                          React.createElement(Copy, { className: 'h-4 w-4' })
                        )
                      )
                    ),
                    React.createElement(TableCell, null,
                      React.createElement('div', { className: 'flex flex-wrap gap-1' },
                        Array.isArray(apiKey.permissions) ? apiKey.permissions.map((permission) =>
                          React.createElement(Badge, { key: permission, variant: 'secondary', className: 'text-xs' },
                            permission
                          )
                        ) : null
                      )
                    ),
                    React.createElement(TableCell, null,
                      (() => {
                        const status = getApiKeyStatus(apiKey);
                        return React.createElement('div', { className: 'flex flex-col gap-1' },
                          React.createElement(Badge, { variant: status.variant },
                            status.status
                          ),
                          apiKey.expiresAt && React.createElement('span', { className: 'text-xs text-muted-foreground' },
                            `${status.expired ? 'Expiró' : 'Expira'}: ${formatExpirationDate(apiKey.expiresAt, status.expired)}`
                          )
                        );
                      })()
                    ),
                    React.createElement(TableCell, null,
                      apiKey.lastUsed ?
                        new Date(apiKey.lastUsed).toLocaleDateString() :
                        'Nunca'
                    ),
                    React.createElement(TableCell, null,
                      React.createElement(Button, {
                        variant: 'ghost',
                        size: 'sm',
                        onClick: () => openDeleteModal(apiKey),
                        className: 'text-red-600 hover:text-red-800'
                      },
                        React.createElement(Trash2, { className: 'h-4 w-4' })
                      )
                    )
                  )
                )
              )
            )
      )
    ),
    showCreateDialog && React.createElement(Dialog, { open: showCreateDialog, onOpenChange: setShowCreateDialog },
      React.createElement(DialogContent, { className: 'max-w-2xl' },
        React.createElement(DialogHeader, null,
          React.createElement(DialogTitle, null, 'Crear Nueva API Key')
        ),
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('div', null,
            React.createElement(Label, { htmlFor: 'name' }, 'Nombre'),
            React.createElement(Input, {
              id: 'name',
              value: newKeyData.name,
              onChange: (e) => setNewKeyData(prev => ({ ...prev, name: e.target.value })),
              placeholder: 'Ej: App Móvil, Sistema Externo...'
            })
          ),
          React.createElement('div', null,
            React.createElement(Label, null, 'Permisos'),
            React.createElement('div', { className: 'grid grid-cols-2 gap-2 mt-2' },
              Object.entries(permissions).map(([key, description]) =>
                React.createElement('div', { key: key, className: 'flex items-center space-x-2' },
                  React.createElement(Checkbox, {
                    id: key,
                    checked: newKeyData.permissions.includes(key),
                    onCheckedChange: (checked) => handlePermissionChange(key, checked as boolean)
                  }),
                  React.createElement(Label, { htmlFor: key, className: 'text-sm' },
                    description
                  )
                )
              )
            )
          ),
          React.createElement('div', null,
            React.createElement(Label, { htmlFor: 'expiresAt' }, 'Fecha de Expiración (Opcional)'),
            React.createElement(Input, {
              id: 'expiresAt',
              type: 'datetime-local',
              value: newKeyData.expiresAt,
              onChange: (e) => setNewKeyData(prev => ({ ...prev, expiresAt: e.target.value }))
            })
          ),
          React.createElement('div', { className: 'flex justify-end space-x-2' },
            React.createElement(Button, { variant: 'outline', onClick: () => setShowCreateDialog(false) },
              'Cancelar'
            ),
            React.createElement(Button, { onClick: createApiKey, disabled: creating },
              creating ? 'Creando...' : 'Crear API Key'
            )
          )
        )
      )
    ),
    deleteModal.open && React.createElement(Dialog, { open: deleteModal.open, onOpenChange: closeDeleteModal },
      React.createElement(DialogContent, null,
        React.createElement(DialogHeader, null,
          React.createElement(DialogTitle, null, 'Confirmar Eliminación'),
          React.createElement(DialogDescription, null,
            `¿Estás seguro de que quieres eliminar la API Key "${deleteModal.apiKey?.name}"?`,
            React.createElement('br'),
            React.createElement('span', { className: 'text-red-600 font-medium' },
              'Esta acción no se puede deshacer.'
            )
          )
        ),
        React.createElement('div', { className: 'flex justify-end space-x-2 mt-4' },
          React.createElement(Button, {
            variant: 'outline',
            onClick: closeDeleteModal,
            disabled: deleting
          },
            'Cancelar'
          ),
          React.createElement(Button, {
            variant: 'destructive',
            onClick: confirmDeleteApiKey,
            disabled: deleting,
            className: deleting ? 'opacity-50 cursor-not-allowed' : ''
          },
            deleting ? [
              React.createElement(Loader2, { key: 'loader', className: 'h-4 w-4 mr-2 animate-spin' }),
              'Eliminando...'
            ] : 'Eliminar API Key'
          )
        )
      )
    )
  );
}
