# 📺 Smart TV Webapp - Checador Empresa

Aplicación de registro de asistencia optimizada para Smart TVs con soporte para múltiples plataformas.

## 🚀 Quick Start

```bash
# Método más simple y recomendado:
./deploy.sh serve

# Luego en tu Smart TV, abre el navegador y navega a:
# http://192.168.1.65:3000
```

## 📦 Build Status

✅ **Build completado y optimizado**
- **Tamaño**: 262 KB (optimizado con gzip)
- **Compatibilidad**: ES2015+ (TVs desde 2016+)
- **Target**: Universal - funciona en cualquier Smart TV con navegador

## 🎯 Métodos de Despliegue

### 1️⃣ Servidor Web Local (Recomendado - Universal)
```bash
./deploy.sh serve
```
✅ Compatible con **TODAS** las Smart TVs  
✅ Sin instalación requerida  
✅ Actualización instantánea

### 2️⃣ Samsung Tizen (App Nativa)
```bash
./deploy.sh tizen
```
📱 Genera paquete `.wgt` para Samsung Smart TV

### 3️⃣ LG webOS (App Nativa)
```bash
./deploy.sh webos
```
📱 Genera paquete `.ipk` para LG Smart TV

## 📖 Documentación Completa

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía completa de despliegue, troubleshooting y configuración avanzada
- **[TEST-ON-TV.md](../../TEST-ON-TV.md)** - Guía de testing en dispositivos reales

## 🛠️ Desarrollo

```bash
# Desarrollo con hot reload
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Servidor de producción
npm run serve
```

## ✨ Características

- ✅ Código QR en tiempo real para registro de asistencia
- ✅ Ticker de avisos empresariales con animación
- ✅ Reproductor multimedia (imágenes/videos)
- ✅ Notificaciones en tiempo real (WebSocket)
- ✅ Optimizado para pantallas 1080p y 4K
- ✅ Fuentes grandes para legibilidad a distancia
- ✅ Modo pantalla completa landscape

## 🔧 Configuración del Backend

La app se conecta al backend mediante WebSocket:

```env
# Por defecto busca en:
ws://[IP_DEL_BACKEND]:4000
```

**Endpoints utilizados:**
- `GET /api/tv/qr` - Token QR
- `GET /api/tv/media` - Contenido multimedia
- `GET /api/tv/avisos` - Avisos activos
- `WS /api/tv/ws` - Eventos en tiempo real

## 🌐 Configuración de Red

**Requisitos:**
- Backend corriendo en la red local
- TV y servidor en la misma red
- Firewall permitiendo puerto 3000

**Para obtener tu IP local:**
```bash
./deploy.sh info
```

## 📱 Plataformas Soportadas

- ✅ Samsung Smart TV (Tizen 2016+)
- ✅ LG Smart TV (webOS 3.0+)
- ✅ Android TV
- ✅ Amazon Fire TV
- ✅ Cualquier TV con navegador web moderno

## 🎨 Scripts NPM Disponibles

```bash
npm run dev          # Servidor desarrollo (puerto 3000)
npm run build        # Build producción optimizado
npm run preview      # Preview del build (puerto 4173)
npm run serve        # Servidor de producción con CORS
npm run build:tizen  # Build + package para Tizen
npm run build:webos  # Build + package para webOS
npm run info         # Información del proyecto
```

## 🐛 Troubleshooting

**WebSocket no conecta:**
- Verifica que el backend esté corriendo
- Asegúrate de estar en la misma red
- Revisa el firewall de Windows

**La TV no carga la app:**
- Usa `http://` (no `https://`)
- Verifica la IP con `./deploy.sh info`
- Intenta desde el navegador de la TV primero

**Consulta [DEPLOYMENT.md](./DEPLOYMENT.md) para más soluciones.**

---

**Última actualización**: Septiembre 2026  
**Versión**: 1.0.0  
**Build size**: 262 KB
