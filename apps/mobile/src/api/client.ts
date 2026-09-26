import Constants from "expo-constants";

const BASE_URL: string =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  "http://localhost:4000";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new ApiError(json.error ?? "Error desconocido", res.status);
  }

  return json as T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = {
  get: <T>(path: string, token?: string) =>
    request<T>("GET", path, undefined, token),

  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>("POST", path, body, token),
};

// --- Tipos de respuesta del backend ---

export interface LoginEmpleadoResponse {
  token: string;
  empleado: {
    id: string;
    nombre: string;
    numeroEmpleado: string;
    puesto: string | null;
    estado: string;
    dispositivoRegistrado: boolean;
    dispositivoId: string | null;
  };
}

export interface ActivarDispositivoResponse {
  dispositivo: {
    id: string;
    plataforma: string;
    estado: string;
    fechaRegistro: string;
  };
}

export interface ChallengeResponse {
  challengeId: string;
  challenge: string;
}

export interface AsistenciaResponse {
  asistencia: {
    id: string;
    tipo: string;
    timestamp: string;
    puntualidad: string | null;
    empleado: { nombre: string; puesto: string | null };
  };
}
