import { notificationService } from './notification-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper para notificaciones de stock bajo
export async function notifyLowStock(productId: string, currentStock: number, minStock: number) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) return;

    // Obtener el email configurado para notificaciones
    const emailSetting = await prisma.settings.findUnique({
      where: { key: 'notifications.emailAddress' }
    });
    const notificationEmail = emailSetting?.value;

    // Obtener usuarios que deben recibir alertas de stock (CEO, MANAGER, ADMIN)
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['CEO', 'MANAGER', 'ADMIN'] },
        isActive: true,
      },
    });

    const userIds = users.map(user => user.id);

    await notificationService.createBulkNotification({
      title: 'Stock Bajo',
      message: `El producto "${product.name}" tiene stock bajo. Stock actual: ${currentStock}, mínimo requerido: ${minStock}`,
      type: 'STOCK_ALERT',
      priority: 'HIGH',
      data: {
        productId,
        productName: product.name,
        currentStock,
        minStock,
        sku: product.sku,
      },
      sendEmail: true,
      emailOverride: notificationEmail, // Enviar al email configurado
    }, userIds);

  } catch (error) {
    console.error('Error enviando notificación de stock bajo:', error);
  }
}

// Helper para notificaciones de stock agotado
export async function notifyStockOut(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) return;

    // Obtener el email configurado para notificaciones
    const emailSetting = await prisma.settings.findUnique({
      where: { key: 'notifications.emailAddress' }
    });
    const notificationEmail = emailSetting?.value;

    // Obtener usuarios que deben recibir alertas críticas (CEO, MANAGER, ADMIN)
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['CEO', 'MANAGER', 'ADMIN'] },
        isActive: true,
      },
    });

    const userIds = users.map(user => user.id);

    await notificationService.createBulkNotification({
      title: 'Stock Agotado',
      message: `¡CRÍTICO! El producto "${product.name}" se ha agotado completamente.`,
      type: 'STOCK_ALERT',
      priority: 'URGENT',
      data: {
        productId,
        productName: product.name,
        currentStock: 0,
        sku: product.sku,
      },
      sendEmail: true,
      emailOverride: notificationEmail, // Enviar al email configurado
    }, userIds);

  } catch (error) {
    console.error('Error enviando notificación de stock agotado:', error);
  }
}

// Helper para notificaciones de movimientos de inventario
export async function notifyInventoryMovement(movementId: string, userId: string) {
  try {
    const movement = await prisma.stockMovement.findUnique({
      where: { id: movementId },
      include: {
        product: true,
      },
    });

    if (!movement) return;

    // Obtener el email configurado para notificaciones
    const emailSetting = await prisma.settings.findUnique({
      where: { key: 'notifications.emailAddress' }
    });
    const notificationEmail = emailSetting?.value;

    // Obtener usuarios supervisores (CEO, MANAGER, ADMIN) excepto quien hizo el movimiento
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['CEO', 'MANAGER', 'ADMIN'] },
        isActive: true,
        id: { not: userId }, // Excluir quien hizo el movimiento
      },
    });

    const userIds = users.map(user => user.id);

    if (userIds.length === 0) return;

    const typeText = movement.type === 'IN' ? 'Entrada' : movement.type === 'OUT' ? 'Salida' : 'Ajuste';
    const quantityText = movement.type === 'OUT' ? `-${movement.quantity}` : `+${movement.quantity}`;

    // Solo notificar movimientos importantes (cantidad > 10)
    const isImportantMovement = Math.abs(movement.quantity) > 10;

    if (isImportantMovement) {
      await notificationService.createBulkNotification({
        title: `${typeText} de Inventario`,
        message: `Se registró una ${typeText.toLowerCase()} de ${movement.quantity} unidades del producto "${movement.product.name}". Razón: ${movement.reason}`,
        type: 'MOVEMENT',
        priority: 'NORMAL',
        data: {
          movementId,
          productId: movement.productId,
          productName: movement.product.name,
          quantity: quantityText,
          type: typeText,
          reason: movement.reason,
          sku: movement.product.sku,
        },
        sendEmail: true, // Enviar email al correo configurado
        emailOverride: notificationEmail,
        senderId: userId,
      }, userIds);
    }

  } catch (error) {
    console.error('Error enviando notificación de movimiento:', error);
  }
}

// Helper para notificaciones de acciones de usuarios
export async function notifyUserAction(action: string, targetUserId: string, performedByUserId: string, details?: any) {
  try {
    const [targetUser, performedByUser] = await Promise.all([
      prisma.user.findUnique({ where: { id: targetUserId } }),
      prisma.user.findUnique({ where: { id: performedByUserId } }),
    ]);

    if (!targetUser || !performedByUser) return;

    // Notificar al usuario afectado
    await notificationService.createNotification({
      title: 'Acción en tu cuenta',
      message: `${performedByUser.name} realizó la acción: ${action}`,
      type: 'USER_ACTION',
      priority: 'NORMAL',
      userId: targetUserId,
      senderId: performedByUserId,
      data: {
        action,
        performedBy: performedByUser.name,
        details,
      },
      sendEmail: true,
    });

    // Notificar a administradores si es una acción sensible
    const sensitiveActions = ['eliminar', 'desactivar', 'cambiar_rol', 'cambiar_permisos'];
    if (sensitiveActions.some(sa => action.toLowerCase().includes(sa))) {
      const admins = await prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'CEO'] },
          isActive: true,
          id: { not: performedByUserId },
        },
      });

      const adminIds = admins.map(admin => admin.id);

      if (adminIds.length > 0) {
        await notificationService.createBulkNotification({
          title: 'Acción Administrativa',
          message: `${performedByUser.name} realizó una acción sensible: ${action} en la cuenta de ${targetUser.name}`,
          type: 'SECURITY',
          priority: 'HIGH',
          data: {
            action,
            performedBy: performedByUser.name,
            targetUser: targetUser.name,
            details,
          },
          sendEmail: true,
          senderId: performedByUserId,
        }, adminIds);
      }
    }

  } catch (error) {
    console.error('Error enviando notificación de acción de usuario:', error);
  }
}

// Helper para notificaciones de nuevos productos
export async function notifyNewProduct(productId: string, createdByUserId: string) {
  try {
    const [product, createdBy] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId } }),
      prisma.user.findUnique({ where: { id: createdByUserId } }),
    ]);

    if (!product || !createdBy) return;

    // Notificar a supervisores
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['MANAGER', 'ADMIN', 'CEO'] },
        isActive: true,
        id: { not: createdByUserId },
      },
    });

    const userIds = users.map(user => user.id);

    if (userIds.length > 0) {
      await notificationService.createBulkNotification({
        title: 'Nuevo Producto Creado',
        message: `${createdBy.name} ha creado un nuevo producto: "${product.name}" (${product.sku})`,
        type: 'INFO',
        priority: 'NORMAL',
        data: {
          productId,
          productName: product.name,
          sku: product.sku,
          createdBy: createdBy.name,
        },
        sendEmail: false,
        senderId: createdByUserId,
      }, userIds);
    }

  } catch (error) {
    console.error('Error enviando notificación de nuevo producto:', error);
  }
}

// Helper para notificaciones de nuevo usuario
export async function notifyNewUser(userId: string, createdByUserId: string) {
  try {
    const newUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!newUser) return;

    // Obtener el email configurado para notificaciones
    const emailSetting = await prisma.settings.findUnique({
      where: { key: 'notifications.emailAddress' }
    });
    const notificationEmail = emailSetting?.value;

    // Obtener usuarios ADMIN y CEO para notificación detallada
    const adminUsers = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'CEO'] },
        isActive: true,
        id: { not: createdByUserId }, // Excluir quien creó el usuario
      },
    });

    // Obtener otros usuarios para notificación de bienvenida
    const otherUsers = await prisma.user.findMany({
      where: {
        role: { in: ['VENDEDOR', 'MANAGER'] },
        isActive: true,
        id: { not: createdByUserId }, // Excluir quien creó el usuario
      },
    });

    // Notificación detallada para ADMIN y CEO
    if (adminUsers.length > 0) {
      const adminUserIds = adminUsers.map(user => user.id);

      await notificationService.createBulkNotification({
        title: 'Nuevo Usuario Registrado',
        message: `Se ha registrado un nuevo usuario: ${newUser.name} (${newUser.email})`,
        type: 'USER_ACTION',
        priority: 'NORMAL',
        data: {
          newUserId: userId,
          newUserName: newUser.name,
          newUserEmail: newUser.email,
          newUserPhone: newUser.phone || 'No especificado',
          newUserRole: newUser.role,
          newUserDepartment: newUser.department || 'No especificado',
          createdAt: newUser.createdAt.toISOString(),
          isDetailedNotification: true,
        },
        sendEmail: true,
        emailOverride: notificationEmail, // Enviar al email configurado
      }, adminUserIds);
    }

    // Notificación de bienvenida para otros roles
    if (otherUsers.length > 0) {
      const otherUserIds = otherUsers.map(user => user.id);

      await notificationService.createBulkNotification({
        title: 'Nuevo Compañero',
        message: `Bienvenido ${newUser.name}, Reciban con un buen abrazo al nuevo!`,
        type: 'USER_ACTION',
        priority: 'LOW',
        data: {
          newUserId: userId,
          newUserName: newUser.name,
          isWelcomeNotification: true,
        },
        sendEmail: false, // Solo notificación en app para otros roles
      }, otherUserIds);
    }

  } catch (error) {
    console.error('Error enviando notificación de nuevo usuario:', error);
  }
}

// Helper para notificaciones del sistema
export async function notifySystemUpdate(title: string, message: string, priority: 'LOW' | 'NORMAL' | 'HIGH' = 'NORMAL') {
  try {
    // Notificar a todos los usuarios activos
    const users = await prisma.user.findMany({
      where: { isActive: true },
    });

    const userIds = users.map(user => user.id);

    await notificationService.createBulkNotification({
      title,
      message,
      type: 'SYSTEM_UPDATE',
      priority,
      data: {
        timestamp: new Date().toISOString(),
      },
      sendEmail: priority === 'HIGH',
    }, userIds);

  } catch (error) {
    console.error('Error enviando notificación del sistema:', error);
  }
}

// Helper para verificar y enviar alertas de stock automáticamente
export async function checkAndNotifyStockAlerts() {
  try {
    console.log('🔍 Verificando alertas de stock...');

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
    });

    for (const product of products) {
      if (product.stock <= 0) {
        await notifyStockOut(product.id);
      } else if (product.stock <= product.minStock) {
        await notifyLowStock(product.id, product.stock, product.minStock);
      }
    }

    console.log('✅ Verificación de alertas de stock completada');
  } catch (error) {
    console.error('Error verificando alertas de stock:', error);
  }
}

// Helper para limpiar notificaciones antiguas (ejecutar periódicamente)
export async function cleanupNotifications() {
  try {
    await notificationService.cleanupOldNotifications(30); // 30 días
  } catch (error) {
    console.error('Error limpiando notificaciones:', error);
  }
}
