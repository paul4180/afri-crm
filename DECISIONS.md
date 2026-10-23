# Decisions

Defaults for the upgrade. Change one only when a later prompt says so.

Read on 23 October 2026 against the updated Claude master prompt (`MASTER-PROMPT.md`). Section 3 of that prompt is an old snapshot (88 routes, a 2,400-line `crm.html`). The live numbers are in `AUDIT.md`: about 150 CRM routes, `crmapp.js` around 5,300 lines, `crm.html` around 3,100, `crm-studio.js` around 11,000. Production already refuses to boot if `JWT_SECRET` is empty.

## What stays

- The live app stays the Fastify server and the pages in `public/`. A second React app is not the product. The prompt asks for React + Vite in 5.1. The reason we do not switch now: the signed-in CRM is already a working SPA, and a rewrite would stop the phases. A later phase can move one screen at a time if the owner asks.
- The database stays SQLite on the Railway volume until a phase is about the move. The prompt asks for Postgres with row-level security. That is a real later job, not a silent swap under Phase 7. Customer rows stay scoped by `tenantId`. Login accounts use `workspaceId`, the same id.
- Existing routes stay. New ones are added beside them. Nothing the CRM already calls is renamed.
- Currency on screen is naira with commas (`₦2,500,000`) unless the workspace currency is something else. Phones display as `+234`. Times use `Africa/Lagos`.
- Sample records are marked `[Sample]`, load into an empty workspace once, and one remove clears them from every list, the inbox, and search. A refresh does not bring them back.
- Scores are rule-based and show the reason. A model is used only when a key is set and the workspace allows it. If it is not, the rule stands. We do not train a model until a workspace has at least 300 closed deals.
- WhatsApp is sent only when the line is connected, the window is open, and the contact has not refused. A flow does not claim a send it did not make.
- The public site is `public/landing.html`. The signed-in product is `/crm`. They stay separate.
- No paid price is invented. A paid plan appears only when `PLAN_PRICE_NGN` and Paystack are set.
- Items marked `[IDEA]` in the prompt are not built unless the owner asks for that idea.

## What the updated prompt changes for us

- Phase 7 is the next phase on this side: reports where a number opens the records behind it. The prompt also asks for a report builder, scheduled reports, coaching playlists, and a warehouse export. Those wait until the click-through works.
- Phase 1 in the prompt still wants real screenshots, a comparison table, industry pages, a currency switcher, and a Lighthouse score. The dead links and the honest pricing page are done. The rest of Phase 1 is not.
- The gaps listed in `afri-crm-still-missing.md` (billing, magic link, Facebook ads, e-signature, M-Pesa, Instagram, SMS, dialer, WhatsApp from a flow, a flow canvas, Ask Afri grounded in records) stay with the other builder. This side does not start those unless the owner moves them back.
- HubSpot prices in the prompt are not to be quoted on a page until checked live.
- NDPA features are Phase 9. A lawyer still has to review the legal wording before it is sold as compliance.
