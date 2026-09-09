import { defineConfig, loadEnv } from 'vite';
import handler from './api/survey.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['DATABASE_URL', 'POSTGRES_URL']) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  }
  return {
    plugins: [{
      name: 'local-survey-api',
      configureServer(server) {
        server.middlewares.use('/api/survey', async (req, res) => {
          res.status = (code) => { res.statusCode = code; return res; };
          res.json = (body) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); };
          let body = '';
          for await (const chunk of req) {
            body += chunk;
            if (Buffer.byteLength(body) > 2048) {
              res.status(413).json({ error: 'size' });
              return;
            }
          }
          req.body = body;
          await handler(req, res);
        });
      }
    }]
  };
});
