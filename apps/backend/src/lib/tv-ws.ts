import type { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";

let wss: WebSocketServer | null = null;

export function initTvWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: "/api/tv/ws" });

  wss.on("connection", (ws) => {
    ws.on("error", console.error);
    // No se requiere auth; la TV es un display público.
  });

  return wss;
}

export type TvEvent =
  | { type: "asistencia:success"; empleado: { nombre: string; puesto: string | null }; timestamp: string }
  | { type: "asistencia:error"; error: string };

export function broadcastTvEvent(event: TvEvent) {
  if (!wss) return;
  const payload = JSON.stringify(event);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
