import { emailService } from './email-service';
import { notificationService } from './notification-service';
import { notifySystemUpdate } from './notification-helpers';

// Inicializar el sistema de notificaciones
export async function initializeNotificationSystem() {
  try {
    console.log('🚀 Inicializando sistema de notificaciones...');
    
    // Inicializar servicio de email
    await emailService.initialize();
    
    // Verificar conexión
    const isConnected = await emailService.verifyConnection();
    
    if (isConnected) {
      console.log('✅ Sistema de notificaciones inicializado correctamente');
      
      // Enviar notificación de sistema iniciado (solo a admins)
      await notifySystemUpdate(
        'Sistema de Notificaciones Activado',
        'El sistema de notificaciones por email ha sido activado y está funcionando correctamente.',
        'NORMAL'
      );
      
      return true;
    } else {
      console.log('⚠️ Sistema de notificaciones inicializado pero sin conexión de email');
      return false;
    }
  } catch (error) {
    console.error('❌ Error inicializando sistema de notificaciones:', error);
    return false;
  }
}

// Función para probar el sistema de notificaciones
export async function testNotificationSystem(userEmail: string) {
  try {
    console.log('🧪 Probando sistema de notificaciones...');
    
    const result = await emailService.sendEmail({
      to: userEmail,
      subject: '🧪 Prueba del Sistema de Notificaciones',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
            <h1>🧪 Prueba del Sistema</h1>
          </div>
          <div style="padding: 20px;">
            <h2>¡Sistema de Notificaciones Funcionando!</h2>
            <p>Este es un email de prueba para verificar que el sistema de notificaciones está funcionando correctamente.</p>
            <div style="background-color: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0;">
              <p><strong>✅ Estado:</strong> Funcionando correctamente</p>
              <p><strong>📧 Servicio:</strong> ${emailService.getTestAccountInfo() ? 'Cuenta de prueba (Ethereal)' : 'Configuración personalizada'}</p>
              <p><strong>🕒 Fecha:</strong> ${new Date().toLocaleString()}</p>
            </div>
            ${emailService.getTestAccountInfo() ? `
              <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0;">
                <p><strong>💡 Nota:</strong> Este email fue enviado usando una cuenta de prueba de Ethereal Email.</p>
                <p>Puedes ver todos los emails enviados en: <a href="https://ethereal.email">https://ethereal.email</a></p>
              </div>
            ` : ''}
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>Sistema de Inventario - ${new Date().getFullYear()}</p>
          </div>
        </div>
      `,
      text: 'Prueba del sistema de notificaciones - ¡Funcionando correctamente!',
    });

    if (result.success) {
      console.log('✅ Email de prueba enviado exitosamente');
      if (result.previewUrl) {
        console.log(`🔗 Ver email en: ${result.previewUrl}`);
      }
      return { success: true, previewUrl: result.previewUrl };
    } else {
      console.log('❌ Error enviando email de prueba:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('❌ Error en prueba del sistema:', error);
    return { success: false, error: error.message };
  }
}

// Función para obtener información del sistema
export async function getNotificationSystemInfo() {
  try {
    const testAccount = emailService.getTestAccountInfo();
    const isConnected = await emailService.verifyConnection();
    
    return {
      isInitialized: true,
      isConnected,
      emailService: {
        type: testAccount ? 'test' : 'custom',
        testAccount: testAccount ? {
          user: testAccount.user,
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          webUrl: testAccount.web,
        } : null,
      },
      features: {
        emailNotifications: isConnected,
        inAppNotifications: true,
        stockAlerts: true,
        movementNotifications: true,
        userActionNotifications: true,
        systemUpdates: true,
      },
    };
  } catch (error) {
    console.error('Error obteniendo información del sistema:', error);
    return {
      isInitialized: false,
      isConnected: false,
      error: error.message,
    };
  }
}
