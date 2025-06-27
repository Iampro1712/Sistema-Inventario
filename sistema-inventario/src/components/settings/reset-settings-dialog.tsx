"use client";

import { useState } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";

export function ResetSettingsDialog() {
  const [open, setOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { resetAllSettings } = useSettings();

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const success = await resetAllSettings();
      
      if (success) {
        toast.success('Configuraciones restablecidas correctamente', {
          description: 'Todas las configuraciones han sido restauradas a sus valores por defecto'
        });
        setOpen(false);
        // Recargar la página para reflejar todos los cambios
        window.location.reload();
      } else {
        toast.error('Error al restablecer configuraciones');
      }
    } catch (error) {
      toast.error('Error al restablecer configuraciones');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Restablecer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Restablecer Configuración
          </DialogTitle>
          <DialogDescription>
            Esta acción restablecerá todas las configuraciones del sistema a sus valores por defecto.
          </DialogDescription>
        </DialogHeader>
        
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <strong>¡Advertencia!</strong> Esta acción no se puede deshacer. Se perderán todas las configuraciones personalizadas incluyendo:
            <ul className="mt-2 ml-4 list-disc space-y-1">
              <li>Información de la empresa</li>
              <li>Configuraciones de notificaciones</li>
              <li>Configuraciones de seguridad</li>
              <li>Configuraciones de apariencia</li>
              <li>Configuraciones de base de datos</li>
              <li>Configuraciones de integraciones</li>
            </ul>
          </AlertDescription>
        </Alert>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isResetting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleReset}
            disabled={isResetting}
          >
            {isResetting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Restableciendo...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Restablecer Todo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
