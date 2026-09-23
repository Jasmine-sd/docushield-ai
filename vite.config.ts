import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import express from 'express';
import fs from 'fs';
import { defineConfig } from 'vite';
import { apiRouter } from './server/routes/api';

export default defineConfig(() => {
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'express-api-plugin',
        configureServer(server) {
          const app = express();
          app.use(express.json({ limit: '30mb' }));
          app.use(express.urlencoded({ extended: true, limit: '30mb' }));

          app.use('/uploads', express.static(uploadsDir));
          app.use('/api/v1', apiRouter);

          app.get('/api/health', (req, res) => {
            res.json({ status: 'ok', service: 'DOCUSENTRY Backend Engine', timestamp: new Date().toISOString() });
          });

          server.middlewares.use(app);
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
