import dotenv from 'dotenv';

dotenv.config();

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.length > 0 ? value : fallback;
}

export const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: Number(optional('PORT', '4000')),
  clientUrl: optional('CLIENT_URL', 'http://localhost:5173'),
  databaseUrl: process.env.DATABASE_URL,
  db: {
    host: optional('DB_HOST', 'localhost'),
    port: Number(optional('DB_PORT', '5432')),
    user: optional('DB_USER', 'postgres'),
    password: optional('DB_PASSWORD', 'postgres'),
    database: optional('DB_NAME', 'gym_management'),
  },
  jwt: {
    accessSecret: optional('JWT_ACCESS_SECRET', 'dev-access-secret'),
    refreshSecret: optional('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
    accessTtl: optional('JWT_ACCESS_TTL', '15m'),
    refreshTtlDays: 30,
  },
} as const;
