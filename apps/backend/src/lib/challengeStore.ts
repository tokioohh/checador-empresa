import { randomBytes, randomUUID } from "crypto";

type Entry = { challenge: string; dispositivoId: string; expiresAt: number };

const store = new Map<string, Entry>();
const TTL_MS = 5 * 60 * 1000; // 5 minutos

// Limpia entradas vencidas cada vez que se crea una nueva (lazy GC)
function gc() {
  const now = Date.now();
  for (const [id, e] of store) {
    if (e.expiresAt < now) store.delete(id);
  }
}

export function createChallenge(dispositivoId: string) {
  gc();
  const challengeId = randomUUID();
  const challenge = randomBytes(32).toString("hex");
  store.set(challengeId, { challenge, dispositivoId, expiresAt: Date.now() + TTL_MS });
  return { challengeId, challenge };
}

export function consumeChallenge(challengeId: string, dispositivoId: string): string | null {
  const entry = store.get(challengeId);
  if (!entry) return null;
  store.delete(challengeId);
  if (entry.expiresAt < Date.now()) return null;
  if (entry.dispositivoId !== dispositivoId) return null;
  return entry.challenge;
}
