import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuraciones por defecto
const defaultSettings = {
  // General
  'company.name': { value: 'Mi Empresa S.A.', category: 'general' },
  'company.ruc': { value: '12345678901', category: 'general' },
  'company.address': { value: 'Av. Principal 123, Ciudad', category: 'general' },
  'company.phone': { value: '+1 234 567 8900', category: 'general' },
  'company.email': { value: 'contacto@miempresa.com', category: 'general' },
  'inventory.defaultMinStock': { value: 5, category: 'general' },
  'inventory.currency': { value: 'USD', category: 'general' },
  'inventory.autoAlerts': { value: true, category: 'general' },
  'inventory.autoSku': { value: true, category: 'general' },

  // Notificaciones
  'notifications.lowStock': { value: true, category: 'notifications' },
  'notifications.outOfStock': { value: true, category: 'notifications' },
  'notifications.highVolume': { value: false, category: 'notifications' },
  'notifications.email': { value: true, category: 'notifications' },
  'notifications.system': { value: true, category: 'notifications' },
  'notifications.emailAddress': { value: 'admin@empresa.com', category: 'notifications' },

  // Seguridad
  'security.twoFactor': { value: false, category: 'security' },
  'security.multipleSessions': { value: true, category: 'security' },
  'security.sessionTimeout': { value: 60, category: 'security' },
  'security.passwordMinLength': { value: 8, category: 'security' },
  'security.passwordRequireSpecial': { value: true, category: 'security' },

  // Apariencia
  'appearance.theme': { value: 'system', category: 'appearance' },
  'appearance.primaryColor': { value: 'blue', category: 'appearance' },
  'appearance.language': { value: 'es', category: 'appearance' },
  'appearance.dateFormat': { value: 'DD/MM/YYYY', category: 'appearance' },

  // Base de datos
  'database.backupEnabled': { value: true, category: 'database' },
  'database.backupFrequency': { value: 'daily', category: 'database' },
  'database.retentionDays': { value: 30, category: 'database' },
  'database.autoOptimize': { value: true, category: 'database' },

  // Integraciones
  'integrations.apiEnabled': { value: false, category: 'integrations' },
  'integrations.webhooksEnabled': { value: false, category: 'integrations' },
  'integrations.exportFormats': { value: ['json', 'csv', 'excel'], category: 'integrations' },
};

// GET - Obtener configuraciones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let whereClause = {};
    if (category) {
      whereClause = { category };
    }

    const settings = await prisma.settings.findMany({
      where: whereClause,
      orderBy: { key: 'asc' }
    });

    // Si no hay configuraciones, crear las por defecto
    if (settings.length === 0) {
      await initializeDefaultSettings();
      const newSettings = await prisma.settings.findMany({
        where: whereClause,
        orderBy: { key: 'asc' }
      });
      return NextResponse.json({ settings: newSettings });
    }

    return NextResponse.json({ settings });

  } catch (error) {
    console.error('Error al obtener configuraciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear o actualizar configuración
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, category } = body;

    if (!key || value === undefined || !category) {
      return NextResponse.json(
        { error: 'Key, value y category son requeridos' },
        { status: 400 }
      );
    }

    const setting = await prisma.settings.upsert({
      where: { key },
      update: { value, category },
      create: { key, value, category }
    });

    return NextResponse.json({ setting });

  } catch (error) {
    console.error('Error al guardar configuración:', error);
    return NextResponse.json(
      { error: 'Error al guardar configuración' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar múltiples configuraciones
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (!Array.isArray(settings)) {
      return NextResponse.json(
        { error: 'Settings debe ser un array' },
        { status: 400 }
      );
    }

    const updatePromises = settings.map(({ key, value, category }) =>
      prisma.settings.upsert({
        where: { key },
        update: { value, category },
        create: { key, value, category }
      })
    );

    const updatedSettings = await Promise.all(updatePromises);

    return NextResponse.json({ 
      message: 'Configuraciones actualizadas correctamente',
      settings: updatedSettings 
    });

  } catch (error) {
    console.error('Error al actualizar configuraciones:', error);
    return NextResponse.json(
      { error: 'Error al actualizar configuraciones' },
      { status: 500 }
    );
  }
}

// DELETE - Restablecer configuraciones a valores por defecto
export async function DELETE(request: NextRequest) {
  try {
    // Eliminar todas las configuraciones existentes
    await prisma.settings.deleteMany({});

    // Recrear configuraciones por defecto
    await initializeDefaultSettings();

    // Obtener las nuevas configuraciones
    const newSettings = await prisma.settings.findMany({
      orderBy: { key: 'asc' }
    });

    return NextResponse.json({
      message: 'Configuraciones restablecidas a valores por defecto',
      settings: newSettings
    });

  } catch (error) {
    console.error('Error al restablecer configuraciones:', error);
    return NextResponse.json(
      { error: 'Error al restablecer configuraciones' },
      { status: 500 }
    );
  }
}

// Función para inicializar configuraciones por defecto
async function initializeDefaultSettings() {
  const settingsToCreate = Object.entries(defaultSettings).map(([key, config]) => ({
    key,
    value: config.value,
    category: config.category
  }));

  await prisma.settings.createMany({
    data: settingsToCreate,
    skipDuplicates: true
  });
}
