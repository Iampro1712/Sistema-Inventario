"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Breadcrumbs, PageLoadingState } from "@/components/ui/enhanced-navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen relative overflow-hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <div className="lg:pl-72">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <PageLoadingState />

          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Breadcrumbs />
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
