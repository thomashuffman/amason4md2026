import content from '../src/surveyContent.json' with { type: 'json' };

const optionIds = new Set(content.options.map(({ id }) => id));
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createSurveyHandler(store) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (!['GET', 'POST'].includes(req.method)) {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'method' });
    }
    if (req.method === 'POST') {
      if (!req.headers['content-type']?.startsWith('application/json')) {
        return res.status(415).json({ error: 'format' });
      }
      if (req.headers.origin) {
        try {
          if (new URL(req.headers.origin).host !== req.headers.host) {
            return res.status(403).json({ error: 'origin' });
          }
        } catch { return res.status(403).json({ error: 'origin' }); }
      }
      let body = req.body;
      try {
        if (typeof body === 'string') {
          if (Buffer.byteLength(body) > 2048) return res.status(413).json({ error: 'size' });
          body = JSON.parse(body);
        }
      } catch { return res.status(400).json({ error: 'invalid' }); }
      const { id, choices } = body || {};
      if (typeof id !== 'string' || !uuid.test(id) || !Array.isArray(choices)
        || choices.length !== 3 || new Set(choices).size !== 3
        || !choices.every((choice) => optionIds.has(choice))) {
        return res.status(400).json({ error: 'invalid' });
      }
      try {
        const created = await store.saveResponse(id, choices);
        return res.status(created ? 201 : 200).json({ saved: true });
      } catch {
        return res.status(503).json({ error: 'unavailable' });
      }
    }
    try {
      const results = await store.readResults();
      return res.status(200).json({ ...results, environment: process.env.VERCEL_ENV || 'development' });
    } catch {
      return res.status(503).json({ error: 'unavailable' });
    }
  };
}
