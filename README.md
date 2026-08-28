# SiteForge AI — real OpenAI API version

This version connects the business onboarding form to a server-side OpenAI API call.

## 1. Install Node.js

Use a current LTS version of Node.js.

## 2. Install dependencies

In this folder:

```bash
npm install
```

## 3. Create your API key

Create an OpenAI API key in the OpenAI API dashboard. Keep it secret and do NOT put it in `public/index.html`.

On Windows PowerShell:

```powershell
$env:OPENAI_API_KEY="YOUR_KEY_HERE"
```

Or create a `.env` file if you add a dotenv package later. This starter intentionally uses an environment variable directly.

## 4. Start SiteForge

```bash
npm start
```

Open:

http://localhost:3000

## How it works

The browser sends the business form to:

`POST /api/generate`

The server calls the OpenAI Responses API and requests structured JSON containing:

- headline
- subheadline
- CTA
- about section
- services
- FAQs
- SEO title
- SEO description

The frontend then renders the generated content.

## Production

Before accepting real customers, add authentication, rate limiting, payment processing, database storage, logging, abuse protection, and deployment secrets. Never expose your OpenAI API key in client-side code.

The `OPENAI_MODEL` environment variable is configurable so you can select an API model available to your project.


## V2: Website Studio

This version adds:
- Full generated-site preview with hero, about, services, FAQ, and contact sections.
- "Edit with AI" so the owner can describe changes in plain English.
- `/api/edit` server endpoint that sends the current website plus an edit instruction to OpenAI.
- A simple studio interface for reviewing and publishing.

The publish button is intentionally a placeholder. A production version should connect it to a hosting/deployment system and custom-domain workflow.
