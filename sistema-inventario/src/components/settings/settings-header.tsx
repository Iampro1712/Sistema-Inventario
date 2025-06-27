"use client";

import { ResetSettingsDialog } from "./reset-settings-dialog";

export function SettingsHeader() {
  return (
    <div className="space-y-4">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Personaliza el comportamiento del sistema
          </p>
        </div>
        <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
          <ResetSettingsDialog />
        </div>
      </div>
    </div>
  );
}
