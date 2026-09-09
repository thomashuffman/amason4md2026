# Jeremy L. Amason 2026 Website

React/Vite campaign website for Jeremy L. Amason for Maryland House of Delegates,
District 46.

## Quick Start

```bash
npm install
npm run dev
```

Then open the local URL Vite prints in the terminal.

## Editing Survey Text

Edit `src/surveyContent.json` to update survey headings, instructions, button labels,
confirmation messages, chart captions, and each issue's `title` and `description`.
The `sectionLabel` also sets the navigation link text. Keep option `id` values
stable and preserve `{count}` placeholders in response and selection labels.
Use valid JSON (double quotes and no trailing commas). Changes appear in the local
preview when saved.

## Survey Storage

The `/api/survey` Vercel Function uses Neon Postgres. Set `DATABASE_URL` (or
`POSTGRES_URL`) as a server-only environment variable. Never use a `VITE_` prefix
for credentials. Connect `neon-carmine-brush` to Preview only and
`amason-survey-production` to Production only. Database names are managed in
Vercel; the application uses the connection variable for its deployment.

The `survey_responses` table is created on first API use. Each response contains
a random receipt ID, exactly three issue IDs, and a timestamp. Only aggregate
counts are returned publicly. Retried receipt IDs cannot create extra rows;
the browser remembers successful submissions. This is not identity verification:
clearing browser storage or using another browser permits another response.

For local database testing, put a staging-only connection in the git-ignored
`.env.local`, then run `npm run dev`. Without a connection the API returns a
service-unavailable error rather than fabricated results. No production credentials
are needed for local testing. Run `npm test` and `npm run build` before pushing.

Staging submissions persist between deployments and stay separate from production.
This initial version has no CAPTCHA or per-person verification. Consider abuse
controls before collecting public production responses.

## Build

```bash
npm run build
```

The production output will be created in `dist/`.

## Suggested Next Steps

- Connect the signup form to a mailing list, CRM, or form service.
- Add donation, events, and voter information links as campaign infrastructure
  comes online.
- Replace or refine images in `public/` as final campaign photography becomes
  available.

## GitHub Upload

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```
