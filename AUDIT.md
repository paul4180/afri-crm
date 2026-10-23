# Audit

Read from the code on 23 October 2026. Nothing in the product was changed to write this.

The note that came with the prompt is out of date in three places. `crmapp.js` is 5,294 lines and exposes 150 routes, not 88. `crm.html` is 3,107 lines and `crm-studio.js` is 10,921 lines. Production already refuses to boot if `JWT_SECRET` is missing. The fallback `dev-secret-change-me-later` is used only when `NODE_ENV` is not production, and also still used to sign two webhook checks inside `crmapp.js`.

## Tables

SQLite, one file. Customer rows carry `tenantId`. Login accounts carry `workspaceId`, which is the same id.

- `companies`
- `contacts`
- `leads`
- `deals`
- `activities`
- `products`
- `quotes`
- `quote_lines`
- `agent_runs`
- `workspace`
- `crm_workspaces`
- `crm_accounts`
- `connections`
- `tool_apps`
- `tickets`
- `ticket_replies`
- `emails`
- `targets`
- `campaigns`
- `notes`
- `sequences`
- `sequence_runs`
- `inbox_emails`
- `objects`
- `audit`
- `fields`
- `field_values`
- `pipelines`
- `stages`
- `tags`
- `record_tags`
- `teams`
- `team_members`
- `workflows`
- `workflow_runs`
- `notifications`
- `crm_sessions`
- `crm_events`
- `crm_permissions`
- `crm_prefs`
- `crm_api_keys`
- `crm_webhooks`

Search indexes:

- `fts_contacts`
- `fts_companies`
- `fts_deals`
- `fts_leads`
- `fts_activities`

## Routes

150 under the CRM, plus these on the server: `GET /`, `/crm`, `/privacy`, `/terms`, `/about`, `/blog`, `/careers`, `/press`, `/health`.

- `GET /crm/api/`
- `POST /crm/api/`
- `PATCH /crm/api/`
- `GET /crm/api/home`
- `GET /crm/api/forecast`
- `POST /crm/api/import/contacts`
- `POST /crm/api/leads/:id/convert`
- `GET /crm/api/quotes`
- `POST /crm/api/quotes`
- `POST /crm/api/quotes/:id/:action`
- `POST /crm/api/signup`
- `POST /crm/api/login`
- `GET /crm/api/admin/list-accounts`
- `POST /crm/api/admin/reset-password`
- `POST /crm/api/admin/wipe-all`
- `GET /crm/api/me`
- `POST /crm/api/session`
- `GET /crm/api/sso/google/start`
- `GET /crm/api/sso/google/callback`
- `GET /crm/api/notifications`
- `POST /crm/api/notifications/read`
- `GET /crm/api/notifications/stream`
- `GET /crm/api/note-prefs`
- `POST /crm/api/note-prefs`
- `GET /crm/api/setup`
- `DELETE /crm/api/account`
- `POST /crm/api/setup`
- `GET /crm/api/tools`
- `GET /crm/api/email/inbox`
- `GET /crm/api/email/message/:id`
- `POST /crm/api/tool-apps`
- `DELETE /crm/api/connect/:provider`
- `GET /crm/api/connect/:provider`
- `GET /crm/api/connect/google/callback`
- `GET /crm/api/connect/microsoft/callback`
- `GET /crm/api/calendar/plan`
- `POST /crm/api/calendar/sync`
- `GET /crm/api/day`
- `GET /crm/api/tickets`
- `POST /crm/api/tickets`
- `POST /crm/api/tickets/:id/close`
- `GET /crm/api/tickets/:id`
- `POST /crm/api/tickets/:id/replies`
- `PATCH /crm/api/tickets/:id`
- `POST /crm/api/contacts/:id/email`
- `GET /crm/api/contacts/:id/emails`
- `POST /crm/api/contacts/:id/merge`
- `GET /crm/api/contacts/:id/duplicates`
- `GET /crm/api/leads/:id/duplicates`
- `GET /crm/api/duplicates/scan`
- `GET /crm/api/forecast/ai`
- `GET /crm/api/target`
- `POST /crm/api/target`
- `GET /crm/api/guide`
- `POST /crm/api/guide`
- `GET /crm/api/campaigns`
- `POST /crm/api/campaigns`
- `POST /crm/api/campaigns/log`
- `POST /crm/api/agent`
- `GET /crm/api/brain`
- `GET /crm/api/leads/scoreboard`
- `GET /crm/api/lead-scores`
- `GET /crm/api/leads/:id/score`
- `POST /crm/api/leads/:id/auto-rate`
- `GET /crm/api/inbox/folders`
- `GET /crm/api/inbox/emails`
- `GET /crm/api/inbox/emails/:id`
- `PATCH /crm/api/inbox/emails/:id`
- `POST /crm/api/inbox/emails/:id/move`
- `POST /crm/api/inbox/emails/:id/reply`
- `POST /crm/api/inbox/emails/:id/create-contact`
- `GET /crm/api/inbox/duplicates`
- `POST /crm/api/contacts/detect-duplicates`
- `GET /crm/api/leads/:id/suggestions`
- `POST /crm/api/leads/:id/suggestions/apply`
- `POST /crm/api/ai/summarize`
- `POST /crm/api/ai/summarize-and-attach`
- `GET /crm/api/record/:type/:id`
- `GET /crm/api/people`
- `POST /crm/api/people`
- `GET /crm/api/workflows`
- `POST /crm/api/workflows`
- `PATCH /crm/api/workflows/:id`
- `GET /crm/api/runs`
- `POST /crm/api/hooks/:id/test`
- `GET /crm/api/sequences`
- `POST /crm/api/sequences`
- `PATCH /crm/api/sequences/:id`
- `GET /crm/api/sequences/:id/plan`
- `POST /crm/api/sequences/:id/enroll`
- `POST /crm/api/quiet-check`
- `POST /crm/api/agent-brain`
- `GET /crm/api/analytics`
- `GET /crm/api/reports`
- `GET /crm/api/audit`
- `GET /crm/api/backups`
- `POST /crm/api/backups`
- `GET /crm/api/fields`
- `POST /crm/api/fields`
- `POST /crm/api/field-values`
- `GET /crm/api/pipeline`
- `POST /crm/api/pipelines`
- `POST /crm/api/pipelines/:id/default`
- `POST /crm/api/stages`
- `PATCH /crm/api/stages/:id`
- `GET /crm/api/tags`
- `POST /crm/api/tags`
- `POST /crm/api/tags/attach`
- `GET /crm/api/tags/on/:object/:id`
- `GET /crm/api/teams`
- `POST /crm/api/teams`
- `POST /crm/api/teams/:id/members`
- `POST /crm/api/notes`
- `POST /crm/api/brain/task`
- `GET /crm/api/objects`
- `POST /crm/api/objects`
- `PATCH /crm/api/objects/:id`
- `GET /w/:id`
- `GET /crm/form/:id`
- `POST /crm/form/:id`
- `POST /crm/api/pay-links`
- `GET /crm/pay/:id`
- `POST /crm/in/:id`
- `GET /crm/api/search`
- `GET /crm/api/search/fts`
- `GET /crm/api/events`
- `GET /crm/api/access`
- `POST /crm/api/access`
- `GET /crm/api/sessions`
- `POST /crm/api/sessions/:id/revoke`
- `POST /crm/api/account/active`
- `GET /crm/api/accounts`
- `POST /crm/api/accounts/invite`
- `PATCH /crm/api/accounts/:id`
- `POST /crm/api/notifications/snooze`
- `GET /crm/portal/:id`
- `GET /crm/api/demo`
- `POST /crm/api/demo/clear`
- `POST /crm/api/setup/demo`
- `GET /crm/api/api-keys`
- `POST /crm/api/api-keys`
- `DELETE /crm/api/api-keys/:id`
- `GET /crm/api/webhooks`
- `POST /crm/api/webhooks`
- `DELETE /crm/api/webhooks/:id`
- `POST /crm/api/webhook/:id`
- `GET /crm/api/integrations`
- `GET /crm/api/oauth/setup`
- `POST /crm/api/oauth/credentials/:provider`
- `DELETE /crm/api/oauth/credentials/:provider`

## Screens

Public:

- `/ landing.html`
- `/crm crm.html`
- `/privacy`
- `/terms`
- `/about`
- `/blog`
- `/careers`
- `/press`
- `/health`

Inside the signed-in app, `go()` can open:

- `home`
- `deals`
- `opportunities`
- `contacts`
- `companies`
- `analytics`
- `tasks`
- `player`
- `dial`
- `revenue`
- `service`
- `marketing`
- `dashboard`
- `agent`
- `tools`
- `quotes`
- `leads`
- `products`
- `inbox`
- `orders`
- `forms`
- `events`
- `articles`
- `surveys`
- `pages`
- `landing`
- `blog`
- `sequences`
- `forecast`
- `workspace`
- `reports`
- `feed`
- `settings`
- `integrations`
- `calls`
- `meetings`
- `calendar`
- `segments`
- `intent`
- `quality`
- `import`
- `model`
- `prospect`
- `dev`
- `hold`
- `pipeline`
- `teams`
- `tags`
- `users`
- `workflows`
- `automation`
- `comm`
- `record`
- `audit`
- `backups`
- `guide`

## Background work

- Every 60 seconds: `sweepDue` writes a notification for a planned task whose date is today or earlier, once per task.
- Every 60 seconds: `drainEvents` takes up to 20 pending rows from `crm_events` and runs the workflow for `lead.created` and `deal.won`. A failure is retried up to 5 times.
- While the alerts panel is open: the stream sends a ping every 25 seconds. That is not a job for every workspace.
- Sequence dates are calculated when someone asks for the plan. Nothing sends those messages on a clock.

## What the prompt said was missing, checked against this code

| Claim | What the code actually has |
|---|---|
| No tenant scope | Customer tables have `tenantId` and the list helper filters by it. There is no automated test that a second workspace cannot read the first. |
| JWT fallback in production | `server.js` exits if `JWT_SECRET` is empty in production. Two webhook signatures still fall back to the dev string. |
| No explainable score | Lead routes return a score and reasons. The home screen shows the number more often than the reason. |
| No custom fields, import, tags, teams, audit, backups | `fields`, `field_values`, `POST /crm/api/import/contacts`, `tags`, `teams`, `audit`, and `backups` exist. |
| No duplicate check | `GET /crm/api/contacts/:id/duplicates`, lead duplicates, and `POST /crm/api/contacts/detect-duplicates` exist. |
| WhatsApp is one global token | `collect.js` sends with `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_ID`. There is no per-workspace WhatsApp connection. The in-app panel logs a message and opens WhatsApp. |
| One SQLite file | True. The file is the database. |
| Tests | `tests/crm.test.js` has 6 tests. No CI file is in the repo. |

