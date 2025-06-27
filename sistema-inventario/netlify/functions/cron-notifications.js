// Función serverless para notificaciones automáticas en Netlify
exports.handler = async (event, context) => {
  // Verificar que sea una llamada autorizada
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = event.headers.authorization;
  
  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  try {
    // Llamar a la API interna de notificaciones
    const baseUrl = process.env.NEXTAUTH_URL || 'https://localhost:3000';
    const response = await fetch(`${baseUrl}/api/cron/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cronSecret}`
      }
    });

    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Notificaciones procesadas correctamente',
        data: result
      })
    };
  } catch (error) {
    console.error('Error en cron de notificaciones:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
