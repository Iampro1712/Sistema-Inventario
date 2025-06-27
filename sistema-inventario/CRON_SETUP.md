# 🕐 Configuración de Cron Jobs para Notificaciones Automáticas

Este documento explica cómo configurar las verificaciones automáticas de alertas de inventario y notificaciones.

## 📋 Funcionalidades Automáticas

### ✅ Verificaciones que se ejecutan automáticamente:
- **Alertas de Stock Bajo**: Productos con stock ≤ stock mínimo
- **Alertas de Sin Stock**: Productos con stock = 0
- **Limpieza de Notificaciones**: Elimina notificaciones antiguas (>30 días)

### 📧 Notificaciones Automáticas:
- **Nuevo Usuario**: Cuando se registra un usuario nuevo
- **Stock Bajo**: Notifica a MANAGER, ADMIN, CEO
- **Sin Stock**: Notifica a ADMIN, CEO (prioridad URGENT)
- **Movimientos**: Notifica movimientos importantes de inventario

## 🛠️ Configuración del Cron Job

### 1. Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```bash
# Secreto para autenticar cron jobs
CRON_SECRET=tu-secreto-super-seguro-aqui

# URL de tu aplicación
API_URL=http://localhost:3000  # Para desarrollo
# API_URL=https://tu-dominio.com  # Para producción
```

### 2. Configurar el Cron Job

#### Opción A: Usando el script incluido

```bash
# 1. Hacer el script ejecutable
chmod +x scripts/cron-notifications.sh

# 2. Editar crontab
crontab -e

# 3. Agregar una de estas líneas según tus necesidades:

# Verificar cada 30 minutos (recomendado)
*/30 * * * * API_URL=http://localhost:3000 CRON_SECRET=tu-secreto /ruta/completa/scripts/cron-notifications.sh

# Verificar cada hora
0 * * * * API_URL=http://localhost:3000 CRON_SECRET=tu-secreto /ruta/completa/scripts/cron-notifications.sh

# Solo en horario laboral (9 AM - 6 PM, lunes a viernes)
*/30 9-18 * * 1-5 API_URL=http://localhost:3000 CRON_SECRET=tu-secreto /ruta/completa/scripts/cron-notifications.sh
```

#### Opción B: Llamada directa con curl

```bash
# Agregar a crontab:
*/30 * * * * curl -X POST -H "Authorization: Bearer tu-secreto" http://localhost:3000/api/cron/notifications >> /var/log/cron-notifications.log 2>&1
```

### 3. Verificar que funciona

```bash
# Ejecutar manualmente para probar
./scripts/cron-notifications.sh

# Ver logs del cron
tail -f /var/log/sistema-inventario-cron.log

# Verificar estado del sistema
curl -X GET http://localhost:3000/api/cron/notifications
```

## 📊 Monitoreo

### Endpoints de Monitoreo:

- **GET** `/api/cron/notifications` - Estado del sistema de cron
- **POST** `/api/cron/notifications` - Ejecutar verificación manual
- **GET** `/api/alertas/check` - Estado de alertas de stock

### Logs:

Los logs se guardan en `/var/log/sistema-inventario-cron.log` por defecto.

## 🔧 Configuración Avanzada

### Frecuencias Recomendadas:

| Tipo de Negocio | Frecuencia | Cron Expression |
|------------------|------------|-----------------|
| **E-commerce Alto Volumen** | Cada 15 minutos | `*/15 * * * *` |
| **Retail Estándar** | Cada 30 minutos | `*/30 * * * *` |
| **Almacén/Distribución** | Cada hora | `0 * * * *` |
| **Oficina/Servicios** | Cada 2 horas | `0 */2 * * *` |

### Configuración por Entorno:

#### Desarrollo:
```bash
*/30 * * * * API_URL=http://localhost:3000 CRON_SECRET=dev-secret /path/to/script
```

#### Producción:
```bash
*/30 * * * * API_URL=https://inventario.tuempresa.com CRON_SECRET=prod-secret-super-seguro /opt/inventario/scripts/cron-notifications.sh
```

## 🚨 Solución de Problemas

### Error: "No autorizado"
- Verifica que `CRON_SECRET` esté configurado correctamente
- Asegúrate de que el header `Authorization: Bearer` sea correcto

### Error: "Connection refused"
- Verifica que la aplicación esté ejecutándose
- Confirma que la URL sea correcta

### No se ejecuta el cron:
```bash
# Verificar que cron esté ejecutándose
sudo systemctl status cron

# Ver logs del sistema cron
sudo tail -f /var/log/syslog | grep CRON

# Verificar sintaxis del crontab
crontab -l
```

### Permisos de archivos:
```bash
# Dar permisos al script
chmod +x scripts/cron-notifications.sh

# Crear directorio de logs si no existe
sudo mkdir -p /var/log
sudo touch /var/log/sistema-inventario-cron.log
sudo chown $USER:$USER /var/log/sistema-inventario-cron.log
```

## 📝 Notas Importantes

1. **Seguridad**: Cambia `CRON_SECRET` por un valor seguro y único
2. **Logs**: Revisa los logs regularmente para detectar problemas
3. **Recursos**: Las verificaciones consumen recursos de BD, ajusta la frecuencia según tu infraestructura
4. **Backup**: Haz backup de tu configuración de crontab: `crontab -l > crontab-backup.txt`

## 🎯 Resultado Esperado

Una vez configurado correctamente, el sistema:

- ✅ Verificará automáticamente el stock cada X minutos
- ✅ Enviará notificaciones por email cuando detecte problemas
- ✅ Mostrará alertas en el dashboard
- ✅ Limpiará notificaciones antiguas automáticamente
- ✅ Notificará cuando se registren nuevos usuarios
