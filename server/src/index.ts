import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { initSocket } from './sockets';
import { startJobs } from './jobs';
import { initBots } from './telegram/botManager';

const app = createApp();
const server = http.createServer(app);

initSocket(server, env.clientUrl);
startJobs();
void initBots().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[telegram] bot init failed', err);
});

server.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${env.port} (client: ${env.clientUrl})`);
});
