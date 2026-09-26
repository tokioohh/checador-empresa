# Este Dockerfile se construye con contexto en la RAÍZ del monorepo
# (ver docker-compose.yml: build.context = "." , dockerfile = apps/backend/Dockerfile).
# Es necesario porque npm workspaces hoistea las dependencias compartidas al
# node_modules de la raíz, no al de apps/backend.

# --- Etapa de build ---
FROM node:24-slim AS build
WORKDIR /repo

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
RUN npm install --workspace apps/backend

COPY apps/backend apps/backend
WORKDIR /repo/apps/backend
RUN npx prisma generate
RUN npm run build

# --- Etapa final (imagen liviana, sin devDependencies ni fuente TS) ---
FROM node:24-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=build /repo/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /repo/apps/backend/prisma.config.ts ./apps/backend/prisma.config.ts
COPY --from=build /repo/apps/backend/dist ./apps/backend/dist
COPY --from=build /repo/apps/backend/prisma ./apps/backend/prisma

WORKDIR /app/apps/backend

EXPOSE 4000

CMD ["node", "dist/index.js"]
