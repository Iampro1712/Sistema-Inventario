const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function main() {
  console.log('🏍️ Seeding database con datos de taller de repuestos de motos...');

  // Crear usuarios iniciales para taller de motos
  const users = [
    {
      name: "Roberto Martínez",
      email: "roberto@tallermoto.com",
      role: "CEO",
      isActive: true,
      phone: "+34 600 111 222",
      department: "Dirección General",
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
      name: "Carmen Rodríguez",
      email: "carmen@tallermoto.com",
      role: "ADMIN",
      isActive: true,
      phone: "+34 611 333 444",
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
      name: "Miguel Santos",
      email: "miguel@tallermoto.com",
      role: "MANAGER",
      isActive: true,
      phone: "+34 622 555 666",
      department: "Taller",
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
      name: "Laura Fernández",
      email: "laura@tallermoto.com",
      role: "VENDEDOR",
      isActive: true,
      phone: "+34 633 777 888",
      department: "Ventas",
      lastLogin: new Date("2024-01-15T11:30:00Z"),
      permissions: {
        canManageUsers: false,
        canManageInventory: false,
        canViewReports: true,
        canExportData: false,
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

  // Crear categorías de repuestos de motos
  const categorias = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Motor' },
      update: {},
      create: {
        name: 'Motor',
        description: 'Repuestos del sistema motor: pistones, válvulas, juntas',
        color: '#DC2626',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Transmisión' },
      update: {},
      create: {
        name: 'Transmisión',
        description: 'Cadenas, piñones, embragues y componentes de transmisión',
        color: '#7C3AED',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Frenos' },
      update: {},
      create: {
        name: 'Frenos',
        description: 'Pastillas, discos, líquido de frenos y componentes',
        color: '#EA580C',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Suspensión' },
      update: {},
      create: {
        name: 'Suspensión',
        description: 'Amortiguadores, muelles, horquillas y componentes',
        color: '#059669',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Eléctrico' },
      update: {},
      create: {
        name: 'Eléctrico',
        description: 'Baterías, bombillas, cables y sistema eléctrico',
        color: '#0891B2',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Carrocería' },
      update: {},
      create: {
        name: 'Carrocería',
        description: 'Carenados, espejos, asientos y accesorios externos',
        color: '#7C2D12',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Neumáticos' },
      update: {},
      create: {
        name: 'Neumáticos',
        description: 'Neumáticos, cámaras y accesorios para ruedas',
        color: '#1F2937',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Aceites y Lubricantes' },
      update: {},
      create: {
        name: 'Aceites y Lubricantes',
        description: 'Aceites de motor, filtros y productos de mantenimiento',
        color: '#B45309',
      },
    }),
  ]);

  console.log(`✅ Categorías creadas: ${categorias.length}`);

  console.log('🎉 Seed completado:');
  console.log('- Usuarios creados:', users.length);
  console.log('- Categorías creadas:', categorias.length);
  console.log('- Configuraciones: No modificadas (manteniendo las existentes)');
  console.log('\n📋 Credenciales de acceso:');
  console.log('CEO: roberto@tallermoto.com / admin123');
  console.log('ADMIN: carmen@tallermoto.com / admin123');
  console.log('MANAGER: miguel@tallermoto.com / admin123');
  console.log('VENDEDOR: laura@tallermoto.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });