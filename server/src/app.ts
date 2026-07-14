import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { api } from './routes';
import { errorHandler } from './middleware/error';

export function createApp(): express.Express {
  const app = express();

  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json({ limit: '10mb' })); // face descriptors + photo data URLs

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/v1', api);

  app.use(errorHandler);
  return app;
}
