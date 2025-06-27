const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌸 Agregando productos de perfumería...');

  // Obtener categorías
  const categorias = await prisma.category.findMany();
  const diseñador = categorias.find(c => c.name === 'Diseñador');
  const nicho = categorias.find(c => c.name === 'Nicho');
  const arabe = categorias.find(c => c.name === 'Árabe');
  const unisex = categorias.find(c => c.name === 'Unisex');
  const femenino = categorias.find(c => c.name === 'Femenino');
  const masculino = categorias.find(c => c.name === 'Masculino');

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
        categoryId: diseñador?.id || categorias[0].id,
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
        categoryId: nicho?.id || categorias[1].id,
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
        categoryId: arabe?.id || categorias[2].id,
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
        categoryId: femenino?.id || categorias[4].id,
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
        categoryId: unisex?.id || categorias[3].id,
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
        categoryId: masculino?.id || categorias[5].id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'BYREDO-007' },
      update: {},
      create: {
        name: 'Byredo Gypsy Water EDP 100ml',
        description: 'Fragancia nicho unisex con bergamota, enebro y vainilla',
        sku: 'BYREDO-007',
        price: 195.00,
        cost: 145.00,
        stock: 7,
        minStock: 2,
        categoryId: nicho?.id || categorias[1].id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'MAISON-008' },
      update: {},
      create: {
        name: 'Maison Margiela Replica Jazz Club EDT 100ml',
        description: 'Fragancia masculina con notas de tabaco, ron y vainilla',
        sku: 'MAISON-008',
        price: 140.00,
        cost: 100.00,
        stock: 9,
        minStock: 3,
        categoryId: diseñador?.id || categorias[0].id,
      },
    }),
  ]);

  console.log('🎉 Productos de perfumería agregados:');
  console.log('- Productos creados:', productos.length);
  
  productos.forEach(producto => {
    console.log(`✅ ${producto.name} - $${producto.price}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
