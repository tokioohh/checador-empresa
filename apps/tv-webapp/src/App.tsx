import { useMemo } from "react";
import { QrDisplay } from "./components/QrDisplay";
import { MediaPlayer } from "./components/MediaPlayer";
import { AvisosTicker } from "./components/AvisosTicker";
import { WelcomeOverlay } from "./components/WelcomeOverlay";
import { useQrToken } from "./hooks/useQrToken";
import { useMedia } from "./hooks/useMedia";
import { useAvisos } from "./hooks/useAvisos";
import { useTvWebSocket } from "./hooks/useTvWebSocket";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export default function App() {
  const apiUrl = useMemo(() => API_URL, []);

  const { qrToken } = useQrToken(apiUrl);
  const media = useMedia(apiUrl);
  const avisos = useAvisos(apiUrl);
  const { lastEvent } = useTvWebSocket(apiUrl);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#f8fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Ticker de avisos — parte superior */}
      <AvisosTicker avisos={avisos} />

      {/* Área principal: multimedia + QR */}
      <div
        style={{
          flex: 1,
          display: "flex",
          padding: "24px 24px 96px 24px",
          gap: 24,
          position: "relative",
        }}
      >
        {/* Contenido multimedia — ocupa la mayor parte */}
        <div
          style={{
            flex: 1,
            background: "#ffffff",
            borderRadius: 20,
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <MediaPlayer media={media} apiUrl={apiUrl} />
        </div>

        {/* Panel lateral derecho con QR */}
        <div
          style={{
            width: 280,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Card del QR */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 20,
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#1e293b",
                textAlign: "center",
                letterSpacing: "0.3px",
              }}
            >
              Escanea para registrar
            </div>
            <QrDisplay token={qrToken} apiUrl={apiUrl} />
            <div
              style={{
                fontSize: 13,
                color: "#64748b",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              Usa tu huella digital
              <br />
              para confirmar
            </div>
          </div>

          {/* Card informativa */}
          <div
            style={{
              background: "#f0fdf4",
              borderRadius: 20,
              border: "1px solid #bbf7d0",
              padding: 20,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#166534",
              }}
            >
              ¿Cómo funciona?
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#15803d",
                lineHeight: 1.6,
              }}
            >
              1. Abre la app en tu teléfono
              <br />
              2. Escanea el código QR
              <br />
              3. Confirma con tu huella
            </div>
          </div>
        </div>
      </div>

      {/* Overlay de bienvenida/error — parte inferior */}
      <WelcomeOverlay event={lastEvent} />
    </div>
  );
}
