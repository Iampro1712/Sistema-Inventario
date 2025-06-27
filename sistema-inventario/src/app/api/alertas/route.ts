import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-middleware';
export async function GET(request: NextRequest) {
  const authResult = await requirePermission(request, 'alerts.view');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);

    // Parámetros de filtros
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Construir filtros para Prisma
    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status === 'read' ? 'READ' : 'UNREAD';
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Obtener alertas con paginación
    const skip = (page - 1) * limit;
    const [alertas, total] = await Promise.all([
      prisma.alert.findMany({
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
      prisma.alert.count({ where })
    ]);

    // Calcular paginación
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Estadísticas
    const stats = {
      criticas: await prisma.alert.count({ where: { type: 'CRITICAL', status: 'UNREAD' } }),
      advertencias: await prisma.alert.count({ where: { type: 'WARNING', status: 'UNREAD' } }),
      informativas: await prisma.alert.count({ where: { type: 'INFO', status: 'UNREAD' } }),
      resueltas: await prisma.alert.count({ where: { status: 'READ' } })
    };

    // Formatear alertas para el frontend
    const alertasFormateadas = alertas.map(alert => ({
      id: alert.id,
      type: alert.type,
      title: alert.title,
      message: alert.message,
      status: alert.status,
      createdAt: alert.createdAt.toISOString(),
      readAt: alert.readAt?.toISOString(),
      product: alert.product ? {
        id: alert.product.id,
        name: alert.product.name,
        sku: alert.product.sku,
        category: alert.product.category ? {
          name: alert.product.category.name,
          color: alert.product.category.color || '#6B7280'
        } : undefined
      } : undefined
    }));

    return NextResponse.json({
      alertas: alertasFormateadas,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      stats
    });
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    return NextResponse.json(
      { error: 'Error al obtener alertas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requirePermission(request, 'alerts.manage');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { action, alertIds } = body;

    if (action === 'markAllRead') {
      // Marcar todas las alertas no leídas como leídas
      await prisma.alert.updateMany({
        where: {
          status: 'UNREAD'
        },
        data: {
          status: 'READ',
          readAt: new Date()
        }
      });

      return NextResponse.json({ message: 'Todas las alertas marcadas como leídas' });
    }

    if (action === 'markRead' && alertIds) {
      // Marcar alertas específicas como leídas
      await prisma.alert.updateMany({
        where: {
          id: { in: alertIds }
        },
        data: {
          status: 'READ',
          readAt: new Date()
        }
      });

      return NextResponse.json({ message: 'Alertas marcadas como leídas' });
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error al procesar alertas:', error);
    return NextResponse.json(
      { error: 'Error al procesar alertas' },
      { status: 500 }
    );
  }
}


