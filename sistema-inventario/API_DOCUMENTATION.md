# 🔐 API Documentation - Sistema de Inventario

## 🚀 Autenticación

La API soporta dos métodos de autenticación:

### 1. **API Keys** (Recomendado para integraciones)
```bash
# Usando header X-API-Key
curl -H "X-API-Key: sk_your_api_key_here" http://localhost:3000/api/productos

# Usando header Authorization
curl -H "Authorization: Bearer sk_your_api_key_here" http://localhost:3000/api/productos
```

### 2. **Autenticación de Usuario** (Para aplicación web)
Usando cookies de sesión del navegador.

## 🔑 Gestión de API Keys

### Crear API Key
```bash
POST /api/api-keys
Content-Type: application/json

{
  "name": "Mi Aplicación",
  "permissions": ["products.read", "products.write"],
  "expiresAt": "2024-12-31T23:59:59Z" // Opcional
}
```

### Listar API Keys
```bash
GET /api/api-keys
```

### Eliminar API Key
```bash
DELETE /api/api-keys?id=api_key_id
```

## 📋 Permisos Disponibles

| Permiso | Descripción |
|---------|-------------|
| `products.read` | Leer productos |
| `products.write` | Crear/editar productos |
| `products.delete` | Eliminar productos |
| `users.read` | Leer usuarios |
| `users.write` | Crear/editar usuarios |
| `users.delete` | Eliminar usuarios |
| `movements.read` | Leer movimientos |
| `movements.write` | Crear movimientos |
| `reports.read` | Acceso a reportes |
| `settings.read` | Leer configuración |
| `settings.write` | Modificar configuración |
| `notifications.read` | Leer notificaciones |
| `notifications.write` | Crear notificaciones |
| `*` | Acceso completo (Administrador) |

## 📦 Endpoints de Productos

### Obtener Productos
```bash
GET /api/productos
X-API-Key: sk_your_api_key_here

# Respuesta
[
  {
    "id": "product_id",
    "name": "Producto 1",
    "sku": "SKU001",
    "price": 100.00,
    "stock": 50,
    "minStock": 10,
    "category": {
      "id": "cat_id",
      "name": "Categoría"
    }
  }
]
```

### Crear Producto
```bash
POST /api/productos
X-API-Key: sk_your_api_key_here
Content-Type: application/json

{
  "name": "Nuevo Producto",
  "sku": "SKU002",
  "price": 150.00,
  "cost": 100.00,
  "stock": 25,
  "minStock": 5,
  "categoryId": "category_id"
}
```

## 👥 Endpoints de Usuarios

### Obtener Usuarios
```bash
GET /api/usuarios
X-API-Key: sk_your_api_key_here
```

### Crear Usuario
```bash
POST /api/usuarios
X-API-Key: sk_your_api_key_here
Content-Type: application/json

{
  "name": "Nuevo Usuario",
  "email": "usuario@empresa.com",
  "role": "VENDEDOR",
  "phone": "+34 123 456 789",
  "department": "Ventas",
  "password": "password123"
}
```

## 📊 Endpoints de Movimientos

### Obtener Movimientos
```bash
GET /api/movimientos
X-API-Key: sk_your_api_key_here
```

### Crear Movimiento
```bash
POST /api/movimientos
X-API-Key: sk_your_api_key_here
Content-Type: application/json

{
  "productId": "product_id",
  "type": "IN", // IN, OUT, ADJUSTMENT
  "quantity": 10,
  "reason": "Compra",
  "reference": "FAC-001"
}
```

## 🔔 Endpoints de Notificaciones

### Obtener Notificaciones
```bash
GET /api/notifications?limit=10
X-API-Key: sk_your_api_key_here
```

### Crear Notificación
```bash
POST /api/notifications
X-API-Key: sk_your_api_key_here
Content-Type: application/json

{
  "title": "Notificación de Prueba",
  "message": "Mensaje de la notificación",
  "type": "INFO",
  "priority": "NORMAL",
  "userIds": ["user_id_1", "user_id_2"]
}
```

## 📈 Endpoints de Reportes

### Obtener Estadísticas del Dashboard
```bash
GET /api/dashboard/stats
X-API-Key: sk_your_api_key_here
```

### Obtener Reportes
```bash
GET /api/reportes?periodo=6m
X-API-Key: sk_your_api_key_here
```

## ⚠️ Códigos de Error

| Código | Descripción |
|--------|-------------|
| `401` | API Key faltante o inválida |
| `403` | Permisos insuficientes |
| `404` | Recurso no encontrado |
| `422` | Datos de entrada inválidos |
| `500` | Error interno del servidor |

## 🛡️ Seguridad

### Mejores Prácticas:
1. **Nunca expongas tu API Key** en código cliente
2. **Usa HTTPS** en producción
3. **Rota las API Keys** regularmente
4. **Asigna permisos mínimos** necesarios
5. **Monitorea el uso** de las API Keys

### Ejemplo de Uso Seguro:
```javascript
// ❌ MAL - No hagas esto en frontend
const apiKey = 'sk_your_api_key_here';

// ✅ BIEN - Usa variables de entorno en backend
const apiKey = process.env.API_KEY;
```

## 🚀 Ejemplos de Integración

### JavaScript/Node.js
```javascript
const API_KEY = process.env.API_KEY;
const BASE_URL = 'http://localhost:3000/api';

async function getProducts() {
  const response = await fetch(`${BASE_URL}/productos`, {
    headers: {
      'X-API-Key': API_KEY
    }
  });
  return response.json();
}
```

### Python
```python
import requests
import os

API_KEY = os.getenv('API_KEY')
BASE_URL = 'http://localhost:3000/api'

def get_products():
    headers = {'X-API-Key': API_KEY}
    response = requests.get(f'{BASE_URL}/productos', headers=headers)
    return response.json()
```

### cURL
```bash
#!/bin/bash
API_KEY="sk_your_api_key_here"
BASE_URL="http://localhost:3000/api"

# Obtener productos
curl -H "X-API-Key: $API_KEY" "$BASE_URL/productos"
```

## 📞 Soporte

Para soporte técnico o preguntas sobre la API:
- 📧 Email: soporte@tuempresa.com
- 📚 Documentación: http://localhost:3000/docs
- 🐛 Reportar bugs: GitHub Issues
