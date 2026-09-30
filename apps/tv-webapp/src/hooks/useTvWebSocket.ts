import { useEffect, useRef, useState, useCallback } from "react";

export type TvEvent =
  | { type: "asistencia:success"; tipo: "ENTRADA" | "SALIDA"; empleado: { nombre: string; puesto: string | null }; timestamp: string }
  | { type: "asistencia:error"; error: string };

const RECONNECT_DELAY_MS = 3000;

export function useTvWebSocket(apiUrl: string) {
  const [lastEvent, setLastEvent] = useState<TvEvent | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number | null>(null);

  const connect = useCallback(() => {
    const wsUrl = apiUrl.replace(/^http/, "ws") + "/api/tv/ws";
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[TV WS] conectado");
    };

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as TvEvent;
        setLastEvent(data);
      } catch {
        console.error("[TV WS] mensaje inválido", ev.data);
      }
    };

    ws.onclose = () => {
      console.log("[TV WS] desconectado, reintentando...");
      wsRef.current = null;
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
      reconnectTimer.current = window.setTimeout(connect, RECONNECT_DELAY_MS);
    };

    ws.onerror = (err) => {
      console.error("[TV WS] error", err);
      ws.close();
    };
  }, [apiUrl]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { lastEvent };
}
