import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyPassword } from '@/lib/password';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔐 Intento de login para:', email);
    
    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    
    if (!user.password) {
      console.log('❌ Usuario sin contraseña:', email);
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    
    if (!user.isActive) {
      console.log('❌ Usuario inactivo:', email);
      return NextResponse.json(
        { error: 'Usuario inactivo' },
        { status: 401 }
      );
    }
    
    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      console.log('❌ Contraseña incorrecta para:', email);
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    
    // Actualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });
    
    console.log('✅ Login exitoso para:', email);
    
    // Devolver usuario sin contraseña
    const { password: _, ...safeUser } = user;
    
    return NextResponse.json({
      user: {
        ...safeUser,
        lastLogin: safeUser.lastLogin?.toISOString() || null,
        createdAt: safeUser.createdAt.toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
