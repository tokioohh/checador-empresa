import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Archivo, Media } from "../lib/types";
import { FilmIcon, PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from "./Icon";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export function MediaModule() {
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, m] = await Promise.all([api.listarArchivos(), api.listarMedia()]);
      setArchivos(a.archivos);
      setMedia(m.media);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    setError(null);
    try {
      await api.subirArchivo(file);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  };

  const handleAgregarCola = async (archivoId: string) => {
    setError(null);
    try {
      await api.crearMedia(archivoId);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al agregar a la cola");
    }
  };

  const handleEliminarMedia = async (id: string) => {
    try {
      await api.eliminarMedia(id);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  const handleEliminarArchivo = async (id: string) => {
    if (!confirm("¿Eliminar este archivo de la biblioteca? También se quitará de la cola si está en uso.")) return;
    try {
      await api.eliminarArchivo(id);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  const handleToggleActivo = async (m: Media) => {
    try {
      await api.actualizarMedia(m.id, { activo: !m.activo });
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    }
  };

  const handleMover = async (index: number, direccion: -1 | 1) => {
    const target = index + direccion;
    if (target < 0 || target >= media.length) return;
    const a = media[index];
    const b = media[target];
    try {
      await api.actualizarMedia(a.id, { orden: b.orden });
      await api.actualizarMedia(b.id, { orden: a.orden });
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reordenar");
    }
  };

  if (loading) {
    return <div className="text-slate-500">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Contenido Multimedia</h1>
        <p className="text-slate-500 text-sm mt-1">
          Sube imágenes o videos a la biblioteca y arma la cola que rotará en la TV.
        </p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ---- Biblioteca ---- */}
        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Biblioteca de archivos</h2>
            <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition">
              {subiendo ? "Subiendo..." : "Subir archivo"}
              <input type="file" accept="image/*,video/*" onChange={handleUpload} className="hidden" disabled={subiendo} />
            </label>
          </div>

          {archivos.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No hay archivos subidos todavía.</p>
          ) : (
            <ul className="space-y-2">
              {archivos.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 group"
                >
                  <div className="w-14 h-10 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                    {a.tipo === "IMAGEN" ? (
                      <img src={`${API_URL}/storage/${a.archivoUrl}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <FilmIcon size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{a.nombreOriginal}</div>
                    <div className="text-xs text-slate-400">
                      {a.tipo === "IMAGEN" ? "Imagen" : "Video"} · usada {a._count?.media ?? 0}×
                    </div>
                  </div>
                  <button
                    onClick={() => handleAgregarCola(a.id)}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded transition"
                    title="Agregar a la cola"
                  >
                    <PlusIcon size={14} /> Cola
                  </button>
                  <button
                    onClick={() => handleEliminarArchivo(a.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 px-2 py-1 rounded transition"
                    title="Eliminar"
                  >
                    <TrashIcon size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ---- Cola de reproducción ---- */}
        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-1">Cola de reproducción</h2>
          <p className="text-xs text-slate-400 mb-4">Estos elementos rotan en la TV en este orden.</p>

          {media.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">
              La cola está vacía. Agrega elementos desde la biblioteca.
            </p>
          ) : (
            <ul className="space-y-2">
              {media.map((m, i) => (
                <li
                  key={m.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border transition ${
                    m.activo ? "border-slate-100 bg-white" : "border-slate-100 bg-slate-50 opacity-60"
                  }`}
                >
                  <span className="w-6 text-center text-sm font-medium text-slate-400">{i + 1}</span>
                  <div className="w-14 h-10 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                    {m.archivo.tipo === "IMAGEN" ? (
                      <img src={`${API_URL}/storage/${m.archivo.archivoUrl}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <FilmIcon size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{m.archivo.nombreOriginal}</div>
                    <div className="text-xs text-slate-400">
                      {m.archivo.tipo === "IMAGEN" ? "Imagen" : "Video"}
                      {m.duracionSegundos ? ` · ${m.duracionSegundos}s` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleMover(i, -1)} disabled={i === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-30 px-1.5 py-1 rounded transition" title="Subir"><ArrowUpIcon size={16} /></button>
                    <button onClick={() => handleMover(i, 1)} disabled={i === media.length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-30 px-1.5 py-1 rounded transition" title="Bajar"><ArrowDownIcon size={16} /></button>
                    <button
                      onClick={() => handleToggleActivo(m)}
                      className={`text-xs font-medium px-2 py-1 rounded transition ${m.activo ? "text-emerald-700 bg-emerald-50" : "text-slate-500 bg-slate-100"}`}
                      title={m.activo ? "Desactivar" : "Activar"}
                    >
                      {m.activo ? "Activo" : "Inactivo"}
                    </button>
                    <button onClick={() => handleEliminarMedia(m.id)} className="text-slate-400 hover:text-red-500 px-1.5 py-1 rounded transition" title="Quitar de la cola"><TrashIcon size={16} /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
