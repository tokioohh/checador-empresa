import type { Aviso } from "../hooks/useAvisos";

const COLOR_HEX: Record<Aviso["color"], string> = {
  negro: "#1e293b",
  rojo: "#dc2626",
  amarillo: "#ca8a04",
  verde: "#059669",
};

export function AvisosTicker({ avisos }: { avisos: Aviso[] }) {
  if (avisos.length === 0) {
    return (
      <div
        style={{
          height: 80,
          background: "#ffffff",
          borderBottom: "2px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: 20,
          fontWeight: 500,
        }}
      >
        No hay avisos activos
      </div>
    );
  }

  const renderAvisos = (keyPrefix: string) => (
    <span
      key={keyPrefix}
      style={{ paddingRight: "60vw", display: "inline-flex", alignItems: "center" }}
    >
      {avisos.map((a, i) => (
        <span key={`${keyPrefix}-${a.id}`} style={{ display: "inline-flex", alignItems: "center" }}>
          {i > 0 && (
            <span style={{ color: "#94a3b8", padding: "0 20px", fontSize: 28 }}>•</span>
          )}
          <span style={{ color: COLOR_HEX[a.color] ?? COLOR_HEX.negro }}>{a.texto}</span>
        </span>
      ))}
    </span>
  );

  return (
    <div
      style={{
        height: 80,
        background: "#ffffff",
        borderBottom: "2px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
        zIndex: 40,
      }}
    >
      <div
        style={{
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderRight: "2px solid #e2e8f0",
          height: "100%",
          flexShrink: 0,
          background: "#f8fafc",
        }}
      >
        <svg
          width="24"
          height="24"
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
            fontSize: 18,
            fontWeight: 700,
            color: "#3b82f6",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
          }}
        >
          Avisos
        </span>
      </div>

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
            fontSize: 24,
            paddingTop: 4,
            fontWeight: 600,
            alignItems: "center",
            height: "100%",
          }}
        >
          {renderAvisos("a")}
          {renderAvisos("b")}
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
