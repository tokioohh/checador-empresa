import { useEffect, useState, type FormEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import { api } from "../lib/api";
import type { Empleado } from "../lib/types";

const estadoColor: Record<Empleado["estado"], string> = {
  ACTIVO: "bg-emerald-50 text-emerald-700",
  INACTIVO: "bg-amber-50 text-amber-700",
  BAJA: "bg-red-50 text-red-700",
};

type Activation = { codigo: string; expiraEn: string; empleado: Empleado };
type AttendanceFilter = "TODOS" | "ACTIVO" | "INACTIVO";
type EmploymentFilter = "TODOS" | Empleado["estado"];

export function EmpleadosModule() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activationLoading, setActivationLoading] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activation, setActivation] = useState<Activation | null>(null);
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>("TODOS");
  const [employmentFilter, setEmploymentFilter] = useState<EmploymentFilter>("TODOS");

  const cargarEmpleados = async () => {
    const res = await api.listarEmpleados();
    setEmpleados(res.empleados);
  };

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const res = await api.listarEmpleados();
        if (mounted) setEmpleados(res.empleados);
      } catch (cause) {
        if (mounted) setError(cause instanceof Error ? cause.message : "No se pudieron cargar los empleados.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void refresh();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 5000);
    window.addEventListener("focus", refresh);

    return () => {
      mounted = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const empleadosFiltrados = empleados.filter((empleado) =>
    (attendanceFilter === "TODOS" || (empleado.estadoAsistencia ?? "INACTIVO") === attendanceFilter)
    && (employmentFilter === "TODOS" || empleado.estado === employmentFilter),
  );
  const empleadosEnTurno = empleados.filter((empleado) => empleado.estadoAsistencia === "ACTIVO").length;
  const empleadosFuera = empleados.length - empleadosEnTurno;

  const crearEmpleado = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaving(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const optional = (key: string) => String(form.get(key) ?? "").trim() || undefined;

    try {
      await api.crearEmpleado({
        nombre: String(form.get("nombre") ?? "").trim(),
        apellidos: String(form.get("apellidos") ?? "").trim(),
        numeroEmpleado: String(form.get("numeroEmpleado") ?? "").trim(),
        correo: optional("correo"),
        puesto: optional("puesto"),
        horarioEntrada: optional("horarioEntrada"),
        horarioSalida: optional("horarioSalida"),
      });
      await cargarEmpleados();
      setMostrarForm(false);
      formElement.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar el empleado.");
    } finally {
      setSaving(false);
    }
  };

  const generarActivacion = async (empleado: Empleado) => {
    setError(null);
    setActivationLoading(empleado.id);
    try {
      const { activacion } = await api.crearCodigoActivacion(empleado.id);
      setActivation({ ...activacion, empleado });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo generar el QR de activación.");
    } finally {
      setActivationLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Empleados</h1>
          <p className="text-slate-500 text-sm mt-1">Da de alta trabajadores y vincula su teléfono con un QR de activación.</p>
        </div>
        <button
          onClick={() => { setMostrarForm((value) => !value); setError(null); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          {mostrarForm ? "Cancelar" : "+ Dar de alta empleado"}
        </button>
      </header>

      {error ? <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-800">Activos · en turno</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-900">{empleadosEnTurno}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-600">Inactivos · fuera de turno</p>
          <p className="mt-1 text-2xl font-semibold text-slate-800">{empleadosFuera}</p>
        </div>
      </div>

      {mostrarForm && (
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Nuevo empleado</h2>
          <form onSubmit={(event) => void crearEmpleado(event)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nombre" name="nombre" required placeholder="Juan" />
            <Field label="Apellidos" name="apellidos" required placeholder="Pérez López" />
            <Field label="Número de empleado" name="numeroEmpleado" required placeholder="EMP001" />
            <Field label="Correo" name="correo" type="email" placeholder="juan@empresa.com" />
            <Field label="Puesto" name="puesto" placeholder="Operador" />
            <Field label="Horario entrada" name="horarioEntrada" type="time" />
            <Field label="Horario salida" name="horarioSalida" type="time" />
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-lg transition">
                {saving ? "Guardando…" : "Guardar empleado"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex flex-wrap items-end gap-4 border-b border-slate-100 p-4">
          <label className="text-sm font-medium text-slate-700">
            Asistencia actual
            <select
              value={attendanceFilter}
              onChange={(event) => setAttendanceFilter(event.target.value as AttendanceFilter)}
              className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2"
            >
              <option value="TODOS">Todos</option>
              <option value="ACTIVO">Activos · en turno</option>
              <option value="INACTIVO">Inactivos · fuera de turno</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Estado laboral
            <select
              value={employmentFilter}
              onChange={(event) => setEmploymentFilter(event.target.value as EmploymentFilter)}
              className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2"
            >
              <option value="TODOS">Todos</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="BAJA">Baja</option>
            </select>
          </label>
          <p className="pb-2 text-xs text-slate-500">El estado de asistencia se alterna en cada escaneo; el estado laboral solo lo cambia RH.</p>
          <button
            type="button"
            onClick={() => void cargarEmpleados().catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "No se pudo actualizar la lista."))}
            className="mb-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Actualizar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Número</th>
                <th className="px-4 py-3 font-medium">Puesto</th>
                <th className="px-4 py-3 font-medium">Estado laboral</th>
                <th className="px-4 py-3 font-medium">Asistencia</th>
                <th className="px-4 py-3 font-medium">Dispositivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Cargando...</td></tr>
              ) : empleadosFiltrados.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No hay empleados que coincidan con los filtros.</td></tr>
              ) : (
                empleadosFiltrados.map((empleado) => (
                  <tr key={empleado.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{[empleado.nombre, empleado.apellidos].filter(Boolean).join(" ")}</td>
                    <td className="px-4 py-3 text-slate-600">{empleado.numeroEmpleado}</td>
                    <td className="px-4 py-3 text-slate-600">{empleado.puesto ?? "—"}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-1 rounded-full ${estadoColor[empleado.estado]}`}>{empleado.estado}</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${empleado.estadoAsistencia === "ACTIVO" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {empleado.estadoAsistencia === "ACTIVO" ? "Activo · en turno" : "Inactivo · fuera de turno"}
                      </span>
                      {empleado.ultimaAsistencia ? (
                        <div className="mt-1 text-xs text-slate-400">
                          {empleado.ultimaAsistencia.tipo === "ENTRADA" ? "Entrada" : "Salida"} · {new Date(empleado.ultimaAsistencia.timestamp).toLocaleString("es-MX")}
                        </div>
                      ) : <div className="mt-1 text-xs text-slate-400">Sin registros</div>}
                    </td>
                    <td className="px-4 py-3">
                      {empleado.estado === "ACTIVO" ? (
                        <button
                          onClick={() => void generarActivacion(empleado)}
                          disabled={activationLoading === empleado.id}
                          className="text-emerald-700 hover:text-emerald-900 disabled:opacity-60 font-medium"
                        >
                          {activationLoading === empleado.id ? "Generando…" : "Generar QR"}
                        </button>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {activation ? (
        <div role="presentation" onClick={() => setActivation(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="activation-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
            <h2 id="activation-title" className="text-xl font-semibold text-slate-900">Vincular teléfono</h2>
            <p className="mt-2 text-sm text-slate-600">
              Muestra este QR a {[activation.empleado.nombre, activation.empleado.apellidos].filter(Boolean).join(" ")} para que lo escanee desde <strong>Registrar dispositivo</strong>.
            </p>
            <div className="mx-auto my-5 w-fit rounded-xl border border-slate-200 bg-white p-3">
              <QRCodeSVG value={activation.codigo} size={220} level="M" />
            </div>
            <p className="break-all font-mono text-xs text-slate-500">{activation.codigo}</p>
            <p className="mt-3 text-xs text-amber-700">Código de un solo uso. Vence: {new Date(activation.expiraEn).toLocaleString("es-MX")}.</p>
            <button onClick={() => setActivation(null)} className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white">Cerrar</button>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </label>
  );
}
