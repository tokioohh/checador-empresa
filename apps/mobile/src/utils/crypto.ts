import * as ExpoCrypto from "expo-crypto";

// Genera una clave aleatoria de 32 bytes en hex para usar como "public key" del dispositivo.
// En producción esto sería una clave privada generada en el TEE/Secure Enclave;
// aquí usamos HMAC-SHA256 para simular el flujo sin módulos nativos adicionales.
export async function generateDeviceKey(): Promise<string> {
  const bytes = await ExpoCrypto.getRandomBytesAsync(32);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Firma el challenge con HMAC-SHA256 usando la clave del dispositivo.
// La biometría se solicita ANTES de llamar esta función; aquí sólo se hace el cómputo.
export async function signChallenge(challenge: string, deviceKey: string): Promise<string> {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(deviceKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(challenge)
  );

  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
