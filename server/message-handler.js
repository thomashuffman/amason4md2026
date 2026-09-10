import { createHmac } from 'node:crypto';

const recipient = 'amason4md2026@gmail.com';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createMessageHandler({ reserveMessageAttempt, send = fetch, env = process.env }) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    const configured = Boolean(env.RESEND_API_KEY && env.CONTACT_FROM_EMAIL);
    if (req.method === 'GET') return res.status(200).json({ available: configured });
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'method' });
    }
    if (!req.headers['content-type']?.startsWith('application/json')) return res.status(415).json({ error: 'format' });
    try {
      if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) return res.status(403).json({ error: 'origin' });
    } catch { return res.status(403).json({ error: 'origin' }); }
    let body = req.body;
    try {
      if (typeof body === 'string') {
        if (Buffer.byteLength(body) > 16384) return res.status(413).json({ error: 'size' });
        body = JSON.parse(body);
      }
    } catch { return res.status(400).json({ error: 'invalid' }); }
    const { id, name, email, subject, message, website } = body || {};
    if (website) return res.status(400).json({ error: 'invalid' });
    if (typeof id !== 'string' || !uuid.test(id)
      || typeof name !== 'string' || name.trim().length < 1 || name.length > 80 || /[\r\n\u0000]/.test(name)
      || typeof email !== 'string' || email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)
      || typeof subject !== 'string' || subject.trim().length < 1 || subject.length > 120 || /[\r\n\u0000]/.test(subject)
      || typeof message !== 'string' || message.trim().length < 1 || message.length > 3000 || message.includes('\u0000')) {
      return res.status(400).json({ error: 'invalid' });
    }
    if (!configured) return res.status(503).json({ error: 'not_configured' });
    try {
      // Store only a short-lived keyed fingerprint, never the sender's raw IP.
      const address = env.VERCEL ? req.headers['x-vercel-forwarded-for'] : req.socket?.remoteAddress;
      const bucket = createHmac('sha256', env.RESEND_API_KEY)
        .update(`${address || 'unknown'}:${Math.floor(Date.now() / 3600000)}`).digest('hex');
      if (!(await reserveMessageAttempt(bucket))) return res.status(429).json({ error: 'rate_limit' });
      const response = await send('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `contact-${id}` },
        body: JSON.stringify({
          from: env.CONTACT_FROM_EMAIL,
          to: [recipient],
          reply_to: email,
          subject: `${env.VERCEL_ENV === 'preview' ? '[STAGING] ' : ''}Website message: ${subject.trim()}`,
          text: `From: ${name.trim()} <${email}>\n\n${message.trim()}`
        }),
        signal: AbortSignal.timeout(12000)
      });
      if (!response.ok) return res.status(502).json({ error: 'send_failed' });
      const result = await response.json();
      if (!result.id) return res.status(502).json({ error: 'send_failed' });
      return res.status(200).json({ sent: true });
    } catch { return res.status(503).json({ error: 'unavailable' }); }
  };
}
