"use client";

import { useState, useEffect } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular notificaciones (en una app real, esto vendría de una API)
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Stock bajo',
        message: 'El producto "Laptop Dell XPS 13" tiene solo 2 unidades en stock',
        type: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
        read: false,
        actionUrl: '/productos'
      },
      {
        id: '2',
        title: 'Nuevo usuario registrado',
        message: 'María García se ha registrado como Gerente de Ventas',
        type: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
        read: false,
        actionUrl: '/usuarios'
      },
      {
        id: '3',
        title: 'Respaldo completado',
        message: 'El respaldo automático de la base de datos se completó exitosamente',
        type: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 horas atrás
        read: true,
        actionUrl: '/configuracion'
      },
      {
        id: '4',
        title: 'Producto sin stock',
        message: 'El producto "Mouse Logitech MX Master 3" está agotado',
        type: 'error',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 horas atrás
        read: false,
        actionUrl: '/productos'
      },
      {
        id: '5',
        title: 'Reporte mensual disponible',
        message: 'El reporte de inventario de enero está listo para descargar',
        type: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 día atrás
        read: true,
        actionUrl: '/reportes'
      }
    ];

    // Simular carga
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 300);
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const getRecentNotifications = (limit: number = 5) => {
    return notifications
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    
    return timestamp.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getUnreadCount,
    getRecentNotifications,
    formatTimestamp
  };
}
