# 🚀 Quick Start - Android TV App

## Instalación Rápida (5 minutos)

### 1. Instalar dependencias
```bash
cd apps/tv-androidtv
npm install
```

### 2. Configurar Backend URL
Edita `src/App.tsx` línea 13:
```typescript
const API_URL = 'http://TU_IP:4000'; // Cambia por tu IP
```

### 3. Lanzar en emulador
```bash
# Terminal 1
npm start

# Terminal 2
npm run android
```

## ✅ Verificación

La app debería mostrar:
- ✅ Ticker de avisos (arriba)
- ✅ Reproductor de media (izquierda)
- ✅ Código QR (derecha arriba)
- ✅ Instrucciones (derecha abajo)

## 🐛 Problemas Comunes

### "Could not connect to server"
→ Verifica que el backend esté corriendo en `http://TU_IP:4000`

### "Unable to load script"
→ Ejecuta: `adb reverse tcp:8081 tcp:8081`

### Video no se reproduce
→ Verifica que el formato sea MP4/WebM

## 📖 Documentación Completa
Ver `README.md` para instrucciones detalladas.
