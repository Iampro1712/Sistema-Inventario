import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireUserManagement } from '@/lib/auth-middleware';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Devolver usuario sin contraseña
    const { password, ...safeUser } = user;
    
    return NextResponse.json({
      ...safeUser,
      lastLogin: safeUser.lastLogin?.toISOString() || null,
      createdAt: safeUser.createdAt.toISOString()
    });
    
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
