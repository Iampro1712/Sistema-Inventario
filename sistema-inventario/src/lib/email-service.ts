import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface TestAccount {
  user: string;
  pass: string;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
  };
  imap: {
    host: string;
    port: number;
    secure: boolean;
  };
  pop3: {
    host: string;
    port: number;
    secure: boolean;
  };
  web: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private testAccount: TestAccount | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Primero intentar usar configuración SMTP real desde variables de entorno
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        console.log('🔧 Usando configuración SMTP real desde variables de entorno...');
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        // Verificar la conexión
        await this.transporter.verify();
        console.log('✅ Conexión SMTP real verificada exitosamente');

      } else {
        // Intentar obtener configuración de la base de datos
        const emailConfig = await this.getEmailConfig();

        if (emailConfig && emailConfig.smtpHost && !emailConfig.isTestMode) {
          // Usar configuración real de la base de datos
          this.transporter = nodemailer.createTransport({
            host: emailConfig.smtpHost,
            port: emailConfig.smtpPort || 587,
            secure: emailConfig.smtpSecure || false,
            auth: {
              user: emailConfig.smtpUser,
              pass: emailConfig.smtpPass,
            },
          });
        } else {
          // Como último recurso, crear cuenta de prueba
          console.log('⚠️ No se encontró configuración SMTP real, usando cuenta de prueba...');
          await this.createTestAccount();
        }
      }

      this.isInitialized = true;
      console.log('✅ Servicio de email inicializado');
    } catch (error) {
      console.error('❌ Error inicializando servicio de email:', error);
      throw error;
    }
  }

  private async createTestAccount() {
    try {
      console.log('🔧 Creando cuenta de prueba automáticamente...');
      
      // Crear cuenta de prueba con Ethereal Email
      this.testAccount = await nodemailer.createTestAccount();
      
      // Crear transporter con la cuenta de prueba
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: this.testAccount.user,
          pass: this.testAccount.pass,
        },
      });

      // Guardar configuración en la base de datos
      await this.saveTestAccountConfig();
      
      console.log('✅ Cuenta de prueba creada exitosamente');
      console.log(`📧 Usuario: ${this.testAccount.user}`);
      console.log(`🔗 Ver emails en: https://ethereal.email`);
    } catch (error) {
      console.error('❌ Error creando cuenta de prueba:', error);
      throw error;
    }
  }

  private async saveTestAccountConfig() {
    if (!this.testAccount) return;

    try {
      await prisma.emailConfig.upsert({
        where: { id: 'default' },
        update: {
          testAccount: this.testAccount as any,
          isTestMode: true,
          fromEmail: this.testAccount.user,
          isVerified: true,
          lastTested: new Date(),
        },
        create: {
          id: 'default',
          testAccount: this.testAccount as any,
          isTestMode: true,
          fromEmail: this.testAccount.user,
          fromName: 'Sistema de Inventario',
          isVerified: true,
          lastTested: new Date(),
        },
      });
    } catch (error) {
      console.error('Error guardando configuración de prueba:', error);
    }
  }

  private async getEmailConfig() {
    try {
      return await prisma.emailConfig.findFirst({
        where: { isActive: true },
      });
    } catch (error) {
      console.error('Error obteniendo configuración de email:', error);
      return null;
    }
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; previewUrl?: string; error?: string }> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.transporter) {
        throw new Error('Transporter no inicializado');
      }

      const emailConfig = await this.getEmailConfig();
      const fromEmail = emailConfig?.fromEmail || this.testAccount?.user || 'noreply@sistema.com';
      const fromName = emailConfig?.fromName || 'Sistema de Inventario';

      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      let previewUrl;
      if (emailConfig?.isTestMode && this.testAccount) {
        previewUrl = nodemailer.getTestMessageUrl(info);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl,
      };
    } catch (error) {
      console.error('Error enviando email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.transporter) {
        return false;
      }

      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Error verificando conexión:', error);
      return false;
    }
  }

  getTestAccountInfo() {
    return this.testAccount;
  }

  async resetConfiguration() {
    this.transporter = null;
    this.testAccount = null;
    this.isInitialized = false;
  }
}

// Instancia singleton
export const emailService = new EmailService();

// Funciones de utilidad para templates de email
export function createEmailTemplate(title: string, content: string, actionUrl?: string, actionText?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f8f9fa; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        .alert { padding: 15px; border-radius: 4px; margin: 10px 0; }
        .alert-info { background-color: #e3f2fd; border-left: 4px solid #2196f3; }
        .alert-warning { background-color: #fff3e0; border-left: 4px solid #ff9800; }
        .alert-success { background-color: #e8f5e8; border-left: 4px solid #4caf50; }
        .alert-error { background-color: #ffebee; border-left: 4px solid #f44336; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          ${content}
          ${actionUrl && actionText ? `<p><a href="${actionUrl}" class="button">${actionText}</a></p>` : ''}
        </div>
        <div class="footer">
          <p>Sistema de Inventario - ${new Date().getFullYear()}</p>
          <p>Este es un email automático, por favor no responder.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default emailService;
