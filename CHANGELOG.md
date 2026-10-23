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

## Phase 3, the rest that can run without a new vendor

- A new lead with no owner goes to the person who has the fewest open leads. The list shows how long a lead has been waiting if nobody has logged work on it.
- A task can be a visit or a demo, and it can repeat every day or every week. Marking it done creates the next one.
- A discount over 10% on a deal line is refused unless the person is an owner or an admin.
- A deal stores a currency.
- Tick contacts, then Update selected, to change their owner or their stage together.
- Share this contact lets another person in the business open that record.
- Save a file name stores a document on the deal.
- Export downloads the contacts, companies, deals, leads, and tasks as JSON.
- Quiet hours, in Lagos time, hold notifications except a task that is due.

## Phase 4, WhatsApp inbox

- A business can save its own WhatsApp phone number id, token, and verify token.
- Meta's webhook creates or updates a contact from the phone number, opens a thread, and assigns it to the person with the fewest open threads.
- STOP sets WhatsApp permission to no. A later message sets it back to yes.
- A reply is sent only inside 24 hours of their last message, and only if the line is connected. Otherwise it stays on the thread as not sent.
- The thread can be assigned, noted, and given a saved reply. Two people opening it within two minutes are told.
- Create quote makes a quote. A Paystack link is added only when Paystack is connected and the contact has an email, and it is sent only while the window is open.

## Phase 5, flows with steps

- A flow can hold up to 10 steps: task, wait, wait for a WhatsApp reply, branch, notify, assign, update a field, or email.
- Wait moves off Saturday and Sunday in Lagos.
- The same record does not run the same flow twice. A failed run can be tried again. Five failures turn the flow off.
- Each step is written to Monitor.
- Preview shows the path and does not create a task.
- A WhatsApp reply continues a flow that was waiting, and marks that deal's sequence paused. The task the sequence already made stays.
- A new business gets a flow named Speed to lead: call, wait a day, wait for a reply, then book a meeting or chase them.

## Phase 6, the first scores

- A lead score now has a grade from A to D, the top reasons, and what would raise it. If you set a score yourself, that number is the one shown and the reason says you set it.
- The usual reply hour is taken from this workspace. With fewer than three replies, weekday 10:00 Lagos time is the default.
- A new lead with no owner stores why they were assigned: the person with the fewest open leads.
- Forecast shows a low, middle, and high outcome from 4,000 runs of the open deals. With at least five closed deals it also shows a win-rate forecast. The chance on each open deal starts from the stage and drops if the deal is old or untouched.
- Find duplicates on Contacts matches email, phone, or the same name and company. It does not merge until you type the name to keep. Deals and tasks move to that person. There is no undo.
