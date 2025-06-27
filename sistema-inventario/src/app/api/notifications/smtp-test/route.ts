import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-middleware';
import nodemailer from 'nodemailer';

// POST - Probar configuración SMTP
export async function POST(request: NextRequest) {
  const authResult = await requirePermission(request, 'notifications.manage');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const body = await request.json();
    const {
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smtpSecure,
      fromName,
      fromEmail,
      isTestMode,
    } = body;

    if (isTestMode) {
      return NextResponse.json({
        message: 'Modo de prueba activado - No se requiere configuración SMTP',
      });
    }

    // Validar campos requeridos
    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json(
        { error: 'Campos requeridos: smtpHost, smtpUser, smtpPass' },
        { status: 400 }
      );
    }

    // Crear transporter temporal para prueba
    const testTransporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort || 587,
      secure: smtpSecure || false,
      auth: {
        user: smtpUser,
        pass: smtpPass === '••••••••' ? undefined : smtpPass,
      },
    });

    // Verificar conexión
    console.log('🧪 Probando conexión SMTP...');
    await testTransporter.verify();
    console.log('✅ Conexión SMTP verificada');

    // Enviar email de prueba
    const testEmail = {
      from: `"${fromName || 'Sistema de Inventario'}" <${fromEmail || smtpUser}>`,
      to: user.email,
      subject: '🧪 Prueba de Configuración SMTP - Sistema de Inventario',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Prueba SMTP</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { padding: 20px; }
            .footer { background-color: #f8f9fa; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666; }
            .success { background-color: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; }
            .info { background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧪 Prueba de Configuración SMTP</h1>
            </div>
            <div class="content">
              <div class="success">
                <h3>✅ ¡Configuración SMTP Funcionando!</h3>
                <p>Este email confirma que tu configuración SMTP está funcionando correctamente.</p>
              </div>
              
              <div class="info">
                <h4>📋 Detalles de la Configuración</h4>
                <p><strong>Servidor SMTP:</strong> ${smtpHost}:${smtpPort}</p>
                <p><strong>Usuario:</strong> ${smtpUser}</p>
                <p><strong>Conexión segura:</strong> ${smtpSecure ? 'Sí (SSL/TLS)' : 'No'}</p>
                <p><strong>Remitente:</strong> "${fromName}" &lt;${fromEmail || smtpUser}&gt;</p>
                <p><strong>Fecha de prueba:</strong> ${new Date().toLocaleString()}</p>
              </div>

              <p>Ahora puedes usar esta configuración para enviar notificaciones reales del sistema de inventario.</p>
              
              <p><strong>Próximos pasos:</strong></p>
              <ul>
                <li>Guarda la configuración si la prueba fue exitosa</li>
                <li>Desactiva el "Modo de prueba" para usar emails reales</li>
                <li>Configura las preferencias de notificación de los usuarios</li>
              </ul>
            </div>
            <div class="footer">
              <p>Sistema de Inventario - ${new Date().getFullYear()}</p>
              <p>Email de prueba enviado a: ${user.email}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        🧪 Prueba de Configuración SMTP - Sistema de Inventario
        
        ✅ ¡Configuración SMTP Funcionando!
        
        Este email confirma que tu configuración SMTP está funcionando correctamente.
        
        Detalles de la Configuración:
        - Servidor SMTP: ${smtpHost}:${smtpPort}
        - Usuario: ${smtpUser}
        - Conexión segura: ${smtpSecure ? 'Sí (SSL/TLS)' : 'No'}
        - Remitente: "${fromName}" <${fromEmail || smtpUser}>
        - Fecha de prueba: ${new Date().toLocaleString()}
        
        Ahora puedes usar esta configuración para enviar notificaciones reales del sistema de inventario.
        
        Email de prueba enviado a: ${user.email}
      `,
    };

    console.log('📧 Enviando email de prueba...');
    const info = await testTransporter.sendMail(testEmail);
    console.log('✅ Email de prueba enviado exitosamente');
    console.log('📧 Message ID:', info.messageId);

    return NextResponse.json({
      message: `Email de prueba enviado exitosamente a ${user.email}`,
      messageId: info.messageId,
      details: {
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        user: smtpUser,
      },
    });
  } catch (error) {
    console.error('❌ Error probando configuración SMTP:', error);
    
    let errorMessage = 'Error probando configuración SMTP';
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        errorMessage = 'Credenciales inválidas. Verifica tu usuario y contraseña.';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'No se pudo conectar al servidor SMTP. Verifica el host.';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Conexión rechazada. Verifica el puerto y configuración de seguridad.';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
