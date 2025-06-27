"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";

interface AlertStats {
  criticas: number;
  advertencias: number;
  informativas: number;
  resueltas: number;
}

interface AlertsStatsProps {
  refreshTrigger?: number;
  onFilterChange?: (type: string) => void;
  activeFilter?: string;
}

export function AlertsStats({ refreshTrigger, onFilterChange, activeFilter }: AlertsStatsProps) {
  const [stats, setStats] = useState<AlertStats>({
    criticas: 12,
    advertencias: 28,
    informativas: 15,
    resueltas: 156
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/alertas?limit=1');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (type: string) => {
    if (activeFilter === type) {
      onFilterChange?.(''); // Quitar filtro si ya está activo
    } else {
      onFilterChange?.(type);
    }
  };

  const alertStats = [
    {
      name: "Críticas",
      value: stats.criticas.toString(),
      description: "Requieren atención inmediata",
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      type: "CRITICAL"
    },
    {
      name: "Advertencias",
      value: stats.advertencias.toString(),
      description: "Stock bajo o próximo a vencer",
      icon: AlertCircle,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      type: "WARNING"
    },
    {
      name: "Informativas",
      value: stats.informativas.toString(),
      description: "Notificaciones generales",
      icon: Info,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      type: "INFO"
    },
    {
      name: "Resueltas",
      value: stats.resueltas.toString(),
      description: "Alertas atendidas hoy",
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      type: "read"
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {alertStats.map((stat) => {
        const isActive = activeFilter === stat.type;

        return (
          <Card
            key={stat.name}
            className={`animate-fade-in cursor-pointer transition-all duration-200 hover:shadow-md ${
              isActive ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-lg'
            }`}
            onClick={() => handleCardClick(stat.type)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <div className={`h-8 w-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              {isActive && (
                <p className="text-xs text-primary font-medium mt-1">
                  Filtro activo
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
