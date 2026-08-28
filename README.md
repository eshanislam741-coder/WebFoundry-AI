# SiteForge AI V3 — Vercel-ready

This version is structured for easy deployment to Vercel.

## Files

- `index.html` — SiteForge landing page + onboarding + website studio
- `api/generate.js` — Vercel serverless function that generates a website
- `api/edit.js` — Vercel serverless function that edits generated website content
- `api/_schema.js` — shared structured-output schema
- `package.json` — dependencies
- `vercel.json` — Vercel routing
- `.env.example` — example environment variables

## Deploy

1. Upload these files to a GitHub repository.
2. Import the repository into Vercel.
3. In Vercel → Project Settings → Environment Variables, add:
   - `OPENAI_API_KEY`
   - optionally `OPENAI_MODEL`
4. Redeploy if Vercel asks you to.

Never put the API key inside `index.html`.
