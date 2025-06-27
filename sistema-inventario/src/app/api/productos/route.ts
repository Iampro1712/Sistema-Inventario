import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-middleware';
import { requireApiKeyOrAuth, getAuthInfo } from '@/lib/api-key-middleware';
import { notifyNewProduct, notifyLowStock, notifyStockOut } from '@/lib/notification-helpers';

// GET - Obtener todos los productos
export async function GET(request: NextRequest) {
  // Verificar permisos para ver productos
  const authResult = await requirePermission(request, 'products.view');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const productos = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
  // Verificar permisos para crear productos
  const authResult = await requirePermission(request, 'products.create');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
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

    // Validaciones básicas
    if (!nombre || !sku || !precio || !costo || stock === undefined) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el SKU no exista
    const existingSku = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingSku) {
      return NextResponse.json(
        { error: 'El SKU ya existe' },
        { status: 400 }
      );
    }

    // Crear el producto
    const producto = await prisma.product.create({
      data: {
        name: nombre,
        description: descripcion,
        sku,
        price: parseFloat(precio),
        cost: parseFloat(costo),
        stock: parseInt(stock),
        minStock: parseInt(stockMinimo) || 5,
        categoryId: categoriaId || null,
      },
      include: {
        category: true,
      },
    });

    // Crear movimiento de inventario inicial
    await prisma.stockMovement.create({
      data: {
        type: 'IN',
        quantity: parseInt(stock),
        reason: 'Stock inicial',
        productId: producto.id,
        createdBy: user.email,
      },
    });

    // Enviar notificación de nuevo producto
    await notifyNewProduct(producto.id, user.id);

    // Verificar alertas de stock
    const stockNum = parseInt(stock);
    if (stockNum <= 0) {
      await notifyStockOut(producto.id);
    } else if (stockNum <= parseInt(stockMinimo)) {
      await notifyLowStock(producto.id, stockNum, parseInt(stockMinimo));
    }

    return NextResponse.json(producto, { status: 201 });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    );
  }
}
