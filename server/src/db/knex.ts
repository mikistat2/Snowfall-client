import knexFactory from 'knex';
import { types } from 'pg';
import { env } from '../config/env';

// node-postgres returns BIGINT (int8) columns as strings. Our ids fit safely
// in JS numbers, and string ids break zod validation (recognize payloads) and
// the monitor's client-side cache keys — parse them as numbers.
types.setTypeParser(types.builtins.INT8, (value) => parseInt(value, 10));

export const db = knexFactory({
  client: 'pg',
  connection: env.databaseUrl ?? {
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
  },
  pool: { min: 2, max: 10 },
});
