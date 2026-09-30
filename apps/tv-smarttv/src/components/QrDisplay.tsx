import { QRCodeSVG } from "qrcode.react";

export function QrDisplay({ token, apiUrl }: { token: string; apiUrl: string }) {
  if (!token) {
    return (
      <div
        style={{
          width: 280,
          height: 280,
          background: "#f1f5f9",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: 18,
          fontWeight: 500,
        }}
      >
        Cargando QR...
      </div>
    );
  }

  const qrValue = `${apiUrl}/api/tv/qr?t=${token}`;

  return (
    <div
      style={{
        background: "#ffffff",
        padding: 16,
        borderRadius: 20,
        border: "3px solid #e2e8f0",
        boxShadow: "0 8px 12px -2px rgba(0,0,0,0.08), 0 4px 8px -2px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <QRCodeSVG
        value={qrValue}
        size={260}
        level="M"
        bgColor="#ffffff"
        fgColor="#1e293b"
      />
      <div
        style={{
          width: "100%",
          height: 6,
          background: "#f1f5f9",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: "100%",
            background: "linear-gradient(90deg, #10b981, #3b82f6)",
            borderRadius: 3,
            animation: "qrPulse 2s ease-in-out infinite",
          }}
        />
        <style>{`
          @keyframes qrPulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
