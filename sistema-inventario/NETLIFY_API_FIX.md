# 🔧 Solución para API Routes en Netlify

## 🚨 Problema Identificado

Las API routes de Next.js no están funcionando en Netlify, devolviendo 404 para todas las rutas `/api/*`.

## 🔍 Diagnóstico

1. **Plugin instalado**: ✅ `@netlify/plugin-nextjs` está en package.json
2. **Configuración básica**: ✅ netlify.toml configurado
3. **Variables de entorno**: ⚠️ Necesitan verificación

## 🛠️ Soluciones a Probar

### **Opción 1: Verificar Variables de Entorno en Netlify**

Ve a tu sitio en Netlify → Site settings → Environment variables y verifica que estén todas:

```
DATABASE_URL=mysql://usuario:password@host:puerto/database?sslmode=require
NEXTAUTH_SECRET=tu-secreto-muy-seguro-aqui
NEXTAUTH_URL=https://demo-inventario.netlify.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password-de-gmail
EMAIL_FROM_NAME=Sistema de Inventario
EMAIL_FROM_ADDRESS=tu-email@gmail.com
CRON_SECRET=tu-secreto-para-cron-jobs
```

### **Opción 2: Forzar Redeploy**

1. Ve a Netlify Dashboard
2. Site settings → Build & deploy
3. Trigger deploy → Deploy site

### **Opción 3: Verificar Logs de Build**

1. Ve a Netlify Dashboard
2. Deploys → [último deploy]
3. Revisa los logs para errores

### **Opción 4: Configuración Alternativa**

Si las opciones anteriores no funcionan, actualiza `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[functions]
  external_node_modules = ["mysql2", "@prisma/client", "bcryptjs"]
  node_bundler = "esbuild"
```

## 🧪 Rutas de Prueba Creadas

Para verificar que las APIs funcionan:

- **Health Check**: `https://demo-inventario.netlify.app/api/health`
- **Test Simple**: `https://demo-inventario.netlify.app/api/test`

## 📝 API Key para Pruebas

Usa esta API key para probar endpoints protegidos:
```
sk_4feff2ac7d9b4046f1c51a9db861c50a2ac0a394e2699717fe29805523dc972f
```

## 🔄 Próximos Pasos

1. Verificar variables de entorno
2. Forzar redeploy
3. Probar rutas de health check
4. Si persiste el problema, considerar migrar a Vercel

## 📞 Contacto

Si el problema persiste después de estos pasos, el issue puede estar en:
- Configuración de la base de datos
- Limitaciones de Netlify con Next.js API routes
- Problemas de red/DNS

**Alternativa recomendada**: Desplegar en Vercel que tiene mejor soporte nativo para Next.js.
