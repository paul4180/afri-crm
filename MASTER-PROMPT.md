# AFRI CRM — MASTER BUILD PROMPT FOR GROK

(Written from research on HubSpot, Salesforce, Pipedrive, Zoho, Close, Attio, African WhatsApp-commerce tools, and an audit of the existing Afri CRM landing page, sign-in flow and public GitHub README. Items marked [IDEA] are additions beyond the competitors.)

---

## 0. HOW TO USE THIS PROMPT (read first, human)

This document is too large for one Grok response. Do NOT paste it all and say "build everything". Instead:

1. Paste Sections 1–4 (role, rules, current state, target architecture) as the first message, every time you start a new Grok chat.
2. Then paste ONE phase from Section 6 at a time. Wait for it to be finished and tested before the next.
3. Attach or paste the real repo files Grok needs for that phase (`src/crmapp.js`, `public/crm.html`, `package.json`). Grok cannot see your repo unless you give it.
4. After each phase, ask Grok: "List every file you changed, every migration, and every test, then run the phase acceptance checklist."

---

## 1. ROLE AND GOAL

You are a senior staff engineer, product architect and applied ML engineer. You are upgrading **Afri CRM** into the best sales CRM for African businesses: better than HubSpot Sales Hub, Pipedrive, Zoho CRM, Close, Attio and Salesforce for a Nigeria-first, WhatsApp-first, mobile-first, low-bandwidth, multi-currency market.

Product positioning: "The CRM that knows your sales." Part of the **Afri OS** suite (Afri CRM and Afri ERP live; Helpdesk, Projects, Marketing planned).

Deliver the product in layers: Landing → Sign-up → Onboarding/Setup → Core CRM → Automation → AI/Algorithms → Channels → Analytics → Admin/Compliance → Platform/API → Suite expansion.

## 2. RULES OF ENGAGEMENT

- Build in small, testable increments. Each phase ends with: working code, migrations, tests, seed data, and a short changelog.
- Never break existing routes. Keep backward compatibility with the current 88 API routes or version them (`/api/v1`, `/api/v2`).
- Security first: no default secrets in production, hashed passwords, rate limiting, input validation on every route, audit log on every write.
- Every algorithm must be (a) explainable (show "why this score"), (b) work with zero training data (rule-based prior), and (c) improve automatically as the customer's own data grows.
- Every AI feature must work without paid AI (graceful fallback) and must respect a per-workspace AI budget.
- Mobile-first, works on 3G, installable PWA, offline-capable for core actions.
- Write code comments only where logic is non-obvious. Write tests for every algorithm with fixtures.
- When a decision is ambiguous, pick the sensible default, document it in `DECISIONS.md`, and continue. Do not stop to ask unless blocked.

## 3. CURRENT STATE (audit of what exists today)

### 3.1 Confirmed from the public GitHub README and live pages

| Area | What exists |
|---|---|
| Backend | Fastify 5 on Node 22+, `src/server.js` (~80 lines), `src/crmapp.js` (88 API routes, auth, lead scoring, workflows, sequences, audit, notifications), `src/collect.js` (email via Resend), `src/ai.js` (Gemini wrapper) |
| Database | SQLite via `node:sqlite`, one file on a Railway Volume at `/data` |
| Auth | Own JWT + bcrypt auth; Google sign-in; email/password; sign-up asks business name, name, email, password (min 8 chars); an "I already have CRM records under this email" claim flow tied to the ERP password |
| Frontend | Vanilla HTML+JS single-page app: `public/crm.html` (~2,400 lines) + `public/crm-studio.js`; no framework, no build step |
| AI | Gemini API, optional, powering an "Ask Afri" assistant |
| Email | Resend (notifications); Gmail/Outlook OAuth connect claimed on landing page |
| WhatsApp | Env vars `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_ID` (single global sender) |
| SDK | `public/sdk/afri.js` and `afri.py`; API keys via `X-API-Key`; webhooks |
| UI features seen | ⌘K command palette; quick-create menu (Contact, Company, Deal, Task, Lead); Ask box; dark mode; PWA claims; calendar on home dashboard |
| Modules claimed | Contacts, companies, deals/opportunities, tasks, calendar, drag-and-drop pipeline, lead scoring ("weights adapt to industry, channel and goal"), sequences, trigger-based workflows, quotes → ERP invoice, People page, owner-only account deletion |
| Ops | Dockerfile, `railway.toml`, `tests/` folder, 162 commits, ISC licence |
| Landing (Afri OS) | Hero, product suite (CRM Live, ERP Live, Helpdesk/Projects/Marketing "Soon"), features, 3-step "How it works", stats strip, footer with About/Blog/Careers/Press/Privacy/Terms/Security/NDPR links, newsletter box |

### 3.2 Problems and gaps found (fix these)

1. **Single-file SQLite** is a hard ceiling: no horizontal scale, weak concurrency, no point-in-time recovery, risky for multi-tenant SaaS.
2. **Tenant isolation is not evident.** Must verify every query is scoped by `workspace_id`; add row-level scoping tests.
3. **Frontend monolith** (one 2,400-line HTML file) will not scale to the planned feature set. Needs a component architecture, state management, design system and code splitting.
4. **WhatsApp is a single global token.** Needs per-workspace WhatsApp Business connection (embedded signup), templates, 24-hour window handling, inbound webhooks, shared inbox.
5. **Default JWT secret** (`dev-secret-change-me-later`) exists as a fallback. Must hard-fail in production.
6. **Landing inconsistencies:** onboarding described as both "5 steps in 2 minutes" and a "4-step transition"; "Documentation" and "API Reference" links just open the CRM; "Contact", "System Status" and "Community" are dead anchors; Blog/Careers/Press/About pages need real content; claims like "88+ API routes" and "$0 forever" need a pricing page that explains limits.
7. **Lead scoring is described but weights are not explainable** to the user, with no per-lead "why" panel and no feedback loop.
8. **No evidence of:** RBAC with custom roles, field-level permissions, custom objects/fields, duplicate detection, import/export wizard, bulk actions, saved views, forecasting, reporting builder, call logging/dialer, mobile app/offline mode, 2FA, SSO for teams, data residency controls, usage metering, billing.
9. **AI is a thin wrapper.** No agents, no tool use, no retrieval over CRM data, no guardrails, no cost controls, only one model vendor.
10. **Tests** exist but coverage is unknown; add CI.
11. **Cross-product coupling** to the ERP via Prisma and a shared JWT secret is fragile. Replace with a formal event bus + service API.

### 3.3 Existing landing page: visual and content audit (from screenshots of the live Afri OS site)

**Keep this as the starting point. Do not redesign from scratch. Refine, fix and extend it.**

**Layout, top to bottom (as it exists today)**
1. **Sticky top nav:** Afri OS logo (teal network-node icon in a dark rounded square, "Afri" in white/dark serif + "OS" in teal), links: Products ▾, Features ▾, How it works, Privacy, Terms, then "Log in" (text) and "Get started free" (solid teal pill button). The nav is transparent over the hero and turns white with a soft shadow on scroll.
2. **Hero (dark navy-to-indigo gradient with a teal glow):** eyebrow pill "● AFRI OS · THE OPERATING SYSTEM FOR AFRICAN BUSINESS"; huge serif headline "Run your entire business on **one African platform**" (last words in teal gradient); sub-paragraph (CRM, ERP and more, Google sign-up, Gmail and Calendar, "start closing deals today"); two buttons: primary "Get started free →" and secondary "See how it works" (ghost/outline); a trust row with teal ticks: "Free forever · Google SSO sign-up · One-click Gmail & Calendar · Mobile responsive".
3. **"One platform · many products" → "The Afri OS suite":** three cards on a light background. Afri CRM (CRM tile, mint) with "LIVE NOW" green dot; Afri ERP (ERP tile, lavender) with "LIVE NOW"; Afri OS Suite (OS tile, yellow) with "COMING SOON" orange dot. Each has a one-line description, a tick list, and a button ("Open Afri CRM →", "Open Afri ERP →", "See the roadmap").
4. **"Why teams choose Afri OS" → "Built different, on purpose":** 3×3 grid of feature cards with pastel icon tiles: Sign up with Google, Calendar auto-pulled, Beautiful by default, Mobile responsive, Privacy-first, African-first, Lead scoring built-in, Sequences & workflows, Command palette (⌘K). Cards lift with a teal top border on hover.
5. **Stats strip:** "5 sec — Sign up with Google", "1 click — Gmail & Calendar connect", "0 $ — Onboarding fee forever", "88+ — API routes ready".
6. **"Start in minutes, not weeks" → "How Afri OS works":** three numbered steps (teal circles on a dashed connector line), each with a mini browser-window mockup: 1 Sign up with Google, 2 Connect your inbox, 3 Start closing deals.
7. **Mid-page CTA:** "Get started free — no credit card →" with "Free forever · 1-click Gmail & Calendar · Mobile responsive".
8. **Closing banner (dark gradient):** "Run your business on the platform built for you."
9. **Dark footer:** logo + tagline, icon buttons (GitHub, email, arrow), four columns: Products (Afri CRM, Afri ERP, Helpdesk SOON, Projects SOON, Marketing SOON), Company (About, Blog, Careers, Press, Contact), Resources (Documentation, API Reference, Changelog, System Status, Community), Legal (Privacy Policy, Terms of Service, Security, NDPR / GDPR, and a teal "Delete my account →" link); newsletter box ("Get product updates — once a month, no spam"); © 2026 Afri OS; links Privacy · Terms · Open CRM.

**Visual language to preserve (inferred from screenshots; confirm in the code)**
- Primary teal (about `#0d9488`, matches the app's theme colour) on deep navy/indigo gradients; light warm-grey page background for content sections.
- Headlines in a bold, high-contrast serif; body and UI text in a clean modern sans (Inter-style). Large, confident type; generous spacing.
- Pastel icon tiles (mint, lavender, yellow, pink, blue), rounded cards, pill buttons, soft shadows, a small status pill system (LIVE NOW green, COMING SOON orange, SOON tag).
- Sticky nav that changes style on scroll; hover lift on cards.

**What is weak or wrong on the page today (fix in Phase 1)**
1. **No real product screenshots anywhere.** The "How it works" windows are abstract grey placeholder bars. Visitors never see the actual CRM. Replace with real, annotated product screenshots or a live interactive demo.
2. **No pricing page or nav link.** "Free forever", "0$ onboarding fee" and "no credit card" are promises with no plan table, limits or upgrade path. Add Pricing to the nav.
3. **No social proof:** no customer logos, testimonials, case studies, numbers or ratings. Add them (use real ones; show a "Be one of our first 100 teams" founder offer until there are real customers).
4. **No WhatsApp message on the landing page**, even though WhatsApp is the strongest African differentiator and appears on the sign-in screen. Make WhatsApp a headline feature with a visual.
5. **Mixed message:** the hero sells a whole "operating system" (CRM + ERP + more), while only the CRM and ERP exist and the rest is "coming soon". Lead with the CRM promise ("The CRM that knows your sales") and present the suite second; or use a hero toggle by product.
6. **Dead or misleading links:** in the footer, Documentation, API Reference and several others point to the CRM sign-in (`/crm`) instead of real pages; Contact, System Status and Community go nowhere; About/Blog/Careers/Press need real content. The hero "Products" and "Features" dropdowns need real destinations.
7. **Inconsistent copy:** "Free forever" and "no credit card" are both used; "0 $ onboarding fee forever" reads awkwardly (write "No setup fees"); the wizard is described as having a "4-step transition" in one place and "5 steps" in another; "88+ API routes ready" is a developer metric, not a customer benefit (replace with outcomes such as "Reply to leads in under 5 minutes").
8. **The page URL is a Railway subdomain** (`afri-crm-production.up.railway.app`). Move to a custom domain (for example `afri.com`/`afrios.com`/`afri.app`, whichever is available), with HTTPS, a branded email address and proper SEO.
9. **No FAQ, no comparison table, no security/NDPA proof section, no language or currency switcher, no demo video.**
10. **Privacy card says "No 30-day grace period nonsense"**: instant permanent deletion is risky for customers (accidental deletion) and informal in tone. Offer export-first and a short, configurable grace period; use professional wording.
11. **"Delete my account" link in the footer** is visible to all visitors; show it only inside Settings after sign-in.
12. **Accessibility and performance not verified:** check contrast on the teal-on-dark text and the pastel tiles, add alt text and focus states, and test weight on 3G.

> Note: the authenticated CRM app (home dashboard, pipeline, contacts) sits behind sign-in and was not visible to the research agent. The audit above is based on the landing page, sign-in/sign-up screens, and the repo README. Grok: before changing anything, read the real code and produce `AUDIT.md` listing every table, route, screen and background job actually present.

## 4. WHAT HUBSPOT HAS (benchmark — study and beat)

### 4.1 Navigation / product line (from the live HubSpot trial)

- **Left rail:** Home, Contacts, Companies, Deals, Tasks, Automation Overview, Agent Hub, Marketing Studio, then Sales (Activity Feed, Prospecting Agent, Sales Workspace). "More" opens a mega-menu: CRM, Marketing, Content, Sales, Revenue, Service, Data Management, Agents, Automation, Reporting, Development.
- **Sales submenu:** Sales Workspace, Calendar (new), Target Accounts, Prospecting Agent, Documents, Meetings Scheduler, Sequences, Activity Feed, Forecast, Coaching Playlists, Sales Analytics.
- **Home:** "Here's where to start today" action cards (Create contact, Create deal) + right panel "Your day at a glance" (meetings, tasks due today, activities, deals tabs).
- **Sales Workspace:** tabs Summary, Companies, Deals, Tasks, Schedule, Dashboard; widgets for Tasks, Outreach activities, a day schedule with Insights and Feed tabs.
- **Tasks:** All/Due today/Overdue/Upcoming views, filters (assigned to, type, stage, due date, queue), "Start N tasks" queue mode, board/table toggle, export, calendar sync prompt.
- **Automation Overview:** counts by object (Workflows, Sequences, Journeys, Chatflows, Contact lifecycles), workflow enrolment chart, most-used actions, "Discover apps to automate" (Zoom, Slack, Teams), "Create your first automation" templates, Review automation issues, Health tab, Analyze tab.
- **Agent Hub:** tabs Overview, Agents, Workflows, Needs attention, Context. "Context" holds company knowledge: Business, Customers (Ideal Customer Profiles, Personas), Team & process, Personal, Custom. One canvas combining agents and workflows (drag-and-drop, external triggers like Slack message, branches, "choose an existing agent").
- **Marketing Studio:** campaign insights, ranked recommendations, shared canvas, opt-out toggle.
- **Onboarding:** Start Guides (Marketing/Sales/Service/Content/Revenue) with a progress bar (e.g. 36%), "Set up the basics" (import contacts, invite teammates, understand properties) with time estimates, "Ready to connect" Gmail/Calendar/Outlook buttons, trial countdown banner, Trial Guide, Talk to Sales.

### 4.2 HubSpot's AI layer ("Breeze")

- Three pillars: Breeze Assistant, Breeze Agents, Breeze Intelligence (enrichment). 80+ embedded AI features.
- Core agents: Customer Agent (support chatbot; HubSpot reports ~65% average resolution), Prospecting Agent (signal-led outreach), Content Agent, Data Agent (clean CRM data).
- Beta agents: Closing, Company Research, Customer Health, Deal Loss, Blog Research, Personalisation, RFP.
- Breeze Studio to build/customise agents; tools define what agents can do; knowledge vaults; reporting on agent performance.
- Metered with **HubSpot Credits** (pay for what agents do; spend caps and pause).

### 4.3 Plan structure (verify live before quoting)

- Sales Hub: Free (up to 2 users), Starter (from roughly $7–20/seat), Professional (from roughly $90/seat), Enterprise above that.
- Professional/Enterprise unlock: lead scoring, sequences (about 5,000 per account), up to 300 (Pro) / 1,000 (Enterprise) custom workflows, lead form routing, forecasting (including across team hierarchies), conversation intelligence.

### 4.4 Other competitors, one line each

- **Salesforce:** deepest customisation, AppExchange, Agentforce AI; tiers $25 → $550/user/month; needs an admin.
- **Pipedrive:** best simple visual pipeline; $14–$79; fast rep adoption; deliberately narrow.
- **Zoho CRM:** most features per dollar; Zia AI; gamification (leaderboards, badges); dated UI; strongest inside the Zoho suite.
- **Close:** built-in dialer, SMS, power dialer, voicemail drop, call summaries, "Chloe AI"; $9–$139.
- **Attio:** flexible data model (Notion-like), real-time, "Ask Attio" AI; free to $69+.
- **Copper / Folk:** Google-Workspace-native and relationship-first CRMs.
- **African WhatsApp CRMs (ChatDaddy, Go4whatsup, SleekFlow, Rasayel, Chakra):** WhatsApp inbox, catalogues, Paystack/Flutterwave payment links in chat, abandoned-cart recovery, round-robin assignment, template broadcasts, NDPA-ready claims.

### 4.5 Where nobody wins in Africa (our opening)

No major CRM combines: WhatsApp-native inbox + payment-link-in-chat + naira/cedi/shilling/rand pricing + offline/low-data mode + local-language AI (Pidgin, Yoruba, Hausa, Igbo, Swahili) + NDPA compliance by default + built-in ERP/invoicing. That combination is Afri's moat.

---

## 5. TARGET ARCHITECTURE

### 5.1 Stack decisions (change only with a written reason)

- **Backend:** keep Node + Fastify (TypeScript migration, module-by-module). Modular monolith with clear domains: `identity`, `crm`, `inbox`, `automation`, `ai`, `analytics`, `billing`, `platform`.
- **Database:** migrate SQLite → **PostgreSQL** (managed, with PITR backups) using a migration tool (Drizzle or Prisma). Keep SQLite only for local dev. Add `workspace_id` on every table, enforced with Postgres Row-Level Security.
- **Search:** Postgres full-text + `pg_trgm` first; add OpenSearch/Meilisearch only when needed.
- **Vectors:** `pgvector` for semantic search/RAG over CRM data.
- **Queue/jobs:** Redis + BullMQ (or Postgres-based `pg-boss` to start). Needed for sequences, webhooks, enrichment, scoring, exports, imports.
- **Realtime:** WebSocket/SSE for live pipeline, inbox and notifications.
- **Events:** append-only `events` table (outbox pattern). Every domain action emits an event; workflows, scoring, analytics, webhooks and the ERP all consume events.
- **Frontend:** React + TypeScript + Vite (or SvelteKit), component library, TanStack Query, route-level code splitting, PWA with service worker, IndexedDB offline cache, optimistic updates.
- **Object storage:** S3-compatible (files, call recordings, voice notes, imports).
- **AI gateway:** one internal service that routes to multiple model providers (Gemini, Claude, Grok, open-source fallback), with caching, per-workspace budgets, prompt versioning, PII redaction and an eval harness.
- **Observability:** structured logs, error tracking, metrics, per-tenant usage metering, status page.
- **CI/CD:** GitHub Actions: lint, type-check, unit + integration tests, migration check, preview deploys.

### 5.2 Core data model (create/extend)

Standard objects: `workspace`, `user`, `role`, `team`, `contact`, `company`, `lead`, `deal`, `pipeline`, `stage`, `product`, `price_book`, `quote`, `quote_line`, `invoice_ref`, `task`, `activity` (call/email/WhatsApp/meeting/note/SMS), `conversation`, `message`, `sequence`, `sequence_step`, `enrollment`, `workflow`, `workflow_run`, `form`, `submission`, `document`, `file`, `tag`, `list`, `view`, `dashboard`, `report`, `goal`, `territory`, `audit_log`, `webhook`, `api_key`, `integration`, `ai_run`, `consent`.

Flexibility layer [IDEA, Attio-style]: **custom objects, custom fields (typed), custom relationships, per-object layouts and saved views**, so any business (school, clinic, logistics, real estate) can model itself without code.

Phone numbers stored in E.164 with country; currency stored as minor units + ISO code; all timestamps UTC with workspace timezone (default Africa/Lagos, WAT).

---

## 6. BUILD PHASES (paste one at a time)

### PHASE 1 — Landing, pricing and trust (public site)

Rebuild the public site as a fast, SEO-friendly, bilingual-ready marketing site. **Start from the existing Afri OS landing page described in Section 3.3: keep its look, nav, section order and brand, fix the 12 listed problems, and extend it with the new pages below.**

Landing page section order to deliver (home page):
1. Sticky nav: Products ▾, Features ▾, Pricing, How it works, Customers, Docs, Log in, Get started free (add a currency/language switcher).
2. Hero: lead with "The CRM that knows your sales." Sub-line about WhatsApp, payments and African teams. Primary CTA "Get started free", secondary "Watch 60-second demo" (real product video or interactive sandbox). Trust ticks stay.
3. Real product screenshot strip (pipeline board, WhatsApp inbox with a Paystack pay link, lead score with reasons, daily brief), on a phone and laptop frame.
4. "Built for how Africa sells": WhatsApp inbox, pay links in chat, naira/cedi/shilling/rand, offline mode, local languages, NDPA ready (each with a visual).
5. Suite section (CRM live, ERP live, Helpdesk/Projects/Marketing/Inbox with real roadmap dates and a "Get early access" button).
6. Feature grid (keep the 3×3 cards; replace "Command palette" and "Beautiful by default" with benefit-led cards, move them lower).
7. How it works with real screenshots (3 steps).
8. Social proof: customer logos, testimonials, results numbers (real only).
9. Comparison table: Afri vs HubSpot vs Pipedrive vs Zoho vs a WhatsApp-only tool.
10. Pricing teaser with link to the full pricing page.
11. Security and NDPA section (encryption, audit log, consent tools, data location).
12. FAQ.
13. Final CTA banner, then the full footer with every link working.

Pages: Home, Product (CRM), Suite (CRM/ERP/Helpdesk/Projects/Marketing), Pricing, Industries (retail, logistics/shipping, real estate, fintech, education, agencies, healthcare clinics), Compare (Afri vs HubSpot, vs Pipedrive, vs Zoho, vs Salesforce, vs WhatsApp-only tools), Integrations, Security & Compliance (NDPA), Customers, Blog, Docs, API Reference, Changelog, Status, Contact, About, Careers, Press, Privacy, Terms.

Requirements:
- Hero with a live, interactive product demo (sandbox workspace with fake data, no sign-up needed) [IDEA].
- Pricing in NGN, GHS, KES, ZAR, USD with a currency switcher, per-seat and a generous free plan with clearly stated limits; AI "credits" with transparent usage (HubSpot-style spend cap and pause).
- ROI calculator [IDEA]: sales team size × average deal × follow-up delay → estimated recovered revenue.
- WhatsApp demo strip: show a chat turning into a deal and a Paystack payment link.
- Fix every dead link found in the audit; all footer pages must have real content.
- Performance budget: LCP < 2.5s on 3G, total JS < 150KB on the landing page, Lighthouse ≥ 90.
- SEO: structured data, sitemap, OG images, hreflang for future languages. Analytics with consent banner.
Acceptance: all links resolve; pricing page matches billing plans in code; Lighthouse ≥ 90 mobile.

### PHASE 2 — Sign-up, identity and setup wizard

- Sign-up: Google, Microsoft, email+password, magic link, phone OTP (SMS/WhatsApp) [IDEA — many African users prefer phone-first].
- Workspace creation: business name, country, currency, timezone, industry, team size, main sales channel (WhatsApp / phone / walk-in / online / B2B visits), main goal (more leads / faster follow-up / more closed deals / collect payments).
- **Setup wizard (5 steps, ≤ 2 minutes, skippable, resumable):**
  1. Business profile and industry.
  2. Pick a **starter template** for the industry (pipeline stages, custom fields, sample sequences, scoring weights, dashboard) [IDEA].
  3. Connect channels: Gmail/Outlook, Google Calendar, WhatsApp Business (embedded signup), phone numbers.
  4. Import data: CSV/XLSX, Google Contacts, phone contacts, vCard, WhatsApp chat export, another CRM (HubSpot/Zoho/Pipedrive importers) with column mapping, duplicate preview, and undo.
  5. Invite team with roles; set first goal.
- "Where to start today" home with a progress bar and time estimates per task (HubSpot Start Guides pattern), plus a **Sample data toggle** that fills a demo pipeline and can be wiped in one click.
- Security: 2FA (TOTP + WhatsApp OTP), session management, device list, login alerts, password breach check, SSO/SAML for Business plan, invitation expiry, domain claiming.
- Replace the default JWT fallback; use short-lived access tokens + rotating refresh tokens; httpOnly cookies.
- Keep the "claim existing CRM records" flow but migrate it to a verified-email token flow.
Acceptance: new user reaches a populated, useful home dashboard in under 3 minutes; wizard can be resumed after closing the browser.

### PHASE 3 — Core CRM (parity with Pipedrive/HubSpot, then beyond)

Build each of these completely:

1. **Home / Sales workspace:** "Your day at a glance", next-best-actions list, tasks queue with "Start N tasks" focus mode, today's meetings, hot leads, stalled deals, goal progress, team leaderboard (gamification, Zoho-style) [IDEA: weekly streaks and badges].
2. **Contacts and companies:** unified timeline, associations, lifecycle stages (subscriber → lead → MQL → SQL → opportunity → customer → advocate), source/UTM tracking, merge duplicates, enrichment, GDPR/NDPA consent status, WhatsApp opt-in status, preferred language, preferred channel.
3. **Deals:** multiple pipelines, drag-and-drop board, stage rules (required fields, probability), deal age and stall indicators, products/line items, discounts with approval rules, multi-currency, loss reasons, deal rooms [IDEA: a shareable page with quote, files, chat, and pay button], win/loss analysis.
4. **Leads inbox:** capture from forms, WhatsApp click-to-chat, Facebook/Instagram lead ads, website chat, email, phone, QR codes, import; auto-assignment; speed-to-lead timer with SLA alerts.
5. **Tasks and calendar:** task types (call, WhatsApp, email, visit, demo), queues, recurring tasks, calendar sync both ways, meeting scheduler links with buffers and round-robin, group booking.
6. **Quotes and invoices:** product catalogue, price books, quote templates in PDF, e-signature, accept online, convert to ERP invoice, **Paystack/Flutterwave/Interswitch/OPay/Remita/M-Pesa pay links** on quotes, payment status synced back to the deal [IDEA: auto-close the deal when payment lands].
7. **Search and navigation:** ⌘K palette extended to commands + semantic search; global filters; saved views; bulk edit; bulk actions; keyboard shortcuts.
8. **Import/export:** wizard, background jobs, error reports, scheduled exports, full data export (NDPA portability).
9. **Permissions:** roles (Owner, Admin, Manager, Rep, Read-only, custom), team/territory-based record visibility, field-level permissions, audit log UI with diff, record-level sharing.
10. **Custom objects/fields/layouts** as described in 5.2.
11. **Documents and files:** attach to records, templates, tracking views.
12. **Notifications:** in-app, email, WhatsApp, push; per-user quiet hours; digest mode.
Acceptance: a rep can do a full day's work without leaving the app; all lists load < 1s for 100k records with pagination and virtual scrolling.

### PHASE 4 — Channels: WhatsApp-first shared inbox

- Per-workspace WhatsApp Business Cloud API connection via embedded signup; multiple numbers; verification guidance (business verification can take days — show status and next steps).
- Shared inbox: assignment, internal notes, @mentions, collision detection, saved replies, canned templates, quick actions (create deal, send quote, send pay link).
- 24-hour customer-service window tracker; template message manager (marketing/utility/authentication) with approval status; opt-in/opt-out handling; broadcast lists with rate limits and compliance guardrails.
- Catalogue and product messages; order/quote cards; abandoned-lead re-engagement.
- Voice notes: auto-transcribe (Nigerian English, Pidgin, Yoruba, Hausa, Igbo, Swahili where models allow), summarise, extract tasks [IDEA].
- Email: Gmail/Outlook two-way sync, open/click tracking, templates, scheduled send, snippets, shared team inbox.
- SMS (Termii, Africa's Talking, Twilio) and **voice/dialer** (click-to-call, call logging, recording with consent, voicemail drop, power dialer — Close-style).
- Other channels: Instagram DMs, Facebook Messenger, Telegram, website live chat widget, USSD/SMS fallback for low-data customers [IDEA].
- Unified conversation timeline per contact across all channels.
Acceptance: inbound WhatsApp message creates/updates a contact, opens a conversation, can be assigned, and a quote with a Paystack link can be sent from the thread.

### PHASE 5 — Automation engine (workflows + sequences + agents on one canvas)

Beat HubSpot's separate Workflows/Sequences/Chatflows/Journeys by unifying them (HubSpot's Agent Hub is moving this way).

- **Visual builder:** drag-and-drop canvas, triggers (record created/updated, stage change, form submit, inbound message, no reply for N days, payment received, schedule, webhook, external app), conditions/branches, delays (business-hours aware, WAT), actions (create task, send WhatsApp/email/SMS, update field, assign owner, create deal, call webhook, run AI agent step, wait for reply, human approval step).
- **Sequences:** multi-channel (WhatsApp + email + SMS + call task), auto-pause on reply, send windows, throttling, A/B variants, per-step analytics.
- **Run history and debugging:** per-record run log, replay, dry-run mode, "Review automation issues" and Health dashboard, auto-disable on repeated failure, usage limits.
- **Template library** by industry (speed-to-lead, quote follow-up, payment reminder, win-back, onboarding, birthday/festive, event invitations) [IDEA: festive/seasonal calendar for Nigeria and Africa].
- **Guardrails:** frequency caps per contact, global suppression list, consent checks before every outbound message.
Acceptance: a 10-step workflow with a branch and a wait-for-reply step runs reliably, is idempotent on retries, and is fully visible in run history.

### PHASE 6 — AI layer and Algorithms (the differentiator)

Build an **AI Gateway** and a **Scoring/Prediction service**. All models start rule-based, then learn per workspace. Every score exposes top reasons.

#### 6A. Algorithm catalogue (implement in this order)

1. **Adaptive lead scoring (fit + intent + engagement)**
   - Cold start: weighted rules from industry template (fit: company size, role, location, source; intent: pricing-page views, replies, quote opened, WhatsApp response speed; engagement: recency/frequency decay).
   - Learning: logistic regression with L2 regularisation; upgrade to gradient-boosted trees after N≥300 closed outcomes. Bayesian shrinkage toward the industry prior so small teams get stable weights.
   - Outputs: score 0–100, A/B/C/D grade, probability to convert, **top 3 reasons**, and "what would raise this score".
   - Time decay: exponential half-life per signal type. Weekly automatic retrain; drift monitor; "explain" panel; manual override with audit.
2. **Deal win-probability and time-to-close**
   - Survival/hazard model on stage durations plus features (deal age vs stage median, contacts engaged, last-touch gap, discount, competitor, quote viewed). Replace fixed stage probabilities.
3. **Pipeline forecasting**
   - Three views: weighted pipeline, historical-conversion cohort forecast, and **Monte Carlo simulation** (10k runs sampling each deal's win probability and close date) producing P10/P50/P90 revenue ranges. Team and territory roll-ups; forecast categories (commit / best case / pipeline); forecast change tracking week over week.
4. **Next-best-action engine**
   - Contextual bandit (Thompson sampling) choosing among actions (call, WhatsApp, send quote, send case study, schedule demo, escalate) using reward = reply/meeting/stage advance. Falls back to rules. Surfaced as a ranked list on Home and on each record.
5. **Best-time-to-contact / send-time optimisation**
   - Per-contact response-time histograms in local time with Bayesian smoothing; fall back to segment defaults; respects quiet hours and prayer/market-day patterns where configured [IDEA].
6. **Smart lead routing**
   - Capacity-aware weighted round robin + skill/language/territory match + historical win-rate of rep on similar leads + speed-to-lead SLA fallback; rebalance when a rep is away. Explainable "why assigned".
7. **Duplicate detection and entity resolution**
   - Normalise (E.164 phones, lower-case emails, strip company suffixes like Ltd/Plc/Nig). Blocking keys (phone suffix, email domain, name prefix) → pairwise scoring with Jaro-Winkler + token-set similarity + phonetic (Soundex/Metaphone adapted for Nigerian names) → threshold bands (auto-merge / review / ignore). Merge with field-level survivorship rules and undo.
8. **Data quality and enrichment agent**
   - Detect invalid emails/phones, missing fields, stale records, outliers; suggest fixes; enrichment from public sources with provenance; confidence scores; user approves in bulk (like HubSpot Data Agent).
9. **Conversation intelligence**
   - Transcribe calls and voice notes; summarise; extract objections, budget, timeline, decision-makers, competitors, next steps; talk/listen ratio; sentiment and intent detection tuned for Nigerian English and Pidgin; auto-create tasks and update fields (with approval).
10. **Customer health and churn risk**
    - Features: payment delays, support tickets, usage, response sentiment, renewal date, NPS. Gradient-boosted or survival model; health 0–100 with reasons; auto-playbooks.
11. **Deal-loss and win analysis agent**
    - Cluster loss reasons (text + structured), surface patterns by source/rep/competitor/price band; recommend changes.
12. **Discount and pricing guidance** [IDEA]
    - Learn the discount level at which win rate stops improving per segment; warn when a quote is above/below optimum; approval routing.
13. **Payment propensity and collections** [IDEA]
    - Predict days-to-pay from customer history; schedule WhatsApp reminders at optimal times; escalate overdue invoices; ties into Afri ERP receivables.
14. **Customer-trust / credit signal** [IDEA, opt-in and compliant]
    - Internal reliability score from payment and delivery history so merchants can decide on credit terms. Must be explainable and honour NDPA rules on automated decisions.
15. **Attribution and channel ROI**
    - First-touch, last-touch, linear and position-based attribution; cost per lead and per won deal by channel (WhatsApp ads, Facebook, referrals, field visits).
16. **Anomaly detection**
    - Alerts on sudden drops in lead volume, reply rates, response time SLA breaches, unusual export/download activity (security), and suspicious logins.
17. **Segmentation and lookalikes**
    - RFM segmentation, k-means/HDBSCAN clustering of customers, "find more like my best customers" for the Prospecting agent.
18. **Semantic search / RAG**
    - Embeddings over notes, emails, messages, documents; permission-aware retrieval; citations back to records.

#### 6B. AI agents (Breeze-style, built as Afri "Autopilots")

Each agent has: goal, tools (CRM read/write, send message, create task, search, enrich), knowledge (workspace "Context"), guardrails, approval mode (suggest / ask-before-act / autonomous), spend cap, and a run log.

- **Prospecting Autopilot:** finds leads matching ICPs, researches the company, drafts personalised WhatsApp/email, enrols in sequence.
- **Inbox Autopilot (Customer agent):** answers FAQs from the knowledge base on WhatsApp 24/7, qualifies, books meetings, hands off to a human with a summary.
- **Closing Autopilot:** nudges stalled deals, drafts follow-ups, prepares quotes, flags risks.
- **Data Autopilot:** dedupes, fixes, enriches.
- **Daily Brief Autopilot** [IDEA]: every morning (WAT) sends each rep a WhatsApp/email brief: top 5 actions, meetings, at-risk deals, forecast change.
- **Manager Coach Autopilot** [IDEA]: weekly coaching insights per rep from call/message analysis.
- **Ask Afri (assistant):** natural-language questions and commands over CRM data ("show deals over ₦2m stuck in negotiation", "draft a follow-up to Ada in Pidgin"), with safe tool use and confirmations before writes.
- **Agent builder:** no-code studio to create custom agents from templates, attach tools and knowledge, test in a sandbox, publish, monitor ("Needs attention" queue like HubSpot's Agent Hub).
- Languages: English, Nigerian Pidgin, Yoruba, Igbo, Hausa, Swahili, French first; the UI itself translatable (i18n).

#### 6C. AI platform requirements

- Multi-provider routing with fallback and cost-based selection; response caching; streaming.
- Prompt registry with versions and A/B tests; offline eval set per feature; regression tests in CI.
- PII redaction before sending to third-party models; workspace setting to disable AI or restrict data; no training on customer data.
- Per-workspace credits and spend caps, usage dashboard, pause switch; show cost per agent run.
- Human-in-the-loop approvals, full audit of every AI action, one-click undo for AI writes.
- Hallucination controls: ground answers in retrieved records, show sources, refuse when evidence is missing.

Acceptance: each algorithm has a spec doc, unit tests with fixtures, a metrics notebook/report (AUC/precision/calibration where applicable), an "explain" UI, and a feature flag.

### PHASE 7 — Analytics, reporting and forecasting UI

- Dashboards: Sales performance, Pipeline health, Activity, Funnel and conversion, Source/channel ROI, Response time/SLA, Forecast, AI agent performance, Team leaderboard.
- Report builder (drag-and-drop dimensions/measures, filters, groupings, charts, pivot), scheduled email/WhatsApp reports, share links, embed, export to CSV/XLSX/PDF.
- Goals and quotas per rep/team/territory with attainment tracking.
- Coaching playlists [HubSpot pattern]: curated calls/messages per skill for rep training.
- Cohort and retention analysis; revenue waterfall; deal velocity.
- Data warehouse export (BigQuery/Postgres replica) for the Business plan.
Acceptance: any dashboard number is traceable (click-through) to underlying records.

### PHASE 8 — Platform, integrations and developer experience

- Public REST API v1 + OpenAPI spec + generated SDKs (JS, Python, PHP) + Postman collection; webhooks with signatures and retries; OAuth apps; rate limits and usage dashboard.
- **MCP server** and AI-tool endpoints so other AI assistants can operate Afri CRM [IDEA].
- Integration marketplace: Google Workspace, Microsoft 365, Zoom, Google Meet, Slack, Microsoft Teams, Zapier, Make, n8n, Shopify, WooCommerce, Jumia/Konga sellers, Paystack, Flutterwave, Interswitch, OPay, Remita, M-Pesa, Stripe, QuickBooks/Xero, Mailchimp, Calendly, Typeform, Meta Lead Ads.
- Embeddable forms and chat widget; tracking script; server-side events.
- Sandbox workspaces for developers; changelog and docs site with copy-paste examples.
- Afri ERP bridge: event-based (`quote.accepted` → invoice, `payment.received` → deal update) instead of shared DB/JWT secret.

### PHASE 9 — Admin, billing, compliance and trust

- **Billing:** plans, seats, usage metering (messages, AI credits, storage, automation runs), invoices, local payment methods (cards, bank transfer, USSD, mobile money), proration, dunning, tax/VAT handling, trial with countdown (HubSpot pattern) and a clear "what happens at trial end".
- **NDPA 2023 compliance by default** (Nigeria Data Protection Act in force since 12 June 2023, enforced by the NDPC): consent records and lawful-basis tagging on every contact; privacy notice generator; data subject request tools (access, correction, deletion, portability, objection); retention policies; processing-records export; DPIA templates; breach logging and notification workflow; data-processing agreement for customers; cross-border transfer controls and region choice; guidance on registration of data controllers/processors "of major importance" and DPO appointment; protections around fully-automated decisions and profiling (offer a human-review route for scoring-based decisions that affect individuals). Also support GDPR, POPIA (South Africa), Kenya DPA and Ghana DPA settings.
- Security: encryption at rest and in transit, field-level encryption for sensitive fields, IP allowlists, SSO/SAML/SCIM, audit-log export, backup and restore UI, status page, penetration-test checklist, SOC2-ready controls roadmap.
- Admin console: users, roles, teams, territories, data model, integrations, usage, AI settings, security, billing, domains, branding (white-label for agencies/resellers [IDEA]).
- Owner-only account deletion (existing) upgraded with export-first, a configurable grace period, and an audit trail.

### PHASE 10 — Mobile, offline and Africa-specific differentiators

- Installable PWA, then React Native/Capacitor app: push notifications, call/WhatsApp deep links, contact-book import, camera scan of business cards (OCR → contact) [IDEA].
- **Offline-first field sales mode:** queue writes locally, sync with conflict resolution (last-writer-wins per field with audit), GPS check-in at visits, route planning for daily visits, photo attachments, offline quotes [IDEA].
- Data-saver mode: compressed images, lazy lists, minimal polling.
- Multi-currency and FX: workspace base currency + deal currency, daily rates, historical rate locking, formatted for NGN/GHS/KES/ZAR/XOF/XAF/EGP/USD.
- Local calendar intelligence: public holidays, festive peaks, business hours per country, WAT/EAT/CAT/SAST time zones.
- Language packs; right-to-left readiness; plain-language UX for first-time CRM users.
- Reseller/agency program, referral rewards, and a partner directory [IDEA].
- Template marketplace (community-built pipelines/automations) [IDEA].

### PHASE 11 — Afri OS suite expansion (Helpdesk, Projects, Marketing, Inbox)

- **Helpdesk:** tickets, knowledge base, SLAs, WhatsApp-first support, customer agent, CSAT; shares contacts and conversations with the CRM.
- **Projects:** milestones, tasks, delivery tracking tied to won deals.
- **Marketing:** email campaigns, forms, landing pages, WhatsApp broadcasts, segments, campaign analytics; a "Marketing Studio"-style insights page with ranked recommendations.
- **Unified Inbox:** WhatsApp, email, SMS, social in one place across products.
- One workspace, one sign-in, one data layer, one billing account, one automation canvas.

---

## 7. NON-FUNCTIONAL TARGETS

- API p95 < 300ms; UI interactions < 100ms perceived; imports of 100k rows in < 5 minutes in the background.
- 99.9% uptime target; daily backups; documented restore drill.
- Accessibility WCAG 2.1 AA; keyboard-navigable; screen-reader labels.
- Test pyramid: unit (algorithms, rules), integration (API + DB with tenant isolation tests), end-to-end (sign-up → setup → deal won), load tests, security tests.
- Feature flags and staged rollouts per workspace.

## 8. DESIGN SYSTEM

- Keep the current brand direction from the landing page (teal accent on navy/indigo gradients, serif display headlines with a clean sans for UI text, pastel icon tiles, pill buttons, rounded cards, soft shadows, glass-morphism, dark mode) but formalise tokens: colour, type, spacing, radius, elevation, motion. Use the same tokens in the marketing site, sign-up, wizard and the CRM app so the whole journey feels like one product. Keep status pills (Live, Soon) as a reusable component.
- Components: data table with virtualisation, kanban, timeline, command palette, rich inline editors, empty states with a single clear next action, skeleton loaders, toasts, side-panel record previews.
- Empty states always teach and offer one primary action ("Create your first deal", "Import contacts").
- Every screen designed mobile-first; bottom navigation on phones; thumb-reach actions.

## 9. DELIVERABLES GROK MUST PRODUCE EACH PHASE

1. Updated code and migrations (with rollback).
2. Tests and CI green.
3. `AUDIT.md` (once), `DECISIONS.md` (running), `CHANGELOG.md`, `API.md`/OpenAPI updates.
4. A demo script: exact steps to verify the phase in the UI.
5. A list of known limitations and the next recommended phase.

## 10. FIRST MESSAGE TO SEND TO GROK (copy-paste)

"Read Sections 1–5 of the Afri CRM master prompt. I will now give you the repository files. First produce AUDIT.md: list every database table, API route, UI screen, background job, integration, and environment variable that actually exists, and flag security risks. Then propose the PostgreSQL migration plan and the tenant-isolation test suite. Do not start Phase 1 until I confirm AUDIT.md."

---

## 11. RESEARCH NOTES AND CAVEATS

- HubSpot plan prices and limits come from HubSpot's pricing page text and change often; verify before publishing comparison pages.
- WhatsApp user counts for Nigeria vary by source (roughly 51M to 90M); do not quote a single figure on marketing pages without a citable source.
- HubSpot's reported ~65% Customer Agent resolution rate is HubSpot's own figure.
- NDPA obligations (registration, DPO, audits, cross-border transfer) depend on whether the customer is a data controller/processor "of major importance"; have a Nigerian data-protection lawyer review the compliance features and legal templates.
- WhatsApp Business API rules, template categories and pricing change; check Meta's current documentation during Phase 4.
