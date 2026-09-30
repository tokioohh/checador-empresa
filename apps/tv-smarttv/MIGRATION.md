# Resumen de Migración: tv-webapp → tv-smarttv

## ✅ Archivos sin cambios (copiados tal cual)

### Hooks (lógica de negocio)
- `src/hooks/useQrToken.ts` - Obtención de token QR
- `src/hooks/useMedia.ts` - Fetch de multimedia
- `src/hooks/useAvisos.ts` - Fetch de avisos
- `src/hooks/useTvWebSocket.ts` - Conexión WebSocket para eventos

### Configuración base
- `tsconfig.json` - Configuración TypeScript
- `vite.config.ts` - Configuración Vite
- `src/main.tsx` - Entry point de React
- `src/vite-env.d.ts` - Type definitions

**Razón:** La lógica de negocio, conexión al backend y manejo de estado son exactamente iguales. Solo cambia la presentación visual.

---

## 🎨 Archivos adaptados para TV

### `index.html`
**Cambios:**
- Viewport: `width=1920` (resolución TV)
- `user-scalable=no` (no hay touch en TV)
- `user-select: none` (optimización)

### `src/components/QrDisplay.tsx`
**Cambios visuales:**
- Tamaño QR: `160px` → `280px`
- Contenedor: `180x180` → `280x280`
- Border: `2px` → `3px`
- Font size (loading): `13px` → `18px`
- Padding: `12px` → `16px`

**Sin cambios:** Lógica de generación de URL, animación pulse, manejo de loading.

### `src/components/AvisosTicker.tsx`
**Cambios visuales:**
- Altura: `52px` → `80px`
- Font size avisos: `16px` → `24px`
- Font size label: `13px` → `18px`
- Icon size: `18px` → `24px`
- Separador bullets: `14px` → `20px`, size `28px`
- Borders: `1px` → `2px`
- Padding icono: `20px` → `28px`

**Sin cambios:** Animación ticker, lógica de renderizado, colores, estructura.

### `src/components/MediaPlayer.tsx`
**Cambios visuales:**
- Icon empty state: `64px` → `80px`
- Font sizes: `18px/14px` → `26px/20px`
- Progress bar: `320px` → `400px`, height `4px` → `6px`
- Dots: width activo `16px` → `20px`, inactivo `6px` → `8px`, gap `6px` → `8px`
- Bottom offset: `16px` → `24px`
- Gap empty state: `16px` → `24px`

**Sin cambios:** Lógica de carrusel, transiciones, timers, manejo de video/imagen.

### `src/components/WelcomeOverlay.tsx`
**Cambios visuales:**
- Duración: `5000ms` → `6000ms` (más tiempo para leer)
- Icon size: `28px` → `40px`
- Font size mensaje: `20px` → `28px`
- Font size submensaje: `14px` → `20px`
- Padding: `16px 32px` → `24px 48px`
- Min width: `400px` → `500px`
- Gap: `16px` → `24px`
- Bottom offset: `24px` → `32px`
- Shadow: aumentado

**Sin cambios:** Lógica de eventos, tipos de mensajes, animaciones, colores.

### `src/App.tsx`
**Cambios de layout:**
- Padding principal: `24px 24px 96px 24px` → `32px`
- Gap: `24px` → `32px`
- Panel QR: `280px` → `360px`
- Border radius: `20px` → `24px`
- Borders: `1px` → `2px`
- Padding QR card: `24px` → `32px`
- Font sizes: `16px/13px/14px` → `22px/18px/20px`
- Info card padding: `20px` → `28px`

**Sin cambios:** Estructura de componentes, flujo de datos, hooks utilizados.

---

## 🆕 Archivos nuevos (específicos de Smart TV)

### `package.json`
Scripts adicionales:
- `build:tizen` - Build para Samsung Tizen
- `build:webos` - Build para LG webOS
- `package:tizen` - Empaquetar .wgt
- `package:webos` - Empaquetar .ipk

### `public/manifest.json`
PWA manifest para Android TV con:
- Display: fullscreen
- Orientation: landscape
- Resolución 1920x1080

### `public/tizen/config.xml`
Configuración Samsung Tizen:
- Widget ID y versión
- Permisos de red
- Screen orientation landscape
- Context menu disabled

### `public/webos/appinfo.json`
Configuración LG webOS:
- App ID y metadata
- Resolución 1920x1080
- Permisos de red
- Background deshabilitado

### `README.md`
Documentación completa de:
- Setup de desarrollo
- Deployment por plataforma
- Testing en emuladores
- Troubleshooting

### `.env.example`
Template de variables de entorno.

---

## 📊 Comparativa de Cambios

| Aspecto | tv-webapp | tv-smarttv | Cambio |
|---------|-----------|------------|--------|
| **Resolución objetivo** | Variable | 1920x1080 | Fixed para TV |
| **Tamaño QR** | 160px | 280px | +75% |
| **Fuentes** | 13-20px | 18-28px | +40-50% |
| **Ticker altura** | 52px | 80px | +54% |
| **Overlay duración** | 5s | 6s | +20% |
| **Borders** | 1-2px | 2-3px | +50-100% |
| **Spacing** | 16-24px | 24-32px | +33-50% |
| **Lógica de negocio** | ✅ | ✅ | **Sin cambios** |
| **Endpoints API** | ✅ | ✅ | **Sin cambios** |
| **Hooks** | ✅ | ✅ | **Sin cambios** |
| **WebSocket** | ✅ | ✅ | **Sin cambios** |

---

## 🎯 Principios de la migración

1. **Zero backend changes** - Usa los mismos endpoints `/api/tv/*`
2. **Reutilización máxima** - 100% de hooks sin modificar
3. **Solo adaptación visual** - Cambios limitados a estilos inline
4. **Misma funcionalidad** - QR, avisos, media, overlays idénticos
5. **Optimización para TV** - Fuentes grandes, spacing generoso, fullscreen

---

## 🚀 Próximos pasos

### Para testing:
```bash
cd apps/tv-smarttv
npm install
npm run dev
```

### Para deployment:
1. **Desarrollo local:** `npm run build` → probar en navegador 1920x1080
2. **Samsung TV:** Seguir pasos Tizen en README.md
3. **LG TV:** Seguir pasos webOS en README.md
4. **Android TV:** TWA o WebView según preferencia

### Variables de entorno:
```bash
cp .env.example .env
# Editar VITE_API_URL con la URL del backend
```

---

## ✨ Beneficios de esta arquitectura

- ✅ **Backend intacto** - No requiere cambios en API
- ✅ **Mantenibilidad** - Fixes en lógica se aplican a ambas apps
- ✅ **Escalabilidad** - Fácil agregar más plataformas
- ✅ **Código limpio** - Separación clara presentación/lógica
- ✅ **Performance** - Sin overhead, solo CSS/tamaños diferentes
