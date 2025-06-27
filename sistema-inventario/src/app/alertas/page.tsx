"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AlertsTableReal } from "@/components/alerts/alerts-table-real";
import { AlertsHeaderReal } from "@/components/alerts/alerts-header-real";
import { AlertsStats } from "@/components/alerts/alerts-stats";

export default function AlertsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFilterChange = (type: string) => {
    setTypeFilter(type);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  const handleMarkAllRead = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Obtener estadísticas para el header
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/alertas?limit=1');
        if (response.ok) {
          const data = await response.json();
          setTotalAlerts(data.pagination.total);
          setUnreadAlerts(data.stats.criticas + data.stats.advertencias + data.stats.informativas);
        }
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      }
    };

    fetchStats();
  }, [refreshTrigger]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AlertsHeaderReal
          onRefresh={handleRefresh}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          onMarkAllRead={handleMarkAllRead}
          activeFilter={typeFilter}
          totalAlerts={totalAlerts}
          unreadAlerts={unreadAlerts}
        />
        <AlertsStats
          refreshTrigger={refreshTrigger}
          onFilterChange={handleFilterChange}
          activeFilter={typeFilter}
        />
        <AlertsTableReal
          refreshTrigger={refreshTrigger}
          typeFilter={typeFilter}
          searchTerm={searchTerm}
          onMarkAllRead={handleMarkAllRead}
        />
      </div>
    </DashboardLayout>
  );
}
