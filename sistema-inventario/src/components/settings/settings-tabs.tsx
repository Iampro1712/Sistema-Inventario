"use client";

import { useState } from "react";
import { Settings, Bell, Shield, Database, Palette, Globe, Key } from "lucide-react";
import { GeneralSettings } from "./general-settings";
import { NotificationsSettings } from "./notifications-settings";
import { SecuritySettings } from "./security-settings";
import { AppearanceSettings } from "./appearance-settings";
import { DatabaseSettings } from "./database-settings";
import { IntegrationsSettings } from "./integrations-settings";
import { ApiKeysSettings } from "./api-keys-settings";
import { Card, CardContent } from "@/components/ui/card";

const tabs = [
  { id: "general", name: "General", icon: Settings },
  { id: "notifications", name: "Notificaciones", icon: Bell },
  { id: "security", name: "Seguridad", icon: Shield },
  { id: "api-keys", name: "API Keys", icon: Key },
  { id: "database", name: "Base de Datos", icon: Database },
  { id: "appearance", name: "Apariencia", icon: Palette },
  { id: "integrations", name: "Integraciones", icon: Globe },
];

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState("general");

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSettings />;

      case "notifications":
        return <NotificationsSettings />;

      case "security":
        return <SecuritySettings />;

      case "api-keys":
        return <ApiKeysSettings />;

      case "appearance":
        return <AppearanceSettings />;

      case "database":
        return <DatabaseSettings />;

      case "integrations":
        return <IntegrationsSettings />;

      default:
        return (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Configuración en desarrollo...
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar de tabs responsive */}
      <div className="lg:w-64 space-y-1">
        {/* Vista horizontal en móvil */}
        <div className="lg:hidden">
          <div className="flex overflow-x-auto gap-2 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap touch-target ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vista vertical en desktop */}
        <div className="hidden lg:block space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors touch-target ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido del tab activo */}
      <div className="flex-1 min-w-0">
        {renderTabContent()}
      </div>
    </div>
  );
}
