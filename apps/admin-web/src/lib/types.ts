export type Archivo = {
  id: string;
  nombreOriginal: string;
  archivoUrl: string;
  tipo: "IMAGEN" | "VIDEO";
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  _count?: { media: number };
};

export type Media = {
  id: string;
  archivoId: string;
  archivo: Archivo;
  duracionSegundos: number | null;
  orden: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AvisoColor = "rojo" | "amarillo" | "verde" | "negro";

export type Aviso = {
  id: string;
  texto: string;
  color: AvisoColor;
  fechaInicio: string;
  fechaFin: string;
  indefinido: boolean;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Empleado = {
  id: string;
  nombre: string;
  apellidos: string;
  numeroEmpleado: string;
  correo: string | null;
  puesto: string | null;
  horarioEntrada: string | null;
  horarioSalida: string | null;
  estado: "ACTIVO" | "INACTIVO" | "BAJA";
  estadoAsistencia?: "ACTIVO" | "INACTIVO";
  ultimaAsistencia?: { tipo: "ENTRADA" | "SALIDA"; timestamp: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type Admin = {
  id: string;
  correo: string;
  nombre: string;
  rol: "SUPERADMIN" | "ADMIN";
};
