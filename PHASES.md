# Phase status against the updated master prompt

Written 23 October 2026. Source of the plan: `MASTER-PROMPT.md`. Source of what the code has: `AUDIT.md` and the commits on `main`.

Done means a rep can use it and the acceptance line for that slice is met. Partial means the slice exists and is honest about what it does not do. Not started means there is no working path.

| Phase | Status | What is on main | What the prompt still wants |
|---|---|---|---|
| 1. Public site | Partial | Real Pricing, Docs, API, Status, Community, Changelog. Footer no longer points at sign-in. Copy no longer mixes 4 and 5 setup steps. | Product screenshots, comparison table, industry pages, currency switcher, 60-second demo, Lighthouse 90, custom domain. No paid price until billing exists. |
| 2. Sign-up and setup | Partial | Email, password, Google. Five-step wizard that resumes after the browser closes. Sample data stays off after remove. Sessions list. | Magic link, phone code, company sign-on, 2FA, rotating refresh tokens, httpOnly cookies. |
| 3. Core CRM | Partial | Contact stage and consent, deal lines, lost reason, lead assignment with a reason, repeating tasks, bulk edit, share, JSON export, quiet hours. | Start-N-tasks queue, leaderboard, Facebook ads, meeting scheduler, price books, PDF quotes, e-signature, saved views, field-level permissions, virtual scroll for 100k rows. |
| 4. WhatsApp inbox | Partial | Per-workspace line, inbound webhook, thread, assignment, note, saved reply, 24-hour window, quote, Paystack link only when Paystack is connected. | Embedded signup, template manager, Instagram, SMS, voice dialer, voice-note transcription. |
| 5. Automation | Partial | Up to 10 steps, wait, branch, wait for a reply, Monitor line per step, five failures turn the flow off. | Drag-and-drop canvas, WhatsApp send from a flow, SMS, A/B variants, industry template library. |
| 6. Scores | Partial | Grade A–D, top reasons, what would raise it, forecast low/middle/high from 4,000 runs, duplicate review. | Trained model (held until 300 closed deals), agents, Ask Afri grounded in records, transcription. |
| 7. Reports | Next on this side | Dashboard and Forecast exist. A number does not open the records behind it. Owner names on reports can read Unassigned. | Click-through on every number, then quotas. Report builder and warehouse export come after that. |
| 8. Platform and API | Not started | API keys and webhooks exist. No OpenAPI, no MCP server, no marketplace. | Public REST v1, signed webhooks, ERP by events not a shared secret. |
| 9. Billing and NDPA | Not started | Honest pricing page. No card charge. Consent fields exist on a contact. | Plans, seats, Paystack for the plan, data-subject tools, grace period on delete. |
| 10. Mobile and offline | Not started | PWA claims. No offline queue, no FX lock, no language pack. | Field sales offline mode, NGN/GHS/KES/ZAR, local holidays. |
| 11. Suite | Not started | CRM and ERP are separate products. | Helpdesk, Projects, Marketing, one inbox, one billing account. |

## How the two builders split

This side (Grok) owns Phase 7 and the phases after it, one slice at a time.

The other builder (z.ai) was given `afri-crm-still-missing.md`: billing, magic link, phone code, company sign-on, Facebook lead ads, e-signature, M-Pesa, Instagram, SMS, dialer, WhatsApp from a flow, the flow canvas, and Ask Afri that only answers from records. Those items sit inside Phases 1 to 6 of the master prompt. They are not Phase 7.

## Rules that apply to both

- Do not break an existing route.
- Do not mark a message, a payment, or a signature as done unless the vendor accepted it.
- If a key is missing, say it is not connected.
- Every score and every assignment says why.
- Every row is scoped by `tenantId` or `workspaceId`.
- Do not train on customer data.
