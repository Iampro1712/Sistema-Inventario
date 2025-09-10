# 📦 Sistema de Inventario

Un sistema completo de gestión de inventario desarrollado con Next.js, TypeScript y Tailwind CSS.

## 🚀 Despliegue Rápido

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/tu-usuario/sistema-inventario)

Para instrucciones detalladas de despliegue, consulta [DEPLOY_NETLIFY.md](./DEPLOY_NETLIFY.md)

## 🚀 Características

### ✅ Funcionalidades Implementadas

- **Dashboard Interactivo**: Resumen general con estadísticas en tiempo real
- **Gestión de Productos**: CRUD completo con control de stock
- **Categorías**: Organización visual de productos por categorías
- **Movimientos de Inventario**: Historial completo de entradas, salidas y ajustes
- **Sistema de Alertas**: Notificaciones automáticas por stock bajo y productos agotados
- **Reportes Avanzados**: Análisis y estadísticas detalladas
- **Gestión de Usuarios**: Control de acceso con diferentes roles
- **Configuración del Sistema**: Personalización completa
- **Tema Oscuro/Claro**: Toggle entre modos con persistencia
- **Diseño Responsive**: Optimizado para todos los dispositivos
- **Animaciones Fluidas**: Transiciones suaves y experiencia de usuario mejorada

### 🎨 Diseño y UX

- **Paleta de Colores Moderna**: Esquema de colores profesional y atractivo
- **Componentes Reutilizables**: Arquitectura modular y mantenible
- **Iconografía Consistente**: Iconos de Lucide React
- **Tipografía Optimizada**: Fuente Inter para mejor legibilidad
- **Scrollbars Personalizados**: Detalles de diseño cuidados

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 15.3.4 con TypeScript
- **Styling**: Tailwind CSS 4.0
- **Componentes**: Componentes UI personalizados con Radix UI
- **Iconos**: Lucide React
- **Temas**: next-themes para modo oscuro/claro
- **Base de Datos**: Prisma ORM con SQLite (configurado)
- **Animaciones**: CSS personalizado y Tailwind

## 🚀 Instalación y Uso

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar la base de datos**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**:
   ```
   http://localhost:3000
   ```

## 📱 Páginas Disponibles

- **/** - Dashboard principal con estadísticas
- **/productos** - Gestión completa de productos
- **/categorias** - Organización por categorías
- **/movimientos** - Historial de movimientos
- **/alertas** - Centro de notificaciones
- **/reportes** - Análisis y reportes
- **/usuarios** - Gestión de usuarios
- **/configuracion** - Configuración del sistema

## 🎯 Características Destacadas

### Dashboard Inteligente
- Estadísticas en tiempo real
- Gráficos interactivos
- Alertas prioritarias
- Movimientos recientes

### Gestión de Productos
- Tabla completa con filtros
- Estados de stock visuales
- Códigos SKU automáticos
- Categorización flexible

### Sistema de Alertas
- Notificaciones automáticas
- Diferentes tipos de alertas
- Estado de lectura
- Filtros avanzados

### Reportes Avanzados
- Múltiples tipos de reportes
- Gráficos y estadísticas
- Exportación de datos
- Análisis de tendencias

## 🎨 Personalización

El sistema incluye un sistema de temas completo:
- Modo claro/oscuro
- Colores personalizables
- Componentes adaptables
- Persistencia de preferencias

## 📋 Changelog

### Versión 2.0.0 - 9 de Septiembre de 2025

#### 🐛 Correcciones de Errores
- **TypeScript**: Corregidos todos los errores de compilación de TypeScript
- **API Keys**: Solucionado el tipo `expiresAt` de `undefined` a `null` para compatibilidad con el schema
- **Dashboard Stats**: Eliminado el include de `user` inexistente en el modelo StockMovement
- **Productos API**: Corregida la relación de `stockMovements` a `movements` según el schema de Prisma
- **Usuarios API**: Actualizado el permiso de `'users.update'` a `'users.edit'` para consistencia
- **Movimientos**: Simplificado el mapeo de usuarios para usar 'Sistema' como valor por defecto

#### 🔧 Mejoras Técnicas
- **Compilación**: El proyecto ahora compila sin errores con `npx tsc --noEmit`
- **Tipos**: Mejorada la consistencia de tipos en toda la aplicación
- **Base de Datos**: Alineadas las consultas Prisma con el schema definido
- **Permisos**: Estandarizado el sistema de permisos en las APIs

#### 📚 Documentación
- Agregado changelog para seguimiento de versiones
- Documentadas las correcciones realizadas

---

**Desarrollado con ❤️ usando Next.js y Tailwind CSS**
