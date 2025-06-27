import { PrismaClient } from '@prisma/client';
import { emailService, createEmailTemplate } from './email-service';

const prisma = new PrismaClient();

export type NotificationType = 'STOCK_ALERT' | 'MOVEMENT' | 'USER_ACTION' | 'SYSTEM_UPDATE' | 'SECURITY' | 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

interface CreateNotificationData {
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  userId: string;
  senderId?: string;
  data?: any;
  sendEmail?: boolean;
  emailOverride?: string; // Email alternativo para enviar notificaciones
}

interface NotificationTemplate {
  subject: string;
  content: string;
  actionUrl?: string;
  actionText?: string;
}

class NotificationService {
  
  // Crear una nueva notificación
  async createNotification(data: CreateNotificationData) {
    try {
      // Crear la notificación en la base de datos
      const notification = await prisma.notification.create({
        data: {
          title: data.title,
          message: data.message,
          type: data.type,
          priority: data.priority || 'NORMAL',
          userId: data.userId,
          senderId: data.senderId,
          data: data.data,
        },
        include: {
          user: true,
          sender: true,
        },
      });

      // Verificar configuración de notificaciones del usuario
      const settings = await this.getUserNotificationSettings(data.userId);
      
      // Enviar email si está habilitado
      if (data.sendEmail !== false && settings.emailEnabled && this.shouldSendEmailForType(data.type, settings)) {
        await this.sendNotificationEmail(notification, data.emailOverride);
      }

      return notification;
    } catch (error) {
      console.error('Error creando notificación:', error);
      throw error;
    }
  }

  // Crear notificación masiva para múltiples usuarios
  async createBulkNotification(data: Omit<CreateNotificationData, 'userId'>, userIds: string[]) {
    try {
      const notifications = [];
      
      for (const userId of userIds) {
        const notification = await this.createNotification({
          ...data,
          userId,
        });
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error('Error creando notificaciones masivas:', error);
      throw error;
    }
  }

  // Obtener notificaciones de un usuario
  async getUserNotifications(userId: string, options: {
    status?: 'UNREAD' | 'READ' | 'ARCHIVED';
    type?: NotificationType;
    limit?: number;
    offset?: number;
  } = {}) {
    try {
      const where: any = { userId };
      
      if (options.status) {
        where.status = options.status;
      }
      
      if (options.type) {
        where.type = options.type;
      }

      return await prisma.notification.findMany({
        where,
        include: {
          sender: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: options.limit || 50,
        skip: options.offset || 0,
      });
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      throw error;
    }
  }

  // Marcar notificación como leída
  async markAsRead(notificationId: string, userId: string) {
    try {
      return await prisma.notification.update({
        where: {
          id: notificationId,
          userId, // Asegurar que solo el usuario propietario pueda marcarla
        },
        data: {
          status: 'READ',
          readAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      throw error;
    }
  }

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId: string) {
    try {
      return await prisma.notification.updateMany({
        where: {
          userId,
          status: 'UNREAD',
        },
        data: {
          status: 'READ',
          readAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
      throw error;
    }
  }

  // Obtener conteo de notificaciones no leídas
  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await prisma.notification.count({
        where: {
          userId,
          status: 'UNREAD',
        },
      });
    } catch (error) {
      console.error('Error obteniendo conteo de no leídas:', error);
      return 0;
    }
  }

  // Obtener configuración de notificaciones del usuario
  async getUserNotificationSettings(userId: string) {
    try {
      let settings = await prisma.notificationSettings.findUnique({
        where: { userId },
      });

      // Crear configuración por defecto si no existe
      if (!settings) {
        settings = await prisma.notificationSettings.create({
          data: { userId },
        });
      }

      return settings;
    } catch (error) {
      console.error('Error obteniendo configuración de notificaciones:', error);
      throw error;
    }
  }

  // Actualizar configuración de notificaciones
  async updateNotificationSettings(userId: string, settings: any) {
    try {
      return await prisma.notificationSettings.upsert({
        where: { userId },
        update: settings,
        create: {
          userId,
          ...settings,
        },
      });
    } catch (error) {
      console.error('Error actualizando configuración de notificaciones:', error);
      throw error;
    }
  }

  // Verificar si debe enviar email para un tipo específico
  private shouldSendEmailForType(type: NotificationType, settings: any): boolean {
    switch (type) {
      case 'STOCK_ALERT':
        return settings.emailStockAlerts;
      case 'MOVEMENT':
        return settings.emailMovements;
      case 'USER_ACTION':
        return settings.emailUserActions;
      case 'SYSTEM_UPDATE':
        return settings.emailSystemUpdates;
      default:
        return true;
    }
  }

  // Enviar email de notificación
  private async sendNotificationEmail(notification: any, emailOverride?: string) {
    try {
      const template = this.getEmailTemplate(notification);
      const html = createEmailTemplate(template.subject, template.content, template.actionUrl, template.actionText);

      // Usar emailOverride si está disponible, sino usar el email del usuario
      const emailTo = emailOverride || notification.user.email;

      const result = await emailService.sendEmail({
        to: emailTo,
        subject: template.subject,
        html,
        text: notification.message,
      });

      // Actualizar estado del email en la notificación
      if (result.success) {
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            emailSent: true,
            emailSentAt: new Date(),
          },
        });
      }

      return result;
    } catch (error) {
      console.error('Error enviando email de notificación:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener template de email según el tipo de notificación
  private getEmailTemplate(notification: any): NotificationTemplate {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    switch (notification.type) {
      case 'STOCK_ALERT':
        return {
          subject: `🚨 Alerta de Stock - ${notification.title}`,
          content: `
            <div class="alert alert-warning">
              <h3>Alerta de Inventario</h3>
              <p><strong>${notification.title}</strong></p>
              <p>${notification.message}</p>
              ${notification.data?.productName ? `<p><strong>Producto:</strong> ${notification.data.productName}</p>` : ''}
              ${notification.data?.currentStock ? `<p><strong>Stock actual:</strong> ${notification.data.currentStock}</p>` : ''}
            </div>
          `,
          actionUrl: `${baseUrl}/productos`,
          actionText: 'Ver Productos',
        };

      case 'MOVEMENT':
        return {
          subject: `📦 Movimiento de Inventario - ${notification.title}`,
          content: `
            <div class="alert alert-info">
              <h3>Movimiento de Inventario</h3>
              <p><strong>${notification.title}</strong></p>
              <p>${notification.message}</p>
              ${notification.data?.productName ? `<p><strong>Producto:</strong> ${notification.data.productName}</p>` : ''}
              ${notification.data?.quantity ? `<p><strong>Cantidad:</strong> ${notification.data.quantity}</p>` : ''}
              ${notification.data?.type ? `<p><strong>Tipo:</strong> ${notification.data.type}</p>` : ''}
            </div>
          `,
          actionUrl: `${baseUrl}/movimientos`,
          actionText: 'Ver Movimientos',
        };

      case 'USER_ACTION':
        // Verificar si es una notificación de nuevo usuario
        if (notification.title === 'Nuevo Usuario Registrado' && notification.data) {
          return {
            subject: `👤 Nuevo Usuario Registrado - ${notification.data.newUserName}`,
            content: `
              <div class="alert alert-success">
                <h3>🎉 Nuevo Usuario Registrado</h3>
                <p>Se ha registrado un nuevo usuario en el sistema:</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                  <p><strong>📝 Nombre Completo:</strong> ${notification.data.newUserName}</p>
                  <p><strong>📧 Correo Electrónico:</strong> ${notification.data.newUserEmail}</p>
                  <p><strong>📱 Número de Teléfono:</strong> ${notification.data.newUserPhone}</p>
                  <p><strong>👔 Rol:</strong> ${notification.data.newUserRole}</p>
                  <p><strong>🏢 Departamento:</strong> ${notification.data.newUserDepartment}</p>
                  <p><strong>📅 Fecha de Registro:</strong> ${new Date(notification.data.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                <p>El usuario ya puede acceder al sistema con sus credenciales.</p>
              </div>
            `,
            actionUrl: `${baseUrl}/usuarios`,
            actionText: 'Gestionar Usuarios',
          };
        }

        // Verificar si es una notificación de bienvenida
        if (notification.title === 'Nuevo Compañero' && notification.data?.isWelcomeNotification) {
          return {
            subject: `🎉 Nuevo Compañero - ${notification.data.newUserName}`,
            content: `
              <div class="alert alert-success">
                <h3>🎉 ¡Nuevo Compañero!</h3>
                <p>Bienvenido <strong>${notification.data.newUserName}</strong>, Reciban con un buen abrazo al nuevo!</p>
                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6;">
                  <p>🤝 Un nuevo miembro se ha unido a nuestro equipo. ¡Démosle una cálida bienvenida!</p>
                </div>
              </div>
            `,
            actionUrl: `${baseUrl}/usuarios`,
            actionText: 'Ver Equipo',
          };
        }

        // Plantilla genérica para otras acciones de usuario
        return {
          subject: `👤 Acción de Usuario - ${notification.title}`,
          content: `
            <div class="alert alert-info">
              <h3>Acción de Usuario</h3>
              <p><strong>${notification.title}</strong></p>
              <p>${notification.message}</p>
              ${notification.sender ? `<p><strong>Realizado por:</strong> ${notification.sender.name}</p>` : ''}
            </div>
          `,
          actionUrl: `${baseUrl}/usuarios`,
          actionText: 'Ver Usuarios',
        };

      default:
        return {
          subject: `📢 ${notification.title}`,
          content: `
            <div class="alert alert-info">
              <h3>${notification.title}</h3>
              <p>${notification.message}</p>
            </div>
          `,
          actionUrl: baseUrl,
          actionText: 'Ir al Sistema',
        };
    }
  }

  // Limpiar notificaciones antiguas
  async cleanupOldNotifications(daysOld: number = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          status: {
            in: ['READ', 'ARCHIVED'],
          },
        },
      });

      console.log(`🧹 Limpieza completada: ${result.count} notificaciones eliminadas`);
      return result;
    } catch (error) {
      console.error('Error limpiando notificaciones antiguas:', error);
      throw error;
    }
  }
}

// Instancia singleton
export const notificationService = new NotificationService();

export default notificationService;
