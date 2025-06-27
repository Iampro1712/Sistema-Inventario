import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

// GET - Obtener configuración SMTP
export async function GET(request: NextRequest) {
  const authResult = await requirePermission(request, 'notifications.manage');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const config = await prisma.emailConfig.findFirst({
      where: { isActive: true },
    });

    if (!config) {
      return NextResponse.json({
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPass: '',
        smtpSecure: false,
        fromName: 'Sistema de Inventario',
        fromEmail: '',
        isTestMode: true,
      });
    }

    // No devolver la contraseña por seguridad
    return NextResponse.json({
      smtpHost: config.smtpHost || '',
      smtpPort: config.smtpPort || 587,
      smtpUser: config.smtpUser || '',
      smtpPass: config.smtpPass ? '••••••••' : '',
      smtpSecure: config.smtpSecure || false,
      fromName: config.fromName || 'Sistema de Inventario',
      fromEmail: config.fromEmail || '',
      isTestMode: config.isTestMode,
    });
  } catch (error) {
    console.error('Error obteniendo configuración SMTP:', error);
    return NextResponse.json(
      { error: 'Error al obtener configuración SMTP' },
      { status: 500 }
    );
  }
}

// POST - Guardar configuración SMTP
export async function POST(request: NextRequest) {
  const authResult = await requirePermission(request, 'notifications.manage');
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const {
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smtpSecure,
      fromName,
      fromEmail,
      isTestMode,
    } = body;

    // Validar campos requeridos si no está en modo de prueba
    if (!isTestMode) {
      if (!smtpHost || !smtpUser || !smtpPass) {
        return NextResponse.json(
          { error: 'Campos requeridos: smtpHost, smtpUser, smtpPass' },
          { status: 400 }
        );
      }
    }

    // Obtener configuración existente
    const existingConfig = await prisma.emailConfig.findFirst({
      where: { isActive: true },
    });

    const configData = {
      smtpHost: isTestMode ? null : smtpHost,
      smtpPort: isTestMode ? null : (smtpPort || 587),
      smtpUser: isTestMode ? null : smtpUser,
      smtpPass: isTestMode ? null : (smtpPass === '••••••••' ? existingConfig?.smtpPass : smtpPass),
      smtpSecure: isTestMode ? false : (smtpSecure || false),
      fromName: fromName || 'Sistema de Inventario',
      fromEmail: isTestMode ? null : (fromEmail || smtpUser),
      isTestMode,
      isVerified: false,
      lastTested: null,
    };

    let config;
    if (existingConfig) {
      config = await prisma.emailConfig.update({
        where: { id: existingConfig.id },
        data: configData,
      });
    } else {
      config = await prisma.emailConfig.create({
        data: {
          id: 'default',
          ...configData,
        },
      });
    }

    // Reiniciar el servicio de email para que tome la nueva configuración
    const { emailService } = await import('@/lib/email-service');
    await emailService.resetConfiguration();

    return NextResponse.json({
      message: 'Configuración SMTP guardada exitosamente',
      config: {
        ...config,
        smtpPass: config.smtpPass ? '••••••••' : null,
      },
    });
  } catch (error) {
    console.error('Error guardando configuración SMTP:', error);
    return NextResponse.json(
      { error: 'Error al guardar configuración SMTP' },
      { status: 500 }
    );
  }
}
