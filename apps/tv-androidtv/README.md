# 📺 Checador Empresa - Android TV App

Aplicación de Android TV para el sistema de registro de asistencia empresarial.

## 🚀 Características

- ✅ Optimizada para Android TV (control remoto y navegación con D-pad)
- 📱 Display de QR code para registro de asistencia
- 🎥 Reproductor multimedia con soporte para imágenes y videos
- 📢 Ticker de avisos en tiempo real
- 🔔 Notificaciones visuales de entrada/salida
- 🔄 WebSocket para actualizaciones en tiempo real
- 🎨 UI adaptativa para pantallas grandes

## 📋 Requisitos Previos

- Node.js 18+
- Java JDK 17+
- Android Studio (con Android SDK instalado)
- Android TV emulator o dispositivo Android TV físico
- React Native CLI instalado globalmente: `npm install -g react-native-cli`

## 🛠️ Instalación

1. **Instalar dependencias:**
```bash
cd apps/tv-androidtv
npm install
```

2. **Configurar la URL del backend:**

Edita `src/App.tsx` y cambia la constante `API_URL` con la IP de tu servidor:

```typescript
const API_URL = 'http://TU_IP_SERVIDOR:4000';
```

⚠️ **Importante:** No uses `localhost` - usa la IP local de tu red (ej: `192.168.1.100`)

3. **Configurar Android TV Emulator (opcional):**

En Android Studio:
- Abrir AVD Manager
- Create Virtual Device → TV → Seleccionar un dispositivo TV
- Descargar y seleccionar una imagen del sistema
- Finish

## 🎬 Ejecución

### Desarrollo

1. **Iniciar Metro Bundler:**
```bash
npm start
```

2. **En otra terminal, lanzar en Android TV:**
```bash
npm run android
```

### Build de Producción

```bash
cd android
./gradlew assembleRelease
```

El APK se generará en: `android/app/build/outputs/apk/release/app-release.apk`

## 📦 Instalación en Android TV Real

### Método 1: ADB (Recomendado)

1. **Habilitar Developer Options en Android TV:**
   - Ir a Settings → About
   - Presionar "Build" 7 veces
   - Ir a Settings → Developer Options
   - Activar "USB debugging"

2. **Conectar por ADB:**
```bash
adb connect TV_IP_ADDRESS:5555
```

3. **Instalar APK:**
```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### Método 2: USB Drive

1. Copiar el APK a una USB
2. Conectar USB a Android TV
3. Usar un File Manager en el TV para instalar el APK

## 🔧 Configuración

### Variables de Entorno

La app se puede configurar editando las constantes en `src/App.tsx`:

- `API_URL`: URL del servidor backend

### Personalización

Los estilos y colores se pueden modificar en cada componente dentro de `src/components/`.

## 📱 Navegación con Control Remoto

La app está optimizada para control remoto de Android TV:

- **D-pad:** Navegación entre elementos focusables
- **Back:** Salir de la app
- **Home:** Ir al launcher

## 🔍 Debugging

### Ver logs en tiempo real:
```bash
npx react-native log-android
```

### Inspeccionar con Chrome DevTools:
```bash
adb reverse tcp:8081 tcp:8081
```

Luego abrir en Chrome: `chrome://inspect`

## 📚 Librerías Utilizadas

| Librería | Versión | Propósito |
|----------|---------|-----------|
| react-native | 0.76.6 | Framework principal |
| react-native-qrcode-svg | ^6.3.11 | Generación de códigos QR |
| react-native-svg | ^15.9.0 | Renderizado de SVG |
| react-native-video | ^6.7.5 | Reproducción de video |

Todas las librerías son compatibles con Android TV y no requieren dependencias adicionales.

## 🐛 Troubleshooting

### Error: "Unable to load script"
- Verifica que Metro Bundler esté corriendo
- Ejecuta: `adb reverse tcp:8081 tcp:8081`

### Error: "Could not connect to development server"
- Verifica la URL del API en `src/App.tsx`
- Asegúrate que el backend esté corriendo
- Verifica que el dispositivo/emulador esté en la misma red

### El video no se reproduce
- Verifica que el formato de video sea compatible (MP4, WebM)
- Asegúrate que la URL del archivo sea accesible desde la red

### El QR no se muestra
- Verifica la conectividad con el backend
- Revisa los logs: `npx react-native log-android`

## 📄 Estructura del Proyecto

```
apps/tv-androidtv/
├── android/                 # Código nativo de Android
│   ├── app/
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── java/com/tvandroidtv/
├── src/
│   ├── components/         # Componentes React Native
│   │   ├── QrDisplay.tsx
│   │   ├── MediaPlayer.tsx
│   │   ├── AvisosTicker.tsx
│   │   └── WelcomeOverlay.tsx
│   ├── hooks/             # Custom hooks
│   │   ├── useQrToken.ts
│   │   ├── useMedia.ts
│   │   ├── useAvisos.ts
│   │   └── useTvWebSocket.ts
│   ├── types/             # TypeScript types
│   └── App.tsx            # Componente principal
├── index.js               # Entry point
├── package.json
└── README.md
```

## 🎯 Próximas Mejoras

- [ ] Configuración desde archivo .env
- [ ] Modo offline con caché
- [ ] Soporte para múltiples idiomas
- [ ] Temas personalizables
- [ ] Estadísticas de asistencia en pantalla

## 📞 Soporte

Si encuentras algún problema, por favor crea un issue con:
- Versión de Android TV
- Logs relevantes
- Pasos para reproducir el error
