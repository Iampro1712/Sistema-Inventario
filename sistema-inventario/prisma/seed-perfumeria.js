const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Seeding database con datos de perfumería...');

  // Crear usuarios iniciales
  const users = [
    {
      name: "Master Admin",
      email: "master@sistema.com",
      role: "CEO",
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
      role: "CEO",
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
      role: "ADMIN",
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
      role: "MANAGER",
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
      role: "VENDEDOR",
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
      role: "MANAGER",
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

  // Crear usuarios uno por uno con contraseñas hasheadas
  for (const userData of users) {
    // Hashear contraseña por defecto
    const hashedPassword = await hashPassword('admin123');
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: hashedPassword
      }
    });
    console.log(`✅ Created user: ${user.name} (${user.email}) with password: admin123`);
  }

  // Crear categorías de perfumería
  const categorias = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Diseñador' },
      update: {},
      create: {
        name: 'Diseñador',
        description: 'Fragancias de casas de moda reconocidas mundialmente',
        color: '#8B5CF6',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Nicho' },
      update: {},
      create: {
        name: 'Nicho',
        description: 'Perfumes artesanales y de casas exclusivas',
        color: '#06B6D4',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Árabe' },
      update: {},
      create: {
        name: 'Árabe',
        description: 'Fragancias orientales y árabes tradicionales',
        color: '#F59E0B',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Unisex' },
      update: {},
      create: {
        name: 'Unisex',
        description: 'Fragancias para hombre y mujer',
        color: '#10B981',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Femenino' },
      update: {},
      create: {
        name: 'Femenino',
        description: 'Perfumes exclusivamente para mujer',
        color: '#EC4899',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Masculino' },
      update: {},
      create: {
        name: 'Masculino',
        description: 'Fragancias exclusivamente para hombre',
        color: '#3B82F6',
      },
    }),
  ]);

  console.log(`✅ Categorías creadas: ${categorias.length}`);

  console.log('🎉 Seed completado:');
  console.log('- Usuarios creados:', users.length);
  console.log('- Categorías creadas:', categorias.length);
  console.log('- Configuraciones: No modificadas (manteniendo las existentes)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
