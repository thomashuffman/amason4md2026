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

### Other Answers

Other is one of the three choices and requires 1-50 characters. The API validates
the text and stores it in the nullable `other_text` column, added automatically
without changing existing submissions. Public answers are returned as plain text
in pages of 20, oldest first, inside a scrollable results disclosure. Answers are
not moderated; the form warns visitors not to include personal contact details.

### Message Jeremy

The contact dialog calls `/api/message`, which sends plain-text email through
Resend to the fixed address `amason4md2026@gmail.com`. Copy is editable in
`src/messageContent.json`. Contact messages are not saved in the survey database.

To enable delivery, create a Resend account, verify a sender domain (add Resend's
DNS records wherever the domain's DNS is managed), then add these server-only
Vercel environment variables to Preview:

- `RESEND_API_KEY`: a Resend sending API key, marked sensitive.
- `CONTACT_FROM_EMAIL`: an address on that verified domain, for example
  `Campaign Website <website@your-verified-domain>`.

The sender must not be the visitor's address or an unverified Gmail address.
The visitor's address is used as Reply-To. Do not prefix secrets with `VITE_`.
Redeploy the preview after setting the variables. Configure Production separately
only when approved. Preview emails have a `[STAGING]` subject prefix but still go
to the campaign inbox. Without configuration, the form disables sending and
reports that email is unavailable; it never claims an email was delivered.

Email retries use Resend idempotency keys (24-hour provider window). A honeypot and
database-backed limit of five attempts per network address per hour reduce spam.
Only expiring keyed IP fingerprints are stored for that limit. This is basic abuse
protection, not CAPTCHA. The native dialog supports keyboard focus containment,
Escape to close, and internal scrolling on small screens.

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
