import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config: Knex.Config = {
  client: 'pg',
  connection: process.env.DATABASE_URL ?? {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'gym_management',
  },
  pool: { min: 2, max: 10 },
  migrations: {
    directory: './src/db/migrations',
    extension: 'ts',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './src/db/seeds',
    extension: 'ts',
  },
};

export default config;
