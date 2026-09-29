import type { Admin, Archivo, Aviso, AvisoColor, Empleado, Media } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

let token: string | null = null;

export function setToken(t: string | null) {
  token = t;
}

export function getToken(): string | null {
  return token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error ?? "Error en la petición");
  }

  return data as T;
}

export const api = {
  // Auth
  login: (correo: string, password: string) =>
    request<{ token: string; admin: Admin }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ correo, password }),
    }),

  // Archivos (biblioteca)
  listarArchivos: () => request<{ archivos: Archivo[] }>("/api/admin/archivos"),
  subirArchivo: (file: File) => {
    const fd = new FormData();
    fd.append("archivo", file);
    return request<{ archivo: Archivo }>("/api/admin/archivos/upload", {
      method: "POST",
      body: fd,
    });
  },
  eliminarArchivo: (id: string) =>
    request<void>(`/api/admin/archivos/${id}`, { method: "DELETE" }),

  // Media (cola)
  listarMedia: () => request<{ media: Media[] }>("/api/admin/media"),
  crearMedia: (archivoId: string, duracionSegundos?: number | null) =>
    request<{ media: Media }>("/api/admin/media", {
      method: "POST",
      body: JSON.stringify({ archivoId, duracionSegundos: duracionSegundos ?? null }),
    }),
  actualizarMedia: (id: string, data: { orden?: number; activo?: boolean; duracionSegundos?: number | null }) =>
    request<{ media: Media }>(`/api/admin/media/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  eliminarMedia: (id: string) =>
    request<void>(`/api/admin/media/${id}`, { method: "DELETE" }),

  // Avisos
  listarAvisos: () => request<{ avisos: Aviso[] }>("/api/admin/avisos"),
  crearAviso: (data: { texto: string; color: AvisoColor; fechaInicio: string; fechaFin: string; indefinido: boolean; activo: boolean }) =>
    request<{ aviso: Aviso }>("/api/admin/avisos", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  actualizarAviso: (id: string, data: Partial<{ texto: string; color: AvisoColor; fechaInicio: string; fechaFin: string; indefinido: boolean; activo: boolean }>) =>
    request<{ aviso: Aviso }>(`/api/admin/avisos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  eliminarAviso: (id: string) =>
    request<void>(`/api/admin/avisos/${id}`, { method: "DELETE" }),

  // Empleados
  listarEmpleados: () => request<{ empleados: Empleado[] }>("/api/empleados"),
  crearEmpleado: (data: {
    nombre: string;
    apellidos: string;
    numeroEmpleado: string;
    correo?: string;
    puesto?: string;
    horarioEntrada?: string;
    horarioSalida?: string;
  }) => request<{ empleado: Empleado }>("/api/empleados", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  crearCodigoActivacion: (empleadoId: string) =>
    request<{ activacion: { codigo: string; expiraEn: string } }>(`/api/empleados/${empleadoId}/codigo-activacion`, {
      method: "POST",
    }),
};
