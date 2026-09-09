import { neon } from '@neondatabase/serverless';

let ready;
let client;

async function database() {
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
    )`
  ]).catch((error) => { ready = undefined; throw error; });
  await ready;
  return client;
}

export async function saveResponse(id, choices) {
  const sql = await database();
  const rows = await sql`INSERT INTO survey_responses (id, choices)
    VALUES (${id}::uuid, ${choices}::text[])
    ON CONFLICT (id) DO NOTHING RETURNING id`;
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
