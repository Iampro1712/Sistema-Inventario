"use client";

import { useState, useEffect } from "react";
import { Send, Mail, Bell, Settings, CheckCircle, XCircle, AlertCircle, Info, Cog, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SMTPConfigModal } from "./smtp-config-modal";
import { api } from "@/lib/api-client";

interface SystemInfo {
  isInitialized: boolean;
  isConnected: boolean;
  emailService: {
    type: 'test' | 'custom';
    testAccount?: {
      user: string;
      host: string;
      port: number;
      webUrl: string;
    };
  };
  features: {
    emailNotifications: boolean;
    inAppNotifications: boolean;
    stockAlerts: boolean;
    movementNotifications: boolean;
    userActionNotifications: boolean;
    systemUpdates: boolean;
  };
}

interface NotificationTestPanelProps {
  configuredEmail?: string;
}

export function NotificationTestPanel({ configuredEmail }: NotificationTestPanelProps) {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; previewUrl?: string } | null>(null);
  const [showSMTPConfig, setShowSMTPConfig] = useState(false);

  // Cargar información del sistema
  const loadSystemInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/notifications/test');
      
      if (response.ok) {
        const data = await response.json();
        setSystemInfo(data);
      }
    } catch (error) {
      console.error('Error cargando información del sistema:', error);
    } finally {
      setLoading(false);
    }
  };

  // Enviar notificación de prueba (usa el email configurado)
  const sendTestNotification = async () => {
    try {
      setLoading(true);
      setTestResult(null);

      const response = await api.post('/api/notifications/test', {
        email: configuredEmail || undefined,
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult({
          success: true,
          message: `Notificación enviada exitosamente a ${data.email}`,
          previewUrl: data.previewUrl,
        });
      } else {
        const error = await response.json();
        setTestResult({
          success: false,
          message: error.error || 'Error enviando notificación de prueba',
        });
      }
    } catch (error) {
      console.error('Error enviando notificación de prueba:', error);
      setTestResult({
        success: false,
        message: 'Error enviando notificación de prueba',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemInfo();
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge variant={status ? "default" : "destructive"} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Configuración SMTP */}
      {showSMTPConfig && (
        <div className="mb-6">
          <SMTPConfigModal />
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => setShowSMTPConfig(false)}>
              Cerrar Configuración
            </Button>
          </div>
        </div>
      )}

      {!showSMTPConfig && (
        <>
          {/* Estado del Sistema */}
          <SystemStatusCard
            systemInfo={systemInfo}
            loading={loading}
            onConfigureSMTP={() => setShowSMTPConfig(true)}
          />

          {/* Panel de prueba de notificaciones */}
          <NotificationTestCard
            configuredEmail={configuredEmail}
            onSendTest={sendTestNotification}
            testResult={testResult}
            loading={loading}
          />
        </>
      )}
    </div>
  );
}

// Componente para mostrar el estado del sistema
function SystemStatusCard({
  systemInfo,
  loading,
  onConfigureSMTP
}: {
  systemInfo: SystemInfo | null;
  loading: boolean;
  onConfigureSMTP: () => void;
}) {
  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge variant={status ? "default" : "destructive"} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Estado del Sistema de Notificaciones
        </CardTitle>
        <CardDescription>
          Información sobre el estado y configuración del sistema de notificaciones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && !systemInfo ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Cargando información...</p>
          </div>
        ) : systemInfo ? (
          <>
            {/* Estado general */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Estado General</h4>
                <div className="space-y-1">
                  {getStatusBadge(systemInfo.isInitialized, 'Sistema Inicializado')}
                  {getStatusBadge(systemInfo.isConnected, 'Conexión Email')}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Servicio de Email</h4>
                <div className="space-y-1">
                  <Badge variant="outline">
                    {systemInfo.emailService.type === 'test' ? 'Configuración Personalizada' : 'Configuración Personalizada'}
                  </Badge>
                  {systemInfo.emailService.testAccount && (
                    <div className="text-sm text-muted-foreground">
                      <p>📧 {systemInfo.emailService.testAccount.user}</p>
                      <p>🌐 {systemInfo.emailService.testAccount.host}:{systemInfo.emailService.testAccount.port}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Características */}
            <div className="space-y-2">
              <h4 className="font-medium">Características Disponibles</h4>
              <div className="grid grid-cols-2 gap-2">
                {getStatusBadge(systemInfo.features.emailNotifications, 'Emails')}
                {getStatusBadge(systemInfo.features.inAppNotifications, 'In-App')}
                {getStatusBadge(systemInfo.features.stockAlerts, 'Alertas Stock')}
                {getStatusBadge(systemInfo.features.movementNotifications, 'Movimientos')}
                {getStatusBadge(systemInfo.features.userActionNotifications, 'Acciones Usuario')}
                {getStatusBadge(systemInfo.features.systemUpdates, 'Actualizaciones')}
              </div>
            </div>

            {/* Información adicional para cuenta de prueba */}
            {systemInfo.emailService.type === 'test' && systemInfo.emailService.testAccount && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-2">
                    <h5 className="font-medium text-blue-900">SMTP Real Configurado</h5>
                    <p className="text-sm text-blue-700">
                      El sistema está usando tu configuración SMTP real.
                      Los emails se envían a destinatarios reales.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(systemInfo.emailService.testAccount?.webUrl, '_blank')}
                      >
                        Ver Emails en Ethereal
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={onConfigureSMTP}
                      >
                        <Cog className="h-4 w-4 mr-1" />
                        Editar Configuración
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {systemInfo.emailService.type === 'custom' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="space-y-2">
                    <h5 className="font-medium text-green-900">SMTP Real Configurado</h5>
                    <p className="text-sm text-green-700">
                      El sistema está usando tu configuración SMTP real.
                      Los emails se envían a destinatarios reales.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onConfigureSMTP}
                    >
                      <Cog className="h-4 w-4 mr-1" />
                      Editar Configuración
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            Error cargando información del sistema
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente para la prueba de notificaciones
function NotificationTestCard({
  configuredEmail,
  onSendTest,
  testResult,
  loading
}: {
  configuredEmail?: string;
  onSendTest: () => void;
  testResult: { success: boolean; message: string; previewUrl?: string } | null;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Prueba de Notificaciones
        </CardTitle>
        <CardDescription>
          Envía una notificación de prueba para verificar la configuración
          {configuredEmail && ` (se enviará a: ${configuredEmail})`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-base font-medium">Probar notificaciones</p>
            <p className="text-sm text-muted-foreground">
              {configuredEmail
                ? `Enviar una notificación de prueba a ${configuredEmail}`
                : 'Configura un email en "Métodos de Notificación" para enviar pruebas'
              }
            </p>
          </div>
          <Button
            onClick={onSendTest}
            disabled={loading || !configuredEmail}
            variant="outline"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Enviar Prueba
          </Button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-lg border ${
            testResult.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="space-y-2">
                <p className={`font-medium ${
                  testResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {testResult.message}
                </p>
                {testResult.previewUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(testResult.previewUrl, '_blank')}
                  >
                    Ver Email Enviado
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
