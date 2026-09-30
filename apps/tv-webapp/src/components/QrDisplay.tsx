import { QRCodeSVG } from "qrcode.react";

export function QrDisplay({ token, apiUrl }: { token: string; apiUrl: string }) {
  if (!token) {
    return (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#f1f5f9",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: 13,
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
        padding: 12,
        borderRadius: 16,
        border: "2px solid #e2e8f0",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <QRCodeSVG
        value={qrValue}
        size={160}
        level="M"
        bgColor="#ffffff"
        fgColor="#1e293b"
      />
      <div
        style={{
          width: "100%",
          height: 4,
          background: "#f1f5f9",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: "100%",
            background: "linear-gradient(90deg, #10b981, #3b82f6)",
            borderRadius: 2,
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
