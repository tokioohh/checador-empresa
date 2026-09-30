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
      <AvisosTicker avisos={avisos} />

      <div
        style={{
          flex: 1,
          display: "flex",
          padding: "32px",
          gap: 32,
          position: "relative",
        }}
      >
        <div
          style={{
            flex: 1,
            background: "#ffffff",
            borderRadius: 24,
            border: "2px solid #e2e8f0",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <MediaPlayer media={media} apiUrl={apiUrl} />
        </div>

        <div
          style={{
            width: 360,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 24,
              border: "2px solid #e2e8f0",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)",
              padding: 32,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#1e293b",
                textAlign: "center",
                letterSpacing: "0.4px",
              }}
            >
              Escanea para registrar
            </div>
            <QrDisplay token={qrToken} apiUrl={apiUrl} />
            <div
              style={{
                fontSize: 18,
                color: "#64748b",
                textAlign: "center",
                lineHeight: 1.6,
                fontWeight: 500,
              }}
            >
              Usa tu huella digital
              <br />
              para confirmar
            </div>
          </div>

          <div
            style={{
              background: "#f0fdf4",
              borderRadius: 24,
              border: "2px solid #bbf7d0",
              padding: 28,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#166534",
              }}
            >
              ¿Cómo funciona?
            </div>
            <div
              style={{
                fontSize: 18,
                color: "#15803d",
                lineHeight: 1.8,
                fontWeight: 500,
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

      <WelcomeOverlay event={lastEvent} />
    </div>
  );
}
