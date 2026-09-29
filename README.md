# Checador — Sistema de asistencia con TV + app móvil

Monorepo del sistema de checador de empleados.

**Estado actual: backend + TV + panel admin con alta de empleados, activación por
código, registro de asistencia con foto obligatoria que alterna ENTRADA/SALIDA, y
avisos con color y permanentes.**

El flujo del sistema es: los empleados escanean un **QR rotativo** que aparece
en una **TV**, lo escanean con su teléfono y confirman su identidad con la
**huella digital** (que nunca sale del teléfono). Al registrarse, la TV muestra
un mensaje de bienvenida. El contenido multimedia y los avisos de la TV se
gestionan desde un **panel de administración**.

## Estructura

```
checador-empresa/
├── apps/
│   ├── backend/            # Node + Express 5 + TypeScript + Prisma 7
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   ├── lib/        # prisma, tv-ws (WebSocket), storage
│   │   │   └── utils/      # jwt, qr, password, ...
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── Dockerfile
│   ├── tv-webapp/          # Pantalla pública para la TV (React + Vite)
│   │   └── src/components/ # MediaPlayer, QrDisplay, AvisosTicker, WelcomeOverlay
│   ├── admin-web/          # Panel de administración (React + Vite + Tailwind)
│   │   └── src/components/ # Login, Layout, MediaModule, AvisosModule, EmpleadosModule
│   └── mobile/             # App móvil (Expo / React Native) — borrador
│       └── src/
│           ├── screens/    # Login, Setup, Home, QRScanner, Success
│           ├── api/        # client.ts (cliente HTTP)
│           ├── storage/    # device.ts (SecureStore)
│           └── utils/      # crypto.ts (HMAC + clave de dispositivo)
├── storage/                # Archivos fuera de la BD (fotos y multimedia)
│   ├── media/              #   contenido multimedia subido desde el admin
│   └── fotos-asistencia/
├── docker-compose.yml      # Postgres (y API opcional)
├── .env                    # variables de entorno (raíz del monorepo)
└── package.json            # workspaces npm
```

## Requisitos

| Herramienta | Versión |
|---|---|
| Node.js | 24 o superior |
| npm | 11 o superior |
| Docker + Compose | v2+ (solo para Postgres) |

> ⚠️ **Windows + PostgreSQL nativo:** si tienes un PostgreSQL instalado en
> Windows, ocupará el puerto 5432 y chocará con el contenedor de Docker. La
> solución es deshabilitar ese servicio (ver `INSTRUCTIVO_DEV.md`, sección de
> problemas frecuentes).

## Primeros pasos (local)

```bash
# 1. Configurar entorno
cp .env.example .env        # editar secretos (JWT_SECRET, QR_SECRET, POSTGRES_PASSWORD)

# 2. Instalar dependencias del workspace
npm install

# 3. Generar el cliente de Prisma (requiere internet)
npm run prisma:generate

# 4. Levantar Postgres (Docker) y aplicar migraciones
docker compose up -d postgres
npm run prisma:migrate

# 5. Crear el primer administrador (y datos de ejemplo)
npm run prisma:seed
```

## Levantar en desarrollo (4 terminales)

```bash
docker compose up -d postgres      # Terminal 1 — Base de datos (:5432)
npm run dev:backend                # Terminal 2 — API (:4000)
npm run dev:tv                     # Terminal 3 — TV (:3000)
npm run dev:admin                  # Terminal 4 — Panel admin (:3001)
```

| Servicio | URL | Descripción |
|---|---|---|
| API | http://localhost:4000 | Backend Express |
| TV | http://localhost:3000 | Pantalla pública (QR + multimedia + avisos) |
| Admin | http://localhost:3001 | Panel de administración |

Credenciales de admin por defecto (del seed): `admin@empresa.com` / `changeme123`.

## Endpoints del backend

### Autenticación
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | No | Login de admin, devuelve JWT |
| GET | `/api/auth/me` | Admin | Datos del admin autenticado |
| POST | `/api/auth/empleado/login` | No | Login de empleado (número + contraseña) |
| GET | `/api/auth/empleado/me` | Empleado | Datos del empleado autenticado |

### Empleados
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/empleados` | Admin | Lista empleados (filtros: `estado`, `busqueda`) |
| GET | `/api/empleados/:id` | Admin | Detalle de un empleado |
| POST | `/api/empleados` | Admin | Crea un empleado |
| POST | `/api/empleados/:id/codigo-activacion` | Admin | Genera el QR temporal para vincular el teléfono |
| PUT | `/api/empleados/:id` | Admin | Actualiza datos |
| PATCH | `/api/empleados/:id/estado` | Admin | Cambia estado (ACTIVO/INACTIVO/BAJA) |

### Dispositivos y check-in
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/dispositivos/activar` | Código de un solo uso | Vincula el teléfono al empleado del código |
| POST | `/api/asistencias/challenge` | Dispositivo | Inicia el challenge tras escanear el QR rotativo de la TV |
| POST | `/api/asistencias/` | Firma + foto | Guarda la foto y registra la asistencia del empleado vinculado |
| GET | `/api/asistencias/qr` | Admin | Obtiene el QR actual |

### TV (público, sin auth)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/tv/qr` | QR actual (`qrToken` + `expiresInMs`) |
| GET | `/api/tv/media` | Multimedia activa de la cola |
| GET | `/api/tv/avisos` | Avisos activos (vigentes o permanentes) |
| WS | `/api/tv/ws` | WebSocket de eventos de check-in |

Eventos del WebSocket: `asistencia:success` (incluye `tipo` ENTRADA/SALIDA) y `asistencia:error`.

### Admin (requiere auth de admin)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/admin/archivos/upload` | Sube un archivo multimedia (multipart, campo `archivo`) |
| GET | `/api/admin/archivos` | Lista la biblioteca de archivos |
| DELETE | `/api/admin/archivos/:id` | Borra archivo (y sus usos en cola) |
| GET | `/api/admin/media` | Lista la cola de reproducción |
| POST | `/api/admin/media` | Agrega un elemento a la cola (`archivoId`, `orden`, `duracionSegundos`) |
| PUT | `/api/admin/media/:id` | Actualiza orden / activo / duración |
| DELETE | `/api/admin/media/:id` | Quita un elemento de la cola |
| GET | `/api/admin/avisos` | Lista avisos |
| POST | `/api/admin/avisos` | Crea aviso (`texto`, `color`, `fechaInicio`, `fechaFin`, `indefinido`, `activo`) |
| PUT | `/api/admin/avisos/:id` | Actualiza aviso |
| DELETE | `/api/admin/avisos/:id` | Borra aviso |

**Subida de archivos:** máximo **10 MB**. Formatos permitidos: JPEG, PNG, GIF,
WEBP, SVG (imágenes) y MP4, WEBM, MOV (videos).

Las rutas de admin y el CRUD de empleados requieren `Authorization: Bearer <token>`.
La activación de dispositivos se autoriza con el código de activación (no requiere
token JWT del empleado). La asistencia alterna automáticamente entre ENTRADA y
SALIDA: cada escaneo invierte el estado anterior. La foto es obligatoria
(`multipart/form-data`, campo `foto`) y se verifica junto con la firma del challenge.

## Modelo de datos (resumen)

- `Empleado` (nombre y apellidos), `Dispositivo`, `CodigoActivacion`, `Asistencia`, `Aviso`, `Admin`, `Log`.
- `Archivo` — biblioteca de archivos multimedia subidos (se guardan una vez y
  se reutilizan).
- `Media` — elemento de la cola de reproducción de la TV; referencia un `Archivo`
  y define `orden`, `duracionSegundos` y `activo`.

## Decisiones de diseño relevantes

- **La huella nunca sale del teléfono.** El modelo `Dispositivo` solo guarda la
  llave pública que el celular genera (esquema tipo passkey). La huella solo
  desbloquea la llave privada dentro del teléfono para firmar el challenge.
- **`Asistencia` está unificada** (no hay tablas separadas de Entradas/Salidas),
  con un campo `tipo`. El `timestamp` lo genera el servidor. Cada escaneo del QR
  **alterna** ENTRADA↔SALIDA según el último registro del empleado.
- **Los avisos tienen color** (rojo, amarillo, verde o negro) y pueden ser
  **permanentes** (`indefinido`) para recordatorios que no expiran.
- **Baja de empleado = baja lógica.** No existe `DELETE` físico; se usa
  `PATCH /empleados/:id/estado`.
- **El QR de asistencia (rotativo, 30s) no se guarda en base de datos.** Se
  genera y valida como token firmado (HMAC + ventana temporal).
- **Storage en disco**, no en la BD ni en un bucket externo: `storage/` guarda
  archivos multimedia y fotos de asistencia; en Postgres solo se guarda la ruta relativa de la foto.
- **Biblioteca vs cola:** los archivos se suben a la biblioteca una sola vez y
  se reutilizan en la cola de reproducción. Borrar un archivo de la biblioteca
  lo quita de todas las colas donde esté.

## Sobre Prisma 7

Este proyecto usa Prisma 7, que cambió la configuración respecto a versiones
anteriores:

- **La URL de conexión vive en `apps/backend/prisma.config.ts`**, que lee
  `DATABASE_URL` del entorno (no en `schema.prisma`).
- **`PrismaClient` requiere un driver adapter** (`@prisma/adapter-pg` + `pg`),
  configurado en `src/lib/prisma.ts` y en `prisma/seed.ts`.
- **`prisma.config.ts` usa `process.env.DATABASE_URL` directo**, no el helper
  `env()`, para no romper el build de Docker en la etapa de `prisma generate`.

## Próximos pasos

1. **Completar la app móvil:** ya existe un borrador en `apps/mobile` (Expo) con
   login, escaneo de QR, setup de dispositivo y firma HMAC. Falta validar la
   integración end-to-end con el backend y el flujo real de biometría
   (`expo-local-authentication`).
2. **Endurecimiento:** HTTPS/dominio en producción, respaldos de Postgres,
   logs estructurados, pruebas automatizadas.
