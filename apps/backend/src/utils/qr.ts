import { createHmac, timingSafeEqual } from "crypto";
import { env } from "../config/env";

// QR rotativo de 30 s. No se persiste en BD; se genera y valida con HMAC + ventana temporal.
const QR_WINDOW_MS = 30_000;

function windowHex(): string {
  return Math.floor(Date.now() / QR_WINDOW_MS).toString(16);
}

function sign(payload: string): string {
  return createHmac("sha256", env.QR_SECRET).update(payload).digest("hex");
}

export function generateQrToken(): string {
  const payload = windowHex();
  return `${payload}.${sign(payload)}`;
}

export function validateQrToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;

  const windowNow = Math.floor(Date.now() / QR_WINDOW_MS);
  const windowToken = parseInt(payload, 16);

  // Acepta ventana actual y la anterior (gracia para el cambio de ventana)
  if (windowToken !== windowNow && windowToken !== windowNow - 1) return false;

  const expected = sign(payload);
  try {
    return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
