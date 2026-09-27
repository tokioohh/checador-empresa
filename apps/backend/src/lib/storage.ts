import path from "path";
import fs from "fs";
import { env } from "../config/env";

// Resuelve la ruta del storage desde cwd (apps/backend en dev) o desde la
// raíz del monorepo (dos niveles arriba de src/).
export function resolveStoragePath(raw: string): string {
  const fromCwd = path.resolve(raw);
  if (fs.existsSync(fromCwd)) return fromCwd;
  const fromRoot = path.resolve(__dirname, "../../..", raw);
  if (fs.existsSync(fromRoot)) return fromRoot;
  return fromCwd;
}

export function mediaDir(): string {
  const dir = path.join(resolveStoragePath(env.STORAGE_PATH), "media");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}
