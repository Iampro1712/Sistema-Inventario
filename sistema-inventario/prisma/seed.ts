import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/password';

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
      role: "VENDEDOR" as const,
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

  // Crear productos de perfumería
  const productos = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'DIOR-001' },
      update: {},
      create: {
        name: 'Dior Sauvage EDT 100ml',
        description: 'Fragancia masculina fresca y especiada con bergamota y pimienta',
        sku: 'DIOR-001',
        price: 125.00,
        cost: 85.00,
        stock: 12,
        minStock: 3,
        categoryId: categorias[0].id, // Diseñador
      },
    }),
    prisma.product.upsert({
      where: { sku: 'CREED-002' },
      update: {},
      create: {
        name: 'Creed Aventus EDP 120ml',
        description: 'Fragancia nicho masculina con piña, bergamota y pachulí',
        sku: 'CREED-002',
        price: 320.00,
        cost: 240.00,
        stock: 6,
        minStock: 2,
        categoryId: categorias[1].id, // Nicho
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ARAB-003' },
      update: {},
      create: {
        name: 'Oud Mood EDP 100ml',
        description: 'Fragancia árabe unisex con oud, rosa y azafrán',
        sku: 'ARAB-003',
        price: 89.00,
        cost: 55.00,
        stock: 15,
        minStock: 4,
        categoryId: categorias[2].id, // Árabe
      },
    }),
    prisma.product.upsert({
      where: { sku: 'CHANEL-004' },
      update: {},
      create: {
        name: 'Chanel No. 5 EDP 100ml',
        description: 'Icónica fragancia femenina con aldehídos, ylang-ylang y sándalo',
        sku: 'CHANEL-004',
        price: 150.00,
        cost: 110.00,
        stock: 8,
        minStock: 2,
        categoryId: categorias[4].id, // Femenino
      },
    }),
    prisma.product.upsert({
      where: { sku: 'TOM-005' },
      update: {},
      create: {
        name: 'Tom Ford Black Orchid EDP 100ml',
        description: 'Fragancia unisex lujosa con orquídea negra, trufa y pachulí',
        sku: 'TOM-005',
        price: 180.00,
        cost: 135.00,
        stock: 10,
        minStock: 3,
        categoryId: categorias[3].id, // Unisex
      },
    }),
    prisma.product.upsert({
      where: { sku: 'VERSACE-006' },
      update: {},
      create: {
        name: 'Versace Eros EDT 100ml',
        description: 'Fragancia masculina seductora con menta, manzana verde y vainilla',
        sku: 'VERSACE-006',
        price: 95.00,
        cost: 65.00,
        stock: 20,
        minStock: 5,
        categoryId: categorias[5].id, // Masculino
      },
    }),
  ]);

  console.log('🎉 Seed completado:');
  console.log('- Usuarios creados:', users.length);
  console.log('- Categorías creadas:', categorias.length);
  console.log('- Productos creados:', productos.length);
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
