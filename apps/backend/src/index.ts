import { createServer } from "http";
import { env } from "./config/env";
import { createApp } from "./app";
import { initTvWebSocket } from "./lib/tv-ws";

const app = createApp();
const server = createServer(app);

initTvWebSocket(server);

server.listen(env.PORT, '0.0.0.0', () => {
  console.log(`API escuchando en http://0.0.0.0:${env.PORT}`);
  console.log(`Accesible desde red local en http://<TU-IP>:${env.PORT}`);
});
