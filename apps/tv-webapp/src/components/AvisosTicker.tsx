import type { Aviso } from "../hooks/useAvisos";

export function AvisosTicker({ avisos }: { avisos: Aviso[] }) {
  if (avisos.length === 0) {
    return (
      <div
        style={{
          height: 52,
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: 14,
        }}
      >
        No hay avisos activos
      </div>
    );
  }

  const texto = avisos.map((a) => a.texto).join("  •  ");

  return (
    <div
      style={{
        height: 52,
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
        zIndex: 40,
      }}
    >
      {/* Icono de campana */}
      <div
        style={{
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderRight: "1px solid #e2e8f0",
          height: "100%",
          flexShrink: 0,
          background: "#f8fafc",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#3b82f6",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Avisos
        </span>
      </div>

      {/* Scroll del texto */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            whiteSpace: "nowrap",
            animation: "ticker 22s linear infinite",
            fontSize: 16,
            color: "#475569",
            paddingTop: 14,
            fontWeight: 500,
          }}
        >
          <span style={{ paddingRight: "60vw" }}>{texto}</span>
          <span style={{ paddingRight: "60vw" }}>{texto}</span>
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
