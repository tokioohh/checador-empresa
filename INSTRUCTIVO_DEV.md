# Instructivo: correr el proyecto en dev

Estado actual: **Fases 1–4** — backend (`apps/backend`), TV (`apps/tv-webapp`) y
panel de administración (`apps/admin-web`). La app móvil (`apps/mobile`, Expo /
React Native) ya tiene un borrador con login, escaneo QR, setup de dispositivo
y firma HMAC; queda completar su integración end-to-end.

---

## 1. Requisitos

| Herramienta | Versión | Notas |
|---|---|---|
| Node.js | 24 o superior | probado con `v24` |
| npm | 11 o superior | usa workspaces |
| Docker + Compose | v2+ | solo para Postgres |

Verificar:

```bash
node -v
npm -v
docker compose version
```

---

## 2. Preparación (una sola vez)

### 2.1 Variables de entorno

```bash
cp .env.example .env
```

Reemplazar los `changeme_*` de `.env` por secretos reales. Como mínimo
`JWT_SECRET` y `QR_SECRET` (cadenas largas y aleatorias) y `POSTGRES_PASSWORD`.
La contraseña de Postgres debe coincidir con la que está en `DATABASE_URL`:

```
POSTGRES_PASSWORD=changeme
DATABASE_URL=postgresql://checador:changeme@localhost:5432/checador_db
```

En dev `DATABASE_URL` apunta a `localhost:5432` porque Postgres publica ese
puerto desde el contenedor. Dentro de docker-compose la URL se reescribe sola
al host `postgres`.

> **Nota sobre `STORAGE_PATH`:** en dev local debe apuntar a `./storage` (la
> carpeta de la raíz del monorepo). Dentro del contenedor docker-compose lo
> sobreescribe a `/app/storage`. El backend resuelve la ruta automáticamente.

Generar secretos:

```bash
openssl rand -hex 32
```

### 2.2 Dependencias y cliente de Prisma

```bash
npm install
npm run prisma:generate
```

`prisma:generate` descarga el motor de Prisma, así que requiere internet.
No hace falta que la base de datos esté levantada.

---

## 3. Levantar Postgres

```bash
docker compose up -d postgres
```

Esperar a que esté healthy:

```bash
docker compose ps
```

`postgres` debe figurar como `healthy` (tarda ~10 s).

El volumen `postgres_data` persiste los datos entre reinicios; `down -v` lo
borra.

### ⚠️ Conflicto con un PostgreSQL nativo de Windows

Si en Windows hay un PostgreSQL instalado (servicio `postgresql-x64-XX`),
ocupará el puerto 5432 y chocará con el contenedor de Docker. El síntoma es un
`P1000` / `password authentication failed` al correr Prisma, porque la conexión
termina en el Postgres nativo y no en el contenedor.

Para deshabilitarlo (desde PowerShell como **administrador**):

```powershell
Stop-Service postgresql-x64-18 -Force
Set-Service postgresql-x64-18 -StartupType Disabled
```

`Disabled` evita que arranque al encender la máquina. Para revertirlo:

```powershell
Set-Service postgresql-x64-18 -StartupType Manual
```

### Alternativa sin Docker

Con un Postgres local escuchando en el 5432, se ajustan `POSTGRES_USER`,
`POSTGRES_PASSWORD` y `POSTGRES_DB` del `.env`. En Ubuntu/Debian:

```bash
sudo apt install postgresql
sudo systemctl start postgresql
sudo -u postgres psql -c "CREATE ROLE checador LOGIN PASSWORD 'changeme';"
sudo -u postgres psql -c "CREATE DATABASE checador_db OWNER checador;"
```

---

## 4. Migraciones y datos iniciales

```bash
npm run prisma:migrate
npm run prisma:seed
```

- `prisma:migrate` aplica las migraciones pendientes y regenera el cliente.
- `prisma:seed` crea el admin inicial, un empleado de prueba y un código de
  activación. Es idempotente.

Explorar la base en GUI (opcional):

```bash
cd apps/backend && npx prisma studio
```

---

## 5. Levantar los servicios

Necesitas **4 terminales**:

```bash
# Terminal 1 — Base de datos
docker compose up -d postgres

# Terminal 2 — API
npm run dev:backend

# Terminal 3 — TV (pantalla pública)
npm run dev:tv

# Terminal 4 — Panel admin
npm run dev:admin
```

| Servicio | URL |
|---|---|
| API | http://localhost:4000 |
| TV | http://localhost:3000 |
| Admin | http://localhost:3001 |

Comprobar la API:

```bash
curl http://localhost:4000/api/health
```

Prueba de login del admin:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"correo":"admin@empresa.com","password":"changeme123"}'
```

---

## 5.1 App móvil (Expo / React Native) — borrador

La app móvil está en `apps/mobile` (Expo SDK 52). Para levantarla:

```bash
cd apps/mobile
npx expo start
```

Luego escanear el QR con Expo Go (Android/iOS) o presionar `a`/`i` para
emuladores. Configura la URL del backend en `apps/mobile/app.json`
(`expo.extra.apiUrl`), por defecto `http://localhost:4000`.

Pantallas existentes: `Login`, `Setup` (activación de dispositivo), `Home`,
`QRScanner` y `Success`. La firma del challenge usa HMAC-SHA256 con una clave
guardada en SecureStore (ver `src/utils/crypto.ts` y `src/storage/device.ts`).

> **Nota:** este borrador no ha sido validado end-to-end contra el backend.

---

## 6. Resumen: arranque en cold start

```bash
cp .env.example .env          # solo la primera vez, y editar secretos
npm install
npm run prisma:generate
docker compose up -d postgres
npm run prisma:migrate
npm run prisma:seed
npm run dev:backend           # terminal 2
npm run dev:tv                # terminal 3
npm run dev:admin             # terminal 4
```

Sesiones siguientes (con la BD ya migrada y sembrada):

```bash
docker compose up -d postgres
npm run dev:backend
npm run dev:tv
npm run dev:admin
```

---

## 7. Comandos útiles

Todos se corren desde la raíz del monorepo.

| Comando | Qué hace |
|---|---|
| `npm run dev:backend` | API en watch |
| `npm run dev:tv` | TV webapp (Vite, HMR) |
| `npm run dev:admin` | Panel admin (Vite, HMR) |
| `npm run build:backend` | compila TypeScript a `apps/backend/dist` |
| `npm run build:tv` | build de producción de la TV |
| `npm run build:admin` | build de producción del admin |
| `npm run start:backend` | corre el build (sin watch) |
| `npm run prisma:generate` | regenera el cliente de Prisma |
| `npm run prisma:migrate` | aplica/crea migraciones |
| `npm run prisma:seed` | crea el admin inicial |
| `npm test -w apps/backend` | corre los tests (Vitest) |
| `npm run test:watch -w apps/backend` | tests en watch |
| `docker compose logs -f api` | log del contenedor de la API |
| `docker compose down` | para los contenedores (conserva datos) |
| `docker compose down -v` | para los contenedores y **borra** la base |

---

## 8. Tests

```bash
npm test -w apps/backend
```

No necesitan base de datos: `apps/backend/src/__tests__/setup.ts` inyecta
`DATABASE_URL`, `JWT_SECRET` y `QR_SECRET` de prueba antes de que se cargue la
config.

---

## 9. Problemas frecuentes

**`❌ Variables de entorno inválidas o faltantes` al arrancar**
Falta `.env` en la raíz, o le faltan `DATABASE_URL`, `JWT_SECRET` o `QR_SECRET`.

**`Can't reach database server at localhost:5432`**
Postgres no está corriendo: `docker compose up -d postgres` y esperar a que
esté `healthy`.

**`P1000` / `password authentication failed`**
O bien la contraseña de `DATABASE_URL` no coincide con `POSTGRES_PASSWORD`, o
hay un PostgreSQL nativo de Windows ocupando el puerto 5432 (ver sección 3).
Para el caso del volumen: `docker compose down -v` y volver a migrar y sembrar.

**`Environment variable not found: DATABASE_URL` en `prisma generate`**
No debería ocurrir: `apps/backend/prisma.config.ts` tiene un valor de respaldo.

**El puerto 4000/3000/3001 ya está en uso**
`PORT=4100 npm run dev:backend`, o liberar el puerto.

**`STORAGE_PATH` no se encuentra (404 al servir archivos)**
En dev debe ser `./storage` (relativo a la raíz). El backend busca en cwd y
luego en la raíz del monorepo automáticamente. Verifica que exista
`storage/media/`.

---

## 10. Notas de arquitectura

### TV ↔ Backend (tiempo real)

La TV obtiene QR/media/avisos por **polling** (`/api/tv/*`) y recibe los
eventos de check-in por **WebSocket** (`/api/tv/ws`). El backend emite
`asistencia:success` y `asistencia:error` al finalizar `registrarAsistencia`.

### Biblioteca vs cola (multimedia)

- `Archivo` = archivo subido a la biblioteca (se guarda en disco + BD, una vez).
- `Media` = elemento de la cola de reproducción; referencia un `Archivo`.

El panel admin sube archivos a la biblioteca y arma la cola reutilizándolos.
La TV consume `/api/tv/media` (solo elementos `activo`, ordenados por `orden`).

### Subida de archivos

- Máximo **10 MB** por archivo.
- Formatos: JPEG, PNG, GIF, WEBP, SVG (imagen) y MP4, WEBM, MOV (video).
- Se guardan en `storage/media/` con nombre UUID; el nombre original queda en BD.
