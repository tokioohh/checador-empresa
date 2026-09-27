import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Aviso } from "../lib/types";
import { PencilIcon, TrashIcon } from "./Icon";

const emptyForm = {
  texto: "",
  prioridad: 5,
  fechaInicio: "",
  fechaFin: "",
  activo: true,
};

export function AvisosModule() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<Aviso | null>(null);
  const [form, setForm] = useState(emptyForm);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listarAvisos();
      setAvisos(res.avisos);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const data = {
        texto: form.texto,
        prioridad: Number(form.prioridad),
        fechaInicio: new Date(form.fechaInicio).toISOString(),
        fechaFin: new Date(form.fechaFin).toISOString(),
        activo: form.activo,
      };
      if (editando) {
        await api.actualizarAviso(editando.id, data);
      } else {
        await api.crearAviso(data);
      }
      setForm(emptyForm);
      setEditando(null);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    }
  };

  const handleEditar = (a: Aviso) => {
    setEditando(a);
    setForm({
      texto: a.texto,
      prioridad: a.prioridad,
      fechaInicio: a.fechaInicio.slice(0, 16),
      fechaFin: a.fechaFin.slice(0, 16),
      activo: a.activo,
    });
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Eliminar este aviso?")) return;
    try {
      await api.eliminarAviso(id);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  const handleToggle = async (a: Aviso) => {
    try {
      await api.actualizarAviso(a.id, { activo: !a.activo });
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    }
  };

  if (loading) {
    return <div className="text-slate-500">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Avisos</h1>
        <p className="text-slate-500 text-sm mt-1">
          Los avisos activos rotan en la tira superior de la TV.
        </p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 h-fit">
          <h2 className="font-semibold text-slate-900 mb-4">
            {editando ? "Editar aviso" : "Nuevo aviso"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Texto del aviso</label>
              <textarea
                value={form.texto}
                onChange={(e) => setForm({ ...form, texto: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                rows={3}
                placeholder="Ej: Recuerden registrar su entrada"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha inicio</label>
                <input
                  type="datetime-local"
                  value={form.fechaInicio}
                  onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha fin</label>
                <input
                  type="datetime-local"
                  value={form.fechaFin}
                  onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
                <input
                  type="number"
                  value={form.prioridad}
                  onChange={(e) => setForm({ ...form, prioridad: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  min={0}
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.activo}
                    onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  Activo
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition"
              >
                {editando ? "Guardar cambios" : "Crear aviso"}
              </button>
              {editando && (
                <button
                  type="button"
                  onClick={() => {
                    setEditando(null);
                    setForm(emptyForm);
                  }}
                  className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Lista */}
        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Avisos existentes</h2>
          {avisos.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No hay avisos.</p>
          ) : (
            <ul className="space-y-2">
              {avisos.map((a) => (
                <li key={a.id} className={`p-3 rounded-lg border ${a.activo ? "border-slate-100 bg-white" : "border-slate-100 bg-slate-50 opacity-60"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800">{a.texto}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        Prioridad {a.prioridad} · {new Date(a.fechaInicio).toLocaleDateString()} → {new Date(a.fechaFin).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleToggle(a)}
                        className={`text-xs font-medium px-2 py-1 rounded transition ${a.activo ? "text-emerald-700 bg-emerald-50" : "text-slate-500 bg-slate-100"}`}
                      >
                        {a.activo ? "Activo" : "Inactivo"}
                      </button>
                      <button onClick={() => handleEditar(a)} className="text-slate-400 hover:text-slate-700 px-1.5 py-1 rounded transition" title="Editar"><PencilIcon size={16} /></button>
                      <button onClick={() => handleEliminar(a.id)} className="text-slate-400 hover:text-red-500 px-1.5 py-1 rounded transition" title="Eliminar"><TrashIcon size={16} /></button>
                    </div>
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
