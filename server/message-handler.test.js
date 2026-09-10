import test from 'node:test';
import assert from 'node:assert/strict';
import { createMessageHandler } from './message-handler.js';

const valid = { id: 'fb884953-18bd-4a1c-b6da-5bca27d40503', name: 'Preview tester', email: 'tester@example.com', subject: 'Form test', message: 'Automated test message.', website: '' };
const env = { RESEND_API_KEY: 'test-key', CONTACT_FROM_EMAIL: 'website@example.com', VERCEL_ENV: 'preview' };
async function invoke(handler, method = 'POST', body = valid, headers = {}) {
  const res = { code: 200, setHeader() {}, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
  await handler({ method, body, headers: { host: 'localhost', 'content-type': 'application/json', ...headers }, socket: { remoteAddress: '127.0.0.1' } }, res);
  return res;
}

test('missing email configuration never pretends to send', async () => {
  const handler = createMessageHandler({ env: {}, reserveMessageAttempt: async () => { throw new Error(); } });
  assert.deepEqual((await invoke(handler, 'GET')).data, { available: false });
  assert.equal((await invoke(handler)).code, 503);
});

test('valid messages use a fixed recipient, plain text, reply-to, and stable retry key', async () => {
  const requests = [];
  const handler = createMessageHandler({ env, reserveMessageAttempt: async bucket => {
    assert.match(bucket, /^[a-f0-9]{64}$/); return true;
  }, send: async (url, options) => { requests.push({ url, options }); return { ok: true, json: async () => ({ id: 'email-123' }) }; } });
  for (let i = 0; i < 2; i++) assert.deepEqual((await invoke(handler, 'POST', { ...valid, to: 'attacker@example.com' })).data, { sent: true });
  const payload = JSON.parse(requests[0].options.body);
  assert.deepEqual(payload.to, ['amason4md2026@gmail.com']);
  assert.equal(payload.reply_to, valid.email);
  assert.equal(payload.html, undefined);
  assert.match(payload.subject, /^\[STAGING\]/);
  assert.equal(requests[0].options.headers['Idempotency-Key'], requests[1].options.headers['Idempotency-Key']);
});

test('production uses its configured sender without the staging prefix', async () => {
  let payload;
  const handler = createMessageHandler({
    env: { ...env, VERCEL_ENV: 'production' },
    reserveMessageAttempt: async () => true,
    send: async (url, options) => {
      payload = JSON.parse(options.body);
      return { ok: true, json: async () => ({ id: 'production-test' }) };
    }
  });
  assert.equal((await invoke(handler)).code, 200);
  assert.equal(payload.from, env.CONTACT_FROM_EMAIL);
  assert.equal(payload.subject, 'Website message: Form test');
  assert.deepEqual(payload.to, ['amason4md2026@gmail.com']);
  assert.equal(payload.reply_to, valid.email);
});

test('invalid input and spam are rejected before emailing', async () => {
  let sent = 0;
  const handler = createMessageHandler({ env, reserveMessageAttempt: async () => true, send: async () => { sent++; } });
  for (const patch of [{ name: '' }, { email: 'invalid' }, { subject: 'x\nBcc:other' }, { message: 'x'.repeat(3001) }, { website: 'spam' }, { id: 'bad' }]) {
    assert.equal((await invoke(handler, 'POST', { ...valid, ...patch })).code, 400);
  }
  assert.equal((await invoke(handler, 'POST', valid, { origin: 'https://another.example' })).code, 403);
  assert.equal((await invoke(handler, 'POST', valid, { 'content-type': 'text/plain' })).code, 415);
  assert.equal(sent, 0);
});

test('rate limits and email provider failures do not claim delivery', async () => {
  const limited = createMessageHandler({ env, reserveMessageAttempt: async () => false });
  assert.equal((await invoke(limited)).code, 429);
  const rejected = createMessageHandler({ env, reserveMessageAttempt: async () => true, send: async () => ({ ok: false }) });
  assert.equal((await invoke(rejected)).code, 502);
  const failed = createMessageHandler({ env, reserveMessageAttempt: async () => true, send: async () => { throw new Error('secret'); } });
  assert.deepEqual((await invoke(failed)).data, { error: 'unavailable' });
});
