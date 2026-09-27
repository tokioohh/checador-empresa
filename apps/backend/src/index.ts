import { createServer } from "http";
import { env } from "./config/env";
import { createApp } from "./app";
import { initTvWebSocket } from "./lib/tv-ws";

const app = createApp();
const server = createServer(app);

initTvWebSocket(server);

server.listen(env.PORT, () => {
  console.log(`API escuchando en http://localhost:${env.PORT}`);
});
