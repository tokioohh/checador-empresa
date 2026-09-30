# 🧪 Guía de Testing - TV Smart App

## Pre-requisitos

- ✅ Backend corriendo en `http://localhost:4000`
- ✅ Node.js instalado
- ✅ Dependencias instaladas (`npm install`)

---

## Método 1: Testing en Desarrollo (Recomendado)

### Paso 1: Iniciar backend
```bash
# Terminal 1
cd apps/backend
npm run dev
```

Verificar: `http://localhost:4000` debe responder

### Paso 2: Iniciar TV app
```bash
# Terminal 2
cd apps/tv-smarttv
npm run dev
```

### Paso 3: Abrir navegador

**URL:** `http://localhost:3000`

**Configurar resolución TV:**
1. F12 (DevTools)
2. Ctrl+Shift+M (Toggle device toolbar)
3. Seleccionar "Responsive"
4. Cambiar dimensiones: **1920 x 1080**
5. Zoom: 100%

---

## Método 2: Testing del Build

### Opción A: Comando manual
```bash
cd apps/tv-smarttv
npm run build
npm run preview
```

### Opción B: Script automático (Windows)
```bash
cd apps/tv-smarttv
test-build.bat
```

Verificar: `http://localhost:4173`

---

## ✅ Checklist de Funcionalidades

### 1. Layout General
- [ ] Ticker de avisos en parte superior (80px altura)
- [ ] Contenido multimedia a la izquierda (ocupa la mayoría)
- [ ] Panel QR a la derecha (360px ancho)
- [ ] Card informativo "¿Cómo funciona?" debajo del QR
- [ ] Sin scrollbars
- [ ] Fullscreen (sin espacios blancos)

### 2. Código QR
- [ ] QR se muestra (280x280px)
- [ ] Tiene borde de 3px
- [ ] Barra de progreso animada debajo
- [ ] Actualiza automáticamente cada 5 segundos
- [ ] Texto "Escanea para registrar" (22px)
- [ ] Texto "Usa tu huella digital" (18px)

**Test manual:**
1. Copiar URL del QR de DevTools Network
2. Abrir en móvil
3. Verificar que abre la app móvil correctamente

### 3. Avisos (Ticker)
- [ ] Muestra avisos si hay activos en BD
- [ ] Animación scroll horizontal continua
- [ ] Icono de campana (24px) a la izquierda
- [ ] Label "AVISOS" en mayúsculas
- [ ] Colores según tipo (rojo/amarillo/verde/negro)
- [ ] Separadores bullet (•) entre avisos
- [ ] Scroll suave sin saltos

**Test manual:**
```bash
# En backend, crear aviso de prueba vía admin panel
# o directamente en BD
```

### 4. Multimedia (Carrusel)
- [ ] Muestra imágenes/videos si hay contenido activo
- [ ] Transición fade entre slides (400ms)
- [ ] Barra de progreso en parte inferior
- [ ] Dots indicadores (8px inactivos, 20px activo)
- [ ] Videos se reproducen automáticamente
- [ ] Duración respeta configuración de BD
- [ ] Default 8 segundos para imágenes

**Test con contenido vacío:**
- [ ] Muestra icono placeholder (80px)
- [ ] Texto "Sin contenido multimedia"
- [ ] Sugiere agregar desde admin panel

### 5. Welcome Overlay (Eventos)
- [ ] Aparece al registrar asistencia exitosa
- [ ] Color verde para éxito
- [ ] Color rojo para error
- [ ] Icono checkmark (40px) para éxito
- [ ] Icono X para error
- [ ] Nombre del empleado (28px)
- [ ] Puesto + tipo (20px)
- [ ] Duración: 6 segundos
- [ ] Animación slide-up desde abajo
- [ ] Se posiciona centrado inferior

**Test manual:**
```bash
# Opción 1: Endpoint de prueba
curl -X POST http://localhost:4000/api/tv/test-broadcast

# Opción 2: Registrar asistencia real desde app móvil
```

### 6. WebSocket (Eventos en tiempo real)
- [ ] Console muestra "[TV WS] conectado"
- [ ] Recibe eventos al registrar asistencia
- [ ] Reconecta automáticamente si se pierde conexión
- [ ] No muestra errores en console

**Verificar en DevTools:**
1. Network → WS
2. Ver conexión `ws://localhost:4000/api/tv/ws`
3. Status: 101 Switching Protocols

### 7. Responsive (Tamaños TV)

| Elemento | Tamaño esperado |
|----------|-----------------|
| Ticker altura | 80px |
| Fuentes avisos | 24px |
| QR código | 280x280px |
| Fuentes QR card | 22px / 18px |
| Panel QR ancho | 360px |
| Borders | 2-3px |
| Border radius | 24px |
| Padding cards | 32px |
| Overlay fuentes | 28px / 20px |

---

## 🐛 Troubleshooting

### QR no aparece
**Síntoma:** "Cargando QR..." permanente

**Verificar:**
```bash
# En navegador console
fetch('http://localhost:4000/api/tv/qr')
  .then(r => r.json())
  .then(console.log)
```

**Esperar:** `{ qrToken: "...", expiresInMs: ... }`

### Avisos no aparecen
**Verificar en backend:**
```bash
curl http://localhost:4000/api/tv/avisos
```

**Esperar:** Array con avisos activos

**Solución:** Crear avisos desde admin panel (`http://localhost:3001`)

### Multimedia no aparece
**Verificar:**
```bash
curl http://localhost:4000/api/tv/media
```

**Esperar:** Array con media items activos

**Solución:** Subir archivos desde admin panel

### WebSocket no conecta
**Síntomas:**
- Console muestra reconexiones constantes
- Overlay no aparece al registrar

**Verificar:**
1. Backend levantado
2. WebSocket habilitado en backend
3. CORS configurado correctamente
4. Sin proxies bloqueando WS

### CORS errors
**Síntoma:** Console muestra errores CORS

**Solución (backend):**
```javascript
// apps/backend/src/index.ts
app.use(cors({
  origin: 'http://localhost:3000', // dev
  credentials: true
}))
```

---

## 📊 Performance Checks

### DevTools Performance
1. F12 → Performance
2. Grabar 10 segundos
3. Verificar:
   - FPS estable ~60
   - No memory leaks
   - Transiciones suaves

### Network
- QR refresh cada 5s (200 bytes aprox)
- Media refresh cada 30s
- Avisos refresh cada 30s
- WebSocket: persistent connection

### Memory
- Inicial: ~30-50 MB
- Después de 10 min: < 100 MB
- No debe crecer indefinidamente

---

## 🎯 Test en dispositivo TV real

### Preparación
1. Build de producción: `npm run build`
2. Servir desde IP local o dominio
3. Configurar `VITE_API_URL` con IP accesible desde TV

### Acceso desde TV
**Opción 1: Navegador TV**
- Abrir navegador de Smart TV
- Navegar a `http://<TU_IP>:4173`
- Verificar fullscreen

**Opción 2: App instalada**
- Seguir pasos de empaquetado (README.md)
- Instalar .wgt (Samsung) o .ipk (LG)

### Control remoto
- ❌ No implementado navegación con D-Pad
- ✅ App es display-only (no requiere interacción)

---

## ✅ Test exitoso si:

1. ✅ QR visible y actualizando
2. ✅ Avisos scrolleando (si hay)
3. ✅ Media rotando (si hay)
4. ✅ Overlay aparece al registrar
5. ✅ WebSocket conectado (console)
6. ✅ Sin errores en console
7. ✅ UI escalada correctamente para 1920x1080
8. ✅ Fuentes legibles a distancia
9. ✅ Colores correctos
10. ✅ Performance fluida

---

## 📸 Screenshots esperados

### Vista completa (1920x1080)
```
┌──────────────────────────────────────────────────┐
│ 🔔 AVISOS │ Aviso 1 • Aviso 2 • Aviso 3...      │ 80px
├──────────────────────────────────────┬───────────┤
│                                      │           │
│                                      │  ┌─────┐  │
│         MULTIMEDIA                   │  │ QR  │  │
│      (Imagen/Video)                  │  │CODE │  │
│                                      │  └─────┘  │
│                                      │           │
│                                      │ ¿Cómo     │
│         ●●●○○                        │funciona?  │
│                                      │           │
└──────────────────────────────────────┴───────────┘
         Overlay aparece centrado inferior
```

---

## 📝 Notas

- **Puerto dev:** 3000
- **Puerto preview:** 4173
- **Backend:** 4000
- **Admin:** 3001 (si necesitas crear contenido)

**Cualquier issue:** Verificar console del navegador primero.
