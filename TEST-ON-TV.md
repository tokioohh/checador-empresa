# 📺 Cómo Probar la App en TV Real

## 🎯 Opción 1: Navegador Web (5 minutos) ⚡

La forma MÁS RÁPIDA para testing inmediato.

### Compatibilidad:
- ✅ Samsung Smart TV (2015+) - Navegador Tizen
- ✅ LG Smart TV (2014+) - Navegador webOS
- ✅ Android TV - Chrome
- ✅ Fire TV - Amazon Silk
- ⚠️ Vizio, TCL, Hisense (Android TV) - Chrome

---

### Paso 1: Obtener tu IP local

**Windows:**
```bash
ipconfig
```

Busca tu adaptador activo (Wi-Fi o Ethernet) y copia la **IPv4**:
```
IPv4 Address: 192.168.1.100
```

**Linux/Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Ejemplo de IP:** `192.168.1.100`

⚠️ **IMPORTANTE:** Tu computadora y la TV deben estar en la **misma red Wi-Fi**.

---

### Paso 2: Iniciar backend con host 0.0.0.0

Por defecto, el backend solo escucha en `localhost`. Necesitas que acepte conexiones desde la red.

**Editar `apps/backend/src/index.ts`:**

Busca esta línea:
```typescript
server.listen(env.PORT, () => {
```

Cámbiala a:
```typescript
server.listen(env.PORT, '0.0.0.0', () => {
```

**O usa este comando temporal:**

```bash
cd apps/backend
PORT=4000 npm run dev
```

Luego en otro terminal:
```bash
# Windows
netsh interface portproxy add v4tov4 listenport=4000 listenaddress=0.0.0.0 connectport=4000 connectaddress=127.0.0.1

# O reiniciar backend con flag --host (si usas vite)
```

---

### Paso 3: Iniciar TV app con acceso de red

**Opción A: Vite con --host**

```bash
cd apps/tv-smarttv
npm run dev -- --host
```

**Opción B: Build y servir**

```bash
cd apps/tv-smarttv

# Crear .env.production con tu IP
echo VITE_API_URL=http://192.168.1.100:4000 > .env.production

# Build
npm run build

# Servir con acceso de red
npx vite preview --host --port 3000
```

---

### Paso 4: Abrir en la TV

#### **Samsung Tizen (2015+)**

1. En el control remoto, presiona **Smart Hub** o el botón **Home**
2. Busca la app **Internet** o **Web Browser**
3. Abre el navegador
4. En la barra de direcciones:
   ```
   http://192.168.1.100:3000
   ```
   *(Reemplaza con tu IP)*

5. **Modo fullscreen:**
   - Samsung: Se activa automáticamente al entrar
   - O presiona **Tools** → **Full Screen**

---

#### **LG webOS (2014+)**

1. Presiona **Home** en el control remoto
2. Busca la app **Web Browser**
3. Ingresa la URL:
   ```
   http://192.168.1.100:3000
   ```

4. **Navegación:**
   - Usa D-Pad (flechas) para mover cursor
   - OK para hacer click
   - Back para volver

---

#### **Android TV / Fire TV**

1. Instala **Chrome** o **Firefox** desde Play Store
2. Abre el navegador
3. Navega a:
   ```
   http://192.168.1.100:3000
   ```

4. **Fullscreen:**
   - Presiona F11 (si hay teclado)
   - O Settings → Request Desktop Site → Refresh

**Mejor opción para Android TV:** Usar Opción 2 (TWA) más abajo.

---

### Paso 5: Verificar que funciona

Deberías ver:
- ✅ Ticker de avisos en la parte superior
- ✅ QR grande (280x280px) en panel derecho
- ✅ Multimedia rotando (o placeholder)
- ✅ Card "¿Cómo funciona?"
- ✅ Layout en 1920x1080

**Probar funcionalidad:**
1. Escanear el QR con la app móvil
2. Registrar asistencia
3. Ver que aparece el overlay de bienvenida en la TV

---

## 🐛 Troubleshooting Opción 1

### Error: "Refused to connect"

**Causa:** Backend no acepta conexiones desde la red

**Solución:**
```bash
# Ver si el backend está escuchando en 0.0.0.0
netstat -ano | findstr :4000
```

Debe mostrar:
```
TCP    0.0.0.0:4000    0.0.0.0:0    LISTENING
```

Si muestra `127.0.0.1:4000`, el backend solo escucha localhost.

**Fix:** Editar `apps/backend/src/index.ts`:
```typescript
server.listen(env.PORT, '0.0.0.0', () => {
  console.log(`API escuchando en http://0.0.0.0:${env.PORT}`);
});
```

---

### Error: "Failed to fetch"

**Causa:** La TV no puede alcanzar el backend

**Verificar:**

1. **Firewall de Windows:**
   - Panel de Control → Firewall
   - Permitir app → Node.js
   - O temporalmente: Desactivar firewall para testing

2. **Ping desde TV al PC:**
   ```bash
   # En el PC
   ping 192.168.1.100
   ```
   Si no responde, hay problema de red.

3. **CORS:**
   Ya está configurado (`app.use(cors())` sin restricciones)

---

### QR no carga

**Verificar en DevTools del navegador TV** (si tiene):

```javascript
fetch('http://192.168.1.100:4000/api/tv/qr')
  .then(r => r.json())
  .then(console.log)
```

**Si no tiene DevTools:** Usar desde tu PC:
```bash
curl http://192.168.1.100:4000/api/tv/qr
```

Debe devolver:
```json
{"qrToken":"...","expiresInMs":...}
```

---

### WebSocket no conecta

**Síntoma:** Overlay de bienvenida no aparece

**Verificar:**
1. Backend tiene WebSocket habilitado (ya lo tiene)
2. Firewall permite WS en puerto 4000
3. La TV soporta WebSocket (Samsung 2015+, LG 2014+, Android TV: sí)

**Test manual:**
```bash
# Endpoint de prueba
curl -X POST http://192.168.1.100:4000/api/tv/test-broadcast
```

Debería aparecer overlay en la TV.

---

## 📱 Opción 2: TWA (Android TV) - App Real

Para Android TV, puedes crear una APK instalable usando Trusted Web Activity.

### Requisitos:
- Android TV con Developer Mode activado
- ADB instalado en tu PC

---

### Paso 1: Activar Developer Mode en Android TV

1. Settings → Device Preferences → About
2. Buscar "Build" o "Android Version"
3. Presionar 7 veces hasta ver "You are now a developer"
4. Settings → Developer Options → USB Debugging: ON
5. Developer Options → ADB Debugging: ON

---

### Paso 2: Conectar por ADB

**Por USB:**
```bash
adb devices
```

**Por Wi-Fi (recomendado):**

1. Obtener IP del Android TV:
   - Settings → Network → Wi-Fi → Ver IP
   - Ejemplo: `192.168.1.200`

2. Conectar:
   ```bash
   adb connect 192.168.1.200:5555
   ```

3. Verificar:
   ```bash
   adb devices
   # Debe mostrar: 192.168.1.200:5555    device
   ```

---

### Paso 3: Build de producción

**Configurar URL del backend:**

```bash
cd apps/tv-smarttv

# Crear .env.production
echo VITE_API_URL=http://192.168.1.100:4000 > .env.production

# Build
npm run build
```

Esto genera `dist/` con los archivos estáticos.

---

### Paso 4: Crear APK con Bubblewrap

**Instalar Bubblewrap:**
```bash
npm install -g @bubblewrap/cli
```

**Inicializar TWA:**

Primero necesitas servir el build desde una URL accesible. Opción rápida:

```bash
# Servir desde tu PC
cd dist
python -m http.server 3000 --bind 0.0.0.0

# O con Node
npx http-server -p 3000 --cors
```

Tu app ahora está en: `http://192.168.1.100:3000`

**Crear proyecto TWA:**

```bash
# Crear directorio para TWA
mkdir twa-build
cd twa-build

# Inicializar (responde las preguntas)
bubblewrap init --manifest http://192.168.1.100:3000/manifest.json
```

**Preguntas que hará:**

- **Application Name:** Checador Empresa
- **Short Name:** Checador
- **Start URL:** http://192.168.1.100:3000
- **Theme Color:** #3b82f6
- **Background Color:** #f8fafc
- **Display Mode:** fullscreen
- **Orientation:** landscape
- **Icon URL:** http://192.168.1.100:3000/icon-512.png

⚠️ **Necesitarás iconos:** Crear `icon-192.png` e `icon-512.png` en `public/`

---

### Paso 5: Build APK

```bash
bubblewrap build
```

Esto genera: `app-release-signed.apk`

---

### Paso 6: Instalar en Android TV

```bash
adb install app-release-signed.apk
```

La app aparecerá en el launcher como "Checador Empresa" 🎉

---

## 🏢 Opción 3: Empaquetar para Samsung/LG (Producción)

Para instalación permanente en Samsung Tizen o LG webOS.

### Requisitos:
- Cuenta de desarrollador (Samsung/LG)
- Certificados firmados
- TV en Developer Mode

---

### A) Samsung Tizen

#### Paso 1: Instalar Tizen Studio

Descargar: https://developer.tizen.org/development/tizen-studio/download

```bash
# Instalar CLI tools
tizen-studio/tools/ide/bin/tizen-cli.bat
```

#### Paso 2: Activar Developer Mode en Samsung TV

1. En el control remoto: **123** → **456** → **789**
2. O: Apps → Developer Mode (si aparece)
3. Ingresar IP de tu PC
4. TV se reiniciará

#### Paso 3: Build de producción

```bash
cd apps/tv-smarttv

# Configurar URL de producción
echo VITE_API_URL=http://TU-SERVIDOR:4000 > .env.production

# Build
npm run build
```

#### Paso 4: Crear package Tizen

```bash
# Crear directorio
mkdir tizen-build
cd tizen-build

# Copiar build
cp -r ../dist/* .

# Copiar config.xml
cp ../public/tizen/config.xml .

# Editar config.xml
# Cambiar: id="abcdefghij.checador"
# Por tu ID real (10 caracteres random + nombre app)
```

**Configurar certificado:**

```bash
# Crear perfil de seguridad
tizen security-profiles add -n MyProfile -a /path/to/author.p12 -p <password>
```

*(Necesitas generar certificados desde Tizen Studio)*

**Empaquetar .wgt:**

```bash
tizen package -t wgt -s MyProfile -- tizen-build/
```

Genera: `Checador.wgt`

#### Paso 5: Instalar en TV

```bash
# Conectar a TV (obtener IP desde TV Settings → Network)
tizen connect 192.168.1.150

# Instalar
tizen install -n Checador.wgt -t 192.168.1.150

# Ejecutar
tizen run -p abcdefghij.checador -t 192.168.1.150
```

---

### B) LG webOS

#### Paso 1: Instalar webOS CLI

Descargar: https://webostv.developer.lge.com/sdk/installation/

```bash
npm install -g @webosose/ares-cli
```

#### Paso 2: Activar Developer Mode en LG TV

1. Instalar app "Developer Mode" desde LG Content Store
2. Abrir app → Turn On Developer Mode
3. Aceptar términos
4. TV se reiniciará

#### Paso 3: Build de producción

```bash
cd apps/tv-smarttv
echo VITE_API_URL=http://TU-SERVIDOR:4000 > .env.production
npm run build
```

#### Paso 4: Crear package webOS

```bash
# Crear directorio
mkdir webos-build
cd webos-build

# Copiar build
cp -r ../dist/* .

# Copiar appinfo.json
cp ../public/webos/appinfo.json .

# Editar appinfo.json si es necesario
```

**Empaquetar .ipk:**

```bash
ares-package webos-build/ -o ./
```

Genera: `com.tuempresa.checador_1.0.0_all.ipk`

#### Paso 5: Configurar TV

```bash
# Agregar TV (necesitas IP del TV)
ares-setup-device

# Responde:
# - name: mytv
# - host: 192.168.1.200
# - port: 9922
# - username: prisoner
# - password: (dejar vacío)
```

#### Paso 6: Instalar en TV

```bash
# Instalar
ares-install com.tuempresa.checador_1.0.0_all.ipk -d mytv

# Ejecutar
ares-launch com.tuempresa.checador -d mytv
```

---

## 🎯 Comparación de Opciones

| Opción | Tiempo | Complejidad | Permanente | Producción |
|--------|--------|-------------|------------|------------|
| **Navegador Web** | 5 min | ⭐ Fácil | ❌ No | ❌ No |
| **TWA (Android TV)** | 30 min | ⭐⭐ Media | ✅ Sí | ✅ Sí |
| **Samsung .wgt** | 1-2 hrs | ⭐⭐⭐ Alta | ✅ Sí | ✅ Sí |
| **LG .ipk** | 1-2 hrs | ⭐⭐⭐ Alta | ✅ Sí | ✅ Sí |

---

## 🎬 Recomendación

**Para testing rápido:** Usa **Opción 1** (Navegador Web)

**Para producción:**
- Android TV → **Opción 2** (TWA)
- Samsung → **Opción 3A** (.wgt)
- LG → **Opción 3B** (.ipk)

---

## ✅ Checklist antes de probar en TV

- [ ] PostgreSQL corriendo
- [ ] Backend escuchando en `0.0.0.0:4000`
- [ ] TV en la misma red que el PC
- [ ] Firewall permite conexiones en puerto 4000
- [ ] IP del PC obtenida (`ipconfig`)
- [ ] TV app build/servida con URL correcta
- [ ] Iconos creados (si usas TWA/Tizen/webOS)

---

## 📞 Si nada funciona

1. **Verificar conectividad básica:**
   ```bash
   # Desde el PC, hacer ping a la TV
   ping 192.168.1.200
   ```

2. **Probar endpoints desde el navegador del PC:**
   ```
   http://192.168.1.100:4000/api/tv/qr
   ```

3. **Ver logs del backend:**
   ```bash
   cd apps/backend
   npm run dev
   # Ver si llegan requests desde la TV
   ```

4. **Usar ngrok si la red es problemática:**
   ```bash
   ngrok http 4000
   # Usar URL de ngrok en VITE_API_URL
   ```

---

**¿Dudas?** Empieza con Opción 1 (navegador web) para testing rápido.
