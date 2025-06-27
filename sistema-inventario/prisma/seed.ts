import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Crear usuarios iniciales
  const users = [
    {
      name: "Master Admin",
      email: "master@sistema.com",
      role: "CEO" as const,
      isActive: true,
      phone: "+34 600 000 000",
      department: "Sistemas",
      lastLogin: new Date(),
      permissions: {
        canManageUsers: true,
        canManageInventory: true,
        canViewReports: true,
        canExportData: true,
        canManageSettings: true,
        canManagePermissions: true,
        canDeleteUsers: true,
        canViewFinancials: true
      }
    },
    {
      name: "Juan Pérez",
      email: "juan.perez@empresa.com",
      role: "CEO" as const,
      isActive: true,
      phone: "+34 612 345 678",
      department: "Dirección General",
      lastLogin: new Date("2024-01-15T10:30:00Z"),
      permissions: {
        canManageUsers: true,
        canManageInventory: true,
        canViewReports: true,
        canExportData: true,
        canManageSettings: true,
        canManagePermissions: true,
        canDeleteUsers: true,
        canViewFinancials: true
      }
    },
    {
      name: "María García",
      email: "maria.garcia@empresa.com",
      role: "ADMIN" as const,
      isActive: true,
      phone: "+34 623 456 789",
      department: "Administración",
      lastLogin: new Date("2024-01-15T09:15:00Z"),
      permissions: {
        canManageUsers: true,
        canManageInventory: true,
        canViewReports: true,
        canExportData: true,
        canManageSettings: true,
        canManagePermissions: true,
        canDeleteUsers: true,
        canViewFinancials: false
      }
    },
    {
      name: "Carlos López",
      email: "carlos.lopez@empresa.com",
      role: "MANAGER" as const,
      isActive: true,
      phone: "+34 634 567 890",
      department: "Ventas",
      lastLogin: new Date("2024-01-14T16:45:00Z"),
      permissions: {
        canManageUsers: false,
        canManageInventory: true,
        canViewReports: true,
        canExportData: true,
        canManageSettings: false,
        canManagePermissions: false,
        canDeleteUsers: false,
        canViewFinancials: false
      }
    },
    {
      name: "Ana Martínez",
      email: "ana.martinez@empresa.com",
      role: "USER" as const,
      isActive: false,
      phone: "+34 645 678 901",
      department: "Contabilidad",
      lastLogin: new Date("2024-01-10T14:20:00Z"),
      permissions: {
        canManageUsers: false,
        canManageInventory: false,
        canViewReports: true,
        canExportData: false,
        canManageSettings: false,
        canManagePermissions: false,
        canDeleteUsers: false,
        canViewFinancials: true
      }
    },
    {
      name: "Luis Rodríguez",
      email: "luis.rodriguez@empresa.com",
      role: "MANAGER" as const,
      isActive: true,
      phone: "+34 656 789 012",
      department: "Compras",
      lastLogin: new Date("2024-01-15T11:30:00Z"),
      permissions: {
        canManageUsers: false,
        canManageInventory: true,
        canViewReports: true,
        canExportData: true,
        canManageSettings: false,
        canManagePermissions: false,
        canDeleteUsers: false,
        canViewFinancials: false
      }
    }
  ];

  // Crear usuarios uno por uno
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData
    });
    console.log(`✅ Created user: ${user.name} (${user.email})`);
  }

  // Crear categorías de ejemplo
  const categorias = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Electrónicos' },
      update: {},
      create: {
        name: 'Electrónicos',
        description: 'Dispositivos electrónicos y tecnología',
        color: '#3B82F6',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Accesorios' },
      update: {},
      create: {
        name: 'Accesorios',
        description: 'Accesorios y complementos',
        color: '#10B981',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Audio' },
      update: {},
      create: {
        name: 'Audio',
        description: 'Equipos de audio y sonido',
        color: '#F59E0B',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Gaming' },
      update: {},
      create: {
        name: 'Gaming',
        description: 'Productos para gaming',
        color: '#EF4444',
      },
    }),
  ]);

  // Crear productos de ejemplo
  const productos = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'LAP-001' },
      update: {},
      create: {
        name: 'Laptop Dell XPS 13',
        description: 'Laptop ultrabook con procesador Intel i7',
        sku: 'LAP-001',
        price: 1299.99,
        cost: 999.99,
        stock: 5,
        minStock: 2,
        categoryId: categorias[0].id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'MOU-002' },
      update: {},
      create: {
        name: 'Mouse Logitech MX',
        description: 'Mouse inalámbrico ergonómico',
        sku: 'MOU-002',
        price: 99.99,
        cost: 59.99,
        stock: 15,
        minStock: 5,
        categoryId: categorias[1].id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'KEY-003' },
      update: {},
      create: {
        name: 'Teclado Mecánico',
        description: 'Teclado mecánico RGB para gaming',
        sku: 'KEY-003',
        price: 149.99,
        cost: 89.99,
        stock: 8,
        minStock: 3,
        categoryId: categorias[3].id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'AUD-004' },
      update: {},
      create: {
        name: 'Auriculares Sony',
        description: 'Auriculares inalámbricos con cancelación de ruido',
        sku: 'AUD-004',
        price: 299.99,
        cost: 199.99,
        stock: 12,
        minStock: 4,
        categoryId: categorias[2].id,
      },
    }),
  ]);

  // Crear configuraciones por defecto
  const defaultSettings = [
    // General
    { key: 'company.name', value: 'Mi Empresa S.A.', category: 'general' },
    { key: 'company.ruc', value: '12345678901', category: 'general' },
    { key: 'company.address', value: 'Av. Principal 123, Ciudad', category: 'general' },
    { key: 'company.phone', value: '+1 234 567 8900', category: 'general' },
    { key: 'company.email', value: 'contacto@miempresa.com', category: 'general' },
    { key: 'inventory.defaultMinStock', value: 5, category: 'general' },
    { key: 'inventory.currency', value: 'USD', category: 'general' },
    { key: 'inventory.autoAlerts', value: true, category: 'general' },
    { key: 'inventory.autoSku', value: true, category: 'general' },

    // Notificaciones
    { key: 'notifications.lowStock', value: true, category: 'notifications' },
    { key: 'notifications.outOfStock', value: true, category: 'notifications' },
    { key: 'notifications.highVolume', value: false, category: 'notifications' },
    { key: 'notifications.email', value: true, category: 'notifications' },
    { key: 'notifications.system', value: true, category: 'notifications' },
    { key: 'notifications.emailAddress', value: 'admin@empresa.com', category: 'notifications' },

    // Seguridad
    { key: 'security.twoFactor', value: false, category: 'security' },
    { key: 'security.multipleSessions', value: true, category: 'security' },
    { key: 'security.sessionTimeout', value: 60, category: 'security' },
    { key: 'security.passwordMinLength', value: 8, category: 'security' },
    { key: 'security.passwordRequireSpecial', value: true, category: 'security' },

    // Apariencia
    { key: 'appearance.theme', value: 'system', category: 'appearance' },
    { key: 'appearance.primaryColor', value: 'blue', category: 'appearance' },
    { key: 'appearance.language', value: 'es', category: 'appearance' },
    { key: 'appearance.dateFormat', value: 'DD/MM/YYYY', category: 'appearance' },

    // Base de datos
    { key: 'database.backupEnabled', value: true, category: 'database' },
    { key: 'database.backupFrequency', value: 'daily', category: 'database' },
    { key: 'database.retentionDays', value: 30, category: 'database' },
    { key: 'database.autoOptimize', value: true, category: 'database' },

    // Integraciones
    { key: 'integrations.apiEnabled', value: false, category: 'integrations' },
    { key: 'integrations.webhooksEnabled', value: false, category: 'integrations' },
    { key: 'integrations.exportFormats', value: ['json', 'csv', 'excel'], category: 'integrations' },
  ];

  for (const setting of defaultSettings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    });
  }

  console.log('🎉 Seed completado:');
  console.log('- Usuarios creados:', users.length);
  console.log('- Categorías creadas:', categorias.length);
  console.log('- Productos creados:', productos.length);
  console.log('- Configuraciones creadas:', defaultSettings.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
