import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-middleware';
import { notifyInventoryMovement, notifyLowStock, notifyStockOut } from '@/lib/notification-helpers';

export async function GET(request: NextRequest) {
  // Verificar permisos para ver movimientos
  const authResult = await requirePermission(request, 'movements.view');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    
    // Parámetros de búsqueda y filtros
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const productId = searchParams.get('productId') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    
    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    // Filtro por búsqueda (producto o razón)
    if (search) {
      where.OR = [
        {
          reason: {
            contains: search
          }
        },
        {
          product: {
            name: {
              contains: search
            }
          }
        },
        {
          product: {
            sku: {
              contains: search
            }
          }
        }
      ];
    }

    // Filtro por tipo
    if (type) {
      where.type = type;
    }

    // Filtro por producto
    if (productId) {
      where.productId = productId;
    }

    // Filtro por rango de fechas
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Agregar 23:59:59 al final del día
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    // Obtener movimientos con paginación
    const [movimientos, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: {
            include: {
              category: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.stockMovement.count({ where })
    ]);

    // Calcular información de paginación
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      movimientos,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    return NextResponse.json(
      { error: 'Error al obtener movimientos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Verificar permisos para crear movimientos
  const authResult = await requirePermission(request, 'movements.create');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const body = await request.json();
    const { type, quantity, reason, productId, reference, notes } = body;

    // Validar campos requeridos
    if (!type || !quantity || !reason || !productId) {
      return NextResponse.json(
        { error: 'Campos requeridos: type, quantity, reason, productId' },
        { status: 400 }
      );
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Validar cantidad
    const quantityNum = parseInt(quantity);
    if (quantityNum <= 0) {
      return NextResponse.json(
        { error: 'La cantidad debe ser mayor a 0' },
        { status: 400 }
      );
    }

    // Para movimientos de salida, verificar que hay suficiente stock
    if (type === 'OUT' && product.stock < quantityNum) {
      return NextResponse.json(
        { error: `Stock insuficiente. Stock actual: ${product.stock}` },
        { status: 400 }
      );
    }

    // Crear el movimiento
    const movimiento = await prisma.stockMovement.create({
      data: {
        type,
        quantity: quantityNum,
        reason,
        productId,
        reference: reference || null,
        notes: notes || null,
        createdBy: user.email
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });

    // Actualizar el stock del producto
    const newStock = type === 'IN' 
      ? product.stock + quantityNum 
      : type === 'OUT' 
        ? product.stock - quantityNum 
        : quantityNum; // Para ADJUSTMENT, establecer el stock exacto

    await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock }
    });

    // Enviar notificación de movimiento
    await notifyInventoryMovement(movimiento.id, user.id);

    // Verificar alertas de stock después del movimiento
    if (newStock <= 0) {
      await notifyStockOut(productId);
    } else if (newStock <= product.minStock) {
      await notifyLowStock(productId, newStock, product.minStock);
    }

    return NextResponse.json(movimiento, { status: 201 });
  } catch (error) {
    console.error('Error al crear movimiento:', error);
    return NextResponse.json(
      { error: 'Error al crear movimiento' },
      { status: 500 }
    );
  }
}
