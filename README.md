# Afri CRM

The selling product — a standalone CRM for African sales teams.

## Tech stack

- **Backend:** Fastify 5 (Node.js 22+)
- **Database:** SQLite via `node:sqlite` (built-in, no external DB server needed)
- **Auth:** JWT + bcrypt (own auth — separate from ERP)
- **Frontend:** Vanilla HTML + JS (no build step, no framework)
- **AI:** Gemini API (optional, for the "Ask Afri" assistant)
- **Email:** Resend API (optional, for notifications)

## What's in here

| Path | What |
|---|---|
| `src/server.js` | Minimal Fastify server (~80 lines) — serves CRM only |
| `src/crmapp.js` | CRM core: 88 API routes, auth, lead scoring, workflows, sequences, audit, notifications |
| `src/collect.js` | Shared utilities (email sending via Resend) |
| `src/ai.js` | Gemini AI wrapper |
| `public/crm.html` | CRM UI (single-page app, ~2400 lines) |
| `public/crm-studio.js` | CRM client-side JS + CSS overrides |
| `public/sdk/` | Public SDK (afri.js for JS, afri.py for Python) |

## Local development

```bash
# Install deps
pnpm install

# Set env vars
export JWT_SECRET="your-secret-here"
export CRM_DATA_DIR="/tmp/afri-crm-data"  # where crm.sqlite lives

# Run dev server (hot-reload on file changes)
pnpm dev

# Or run production
pnpm start
```

Visit `http://localhost:3000/` — you'll see the CRM login page.

## Environment variables

| Variable | Required | Default | What |
|---|---|---|---|
| `JWT_SECRET` | ✅ | `dev-secret-change-me-later` | Signs auth tokens. Set to same value as afri-erp for SSO. |
| `CRM_DATA_DIR` | ❌ | `./data` | Where the crm.sqlite file lives. Set to `/data` on Railway with a Volume. |
| `PORT` | ❌ | `3000` | Server port (Railway auto-sets this) |
| `NODE_ENV` | ❌ | — | Set to `production` to hide error stacks |
| `GEMINI_API_KEY` | ❌ | — | For the "Ask Afri" AI assistant |
| `RESEND_API_KEY` + `MAIL_FROM` | ❌ | — | For sending email notifications |
| `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_ID` | ❌ | — | For WhatsApp messaging |

## Deployment (Railway)

1. Create a new Railway service from this repo
2. Add a Volume mounted at `/data` (for persistent SQLite)
3. Set env vars: `JWT_SECRET`, `CRM_DATA_DIR=/data`
4. Railway auto-deploys on push to `master`

## Cross-product features (optional)

The CRM can optionally connect to the ERP database (Prisma) for:
- Listing users (for the People page + owner dropdowns)
- Creating ERP invoices from accepted CRM quotes
- Showing tenant/company name on PDF invoices
- "Claim" feature during signup (use ERP password to inherit CRM records)

These features gracefully degrade if the ERP database isn't available — all Prisma calls are wrapped in try/catch.

## License

ISC
