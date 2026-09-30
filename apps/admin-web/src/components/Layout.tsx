import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ImageIcon, MegaphoneIcon, UsersIcon } from "./Icon";

const navItems = [
  { to: "/media", label: "Multimedia", Icon: ImageIcon },
  { to: "/avisos", label: "Avisos", Icon: MegaphoneIcon },
  { to: "/empleados", label: "Empleados", Icon: UsersIcon },
];

export function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 left-0">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-200">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.224-2.496 7.834A9.964 9.964 0 0112 11zm0-2a3 3 0 100-6 3 3 0 000 6zm7.495 9.392A9.966 9.966 0 0012 19c1.486-1.61 2.496-4.317 2.496-7.834a9.966 9.966 0 015.001 7.226z" />
            </svg>
          </div>
          <span className="font-semibold text-slate-900">Checador</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <item.Icon size={18} className="flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-medium">
              {admin?.nombre?.charAt(0) ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 truncate">{admin?.nombre}</div>
              <div className="text-xs text-slate-500 truncate">{admin?.correo}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-slate-600 hover:text-red-600 transition px-2 py-1.5 rounded-lg hover:bg-red-50"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 ml-60 p-8">
        <Outlet />
      </main>
    </div>
  );
}
