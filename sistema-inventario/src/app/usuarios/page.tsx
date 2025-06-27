"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { UsersTable } from "@/components/users/users-table";
import { UsersHeader } from "@/components/users/users-header";
import { usePermissions } from "@/hooks/use-permissions";
import { UserManagementRouteGuard } from "@/components/auth/route-guard";

export default function UsersPage() {
  const { currentRole } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    department: ""
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  // Cargar estadísticas
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/usuarios');
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDataChange = () => {
    fetchStats();
  };

  return (
    <UserManagementRouteGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <UsersHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFiltersChange={setFilters}
            stats={stats}
            onUserCreated={handleDataChange}
          />
          <UsersTable
            searchTerm={searchTerm}
            filters={filters}
            onDataChange={handleDataChange}
            currentUserRole={currentRole || "VENDEDOR"}
          />
        </div>
      </DashboardLayout>
    </UserManagementRouteGuard>
  );
}
