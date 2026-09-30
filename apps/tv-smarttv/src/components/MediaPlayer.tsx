import { useEffect, useState, useRef } from "react";
import type { MediaItem } from "../hooks/useMedia";

const DEFAULT_SLIDE_MS = 8000;

export function MediaPlayer({
  media,
  apiUrl,
}: {
  media: MediaItem[];
  apiUrl: string;
}) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (media.length === 0) return;

    const current = media[index];
    const duration =
      current.tipo === "VIDEO" && current.duracionSegundos
        ? current.duracionSegundos * 1000
        : DEFAULT_SLIDE_MS;

    const timer = setTimeout(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % media.length);
        setFade(true);
      }, 400);
    }, duration);

    return () => clearTimeout(timer);
  }, [index, media]);

  useEffect(() => {
    setIndex(0);
    setFade(true);
  }, [media.length]);

  if (media.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          gap: 24,
        }}
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span style={{ fontSize: 26, fontWeight: 600 }}>
          Sin contenido multimedia
        </span>
        <span style={{ fontSize: 20, color: "#cbd5e1" }}>
          El administrador puede agregar contenido desde el panel
        </span>
      </div>
    );
  }

  const item = media[index];
  const src = `${apiUrl}/storage/${item.archivoUrl}`;
  const durationMs =
    item.tipo === "VIDEO" && item.duracionSegundos
      ? item.duracionSegundos * 1000
      : DEFAULT_SLIDE_MS;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: fade ? 1 : 0,
          transition: "opacity 0.4s ease-in-out",
        }}
      >
        {item.tipo === "VIDEO" ? (
          <video
            ref={videoRef}
            src={src}
            autoPlay
            muted
            loop
            playsInline
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          />
        ) : (
          <img
            src={src}
            alt=""
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          />
        )}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          zIndex: 10,
          width: 400,
        }}
      >
        <div
          style={{
            width: "100%",
            height: 6,
            background: "rgba(0,0,0,0.15)",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            key={index}
            style={{
              height: "100%",
              width: "100%",
              background: "linear-gradient(90deg, #10b981, #3b82f6)",
              borderRadius: 3,
              animation: `mediaProgress ${durationMs}ms linear forwards`,
            }}
          />
        </div>

        {media.length > 1 && (
          <div style={{ display: "flex", gap: 8 }}>
            {media.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === index ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === index ? "#3b82f6" : "rgba(0,0,0,0.25)",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes mediaProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
