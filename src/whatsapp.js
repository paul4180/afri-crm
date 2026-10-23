import crypto from 'crypto';
import { resumeReply } from './flows.js';

function tail(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('234') && digits.length > 10) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(-10);
}

function windowOpen(thread) {
  if (!thread || !thread.lastInboundAt) return false;
  return Date.now() - new Date(thread.lastInboundAt).getTime() < 24 * 60 * 60 * 1000;
}

export function registerWhatsApp(app, ctx) {
  const { db, guard, canWrite, one, insert, patch, writeAudit, notifyUser } = ctx;

  db.exec(`
    CREATE TABLE IF NOT EXISTS wa_lines (
      tenantId TEXT PRIMARY KEY, phoneNumberId TEXT, displayNumber TEXT, token TEXT, verifyToken TEXT, status TEXT DEFAULT 'NOT_CONNECTED'
    );
    CREATE TABLE IF NOT EXISTS threads (
      id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, contactId TEXT, phone TEXT, channel TEXT DEFAULT 'whatsapp',
      ownerId TEXT, status TEXT DEFAULT 'OPEN', lastInboundAt TEXT, lastMessageAt TEXT,
      viewingUserId TEXT, viewingAt TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS thread_messages (
      id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, threadId TEXT NOT NULL, direction TEXT, body TEXT,
      status TEXT, error TEXT, authorId TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS saved_replies (
      id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, name TEXT, body TEXT
    );
  `);

  function lineFor(tenantId) {
    const row = db.prepare('SELECT * FROM wa_lines WHERE tenantId = ?').get(tenantId);
    if (row && row.token && row.phoneNumberId) return row;
    if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID) {
      return { tenantId, phoneNumberId: process.env.WHATSAPP_PHONE_ID, displayNumber: process.env.WHATSAPP_DISPLAY || '', token: process.env.WHATSAPP_TOKEN, status: 'ENV', verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '' };
    }
    return row || null;
  }

  function tenantForNumber(phoneNumberId) {
    const row = db.prepare('SELECT tenantId FROM wa_lines WHERE phoneNumberId = ?').get(String(phoneNumberId || ''));
    if (row) return row.tenantId;
    if (process.env.WHATSAPP_PHONE_ID && process.env.WHATSAPP_PHONE_ID === String(phoneNumberId || '')) {
      const workspaces = db.prepare('SELECT id FROM crm_workspaces').all();
      if (workspaces.length === 1) return workspaces[0].id;
    }
    return null;
  }

  function contactByPhone(tenantId, raw) {
    const key = tail(raw);
    if (!key) return null;
    return db.prepare('SELECT * FROM contacts WHERE tenantId = ?').all(tenantId).find((row) => tail(row.phone) === key || tail(row.mobile) === key) || null;
  }

  function nextOwner(tenantId) {
    const people = db.prepare("SELECT id FROM crm_accounts WHERE workspaceId = ? AND COALESCE(active, 1) = 1 AND role IN ('OWNER','ADMIN','MANAGER','SALES') AND email NOT LIKE '%@sample.invalid'").all(tenantId);
    if (!people.length) return null;
    const ranked = people.map((person) => ({ id: person.id, n: db.prepare("SELECT COUNT(*) AS n FROM threads WHERE tenantId = ? AND ownerId = ? AND status = 'OPEN'").get(tenantId, person.id).n }));
    ranked.sort((a, b) => a.n - b.n || String(a.id).localeCompare(String(b.id)));
    return ranked[0].id;
  }

  function addMessage(tenantId, threadId, direction, body, status, error, authorId) {
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO thread_messages (id, tenantId, threadId, direction, body, status, error, authorId) VALUES (?,?,?,?,?,?,?,?)')
      .run(id, tenantId, threadId, direction, String(body || '').slice(0, 4000), status, error ? String(error).slice(0, 300) : null, authorId || null);
    db.prepare('UPDATE threads SET lastMessageAt = ? WHERE id = ?').run(new Date().toISOString(), threadId);
    return id;
  }

  async function pushText(line, to, body) {
    const res = await fetch('https://graph.facebook.com/v21.0/' + line.phoneNumberId + '/messages', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + line.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: String(to).replace(/\D/g, ''), type: 'text', text: { body } }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: (data.error && data.error.message) || 'WhatsApp refused the message' };
    return { ok: true };
  }

  app.get('/crm/api/whatsapp/webhook', async (req, reply) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const known = db.prepare('SELECT tenantId FROM wa_lines WHERE verifyToken = ?').get(String(token || ''));
    const envOk = process.env.WHATSAPP_VERIFY_TOKEN && token === process.env.WHATSAPP_VERIFY_TOKEN;
    if (mode === 'subscribe' && challenge && (known || envOk)) return reply.type('text/plain').send(String(challenge));
    return reply.code(403).send('Verify token does not match');
  });

  app.post('/crm/api/whatsapp/webhook', async (req, reply) => {
    const entries = (req.body && req.body.entry) || [];
    for (const entry of entries) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        const tenantId = tenantForNumber(value.metadata && value.metadata.phone_number_id);
        if (!tenantId) continue;
        for (const message of value.messages || []) {
          const phone = message.from;
          const text = (message.text && message.text.body) || (message.type ? '[' + message.type + ']' : '');
          let contact = contactByPhone(tenantId, phone);
          const profile = ((value.contacts || [])[0] && value.contacts[0].profile && value.contacts[0].profile.name) || '';
          if (!contact) {
            const parts = profile.split(' ');
            const id = insert('contacts', tenantId, { firstName: parts[0] || phone, lastName: parts.slice(1).join(' '), phone, source: 'WhatsApp', status: 'ACTIVE', lifecycle: 'lead', whatsappOptIn: 'yes', ownerId: nextOwner(tenantId) });
            contact = one('contacts', tenantId, id);
          }
          if (/^(stop|unsubscribe|stop all)$/i.test(String(text).trim())) {
            patch('contacts', tenantId, contact.id, { whatsappOptIn: 'no' });
          } else if (contact.whatsappOptIn !== 'yes') {
            patch('contacts', tenantId, contact.id, { whatsappOptIn: 'yes' });
          }
          let thread = db.prepare("SELECT * FROM threads WHERE tenantId = ? AND contactId = ? AND status = 'OPEN'").get(tenantId, contact.id);
          if (!thread) {
            const id = crypto.randomUUID();
            const ownerId = contact.ownerId || nextOwner(tenantId);
            db.prepare('INSERT INTO threads (id, tenantId, contactId, phone, ownerId, lastInboundAt, lastMessageAt) VALUES (?,?,?,?,?,?,?)')
              .run(id, tenantId, contact.id, phone, ownerId, new Date().toISOString(), new Date().toISOString());
            thread = db.prepare('SELECT * FROM threads WHERE id = ?').get(id);
            if (ownerId) notifyUser(tenantId, ownerId, { kind: 'whatsapp', title: 'WhatsApp from ' + (contact.firstName || phone), body: text.slice(0, 140), recordType: 'contact', recordId: contact.id });
          } else {
            db.prepare('UPDATE threads SET lastInboundAt = ?, phone = ? WHERE id = ?').run(new Date().toISOString(), phone, thread.id);
            if (thread.ownerId) notifyUser(tenantId, thread.ownerId, { kind: 'whatsapp', title: 'WhatsApp from ' + (contact.firstName || phone), body: text.slice(0, 140), recordType: 'contact', recordId: contact.id });
          }
          addMessage(tenantId, thread.id, 'in', text, 'received', null, null);
          try { resumeReply(tenantId, contact.id); } catch { /* a reply must still be stored if a flow fails */ }
          insert('activities', tenantId, { type: 'WHATSAPP', subject: 'WhatsApp in: ' + text.slice(0, 80), status: 'DONE', relatedType: 'contact', relatedId: contact.id, notes: text, ownerId: thread.ownerId });
        }
      }
    }
    return { ok: true };
  });

  app.get('/crm/api/whatsapp/line', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const line = lineFor(user.tenantId);
    const saved = db.prepare('SELECT * FROM wa_lines WHERE tenantId = ?').get(user.tenantId);
    return {
      connected: Boolean(line && line.token && line.phoneNumberId),
      displayNumber: (saved && saved.displayNumber) || (line && line.displayNumber) || '',
      phoneNumberId: (saved && saved.phoneNumberId) || (line && line.phoneNumberId) || '',
      hasToken: Boolean((saved && saved.token) || process.env.WHATSAPP_TOKEN),
      verifySet: Boolean((saved && saved.verifyToken) || process.env.WHATSAPP_VERIFY_TOKEN),
      paystack: Boolean(process.env.PAYSTACK_SECRET_KEY),
      note: 'The webhook URL is /crm/api/whatsapp/webhook. Meta checks it with the verify token. This server does not keep the raw body, so it does not check the POST signature.',
    };
  });

  app.post('/crm/api/whatsapp/line', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') return reply.code(403).send({ error: 'Only an owner or an admin can connect WhatsApp' });
    const current = db.prepare('SELECT * FROM wa_lines WHERE tenantId = ?').get(user.tenantId) || {};
    const phoneNumberId = String((req.body && req.body.phoneNumberId) || current.phoneNumberId || '').trim();
    const displayNumber = String((req.body && req.body.displayNumber) || current.displayNumber || '').trim();
    const token = String((req.body && req.body.token) || '').trim() || current.token || null;
    const verifyToken = String((req.body && req.body.verifyToken) || '').trim() || current.verifyToken || null;
    if (!phoneNumberId || !token) return reply.code(400).send({ error: 'The phone number id and the token are both required' });
    db.prepare('INSERT INTO wa_lines (tenantId, phoneNumberId, displayNumber, token, verifyToken, status) VALUES (?,?,?,?,?,?) ON CONFLICT(tenantId) DO UPDATE SET phoneNumberId = excluded.phoneNumberId, displayNumber = excluded.displayNumber, token = excluded.token, verifyToken = excluded.verifyToken, status = excluded.status')
      .run(user.tenantId, phoneNumberId, displayNumber, token, verifyToken, 'SAVED');
    writeAudit(user.tenantId, user.sub, 'connect', 'whatsapp', user.tenantId, displayNumber || phoneNumberId);
    return { ok: true };
  });

  app.get('/crm/api/threads', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const rows = db.prepare("SELECT * FROM threads WHERE tenantId = ? ORDER BY lastMessageAt DESC LIMIT 100").all(user.tenantId);
    return rows.map((row) => {
      const contact = row.contactId ? one('contacts', user.tenantId, row.contactId) : null;
      const last = db.prepare('SELECT body, direction, createdAt FROM thread_messages WHERE threadId = ? ORDER BY createdAt DESC LIMIT 1').get(row.id);
      return { ...row, name: contact ? ((contact.firstName || '') + ' ' + (contact.lastName || '')).trim() : row.phone, windowOpen: windowOpen(row), last };
    });
  });

  app.get('/crm/api/threads/:id', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const thread = db.prepare('SELECT * FROM threads WHERE tenantId = ? AND id = ?').get(user.tenantId, req.params.id);
    if (!thread) return reply.code(404).send({ error: 'Not found' });
    const messages = db.prepare('SELECT * FROM thread_messages WHERE tenantId = ? AND threadId = ? ORDER BY createdAt').all(user.tenantId, thread.id);
    const contact = thread.contactId ? one('contacts', user.tenantId, thread.contactId) : null;
    const fresh = thread.viewingAt && Date.now() - new Date(thread.viewingAt).getTime() < 2 * 60 * 1000;
    const collision = fresh && thread.viewingUserId && thread.viewingUserId !== user.sub ? thread.viewingUserId : null;
    db.prepare('UPDATE threads SET viewingUserId = ?, viewingAt = ? WHERE id = ?').run(user.sub, new Date().toISOString(), thread.id);
    return { thread, messages, contact, windowOpen: windowOpen(thread), collision };
  });

  app.post('/crm/api/threads/:id/send', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const thread = db.prepare('SELECT * FROM threads WHERE tenantId = ? AND id = ?').get(user.tenantId, req.params.id);
    if (!thread) return reply.code(404).send({ error: 'Not found' });
    const contact = thread.contactId ? one('contacts', user.tenantId, thread.contactId) : null;
    if (contact && contact.whatsappOptIn === 'no') return reply.code(403).send({ error: 'This person opted out of WhatsApp' });
    const body = String((req.body && req.body.body) || '').trim();
    if (!body) return reply.code(400).send({ error: 'Write the message' });
    if (!windowOpen(thread)) return reply.code(409).send({ error: 'The 24-hour window is closed. WhatsApp only allows an approved template now, and this line has no approved template to send.' });
    const line = lineFor(user.tenantId);
    if (!line || !line.token || !line.phoneNumberId) {
      addMessage(user.tenantId, thread.id, 'out', body, 'failed', 'WhatsApp is not connected', user.sub);
      return reply.code(424).send({ error: 'WhatsApp is not connected. The message was kept on the thread and was not sent.' });
    }
    const sent = await pushText(line, thread.phone, body);
    addMessage(user.tenantId, thread.id, 'out', body, sent.ok ? 'sent' : 'failed', sent.error, user.sub);
    if (sent.ok && contact) insert('activities', user.tenantId, { type: 'WHATSAPP', subject: 'WhatsApp out: ' + body.slice(0, 80), status: 'DONE', relatedType: 'contact', relatedId: contact.id, notes: body, ownerId: user.sub });
    if (!sent.ok) return reply.code(502).send({ error: sent.error });
    return { ok: true };
  });

  app.post('/crm/api/threads/:id/note', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const thread = db.prepare('SELECT * FROM threads WHERE tenantId = ? AND id = ?').get(user.tenantId, req.params.id);
    if (!thread) return reply.code(404).send({ error: 'Not found' });
    const body = String((req.body && req.body.body) || '').trim();
    if (!body) return reply.code(400).send({ error: 'Write the note' });
    addMessage(user.tenantId, thread.id, 'note', body, 'saved', null, user.sub);
    return { ok: true };
  });

  app.post('/crm/api/threads/:id/assign', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const thread = db.prepare('SELECT * FROM threads WHERE tenantId = ? AND id = ?').get(user.tenantId, req.params.id);
    if (!thread) return reply.code(404).send({ error: 'Not found' });
    const ownerId = String((req.body && req.body.ownerId) || '');
    const person = db.prepare('SELECT id, fullName FROM crm_accounts WHERE id = ? AND workspaceId = ?').get(ownerId, user.tenantId);
    if (!person) return reply.code(404).send({ error: 'That person is not in this business' });
    db.prepare('UPDATE threads SET ownerId = ? WHERE id = ?').run(ownerId, thread.id);
    notifyUser(user.tenantId, ownerId, { kind: 'whatsapp', title: 'A WhatsApp thread was assigned to you', body: thread.phone || '', recordType: 'contact', recordId: thread.contactId });
    return { ok: true };
  });

  app.get('/crm/api/replies', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    return db.prepare('SELECT id, name, body FROM saved_replies WHERE tenantId = ? ORDER BY name').all(user.tenantId);
  });
  app.post('/crm/api/replies', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const name = String((req.body && req.body.name) || '').trim().slice(0, 60);
    const body = String((req.body && req.body.body) || '').trim().slice(0, 1000);
    if (!name || !body) return reply.code(400).send({ error: 'Name the reply and write it' });
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO saved_replies (id, tenantId, name, body) VALUES (?,?,?,?)').run(id, user.tenantId, name, body);
    return { id, name, body };
  });

  app.post('/crm/api/threads/:id/quote', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const thread = db.prepare('SELECT * FROM threads WHERE tenantId = ? AND id = ?').get(user.tenantId, req.params.id);
    if (!thread || !thread.contactId) return reply.code(404).send({ error: 'This thread has no contact' });
    const contact = one('contacts', user.tenantId, thread.contactId);
    const amount = Number((req.body && req.body.amount) || 0);
    const description = String((req.body && req.body.description) || 'WhatsApp quote').slice(0, 200);
    if (!amount || amount < 0) return reply.code(400).send({ error: 'Enter the amount in naira' });
    const count = db.prepare('SELECT COUNT(*) AS n FROM quotes WHERE tenantId = ?').get(user.tenantId).n;
    const quoteId = insert('quotes', user.tenantId, {
      number: 'QT-' + String(count + 1).padStart(4, '0'), contactId: contact.id, companyId: contact.companyId || null,
      status: 'DRAFT', subtotal: amount, tax: amount * 0.075, total: amount * 1.075, notes: 'Opened from WhatsApp',
    });
    db.prepare('INSERT INTO quote_lines (id, quoteId, description, quantity, unitPrice, discount, lineTotal) VALUES (?,?,?,?,?,?,?)')
      .run(crypto.randomUUID(), quoteId, description, 1, amount, 0, amount);
    let payUrl = '';
    if (!process.env.PAYSTACK_SECRET_KEY) {
      addMessage(user.tenantId, thread.id, 'note', quoteId + ' was created. Paystack is not connected, so no pay link was made.', 'saved', null, user.sub);
      return { quoteId, payUrl: '', error: 'Paystack is not connected. The quote was created without a pay link.' };
    }
    if (!contact.email) {
      addMessage(user.tenantId, thread.id, 'note', 'Quote created. The contact has no email, so Paystack was not called.', 'saved', null, user.sub);
      return { quoteId, payUrl: '', error: 'Add an email on the contact before a Paystack link.' };
    }
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: contact.email, amount: Math.round(amount * 1.075 * 100), currency: 'NGN', metadata: { quoteId } }),
    });
    const data = await res.json().catch(() => ({}));
    payUrl = (data.data && data.data.authorization_url) || '';
    if (!res.ok || !payUrl) {
      addMessage(user.tenantId, thread.id, 'note', 'Quote created. Paystack did not return a link.', 'saved', null, user.sub);
      return reply.code(502).send({ quoteId, error: (data.message) || 'Paystack did not return a link' });
    }
    const text = description + ' — pay ' + payUrl;
    if (windowOpen(thread)) {
      const line = lineFor(user.tenantId);
      if (line && line.token) {
        const sent = await pushText(line, thread.phone, text);
        addMessage(user.tenantId, thread.id, 'out', text, sent.ok ? 'sent' : 'failed', sent.error, user.sub);
      } else addMessage(user.tenantId, thread.id, 'note', text, 'saved', 'WhatsApp is not connected', user.sub);
    } else addMessage(user.tenantId, thread.id, 'note', 'Pay link ready, but the 24-hour window is closed so it was not sent. ' + payUrl, 'saved', null, user.sub);
    return { quoteId, payUrl };
  });
}
