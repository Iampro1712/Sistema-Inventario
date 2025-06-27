const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Crear usuario administrador por defecto
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sistema.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@sistema.com',
      role: 'ADMIN',
      isActive: true,
    },
  });

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

  console.log('Seed completado:');
  console.log('- Usuario admin creado:', admin.email);
  console.log('- Categorías creadas:', categorias.length);
  console.log('- Productos creados:', productos.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
