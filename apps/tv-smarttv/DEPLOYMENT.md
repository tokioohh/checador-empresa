# Guía de Empaquetado para Smart TV

Build completado exitosamente: **262KB** optimizado para máxima compatibilidad.

## 📦 Build Universal (Ya Completado)

El build en `dist/` está optimizado para:
- ✅ ES2015+ (compatible con TVs desde 2016+)
- ✅ Code splitting inteligente
- ✅ Minificación agresiva
- ✅ Sin console.logs en producción
- ✅ Rutas relativas para portabilidad

---

## 🚀 Métodos de Despliegue

### **Opción 1: Servidor Web Local (Recomendado - Universal)**

**La forma más simple y compatible con TODAS las Smart TVs:**

```bash
# Método A: Con el servidor preview de Vite
npm run preview
# Accede desde la TV: http://TU_IP:4173

# Método B: Con un servidor HTTP simple
npx serve dist -l 3000
# Accede desde la TV: http://TU_IP:3000

# Método C: Con Python (si tienes Python instalado)
cd dist && python -m http.server 8080
# Accede desde la TV: http://TU_IP:8080
```

**Pros:**
- ✅ Compatible con el 99% de Smart TVs (cualquier navegador web)
- ✅ No requiere certificados ni registros
- ✅ Actualización instantánea (rebuild + refresh)
- ✅ Funciona en Samsung, LG, Android TV, Fire TV, etc.
- ✅ Ideal para desarrollo y producción en red local

**Uso en TV:**
1. Abre el navegador web de tu Smart TV
2. Navega a: `http://[IP_DE_TU_PC]:3000`
3. ¡Listo! La app carga en pantalla completa

---

### **Opción 2: Samsung Tizen (App Nativa)**

Para instalar como app nativa en Samsung Smart TV:

#### Requisitos:
```bash
# Instalar Tizen Studio CLI
# Descarga desde: https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk.html

# O usar el paquete tizen-cli (más ligero):
npm install -g tizen-cli
```

#### Preparación:
```bash
# 1. Habilitar modo desarrollador en tu Samsung TV:
#    - Abre Smart Hub > Apps
#    - Presiona: 1-2-3-4-5 (aparece popup de dev mode)
#    - Ingresa la IP de tu PC

# 2. Conectar con la TV
tizen connect [IP_DE_TU_TV]
# Ejemplo: tizen connect 192.168.1.100

# 3. Verificar conexión
tizen list devices
```

#### Build y Deploy:
```bash
# Empaquetar la aplicación
cd dist
tizen package -t wgt -s [TU_CERTIFICADO] -- .

# O usar nuestro script automatizado:
npm run package:tizen

# Instalar en la TV
tizen install -n checador.wgt -t [DEVICE_ID]

# Ejecutar
tizen run -p abcdefghij.checador -t [DEVICE_ID]
```

**Crear certificado (primera vez):**
```bash
tizen certificate -a MyCompany -p 1234 -c [PAÍS] -st [ESTADO] -ct [CIUDAD] -o [ORGANIZACIÓN] -n [NOMBRE]
tizen security-profiles add -n MyProfile -a [RUTA_A_AUTHOR.p12] -pw 1234
```

---

### **Opción 3: LG webOS (App Nativa)**

Para instalar como app nativa en LG Smart TV:

#### Requisitos:
```bash
# Instalar webOS TV CLI
npm install -g @webosose/ares-cli
```

#### Preparación:
```bash
# 1. Habilitar modo desarrollador en tu LG TV:
#    - Presiona el botón de inicio
#    - Busca "Developer Mode"
#    - Activa y reinicia la TV
#    - Anota la IP y habilita "Key Server"

# 2. Configurar dispositivo
ares-setup-device
# Sigue el wizard para agregar tu TV

# 3. Verificar conexión
ares-device-info -d [NOMBRE_DEL_DEVICE]
```

#### Build y Deploy:
```bash
# Empaquetar la aplicación
ares-package dist -o ./

# Instalar en la TV
ares-install com.tuempresa.checador_1.0.0_all.ipk -d [NOMBRE_DEL_DEVICE]

# Ejecutar
ares-launch com.tuempresa.checador -d [NOMBRE_DEL_DEVICE]

# Cerrar
ares-close com.tuempresa.checador -d [NOMBRE_DEL_DEVICE]
```

**Script automatizado:**
```bash
npm run build:webos
```

---

### **Opción 4: Android TV / Fire TV**

Para Android TV y Amazon Fire TV:

#### Método A: APK con WebView (No recomendado para este caso)
Para convertir a APK, considera usar servicios como:
- **PWA Builder**: https://www.pwabuilder.com/
- **Bubblewrap**: https://github.com/GoogleChromeLabs/bubblewrap

#### Método B: Navegador Web (Recomendado)
```bash
# Simplemente carga la URL en el navegador de la TV
http://[IP_DE_TU_PC]:3000

# O crea un marcador/favorito en el navegador
# Nombre: Checador Empresa
# URL: http://192.168.1.X:3000
```

---

## 🎯 **Recomendación por Escenario**

### Para Desarrollo y Testing:
```bash
npm run preview
# Accede desde http://[TU_IP]:4173
```
- Rápido y sin complicaciones
- Actualización instantánea
- Funciona en todas las TVs

### Para Producción Empresarial (Red Local):
```bash
npx serve dist -l 80 --cors
# Opcional: Configura como servicio del sistema
```
- Deploy permanente
- Acceso simple vía IP
- Sin instalación en cada TV
- Actualización centralizada

### Para Distribución en Tiendas:
- **Samsung Tizen Store**: Usa método Tizen
- **LG Content Store**: Usa método webOS
- **Google Play Store**: Crea APK con PWA Builder

---

## 🔧 Scripts Disponibles

```json
{
  "dev": "npm run dev",              // Desarrollo
  "build": "npm run build",          // Build de producción
  "preview": "npm run preview",      // Preview local
  "build:tizen": "...",              // Build + package Tizen
  "build:webos": "...",              // Build + package webOS
}
```

---

## 📋 Checklist de Configuración

### Antes del Deploy:

- [ ] Actualiza `API_URL` en variables de entorno
- [ ] Verifica permisos de red en `config.xml` (Tizen)
- [ ] Verifica permisos en `appinfo.json` (webOS)
- [ ] Actualiza iconos (icon.png, icon-large.png)
- [ ] Prueba en al menos 2 plataformas diferentes
- [ ] Verifica WebSocket connection
- [ ] Testea con diferentes resoluciones (720p, 1080p, 4K)

### Problemas Comunes:

**❌ CORS errors:**
```bash
# Solución: Agrega CORS en tu backend Express
app.use(cors({ origin: '*' }))
```

**❌ WebSocket no conecta:**
- Verifica que la TV y el servidor estén en la misma red
- Usa IP local (192.168.x.x) en lugar de localhost
- Verifica firewall de Windows

**❌ TV no encuentra la app:**
- Verifica que estés en la misma red WiFi/LAN
- Intenta con http:// (no https://)
- Desactiva temporalmente el firewall para probar

---

## 🌐 Configuración de Red Recomendada

```
┌─────────────┐
│   Router    │
│ 192.168.1.1 │
└──────┬──────┘
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
   ┌───▼────┐      ┌────▼────┐      ┌────▼────┐
   │   PC   │      │ Smart TV│      │ Smart TV│
   │Backend │      │   #1    │      │   #2    │
   │ .1.100 │      │  .1.101 │      │  .1.102 │
   └────────┘      └─────────┘      └─────────┘
```

**IP Estática Recomendada:**
- Asigna IP fija a tu servidor en el router
- Las TVs pueden usar DHCP o IP fija
- Documenta las IPs asignadas

---

## 📈 Optimizaciones Aplicadas

- ✅ **Target ES2015**: Compatible con navegadores antiguos
- ✅ **Code Splitting**: React vendor separado (3.94 KB)
- ✅ **QRCode chunk**: Lazy loading (24.40 KB)
- ✅ **Minificación Terser**: Sin console.logs
- ✅ **Rutas Relativas**: Funciona en cualquier contexto
- ✅ **Gzip optimizado**: 69 KB comprimido total

---

## 🎨 Personalización de Iconos

```bash
# Ubicaciones de iconos:
public/icon.png              # 192x192 - Icono principal
public/icon-large.png        # 512x512 - Icono grande
public/icon-192.png          # 192x192 - PWA
public/icon-512.png          # 512x512 - PWA

# Genera todos los tamaños con:
# https://realfavicongenerator.net/
```

---

## 📞 Soporte y Recursos

- **Samsung Tizen**: https://developer.samsung.com/smarttv
- **LG webOS**: https://webostv.developer.lge.com/
- **Android TV**: https://developer.android.com/tv
- **Fire TV**: https://developer.amazon.com/fire-tv

---

**Última actualización**: Septiembre 2026
**Versión de la app**: 1.0.0
**Tamaño del build**: 262 KB
