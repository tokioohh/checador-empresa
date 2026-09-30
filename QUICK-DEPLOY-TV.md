# 🚀 Despliegue Rápido - Smart TV Webapp

## ✅ Build Completado

Tu webapp de TV ha sido compilada y optimizada exitosamente:

```
📦 Tamaño: 262 KB (optimizado)
🎯 Compatibilidad: ES2015+ (TVs 2016+)
📍 Ubicación: apps/tv-smarttv/dist/
```

---

## 🎬 Cómo Desplegar (3 opciones)

### ⭐ OPCIÓN 1: Servidor Web Local (RECOMENDADO)

**La forma más simple y universal:**

```bash
cd apps/tv-smarttv
./deploy.sh serve
```

Luego en tu Smart TV:
1. Abre el **navegador web** de tu TV
2. Navega a: **http://192.168.1.65:3000**
3. ¡Listo! La app carga en pantalla completa

**✅ Ventajas:**
- Compatible con el 99% de Smart TVs
- Sin instalación ni configuración compleja
- Actualización instantánea (rebuild + refresh)
- Funciona en Samsung, LG, Android TV, Fire TV, etc.

---

### 📱 OPCIÓN 2: App Nativa Samsung (Tizen)

Para instalar como app nativa en Samsung Smart TV:

```bash
cd apps/tv-smarttv
./deploy.sh tizen
```

**Requisitos:**
- Tizen Studio o tizen-cli
- Certificado de desarrollador Samsung
- TV en modo desarrollador

**Ver guía completa:** `apps/tv-smarttv/DEPLOYMENT.md`

---

### 📱 OPCIÓN 3: App Nativa LG (webOS)

Para instalar como app nativa en LG Smart TV:

```bash
cd apps/tv-smarttv
./deploy.sh webos
```

**Requisitos:**
- webOS TV CLI (ares-cli)
- TV en modo desarrollador

**Ver guía completa:** `apps/tv-smarttv/DEPLOYMENT.md`

---

## 💡 Recomendación

**Para la mayoría de los casos, usa la OPCIÓN 1 (Servidor Web Local):**

1. Es más simple y rápido
2. No requiere instalación en cada TV
3. Una sola actualización sirve para todas las TVs
4. Funciona en cualquier marca de TV
5. Ideal para uso empresarial interno

**Usa las opciones 2 o 3 solo si:**
- Necesitas publicar en las tiendas oficiales (Samsung/LG Store)
- Quieres que la app aparezca en el menú de apps de la TV
- No tienes un servidor siempre encendido

---

## 🎯 Quick Start Guide

```bash
# 1. Ve a la carpeta de la webapp
cd apps/tv-smarttv

# 2. Revisa tu configuración de red
./deploy.sh info

# 3. Inicia el servidor
./deploy.sh serve

# 4. En tu Smart TV, abre el navegador y ve a:
#    http://[TU_IP]:3000
```

---

## 📚 Documentación Adicional

- **README.md** - Resumen del proyecto y quick start
- **DEPLOYMENT.md** - Guía completa de despliegue (todas las opciones)
- **TEST-ON-TV.md** - Guía de testing en dispositivos reales

Toda la documentación está en: `apps/tv-smarttv/`

---

## 🔧 Configuración del Backend

Asegúrate de que tu backend esté corriendo:

```bash
# En otra terminal:
cd apps/backend
npm run dev
# Backend debe estar en puerto 4000
```

La webapp buscará automáticamente:
- WebSocket: `ws://[IP_BACKEND]:4000`
- API REST: `http://[IP_BACKEND]:4000/api/tv/`

---

## 🌐 Requisitos de Red

✅ Backend corriendo en puerto 4000  
✅ TV y servidor en la misma red local  
✅ Firewall permitiendo puerto 3000  
✅ Opcional: IP estática para el servidor

---

## ❓ Troubleshooting Rápido

**❌ TV no encuentra la app:**
```bash
# Verifica tu IP
./deploy.sh info

# Prueba desde tu PC primero
# Abre en navegador: http://localhost:3000
```

**❌ WebSocket no conecta:**
- Verifica que el backend esté corriendo
- Usa IP local (192.168.x.x) no localhost
- Revisa firewall de Windows

**❌ CORS errors:**
- El servidor ya tiene CORS habilitado con `--cors`
- Verifica en el backend Express: `app.use(cors())`

---

## 📊 Arquitectura del Sistema

```
┌─────────────────┐
│   Backend API   │ ← puerto 4000
│  (apps/backend) │
└────────┬────────┘
         │
    WebSocket + REST
         │
┌────────┴────────┐
│  TV Web Server  │ ← puerto 3000
│ (apps/tv-smarttv)│
└────────┬────────┘
         │
    HTTP Browser
         │
┌────────┴────────┐
│   Smart TV #1   │
│   Smart TV #2   │
│   Smart TV #N   │
└─────────────────┘
```

---

**🎉 ¡Todo listo para desplegar!**

Ejecuta `./deploy.sh serve` y comienza a usar tu webapp en cualquier Smart TV.
