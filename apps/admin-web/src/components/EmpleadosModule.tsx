import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Empleado } from "../lib/types";

const estadoColor: Record<Empleado["estado"], string> = {
  ACTIVO: "bg-emerald-50 text-emerald-700",
  INACTIVO: "bg-amber-50 text-amber-700",
  BAJA: "bg-red-50 text-red-700",
};

export function EmpleadosModule() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => {
    api
      .listarEmpleados()
      .then((res) => setEmpleados(res.empleados))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Empleados</h1>
          <p className="text-slate-500 text-sm mt-1">Gestión de trabajadores de la empresa.</p>
        </div>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          + Dar de alta empleado
        </button>
      </header>

      {mostrarForm && (
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Nuevo empleado</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Funcionalidad en construcción");
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
              <input className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900" placeholder="Juan Pérez" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Número de empleado</label>
              <input className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900" placeholder="EMP001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Correo</label>
              <input type="email" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900" placeholder="juan@empresa.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Puesto</label>
              <input className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900" placeholder="Desarrollador" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Horario entrada</label>
              <input type="time" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Horario salida</label>
              <input type="time" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setMostrarForm(false)} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">
                Cancelar
              </button>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-lg transition">
                Guardar
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Número</th>
              <th className="px-4 py-3 font-medium">Puesto</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">Cargando...</td>
              </tr>
            ) : empleados.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">No hay empleados.</td>
              </tr>
            ) : (
              empleados.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{e.nombre}</td>
                  <td className="px-4 py-3 text-slate-600">{e.numeroEmpleado}</td>
                  <td className="px-4 py-3 text-slate-600">{e.puesto ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${estadoColor[e.estado]}`}>
                      {e.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
