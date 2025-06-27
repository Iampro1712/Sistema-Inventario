const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMoreMovements() {
  console.log('📊 Agregando más movimientos para gráficos...');
  
  const productos = await prisma.product.findMany();
  
  if (productos.length === 0) {
    console.log('❌ No hay productos. Creando algunos primero...');
    return;
  }

  // Generar movimientos de los últimos 6 meses con más datos
  const movimientos = [];
  const fechaActual = new Date();
  
  // Para cada mes de los últimos 6 meses
  for (let mes = 0; mes < 6; mes++) {
    const fechaMes = new Date();
    fechaMes.setMonth(fechaActual.getMonth() - mes);
    
    // Generar varios movimientos por mes
    for (let i = 0; i < 15; i++) {
      const producto = productos[Math.floor(Math.random() * productos.length)];
      
      // Fecha aleatoria dentro del mes
      const fechaMovimiento = new Date(fechaMes.getFullYear(), fechaMes.getMonth(), Math.floor(Math.random() * 28) + 1);
      
      // 70% salidas (ventas), 30% entradas (compras)
      const esEntrada = Math.random() < 0.3;
      const cantidad = Math.floor(Math.random() * 8) + 1;

      movimientos.push({
        productId: producto.id,
        type: esEntrada ? 'IN' : 'OUT',
        quantity: cantidad,
        reason: esEntrada ? 'Reposición de stock' : 'Venta',
        createdAt: fechaMovimiento
      });
    }
  }

  console.log(`Creando ${movimientos.length} movimientos...`);

  for (const movimiento of movimientos) {
    await prisma.stockMovement.create({
      data: movimiento
    });
  }

  console.log('✅ Movimientos agregados exitosamente');
  
  // Verificar datos
  const totalMovimientos = await prisma.stockMovement.count();
  const ventasUltimoMes = await prisma.stockMovement.count({
    where: {
      type: 'OUT',
      createdAt: {
        gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
      }
    }
  });
  
  console.log(`📈 Total movimientos en BD: ${totalMovimientos}`);
  console.log(`🛒 Ventas último mes: ${ventasUltimoMes}`);
  
  await prisma.$disconnect();
}

addMoreMovements().catch(console.error);
