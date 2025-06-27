const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updatePasswords() {
  try {
    console.log('🔐 Actualizando contraseñas de usuarios...');
    
    // Hashear la contraseña por defecto
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Actualizar todos los usuarios sin contraseña
    const users = await prisma.user.findMany({
      where: {
        password: null
      }
    });
    
    console.log(`📋 Encontrados ${users.length} usuarios sin contraseña`);
    
    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      console.log(`✅ Contraseña actualizada para: ${user.name} (${user.email})`);
    }
    
    console.log('🎉 ¡Contraseñas actualizadas exitosamente!');
    console.log('📝 Contraseña por defecto para todos los usuarios: admin123');
    
  } catch (error) {
    console.error('❌ Error actualizando contraseñas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePasswords();
