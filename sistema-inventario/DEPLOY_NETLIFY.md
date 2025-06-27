# 🚀 Guía de Despliegue en Netlify

## 📋 Requisitos Previos

1. **Base de datos MySQL**: Necesitas una base de datos MySQL en la nube (recomendado: PlanetScale, Aiven, o Railway)
2. **Cuenta de Gmail**: Para el servicio SMTP de notificaciones
3. **Cuenta de Netlify**: Para el hosting

## 🔧 Configuración en Netlify

### 1. Conectar Repositorio
- Ve a [Netlify](https://netlify.com)
- Haz clic en "New site from Git"
- Conecta tu repositorio de GitHub/GitLab

### 2. Configuración de Build
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: `18`

### 3. Variables de Entorno
En la sección "Environment variables" de tu sitio en Netlify, agrega:

```
DATABASE_URL=mysql://usuario:password@host:puerto/database?sslmode=require
NEXTAUTH_SECRET=tu-secreto-muy-seguro-aqui
NEXTAUTH_URL=https://tu-sitio.netlify.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password-de-gmail
EMAIL_FROM_NAME=Sistema de Inventario
EMAIL_FROM_ADDRESS=tu-email@gmail.com
CRON_SECRET=tu-secreto-para-cron-jobs
```

### 4. Configurar App Password de Gmail
1. Ve a tu cuenta de Google
2. Activa la verificación en 2 pasos
3. Ve a "Contraseñas de aplicaciones"
4. Genera una nueva contraseña para "Correo"
5. Usa esa contraseña en `SMTP_PASS`

## 🗄️ Base de Datos

### Opción 1: Aiven (Recomendado)
1. Crea cuenta en [Aiven](https://aiven.io)
2. Crea un servicio MySQL
3. Copia la URL de conexión
4. Ejecuta las migraciones de Prisma

### Opción 2: PlanetScale
1. Crea cuenta en [PlanetScale](https://planetscale.com)
2. Crea una base de datos
3. Obtén la URL de conexión
4. Configura las migraciones

## 🔄 Migraciones y Seed

Después del primer despliegue, ejecuta:

```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma db push

# Poblar datos iniciales
npx prisma db seed
```

## 🎯 Funciones Serverless

Las API routes de Next.js se convertirán automáticamente en funciones serverless de Netlify.

## 📧 Configuración de Notificaciones

Para que funcionen las notificaciones por email:
1. Configura correctamente las variables SMTP
2. Las notificaciones automáticas funcionarán via webhooks
3. Los cron jobs se pueden configurar con Netlify Functions

## 🔐 Seguridad

- Cambia `NEXTAUTH_SECRET` por un valor único y seguro
- Usa `CRON_SECRET` para proteger los endpoints de cron
- Configura correctamente las variables de base de datos

## 🚨 Troubleshooting

### Error de Base de Datos
- Verifica que la URL de conexión sea correcta
- Asegúrate de que la base de datos permita conexiones externas

### Error de Build
- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs de build en Netlify

### Error de SMTP
- Verifica que el App Password de Gmail sea correcto
- Asegúrate de que la verificación en 2 pasos esté activada
