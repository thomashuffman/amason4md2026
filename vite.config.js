import { defineConfig, loadEnv } from 'vite';
import handler from './api/survey.js';
import messageHandler from './api/message.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['DATABASE_URL', 'POSTGRES_URL', 'RESEND_API_KEY', 'CONTACT_FROM_EMAIL']) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  }
  return {
    plugins: [{
      name: 'local-survey-api',
      configureServer(server) {
        for (const [route, apiHandler, limit] of [['/api/survey', handler, 2048], ['/api/message', messageHandler, 16384]]) {
        server.middlewares.use(route, async (req, res) => {
          res.status = (code) => { res.statusCode = code; return res; };
          res.json = (body) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); };
          let body = '';
          for await (const chunk of req) {
            body += chunk;
            if (Buffer.byteLength(body) > limit) {
              res.status(413).json({ error: 'size' });
              return;
            }
          }
          req.body = body;
          await apiHandler(req, res);
        });
        }
      }
    }]
  };
});
