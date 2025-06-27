"use client";

import { useState } from "react";
import { AlertTriangle, AlertCircle, Info, CheckCircle, X, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Datos de ejemplo
const alerts = [
  {
    id: 1,
    type: "critical",
    title: "Producto sin stock",
    message: "Monitor Samsung 27 4K está completamente agotado",
    product: "Monitor Samsung 27 4K",
    sku: "MON-004",
    timestamp: "2024-01-15T10:30:00Z",
    isRead: false,
  },
  {
    id: 2,
    type: "warning",
    title: "Stock bajo",
    message: "Mouse Logitech MX Master 3 tiene solo 2 unidades disponibles",
    product: "Mouse Logitech MX Master 3",
    sku: "MOU-002",
    timestamp: "2024-01-15T09:15:00Z",
    isRead: false,
  },
  {
    id: 3,
    type: "warning",
    title: "Stock bajo",
    message: "Teclado Mecánico Corsair K95 por debajo del stock mínimo",
    product: "Teclado Mecánico Corsair K95",
    sku: "KEY-003",
    timestamp: "2024-01-14T16:45:00Z",
    isRead: true,
  },
  {
    id: 4,
    type: "info",
    title: "Nuevo producto agregado",
    message: "Se agregó exitosamente Auriculares Sony WH-1000XM4 al inventario",
    product: "Auriculares Sony WH-1000XM4",
    sku: "AUR-005",
    timestamp: "2024-01-14T14:20:00Z",
    isRead: true,
  },
  {
    id: 5,
    type: "critical",
    title: "Movimiento sospechoso",
    message: "Salida masiva de productos sin documentación adecuada",
    product: "Varios productos",
    sku: "MULTIPLE",
    timestamp: "2024-01-14T11:30:00Z",
    isRead: false,
  },
];

const getAlertIcon = (type: string) => {
  switch (type) {
    case "critical":
      return AlertTriangle;
    case "warning":
      return AlertCircle;
    case "info":
      return Info;
    case "success":
      return CheckCircle;
    default:
      return Info;
  }
};

const getAlertColor = (type: string) => {
  switch (type) {
    case "critical":
      return {
        icon: "text-red-600 dark:text-red-400",
        bg: "bg-red-100 dark:bg-red-900/20",
        badge: "destructive" as const,
      };
    case "warning":
      return {
        icon: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-100 dark:bg-orange-900/20",
        badge: "secondary" as const,
      };
    case "info":
      return {
        icon: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-100 dark:bg-blue-900/20",
        badge: "outline" as const,
      };
    case "success":
      return {
        icon: "text-green-600 dark:text-green-400",
        bg: "bg-green-100 dark:bg-green-900/20",
        badge: "outline" as const,
      };
    default:
      return {
        icon: "text-gray-600 dark:text-gray-400",
        bg: "bg-gray-100 dark:bg-gray-900/20",
        badge: "outline" as const,
      };
  }
};

export function AlertsList() {
  const [alertsList, setAlertsList] = useState(alerts);

  const markAsRead = (id: number) => {
    setAlertsList(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, isRead: true } : alert
      )
    );
  };

  const dismissAlert = (id: number) => {
    setAlertsList(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Lista de Alertas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alertsList.map((alert) => {
          const Icon = getAlertIcon(alert.type);
          const colors = getAlertColor(alert.type);
          
          return (
            <div
              key={alert.id}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                alert.isRead ? "bg-muted/30" : "bg-background"
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg}`}>
                <Icon className={`h-5 w-5 ${colors.icon}`} />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`font-medium ${alert.isRead ? "text-muted-foreground" : ""}`}>
                      {alert.title}
                    </h4>
                    <p className={`text-sm ${alert.isRead ? "text-muted-foreground" : "text-foreground"}`}>
                      {alert.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!alert.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(alert.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={colors.badge}>
                      {alert.type === "critical" ? "Crítica" : 
                       alert.type === "warning" ? "Advertencia" : 
                       alert.type === "info" ? "Información" : "Éxito"}
                    </Badge>
                    {alert.sku !== "MULTIPLE" && (
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {alert.sku}
                      </code>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        
        {alertsList.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="font-medium mb-2">¡Todo en orden!</h3>
            <p className="text-muted-foreground">
              No hay alertas pendientes en este momento.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
