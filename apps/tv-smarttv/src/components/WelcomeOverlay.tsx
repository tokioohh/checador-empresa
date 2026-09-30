import { useEffect, useState } from "react";
import type { TvEvent } from "../hooks/useTvWebSocket";

const DISPLAY_MS = 6000;

export function WelcomeOverlay({ event }: { event: TvEvent | null }) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<TvEvent | null>(null);

  useEffect(() => {
    if (!event) return;
    setCurrent(event);
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [event]);

  if (!visible || !current) return null;

  const isSuccess = current.type === "asistencia:success";

  const bg = isSuccess ? "#10b981" : "#ef4444";
  const icon = isSuccess ? (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ffffff"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ) : (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ffffff"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );

  const message = isSuccess
    ? current.tipo === "ENTRADA"
      ? `¡Bienvenido, ${current.empleado.nombre}!`
      : `¡Hasta luego, ${current.empleado.nombre}!`
    : current.error;

  const subMessage = isSuccess
    ? [current.empleado.puesto, current.tipo === "ENTRADA" ? "Entrada registrada" : "Salida registrada"]
      .filter(Boolean)
      .join(" · ")
    : "Por favor intenta de nuevo";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        animation: "slideUpOverlay 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        style={{
          background: bg,
          borderRadius: 20,
          padding: "24px 48px",
          display: "flex",
          alignItems: "center",
          gap: 24,
          boxShadow: "0 12px 20px -4px rgba(0,0,0,0.2), 0 6px 10px -2px rgba(0,0,0,0.12)",
          minWidth: 500,
          justifyContent: "center",
        }}
      >
        {icon}
        <div style={{ textAlign: "left" }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "0.3px",
            }}
          >
            {message}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: 20,
              marginTop: 4,
              fontWeight: 500,
            }}
          >
            {subMessage}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUpOverlay {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
