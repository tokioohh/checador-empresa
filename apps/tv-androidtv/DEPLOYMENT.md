# 🚀 Guía de Despliegue - Android TV App

## 📋 Pre-requisitos

- ✅ App desarrollada y probada
- ✅ Backend funcionando
- ✅ Android Studio instalado
- ✅ Keystore de firma creado (para producción)

---

## 🔑 1. Generar Keystore de Producción

### Crear Keystore

```bash
cd apps/tv-androidtv/android/app

keytool -genkeypair -v -storetype PKCS12 \
  -keystore release.keystore \
  -alias checador-tv-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Guarda esta información:**
- Keystore password: `[TU_PASSWORD]`
- Key alias: `checador-tv-key`
- Key password: `[TU_PASSWORD]`

⚠️ **IMPORTANTE:** Guarda el keystore en un lugar seguro. Si lo pierdes, no podrás actualizar la app en Play Store.

### Configurar Gradle

Crea `android/gradle.properties` (o agrega):

```properties
MYAPP_RELEASE_STORE_FILE=release.keystore
MYAPP_RELEASE_KEY_ALIAS=checador-tv-key
MYAPP_RELEASE_STORE_PASSWORD=TU_PASSWORD
MYAPP_RELEASE_KEY_PASSWORD=TU_PASSWORD
```

⚠️ **No subas este archivo a git** - agrégalo a `.gitignore`

Edita `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 📦 2. Build de Producción

### Opción A: APK (Instalación directa)

```bash
cd apps/tv-androidtv
npm run build

cd android
./gradlew clean
./gradlew assembleRelease
```

**Output:** `android/app/build/outputs/apk/release/app-release.apk`

### Opción B: AAB (Google Play Store)

```bash
cd apps/tv-androidtv/android
./gradlew bundleRelease
```

**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

---

## 📱 3. Instalación en Dispositivos

### Método 1: ADB (Recomendado para testing)

```bash
# Habilitar ADB en Android TV
# Settings → Developer Options → USB Debugging: ON

# Conectar
adb connect [TV_IP]:5555

# Verificar conexión
adb devices

# Instalar
adb install -r android/app/build/outputs/apk/release/app-release.apk

# Lanzar app
adb shell am start -n com.tuempresa.checador.tv/.MainActivity
```

### Método 2: USB Drive

1. Copiar APK a USB
2. Conectar USB a Android TV
3. Abrir File Manager
4. Navegar a USB y seleccionar APK
5. Confirmar instalación

### Método 3: Servidor Web

```bash
# En tu PC
cd android/app/build/outputs/apk/release
python -m http.server 8000

# En Android TV, abrir navegador y descargar:
http://[TU_IP]:8000/app-release.apk
```

---

## 🏪 4. Publicación en Google Play Store

### Preparación

1. **Crear cuenta de Google Play Developer**
   - Costo: $25 USD (único, lifetime)
   - URL: https://play.google.com/console

2. **Preparar assets**
   - Icono de app: 512x512 PNG
   - Banner de TV: 1280x720 PNG
   - Screenshots: Mínimo 2, 1920x1080 PNG
   - Video promocional (opcional)

3. **Información de la app**
   - Título: "Checador Empresa - Registro de Asistencia"
   - Descripción corta (80 chars)
   - Descripción completa
   - Categoría: Business
   - Clasificación de contenido
   - Política de privacidad URL

### Subir App

#### Paso 1: Crear App en Console

1. Ir a Play Console
2. "Create app"
3. Seleccionar "TV" como plataforma principal
4. Llenar información básica

#### Paso 2: Configurar Store Listing

```
Título: Checador Empresa TV
Descripción corta: Sistema de registro de asistencia empresarial para Android TV

Descripción completa:
Checador Empresa es un sistema moderno de registro de asistencia diseñado 
específicamente para Android TV.

Características:
✅ Registro mediante código QR
✅ Verificación con huella digital
✅ Reproductor multimedia integrado
✅ Avisos y notificaciones en tiempo real
✅ Interfaz optimizada para TV

Ideal para:
• Oficinas corporativas
• Fábricas y plantas industriales  
• Centros comerciales
• Instituciones educativas

Requiere backend del sistema Checador Empresa.
```

#### Paso 3: Subir AAB

1. Production → Create new release
2. Upload `app-release.aab`
3. Agregar release notes:
   ```
   v1.0.0 - Lanzamiento inicial
   • Sistema de registro con QR
   • Reproductor multimedia
   • Avisos en tiempo real
   • Optimizado para Android TV
   ```

#### Paso 4: Content Rating

Completar el cuestionario de clasificación:
- Violencia: No
- Contenido sexual: No
- Lenguaje ofensivo: No
- Drogas: No
- **Resultado esperado:** Todos los públicos

#### Paso 5: Pricing & Distribution

- Precio: Gratis o De pago
- Países: Seleccionar todos o específicos
- TV: ✅ Activar distribución para Android TV
- Consent: Aceptar términos

#### Paso 6: Review y Publicar

1. Review summary → Verificar todo
2. "Start rollout to Production"
3. Esperar aprobación (1-3 días típicamente)

---

## 🔄 5. Actualización de la App

### Incrementar Versión

Edita `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        versionCode 2        // Incrementar en 1
        versionName "1.1.0"  // Actualizar versión
    }
}
```

### Build y Upload

```bash
cd android
./gradlew bundleRelease

# Upload a Play Console
# Production → Create new release
# Upload nuevo AAB
```

### Rollout Gradual

En Play Console puedes hacer rollout gradual:
- 10% de usuarios → 24 horas
- 50% de usuarios → 48 horas
- 100% de usuarios

Permite detectar problemas antes de afectar a todos.

---

## 📊 6. Monitoreo Post-Lanzamiento

### Google Play Console Analytics

Revisar diariamente:
- Instalaciones activas
- Crashes
- ANRs (Application Not Responding)
- Ratings y reviews
- Uninstalls

### Crashlytics (Opcional pero recomendado)

Integrar Firebase Crashlytics:

```bash
npm install @react-native-firebase/app @react-native-firebase/crashlytics
```

Permite monitoreo de crashes en tiempo real.

### User Feedback

Responder a reviews en Play Store:
- Response time: <24 horas
- Ser profesional y útil
- Ofrecer soluciones

---

## 🐛 7. Hotfix de Emergencia

### Detectar Problema Crítico

1. Identificar el bug en Play Console
2. Reproducir localmente
3. Crear branch de hotfix

### Fix y Deploy Rápido

```bash
# Fix el bug
git checkout -b hotfix/v1.0.1

# Incrementar versionCode
# Edit android/app/build.gradle: versionCode 2, versionName "1.0.1"

# Build
cd android && ./gradlew bundleRelease

# Upload a Play Console como "Emergency Update"
# Rollout inmediato al 100%
```

### Comunicación

- Agregar nota en release notes
- Notificar a usuarios afectados si es posible
- Documentar el incidente

---

## 📝 8. Checklist de Pre-Lanzamiento

Antes de publicar, verificar:

### Técnico
- [ ] App compilado sin errores
- [ ] Probado en emulador Android TV
- [ ] Probado en dispositivo real
- [ ] Videos se reproducen correctamente
- [ ] QR se genera y escanea bien
- [ ] WebSocket se conecta y reconecta
- [ ] Performance > 30 FPS consistente
- [ ] Sin memory leaks
- [ ] Manejo de errores robusto

### Assets
- [ ] Icono de app (512x512)
- [ ] Banner de TV (1280x720)
- [ ] Screenshots (mínimo 2)
- [ ] Video promocional (opcional)

### Legal
- [ ] Política de privacidad escrita y publicada
- [ ] Términos de servicio
- [ ] Content rating completado
- [ ] Copyright correcto

### Store Listing
- [ ] Título optimizado
- [ ] Descripción completa y atractiva
- [ ] Keywords para SEO
- [ ] Categoría correcta
- [ ] Países seleccionados

---

## 🎯 9. Estrategia de Lanzamiento

### Soft Launch (Recomendado)

**Semana 1-2:** Lanzar en 1-2 países pequeños
- Probar con usuarios reales
- Detectar bugs críticos
- Ajustar store listing

**Semana 3-4:** Expandir gradualmente
- Agregar más países
- Monitorear métricas
- Responder a feedback

**Mes 2:** Lanzamiento global
- Publicar en todos los países target
- Marketing push
- Monitoreo intensivo

### Promoción

- [ ] Anuncio en redes sociales
- [ ] Email a clientes existentes
- [ ] Press release (si aplica)
- [ ] Video demo en YouTube
- [ ] Post en foros/comunidades relevantes

---

## 💡 Tips Pro

### Performance
- Habilitar ProGuard en release builds
- Usar AAB en vez de APK para Play Store (30% más pequeño)
- Habilitar splits por arquitectura para reducir tamaño

### Seguridad
- No hardcodear API URLs en el código
- Usar HTTPS en producción
- Implementar certificate pinning si es sensible

### Mantenimiento
- Establecer CI/CD para builds automáticos
- Documentar proceso de release
- Mantener changelog actualizado

---

## 📞 Soporte

Para problemas durante el despliegue:

1. **Play Console Issues:** https://support.google.com/googleplay/android-developer
2. **React Native:** https://reactnative.dev/help
3. **Android TV:** https://developer.android.com/tv

---

## ✅ Checklist Final

### Primera vez
- [ ] Keystore generado y guardado
- [ ] Cuenta de Play Console creada
- [ ] Assets preparados
- [ ] App build y firmado
- [ ] Probado en dispositivo real
- [ ] Subido a Play Console
- [ ] Store listing completado
- [ ] Enviado a revisión

### Actualizaciones
- [ ] VersionCode incrementado
- [ ] Changelog escrito
- [ ] Build generado
- [ ] Probado localmente
- [ ] Subido a Play Console
- [ ] Rollout configurado

---

**¡Éxito con tu lanzamiento! 🚀**
