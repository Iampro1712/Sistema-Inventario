"use client";

import { useState, useEffect } from "react";
import { Mail, Save, TestTube, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api-client";

interface SMTPConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpSecure: boolean;
  fromName: string;
  fromEmail: string;
  isTestMode: boolean;
}

export function SMTPConfigModal() {
  const [config, setConfig] = useState<SMTPConfig>({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpSecure: false,
    fromName: 'Sistema de Inventario',
    fromEmail: '',
    isTestMode: true,
  });

  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Cargar configuración actual
  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/notifications/smtp-config');
      
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setConfig(data);
        }
      }
    } catch (error) {
      console.error('Error cargando configuración SMTP:', error);
    } finally {
      setLoading(false);
    }
  };

  // Guardar configuración
  const saveConfig = async () => {
    try {
      setLoading(true);
      const response = await api.post('/api/notifications/smtp-config', config);
      
      if (response.ok) {
        setTestResult({
          success: true,
          message: 'Configuración SMTP guardada exitosamente',
        });
      } else {
        const error = await response.json();
        setTestResult({
          success: false,
          message: error.error || 'Error guardando configuración',
        });
      }
    } catch (error) {
      console.error('Error guardando configuración SMTP:', error);
      setTestResult({
        success: false,
        message: 'Error guardando configuración SMTP',
      });
    } finally {
      setLoading(false);
    }
  };

  // Probar configuración
  const testConfig = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      
      const response = await api.post('/api/notifications/smtp-test', config);
      
      if (response.ok) {
        const data = await response.json();
        setTestResult({
          success: true,
          message: data.message || 'Configuración SMTP probada exitosamente',
        });
      } else {
        const error = await response.json();
        setTestResult({
          success: false,
          message: error.error || 'Error probando configuración SMTP',
        });
      }
    } catch (error) {
      console.error('Error probando configuración SMTP:', error);
      setTestResult({
        success: false,
        message: 'Error probando configuración SMTP',
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Configuración SMTP Real
        </CardTitle>
        <CardDescription>
          Configura tu servidor SMTP para enviar emails reales. Recomendamos usar Gmail con App Password.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Modo de prueba */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="space-y-1">
            <Label className="text-blue-900 font-medium">Modo de Prueba</Label>
            <p className="text-sm text-blue-700">
              {config.isTestMode 
                ? 'Usando cuenta de prueba (Ethereal Email) - Los emails no llegan a destinatarios reales'
                : 'Usando configuración SMTP real - Los emails se envían a destinatarios reales'
              }
            </p>
          </div>
          <Switch
            checked={config.isTestMode}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, isTestMode: checked }))}
          />
        </div>

        {!config.isTestMode && (
          <>
            {/* Configuración del servidor */}
            <div className="space-y-4">
              <h3 className="font-medium">Configuración del Servidor SMTP</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">Servidor SMTP</Label>
                  <Input
                    id="smtpHost"
                    placeholder="smtp.gmail.com"
                    value={config.smtpHost}
                    onChange={(e) => setConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Puerto</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    placeholder="587"
                    value={config.smtpPort}
                    onChange={(e) => setConfig(prev => ({ ...prev, smtpPort: parseInt(e.target.value) || 587 }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="smtpSecure"
                  checked={config.smtpSecure}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, smtpSecure: checked }))}
                />
                <Label htmlFor="smtpSecure">Conexión segura (SSL/TLS)</Label>
              </div>
            </div>

            {/* Credenciales */}
            <div className="space-y-4">
              <h3 className="font-medium">Credenciales de Autenticación</h3>
              
              <div className="space-y-2">
                <Label htmlFor="smtpUser">Usuario/Email</Label>
                <Input
                  id="smtpUser"
                  type="email"
                  placeholder="tu-email@gmail.com"
                  value={config.smtpUser}
                  onChange={(e) => setConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtpPass">Contraseña/App Password</Label>
                <div className="relative">
                  <Input
                    id="smtpPass"
                    type={showPassword ? "text" : "password"}
                    placeholder="tu-app-password"
                    value={config.smtpPass}
                    onChange={(e) => setConfig(prev => ({ ...prev, smtpPass: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Para Gmail, usa un App Password en lugar de tu contraseña normal
                </p>
              </div>
            </div>

            {/* Configuración del remitente */}
            <div className="space-y-4">
              <h3 className="font-medium">Información del Remitente</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromName">Nombre del remitente</Label>
                  <Input
                    id="fromName"
                    placeholder="Sistema de Inventario"
                    value={config.fromName}
                    onChange={(e) => setConfig(prev => ({ ...prev, fromName: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">Email del remitente</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    placeholder="noreply@tuempresa.com"
                    value={config.fromEmail}
                    onChange={(e) => setConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Instrucciones para Gmail */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-yellow-900">Configuración para Gmail</h4>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p>1. Ve a tu cuenta de Google → Seguridad</p>
                    <p>2. Activa la verificación en 2 pasos</p>
                    <p>3. Genera una "Contraseña de aplicación"</p>
                    <p>4. Usa esa contraseña aquí (no tu contraseña normal)</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Resultado de prueba */}
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
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <p className={`font-medium ${
                testResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {testResult.message}
              </p>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2">
          <Button onClick={saveConfig} disabled={loading}>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar Configuración
          </Button>
          
          {!config.isTestMode && (
            <Button variant="outline" onClick={testConfig} disabled={testing}>
              {testing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                <TestTube className="h-4 w-4" />
              )}
              Probar Configuración
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
