# ⚡ Comandos Rápidos - Android TV App

## 🚀 Setup Inicial (5 minutos)

```bash
# 1. Navegar a la carpeta
cd apps/tv-androidtv

# 2. Instalar dependencias
npm install

# 3. Configurar backend URL
# Editar src/App.tsx línea 13:
# const API_URL = 'http://TU_IP:4000';

# 4. Lanzar en desarrollo
npm start           # Terminal 1
npm run android     # Terminal 2
```

## 📱 Desarrollo

```bash
# Iniciar Metro Bundler
npm start

# Lanzar en Android TV
npm run android

# Ver logs
npx react-native log-android

# Limpiar caché
npm start -- --reset-cache

# Recargar app en dispositivo
# Presionar 'r' en la terminal de Metro
# O doble tap R en el dispositivo
```

## 🏗️ Build

```bash
# Build debug
cd android
./gradlew assembleDebug

# Build release (requiere keystore)
./gradlew assembleRelease

# Build AAB para Play Store
./gradlew bundleRelease

# Limpiar builds
./gradlew clean
```

## 📦 Instalación

```bash
# Via ADB (más común)
adb connect [TV_IP]:5555
adb install -r android/app/build/outputs/apk/release/app-release.apk

# Listar dispositivos conectados
adb devices

# Desinstalar
adb uninstall com.tuempresa.checador.tv

# Lanzar app
adb shell am start -n com.tuempresa.checador.tv/.MainActivity
```

## 🔍 Debugging

```bash
# Chrome DevTools
# 1. Abrir la app en dispositivo
# 2. En Chrome: chrome://inspect
# 3. Click en "inspect" bajo tu dispositivo

# Inspeccionar con Flipper
npx react-native doctor

# Ver logs de crash
adb logcat | grep -i "reactnative"

# Port forwarding
adb reverse tcp:8081 tcp:8081
adb reverse tcp:4000 tcp:4000
```

## 🧪 Testing

```bash
# Ejecutar tests (cuando se implementen)
npm test

# Test específico
npm test -- ComponentName

# Coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## 🛠️ Utilidades

```bash
# Revisar versión de React Native
npx react-native --version

# Doctor (verificar configuración)
npx react-native doctor

# Listar emuladores disponibles
emulator -list-avds

# Lanzar emulador específico
emulator -avd [AVD_NAME]

# Info del dispositivo
adb shell getprop ro.product.model
adb shell getprop ro.build.version.release
```

## 📊 Análisis

```bash
# Tamaño del APK
ls -lh android/app/build/outputs/apk/release/

# Analizar bundle (después de build)
cd android
./gradlew app:dependencies > dependencies.txt

# Performance profiling
# En la app, presionar:
# - D: Dev menu
# - Enable Performance Monitor
```

## 🔧 Mantenimiento

```bash
# Actualizar dependencias
npm update

# Auditar seguridad
npm audit

# Fix automático de vulnerabilidades
npm audit fix

# Reinstalar node_modules
rm -rf node_modules && npm install

# Limpiar Gradle cache
cd android
./gradlew clean
rm -rf .gradle
```

## 🔑 Keystore (Producción)

```bash
# Generar keystore
keytool -genkeypair -v -storetype PKCS12 \
  -keystore android/app/release.keystore \
  -alias checador-tv-key \
  -keyalg RSA -keysize 2048 \
  -validity 10000

# Verificar keystore
keytool -list -v -keystore android/app/release.keystore

# Firmar APK manualmente
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore android/app/release.keystore \
  android/app/build/outputs/apk/release/app-release-unsigned.apk \
  checador-tv-key
```

## 📤 Publicación

```bash
# 1. Incrementar versión en android/app/build.gradle
# versionCode y versionName

# 2. Build AAB
cd android
./gradlew bundleRelease

# 3. Subir a Play Console
# Archivo: android/app/build/outputs/bundle/release/app-release.aab

# 4. Crear release notes en Play Console
```

## 🔄 Git

```bash
# Ignorar node_modules y builds
git add apps/tv-androidtv/.gitignore

# Agregar archivos fuente
git add apps/tv-androidtv/src/
git add apps/tv-androidtv/android/
git add apps/tv-androidtv/*.md
git add apps/tv-androidtv/package.json

# Commit
git commit -m "feat: migración a Android TV app"

# Push
git push origin main
```

## 🆘 Problemas Comunes

### Error: "Unable to load script"
```bash
adb reverse tcp:8081 tcp:8081
npm start -- --reset-cache
```

### Error: "Command not found: react-native"
```bash
npx react-native run-android
# o instalar globalmente:
npm install -g react-native-cli
```

### Error: "SDK location not found"
```bash
# Crear android/local.properties:
echo "sdk.dir=/Users/TU_USUARIO/Library/Android/sdk" > android/local.properties
# (ajustar ruta según tu sistema)
```

### Video no reproduce
```bash
# Verificar permisos de red en AndroidManifest.xml
# Verificar que el backend está accesible
curl http://TU_IP:4000/api/tv/media
```

### App crashea al abrir
```bash
# Ver logs completos
adb logcat | grep -E "AndroidRuntime|ReactNative"

# Reinstalar desde cero
npm run android -- --reset-cache
```

## 📱 Emulador

```bash
# Listar emuladores
emulator -list-avds

# Crear Android TV emulator (desde Android Studio)
# Tools → AVD Manager → Create Virtual Device → TV

# Lanzar emulador
emulator @TV_API_35

# Wipe data
emulator @TV_API_35 -wipe-data
```

## 💡 Tips Pro

```bash
# Build más rápido (solo debug)
cd android
./gradlew assembleDebug --offline

# Parallel builds (más rápido)
# Agregar a android/gradle.properties:
# org.gradle.parallel=true

# Habilitar Hermes (ya habilitado)
# Verifica en android/app/build.gradle:
# hermesEnabled=true

# Bundle size analysis
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output /tmp/bundle.js \
  --assets-dest /tmp/
ls -lh /tmp/bundle.js
```

## 🎯 Workflow Recomendado

### Día a día
```bash
1. npm start (mantener corriendo)
2. npm run android (primera vez del día)
3. Hacer cambios en código
4. Metro auto-recarga (guardar archivo)
5. Si hay problemas: 'r' en terminal de Metro
```

### Antes de commit
```bash
1. npm test (cuando existan tests)
2. npx tsc (verificar TypeScript)
3. npm run lint (si está configurado)
4. Probar en dispositivo real
5. git commit
```

### Release
```bash
1. Incrementar versionCode
2. Actualizar changelog
3. ./gradlew bundleRelease
4. Probar APK en dispositivo
5. Subir a Play Console
```

---

**Ver documentación completa en:**
- `README.md` - Guía detallada
- `QUICK-START.md` - Setup rápido
- `DEPLOYMENT.md` - Guía de producción
