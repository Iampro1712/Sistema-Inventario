"use client";

import { ResetSettingsDialog } from "./reset-settings-dialog";

export function SettingsHeader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Personaliza el comportamiento del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ResetSettingsDialog />
        </div>
      </div>
    </div>
  );
}
