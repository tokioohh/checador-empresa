# Checador — Sistema de asistencia con TV + app móvil

Monorepo del sistema de checador de empleados. Estado actual: **Fase 1 (Base)**
— Docker Compose con Postgres, y API con autenticación de admin + CRUD de
empleados. Las demás apps del monorepo (`admin-web`, `tv-webapp`, `mobile`)
todavía no existen; se agregan en las siguientes fases.

## Estructura

```
checador-empresa/
├── apps/
│   └── backend/          # Node + Express + TypeScript + Prisma
│       ├── src/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts
│       └── Dockerfile
├── storage/               # Fotos de asistencia y multimedia (fuera de la BD)
│   ├── fotos-asistencia/
│   └── media/
├── docker-compose.yml
├── .env.example
└── package.json           # workspaces npm
```

## Primeros pasos (en el VPS o en local con Docker)

1. Copiar `.env.example` a `.env` y reemplazar los valores `changeme_*` por
   secretos reales (`JWT_SECRET`, `QR_SECRET`, contraseña de Postgres).

2. Instalar dependencias del workspace:
   ```bash
   npm install
   ```

3. **Generar el cliente de Prisma.**
   ```bash
   npm run prisma:generate
   ```
   Este paso necesita descargar el motor de Prisma desde `binaries.prisma.sh`,
   así que requiere una máquina con acceso normal a internet (tu VPS lo
   tiene; el sandbox donde se escribió este proyecto no, por eso ese comando
   no se corrió ahí — se validó todo lo demás con un stub de tipos temporal
   en su lugar).

4. Levantar Postgres (vía Docker) y aplicar las migraciones:
   ```bash
   docker compose up -d postgres
   cd apps/backend
   npx prisma migrate dev --name init
   ```

5. Crear el primer administrador (usa `ADMIN_SEED_EMAIL` /
   `ADMIN_SEED_PASSWORD` del `.env`, o los valores por defecto del ejemplo):
   ```bash
   npm run prisma:seed
   ```

6. Levantar la API en desarrollo:
   ```bash
   npm run dev:backend
   ```
   o, para correr todo en Docker (Postgres + API):
   ```bash
   docker compose up -d
   ```

## Endpoints disponibles (Fase 1)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/health` | No | Verifica que la API responde |
| POST | `/api/auth/login` | No | Login de admin, devuelve JWT |
| GET | `/api/auth/me` | Sí | Datos del admin autenticado |
| GET | `/api/empleados` | Sí | Lista empleados (filtros: `estado`, `busqueda`) |
| GET | `/api/empleados/:id` | Sí | Detalle de un empleado |
| POST | `/api/empleados` | Sí | Crea un empleado |
| PUT | `/api/empleados/:id` | Sí | Actualiza datos de un empleado |
| PATCH | `/api/empleados/:id/estado` | Sí | Cambia estado (ACTIVO/INACTIVO/BAJA) — baja lógica, nunca se borra |

Rutas con "Auth: Sí" requieren header `Authorization: Bearer <token>`.

## Sobre Prisma 7: `prisma.config.ts` y driver adapters

Este proyecto usa Prisma 7, que cambió cómo se configura la conexión a la
base de datos respecto a versiones anteriores:

- **La URL de conexión ya no va en `schema.prisma`.** Vive en
  `apps/backend/prisma.config.ts`, que lee `DATABASE_URL` del entorno.
- **`PrismaClient` ahora requiere un driver adapter explícito** (antes era
  opcional). Para Postgres usamos `@prisma/adapter-pg` + `pg`, configurado
  en `src/lib/prisma.ts` y en `prisma/seed.ts`.
- **`prisma.config.ts` usa `process.env.DATABASE_URL` directo, no el helper
  `env()`** de `prisma/config`. Ese helper lanza un error si la variable no
  existe, incluso para `prisma generate` (que no se conecta a la BD, solo
  lee el schema) — y eso rompería el build de Docker, donde `DATABASE_URL`
  todavía no está disponible en la etapa de `npx prisma generate`.

Si en el futuro cambias de proveedor de base de datos o agregas Accelerate,
ambos archivos (`prisma.config.ts` y `src/lib/prisma.ts`) necesitan
actualizarse juntos.

## Decisiones de diseño relevantes

- **La huella nunca sale del teléfono.** El modelo `Dispositivo` solo guarda
  la llave pública que el celular genera (esquema tipo passkey).
- **`Asistencia` está unificada** (no hay tablas separadas de Entradas/Salidas),
  con un campo `tipo`. El `timestamp` lo genera el servidor, nunca el celular.
- **Baja de empleado = baja lógica.** `DELETE` físico no existe; se usa
  `PATCH /empleados/:id/estado` con `estado: "BAJA"` para no perder el
  historial de asistencias.
- **El QR de asistencia (rotativo, 30s) no se guarda en base de datos.**
  Se genera y valida como un token firmado (HMAC + expiración embebida)
  desde el backend — se implementa en la Fase 2 (check-in).
- **Storage en disco**, no en la base de datos ni en un bucket externo:
  la carpeta `storage/` en la raíz guarda fotos y multimedia; en Postgres
  solo se guarda la ruta relativa.

## Próximas fases

2. **Check-in:** registro de dispositivo (vinculación vía código de
   activación), endpoint de asistencia con validación de QR + firma,
   generación de foto.
3. **TV:** webapp (React + Vite) con WebSocket para el mensaje de bienvenida,
   manejo de errores en pantalla, reproductor de contenido y ticker de avisos;
   luego empaquetada en un wrapper Android (WebView) para el Android TV box.
4. **Panel admin:** interfaz (React + Vite + Tailwind) para los CRUD de
   avisos y multimedia, generación del QR de activación, y consulta de
   asistencias con fotos.
5. **Endurecimiento:** HTTPS/dominio en producción, respaldos de Postgres,
   logs estructurados, pruebas automatizadas.
