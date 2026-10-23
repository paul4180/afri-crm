# Changelog

## 23 October 2026

- Public pages: Pricing, Docs, API, Status, Community, Changelog. The footer no longer points at the sign-in screen or at an empty anchor.
- The home page says 150 API routes. It no longer says five setup steps or a four-step wizard.
- Not in this step: a live demo, an ROI calculator, industry pages, or a paid plan. Billing does not exist, so no price was invented.

## Phase 2 — setup wizard

- The first-login wizard is five steps: business, pipeline template, channel, import, invite.
- Closing the browser keeps the step. Skip leaves it closed until Finish setup is clicked.
- A template renames stages only when the workspace has no deals.
- Not in this step: magic link, phone code, or company single sign-on. There is no SMS provider or identity provider to send them.

## Phase 2, continued

- Removing sample data sets a flag on the workspace. A refresh no longer loads it again. Add sample data is the only way back.
- Home shows the sales start list from the records that exist: contact, company, lead, deal, teammate, mailbox.
- A teammate counts as a CRM sign-in, not a books user.
- Sessions lists this account's sign-ins and can close one.
- Finishing the wizard reloads the home so the sample pipeline is visible.

## Phase 3, first slice — home

- Where to start sits under the numbers, not on top of them. The steps are links, not green bars.
- One sample banner. The second "Sample workspace" strip is gone.
- The day heading is white, so it can be read on the dark photo.
- Home lists are ordered by what needs you, and a contact no longer says Today just because it was added today.
- Do this next opens the first overdue or due task, or the deal that needs you if there is no task.

## Phase 3, contacts

- A contact now stores a stage (subscriber through advocate), language, WhatsApp permission, consent, and the campaign that brought them in.
- Opening a contact shows another record that looks like the same person, and Keep this record moves the other record's deals, notes, and tasks onto this one.
- The contacts list shows that stage in the status column.

## Phase 3, deals

- A deal has a product list. Each line has a name, a quantity, and a price. The deal amount becomes the total of those lines.
- Create quote uses those lines when they exist.
- Dropping a deal on Closed lost asks why, including a second pipeline whose stage code starts with CLOSED_LOST.
