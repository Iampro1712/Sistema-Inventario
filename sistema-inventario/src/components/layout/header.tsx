"use client";

import { Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/ui/global-search";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { UserProfileDropdown } from "@/components/ui/user-profile-dropdown";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border/50 glass-effect px-4 shadow-lg sm:gap-x-6 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Abrir sidebar</span>
      </Button>

      {/* Separador */}
      <div className="h-6 w-px bg-border lg:hidden" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <GlobalSearch />
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Toggle de tema */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Cambiar tema</span>
          </Button>

          {/* Notificaciones */}
          <NotificationBell />

          {/* Separador */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" />

          {/* Perfil de usuario */}
          <UserProfileDropdown />
        </div>
      </div>
    </div>
  );
}
