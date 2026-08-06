import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Must match PORT in server/.env. The API moved off 4000 because another
    // project on this machine binds 0.0.0.0:4000 (IPv4) while the gym server
    // bound :: (IPv6) — so localhost:4000 reached the gym API but the LAN
    // address reached the other app, which broke access from the phone.
    proxy: {
      '/api': 'http://localhost:4001',
      '/socket.io': { target: 'http://localhost:4001', ws: true },
    },
  },
});
