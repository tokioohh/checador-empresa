import { createContext, useContext, useState, type ReactNode } from "react";
import { api, setToken as setApiToken } from "../lib/api";
import type { Admin } from "../lib/types";

type AuthContextType = {
  admin: Admin | null;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);

  const login = async (correo: string, password: string) => {
    const res = await api.login(correo, password);
    setApiToken(res.token);
    setAdmin(res.admin);
  };

  const logout = () => {
    setApiToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
