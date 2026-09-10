import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurveyHandler } from './survey-handler.js';

const valid = { id: '3bcaa60b-3c23-4d37-9bd3-6393c15f04ed', choices: ['housing', 'crime', 'education'] };
function invoke(handler, method, body, headers = {}, url = '/api/survey') {
  const res = {
    headers: {}, code: 200,
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.code = code; return this; },
    json(data) { this.data = data; return this; }
  };
  return handler({ method, body, url, headers: { host: 'localhost', 'content-type': 'application/json', ...headers } }, res).then(() => res);
}

test('rejects invalid submissions before accessing storage', async () => {
  const handler = createSurveyHandler({ saveResponse() { throw new Error('Must not write'); } });
  for (const body of [null, '{', {}, { ...valid, id: 'bad' },
    ...[[], ['housing'], ['housing', 'crime'], [...valid.choices, 'budget'],
      ['housing', 'housing', 'crime'], ['housing', 'crime', 'unknown']].map(choices => ({ ...valid, choices }))]) {
    assert.equal((await invoke(handler, 'POST', body)).code, 400);
  }
});

test('accepts exactly three choices and treats repeated receipt as saved', async () => {
  const seen = new Set();
  const handler = createSurveyHandler({ async saveResponse(id, choices) {
    assert.deepEqual(choices, valid.choices);
    const created = !seen.has(id); seen.add(id); return created;
  } });
  assert.equal((await invoke(handler, 'POST', valid)).code, 201);
  assert.deepEqual((await invoke(handler, 'POST', valid)).data, { saved: true });
  assert.equal(seen.size, 1);
});

test('rejects unsupported methods, formats, foreign origins and oversized bodies', async () => {
  const handler = createSurveyHandler({});
  assert.equal((await invoke(handler, 'DELETE')).code, 405);
  assert.equal((await invoke(handler, 'POST', valid, { 'content-type': 'text/plain' })).code, 415);
  assert.equal((await invoke(handler, 'POST', valid, { origin: 'https://elsewhere.example' })).code, 403);
  assert.equal((await invoke(handler, 'POST', 'x'.repeat(2049))).code, 413);
});

test('results expose only aggregates and do not cache stale totals', async () => {
  const handler = createSurveyHandler({ async readResults() { return { total: 2, counts: { housing: 2, crime: 1 } }; } });
  const result = await invoke(handler, 'GET');
  assert.equal(result.code, 200);
  assert.equal(result.data.total, 2);
  assert.equal(result.headers['Cache-Control'], 'no-store');
  assert.equal(result.data.id, undefined);
});

test('database outages do not leak credentials or claim a successful save', async () => {
  const fail = async () => { throw new Error('private connection details'); };
  const handler = createSurveyHandler({ saveResponse: fail, readResults: fail });
  for (const method of ['GET', 'POST']) {
    const result = await invoke(handler, method, valid);
    assert.equal(result.code, 503);
    assert.deepEqual(result.data, { error: 'unavailable' });
  }
});

test('Other requires text, enforces 50 characters, and saves trimmed text', async () => {
  const saved = [];
  const handler = createSurveyHandler({ async saveResponse(...args) { saved.push(args); return true; } });
  const submission = { ...valid, choices: ['housing', 'crime', 'other'] };
  for (const otherText of [undefined, '', '   ', 'x'.repeat(51), 'abc\n123', 4]) {
    assert.equal((await invoke(handler, 'POST', { ...submission, otherText })).code, 400);
  }
  assert.equal(saved.length, 0);
  assert.equal((await invoke(handler, 'POST', { ...submission, otherText: 'x'.repeat(50) })).code, 201);
  assert.equal(saved[0][2].length, 50);
  await invoke(handler, 'POST', { ...submission, otherText: '  Parks  ' });
  assert.equal(saved[1][2], 'Parks');
  await invoke(handler, 'POST', { ...valid, otherText: 'not selected' });
  assert.equal(saved[2][2], null);
});

test('Other pagination validates pages and exposes only answer text', async () => {
  const handler = createSurveyHandler({ async readOtherAnswers(page) { return { page, answers: ['Parks'], hasMore: false }; } });
  for (const page of ['-1', '1.5', 'abc', '1000000']) {
    assert.equal((await invoke(handler, 'GET', null, {}, `/api/survey?view=other&page=${page}`)).code, 400);
  }
  const result = await invoke(handler, 'GET', null, {}, '/api/survey?view=other&page=1');
  assert.deepEqual(result.data, { page: 1, answers: ['Parks'], hasMore: false });
});
