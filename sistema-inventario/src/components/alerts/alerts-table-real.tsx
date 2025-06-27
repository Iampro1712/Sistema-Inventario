"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, AlertCircle, Info, CheckCircle, Package, Calendar, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  status: string;
  createdAt: string;
  readAt?: string;
  metadata?: any;
  product?: {
    id: string;
    name: string;
    sku: string;
    category?: {
      name: string;
      color: string;
    };
  };
}

interface AlertsTableRealProps {
  refreshTrigger?: number;
  typeFilter?: string;
  searchTerm?: string;
  onMarkAllRead?: () => void;
}

export function AlertsTableReal({ refreshTrigger, typeFilter, searchTerm, onMarkAllRead }: AlertsTableRealProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
    fetchAlerts();
  }, [refreshTrigger, typeFilter, searchTerm, pagination.page]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (typeFilter) {
        if (typeFilter === 'read') {
          params.append('status', 'read');
        } else {
          params.append('type', typeFilter);
        }
      }
      if (searchTerm) params.append('search', searchTerm);

      // console.log('Fetching alerts with params:', params.toString());

      const response = await fetch(`/api/alertas?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        // console.log('API Response:', data);
        // console.log('Alerts received:', data.alertas.length, 'alerts');
        setAlerts(data.alertas);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
          hasNextPage: data.pagination.hasNextPage,
          hasPrevPage: data.pagination.hasPrevPage
        }));
      }
    } catch (error) {
      console.error('Error al cargar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (alertIds: string[]) => {
    try {
      const response = await fetch('/api/alertas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'markRead',
          alertIds
        }),
      });

      if (response.ok) {
        fetchAlerts();
        setSelectedAlerts([]);
      }
    } catch (error) {
      console.error('Error al marcar alertas como leídas:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/alertas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'markAllRead'
        }),
      });

      if (response.ok) {
        fetchAlerts();
        setSelectedAlerts([]);
        onMarkAllRead?.();
      }
    } catch (error) {
      console.error('Error al marcar todas las alertas como leídas:', error);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'CRITICAL':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'WARNING':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'INFO':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'CRITICAL':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Crítica</Badge>;
      case 'WARNING':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">Advertencia</Badge>;
      case 'INFO':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Informativa</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleSelectAlert = (alertId: string) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const handleSelectAll = () => {
    const unreadAlerts = alerts.filter(alert => alert.status === 'UNREAD').map(alert => alert.id);
    setSelectedAlerts(prev => 
      prev.length === unreadAlerts.length ? [] : unreadAlerts
    );
  };

  if (loading) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Cargando alertas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-8">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {typeFilter || searchTerm ? 'No se encontraron alertas' : '¡Todo en orden!'}
            </h3>
            <p className="text-muted-foreground">
              {typeFilter || searchTerm 
                ? 'Intenta ajustar los filtros o términos de búsqueda.'
                : 'No hay alertas pendientes en este momento.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const unreadAlerts = alerts.filter(alert => alert.status === 'UNREAD');

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Alertas ({pagination.total} total)
          </CardTitle>
          <div className="flex items-center gap-2">
            {selectedAlerts.length > 0 && (
              <Button 
                size="sm" 
                onClick={() => handleMarkAsRead(selectedAlerts)}
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                Marcar Seleccionadas ({selectedAlerts.length})
              </Button>
            )}
            {unreadAlerts.length > 0 && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1"
              >
                <EyeOff className="h-4 w-4" />
                Marcar Todas Leídas
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header de selección */}
          {unreadAlerts.length > 0 && (
            <div className="flex items-center gap-2 pb-2 border-b">
              <Checkbox
                checked={selectedAlerts.length === unreadAlerts.length && unreadAlerts.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Seleccionar todas las no leídas ({unreadAlerts.length})
              </span>
            </div>
          )}

          {/* Lista de alertas */}
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 border rounded-lg transition-all ${
                  alert.status === 'UNREAD' 
                    ? 'bg-muted/30 border-primary/20' 
                    : 'bg-background border-muted'
                }`}
              >
                <div className="flex items-start gap-3">
                  {alert.status === 'UNREAD' && (
                    <Checkbox
                      checked={selectedAlerts.includes(alert.id)}
                      onCheckedChange={() => handleSelectAlert(alert.id)}
                    />
                  )}
                  
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getAlertBadge(alert.type)}
                      {alert.status === 'read' && (
                        <Badge variant="outline" className="text-xs">
                          Leída
                        </Badge>
                      )}
                    </div>
                    
                    <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(alert.createdAt).toLocaleString('es-ES')}
                      </div>
                      
                      {alert.product && (
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          <span>{alert.product.name}</span>
                          <code className="bg-muted px-1 rounded text-xs">
                            {alert.product.sku}
                          </code>
                          {alert.product.category && (
                            <Badge 
                              variant="outline"
                              style={{ 
                                borderColor: alert.product.category.color,
                                color: alert.product.category.color 
                              }}
                              className="text-xs"
                            >
                              {alert.product.category.name}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
