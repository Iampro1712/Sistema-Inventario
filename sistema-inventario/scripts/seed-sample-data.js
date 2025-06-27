const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Agregando datos de ejemplo...');

  // Crear categorías si no existen
  const categorias = [
    { name: 'Electrónicos', description: 'Dispositivos electrónicos', color: '#3B82F6' },
    { name: 'Accesorios', description: 'Accesorios diversos', color: '#10B981' },
    { name: 'Audio', description: 'Equipos de audio', color: '#F59E0B' },
    { name: 'Gaming', description: 'Productos para gaming', color: '#EF4444' },
    { name: 'Otros', description: 'Otros productos', color: '#8B5CF6' }
  ];

  for (const categoria of categorias) {
    await prisma.category.upsert({
      where: { name: categoria.name },
      update: {},
      create: categoria
    });
  }

  // Obtener categorías creadas
  const categoriasCreadas = await prisma.category.findMany();
  const categoriaMap = {};
  categoriasCreadas.forEach(cat => {
    categoriaMap[cat.name] = cat.id;
  });

  // Crear productos de ejemplo
  const productos = [
    {
      name: 'Laptop Dell XPS 13',
      sku: 'DELL-XPS13-001',
      description: 'Laptop ultrabook de alta gama',
      price: 1299.99,
      stock: 15,
      minStock: 5,
      categoryId: categoriaMap['Electrónicos']
    },
    {
      name: 'Mouse Logitech MX Master 3',
      sku: 'LOG-MX3-001',
      description: 'Mouse inalámbrico profesional',
      price: 99.99,
      stock: 45,
      minStock: 10,
      categoryId: categoriaMap['Accesorios']
    },
    {
      name: 'Monitor Samsung 27" 4K',
      sku: 'SAM-27-4K-001',
      description: 'Monitor 4K de 27 pulgadas',
      price: 399.99,
      stock: 8,
      minStock: 3,
      categoryId: categoriaMap['Electrónicos']
    },
    {
      name: 'Teclado Mecánico Corsair K95',
      sku: 'COR-K95-001',
      description: 'Teclado mecánico RGB para gaming',
      price: 199.99,
      stock: 22,
      minStock: 8,
      categoryId: categoriaMap['Gaming']
    },
    {
      name: 'Auriculares Sony WH-1000XM4',
      sku: 'SON-WH1000-001',
      description: 'Auriculares con cancelación de ruido',
      price: 349.99,
      stock: 12,
      minStock: 5,
      categoryId: categoriaMap['Audio']
    },
    {
      name: 'Webcam Logitech C920',
      sku: 'LOG-C920-001',
      description: 'Webcam HD para streaming',
      price: 79.99,
      stock: 30,
      minStock: 10,
      categoryId: categoriaMap['Accesorios']
    },
    {
      name: 'SSD Samsung 1TB',
      sku: 'SAM-SSD-1TB-001',
      description: 'Disco SSD de 1TB',
      price: 129.99,
      stock: 25,
      minStock: 8,
      categoryId: categoriaMap['Electrónicos']
    },
    {
      name: 'Mousepad Gaming XL',
      sku: 'GAM-PAD-XL-001',
      description: 'Mousepad gaming extra grande',
      price: 29.99,
      stock: 50,
      minStock: 15,
      categoryId: categoriaMap['Gaming']
    },
    {
      name: 'Hub USB-C 7 puertos',
      sku: 'HUB-USBC-7-001',
      description: 'Hub USB-C con 7 puertos',
      price: 59.99,
      stock: 18,
      minStock: 6,
      categoryId: categoriaMap['Accesorios']
    },
    {
      name: 'Altavoces Bluetooth JBL',
      sku: 'JBL-BT-001',
      description: 'Altavoces Bluetooth portátiles',
      price: 89.99,
      stock: 20,
      minStock: 7,
      categoryId: categoriaMap['Audio']
    },
    // Productos con stock crítico
    {
      name: 'Cable HDMI 4K Premium',
      sku: 'HDMI-4K-PREM-001',
      description: 'Cable HDMI 4K de alta calidad',
      price: 24.99,
      stock: 2, // Stock crítico
      minStock: 10,
      categoryId: categoriaMap['Accesorios']
    },
    {
      name: 'Cargador USB-C 65W',
      sku: 'CHAR-USBC-65W-001',
      description: 'Cargador rápido USB-C 65W',
      price: 39.99,
      stock: 0, // Sin stock
      minStock: 8,
      categoryId: categoriaMap['Accesorios']
    }
  ];

  for (const producto of productos) {
    await prisma.product.upsert({
      where: { sku: producto.sku },
      update: {},
      create: producto
    });
  }

  // Crear movimientos de stock de ejemplo
  const productosCreados = await prisma.product.findMany();
  
  // Generar movimientos de los últimos 6 meses
  const fechaInicio = new Date();
  fechaInicio.setMonth(fechaInicio.getMonth() - 6);

  const movimientos = [];
  
  for (let i = 0; i < 100; i++) {
    const producto = productosCreados[Math.floor(Math.random() * productosCreados.length)];
    const fechaMovimiento = new Date(fechaInicio.getTime() + Math.random() * (Date.now() - fechaInicio.getTime()));
    const esEntrada = Math.random() > 0.4; // 60% salidas, 40% entradas
    const cantidad = Math.floor(Math.random() * 10) + 1;

    movimientos.push({
      productId: producto.id,
      type: esEntrada ? 'IN' : 'OUT',
      quantity: cantidad,
      reason: esEntrada ? 'Reposición de stock' : 'Venta',
      createdAt: fechaMovimiento
    });
  }

  for (const movimiento of movimientos) {
    await prisma.stockMovement.create({
      data: movimiento
    });
  }

  console.log('✅ Datos de ejemplo agregados exitosamente');
  console.log(`📦 ${productos.length} productos creados`);
  console.log(`📊 ${movimientos.length} movimientos de stock creados`);
  console.log(`🏷️ ${categorias.length} categorías creadas`);
}

main()
  .catch((e) => {
    console.error('❌ Error al agregar datos de ejemplo:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
