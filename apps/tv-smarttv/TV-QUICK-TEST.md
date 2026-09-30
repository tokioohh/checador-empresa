# 📺 Test Rápido en TV - 5 Minutos

## Pre-requisitos

✅ PostgreSQL corriendo (`docker ps | grep postgres`)  
✅ PC y TV en la **misma red Wi-Fi**

---

## 🚀 Paso 1: Iniciar servicios

**Desde la raíz del proyecto:**

```bash
start-tv-network.bat
```

Esto abrirá 2 ventanas y te mostrará tu IP local.

**Ejemplo de salida:**
```
✓ Tu IP local: 192.168.1.65

Backend:  http://192.168.1.65:4000
TV App:   http://192.168.1.65:3000
```

---

## 📱 Paso 2: Abrir en la TV

### Samsung Smart TV

1. Presiona **Smart Hub** (botón home)
2. Busca **Internet** o **Web Browser**
3. En la barra de URL:
   ```
   http://192.168.1.65:3000
   ```
   *(Usa tu IP real)*

4. Presiona Enter
5. La app se cargará en fullscreen

---

### LG Smart TV

1. Presiona **Home**
2. Abre **Web Browser**
3. Ingresa:
   ```
   http://192.168.1.65:3000
   ```

---

### Android TV

1. Abre **Chrome** o instálalo desde Play Store
2. Navega a:
   ```
   http://192.168.1.65:3000
   ```

---

## ✅ Deberías ver:

- ✅ Ticker de avisos (parte superior)
- ✅ QR grande (280x280px, panel derecho)
- ✅ Multimedia o placeholder (izquierda)
- ✅ Card "¿Cómo funciona?" (derecha)
- ✅ Layout 1920x1080

---

## 🧪 Probar funcionalidad:

1. **Escanea el QR** con tu app móvil
2. **Registra asistencia** con huella
3. **Verifica** que aparece overlay de bienvenida en la TV

---

## 🐛 Problemas Comunes

### Error: "Refused to connect"

**Causa:** Firewall bloqueando puerto 4000

**Solución:**
```bash
# Windows: Permitir temporalmente
netsh advfirewall set allprofiles state off

# O agregar regla específica:
netsh advfirewall firewall add rule name="Backend Port 4000" dir=in action=allow protocol=TCP localport=4000
```

---

### QR no carga (dice "Cargando QR...")

**Verificar backend:**
```bash
curl http://192.168.1.65:4000/api/tv/qr
```

Debe responder:
```json
{"qrToken":"...","expiresInMs":...}
```

**Si falla:**
1. Ver logs del backend (ventana "Backend API - Network")
2. Verificar que backend muestra: "API escuchando en http://0.0.0.0:4000"
3. Ping desde otro dispositivo: `ping 192.168.1.65`

---

### La TV no puede acceder

**Verificar red:**
1. PC y TV en **misma red** (mismo router/SSID)
2. Red no es "guest" o aislada
3. Router permite comunicación entre dispositivos

**Test:**
```bash
# Desde el PC
arp -a
# Buscar IP de la TV en la lista
```

---

### Overlay de bienvenida no aparece

**Causa:** WebSocket no conecta

**Verificar:**
1. Backend logs muestran: "WebSocket upgrade"
2. Firewall permite conexiones WS
3. La TV soporta WebSocket (la mayoría sí)

**Test manual:**
```bash
curl -X POST http://192.168.1.65:4000/api/tv/test-broadcast
```

El overlay debería aparecer en la TV inmediatamente.

---

## 💡 Tips

### Mantener IP fija

**Router:** Asigna IP estática al PC en configuración DHCP

**Windows (IP estática):**
1. Panel de Control → Network and Sharing Center
2. Change adapter settings
3. Propiedades de tu adaptador → IPv4
4. Usar IP fija (ej: 192.168.1.65)

---

### Recargar en la TV

**Samsung/LG:**
- Salir del navegador y volver a entrar
- O usar botón "Refresh" si tiene

**Android TV:**
- Ctrl+R (si tienes teclado)
- O reabrir Chrome

---

### Ver logs en TV

La mayoría de navegadores TV no tienen DevTools.

**Alternativa:** Ver logs en el backend
```bash
# Logs del backend muestran requests
# Ventana "Backend API - Network"
```

---

## 🎯 Siguiente Paso

Una vez que funciona en el navegador, puedes:

1. **Android TV:** Crear APK con TWA (ver `TEST-ON-TV.md`)
2. **Samsung:** Empaquetar como .wgt (ver `TEST-ON-TV.md`)
3. **LG:** Empaquetar como .ipk (ver `TEST-ON-TV.md`)

Para instalación permanente, sigue la guía completa en `TEST-ON-TV.md`

---

## ⏱️ Tiempo Total

- Iniciar servicios: **1 min**
- Abrir en TV: **2 min**
- Probar funcionalidad: **2 min**

**Total: ~5 minutos** ✨
