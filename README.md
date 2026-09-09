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
preview when saved. The survey currently uses fictional results and does not save responses.

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
