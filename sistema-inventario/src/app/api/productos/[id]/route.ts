import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener producto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const producto = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(producto);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar producto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      nombre,
      descripcion,
      sku,
      precio,
      costo,
      stock,
      stockMinimo,
      categoriaId,
    } = body;

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el SKU no esté en uso por otro producto
    if (sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku },
      });

      if (existingSku) {
        return NextResponse.json(
          { error: 'El SKU ya existe' },
          { status: 400 }
        );
      }
    }

    // Actualizar el producto
    const producto = await prisma.product.update({
      where: { id },
      data: {
        name: nombre,
        description: descripcion,
        sku,
        price: parseFloat(precio),
        cost: parseFloat(costo),
        stock: parseInt(stock),
        minStock: parseInt(stockMinimo),
        categoryId: categoriaId || null,
      },
      include: {
        category: true,
      },
    });

    // Si cambió el stock, crear movimiento
    if (parseInt(stock) !== existingProduct.stock) {
      const diferencia = parseInt(stock) - existingProduct.stock;
      await prisma.stockMovement.create({
        data: {
          type: diferencia > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(diferencia),
          reason: 'Ajuste de inventario',
          productId: producto.id,
          createdBy: 'admin@sistema.com', // Por ahora usuario fijo
        },
      });
    }

    return NextResponse.json(producto);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar movimientos relacionados primero
    await prisma.stockMovement.deleteMany({
      where: { productId: id },
    });

    // Eliminar alertas relacionadas
    await prisma.alert.deleteMany({
      where: { productId: id },
    });

    // Eliminar el producto
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    );
  }
}
