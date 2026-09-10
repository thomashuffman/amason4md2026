import { neon } from '@neondatabase/serverless';

let ready;
let client;

export async function database() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error('Database not configured');
  client ??= neon(url);
  // Serialize first-time schema creation across simultaneous cold starts.
  ready ??= client.transaction([
    client`SELECT pg_advisory_xact_lock(4602026)`,
    client`CREATE TABLE IF NOT EXISTS survey_responses (
      id UUID PRIMARY KEY,
      choices TEXT[] NOT NULL CHECK (cardinality(choices) = 3
        AND choices[1] <> choices[2] AND choices[1] <> choices[3] AND choices[2] <> choices[3]),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    client`ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS other_text TEXT
      CHECK (other_text IS NULL OR (char_length(btrim(other_text)) BETWEEN 1 AND 50))`,
    client`CREATE TABLE IF NOT EXISTS message_rate_limits (
      bucket TEXT PRIMARY KEY, attempts INTEGER NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL
    )`
  ]).catch((error) => { ready = undefined; throw error; });
  await ready;
  return client;
}

export async function saveResponse(id, choices, otherText = null) {
  const sql = await database();
  const rows = await sql`INSERT INTO survey_responses (id, choices, other_text)
    VALUES (${id}::uuid, ${choices}::text[], ${otherText})
    ON CONFLICT (id) DO NOTHING RETURNING id`;
  return rows.length > 0;
}

export async function readOtherAnswers(page) {
  const sql = await database();
  const rows = await sql`SELECT other_text AS answer FROM survey_responses
    WHERE other_text IS NOT NULL AND 'other' = ANY(choices)
    ORDER BY created_at, id LIMIT 21 OFFSET ${page * 20}`;
  return { answers: rows.slice(0, 20).map(row => row.answer), hasMore: rows.length > 20, page };
}

export async function reserveMessageAttempt(bucket) {
  const sql = await database();
  const [, rows] = await sql.transaction([
    sql`DELETE FROM message_rate_limits WHERE expires_at < NOW()`,
    sql`INSERT INTO message_rate_limits (bucket, attempts, expires_at)
      VALUES (${bucket}, 1, NOW() + INTERVAL '2 hours')
      ON CONFLICT (bucket) DO UPDATE SET attempts = message_rate_limits.attempts + 1
      WHERE message_rate_limits.attempts < 5 RETURNING attempts`
  ]);
  return rows.length > 0;
}

export async function readResults() {
  const sql = await database();
  const [row] = await sql`WITH counts AS (
      SELECT choice, COUNT(*)::int AS count
      FROM survey_responses, unnest(choices) AS choice GROUP BY choice
    ) SELECT (SELECT COUNT(*)::int FROM survey_responses) AS total,
      COALESCE((SELECT jsonb_object_agg(choice, count) FROM counts), '{}'::jsonb) AS counts`;
  return row;
}
