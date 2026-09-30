export type MediaItem = {
  id: string;
  tipo: 'IMAGEN' | 'VIDEO';
  archivoUrl: string;
  duracionSegundos: number | null;
  orden: number;
};

export type Aviso = {
  id: string;
  texto: string;
  color: 'rojo' | 'amarillo' | 'verde' | 'negro';
};

export type TvEvent =
  | {
      type: 'asistencia:success';
      tipo: 'ENTRADA' | 'SALIDA';
      empleado: {nombre: string; puesto: string | null};
      timestamp: string;
    }
  | {type: 'asistencia:error'; error: string};
