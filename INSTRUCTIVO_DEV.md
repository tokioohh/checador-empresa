# Instructivo: correr el proyecto en dev

Estado actual: **Fase 1** — solo existe `apps/backend` (API Node + Express +
TypeScript + Prisma). No hay frontend todavía.

---

## 1. Requisitos

| Herramienta | Versión | Notas |
|---|---|---|
| Node.js | 24 o superior | probado con `v26` |
| npm | 11 o superior | usa workspaces |
| Docker + Compose | v2+ | solo para Postgres |

Verificar:

```bash
node -v
npm -v
docker compose version
```

Si `docker ps` devuelve `permission denied` sobre `/var/run/docker.sock`, tu
usuario no está en el grupo `docker`. Alternativas: agregarte al grupo
(`sudo usermod -aG docker $USER` y volver a iniciar sesión) o correr Postgres de
forma local (ver sección 3).

---

## 2. Preparación (una sola vez)

### 2.1 Variables de entorno

```bash
cp .env.example .env
```

Luego reemplazar los `changeme_*` de `.env` por secretos reales. Como mínimo
`JWT_SECRET` y `QR_SECRET` (cadenas largas y aleatorias) y
`POSTGRES_PASSWORD`. La contraseña de Postgres debe coincidir con la que está
en `DATABASE_URL`:

```
POSTGRES_PASSWORD=changeme
DATABASE_URL=postgresql://checador:changeme@localhost:5432/checador_db
```

En dev `DATABASE_URL` apunta a `localhost:5432` porque Postgres publica ese
puerto desde el contenedor. Dentro de docker-compose la URL se reescribe sola
al host `postgres`.

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

`postgres` debe figurar como `healthy` (tarda ~10 s). Para ver el log:

```bash
docker compose logs -f postgres
```

El volumen `postgres_data` persiste los datos entre reinicios; `down -v` lo
borra.

### Alternativa sin Docker

Con un Postgres local escuchando en el 5432, se salta este paso y se ajustan
`POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB` del `.env` (más el
`DATABASE_URL` correspondiente). Para crearlo en Ubuntu/Debian:

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
```

Usa `prisma migrate dev`, que aplica las migraciones pendientes y regenera el
cliente. La migración inicial (`init`) ya está en
`apps/backend/prisma/migrations/`, así que esto solo debe confirmar que la base
está al día. Si pregunta por un nombre, es porque detectó cambios en
`schema.prisma`.

Crear el primer administrador (usa `ADMIN_SEED_EMAIL` /
`ADMIN_SEED_PASSWORD` del `.env`):

```bash
npm run prisma:seed
```

Es idempotente: si el correo ya existe, no lo duplica.

Explorar la base en GUI, opcional:

```bash
cd apps/backend && npx prisma studio
```

---

## 5. Levantar la API

```bash
npm run dev:backend
```

Corre `tsx watch src/index.ts`: recarga automática al guardar. Imprime
`API escuchando en http://localhost:4000`.

Cambiar de puerto sin tocar `.env`:

```bash
PORT=4100 npm run dev:backend
```

Comprobar que responde:

```bash
curl http://localhost:4000/api/health
```

Prueba de login y de un endpoint protegido:

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"correo":"admin@empresa.com","password":"changeme123"}' \
  | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

curl http://localhost:4000/api/auth/me -H "Authorization: Bearer $TOKEN"
curl http://localhost:4000/api/empleados -H "Authorization: Bearer $TOKEN"
```

---

## 6. Resumen: arranque en cold start

```bash
cp .env.example .env          # solo la primera vez, y editar secretos
npm install
npm run prisma:generate
docker compose up -d postgres
npm run prisma:migrate
npm run prisma:seed
npm run dev:backend
```

Arranque en sesiones siguientes (con la BD ya migrada y sembrada):

```bash
docker compose up -d postgres
npm run dev:backend
```

---

## 7. Comandos útiles

Todos se corren desde la raíz del monorepo.

| Comando | Qué hace |
|---|---|
| `npm run dev:backend` | API en watch |
| `npm run build:backend` | compila TypeScript a `apps/backend/dist` |
| `npm run start:backend` | corre el build (sin watch) |
| `npm run prisma:generate` | regenera el cliente de Prisma |
| `npm run prisma:migrate` | aplica/crea migraciones |
| `npm run prisma:seed` | crea el admin inicial |
| `npm test -w apps/backend` | corre los tests (Vitest) |
| `npm run test:watch -w apps/backend` | tests en watch |
| `docker compose logs -f api` | log del contenedor de la API |
| `docker compose down` | para los contenedores (conserva datos) |
| `docker compose down -v` | para los contenedores y **borra** la base |
| `docker compose up -d --build` | corre todo en Docker (Postgres + API) |

La alternativa "todo en Docker" sirve para probar el entorno de producción
(`node dist/index.js`, sin hot reload), no para iterar código: el código no se
monta como volumen, hay que reconstruir la imagen en cada cambio.

---

## 8. Tests

```bash
npm test -w apps/backend
```

No necesitan base de datos: `apps/backend/src/__tests__/setup.ts` inyecta
`DATABASE_URL`, `JWT_SECRET` y `QR_SECRET` de prueba antes de que se cargue la
config, así que el `.env` no se toca.

---

## 9. Problemas frecuentes

**`❌ Variables de entorno inválidas o faltantes` al arrancar**
Falta `.env` en la raíz, o le faltan `DATABASE_URL`, `JWT_SECRET` o
`QR_SECRET`. La config busca `.env` en el cwd y en `../../.env`, así que hay
que correr los scripts desde la raíz (o desde `apps/backend`), no desde otro
directorio.

**`Can't reach database server at localhost:5432`**
Postgres no está corriendo: `docker compose up -d postgres` y esperar a que
esté `healthy`.

**`error: P1001` / `password authentication failed`**
La contraseña de `DATABASE_URL` no coincide con `POSTGRES_PASSWORD`. Si ya
había un volumen con otra contraseña, hay que borrarlo: `docker compose down -v`
y volver a aplicar migraciones y seed.

**`Environment variable not found: DATABASE_URL` en `prisma generate`**
No debería ocurrir: `apps/backend/prisma.config.ts` tiene un valor de respaldo
preciso justamente para que `generate` funcione sin la variable. Si aparece,
es que se modificó ese archivo.

**Error de permisos de Prisma al escribir en `node_modules`**
`prisma generate` no pudo escribir el cliente. Revisar permisos de
`node_modules` o reinstallar con `npm install`.

**El puerto 4000 ya está en uso**
`PORT=4100 npm run dev:backend`, o liberar el puerto: `lsof -i :4000`.

**`STORAGE_PATH=/app/storage` no existe en la máquina**
Ese valor es el de dentro del contenedor. En dev, si alguna functionality
empieza a escribir archivos, sobreescribirlo con la ruta local:
`STORAGE_PATH=./storage npm run dev:backend`. En la Fase 1 el backend todavía
no escribe archivos, así que no molesta.
