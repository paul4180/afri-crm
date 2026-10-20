import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';
import { sendMail } from './collect.js';
import { askAI } from './ai.js';
import bcrypt from 'bcryptjs';

// ============================================================
// STRUCTURED LOGGING — defined first so any module-load code
// (e.g. database opening below) can use it. Single-line JSON so
// Railway/log aggregators can parse fields. ctx can carry tenantId
// / userId / route / err etc.
// ============================================================
const log = {
  _emit(level, msg, ctx) {
    try {
      const line = JSON.stringify({ level, ts: new Date().toISOString(), msg, ...ctx });
      if (level === 'error') console.error(line);
      else if (level === 'warn') console.warn(line);
      else console.log(line);
    } catch {
      console.log('[' + level + '] ' + msg);
    }
  },
  info(msg, ctx = {}) { this._emit('info', msg, ctx); },
  warn(msg, ctx = {}) { this._emit('warn', msg, ctx); },
  error(msg, ctx = {}) { this._emit('error', msg, ctx); },
};

const localDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
function crmPath() {
  const preferred = process.env.CRM_DATA_DIR;
  // Use a versioned filename to avoid corrupted old database
  const candidates = [preferred, fs.existsSync('/data') ? '/data' : null, localDir].filter(Boolean);
  for (const folder of candidates) {
    try {
      fs.mkdirSync(folder, { recursive: true });
      fs.accessSync(folder, fs.constants.W_OK);
      return path.join(folder, 'crm2.sqlite');
    } catch { /* try the next place */ }
  }
  fs.mkdirSync(localDir, { recursive: true });
  return path.join(localDir, 'crm2.sqlite');
}
const dbFile = crmPath();
// Do NOT copy from old crm.sqlite — it may be corrupted. Start fresh with crm2.sqlite.

// Crash-proof database opening: try → recover → delete+recreate → in-memory
let db;
try {
  db = new DatabaseSync(dbFile);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA integrity_check;');
  // Structured log instead of plain console — Railway can parse fields
  log.info('database.opened', { file: dbFile });
} catch (e) {
  log.error('database.open.failed', { file: dbFile, err: e.message });
  try { db && db.close(); } catch {}
  // Delete all database files
  for (const suffix of ['', '-wal', '-shm', '-journal']) {
    try { fs.unlinkSync(dbFile + suffix); } catch {}
  }
  try {
    db = new DatabaseSync(dbFile);
    db.exec('PRAGMA journal_mode = WAL');
    log.info('database.recreated', { file: dbFile });
  } catch (e2) {
    log.error('database.fatal.in-memory', { file: dbFile, err: e2.message });
    db = new DatabaseSync(':memory:');
  }
}
export function crmDatabaseFile() { return dbFile; }

const hits = new Map();
function limited(key, max, windowMs) {
  const now = Date.now();
  const fresh = (hits.get(key) || []).filter((time) => now - time < windowMs);
  if (fresh.length >= max) return true;
  fresh.push(now);
  hits.set(key, fresh);
  return false;
}
try {
db.exec(`
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, name TEXT NOT NULL,
  industry TEXT, type TEXT DEFAULT 'PROSPECT', website TEXT, phone TEXT, email TEXT,
  street TEXT, city TEXT, state TEXT, country TEXT DEFAULT 'Nigeria', description TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, firstName TEXT NOT NULL, lastName TEXT,
  title TEXT, email TEXT, phone TEXT, mobile TEXT, companyId TEXT,
  street TEXT, city TEXT, state TEXT, country TEXT, description TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, firstName TEXT NOT NULL, lastName TEXT,
  title TEXT, companyName TEXT, email TEXT, phone TEXT, mobile TEXT, website TEXT,
  source TEXT, status TEXT DEFAULT 'NEW', industry TEXT, rating TEXT DEFAULT 'WARM',
  street TEXT, city TEXT, state TEXT, country TEXT, description TEXT,
  companyId TEXT, contactId TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, name TEXT NOT NULL,
  companyId TEXT, contactId TEXT, leadId TEXT, amount REAL DEFAULT 0, probability INTEGER DEFAULT 50,
  stage TEXT DEFAULT 'PROSPECTING', closeDate TEXT, type TEXT DEFAULT 'NEW', source TEXT,
  nextStep TEXT, description TEXT, lostReason TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, type TEXT DEFAULT 'TASK', subject TEXT NOT NULL,
  dueAt TEXT, status TEXT DEFAULT 'PLANNED', relatedType TEXT, relatedId TEXT, notes TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, name TEXT NOT NULL, code TEXT, price REAL DEFAULT 0,
  description TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, number TEXT NOT NULL, companyId TEXT, contactId TEXT,
  dealId TEXT, validUntil TEXT, status TEXT DEFAULT 'DRAFT', subtotal REAL DEFAULT 0, tax REAL DEFAULT 0,
  total REAL DEFAULT 0, terms TEXT, notes TEXT, booksInvoice TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS quote_lines (
  id TEXT PRIMARY KEY, quoteId TEXT NOT NULL, productId TEXT, description TEXT, quantity REAL,
  unitPrice REAL, discount REAL DEFAULT 0, lineTotal REAL
);
CREATE INDEX IF NOT EXISTS ix_crm_leads ON leads(tenantId, status);
CREATE INDEX IF NOT EXISTS ix_crm_deals ON deals(tenantId, stage);
CREATE INDEX IF NOT EXISTS ix_crm_act ON activities(tenantId, status);
CREATE INDEX IF NOT EXISTS ix_contacts_tenant ON contacts(tenantId);
CREATE INDEX IF NOT EXISTS ix_companies_tenant ON companies(tenantId);
CREATE INDEX IF NOT EXISTS ix_deals_tenant ON deals(tenantId);
CREATE INDEX IF NOT EXISTS ix_activities_tenant ON activities(tenantId);
CREATE TABLE IF NOT EXISTS workspace (
  tenantId TEXT PRIMARY KEY, size TEXT, industry TEXT, goal TEXT, tools TEXT, done INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS crm_workspaces (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS crm_accounts (
  id TEXT PRIMARY KEY, workspaceId TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL, fullName TEXT, role TEXT DEFAULT 'OWNER',
  failed INTEGER DEFAULT 0, lockedUntil TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_crm_account_email ON crm_accounts(email);

CREATE TABLE IF NOT EXISTS connections (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, provider TEXT NOT NULL, email TEXT,
  accessToken TEXT, refreshToken TEXT, expiresAt TEXT, status TEXT DEFAULT 'CONNECTED',
  UNIQUE(tenantId, provider)
);
CREATE TABLE IF NOT EXISTS tool_apps (
  tenantId TEXT NOT NULL, provider TEXT NOT NULL, clientId TEXT, clientSecret TEXT,
  PRIMARY KEY (tenantId, provider)
);
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, subject TEXT NOT NULL, contactId TEXT, companyId TEXT,
  status TEXT DEFAULT 'OPEN', priority TEXT DEFAULT 'NORMAL', body TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS ticket_replies (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, ticketId TEXT NOT NULL, body TEXT NOT NULL,
  authorId TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS emails (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, contactId TEXT NOT NULL, subject TEXT NOT NULL,
  body TEXT, status TEXT DEFAULT 'LOGGED', via TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS targets (
  tenantId TEXT NOT NULL, month TEXT NOT NULL, amount REAL NOT NULL, PRIMARY KEY (tenantId, month)
);
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, name TEXT NOT NULL, subject TEXT, body TEXT,
  status TEXT DEFAULT 'DRAFT', sent INTEGER DEFAULT 0, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, relatedType TEXT NOT NULL, relatedId TEXT NOT NULL,
  body TEXT NOT NULL, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS sequences (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, name TEXT NOT NULL, stage TEXT NOT NULL,
  taskSubject TEXT NOT NULL, days INTEGER DEFAULT 2, active INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS sequence_runs (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, sequenceId TEXT NOT NULL, dealId TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS objects (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, kind TEXT NOT NULL, name TEXT NOT NULL,
  body TEXT, status TEXT DEFAULT 'OPEN', amount REAL DEFAULT 0, meta TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_crm_objects ON objects(tenantId, kind);
CREATE TABLE IF NOT EXISTS audit (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, userId TEXT, action TEXT NOT NULL,
  object TEXT NOT NULL, recordId TEXT NOT NULL, detail TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS fields (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, object TEXT NOT NULL, name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS field_values (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, fieldId TEXT NOT NULL, recordId TEXT NOT NULL, value TEXT,
  UNIQUE(fieldId, recordId)
);
CREATE INDEX IF NOT EXISTS ix_crm_audit ON audit(tenantId, recordId);
CREATE TABLE IF NOT EXISTS pipelines (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, name TEXT NOT NULL, isDefault INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS stages (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, pipelineId TEXT NOT NULL, code TEXT NOT NULL,
  name TEXT NOT NULL, color TEXT, probability INTEGER DEFAULT 50, position INTEGER DEFAULT 0, closed INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, name TEXT NOT NULL, color TEXT DEFAULT '#2563eb',
  UNIQUE(tenantId, name)
);
CREATE TABLE IF NOT EXISTS record_tags (
  tenantId TEXT NOT NULL, tagId TEXT NOT NULL, object TEXT NOT NULL, recordId TEXT NOT NULL,
  PRIMARY KEY (tagId, object, recordId)
);
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS team_members (
  tenantId TEXT NOT NULL, teamId TEXT NOT NULL, userId TEXT NOT NULL,
  PRIMARY KEY (teamId, userId)
);
CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, name TEXT NOT NULL,
  trigger TEXT NOT NULL, taskSubject TEXT NOT NULL, days INTEGER DEFAULT 1, active INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS workflow_runs (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, workflowId TEXT NOT NULL, recordId TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, userId TEXT NOT NULL, kind TEXT NOT NULL,
  title TEXT NOT NULL, body TEXT, recordType TEXT, recordId TEXT, sourceId TEXT, readAt TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_crm_notif ON notifications(tenantId, userId, createdAt);
CREATE TABLE IF NOT EXISTS crm_sessions (
  id TEXT PRIMARY KEY, accountId TEXT NOT NULL, workspaceId TEXT NOT NULL,
  ip TEXT, agent TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP, revokedAt TEXT
);
CREATE TABLE IF NOT EXISTS crm_events (
  id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, name TEXT NOT NULL, payload TEXT,
  status TEXT DEFAULT 'PENDING', attempts INTEGER DEFAULT 0, lastError TEXT,
  runAt TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_crm_events ON crm_events(status, runAt);
CREATE TABLE IF NOT EXISTS crm_permissions (
  tenantId TEXT NOT NULL, roleName TEXT NOT NULL, area TEXT NOT NULL, action TEXT NOT NULL,
  allowed INTEGER DEFAULT 0, PRIMARY KEY (tenantId, roleName, area, action)
);
CREATE TABLE IF NOT EXISTS crm_prefs (
  tenantId TEXT NOT NULL, userId TEXT NOT NULL, emailOn INTEGER DEFAULT 1, inApp INTEGER DEFAULT 1,
  PRIMARY KEY (tenantId, userId)
);
`);
} catch (e) {
  log.error('database.schema.init.failed', { err: e.message });
  // Continue anyway — individual queries will create tables as needed
}
for (const [table, col, type] of [
  ['contacts', 'method', 'TEXT'], ['contacts', 'serviceFrequency', 'TEXT'], ['contacts', 'serviceType', 'TEXT'], ['contacts', 'lastService', 'TEXT'],
  ['companies', 'years', 'TEXT'], ['companies', 'offering', 'TEXT'], ['companies', 'area', 'TEXT'], ['companies', 'satisfaction', 'TEXT'],
  ['workspace', 'offer', 'TEXT'], ['workspace', 'channel', 'TEXT'], ['workspace', 'aiMode', 'TEXT'], ['workspace', 'role', 'TEXT'],
  ['companies', 'ownerId', 'TEXT'], ['contacts', 'ownerId', 'TEXT'], ['leads', 'ownerId', 'TEXT'],
  ['deals', 'ownerId', 'TEXT'], ['activities', 'ownerId', 'TEXT'],
  ['contacts', 'source', 'TEXT'], ['contacts', 'status', "TEXT DEFAULT 'ACTIVE'"],
  ['companies', 'source', 'TEXT'],
  ['activities', 'priority', "TEXT DEFAULT 'NORMAL'"],
  ['companies', 'updatedAt', 'TEXT'], ['contacts', 'updatedAt', 'TEXT'],
  ['leads', 'updatedAt', 'TEXT'], ['deals', 'updatedAt', 'TEXT'], ['activities', 'updatedAt', 'TEXT'],
  ['leads', 'deadReason', 'TEXT'],
  ['deals', 'paidAt', 'TEXT'],
  ['workflows', 'action', "TEXT DEFAULT 'task'"],
  ['workflows', 'target', 'TEXT'],
  ['workflow_runs', 'status', "TEXT DEFAULT 'OK'"],
  ['workflow_runs', 'detail', 'TEXT'],
  ['workflow_runs', 'ranAt', 'TEXT'],
  ['workspace', 'guideOff', 'INTEGER DEFAULT 0'],
  ['products', 'category', "TEXT DEFAULT 'General'"],
  ['products', 'stock', 'REAL DEFAULT 0'],
  ['products', 'attrs', 'TEXT'],
  ['notifications', 'snoozeUntil', 'TEXT'],
  ['workflows', 'graph', 'TEXT'],
  ['crm_accounts', 'active', 'INTEGER DEFAULT 1'],
]) {
  const have = db.prepare('PRAGMA table_info(' + table + ')').all().some((row) => row.name === col);
  if (!have) db.exec('ALTER TABLE ' + table + ' ADD COLUMN ' + col + ' ' + type);
}
db.exec(`
CREATE INDEX IF NOT EXISTS ix_crm_contact_company ON contacts(tenantId, companyId);
CREATE INDEX IF NOT EXISTS ix_crm_contact_owner ON contacts(tenantId, ownerId);
CREATE INDEX IF NOT EXISTS ix_crm_company_owner ON companies(tenantId, ownerId);
CREATE INDEX IF NOT EXISTS ix_crm_deal_company ON deals(tenantId, companyId);
`);

// ============================================================
// FTS5 — full-text search index for contacts, companies, deals,
// leads, activities. Wrapped in try/catch: if FTS5 is unavailable
// (some Node builds), the server still boots — the /crm/api/search/fts
// endpoint will simply 503 and the LIKE-based /crm/api/search still
// works as a fallback.
// ============================================================
let fts5Ready = false;
try {
  db.exec(`
CREATE VIRTUAL TABLE IF NOT EXISTS fts_contacts USING fts5(
  id UNINDEXED, tenantId UNINDEXED, firstName, lastName, email, phone, company
);
CREATE VIRTUAL TABLE IF NOT EXISTS fts_companies USING fts5(
  id UNINDEXED, tenantId UNINDEXED, name, email, phone, industry
);
CREATE VIRTUAL TABLE IF NOT EXISTS fts_deals USING fts5(
  id UNINDEXED, tenantId UNINDEXED, name, description, nextStep
);
CREATE VIRTUAL TABLE IF NOT EXISTS fts_leads USING fts5(
  id UNINDEXED, tenantId UNINDEXED, firstName, lastName, companyName, email, phone
);
CREATE VIRTUAL TABLE IF NOT EXISTS fts_activities USING fts5(
  id UNINDEXED, tenantId UNINDEXED, subject, notes
);
`);
  fts5Ready = true;
  log.info('fts5.ready');
} catch (e) {
  log.warn('fts5.unavailable', { err: e.message });
}

// Helper to keep FTS in sync with base tables (call after INSERT/UPDATE)
function ftsUpsert(table, id, tenantId, fields) {
  if (!fts5Ready) return;
  try {
    db.prepare('DELETE FROM fts_' + table + ' WHERE id = ?').run(id);
    const cols = ['id', 'tenantId', ...Object.keys(fields)];
    const vals = [id, tenantId, ...Object.values(fields)];
    const placeholders = cols.map(() => '?').join(',');
    db.prepare(`INSERT INTO fts_${table} (${cols.join(',')}) VALUES (${placeholders})`).run(...vals);
  } catch { /* non-fatal — FTS lag won't break the app */ }
}
function ftsDelete(table, id) {
  if (!fts5Ready) return;
  try { db.prepare('DELETE FROM fts_' + table + ' WHERE id = ?').run(id); } catch {}
}

const FIELDS = {
  companies: ['name', 'industry', 'type', 'website', 'phone', 'email', 'street', 'city', 'state', 'country', 'description', 'years', 'offering', 'area', 'satisfaction', 'ownerId', 'source'],
  contacts: ['firstName', 'lastName', 'title', 'email', 'phone', 'mobile', 'companyId', 'street', 'city', 'state', 'country', 'description', 'method', 'serviceFrequency', 'serviceType', 'lastService', 'ownerId', 'source', 'status'],
  leads: ['firstName', 'lastName', 'title', 'companyName', 'email', 'phone', 'mobile', 'website', 'source', 'status', 'industry', 'rating', 'street', 'city', 'state', 'country', 'description', 'ownerId', 'deadReason'],
  deals: ['name', 'companyId', 'contactId', 'leadId', 'amount', 'probability', 'stage', 'closeDate', 'type', 'source', 'nextStep', 'description', 'lostReason', 'ownerId'],
  activities: ['type', 'subject', 'dueAt', 'status', 'relatedType', 'relatedId', 'notes', 'ownerId', 'priority'],
  products: ['name', 'code', 'price', 'description', 'category', 'stock', 'attrs'],
};
const NUM = new Set(['amount', 'probability', 'price', 'quantity', 'unitPrice', 'discount', 'stock']);

function clean(object, body) {
  const out = {};
  for (const key of FIELDS[object]) {
    if (body[key] === undefined) continue;
    const value = body[key];
    out[key] = NUM.has(key) ? Number(value || 0) : (value === '' ? null : String(value).slice(0, 500));
  }
  return out;
}
// Validate POST/PATCH body before insert. Returns array of error
// strings (empty array = valid). Used by the crud POST handler
// below to reject malformed input early with a 400.
function validate(object, body) {
  const errors = [];
  const b = body || {};
  // Required fields per object type
  const required = {
    companies: ['name'],
    contacts: ['firstName'],
    leads: ['firstName'],
    deals: ['name'],
    activities: ['subject'],
    products: ['name'],
  };
  for (const f of required[object] || []) {
    const v = b[f];
    if (v === undefined || v === null || String(v).trim() === '') errors.push(f + ' is required');
  }
  // Email format (if provided)
  for (const f of ['email']) {
    const v = b[f];
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim())) errors.push('Email format invalid: ' + f);
    }
  }
  // Phone format (digits, +, -, spaces, parens; 6-20 chars)
  for (const f of ['phone', 'mobile']) {
    const v = b[f];
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      if (!/^[0-9+\-\s()]{6,20}$/.test(String(v).trim())) errors.push('Phone format invalid: ' + f);
    }
  }
  // Website format (if provided)
  if (b.website !== undefined && b.website !== null && String(b.website).trim() !== '') {
    if (!/^https?:\/\/[^\s]+$/.test(String(b.website).trim())) errors.push('Website must start with http:// or https://');
  }
  // Numeric fields must be finite numbers
  for (const f of ['amount', 'probability', 'price', 'stock']) {
    if (b[f] !== undefined && b[f] !== null && b[f] !== '') {
      const n = Number(b[f]);
      if (!Number.isFinite(n) || n < 0) errors.push(f + ' must be a non-negative number');
    }
  }
  return errors;
}
function insert(table, tenantId, data) {
  const id = crypto.randomUUID();
  const keys = Object.keys(data);
  const cols = ['id', 'tenantId', ...keys];
  const vals = [id, tenantId, ...keys.map((key) => data[key])];
  db.prepare(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`).run(...vals);
  return id;
}
function list(table, tenantId, opts = {}) {
  // Pagination: default limit=500 (preserves pre-existing behavior),
  // capped at 500 max to prevent abuse. offset defaults to 0.
  const limit = Math.min(Math.max(Number(opts.limit ?? 500), 1), 500);
  const offset = Math.max(Number(opts.offset ?? 0), 0);
  return db.prepare(`SELECT * FROM ${table} WHERE tenantId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?`).all(tenantId, limit, offset);
}
function countRows(table, tenantId) {
  return db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE tenantId = ?`).get(tenantId).n;
}
function one(table, tenantId, id) {
  return db.prepare(`SELECT * FROM ${table} WHERE tenantId = ? AND id = ?`).get(tenantId, id);
}
function writeAudit(tenantId, userId, action, object, recordId, detail) {
  db.prepare('INSERT INTO audit (id, tenantId, userId, action, object, recordId, detail) VALUES (?,?,?,?,?,?,?)')
    .run(crypto.randomUUID(), tenantId, userId || '', action, object, recordId, String(detail || '').slice(0, 500));
}

const ears = new Set();
function notifyUser(tenantId, userId, note) {
  if (!tenantId || !userId || !note?.title) return null;
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO notifications (id, tenantId, userId, kind, title, body, recordType, recordId, sourceId) VALUES (?,?,?,?,?,?,?,?,?)')
    .run(id, tenantId, userId, String(note.kind || 'note').slice(0, 40), String(note.title).slice(0, 160), String(note.body || '').slice(0, 300), note.recordType || null, note.recordId || null, note.sourceId || null);
  const row = db.prepare('SELECT * FROM notifications WHERE id = ?').get(id);
  for (const ear of ears) {
    if (ear.tenantId === tenantId && ear.userId === userId) {
      try { ear.send(row); } catch { ears.delete(ear); }
    }
  }
  return row;
}
function sweepDue() {
  const today = new Date().toISOString().slice(0, 10);
  const rows = db.prepare("SELECT * FROM activities WHERE status = 'PLANNED' AND dueAt IS NOT NULL AND substr(dueAt, 1, 10) <= ? AND ownerId IS NOT NULL").all(today);
  for (const row of rows) {
    const seen = db.prepare("SELECT id FROM notifications WHERE tenantId = ? AND kind = 'task.due' AND sourceId = ?").get(row.tenantId, row.id);
    if (seen) continue;
    const linked = ['deal', 'contact', 'lead'].includes(row.relatedType);
    notifyUser(row.tenantId, row.ownerId, { kind: 'task.due', title: row.subject, body: 'Due ' + String(row.dueAt).slice(0, 10), recordType: linked ? row.relatedType : 'task', recordId: linked ? row.relatedId : row.id, sourceId: row.id });
  }
}

export function markCrmPaid(tenantId, invoiceNumber) {
  if (!tenantId || !invoiceNumber) return;
  const quote = db.prepare('SELECT * FROM quotes WHERE tenantId = ? AND booksInvoice = ?').get(tenantId, invoiceNumber);
  if (!quote) return;
  if (quote.status !== 'PAID') db.prepare("UPDATE quotes SET status = 'PAID' WHERE id = ?").run(quote.id);
  if (!quote.dealId) return;
  const now = new Date().toISOString();
  db.prepare("UPDATE deals SET paidAt = ? WHERE tenantId = ? AND id = ? AND (paidAt IS NULL OR paidAt = '')").run(now, tenantId, quote.dealId);
  const orders = db.prepare("SELECT id, meta, status FROM objects WHERE tenantId = ? AND kind = 'order'").all(tenantId);
  for (const order of orders) {
    let meta = {};
    try { meta = JSON.parse(order.meta || '{}'); } catch { meta = {}; }
    if (meta.dealId !== quote.dealId || order.status === 'PAID') continue;
    meta.paid = true;
    db.prepare("UPDATE objects SET status = 'PAID', meta = ? WHERE id = ?").run(JSON.stringify(meta).slice(0, 4000), order.id);
  }
  const deal = db.prepare('SELECT name, ownerId FROM deals WHERE tenantId = ? AND id = ?').get(tenantId, quote.dealId);
  writeAudit(tenantId, '', 'paid', 'deals', quote.dealId, invoiceNumber);
  if (deal && deal.ownerId) notifyUser(tenantId, deal.ownerId, { kind: 'paid', title: (deal.name || 'Deal') + ' was paid', body: invoiceNumber, recordType: 'deal', recordId: quote.dealId });
}

const DEFAULT_STAGES = [
  ['PROSPECTING', 'Prospecting', '#2563eb', 10, 0],
  ['INITIAL_CONTACT', 'Initial contact', '#d97706', 20, 0],
  ['NEEDS_ASSESSMENT', 'Needs assessment', '#ea580c', 40, 0],
  ['PROPOSAL_SENT', 'Proposal sent', '#db2777', 60, 0],
  ['NEGOTIATION', 'Negotiation', '#7c3aed', 80, 0],
  ['CLOSED_WON', 'Closed won', '#15803d', 100, 1],
  ['CLOSED_LOST', 'Closed lost', '#64748b', 0, 1],
];

function ensurePipeline(tenantId) {
  let pipeline = db.prepare('SELECT * FROM pipelines WHERE tenantId = ? AND isDefault = 1').get(tenantId);
  if (!pipeline) {
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO pipelines (id, tenantId, name, isDefault) VALUES (?,?,?,?)').run(id, tenantId, 'Sales');
    pipeline = { id, tenantId, name: 'Sales', isDefault: 1 };
    const put = db.prepare('INSERT INTO stages (id, tenantId, pipelineId, code, name, color, probability, position, closed) VALUES (?,?,?,?,?,?,?,?,?)');
    DEFAULT_STAGES.forEach((row, index) => put.run(crypto.randomUUID(), tenantId, id, row[0], row[1], row[2], row[3], index, row[4]));
  }
  return pipeline;
}

function stagesFor(tenantId) {
  const pipeline = ensurePipeline(tenantId);
  return db.prepare('SELECT * FROM stages WHERE tenantId = ? AND pipelineId = ? ORDER BY position').all(tenantId, pipeline.id);
}

function teamUserIds(tenantId, userId) {
  const ids = new Set([userId]);
  const teams = db.prepare('SELECT teamId FROM team_members WHERE tenantId = ? AND userId = ?').all(tenantId, userId);
  for (const team of teams) {
    for (const member of db.prepare('SELECT userId FROM team_members WHERE tenantId = ? AND teamId = ?').all(tenantId, team.teamId)) ids.add(member.userId);
  }
  return ids;
}

function canSee(user, row) {
  if (!row) return false;
  if (['OWNER', 'ADMIN', 'VIEWER', 'AUDITOR'].includes(user.role)) return true;
  if (!row.ownerId) return true;
  return teamUserIds(user.tenantId, user.sub).has(row.ownerId);
}

function sameTenant(table, tenantId, id) {
  if (!id) return true;
  return !!one(table, tenantId, id);
}

function visibleRows(rows, user, table) {
  if (!OWNED.has(table)) return rows;
  return rows.filter((row) => canSee(user, row));
}

const OWNED = new Set(['companies', 'contacts', 'leads', 'deals', 'activities']);
const STAMPED = new Set(['companies', 'contacts', 'leads', 'deals', 'activities']);
function patch(table, tenantId, id, data) {
  const next = { ...data };
  if (STAMPED.has(table)) next.updatedAt = new Date().toISOString();
  const keys = Object.keys(next);
  if (!keys.length || !one(table, tenantId, id)) return false;
  db.prepare(`UPDATE ${table} SET ${keys.map((key) => key + ' = ?').join(', ')} WHERE tenantId = ? AND id = ?`).run(...keys.map((key) => next[key]), tenantId, id);
  return true;
}

function sameContact(tenantId, data, exceptId) {
  const email = String(data.email || '').trim().toLowerCase();
  const phone = String(data.phone || '').trim();
  if (!email && !phone) return null;
  return db.prepare('SELECT id, firstName, lastName, email, phone FROM contacts WHERE tenantId = ?').all(tenantId)
    .find((row) => row.id !== exceptId && ((email && String(row.email || '').toLowerCase() === email) || (phone && row.phone === phone))) || null;
}

const DEFAULT_SEQUENCES = [
  ['First reply', 'INITIAL_CONTACT', 'Call them again', 1],
  ['Proposal follow-up', 'PROPOSAL_SENT', 'Follow up the proposal', 2],
  ['Decision', 'NEGOTIATION', 'Ask for the decision', 3],
];

function ensureSequences(tenantId) {
  const count = db.prepare('SELECT COUNT(*) AS n FROM sequences WHERE tenantId = ?').get(tenantId).n;
  if (count) return;
  const put = db.prepare('INSERT INTO sequences (id, tenantId, name, stage, taskSubject, days, active) VALUES (?,?,?,?,?,?,?)');
  for (const [name, stage, task, days] of DEFAULT_SEQUENCES) put.run(crypto.randomUUID(), tenantId, name, stage, task, days);
}

function applySequences(tenantId, deal) {
  ensureSequences(tenantId);
  const rows = db.prepare('SELECT * FROM sequences WHERE tenantId = ? AND stage = ? AND active = 1').all(tenantId, deal.stage);
  for (const seq of rows) {
    const ran = db.prepare('SELECT id FROM sequence_runs WHERE tenantId = ? AND sequenceId = ? AND dealId = ?').get(tenantId, seq.id, deal.id);
    if (ran) continue;
    const due = new Date(Date.now() + Number(seq.days || 1) * 86400000).toISOString().slice(0, 10);
    insert('activities', tenantId, { type: 'TASK', subject: seq.taskSubject + ': ' + deal.name, dueAt: due, status: 'PLANNED', relatedType: 'deal', relatedId: deal.id, notes: 'Opened by the sequence "' + seq.name + '".' });
    db.prepare('INSERT INTO sequence_runs (id, tenantId, sequenceId, dealId) VALUES (?,?,?,?)').run(crypto.randomUUID(), tenantId, seq.id, deal.id);
    if (deal.ownerId) notifyUser(tenantId, deal.ownerId, { kind: 'task', title: seq.taskSubject, body: deal.name, recordType: 'deal', recordId: deal.id });
  }
}

const DEFAULT_WORKFLOWS = [
  ['New lead', 'lead.created', 'Call the new lead', 1],
  ['Qualified', 'lead.qualified', 'Book the first meeting', 1],
  ['Won', 'deal.won', 'Start onboarding', 1],
  ['Lost', 'deal.lost', 'Write down why it was lost', 1],
];

function ensureWorkflows(tenantId) {
  const names = new Set(db.prepare('SELECT name FROM workflows WHERE tenantId = ?').all(tenantId).map((row) => row.name));
  const put = db.prepare('INSERT INTO workflows (id, tenantId, name, trigger, taskSubject, days, active) VALUES (?,?,?,?,?,?,?)');
  for (const [name, trigger, task, days] of DEFAULT_WORKFLOWS) {
    if (!names.has(name)) put.run(crypto.randomUUID(), tenantId, name, trigger, task, days);
  }
}

async function applyWorkflow(tenantId, trigger, record) {
  if (!record) return;
  ensureWorkflows(tenantId);
  const rows = db.prepare('SELECT * FROM workflows WHERE tenantId = ? AND trigger = ? AND active = 1').all(tenantId, trigger);
  for (const rule of rows) {
    const ran = db.prepare('SELECT status FROM workflow_runs WHERE tenantId = ? AND workflowId = ? AND recordId = ? ORDER BY ranAt DESC').get(tenantId, rule.id, record.id);
    if (ran && ran.status !== 'FAILED') continue;
    const due = new Date(Date.now() + Number(rule.days || 1) * 86400000).toISOString().slice(0, 10);
    const label = record.name || [record.firstName, record.lastName].filter(Boolean).join(' ') || 'record';
    const relatedType = trigger.startsWith('deal') ? 'deal' : 'lead';
    let status = 'OK';
    let detail = '';
    try {
      const action = rule.action || 'task';
      if (action === 'webhook') {
        const url = String(rule.target || '');
        if (!/^https:\/\//.test(url)) throw new Error('The address must start with https://');
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: trigger, id: record.id, name: label, email: record.email || null, phone: record.phone || null, stage: record.stage || record.status || null, amount: record.amount || null }), signal: AbortSignal.timeout(8000) });
        if (!res.ok) throw new Error('They answered ' + res.status);
        detail = 'Sent';
      } else if (action === 'notify') {
        if (!record.ownerId) throw new Error('This record has no owner');
        notifyUser(tenantId, record.ownerId, { kind: 'task', title: rule.taskSubject || rule.name, body: label, recordType: relatedType, recordId: record.id });
        detail = 'Owner notified';
      } else {
        insert('activities', tenantId, { type: 'TASK', subject: (rule.taskSubject || rule.name) + ': ' + label, dueAt: due, status: 'PLANNED', priority: 'NORMAL', relatedType, relatedId: record.id, ownerId: record.ownerId || null, notes: 'Opened by the flow "' + rule.name + '".' });
        if (record.ownerId) notifyUser(tenantId, record.ownerId, { kind: 'task', title: rule.taskSubject, body: label, recordType: relatedType, recordId: record.id });
        detail = 'Task opened';
      }
    } catch (error) {
      status = 'FAILED';
      detail = String(error.message || 'Failed').slice(0, 300);
    }
    db.prepare('INSERT INTO workflow_runs (id, tenantId, workflowId, recordId, status, detail, ranAt) VALUES (?,?,?,?,?,?,?)').run(crypto.randomUUID(), tenantId, rule.id, record.id, status, detail, new Date().toISOString());
  }
}

function touched(activities, id) {
  return activities.some((row) => row.relatedId === id);
}

function scoreOf(row, hasTouch, weights) {
  const w = weights || { email: 15, phone: 10, hot: 30, warm: 12, touch: 18, referral: 10, amount: 8, stale: 20 };
  let score = 8;
  if (row.email) score += w.email;
  if (row.phone || row.mobile) score += w.phone;
  if (row.rating === 'HOT') score += w.hot;
  else if (row.rating === 'WARM') score += w.warm;
  if (row.source && /refer|partner/i.test(String(row.source))) score += w.referral;
  if (hasTouch) score += w.touch;
  if (Number(row.amount || 0) >= 100000) score += w.amount;
  const age = Date.now() - new Date(row.createdAt || Date.now()).getTime();
  if (!hasTouch && age > 14 * 86400000) score -= w.stale;
  return Math.max(0, Math.min(100, score));
}

// ============================================================
// LEAD SCORING INTELLIGENCE — Phase 2 AI Foundation
// Replaces the simple weighted sum with a multi-signal model
// that produces:
//   - score:       0-100 (final lead quality estimate)
//   - confidence:  0-100 (how much data the score is based on)
//   - reasons:     top 5 positive signals (human-readable)
//   - concerns:    top 5 negative signals (human-readable)
//   - nextAction:  recommended next step
//   - signals:     raw signal values for debugging / re-training
//
// Categories of signals:
//   1. ENGAGEMENT DEPTH  — how many activities logged (not just binary)
//   2. CONTACT QUALITY   — email, phone, company present?
//   3. RECENCY           — last activity (3d=+8, 7d=+4, 90d=-8, >90d=-18)
//   4. MANUAL RATING     — sales rep's HOT/WARM/COLD
//   5. SOURCE QUALITY    — referral vs cold outreach
//   6. DEAL CONTEXT      — related deal amount + stage
//   7. STALENESS         — lead created 14d+ ago with 0 activity
//
// This is rule-based intelligence (not ML — that's Phase 3 once we
// have closed-won/lost data to train on). But it's far richer than
// the legacy scoreOf() binary-touch approach.
// ============================================================
function scoreLeadV2(lead, activities, deals) {
  const reasons = [];
  const concerns = [];
  const signals = {};
  let score = 50;          // neutral start
  let confidence = 25;     // low confidence until data arrives

  // === 1. ENGAGEMENT DEPTH (not binary) ===
  const leadActivities = activities.filter((a) =>
    a.relatedId === lead.id || a.relatedId === lead.contactId
  );
  const touches = leadActivities.length;
  const completed = leadActivities.filter((a) =>
    String(a.status).startsWith('DONE') || String(a.status).startsWith('COMPLETED')
  ).length;
  const planned = leadActivities.filter((a) => a.status === 'PLANNED').length;
  signals.touches = touches;
  signals.completedTouches = completed;
  signals.plannedTouches = planned;
  if (touches >= 5) { score += 15; reasons.push(`5+ activities (${touches} total)`); confidence += 12; }
  else if (touches >= 3) { score += 10; reasons.push(`${touches} activities logged`); confidence += 10; }
  else if (touches >= 1) { score += 6; reasons.push('Initial contact made'); confidence += 6; }
  else concerns.push('No activities logged');
  if (completed >= 2) { score += 8; reasons.push(`${completed} completed follow-ups`); }
  if (planned > 0) { score += 4; reasons.push(`${planned} planned follow-ups`); }

  // === 2. CONTACT DATA QUALITY ===
  if (lead.email) { score += 8; confidence += 10; }
  else concerns.push('Missing email');
  if (lead.phone || lead.mobile) { score += 6; confidence += 8; }
  if (lead.companyName) { score += 4; confidence += 5; }
  else concerns.push('No company name');
  signals.email = !!lead.email;
  signals.phone = !!(lead.phone || lead.mobile);
  signals.company = !!lead.companyName;

  // === 3. ENGAGEMENT RECENCY (time decay) ===
  const lastActivityAt = leadActivities
    .map((a) => new Date(a.createdAt).getTime())
    .sort((a, b) => b - a)[0];
  signals.lastActivityAt = lastActivityAt ? new Date(lastActivityAt).toISOString() : null;
  if (lastActivityAt) {
    const daysSince = Math.floor((Date.now() - lastActivityAt) / 86400000);
    if (daysSince <= 3) { score += 8; reasons.push(`Active ${daysSince}d ago`); }
    else if (daysSince <= 7) { score += 4; reasons.push(`Active ${daysSince}d ago`); }
    else if (daysSince <= 30) { /* neutral */ }
    else if (daysSince <= 90) { score -= 8; concerns.push(`Inactive ${daysSince}d`); }
    else { score -= 18; concerns.push(`Cold lead (inactive ${daysSince}d)`); }
    signals.daysSinceLastTouch = daysSince;
  }

  // === 4. MANUAL RATING (sales rep's gut) ===
  if (lead.rating === 'HOT') { score += 15; reasons.push('Marked HOT'); confidence += 10; }
  else if (lead.rating === 'WARM') { score += 7; reasons.push('Marked WARM'); }
  else if (lead.rating === 'COLD') { score -= 8; concerns.push('Marked COLD'); }
  signals.rating = lead.rating;

  // === 5. SOURCE QUALITY ===
  const src = String(lead.source || '').toLowerCase();
  if (/refer|partner|existing|repeat|word-of-mouth/.test(src)) {
    score += 12; reasons.push(`Quality source: ${lead.source}`); confidence += 8;
  } else if (/cold|ads|purchased|bought/.test(src)) {
    score -= 5; concerns.push(`Cold source: ${lead.source}`);
  }
  signals.source = lead.source;

  // === 6. DEAL CONTEXT (is this lead attached to a deal?) ===
  const relatedDeal = deals.find((d) => d.leadId === lead.id);
  if (relatedDeal) {
    confidence += 15;
    signals.relatedDealId = relatedDeal.id;
    signals.dealAmount = relatedDeal.amount;
    if (relatedDeal.amount >= 1000000) {
      score += 10; reasons.push(`Big deal: NGN ${(relatedDeal.amount / 1000000).toFixed(1)}M`);
    } else if (relatedDeal.amount >= 100000) {
      score += 6; reasons.push(`Deal: NGN ${(relatedDeal.amount / 1000).toFixed(0)}k`);
    }
    if (/proposal|negotiation/i.test(relatedDeal.stage || '')) {
      score += 8; reasons.push(`In ${relatedDeal.stage} stage`);
    } else if (/closed.?won/i.test(relatedDeal.stage || '')) {
      score += 5; reasons.push('Tied to a WON deal');
    }
  }

  // === 7. STALENESS PENALTY ===
  const ageDays = Math.floor((Date.now() - new Date(lead.createdAt || Date.now()).getTime()) / 86400000);
  signals.ageDays = ageDays;
  if (touches === 0 && ageDays > 14) {
    score -= 12; concerns.push(`No activity in ${ageDays}d since creation`);
  }

  // Clamp
  score = Math.max(0, Math.min(100, Math.round(score)));
  confidence = Math.max(0, Math.min(100, Math.round(confidence)));

  // === RECOMMENDED NEXT ACTION ===
  let nextAction;
  if (score >= 75 && relatedDeal) nextAction = 'Push deal forward — high intent';
  else if (score >= 75) nextAction = 'Create deal — high intent';
  else if (score >= 55) nextAction = 'Schedule follow-up call this week';
  else if (score >= 35) nextAction = 'Add to nurture sequence';
  else if (touches === 0) nextAction = 'Make first contact';
  else nextAction = 'Park — low priority';

  return {
    score,
    confidence,
    reasons: reasons.slice(0, 5),
    concerns: concerns.slice(0, 5),
    nextAction,
    signals,
  };
}

function modelWeights(tenantId) {
  const workspace = db.prepare('SELECT * FROM workspace WHERE tenantId = ?').get(tenantId) || {};
  const weights = { email: 15, phone: 10, hot: 30, warm: 12, touch: 18, referral: 10, amount: 8, stale: 20 };
  if (/whatsapp|phone|call/i.test(workspace.channel || '')) weights.phone = 24;
  if (/email/i.test(workspace.channel || '')) weights.email = 26;
  if (/close/i.test(workspace.goal || '')) weights.amount = 18;
  if (/job|support|service/i.test(workspace.goal || '')) weights.touch = 26;
  return { weights, workspace };
}

function brainFor(tenantId) {
  ensureSequences(tenantId);
  const { weights } = modelWeights(tenantId);
  const activities = list('activities', tenantId);
  const leads = list('leads', tenantId).filter((row) => row.status !== 'CONVERTED' && row.status !== 'DEAD');
  const deals = list('deals', tenantId).filter((row) => !String(row.stage).startsWith('CLOSED'));
  const today = new Date().toISOString().slice(0, 10);
  const attention = [];
  for (const row of activities.filter((item) => item.status === 'PLANNED' && item.dueAt && item.dueAt.slice(0, 10) <= today)) {
    attention.push({ kind: 'task', title: row.subject, detail: 'Due ' + row.dueAt.slice(0, 10), id: row.id });
  }
  for (const row of deals) {
    const quiet = !touched(activities, row.id);
    const late = row.closeDate && row.closeDate.slice(0, 10) < today;
    if (late) attention.push({ kind: 'deal', title: row.name, detail: 'Close date has passed and it is still open.', id: row.id });
    else if (quiet) attention.push({ kind: 'deal', title: row.name, detail: 'No activity on this deal.', id: row.id });
    else if (!row.closeDate) attention.push({ kind: 'deal', title: row.name, detail: 'No close date.', id: row.id });
  }
  const scored = leads.map((row) => ({ id: row.id, name: [row.firstName, row.lastName].filter(Boolean).join(' '), company: row.companyName || '', score: scoreOf(row, touched(activities, row.id) || touched(activities, row.contactId), weights), rating: row.rating || '' }));
  scored.sort((a, b) => b.score - a.score);
  for (const row of scored.filter((item) => item.score >= 55).slice(0, 5)) {
    attention.push({ kind: 'lead', title: row.name, detail: 'Score ' + row.score + (row.company ? ' · ' + row.company : ''), id: row.id });
  }
  const openTickets = db.prepare("SELECT id, subject, createdAt FROM tickets WHERE tenantId = ? AND status = 'OPEN' ORDER BY createdAt").all(tenantId);
  for (const row of openTickets) attention.push({ kind: 'ticket', title: row.subject, detail: 'Open service ticket.', id: row.id });
  return {
    attention: attention.slice(0, 12),
    scores: scored.slice(0, 8),
    sequences: db.prepare('SELECT id, name, stage, taskSubject, days, active FROM sequences WHERE tenantId = ?').all(tenantId),
    openDeals: deals.length,
    weighted: Math.round(deals.reduce((sum, row) => sum + Number(row.amount || 0) * Number(row.probability || 0) / 100, 0)),
    weights,
  };
}

async function guard(req, reply) {
  try {
    await req.jwtVerify();
    if (req.user.aud !== 'afri-crm' || req.user.product !== 'crm') {
      reply.code(401).send({ error: 'This sign-in is for the books, not Afri CRM.' });
      return null;
    }
    if (req.user.sid) {
      const session = db.prepare('SELECT revokedAt FROM crm_sessions WHERE id = ?').get(req.user.sid);
      if (!session || session.revokedAt) {
        reply.code(401).send({ error: 'This session was closed. Sign in again.' });
        return null;
      }
    }
    const account = db.prepare('SELECT active FROM crm_accounts WHERE id = ?').get(req.user.sub);
    if (account && Number(account.active) === 0) {
      reply.code(401).send({ error: 'This account is switched off.' });
      return null;
    }
    return req.user;
  } catch { reply.code(401).send({ error: 'Unauthorized' }); return null; }
}
function canWrite(user, reply) {
  if (user.role === 'VIEWER' || user.role === 'AUDITOR') {
    reply.code(403).send({ error: 'This role can look, not change records.' });
    return false;
  }
  return true;
}

function signCrm(app, account, sid) {
  return app.jwt.sign(
    { sub: account.id, tenantId: account.workspaceId, role: account.role, aud: 'afri-crm', product: 'crm', sid: sid || undefined },
    { expiresIn: '8h' },
  );
}
function openSession(app, account, req) {
  const sid = crypto.randomUUID();
  db.prepare('INSERT INTO crm_sessions (id, accountId, workspaceId, ip, agent) VALUES (?,?,?,?,?)').run(
    sid, account.id, account.workspaceId, String(req.ip || '').slice(0, 80), String(req.headers['user-agent'] || '').slice(0, 180)
  );
  return signCrm(app, account, sid);
}
const AREAS = ['Dashboard', 'Tasks', 'Records', 'Files', 'Export'];
const ACTIONS = ['view', 'create', 'edit', 'assign', 'delete', 'export'];
const ROLE_SEED = {
  OWNER: () => 1,
  ADMIN: (area, action) => !(action === 'delete' && area === 'Export'),
  MANAGER: (area, action) => action !== 'delete',
  SALES: (area, action) => ['view', 'create', 'edit'].includes(action),
  VIEWER: (area, action) => action === 'view',
};
function seedAccess(tenantId) {
  const have = db.prepare('SELECT 1 FROM crm_permissions WHERE tenantId = ? LIMIT 1').get(tenantId);
  if (have) return;
  const insert = db.prepare('INSERT INTO crm_permissions (tenantId, roleName, area, action, allowed) VALUES (?,?,?,?,?)');
  for (const [role, allow] of Object.entries(ROLE_SEED)) {
    for (const area of AREAS) for (const action of ACTIONS) insert.run(tenantId, role, area, action, allow(area, action) ? 1 : 0);
  }
}
function publishEvent(tenantId, name, payload) {
  db.prepare('INSERT INTO crm_events (id, tenantId, name, payload, status, runAt) VALUES (?,?,?,?,?,?)').run(
    crypto.randomUUID(), tenantId, name, JSON.stringify(payload || {}).slice(0, 4000), 'PENDING', new Date().toISOString()
  );
}
function drainEvents() {
  const due = db.prepare("SELECT * FROM crm_events WHERE status = 'PENDING' AND (runAt IS NULL OR runAt <= ?) ORDER BY createdAt LIMIT 20").all(new Date().toISOString());
  for (const row of due) {
    db.prepare("UPDATE crm_events SET status = 'RUNNING', attempts = attempts + 1 WHERE id = ?").run(row.id);
    try {
      let payload = {};
      try { payload = JSON.parse(row.payload || '{}'); } catch { payload = {}; }
      if (row.name === 'lead.created' && payload.id) {
        const lead = one('leads', row.tenantId, payload.id);
        if (lead) applyWorkflow(row.tenantId, 'lead.created', lead);
      }
      if (row.name === 'deal.won' && payload.id) {
        const deal = one('deals', row.tenantId, payload.id);
        if (deal) applyWorkflow(row.tenantId, 'deal.won', deal);
      }
      db.prepare("UPDATE crm_events SET status = 'DONE', lastError = NULL WHERE id = ?").run(row.id);
    } catch (error) {
      const attempts = Number(row.attempts || 0) + 1;
      const again = attempts < 5 ? new Date(Date.now() + attempts * 60000).toISOString() : null;
      db.prepare('UPDATE crm_events SET status = ?, lastError = ?, runAt = ? WHERE id = ?').run(again ? 'PENDING' : 'FAILED', String(error.message || error).slice(0, 300), again, row.id);
    }
  }
}
function slugify(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'workspace';
}

export function registerCrm(app, prisma) {
  // ============================================================
  // RATE LIMITING — 120 req/min per IP on /crm/api/* (auth routes
  // get a tighter 20/min cap to discourage brute-force). Uses the
  // in-memory `limited()` helper from earlier in this file. This is
  // a baseline protection; a proper Redis-backed limiter is a Phase 5
  // task. Bypassed entirely during tests so vitest stays fast.
  // ============================================================
  app.addHook('onRequest', async (req, reply) => {
    if (process.env.NODE_ENV === 'test') return;
    const url = req.url || '';
    if (!url.startsWith('/crm/api/')) return;
    const ip = String(req.headers['x-forwarded-for'] || req.ip || 'unknown').split(',')[0].trim();
    const isAuth = url.startsWith('/crm/api/login') || url.startsWith('/crm/api/signup') || url.startsWith('/crm/api/sso/');
    const cap = isAuth ? 20 : 120;
    if (limited('rl:' + ip, cap, 60 * 1000)) {
      log.warn('rate-limit.hit', { ip, path: url, cap });
      reply.code(429).header('Retry-After', '60').send({ error: 'Too many requests. Slow down.' });
      return reply;
    }
  });

  if (process.env.NODE_ENV !== 'test' && !globalThis.__crmSweep) {
    globalThis.__crmSweep = setInterval(() => { sweepDue(); try { drainEvents(); } catch { /* a bad job must not stop the clock */ } }, 60000);
    globalThis.__crmSweep.unref?.();
  }
  async function pickOwner(tenantId) {
    const users = await prisma.user.findMany({ where: { tenantId }, orderBy: { createdAt: 'asc' }, select: { id: true } });
    if (!users.length) return null;
    const count = db.prepare('SELECT COUNT(*) AS n FROM leads WHERE tenantId = ?').get(tenantId).n;
    return users[count % users.length].id;
  }
  const crud = (name) => {
    app.get('/crm/api/' + name, async (req, reply) => {
      const user = await guard(req, reply); if (!user) return;
      // Pagination: ?offset=0&limit=50 — backward compatible (no
      // params = first 500 rows, same as before).
      const offset = Math.max(Number(req.query?.offset || 0), 0);
      const limit = Math.min(Math.max(Number(req.query?.limit || 500), 1), 500);
      const rows = visibleRows(list(name, user.tenantId, { offset, limit }), user, name);
      reply.header('X-Total-Count', String(countRows(name, user.tenantId)));
      reply.header('X-Page-Offset', String(offset));
      reply.header('X-Page-Limit', String(limit));
      reply.header('Access-Control-Expose-Headers', 'X-Total-Count, X-Page-Offset, X-Page-Limit');
      return rows;
    });
    app.post('/crm/api/' + name, async (req, reply) => {
      const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
      // Validate BEFORE insert — reject malformed input with a 400.
      const errors = validate(name, req.body || {});
      if (errors.length) {
        log.warn('validation failed', { object: name, errors, tenantId: user.tenantId, userId: user.sub });
        return reply.code(400).send({ error: 'Validation failed', errors });
      }
      const data = clean(name, req.body || {});
      const required = name === 'contacts' || name === 'leads' ? data.firstName : data.name || data.subject;
      if (!required) return reply.code(400).send({ error: 'A name is required' });
      if (OWNED.has(name) && !data.ownerId) data.ownerId = user.sub;
      if (data.companyId && !sameTenant('companies', user.tenantId, data.companyId)) return reply.code(400).send({ error: 'That company is not in this business' });
      if (data.contactId && !sameTenant('contacts', user.tenantId, data.contactId)) return reply.code(400).send({ error: 'That contact is not in this business' });
      if (name === 'contacts' && !req.body?.force) {
        const dup = sameContact(user.tenantId, data);
        if (dup) return reply.code(409).send({ error: (dup.firstName + ' ' + (dup.lastName || '')).trim() + ' already has this email or phone.', duplicateId: dup.id });
      }
      if (name === 'companies' && data.name && !req.body?.force) {
        const dup = db.prepare('SELECT id, name FROM companies WHERE tenantId = ? AND name = ? COLLATE NOCASE').get(user.tenantId, data.name);
        if (dup) return reply.code(409).send({ error: dup.name + ' is already a company.', duplicateId: dup.id });
      }
      const id = insert(name, user.tenantId, data);
      writeAudit(user.tenantId, user.sub, 'created', name, id, data.name || data.firstName || data.subject || '');
      const created = one(name, user.tenantId, id);
      if (name === 'leads') applyWorkflow(user.tenantId, 'lead.created', created);
      if (created.ownerId && created.ownerId !== user.sub && (name === 'leads' || name === 'deals' || name === 'activities')) {
        const type = { leads: 'lead', deals: 'deal', activities: created.relatedType || 'task' }[name];
        notifyUser(user.tenantId, created.ownerId, { kind: 'assigned', title: name === 'activities' ? created.subject : (created.name || (created.firstName + ' ' + (created.lastName || '')).trim()), body: 'Assigned to you', recordType: type, recordId: name === 'activities' && created.relatedId ? created.relatedId : created.id });
      }
      return reply.code(201).send(created);
    });
    app.patch('/crm/api/' + name + '/:id', async (req, reply) => {
      const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
      const before = one(name, user.tenantId, req.params.id);
      if (!before) return reply.code(404).send({ error: 'Not found' });
      if (!canSee(user, before)) return reply.code(403).send({ error: 'That record is not yours' });
      const data = clean(name, req.body || {});
      if (data.companyId && !sameTenant('companies', user.tenantId, data.companyId)) return reply.code(400).send({ error: 'That company is not in this business' });
      if (data.contactId && !sameTenant('contacts', user.tenantId, data.contactId)) return reply.code(400).send({ error: 'That contact is not in this business' });
      if (name === 'contacts' && !req.body?.force) {
        const dup = sameContact(user.tenantId, { ...before, ...data }, before.id);
        if (dup) return reply.code(409).send({ error: (dup.firstName + ' ' + (dup.lastName || '')).trim() + ' already has this email or phone.', duplicateId: dup.id });
      }
      if (name === 'deals' && (data.stage || before.stage) === 'CLOSED_LOST') {
        const reason = String(data.lostReason ?? before.lostReason ?? '').trim();
        if (!reason || reason === 'Marked lost') return reply.code(400).send({ error: 'Say why the deal was lost' });
      }
      if (!patch(name, user.tenantId, req.params.id, data)) return reply.code(404).send({ error: 'Not found' });
      const row = one(name, user.tenantId, req.params.id);
      const changes = Object.keys(data).filter((key) => String(before[key] ?? '') !== String(data[key] ?? '')).map((key) => key + ': ' + (before[key] ?? 'empty') + ' → ' + (data[key] ?? 'empty'));
      writeAudit(user.tenantId, user.sub, 'updated', name, req.params.id, changes.join('; ') || 'no field changed');
      if (name === 'contacts' && row.status === 'CUSTOMER' && row.companyId && before.status !== 'CUSTOMER') {
        patch('companies', user.tenantId, row.companyId, { type: 'CUSTOMER' });
      }
      if (before && name === 'deals' && row.stage !== before.stage) {
        applySequences(user.tenantId, row);
        if (row.stage === 'CLOSED_WON') applyWorkflow(user.tenantId, 'deal.won', row);
        if (row.stage === 'CLOSED_LOST') applyWorkflow(user.tenantId, 'deal.lost', row);
      }
      if (before && name === 'leads' && row.status === 'QUALIFIED' && before.status !== 'QUALIFIED') applyWorkflow(user.tenantId, 'lead.qualified', row);
      if (data.ownerId && data.ownerId !== before.ownerId && data.ownerId !== user.sub) {
        const type = { leads: 'lead', deals: 'deal', contacts: 'contact', companies: 'company' }[name];
        if (type) notifyUser(user.tenantId, data.ownerId, { kind: 'assigned', title: row.name || (row.firstName + ' ' + (row.lastName || '')).trim() || row.subject, body: 'Assigned to you', recordType: type, recordId: row.id });
      } else if (name === 'deals' && row.stage !== before.stage && row.ownerId && row.ownerId !== user.sub) {
        notifyUser(user.tenantId, row.ownerId, { kind: 'deal', title: row.name + ' moved', body: row.stage, recordType: 'deal', recordId: row.id });
      }
      return row;
    });
  };
  ['companies', 'contacts', 'leads', 'deals', 'activities', 'products'].forEach(crud);

  app.get('/crm/api/home', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const tenantId = user.tenantId;
    const leads = list('leads', tenantId);
    const deals = list('deals', tenantId);
    const activities = list('activities', tenantId);
    const quotes = list('quotes', tenantId);
    const openDeals = deals.filter((row) => !row.stage.startsWith('CLOSED'));
    const weighted = openDeals.reduce((sum, row) => sum + Number(row.amount || 0) * (Number(row.probability || 0) / 100), 0);
    const today = new Date().toISOString().slice(0, 10);
    return {
      newLeads: leads.filter((row) => row.status === 'NEW').length,
      openDeals: openDeals.length,
      weighted,
      quotesOut: quotes.filter((row) => row.status === 'SENT').length,
      due: activities.filter((row) => row.status === 'PLANNED' && row.dueAt && row.dueAt.slice(0, 10) <= today),
      hot: leads.filter((row) => row.rating === 'HOT' && row.status !== 'CONVERTED' && row.status !== 'DEAD'),
    };
  });

  // ============================================================
  // Forecast dashboard — pipeline analytics for the Today sidebar
  // GET /crm/api/forecast
  // Returns: pipelineValue, wonThisMonth, lostThisMonth, conversionRate,
  //          stageDistribution (count + value per stage), topDeals (top 5 by value)
  // ============================================================
  app.get('/crm/api/forecast', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const tenantId = user.tenantId;
    const deals = list('deals', tenantId);
    const stages = stagesFor(tenantId);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const open = deals.filter((row) => !String(row.stage || '').startsWith('CLOSED'));
    const won = deals.filter((row) => String(row.stage || '') === 'CLOSED_WON');
    const lost = deals.filter((row) => String(row.stage || '') === 'CLOSED_LOST');
    const wonThisMonth = won.filter((row) => String(row.paidAt || row.createdAt || '') >= monthStart);
    const lostThisMonth = lost.filter((row) => String(row.createdAt || '') >= monthStart);
    const pipelineValue = open.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const wonValue = wonThisMonth.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const closed = won.length + lost.length;
    const stageDistribution = stages.map(([id, label, color, chance]) => {
      const inStage = deals.filter((row) => stageOf(row) === id);
      return {
        stage: id, label, color, chance,
        count: inStage.length,
        value: inStage.reduce((sum, row) => sum + Number(row.amount || 0), 0),
      };
    });
    const topDeals = open.slice().sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0)).slice(0, 5).map((row) => ({
      id: row.id, name: row.name, amount: Number(row.amount || 0), stage: row.stage, closeDate: row.closeDate,
    }));
    return {
      pipelineValue,
      wonThisMonth: { count: wonThisMonth.length, value: wonValue },
      lostThisMonth: { count: lostThisMonth.length, value: lostThisMonth.reduce((sum, row) => sum + Number(row.amount || 0), 0) },
      conversionRate: closed ? Math.round((won.length / closed) * 100) : 0,
      stageDistribution,
      topDeals,
      totalDeals: deals.length,
      openCount: open.length,
      wonCount: won.length,
      lostCount: lost.length,
    };
  });

  // ============================================================
  // CSV import — bulk insert contacts from a parsed CSV.
  // POST /crm/api/import/contacts  body: { rows: [{ firstName, lastName, email, phone, ... }] }
  // Returns: { imported, skipped, total }
  // ============================================================
  app.post('/crm/api/import/contacts', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const tenantId = user.tenantId;
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    let imported = 0, skipped = 0;
    const errors = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] || {};
      const email = String(row.email || '').trim().toLowerCase();
      const firstName = String(row.firstName || row.first || row.name || '').trim();
      const lastName = String(row.lastName || row.last || '').trim();
      // Skip rows without at least a name
      if (!firstName && !lastName) { skipped++; continue; }
      // Skip duplicates by email
      if (email) {
        const exists = db.prepare('SELECT id FROM contacts WHERE tenantId = ? AND email = ?').get(tenantId, email);
        if (exists) { skipped++; continue; }
      }
      try {
        insert('contacts', tenantId, {
          firstName: firstName || 'Unknown',
          lastName: lastName || '',
          email: email || null,
          phone: String(row.phone || row.mobile || '').trim() || null,
          title: String(row.title || row.role || '').trim() || null,
          city: String(row.city || '').trim() || null,
          source: String(row.source || 'CSV import').trim().slice(0, 60) || 'CSV import',
          status: String(row.status || 'ACTIVE').trim().slice(0, 12) || 'ACTIVE',
          ownerId: user.sub,
        });
        imported++;
      } catch (err) {
        skipped++;
        errors.push({ row: i + 1, error: String(err.message || 'Insert failed').slice(0, 100) });
      }
    }
    writeAudit(tenantId, user.sub, 'import', 'contacts', 'bulk', `${imported} imported, ${skipped} skipped`);
    return { imported, skipped, total: rows.length, errors: errors.slice(0, 5) };
  });

  app.post('/crm/api/leads/:id/convert', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const lead = one('leads', user.tenantId, req.params.id);
    if (!lead) return reply.code(404).send({ error: 'Not found' });
    if (!canSee(user, lead)) return reply.code(403).send({ error: 'That record is not yours' });
    if (lead.status === 'CONVERTED') return reply.code(400).send({ error: 'Already converted' });
    if (lead.status === 'DEAD') return reply.code(400).send({ error: 'A dead lead is not converted' });
    const companyName = String(lead.companyName || '').trim();
    let companyId = null;
    if (companyName) {
      const existing = db.prepare('SELECT id FROM companies WHERE tenantId = ? AND name = ? COLLATE NOCASE').get(user.tenantId, companyName);
      companyId = existing ? existing.id : insert('companies', user.tenantId, clean('companies', {
        name: companyName, industry: lead.industry, type: 'PROSPECT', website: lead.website, phone: lead.phone, email: lead.email,
        street: lead.street, city: lead.city, state: lead.state, country: lead.country, description: lead.description, ownerId: lead.ownerId, source: lead.source,
      }));
    }
    const contactId = (() => {
      const existing = sameContact(user.tenantId, { email: lead.email, phone: lead.phone });
      if (existing) return existing.id;
      return insert('contacts', user.tenantId, clean('contacts', {
        firstName: lead.firstName, lastName: lead.lastName, title: lead.title, email: lead.email, phone: lead.phone,
        mobile: lead.mobile, companyId, street: lead.street, city: lead.city, state: lead.state, country: lead.country, ownerId: lead.ownerId, source: lead.source, status: 'ACTIVE',
      }));
    })();
    const first = stagesFor(user.tenantId).find((row) => !row.closed) || { code: 'PROSPECTING', probability: 10 };
    const dealId = insert('deals', user.tenantId, clean('deals', {
      name: (companyName || lead.firstName) + ' deal', companyId, contactId, leadId: lead.id,
      amount: 0, probability: first.probability, stage: first.code, source: lead.source, nextStep: 'First conversation', ownerId: lead.ownerId,
    }));
    db.prepare("UPDATE activities SET relatedType = 'deal', relatedId = ? WHERE tenantId = ? AND relatedId = ?").run(dealId, user.tenantId, lead.id);
    const due = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    insert('activities', user.tenantId, { type: 'TASK', subject: 'First conversation: ' + (companyName || lead.firstName), dueAt: due, status: 'PLANNED', priority: 'HIGH', relatedType: 'deal', relatedId: dealId, ownerId: lead.ownerId, notes: 'Opened when the lead was converted.' });
    patch('leads', user.tenantId, lead.id, { status: 'CONVERTED', companyId, contactId });
    writeAudit(user.tenantId, user.sub, 'converted', 'leads', lead.id, 'Contact, deal, and a follow-up');
    return { companyId, contactId, dealId };
  });

  app.get('/crm/api/quotes', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const quotes = list('quotes', user.tenantId);
    return quotes.map((quote) => ({ ...quote, lines: db.prepare('SELECT * FROM quote_lines WHERE quoteId = ?').all(quote.id) }));
  });
  app.post('/crm/api/quotes', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const body = req.body || {};
    const lines = Array.isArray(body.lines) ? body.lines : [];
    if (!lines.length) return reply.code(400).send({ error: 'Add a line' });
    let subtotal = 0;
    const ready = lines.map((line) => {
      const quantity = Number(line.quantity || 0);
      const unitPrice = Number(line.unitPrice || 0);
      const discount = Number(line.discount || 0);
      const lineTotal = quantity * unitPrice * (1 - discount / 100);
      subtotal += lineTotal;
      return { description: String(line.description || '').slice(0, 300), quantity, unitPrice, discount, lineTotal, productId: line.productId || null };
    }).filter((line) => line.description && line.quantity > 0);
    if (!ready.length) return reply.code(400).send({ error: 'Add a line' });
    const tax = subtotal * 0.075;
    const count = db.prepare('SELECT COUNT(*) AS n FROM quotes WHERE tenantId = ?').get(user.tenantId).n;
    const id = insert('quotes', user.tenantId, {
      number: 'QT-' + String(count + 1).padStart(4, '0'),
      companyId: body.companyId || null, contactId: body.contactId || null, dealId: body.dealId || null,
      validUntil: body.validUntil || null, status: 'DRAFT', subtotal, tax, total: subtotal + tax,
      terms: body.terms || null, notes: body.notes || null,
    });
    const add = db.prepare('INSERT INTO quote_lines (id, quoteId, productId, description, quantity, unitPrice, discount, lineTotal) VALUES (?,?,?,?,?,?,?,?)');
    for (const line of ready) add.run(crypto.randomUUID(), id, line.productId, line.description, line.quantity, line.unitPrice, line.discount, line.lineTotal);
    return reply.code(201).send({ ...one('quotes', user.tenantId, id), lines: ready });
  });
  app.post('/crm/api/quotes/:id/:action', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const quote = one('quotes', user.tenantId, req.params.id);
    if (!quote) return reply.code(404).send({ error: 'Not found' });
    const action = req.params.action;
    if (action === 'send' && quote.status === 'DRAFT') { patch('quotes', user.tenantId, quote.id, { status: 'SENT' }); return one('quotes', user.tenantId, quote.id); }
    if (action === 'reject' && quote.status === 'SENT') { patch('quotes', user.tenantId, quote.id, { status: 'REJECTED' }); return one('quotes', user.tenantId, quote.id); }
    if (action !== 'accept' || quote.status !== 'SENT') return reply.code(400).send({ error: 'That quote cannot be changed' });
    const lines = db.prepare('SELECT * FROM quote_lines WHERE quoteId = ?').all(quote.id);
    const company = quote.companyId ? one('companies', user.tenantId, quote.companyId) : null;
    const contact = quote.contactId ? one('contacts', user.tenantId, quote.contactId) : null;
    let booksInvoice = null;
    try {
      const name = (company && company.name) || (contact ? (contact.firstName + ' ' + (contact.lastName || '')).trim() : 'Afri CRM customer');
      let customer = await prisma.customer.findFirst({ where: { tenantId: user.tenantId, name } });
      if (!customer) customer = await prisma.customer.create({ data: { tenantId: user.tenantId, name, email: (contact && contact.email) || (company && company.email) || null, phone: (contact && contact.phone) || (company && company.phone) || null } });
      const count = await prisma.invoice.count({ where: { tenantId: user.tenantId } });
      const number = 'INV-' + String(count + 1).padStart(4, '0');
      const invoice = await prisma.invoice.create({ data: {
        tenantId: user.tenantId, customerId: customer.id, number, dueDate: new Date(Date.now() + 30 * 86400000),
        currency: 'NGN', fxRate: 1, subtotal: quote.subtotal, vatAmount: quote.tax, total: quote.total, status: 'DRAFT',
        lines: { create: lines.map((line) => ({ description: line.description, quantity: line.quantity, unitPrice: line.unitPrice, lineTotal: line.lineTotal })) },
      } });
      booksInvoice = invoice.number;
    } catch (error) {
      return reply.code(400).send({ error: 'The quote stayed here. The books did not take it: ' + error.message });
    }
    patch('quotes', user.tenantId, quote.id, { status: 'ACCEPTED', booksInvoice });
    if (quote.dealId) {
      const before = one('deals', user.tenantId, quote.dealId);
      patch('deals', user.tenantId, quote.dealId, { stage: 'CLOSED_WON', probability: 100 });
      const won = one('deals', user.tenantId, quote.dealId);
      if (before && before.stage !== 'CLOSED_WON' && won) applyWorkflow(user.tenantId, 'deal.won', won);
    }
    return { ...one('quotes', user.tenantId, quote.id), booksInvoice };
  });

  app.post('/crm/api/signup', async (req, reply) => {
    if (limited('crm-signup:' + (req.ip || 'unknown'), 5, 60 * 60 * 1000)) return reply.code(429).send({ error: 'Too many new accounts. Try again later.' });
    const body = req.body || {};
    const name = String(body.name || '').trim();
    const fullName = String(body.fullName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!name || !fullName || !email || password.length < 8) return reply.code(400).send({ error: 'Business name, your name, email, and a password of 8 characters are required.' });
    if (db.prepare('SELECT id FROM crm_accounts WHERE email = ?').get(email)) return reply.code(409).send({ error: 'That email already has an Afri CRM account.' });
    let workspaceId = crypto.randomUUID();
    if (body.claim) {
      const erp = await prisma.user.findFirst({ where: { email }, include: { tenant: true } });
      if (!erp || !(await bcrypt.compare(password, erp.passwordHash))) return reply.code(401).send({ error: 'The books password did not match. Leave the box unchecked to start a new CRM.' });
      workspaceId = erp.tenantId;
      if (db.prepare('SELECT id FROM crm_workspaces WHERE id = ?').get(workspaceId)) return reply.code(409).send({ error: 'Those CRM records already have an owner.' });
    }
    let slug = slugify(name);
    if (db.prepare('SELECT id FROM crm_workspaces WHERE slug = ?').get(slug)) slug = slug + '-' + crypto.randomBytes(2).toString('hex');
    const accountId = crypto.randomUUID();
    const hash = await bcrypt.hash(password, 10);
    db.prepare('INSERT INTO crm_workspaces (id, name, slug) VALUES (?,?,?)').run(workspaceId, name, slug);
    db.prepare('INSERT INTO crm_accounts (id, workspaceId, email, passwordHash, fullName, role) VALUES (?,?,?,?,?,?)').run(accountId, workspaceId, email, hash, fullName, 'OWNER');
    seedAccess(workspaceId);
    writeAudit(workspaceId, accountId, 'signup', 'account', accountId, email);
    publishEvent(workspaceId, 'account.created', { id: accountId });
    seedDemo(workspaceId, accountId);
    const accessToken = openSession(app, { id: accountId, workspaceId, role: 'OWNER' }, req);
    return reply.code(201).send({ accessToken, slug, fullName, email });
  });
  app.post('/crm/api/login', async (req, reply) => {
    if (limited('crm-login:' + (req.ip || 'unknown'), 12, 15 * 60 * 1000)) return reply.code(429).send({ error: 'Too many tries. Wait 15 minutes.' });
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const account = email ? db.prepare('SELECT * FROM crm_accounts WHERE email = ?').get(email) : null;
    const locked = account && account.lockedUntil && account.lockedUntil > new Date().toISOString();
    if (!account || locked || !(await bcrypt.compare(password, account.passwordHash))) {
      if (account && !locked) {
        const failed = Number(account.failed || 0) + 1;
        const until = failed >= 8 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
        db.prepare('UPDATE crm_accounts SET failed = ?, lockedUntil = ? WHERE id = ?').run(until ? 0 : failed, until, account.id);
        writeAudit(account.workspaceId, account.id, 'login.failed', 'account', account.id, email);
      }
      return reply.code(401).send({ error: 'Email or password is wrong.' });
    }
    if (Number(account.active) === 0) return reply.code(401).send({ error: 'This account is switched off.' });
    db.prepare('UPDATE crm_accounts SET failed = 0, lockedUntil = NULL WHERE id = ?').run(account.id);
    writeAudit(account.workspaceId, account.id, 'login', 'account', account.id, email);
    return { accessToken: openSession(app, account, req) };
  });
  app.get('/crm/api/me', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const account = db.prepare('SELECT id, email, fullName, role, workspaceId FROM crm_accounts WHERE id = ?').get(user.sub);
    if (!account) return reply.code(401).send({ error: 'Unauthorized' });
    const workspace = db.prepare('SELECT id, name, slug FROM crm_workspaces WHERE id = ?').get(account.workspaceId);
    return { id: account.id, sub: account.id, email: account.email, fullName: account.fullName, role: account.role, tenantId: account.workspaceId, company: workspace ? workspace.name : 'Afri CRM' };
  });
  app.post('/crm/api/session', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const account = db.prepare('SELECT id, workspaceId, role FROM crm_accounts WHERE id = ?').get(user.sub);
    if (!account) return reply.code(401).send({ error: 'Unauthorized' });
    return { accessToken: signCrm(app, account) };
  });

  // ============================================================
  // SSO — Sign up / Sign in with Google
  // Single OAuth flow that creates OR logs in a user by their email.
  // Uses openid+email+profile scope (just identity — no Gmail access).
  // Gmail/Calendar connect is a separate opt-in on the Integrations page.
  // ============================================================
  app.get('/crm/api/sso/google/start', async (req, reply) => {
    const origin = originOf(req);
    const creds = appCreds(null, 'google');
    if (!creds || !creds.id) return reply.redirect('/crm?sso=failed&reason=no_google');
    const state = signState({ flow: 'sso', provider: 'google' });
    // Pattern A: Combined consent — request identity AND calendar.readonly in one OAuth flow.
    // - access_type=offline: requests a refresh_token so we can fetch calendar events later
    // - prompt=consent: forces Google to ALWAYS return a refresh_token (even if user has authorized before)
    //   This means the consent screen shows on every Google SSO login — slight UX cost but guarantees
    //   we have working tokens. HubSpot does this too.
    // - scope: identity (openid email profile) + calendar.readonly (sensitive scope)
    // After consent, the callback creates the user account AND saves calendar tokens automatically.
    const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
      client_id: creds.id,
      redirect_uri: origin + '/crm/api/sso/google/callback',
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly',
      state,
    });
    return reply.redirect(url);
  });

  app.get('/crm/api/sso/google/callback', async (req, reply) => {
    const data = readState(req.query.state);
    if (!data || data.flow !== 'sso' || !req.query.code) return reply.redirect('/crm?sso=failed&reason=no_code');
    const origin = originOf(req);
    const creds = appCreds(null, 'google');
    if (!creds) return reply.redirect('/crm?sso=failed&reason=no_creds');
    const res = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({
      code: req.query.code, client_id: creds.id, client_secret: creds.secret,
      redirect_uri: origin + '/crm/api/sso/google/callback', grant_type: 'authorization_code',
    }) });
    const tokens = await res.json().catch(() => ({}));
    if (!tokens.access_token) return reply.redirect('/crm?sso=failed&reason=no_token');
    const profile = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: 'Bearer ' + tokens.access_token } }).then((r) => r.json()).catch(() => ({}));
    if (!profile.email) return reply.redirect('/crm?sso=failed&reason=no_email');
    const email = profile.email.toLowerCase();
    const fullName = profile.name || profile.given_name || email.split('@')[0];
    // Detect if calendar scope was actually granted (user could deny it on consent screen)
    const scopeGranted = String(tokens.scope || '');
    const calendarGranted = scopeGranted.includes('calendar.readonly');
    // Look up existing user by email
    let account = db.prepare('SELECT * FROM crm_accounts WHERE email = ?').get(email);
    let isNew = false;
    if (!account) {
      // Create new workspace + owner account (no password — SSO-only)
      const workspaceId = crypto.randomUUID();
      const accountId = crypto.randomUUID();
      let slug = slugify(fullName) || 'workspace';
      if (db.prepare('SELECT id FROM crm_workspaces WHERE slug = ?').get(slug)) slug = slug + '-' + crypto.randomBytes(2).toString('hex');
      db.prepare('INSERT INTO crm_workspaces (id, name, slug) VALUES (?,?,?)').run(workspaceId, fullName + ' Workspace', slug);
      db.prepare('INSERT INTO crm_accounts (id, workspaceId, email, passwordHash, fullName, role) VALUES (?,?,?,?,?,?)').run(accountId, workspaceId, email, '', fullName, 'OWNER');
      seedAccess(workspaceId);
      writeAudit(workspaceId, accountId, 'signup', 'account', accountId, 'SSO Google: ' + email);
      publishEvent(workspaceId, 'account.created', { id: accountId });
      seedDemo(workspaceId, accountId);
      account = db.prepare('SELECT * FROM crm_accounts WHERE id = ?').get(accountId);
      isNew = true;
    } else if (Number(account.active) === 0) {
      return reply.redirect('/crm?sso=failed&reason=inactive');
    }
    // Pattern A: Save calendar connection automatically — user already granted calendar scope during SSO consent.
    // This is the magic moment — calendar is connected the moment they sign up, no separate Connect step needed.
    if (calendarGranted && tokens.refresh_token) {
      saveConnection(account.workspaceId, 'calendar', email, tokens);
      writeAudit(account.workspaceId, account.id, 'connect', 'calendar', '', 'SSO auto-connect: ' + email);
    }
    const accessToken = openSession(app, account, req);
    writeAudit(account.workspaceId, account.id, 'login', 'account', account.id, 'SSO Google: ' + email);
    // Pass calendar status to frontend via query param so wizard + home dashboard can react
    const calendarParam = calendarGranted ? '&cal=1' : '&cal=0';
    return reply.redirect('/crm?t=' + encodeURIComponent(accessToken) + (isNew ? '&sso=new' : '&sso=in') + calendarParam);
  });
  app.get('/crm/api/notifications', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const items = db.prepare('SELECT * FROM notifications WHERE tenantId = ? AND userId = ? ORDER BY createdAt DESC LIMIT 30').all(user.tenantId, user.sub);
    const unread = db.prepare('SELECT COUNT(*) AS n FROM notifications WHERE tenantId = ? AND userId = ? AND readAt IS NULL').get(user.tenantId, user.sub).n;
    return { items, unread };
  });
  app.post('/crm/api/notifications/read', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    if (req.body?.all) db.prepare('UPDATE notifications SET readAt = ? WHERE tenantId = ? AND userId = ? AND readAt IS NULL').run(new Date().toISOString(), user.tenantId, user.sub);
    else if (req.body?.id) db.prepare('UPDATE notifications SET readAt = ? WHERE tenantId = ? AND userId = ? AND id = ?').run(new Date().toISOString(), user.tenantId, user.sub, String(req.body.id));
    const unread = db.prepare('SELECT COUNT(*) AS n FROM notifications WHERE tenantId = ? AND userId = ? AND readAt IS NULL').get(user.tenantId, user.sub).n;
    return { unread };
  });
  app.get('/crm/api/notifications/stream', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    reply.hijack();
    reply.raw.setTimeout(0);
    reply.raw.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
    const send = (row) => reply.raw.write('data: ' + JSON.stringify(row) + '\n\n');
    const unread = db.prepare('SELECT COUNT(*) AS n FROM notifications WHERE tenantId = ? AND userId = ? AND readAt IS NULL').get(user.tenantId, user.sub).n;
    send({ hello: true, unread });
    const ear = { tenantId: user.tenantId, userId: user.sub, send };
    ears.add(ear);
    const beat = setInterval(() => { try { reply.raw.write(': ping\n\n'); } catch { clearInterval(beat); } }, 25000);
    req.raw.on('close', () => { clearInterval(beat); ears.delete(ear); });
  });
  app.get('/crm/api/setup', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    return db.prepare('SELECT * FROM workspace WHERE tenantId = ?').get(user.tenantId) || { done: 0 };
  });

  // ============================================================
  // DELETE ACCOUNT — HubSpot-style permanent deletion
  // Only OWNER can call. Requires typed workspace name confirmation.
  // Hard-deletes ALL tenant data across every table.
  // ============================================================
  app.delete('/crm/api/account', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    if (user.role !== 'OWNER') return reply.code(403).send({ error: 'Only the workspace owner can permanently delete this account.' });
    const wsRow = db.prepare('SELECT name, slug FROM crm_workspaces WHERE id = ?').get(user.tenantId);
    if (!wsRow) return reply.code(404).send({ error: 'Workspace not found.' });
    const expected = (wsRow.name || '').toLowerCase().trim();
    const confirm = String(req.body?.confirm || '').toLowerCase().trim();
    if (!expected || confirm !== expected) {
      return reply.code(400).send({ error: 'Type your workspace name exactly as shown (' + (wsRow.name || '') + ') to confirm.' });
    }
    const reason = String(req.body?.reason || '').trim().slice(0, 500);
    const ip = String(req.ip || '').slice(0, 80);
    // Write audit BEFORE deleting (otherwise the audit row gets deleted too)
    // Use a separate audit table outside tenantId scope... actually we'll just
    // log to stdout for now since the audit table itself is tenant-scoped.
    console.log('[DELETE ACCOUNT]', {
      workspaceId: user.tenantId,
      workspaceName: wsRow.name,
      workspaceSlug: wsRow.slug,
      accountId: user.sub,
      reason: reason,
      ip: ip,
      when: new Date().toISOString(),
    });
    // Hard-delete from every table that has a tenantId column
    const tables = [
      'companies','contacts','leads','deals','activities','products','quotes','quote_lines',
      'workspace','connections','tool_apps','tickets','ticket_replies','emails','targets',
      'campaigns','notes','sequences','sequence_runs','objects','audit','fields','field_values',
      'pipelines','stages','tags','record_tags','teams','team_members','workflows','workflow_runs',
      'notifications','crm_sessions','crm_events','crm_permissions','crm_prefs','crm_api_keys','crm_webhooks'
    ];
    let deletedRows = 0;
    const tx = db.prepare('BEGIN');
    try {
      tx.run();
      for (const t of tables) {
        try {
          const result = db.prepare('DELETE FROM ' + t + ' WHERE tenantId = ?').run(user.tenantId);
          deletedRows += (result.changes || 0);
        } catch (e) { /* table may not have tenantId column — skip */ }
      }
      // Delete all user accounts for this workspace (including the OWNER)
      const accResult = db.prepare('DELETE FROM crm_accounts WHERE workspaceId = ?').run(user.tenantId);
      deletedRows += (accResult.changes || 0);
      // Finally delete the workspace itself
      const wsResult = db.prepare('DELETE FROM crm_workspaces WHERE id = ?').run(user.tenantId);
      deletedRows += (wsResult.changes || 0);
      db.prepare('COMMIT').run();
    } catch (e) {
      db.prepare('ROLLBACK').run();
      return reply.code(500).send({ error: 'Could not delete account: ' + e.message });
    }
    return { ok: true, deletedRows: deletedRows, message: 'Workspace and all data permanently deleted.' };
  });
  app.post('/crm/api/setup', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const body = req.body || {};
    const row = {
      size: String(body.size || '').slice(0, 40),
      industry: String(body.industry || '').slice(0, 80),
      goal: String(body.goal || '').slice(0, 80),
      tools: JSON.stringify(Array.isArray(body.tools) ? body.tools.slice(0, 12) : []),
      done: body.done ? 1 : 0,
      offer: String(body.offer || '').slice(0, 200),
      channel: String(body.channel || '').slice(0, 40),
      aiMode: String(body.aiMode || '').slice(0, 40),
      role: String(body.role || '').slice(0, 40),
    };
    db.prepare(`INSERT INTO workspace (tenantId, size, industry, goal, tools, done, offer, channel, aiMode, role)
      VALUES (?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(tenantId) DO UPDATE SET size = excluded.size, industry = excluded.industry, goal = excluded.goal,
      tools = excluded.tools, done = excluded.done, offer = excluded.offer, channel = excluded.channel,
      aiMode = excluded.aiMode, role = excluded.role`).run(user.tenantId, row.size, row.industry, row.goal, row.tools, row.done, row.offer, row.channel, row.aiMode, row.role);
    return db.prepare('SELECT * FROM workspace WHERE tenantId = ?').get(user.tenantId);
  });

  const originOf = (req) => process.env.PUBLIC_URL ? process.env.PUBLIC_URL.replace(/\/$/, '') : ((req.headers['x-forwarded-proto'] || 'https') + '://' + req.headers.host);
  const signState = (payload) => {
    const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 600000 })).toString('base64url');
    const sig = crypto.createHmac('sha256', process.env.JWT_SECRET || 'dev-secret-change-me-later').update(body).digest('base64url');
    return body + '.' + sig;
  };
  const readState = (state) => {
    const [body, sig] = String(state || '').split('.');
    if (!body || !sig) return null;
    const expect = crypto.createHmac('sha256', process.env.JWT_SECRET || 'dev-secret-change-me-later').update(body).digest('base64url');
    if (expect.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(expect), Buffer.from(sig))) return null;
    try {
      const data = JSON.parse(Buffer.from(body, 'base64url').toString());
      return data.exp > Date.now() ? data : null;
    } catch { return null; }
  };
  const saveConnection = (tenantId, provider, email, tokens) => {
    const id = crypto.randomUUID();
    const expires = new Date(Date.now() + Number(tokens.expires_in || 3600) * 1000).toISOString();
    db.prepare(`INSERT INTO connections (id, tenantId, provider, email, accessToken, refreshToken, expiresAt, status)
      VALUES (?,?,?,?,?,?,?,?)
      ON CONFLICT(tenantId, provider) DO UPDATE SET email = excluded.email, accessToken = excluded.accessToken,
      refreshToken = COALESCE(excluded.refreshToken, connections.refreshToken), expiresAt = excluded.expiresAt, status = 'CONNECTED'`).run(
      id, tenantId, provider, email || null, tokens.access_token, tokens.refresh_token || null, expires
    );
  };
  const appCreds = (tenantId, which) => {
    if (which === 'google' && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) return { id: process.env.GOOGLE_CLIENT_ID, secret: process.env.GOOGLE_CLIENT_SECRET };
    if (which === 'microsoft' && process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) return { id: process.env.MICROSOFT_CLIENT_ID, secret: process.env.MICROSOFT_CLIENT_SECRET };
    const row = db.prepare('SELECT clientId, clientSecret FROM tool_apps WHERE tenantId = ? AND provider = ?').get(tenantId, which);
    return row && row.clientId && row.clientSecret ? { id: row.clientId, secret: row.clientSecret } : null;
  };
  async function freshToken(row) {
    if (!row || !row.accessToken) return null;
    if (row.expiresAt && row.expiresAt > new Date(Date.now() + 60000).toISOString()) return row.accessToken;
    if (!row.refreshToken) return row.accessToken;
    const which = row.provider === 'outlook' ? 'microsoft' : 'google';
    const creds = appCreds(row.tenantId, which);
    if (!creds) return null;
    const body = new URLSearchParams({
      client_id: creds.id,
      client_secret: creds.secret,
      refresh_token: row.refreshToken,
      grant_type: 'refresh_token',
    });
    const url = which === 'google' ? 'https://oauth2.googleapis.com/token' : 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    const tokens = await res.json().catch(() => ({}));
    if (!tokens.access_token) return null;
    saveConnection(row.tenantId, row.provider, row.email, tokens);
    return tokens.access_token;
  }

  app.get('/crm/api/tools', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const rows = db.prepare('SELECT provider, email, status FROM connections WHERE tenantId = ?').all(user.tenantId);
    const origin = originOf(req);
    const invoices = await prisma.invoice.count({ where: { tenantId: user.tenantId } }).catch(() => 0);
    return {
      googleReady: Boolean(appCreds(user.tenantId, 'google')),
      microsoftReady: Boolean(appCreds(user.tenantId, 'microsoft')),
      mailReady: Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM),
      googleRedirect: origin + '/crm/api/connect/google/callback',
      microsoftRedirect: origin + '/crm/api/connect/microsoft/callback',
      books: { invoices },
      connections: rows,
    };
  });
  app.post('/crm/api/tool-apps', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') return reply.code(403).send({ error: 'Only an owner can save the app keys' });
    const provider = req.body?.provider === 'microsoft' ? 'microsoft' : 'google';
    const clientId = String(req.body?.clientId || '').trim().slice(0, 200);
    const clientSecret = String(req.body?.clientSecret || '').trim().slice(0, 200);
    if (!clientId || !clientSecret) return reply.code(400).send({ error: 'Both the client id and the secret are required' });
    db.prepare('INSERT INTO tool_apps (tenantId, provider, clientId, clientSecret) VALUES (?,?,?,?) ON CONFLICT(tenantId, provider) DO UPDATE SET clientId = excluded.clientId, clientSecret = excluded.clientSecret')
      .run(user.tenantId, provider, clientId, clientSecret);
    return { ok: true };
  });
  app.delete('/crm/api/connect/:provider', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const provider = ['gmail', 'calendar', 'outlook'].includes(req.params.provider) ? req.params.provider : '';
    if (!provider) return reply.code(404).send({ error: 'Unknown tool' });
    db.prepare('DELETE FROM connections WHERE tenantId = ? AND provider = ?').run(user.tenantId, provider);
    return { ok: true };
  });
  app.get('/crm/api/connect/:provider', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const provider = req.params.provider;
    const origin = originOf(req);
    if (provider === 'gmail' || provider === 'calendar') {
      const creds = appCreds(user.tenantId, 'google');
      if (!creds) return reply.code(400).send({ error: 'Google is not switched on. Paste the client id and secret on Integrations, and set the redirect to ' + origin + '/crm/api/connect/google/callback' });
      const scope = provider === 'gmail'
        ? 'openid email https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly'
        : 'openid email https://www.googleapis.com/auth/calendar.readonly';
      const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
        client_id: creds.id, redirect_uri: origin + '/crm/api/connect/google/callback', response_type: 'code',
        access_type: 'offline', prompt: 'consent', scope, state: signState({ tenantId: user.tenantId, provider }),
      });
      return { url };
    }
    if (provider === 'outlook') {
      const creds = appCreds(user.tenantId, 'microsoft');
      if (!creds) return reply.code(400).send({ error: 'Outlook is not switched on. Paste the client id and secret on Integrations, and set the redirect to ' + origin + '/crm/api/connect/microsoft/callback' });
      const url = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?' + new URLSearchParams({
        client_id: creds.id, redirect_uri: origin + '/crm/api/connect/microsoft/callback', response_type: 'code',
        response_mode: 'query', scope: 'openid email offline_access User.Read Mail.Send Calendars.Read', state: signState({ tenantId: user.tenantId, provider: 'outlook' }),
      });
      return { url };
    }
    return reply.code(404).send({ error: 'Unknown tool' });
  });
  app.get('/crm/api/connect/google/callback', async (req, reply) => {
    const data = readState(req.query.state);
    if (!data || !req.query.code) return reply.redirect('/crm?tool=failed&page=integrations');
    const origin = originOf(req);
    const creds = appCreds(data.tenantId, 'google');
    if (!creds) return reply.redirect('/crm?tool=failed&page=integrations');
    const res = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({
      code: req.query.code, client_id: creds.id, client_secret: creds.secret,
      redirect_uri: origin + '/crm/api/connect/google/callback', grant_type: 'authorization_code',
    }) });
    const tokens = await res.json().catch(() => ({}));
    if (!tokens.access_token) return reply.redirect('/crm?tool=failed&page=integrations');
    const profile = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: 'Bearer ' + tokens.access_token } }).then((r) => r.json()).catch(() => ({}));
    saveConnection(data.tenantId, data.provider, profile.email, tokens);
    return reply.redirect('/crm?tool=' + data.provider + '&page=integrations');
  });
  app.get('/crm/api/connect/microsoft/callback', async (req, reply) => {
    const data = readState(req.query.state);
    if (!data || !req.query.code) return reply.redirect('/crm?tool=failed&page=integrations');
    const origin = originOf(req);
    const creds = appCreds(data.tenantId, 'microsoft');
    if (!creds) return reply.redirect('/crm?tool=failed&page=integrations');
    const res = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({
      code: req.query.code, client_id: creds.id, client_secret: creds.secret,
      redirect_uri: origin + '/crm/api/connect/microsoft/callback', grant_type: 'authorization_code',
    }) });
    const tokens = await res.json().catch(() => ({}));
    if (!tokens.access_token) return reply.redirect('/crm?tool=failed&page=integrations');
    const profile = await fetch('https://graph.microsoft.com/v1.0/me', { headers: { Authorization: 'Bearer ' + tokens.access_token } }).then((r) => r.json()).catch(() => ({}));
    saveConnection(data.tenantId, 'outlook', profile.mail || profile.userPrincipalName, tokens);
    return reply.redirect('/crm?tool=outlook&page=integrations');
  });
  app.get('/crm/api/day', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const out = { events: [], inbox: null };
    const calendar = db.prepare('SELECT * FROM connections WHERE tenantId = ? AND provider = ?').get(user.tenantId, 'calendar');
    const gmail = db.prepare('SELECT * FROM connections WHERE tenantId = ? AND provider = ?').get(user.tenantId, 'gmail');
    const outlook = db.prepare('SELECT * FROM connections WHERE tenantId = ? AND provider = ?').get(user.tenantId, 'outlook');
    if (calendar) {
      const token = await freshToken(calendar);
      if (token) {
        const end = new Date(Date.now() + 7 * 86400000).toISOString();
        const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?' + new URLSearchParams({ timeMin: new Date().toISOString(), timeMax: end, maxResults: '5', singleEvents: 'true', orderBy: 'startTime' }), { headers: { Authorization: 'Bearer ' + token } });
        const data = await res.json().catch(() => ({}));
        out.events = (data.items || []).map((item) => ({ title: item.summary || 'Busy', when: (item.start && (item.start.dateTime || item.start.date)) || '' }));
      }
    } else if (outlook) {
      const token = await freshToken(outlook);
      if (token) {
        const res = await fetch('https://graph.microsoft.com/v1.0/me/calendarview?' + new URLSearchParams({ startDateTime: new Date().toISOString(), endDateTime: new Date(Date.now() + 7 * 86400000).toISOString(), $top: '5' }), { headers: { Authorization: 'Bearer ' + token } });
        const data = await res.json().catch(() => ({}));
        out.events = (data.value || []).map((item) => ({ title: item.subject || 'Busy', when: item.start && item.start.dateTime }));
      }
    }
    if (gmail) {
      const token = await freshToken(gmail);
      if (token) {
        const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels/INBOX', { headers: { Authorization: 'Bearer ' + token } });
        const data = await res.json().catch(() => ({}));
        out.inbox = data.messagesUnread ?? null;
      }
    }
    return out;
  });

  app.get('/crm/api/tickets', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    return db.prepare('SELECT * FROM tickets WHERE tenantId = ? ORDER BY createdAt DESC').all(user.tenantId);
  });
  app.post('/crm/api/tickets', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const body = req.body || {};
    if (!body.subject) return reply.code(400).send({ error: 'A subject is required' });
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO tickets (id, tenantId, subject, contactId, companyId, status, priority, body) VALUES (?,?,?,?,?,?,?,?)').run(id, user.tenantId, String(body.subject).slice(0, 200), body.contactId || null, body.companyId || null, 'OPEN', body.priority || 'NORMAL', String(body.body || '').slice(0, 2000));
    return db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);
  });
  app.post('/crm/api/tickets/:id/close', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    db.prepare("UPDATE tickets SET status = 'CLOSED' WHERE tenantId = ? AND id = ?").run(user.tenantId, req.params.id);
    return { ok: true };
  });
  app.get('/crm/api/tickets/:id', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const ticket = db.prepare('SELECT * FROM tickets WHERE tenantId = ? AND id = ?').get(user.tenantId, req.params.id);
    if (!ticket) return reply.code(404).send({ error: 'Not found' });
    const replies = db.prepare('SELECT * FROM ticket_replies WHERE tenantId = ? AND ticketId = ? ORDER BY createdAt').all(user.tenantId, ticket.id);
    return { ticket, replies };
  });
  app.post('/crm/api/tickets/:id/replies', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const ticket = db.prepare('SELECT * FROM tickets WHERE tenantId = ? AND id = ?').get(user.tenantId, req.params.id);
    const body = String(req.body?.body || '').trim().slice(0, 2000);
    if (!ticket || !body) return reply.code(400).send({ error: 'Write the reply' });
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO ticket_replies (id, tenantId, ticketId, body, authorId) VALUES (?,?,?,?,?)').run(id, user.tenantId, ticket.id, body, user.sub);
    if (ticket.status === 'CLOSED') db.prepare("UPDATE tickets SET status = 'OPEN' WHERE id = ?").run(ticket.id);
    return db.prepare('SELECT * FROM ticket_replies WHERE id = ?').get(id);
  });
  app.patch('/crm/api/tickets/:id', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const ticket = db.prepare('SELECT * FROM tickets WHERE tenantId = ? AND id = ?').get(user.tenantId, req.params.id);
    if (!ticket) return reply.code(404).send({ error: 'Not found' });
    const status = ['OPEN', 'WAITING', 'CLOSED'].includes(req.body?.status) ? req.body.status : ticket.status;
    db.prepare('UPDATE tickets SET status = ? WHERE id = ?').run(status, ticket.id);
    return db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticket.id);
  });

  async function deliverOne(tenantId, to, subject, text) {
    const gmail = db.prepare('SELECT * FROM connections WHERE tenantId = ? AND provider = ?').get(tenantId, 'gmail');
    if (gmail) {
      const token = await freshToken(gmail);
      if (token) {
        const raw = Buffer.from(`To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${text}`).toString('base64url');
        const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ raw }) });
        if (res.ok) return 'gmail';
      }
    }
    const outlook = db.prepare('SELECT * FROM connections WHERE tenantId = ? AND provider = ?').get(tenantId, 'outlook');
    if (outlook) {
      const token = await freshToken(outlook);
      if (token) {
        const res = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: { subject, body: { contentType: 'Text', content: text }, toRecipients: [{ emailAddress: { address: to } }] } }) });
        if (res.ok) return 'outlook';
      }
    }
    if (await sendMail({ to, subject, text })) return 'mail';
    return null;
  }
  app.post('/crm/api/contacts/:id/email', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const contact = one('contacts', user.tenantId, req.params.id);
    if (!contact) return reply.code(404).send({ error: 'Not found' });
    if (!canSee(user, contact)) return reply.code(403).send({ error: 'That record is not yours' });
    const subject = String(req.body?.subject || '').trim().slice(0, 200);
    const text = String(req.body?.body || '').trim().slice(0, 4000);
    if (!subject || !text) return reply.code(400).send({ error: 'Write a subject and a message' });
    let via = null;
    if (contact.email) via = await deliverOne(user.tenantId, contact.email, subject, text);
    const status = via ? 'SENT' : 'LOGGED';
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO emails (id, tenantId, contactId, subject, body, status, via) VALUES (?,?,?,?,?,?,?)').run(id, user.tenantId, contact.id, subject, text, status, via);
    const note = via ? 'Sent by ' + via : 'Logged. Nothing was sent, because no mailbox is connected.';
    insert('activities', user.tenantId, { type: 'EMAIL', subject, dueAt: new Date().toISOString().slice(0, 10), status: 'HELD', relatedType: 'contact', relatedId: contact.id, ownerId: user.sub, notes: note + '\n' + text });
    writeAudit(user.tenantId, user.sub, status === 'SENT' ? 'sent' : 'logged', 'contacts', contact.id, subject);
    return { id, status, via };
  });
  // Live email history — pulls recent Gmail/Outlook messages matching this contact's email
  app.get('/crm/api/contacts/:id/emails', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const contact = one('contacts', user.tenantId, req.params.id);
    if (!contact) return reply.code(404).send({ error: 'Not found' });
    if (!canSee(user, contact)) return reply.code(403).send({ error: 'That record is not yours' });
    if (!contact.email) return { messages: [], note: 'This contact has no email.' };
    // Logged emails first (always available)
    const logged = db.prepare('SELECT subject, body, status, via, createdAt FROM emails WHERE tenantId = ? AND contactId = ? ORDER BY createdAt DESC LIMIT 10').all(user.tenantId, contact.id);
    const out = logged.map(e => ({ subject: e.subject, snippet: (e.body || '').slice(0, 200), when: e.createdAt, source: e.via ? 'sent:' + e.via : 'logged' }));
    // Live Gmail messages
    const gmail = db.prepare('SELECT * FROM connections WHERE tenantId = ? AND provider = ?').get(user.tenantId, 'gmail');
    if (gmail) {
      const token = await freshToken(gmail);
      if (token) {
        try {
          const q = encodeURIComponent('from:' + contact.email + ' OR to:' + contact.email);
          const listRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?q=' + q + '&maxResults=5', { headers: { Authorization: 'Bearer ' + token } });
          const list = await listRes.json().catch(() => ({}));
          for (const m of (list.messages || []).slice(0, 5)) {
            const msgRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/' + m.id + '?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date', { headers: { Authorization: 'Bearer ' + token } });
            const msg = await msgRes.json().catch(() => null);
            if (!msg) continue;
            const hdr = (name) => (msg.payload && msg.payload.headers || []).find(h => h.name === name);
            out.push({
              subject: (hdr('Subject') || {}).value || '(no subject)',
              snippet: (msg.snippet || '').slice(0, 200),
              when: (hdr('Date') || {}).value || '',
              source: 'gmail'
            });
          }
        } catch (e) { /* token may be expired */ }
      }
    }
    return { messages: out.slice(0, 15), contact_email: contact.email };
  });
  app.post('/crm/api/contacts/:id/merge', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const keep = one('contacts', user.tenantId, req.params.id);
    const drop = one('contacts', user.tenantId, req.body?.otherId);
    if (!keep || !drop) return reply.code(404).send({ error: 'Both people have to be in this business' });
    if (keep.id === drop.id) return reply.code(400).send({ error: 'Pick a different person' });
    if (!canSee(user, keep) || !canSee(user, drop)) return reply.code(403).send({ error: 'That record is not yours' });
    const fill = {};
    for (const key of ['email', 'phone', 'mobile', 'title', 'companyId', 'street', 'city', 'state', 'country']) {
      if (!keep[key] && drop[key]) fill[key] = drop[key];
    }
    if (Object.keys(fill).length) patch('contacts', user.tenantId, keep.id, fill);
    db.prepare("UPDATE deals SET contactId = ? WHERE tenantId = ? AND contactId = ?").run(keep.id, user.tenantId, drop.id);
    db.prepare("UPDATE quotes SET contactId = ? WHERE tenantId = ? AND contactId = ?").run(keep.id, user.tenantId, drop.id);
    db.prepare("UPDATE tickets SET contactId = ? WHERE tenantId = ? AND contactId = ?").run(keep.id, user.tenantId, drop.id);
    db.prepare("UPDATE activities SET relatedId = ? WHERE tenantId = ? AND relatedType = 'contact' AND relatedId = ?").run(keep.id, user.tenantId, drop.id);
    db.prepare("UPDATE notes SET relatedId = ? WHERE tenantId = ? AND relatedType = 'contact' AND relatedId = ?").run(keep.id, user.tenantId, drop.id);
    db.prepare('UPDATE emails SET contactId = ? WHERE tenantId = ? AND contactId = ?').run(keep.id, user.tenantId, drop.id);
    db.prepare("UPDATE leads SET contactId = ? WHERE tenantId = ? AND contactId = ?").run(keep.id, user.tenantId, drop.id);
    const tags = db.prepare("SELECT tagId FROM record_tags WHERE tenantId = ? AND object = 'contacts' AND recordId = ?").all(user.tenantId, drop.id);
    const put = db.prepare('INSERT OR IGNORE INTO record_tags (tenantId, tagId, object, recordId) VALUES (?,?,?,?)');
    for (const tag of tags) put.run(user.tenantId, tag.tagId, 'contacts', keep.id);
    db.prepare("DELETE FROM record_tags WHERE tenantId = ? AND object = 'contacts' AND recordId = ?").run(user.tenantId, drop.id);
    db.prepare('DELETE FROM contacts WHERE tenantId = ? AND id = ?').run(user.tenantId, drop.id);
    const dropped = (drop.firstName + ' ' + (drop.lastName || '')).trim();
    writeAudit(user.tenantId, user.sub, 'merged', 'contacts', keep.id, dropped + ' was merged into this person');
    return { id: keep.id, merged: dropped };
  });

  app.get('/crm/api/target', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const month = /^\d{4}-\d{2}$/.test(req.query?.month || '') ? req.query.month : new Date().toISOString().slice(0, 7);
    const row = db.prepare('SELECT amount FROM targets WHERE tenantId = ? AND month = ?').get(user.tenantId, month);
    const deals = list('deals', user.tenantId).filter((deal) => deal.stage === 'CLOSED_WON' && String(deal.closeDate || '').slice(0, 7) === month);
    const won = deals.reduce((sum, deal) => sum + Number(deal.amount || 0), 0);
    const paid = deals.filter((deal) => deal.paidAt).reduce((sum, deal) => sum + Number(deal.amount || 0), 0);
    return { month, target: row ? Number(row.amount) : 0, won, paid, count: deals.length, undated: list('deals', user.tenantId).filter((deal) => deal.stage === 'CLOSED_WON' && !deal.closeDate).length };
  });
  app.post('/crm/api/target', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const month = /^\d{4}-\d{2}$/.test(req.body?.month || '') ? req.body.month : new Date().toISOString().slice(0, 7);
    const amount = Number(req.body?.amount);
    if (!Number.isFinite(amount) || amount < 0) return reply.code(400).send({ error: 'Enter the amount you are aiming at' });
    db.prepare('INSERT INTO targets (tenantId, month, amount) VALUES (?,?,?) ON CONFLICT(tenantId, month) DO UPDATE SET amount = excluded.amount').run(user.tenantId, month, amount);
    return { month, target: amount };
  });

  app.get('/crm/api/guide', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const tenantId = user.tenantId;
    const count = (table) => db.prepare('SELECT COUNT(*) AS n FROM ' + table + ' WHERE tenantId = ?').get(tenantId).n;
    const kind = (name, status) => status
      ? db.prepare('SELECT COUNT(*) AS n FROM objects WHERE tenantId = ? AND kind = ? AND status = ?').get(tenantId, name, status).n
      : db.prepare('SELECT COUNT(*) AS n FROM objects WHERE tenantId = ? AND kind = ?').get(tenantId, name).n;
    const month = new Date().toISOString().slice(0, 7);
    const people = await prisma.user.count({ where: { tenantId } });
    const connections = db.prepare('SELECT provider, email, status FROM connections WHERE tenantId = ?').all(tenantId);
    const mailbox = connections.some((row) => row.provider === 'gmail' || row.provider === 'outlook');
    const step = (name, detail, done, page) => ({ name, detail, done: Boolean(done), page });
    const guides = [
      { id: 'sales', name: 'Sales', steps: [
        step('Add a contact', 'A person you can write to or call.', count('contacts'), 'contacts'),
        step('Add a company', 'The business that person works for.', count('companies'), 'companies'),
        step('Add a lead', 'Someone who is not a customer yet.', count('leads'), 'leads'),
        step('Add a deal with an amount', 'What you are trying to close, and what it is worth.', db.prepare('SELECT COUNT(*) AS n FROM deals WHERE tenantId = ? AND amount > 0').get(tenantId).n, 'deals'),
        step('Invite a teammate', 'Another person who can sign in to this business.', people > 1, 'users'),
        step('Connect a mailbox', 'Gmail or Outlook, so one email can actually leave.', mailbox, 'tools'),
      ] },
      { id: 'marketing', name: 'Marketing', steps: [
        step('Make a form', 'A public form that turns a visitor into a lead.', kind('form'), 'forms'),
        step('Publish a page', 'A page with a public address.', kind('page', 'PUBLISHED'), 'pages'),
        step('Save a segment', 'A saved rule over the contacts you already have.', kind('segment'), 'segments'),
      ] },
      { id: 'service', name: 'Customer service', steps: [
        step('Open a ticket', 'A problem that belongs to a contact.', count('tickets'), 'service'),
        step('Write a knowledge article', 'An answer you can reuse.', kind('article'), 'articles'),
      ] },
      { id: 'content', name: 'Content', steps: [
        step('Save a page', 'A draft is enough. Publish it when it is ready.', kind('page'), 'pages'),
        step('Save a blog post', 'A post for the public blog.', kind('post'), 'blog'),
      ] },
      { id: 'revenue', name: 'Revenue', steps: [
        step('Add a product', 'Something you sell, with a price.', count('products'), 'products'),
        step('Save a quote', 'Lines, VAT, and a company.', count('quotes'), 'quotes'),
        step('Set this month’s target', 'The amount you are aiming at in ' + month + '.', db.prepare('SELECT amount FROM targets WHERE tenantId = ? AND month = ?').get(tenantId, month), 'forecast'),
      ] },
    ];
    const workspace = db.prepare('SELECT guideOff FROM workspace WHERE tenantId = ?').get(tenantId);
    return {
      off: Boolean(workspace && workspace.guideOff),
      guides,
      connections,
      googleReady: Boolean(appCreds(user.tenantId, 'google')),
      microsoftReady: Boolean(appCreds(user.tenantId, 'microsoft')),
    };
  });
  app.post('/crm/api/guide', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const off = req.body?.off ? 1 : 0;
    db.prepare('INSERT INTO workspace (tenantId, done, guideOff) VALUES (?,?,?) ON CONFLICT(tenantId) DO UPDATE SET guideOff = excluded.guideOff').run(user.tenantId, off);
    return { off: Boolean(off) };
  });

  app.get('/crm/api/campaigns', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    return db.prepare('SELECT id, name, subject, status, sent, createdAt FROM campaigns WHERE tenantId = ? ORDER BY createdAt DESC').all(user.tenantId);
  });
  app.post('/crm/api/campaigns', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const body = req.body || {};
    if (!body.name || !body.subject || !body.body) return reply.code(400).send({ error: 'Name, subject, and message are required' });
    const people = db.prepare('SELECT email, firstName FROM contacts WHERE tenantId = ? AND email IS NOT NULL AND email != \'\'').all(user.tenantId);
    if (!people.length) return reply.code(400).send({ error: 'No contact has an email yet' });
    const gmail = db.prepare('SELECT * FROM connections WHERE tenantId = ? AND provider = ?').get(user.tenantId, 'gmail');
    const outlook = db.prepare('SELECT * FROM connections WHERE tenantId = ? AND provider = ?').get(user.tenantId, 'outlook');
    let sent = 0;
    for (const person of people) {
      let ok = false;
      if (gmail) {
        const token = await freshToken(gmail);
        if (token) {
          const raw = Buffer.from(`To: ${person.email}\r\nSubject: ${body.subject}\r\n\r\n${body.body}`).toString('base64url');
          const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ raw }) });
          ok = res.ok;
        }
      } else if (outlook) {
        const token = await freshToken(outlook);
        if (token) {
          const res = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: { subject: body.subject, body: { contentType: 'Text', content: body.body }, toRecipients: [{ emailAddress: { address: person.email } }] } }) });
          ok = res.ok;
        }
      } else ok = await sendMail({ to: person.email, subject: body.subject, text: body.body });
      if (ok) sent += 1;
    }
    if (!sent) return reply.code(400).send({ error: 'Nothing was sent. Connect Gmail or Outlook, or add the mail key.' });
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO campaigns (id, tenantId, name, subject, body, status, sent) VALUES (?,?,?,?,?,?,?)').run(id, user.tenantId, String(body.name).slice(0, 120), String(body.subject).slice(0, 200), String(body.body).slice(0, 4000), 'SENT', sent);
    return { id, sent };
  });

  app.post('/crm/api/agent', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const question = String((req.body || {}).question || '').slice(0, 500);
    if (!question) return reply.code(400).send({ error: 'Ask something' });
    const deals = list('deals', user.tenantId).filter((row) => !String(row.stage).startsWith('CLOSED'));
    const weighted = deals.reduce((sum, row) => sum + Number(row.amount || 0) * Number(row.probability || 0) / 100, 0);
    const due = list('activities', user.tenantId).filter((row) => row.status === 'PLANNED').slice(0, 8);
    const facts = [
      'Contacts: ' + list('contacts', user.tenantId).length,
      'Companies: ' + list('companies', user.tenantId).length,
      'Open deals: ' + deals.length,
      'Weighted pipeline NGN ' + Math.round(weighted),
      'Open tickets: ' + db.prepare("SELECT COUNT(*) AS n FROM tickets WHERE tenantId = ? AND status = 'OPEN'").get(user.tenantId).n,
      'Due: ' + (due.map((row) => row.type + ' ' + row.subject).join('; ') || 'none'),
    ].join('\n');
    const ai = await askAI('Question: ' + question + '\n\nFacts:\n' + facts, 'You answer only from the facts. If the facts do not say, say so. Do not invent numbers.');
    if (ai && ai.content) return { answer: ai.content, source: 'model' };
    const q = question.toLowerCase();
    let answer = facts;
    if (q.includes('task') || q.includes('today') || q.includes('due')) answer = due.length ? due.map((row) => row.type + ' · ' + row.subject + (row.dueAt ? ' · ' + row.dueAt : '')).join('\n') : 'Nothing is due.';
    else if (q.includes('deal') || q.includes('pipeline') || q.includes('forecast')) answer = deals.length ? deals.map((row) => row.name + ' · NGN ' + Number(row.amount || 0).toLocaleString('en-NG') + ' · ' + row.stage).join('\n') + '\nWeighted NGN ' + Math.round(weighted).toLocaleString('en-NG') : 'No open deal.';
    return { answer, source: 'records' };
  });

  // ============================================================
  // SEARCH — handled by the unified /crm/api/search endpoint
  // further below (returns { hits: [{kind,id,title,detail}] })
  // ============================================================

  app.get('/crm/api/brain', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    return brainFor(user.tenantId);
  });

  // ============================================================
  // LEAD SCORING INTELLIGENCE — Phase 2 AI Foundation
  // GET /crm/api/leads/:id/score — full breakdown for ONE lead
  //   Returns: { score, confidence, reasons[], concerns[], nextAction, signals }
  // GET /crm/api/leads/scoreboard — top leads ranked by score (with breakdown)
  //   Returns: { ranked: [{ id, name, company, score, confidence, nextAction, topReason }], total }
  // The legacy /crm/api/brain endpoint is NOT touched — it still uses
  // the old scoreOf() for backward compatibility. Frontend can opt in
  // to the new scoring by switching to these endpoints.
  // ============================================================
  app.get('/crm/api/leads/scoreboard', async (req, reply) => {
    try {
      const user = await guard(req, reply); if (!user) return;
      const limit = Math.min(Math.max(Number(req.query?.limit || 10), 1), 50);
      const activities = list('activities', user.tenantId);
      const deals = list('deals', user.tenantId);
      const leads = list('leads', user.tenantId, { limit: 500 })
        .filter((row) => row.status !== 'CONVERTED' && row.status !== 'DEAD');
      const ranked = leads
        .map((lead) => {
          const breakdown = scoreLeadV2(lead, activities, deals);
          return {
            id: lead.id,
            name: ((lead.firstName || '') + ' ' + (lead.lastName || '')).trim(),
            company: lead.companyName || '',
            score: breakdown.score,
            confidence: breakdown.confidence,
            nextAction: breakdown.nextAction,
            topReason: breakdown.reasons[0] || null,
            topConcern: breakdown.concerns[0] || null,
            rating: lead.rating || '',
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
      return { ranked, total: leads.length, engine: 'rule-v2' };
    } catch (e) {
      log.error('leads.scoreboard.failed', { err: e.message });
      reply.code(500).send({ error: 'Scoreboard failed: ' + (e.message || 'unknown error') });
    }
  });

  app.get('/crm/api/leads/:id/score', async (req, reply) => {
    try {
      const user = await guard(req, reply); if (!user) return;
      const lead = one('leads', user.tenantId, req.params.id);
      if (!lead) return reply.code(404).send({ error: 'Lead not found' });
      const activities = list('activities', user.tenantId);
      const deals = list('deals', user.tenantId);
      const breakdown = scoreLeadV2(lead, activities, deals);
      return {
        id: lead.id,
        name: ((lead.firstName || '') + ' ' + (lead.lastName || '')).trim(),
        company: lead.companyName || '',
        rating: lead.rating || '',
        ...breakdown,
      };
    } catch (e) {
      log.error('leads.score.failed', { err: e.message, leadId: req.params.id });
      reply.code(500).send({ error: 'Score failed: ' + (e.message || 'unknown error') });
    }
  });

  // ============================================================
  // LEAD SCORING INTELLIGENCE — auto-update lead.rating field
  // POST /crm/api/leads/:id/auto-rate — syncs the model's verdict
  //   back onto the lead row's `rating` field (HOT/WARM/COLD).
  //   Useful for batch operations ("auto-rate all my cold leads").
  //   Thresholds: score>=65 → HOT, score>=40 → WARM, else COLD.
  //   Does NOT overwrite a HOT rating with COLD if confidence < 50
  //   (don't downgrade on shaky data).
  // ============================================================
  app.post('/crm/api/leads/:id/auto-rate', async (req, reply) => {
    try {
      const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
      const lead = one('leads', user.tenantId, req.params.id);
      if (!lead) return reply.code(404).send({ error: 'Lead not found' });
      const activities = list('activities', user.tenantId);
      const deals = list('deals', user.tenantId);
      const breakdown = scoreLeadV2(lead, activities, deals);
      let newRating = 'COLD';
      if (breakdown.score >= 65) newRating = 'HOT';
      else if (breakdown.score >= 40) newRating = 'WARM';
      // Don't downgrade a HOT to COLD on low confidence (avoid erasing
      // a sales rep's judgment based on missing data)
      if (lead.rating === 'HOT' && newRating === 'COLD' && breakdown.confidence < 50) {
        return { ok: true, kept: 'HOT', reason: 'low confidence — preserving manual HOT rating', score: breakdown.score, confidence: breakdown.confidence };
      }
      db.prepare('UPDATE leads SET rating = ? WHERE id = ? AND tenantId = ?').run(newRating, lead.id, user.tenantId);
      writeAudit(user.tenantId, user.sub, 'auto-rated', 'leads', lead.id, `score=${breakdown.score} conf=${breakdown.confidence} → ${newRating}`);
      return { ok: true, updated: newRating, score: breakdown.score, confidence: breakdown.confidence, nextAction: breakdown.nextAction };
    } catch (e) {
      log.error('leads.auto-rate.failed', { err: e.message, leadId: req.params.id });
      reply.code(500).send({ error: 'Auto-rate failed: ' + (e.message || 'unknown error') });
    }
  });

  app.get('/crm/api/record/:type/:id', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const type = req.params.type;
    const table = { contact: 'contacts', company: 'companies', deal: 'deals', lead: 'leads' }[type];
    if (!table) return reply.code(404).send({ error: 'Unknown record' });
    const record = one(table, user.tenantId, req.params.id);
    if (!record) return reply.code(404).send({ error: 'Not found' });
    if (!canSee(user, record)) return reply.code(403).send({ error: 'That record is not yours' });
    const activities = list('activities', user.tenantId).filter((row) => row.relatedId === record.id);
    const notes = db.prepare('SELECT * FROM notes WHERE tenantId = ? AND relatedType = ? AND relatedId = ? ORDER BY createdAt DESC').all(user.tenantId, type, record.id);
    const deals = type === 'deal' ? [] : list('deals', user.tenantId).filter((row) => row.contactId === record.id || row.companyId === record.id || row.leadId === record.id);
    const contacts = type === 'company' ? list('contacts', user.tenantId).filter((row) => row.companyId === record.id && canSee(user, row)) : [];
    const { weights } = modelWeights(user.tenantId);
    const fields = db.prepare('SELECT f.id, f.name, v.value FROM fields f LEFT JOIN field_values v ON v.fieldId = f.id AND v.recordId = ? WHERE f.tenantId = ? AND f.object = ?').all(record.id, user.tenantId, table);
    const history = db.prepare('SELECT action, detail, createdAt, userId FROM audit WHERE tenantId = ? AND recordId = ? ORDER BY createdAt DESC LIMIT 20').all(user.tenantId, record.id);
    const tags = db.prepare('SELECT t.name FROM tags t JOIN record_tags r ON r.tagId = t.id WHERE r.tenantId = ? AND r.object = ? AND r.recordId = ?').all(user.tenantId, table, record.id);
    return { record, activities, notes, deals, contacts, fields, history, tags, score: scoreOf(record, activities.length > 0, weights), weights };
  });

  app.get('/crm/api/people', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    return db.prepare('SELECT id, fullName, email, role, active, createdAt FROM crm_accounts WHERE workspaceId = ? ORDER BY createdAt').all(user.tenantId);
  });
  app.post('/crm/api/people', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') return reply.code(403).send({ error: 'Only an owner or an admin can add a person' });
    const email = String(req.body?.email || '').trim().toLowerCase();
    const fullName = String(req.body?.fullName || '').trim().slice(0, 120);
    const password = String(req.body?.password || '');
    const allowed = user.role === 'OWNER' ? ['ADMIN', 'MANAGER', 'SALES', 'VIEWER'] : ['SALES', 'VIEWER'];
    const role = allowed.includes(req.body?.role) ? req.body.role : 'SALES';
    if (!email.includes('@') || !fullName || password.length < 8) return reply.code(400).send({ error: 'Enter a name, an email, and a password of 8 characters' });
    if (db.prepare('SELECT id FROM crm_accounts WHERE email = ?').get(email)) return reply.code(409).send({ error: 'That email already has an Afri CRM account.' });
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO crm_accounts (id, workspaceId, email, passwordHash, fullName, role, active) VALUES (?,?,?,?,?,?,?)').run(id, user.tenantId, email, await bcrypt.hash(password, 10), fullName, role);
    writeAudit(user.tenantId, user.sub, 'created', 'users', id, fullName + ' · ' + role);
    return reply.code(201).send({ id, fullName, email, role, active: 1 });
  });

  app.get('/crm/api/workflows', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    ensureWorkflows(user.tenantId);
    return db.prepare('SELECT * FROM workflows WHERE tenantId = ? ORDER BY name').all(user.tenantId);
  });
  app.post('/crm/api/workflows', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const name = String(req.body?.name || '').trim().slice(0, 80);
    const trigger = ['lead.created', 'lead.qualified', 'deal.won', 'deal.lost'].includes(req.body?.trigger) ? req.body.trigger : '';
    const action = ['task', 'notify', 'webhook'].includes(req.body?.action) ? req.body.action : 'task';
    const taskSubject = String(req.body?.taskSubject || '').trim().slice(0, 160);
    const target = String(req.body?.target || '').trim().slice(0, 300);
    if (!name || !trigger) return reply.code(400).send({ error: 'Name the flow and when it runs' });
    if (action !== 'webhook' && !taskSubject) return reply.code(400).send({ error: 'Say what the task or the note says' });
    if (action === 'webhook' && !/^https:\/\//.test(target)) return reply.code(400).send({ error: 'The other system needs an https address' });
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO workflows (id, tenantId, name, trigger, taskSubject, days, active, action, target) VALUES (?,?,?,?,?,?,?,?,?)')
      .run(id, user.tenantId, name, trigger, taskSubject || 'Notify', Number(req.body?.days || 1), action, target || null);
    return db.prepare('SELECT * FROM workflows WHERE id = ?').get(id);
  });
  app.patch('/crm/api/workflows/:id', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const row = db.prepare('SELECT * FROM workflows WHERE tenantId = ? AND id = ?').get(user.tenantId, req.params.id);
    if (!row) return reply.code(404).send({ error: 'Not found' });
    const active = req.body?.active ? 1 : 0;
    db.prepare('UPDATE workflows SET active = ? WHERE id = ?').run(active, row.id);
    return db.prepare('SELECT * FROM workflows WHERE id = ?').get(row.id);
  });
  app.get('/crm/api/runs', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    return db.prepare(`SELECT r.id, r.recordId, r.status, r.detail, r.ranAt, w.name, w.trigger, w.action
      FROM workflow_runs r LEFT JOIN workflows w ON w.id = r.workflowId
      WHERE r.tenantId = ? ORDER BY r.ranAt DESC LIMIT 80`).all(user.tenantId);
  });
  app.post('/crm/api/hooks/:id/test', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const row = db.prepare("SELECT * FROM objects WHERE tenantId = ? AND id = ? AND kind = 'hook'").get(user.tenantId, req.params.id);
    if (!row || !/^https:\/\//.test(String(row.body || ''))) return reply.code(400).send({ error: 'This hook has no https address' });
    try {
      const res = await fetch(row.body, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ test: true, from: 'Afri CRM' }), signal: AbortSignal.timeout(8000) });
      return { ok: res.ok, status: res.status };
    } catch (error) {
      return reply.code(400).send({ error: String(error.message || 'Could not reach it').slice(0, 200) });
    }
  });

  app.get('/crm/api/sequences', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    ensureSequences(user.tenantId);
    return db.prepare('SELECT * FROM sequences WHERE tenantId = ? ORDER BY name').all(user.tenantId);
  });
  app.post('/crm/api/sequences', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const name = String(req.body?.name || '').trim().slice(0, 80);
    const stages = stagesFor(user.tenantId);
    const stage = stages.some((row) => row.code === req.body?.stage) ? req.body.stage : '';
    const taskSubject = String(req.body?.taskSubject || '').trim().slice(0, 160);
    const days = Math.min(30, Math.max(0, Number(req.body?.days || 1)));
    if (!name || !stage || !taskSubject) return reply.code(400).send({ error: 'Name it, pick a stage, and say the task' });
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO sequences (id, tenantId, name, stage, taskSubject, days, active) VALUES (?,?,?,?,?,?,?)').run(id, user.tenantId, name, stage, taskSubject, days);
    return db.prepare('SELECT * FROM sequences WHERE id = ?').get(id);
  });
  app.patch('/crm/api/sequences/:id', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const row = db.prepare('SELECT * FROM sequences WHERE tenantId = ? AND id = ?').get(user.tenantId, req.params.id);
    if (!row) return reply.code(404).send({ error: 'Not found' });
    db.prepare('UPDATE sequences SET active = ? WHERE id = ?').run(req.body?.active ? 1 : 0, row.id);
    return db.prepare('SELECT * FROM sequences WHERE id = ?').get(row.id);
  });

  app.get('/crm/api/reports', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const tenantId = user.tenantId;
    const leads = list('leads', tenantId);
    const deals = list('deals', tenantId);
    const stages = stagesFor(tenantId);
    const people = await prisma.user.findMany({ where: { tenantId }, select: { id: true, fullName: true, email: true } });
    const nameOf = (id) => { const row = people.find((person) => person.id === id); return row ? (row.fullName || row.email) : 'Unassigned'; };
    const pipeline = stages.map((stage) => {
      const rows = deals.filter((row) => row.stage === stage.code);
      const amount = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
      return { stage: stage.name, count: rows.length, amount, weighted: Math.round(amount * Number(stage.probability || 0) / 100) };
    });
    const owners = {};
    for (const row of deals.filter((item) => item.stage === 'CLOSED_WON' || item.stage === 'CLOSED_LOST')) {
      const key = row.ownerId || '';
      owners[key] = owners[key] || { owner: nameOf(row.ownerId), won: 0, lost: 0 };
      if (row.stage === 'CLOSED_WON') owners[key].won += 1; else owners[key].lost += 1;
    }
    const winRate = Object.values(owners).map((row) => ({ ...row, rate: row.won + row.lost ? Math.round(row.won / (row.won + row.lost) * 100) : 0 }));
    const months = {};
    for (const row of deals.filter((item) => !String(item.stage).startsWith('CLOSED') && item.closeDate)) {
      const month = String(row.closeDate).slice(0, 7);
      months[month] = (months[month] || 0) + Number(row.amount || 0) * Number(row.probability || 0) / 100;
    }
    const forecast = Object.keys(months).sort().map((month) => ({ month, amount: Math.round(months[month]) }));
    const sources = {};
    for (const row of leads) {
      const key = row.source || 'No source';
      sources[key] = sources[key] || { source: key, leads: 0, converted: 0 };
      sources[key].leads += 1;
      if (row.status === 'CONVERTED') sources[key].converted += 1;
    }
    const bySource = Object.values(sources).map((row) => ({ ...row, rate: row.leads ? Math.round(row.converted / row.leads * 100) : 0 }));
    const activities = list('activities', tenantId);
    const today = new Date().toISOString().slice(0, 10);
    const month = today.slice(0, 7);
    const stalled = deals.filter((row) => !String(row.stage).startsWith('CLOSED')).filter((row) => {
      const latest = activities.filter((item) => item.relatedId === row.id).map((item) => item.createdAt || '').sort().pop() || row.createdAt || '';
      return latest && Date.now() - new Date(latest).getTime() > 14 * 86400000;
    }).length;
    const lostReasons = {};
    for (const row of deals.filter((item) => item.stage === 'CLOSED_LOST')) {
      const key = row.lostReason || 'No reason';
      lostReasons[key] = (lostReasons[key] || 0) + 1;
    }
    const work = {
      overdue: activities.filter((row) => row.status === 'PLANNED' && row.dueAt && row.dueAt.slice(0, 10) < today).length,
      dueToday: activities.filter((row) => row.status === 'PLANNED' && row.dueAt && row.dueAt.slice(0, 10) === today).length,
      calls: activities.filter((row) => row.type === 'CALL' && String(row.createdAt || '').slice(0, 7) === month).length,
      stalled,
      lostReasons: Object.entries(lostReasons).map(([reason, count]) => ({ reason, count })),
    };
    return { pipeline, winRate, forecast, sources: bySource, work };
  });
  app.get('/crm/api/audit', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const q = String(req.query?.q || '').trim().toLowerCase();
    const action = String(req.query?.action || '').trim();
    const object = String(req.query?.object || '').trim();
    let rows = db.prepare('SELECT id, userId, action, object, recordId, detail, createdAt FROM audit WHERE tenantId = ? ORDER BY createdAt DESC LIMIT 400').all(user.tenantId);
    if (action) rows = rows.filter((row) => row.action === action);
    if (object) rows = rows.filter((row) => row.object === object);
    if (q) rows = rows.filter((row) => String(row.detail || '').toLowerCase().includes(q) || String(row.recordId || '').toLowerCase().includes(q));
    const people = db.prepare('SELECT id, fullName, email FROM crm_accounts WHERE workspaceId = ?').all(user.tenantId);
    const nameOf = (id) => { const row = people.find((person) => person.id === id); return row ? (row.fullName || row.email) : 'System'; };
    return rows.slice(0, 200).map((row) => ({ ...row, who: nameOf(row.userId), email: (people.find((person) => person.id === row.userId) || {}).email || '' }));
  });

  app.get('/crm/api/backups', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') return reply.code(403).send({ error: 'Only an owner or an admin can see backups' });
    const dir = '/data/backups';
    if (!fs.existsSync(dir)) return { backups: [], note: 'No backup disk on this server yet.' };
    const backups = fs.readdirSync(dir).filter((name) => name.startsWith('crm-') && name.endsWith('.sqlite')).sort().reverse().slice(0, 20).map((name) => {
      const stat = fs.statSync(path.join(dir, name));
      return { name, bytes: stat.size, at: stat.mtime.toISOString() };
    });
    return { backups };
  });
  app.post('/crm/api/backups', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') return reply.code(403).send({ error: 'Only an owner or an admin can take a backup' });
    if (!fs.existsSync('/data')) return reply.code(400).send({ error: 'This server has no /data disk. A backup here would vanish on the next deploy.' });
    fs.mkdirSync('/data/backups', { recursive: true });
    db.exec('PRAGMA wal_checkpoint(FULL)');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const name = 'crm-' + stamp + '.sqlite';
    fs.copyFileSync(dbFile, path.join('/data/backups', name));
    const files = fs.readdirSync('/data/backups').filter((file) => file.startsWith('crm-') && file.endsWith('.sqlite')).sort().reverse();
    for (const old of files.slice(28)) fs.unlinkSync(path.join('/data/backups', old));
    writeAudit(user.tenantId, user.sub, 'backup', 'system', user.tenantId, name);
    return { name, kept: Math.min(files.length, 28) };
  });
  app.get('/crm/api/fields', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    return db.prepare('SELECT * FROM fields WHERE tenantId = ? ORDER BY name').all(user.tenantId);
  });
  app.post('/crm/api/fields', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const object = String(req.body?.object || '');
    const name = String(req.body?.name || '').trim().slice(0, 60);
    if (!OWNED.has(object) || !name) return reply.code(400).send({ error: 'Name the field' });
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO fields (id, tenantId, object, name) VALUES (?,?,?,?)').run(id, user.tenantId, object, name);
    writeAudit(user.tenantId, user.sub, 'created', 'fields', id, object + ' · ' + name);
    return { id, object, name };
  });
  app.post('/crm/api/field-values', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const field = db.prepare('SELECT * FROM fields WHERE tenantId = ? AND id = ?').get(user.tenantId, req.body?.fieldId);
    if (!field || !req.body?.recordId) return reply.code(400).send({ error: 'Unknown field' });
    const value = String(req.body.value || '').slice(0, 500);
    db.prepare('INSERT INTO field_values (id, tenantId, fieldId, recordId, value) VALUES (?,?,?,?,?) ON CONFLICT(fieldId, recordId) DO UPDATE SET value = excluded.value')
      .run(crypto.randomUUID(), user.tenantId, field.id, String(req.body.recordId), value);
    return { ok: true };
  });

  app.get('/crm/api/pipeline', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const pipeline = ensurePipeline(user.tenantId);
    return { pipeline, stages: stagesFor(user.tenantId) };
  });
  app.post('/crm/api/stages', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const pipeline = ensurePipeline(user.tenantId);
    const name = String(req.body?.name || '').trim().slice(0, 60);
    if (!name) return reply.code(400).send({ error: 'Name the stage' });
    const code = name.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40) || 'STAGE';
    const last = db.prepare('SELECT MAX(position) AS n FROM stages WHERE tenantId = ? AND pipelineId = ? AND closed = 0').get(user.tenantId, pipeline.id);
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO stages (id, tenantId, pipelineId, code, name, color, probability, position, closed) VALUES (?,?,?,?,?,?,?,?,?)')
      .run(id, user.tenantId, pipeline.id, code + '_' + id.slice(0, 4).toUpperCase(), name, String(req.body?.color || '#2563eb'), Number(req.body?.probability || 50), (last?.n ?? -1) + 1);
    writeAudit(user.tenantId, user.sub, 'created', 'stages', id, name);
    return stagesFor(user.tenantId);
  });
  app.patch('/crm/api/stages/:id', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const stage = db.prepare('SELECT * FROM stages WHERE tenantId = ? AND id = ?').get(user.tenantId, req.params.id);
    if (!stage) return reply.code(404).send({ error: 'Not found' });
    const name = req.body?.name != null ? String(req.body.name).trim().slice(0, 60) : stage.name;
    const probability = req.body?.probability != null ? Number(req.body.probability) : stage.probability;
    db.prepare('UPDATE stages SET name = ?, probability = ? WHERE id = ?').run(name || stage.name, probability, stage.id);
    writeAudit(user.tenantId, user.sub, 'updated', 'stages', stage.id, name);
    return stagesFor(user.tenantId);
  });

  app.get('/crm/api/tags', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    return db.prepare('SELECT * FROM tags WHERE tenantId = ? ORDER BY name').all(user.tenantId);
  });
  app.post('/crm/api/tags', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const name = String(req.body?.name || '').trim().slice(0, 40);
    if (!name) return reply.code(400).send({ error: 'Name the tag' });
    const existing = db.prepare('SELECT * FROM tags WHERE tenantId = ? AND name = ? COLLATE NOCASE').get(user.tenantId, name);
    if (existing) return existing;
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO tags (id, tenantId, name) VALUES (?,?,?)').run(id, user.tenantId, name);
    return { id, name };
  });
  app.post('/crm/api/tags/attach', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const object = String(req.body?.object || '');
    const recordId = String(req.body?.recordId || '');
    const tagId = String(req.body?.tagId || '');
    if (!OWNED.has(object) || !recordId || !tagId) return reply.code(400).send({ error: 'A tag needs a record' });
    db.prepare('INSERT OR IGNORE INTO record_tags (tenantId, tagId, object, recordId) VALUES (?,?,?,?)').run(user.tenantId, tagId, object, recordId);
    return { ok: true };
  });
  app.get('/crm/api/tags/on/:object/:id', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    return db.prepare('SELECT t.* FROM tags t JOIN record_tags r ON r.tagId = t.id WHERE r.tenantId = ? AND r.object = ? AND r.recordId = ?').all(user.tenantId, req.params.object, req.params.id);
  });

  app.get('/crm/api/teams', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const teams = db.prepare('SELECT * FROM teams WHERE tenantId = ? ORDER BY name').all(user.tenantId);
    return teams.map((team) => ({ ...team, members: db.prepare('SELECT userId FROM team_members WHERE tenantId = ? AND teamId = ?').all(user.tenantId, team.id).map((row) => row.userId) }));
  });
  app.post('/crm/api/teams', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const name = String(req.body?.name || '').trim().slice(0, 60);
    if (!name) return reply.code(400).send({ error: 'Name the team' });
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO teams (id, tenantId, name) VALUES (?,?,?)').run(id, user.tenantId, name);
    writeAudit(user.tenantId, user.sub, 'created', 'teams', id, name);
    return { id, name };
  });
  app.post('/crm/api/teams/:id/members', async (req, reply) => {
    const user = await guard(req, reply); if (!user || !canWrite(user, reply)) return;
    const team = db.prepare('SELECT * FROM teams WHERE tenantId = ? AND id = ?').get(user.tenantId, req.params.id);
    const userId = String(req.body?.userId || '');
    if (!team || !userId) return reply.code(400).send({ error: 'Unknown team' });
    db.prepare('INSERT OR IGNORE INTO team_members (tenantId, teamId, userId) VALUES (?,?,?)').run(user.tenantId, team.id, userId);
    return { ok: true };
  });

  app.post('/crm/api/notes', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const body = req.body || {};
    const text = String(body.body || '').trim().slice(0, 2000);
    const type = String(body.relatedType || '');
    if (!text || !['contact', 'company', 'deal', 'lead'].includes(type) || !body.relatedId) return reply.code(400).send({ error: 'A note needs a record' });
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO notes (id, tenantId, relatedType, relatedId, body) VALUES (?,?,?,?,?)').run(id, user.tenantId, type, body.relatedId, text);
    return db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
  });

  app.post('/crm/api/brain/task', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const body = req.body || {};
    const subject = String(body.subject || '').trim().slice(0, 200);
    if (!subject) return reply.code(400).send({ error: 'Say what the task is' });
    const due = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const id = insert('activities', user.tenantId, { type: 'TASK', subject, dueAt: due, status: 'PLANNED', relatedType: body.relatedType || null, relatedId: body.relatedId || null, notes: 'Opened from the brain.' });
    return one('activities', user.tenantId, id);
  });

  const KINDS = new Set(['order', 'segment', 'form', 'article', 'survey', 'document', 'event', 'brand', 'response', 'page', 'post', 'subscription', 'contract', 'paylink', 'portal', 'ad', 'hook']);
  app.get('/crm/api/objects', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    return db.prepare('SELECT * FROM objects WHERE tenantId = ? ORDER BY createdAt DESC').all(user.tenantId);
  });
  app.post('/crm/api/objects', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const body = req.body || {};
    const kind = String(body.kind || '');
    const name = String(body.name || '').trim().slice(0, 160);
    if (!KINDS.has(kind) || !name) return reply.code(400).send({ error: 'A name is required' });
    const id = crypto.randomUUID();
    const text = String(body.body || '').slice(0, kind === 'page' || kind === 'post' ? 12000 : 4000);
    const status = String(body.status || (kind === 'page' || kind === 'post' ? 'DRAFT' : 'OPEN')).slice(0, 40);
    db.prepare('INSERT INTO objects (id, tenantId, kind, name, body, status, amount, meta) VALUES (?,?,?,?,?,?,?,?)').run(
      id, user.tenantId, kind, name, text, status,
      Number(body.amount || 0), body.meta ? JSON.stringify(body.meta).slice(0, 4000) : null
    );
    return db.prepare('SELECT * FROM objects WHERE id = ?').get(id);
  });
  app.patch('/crm/api/objects/:id', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const row = db.prepare('SELECT * FROM objects WHERE tenantId = ? AND id = ?').get(user.tenantId, req.params.id);
    if (!row) return reply.code(404).send({ error: 'Not found' });
    const body = req.body || {};
    const status = body.status != null ? String(body.status).slice(0, 40) : row.status;
    const name = body.name != null ? String(body.name).trim().slice(0, 160) : row.name;
    const text = body.body != null ? String(body.body).slice(0, 12000) : row.body;
    const meta = body.meta != null ? JSON.stringify(body.meta).slice(0, 4000) : row.meta;
    const amount = body.amount != null ? Number(body.amount) : row.amount;
    if (!name) return reply.code(400).send({ error: 'A name is required' });
    db.prepare('UPDATE objects SET name = ?, body = ?, status = ?, meta = ?, amount = ? WHERE id = ?').run(name, text, status, meta, amount, row.id);
    return db.prepare('SELECT * FROM objects WHERE id = ?').get(row.id);
  });

  const htmlEscape = (value) => String(value ?? '').replace(/&/g, '&' + 'amp;').replace(/</g, '&' + 'lt;').replace(/>/g, '&' + 'gt;').replace(/"/g, '&' + 'quot;').replace(/'/g, '&#39;');
  app.get('/w/:id', async (req, reply) => {
    const row = db.prepare("SELECT * FROM objects WHERE id = ? AND kind IN ('page','post') AND status = 'PUBLISHED'").get(req.params.id);
    if (!row) return reply.code(404).type('text/html').send('<!DOCTYPE html><html><body><p>This page is not published.</p></body></html>');
    let formId = '';
    try { formId = JSON.parse(row.meta || '{}').formId || ''; } catch { formId = ''; }
    const tenant = await prisma.tenant.findUnique({ where: { id: row.tenantId }, select: { name: true } });
    const paragraphs = String(row.body || '').split(/\n{2,}/).map((part) => '<p>' + htmlEscape(part).replace(/\n/g, '<br>') + '</p>').join('');
    const form = formId ? `<form id="f" style="margin-top:28px"><h2>Write to us</h2><label>Name<br><input name="name" required></label><br><label>Email<br><input name="email" type="email"></label><br><label>Phone<br><input name="phone"></label><br><label>Company<br><input name="company"></label><p id="m"></p><button>Send</button></form><script>document.getElementById('f').onsubmit=async function(e){e.preventDefault();const res=await fetch('/crm/form/${formId}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(e.target)))});document.getElementById('m').textContent=res.ok?'Sent. We have it as a lead.':'Could not send.';if(res.ok)e.target.reset();}</script>` : '';
    const kind = row.kind === 'post' ? 'Blog' : 'Page';
    return reply.type('text/html').send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${htmlEscape(row.name)}</title></head><body style="margin:0;font-family:Georgia,serif;background:#f7f4ee;color:#12151c"><header style="padding:18px 22px;border-bottom:1px solid #e4e0d8;font-family:sans-serif"><b>${htmlEscape(tenant?.name || 'Afri')}</b> <span style="color:#5c6570">${kind}</span></header><main style="width:min(720px,calc(100% - 40px));margin:40px auto"><h1 style="font-weight:500">${htmlEscape(row.name)}</h1>${paragraphs}${form}</main></body></html>`);
  });

  const formPage = (form) => `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${String(form.name).replace(/[&<>]/g, '')}</title></head><body style="font-family:sans-serif;max-width:480px;margin:40px auto">
    <h1>${String(form.name).replace(/[&<>]/g, '')}</h1>
    <form id="f"><label>Name<br><input name="name" required></label><br><label>Email<br><input name="email" type="email"></label><br><label>Phone<br><input name="phone"></label><br><label>Company<br><input name="company"></label><p id="m"></p><button>Send</button></form>
    <script>document.getElementById('f').onsubmit=async function(e){e.preventDefault();const f=new FormData(e.target);const res=await fetch(location.pathname,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(f))});document.getElementById('m').textContent=res.ok?'Sent.':'Could not send.';if(res.ok)e.target.reset();};</script>
    </body></html>`;
  app.get('/crm/form/:id', async (req, reply) => {
    const form = db.prepare("SELECT * FROM objects WHERE id = ? AND kind = 'form'").get(req.params.id);
    if (!form) return reply.code(404).type('text/plain').send('Form not found');
    return reply.type('text/html').send(formPage(form));
  });
  app.post('/crm/form/:id', async (req, reply) => {
    const form = db.prepare("SELECT * FROM objects WHERE id = ? AND kind = 'form'").get(req.params.id);
    if (!form) return reply.code(404).send({ error: 'Form not found' });
    const ip = String(req.headers['x-forwarded-for'] || req.ip || 'local').split(',')[0].trim();
    if (limited('form:' + ip, 30, 60 * 60 * 1000)) return reply.code(429).send({ error: 'Too many forms from this network. Try again in an hour.' });
    const body = req.body || {};
    const name = String(body.name || '').trim().slice(0, 80);
    if (!name) return reply.code(400).send({ error: 'A name is required' });
    const parts = name.split(/\s+/);
    const ownerId = await pickOwner(form.tenantId);
    const leadId = insert('leads', form.tenantId, { firstName: parts[0], lastName: parts.slice(1).join(' '), email: String(body.email || '').slice(0, 120), phone: String(body.phone || '').slice(0, 40), companyName: String(body.company || '').slice(0, 120), source: 'Form', status: 'NEW', rating: 'WARM', ownerId });
    writeAudit(form.tenantId, ownerId, 'created', 'leads', leadId, 'Public form');
    applyWorkflow(form.tenantId, 'lead.created', one('leads', form.tenantId, leadId));
    if (ownerId) notifyUser(form.tenantId, ownerId, { kind: 'lead', title: 'New lead from a form', body: name, recordType: 'lead', recordId: leadId });
    return { ok: true };
  });

  app.post('/crm/api/pay-links', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const quote = one('quotes', user.tenantId, String((req.body || {}).quoteId || ''));
    if (!quote || !['SENT', 'ACCEPTED'].includes(quote.status)) return reply.code(400).send({ error: 'Send or accept the quote first' });
    let cardUrl = '';
    if (quote.booksInvoice) {
      const invoice = await prisma.invoice.findFirst({ where: { tenantId: user.tenantId, number: quote.booksInvoice } });
      if (invoice && invoice.payToken && (invoice.status === 'SENT' || invoice.status === 'PAID')) cardUrl = '/pay/' + invoice.payToken;
    }
    const id = crypto.randomUUID();
    const company = quote.companyId ? one('companies', user.tenantId, quote.companyId) : null;
    db.prepare('INSERT INTO objects (id, tenantId, kind, name, body, status, amount, meta) VALUES (?,?,?,?,?,?,?,?)').run(
      id, user.tenantId, 'paylink', (company && company.name) || quote.number || 'Payment', '', 'OPEN', Number(quote.total || 0),
      JSON.stringify({ quoteId: quote.id, companyId: quote.companyId || '', amount: Number(quote.total || 0), number: quote.number || '', cardUrl }).slice(0, 4000)
    );
    return { id, url: '/crm/pay/' + id, cardUrl: cardUrl || null };
  });

  const publicShell = (title, body) => `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${htmlEscape(title)}</title></head><body style="margin:0;background:#f6f3ee;color:#14202e;font-family:Georgia,serif"><main style="width:min(560px,calc(100% - 32px));margin:48px auto;background:#fff;border-radius:18px;padding:28px">${body}</main></body></html>`;
  app.get('/crm/pay/:id', async (req, reply) => {
    const row = db.prepare("SELECT * FROM objects WHERE id = ? AND kind = 'paylink'").get(req.params.id);
    if (!row) return reply.code(404).type('text/html').send(publicShell('Payment', '<h1>This link is not here.</h1>'));
    let meta = {};
    try { meta = JSON.parse(row.meta || '{}'); } catch { meta = {}; }
    const tenant = await prisma.tenant.findUnique({ where: { id: row.tenantId }, select: { name: true, bankDetails: true } });
    const bank = String(tenant?.bankDetails || '').split('\n').map((line) => htmlEscape(line)).filter(Boolean).map((line) => `<p>${line}</p>`).join('') || '<p>No bank account is on the business yet.</p>';
    const amount = Number(meta.amount || row.amount || 0).toLocaleString('en-NG');
    const card = meta.cardUrl ? `<p><a href="${htmlEscape(meta.cardUrl)}">Pay by card</a></p>` : '<p>Card pay opens when the books bill can be paid online. Until then, transfer and use the reference.</p>';
    return reply.type('text/html').send(publicShell(row.name, `<p style="letter-spacing:.08em;text-transform:uppercase;font-family:sans-serif;font-size:12px">${htmlEscape(tenant?.name || 'Afri')}</p><h1>${htmlEscape(row.name)}</h1><p style="font-size:32px">NGN ${amount}</p><p>Reference ${htmlEscape(meta.number || '')}</p><h2>Transfer</h2>${bank}${card}`));
  });
  app.post('/crm/in/:id', async (req, reply) => {
    const hook = db.prepare("SELECT * FROM objects WHERE id = ? AND kind = 'hook'").get(req.params.id);
    if (!hook) return reply.code(404).send({ error: 'Unknown hook' });
    let meta = {};
    try { meta = JSON.parse(hook.meta || '{}'); } catch { meta = {}; }
    if (meta.way !== 'in') return reply.code(404).send({ error: 'This hook does not take leads' });
    const ip = String(req.headers['x-forwarded-for'] || req.ip || 'local').split(',')[0].trim();
    if (limited('in:' + ip, 60, 60 * 60 * 1000)) return reply.code(429).send({ error: 'Too many leads from this network' });
    const body = req.body || {};
    const name = String(body.name || body.firstName || '').trim().slice(0, 80);
    if (!name) return reply.code(400).send({ error: 'Send a name' });
    const parts = name.split(/\s+/);
    const ownerId = await pickOwner(hook.tenantId);
    const leadId = insert('leads', hook.tenantId, { firstName: parts[0], lastName: String(body.lastName || parts.slice(1).join(' ')).slice(0, 80), email: String(body.email || '').slice(0, 120), phone: String(body.phone || '').slice(0, 40), companyName: String(body.company || '').slice(0, 120), source: 'Hook', status: 'NEW', rating: 'WARM', ownerId });
    writeAudit(hook.tenantId, ownerId, 'created', 'leads', leadId, 'Inbound hook');
    applyWorkflow(hook.tenantId, 'lead.created', one('leads', hook.tenantId, leadId));
    return { ok: true, id: leadId };
  });
  app.get('/crm/api/search', async (req, reply) => {
    try {
      const user = await guard(req, reply); if (!user) return;
      const q = String(req.query?.q || '').trim().toLowerCase().slice(0, 100);
      if (q.length < 2) return { hits: [] };
      // Escape SQL LIKE wildcards so users can't inject % or _
      const escQ = q.replace(/[%_]/g, (c) => '\\' + c);
      const like = '%' + escQ + '%';
      const hits = [];
      const push = (kind, id, title, detail) => { if (hits.length < 30) hits.push({ kind, id, title, detail }); };
      for (const row of db.prepare("SELECT id, firstName, lastName, email FROM contacts WHERE tenantId = ? AND (lower(firstName) LIKE ? ESCAPE '\\' OR lower(lastName) LIKE ? ESCAPE '\\' OR lower(ifnull(email,'')) LIKE ? ESCAPE '\\') LIMIT 12").all(user.tenantId, like, like, like)) push('contact', row.id, ((row.firstName || '') + ' ' + (row.lastName || '')).trim(), row.email || '');
      for (const row of db.prepare("SELECT id, name, industry FROM companies WHERE tenantId = ? AND lower(name) LIKE ? ESCAPE '\\' LIMIT 8").all(user.tenantId, like)) push('company', row.id, row.name, row.industry || '');
      for (const row of db.prepare("SELECT id, firstName, lastName, companyName FROM leads WHERE tenantId = ? AND (lower(firstName) LIKE ? ESCAPE '\\' OR lower(ifnull(lastName,'')) LIKE ? ESCAPE '\\' OR lower(ifnull(companyName,'')) LIKE ? ESCAPE '\\') LIMIT 8").all(user.tenantId, like, like, like)) push('lead', row.id, ((row.firstName || '') + ' ' + (row.lastName || '')).trim(), row.companyName || '');
      for (const row of db.prepare("SELECT id, name, stage FROM deals WHERE tenantId = ? AND lower(name) LIKE ? ESCAPE '\\' LIMIT 8").all(user.tenantId, like)) push('deal', row.id, row.name, row.stage || '');
      for (const row of db.prepare("SELECT id, name, code FROM products WHERE tenantId = ? AND (lower(name) LIKE ? ESCAPE '\\' OR lower(ifnull(code,'')) LIKE ? ESCAPE '\\') LIMIT 8").all(user.tenantId, like, like)) push('product', row.id, row.name, row.code || '');
      return { hits };
    } catch (e) {
      reply.code(500).send({ error: 'Search failed: ' + (e.message || 'unknown error') });
    }
  });

  // ============================================================
  // FTS5 SEARCH — high-performance full-text search using SQLite
  // FTS5 virtual tables. Returns the same {hits} shape as the
  // legacy LIKE-based /crm/api/search so the frontend can switch
  // to this endpoint with a one-line change. Falls back to 503 if
  // FTS5 is unavailable (some Node builds).
  // ============================================================
  app.get('/crm/api/search/fts', async (req, reply) => {
    try {
      const user = await guard(req, reply); if (!user) return;
      if (!fts5Ready) return reply.code(503).send({ error: 'FTS5 not available', fallback: '/crm/api/search' });
      const q = String(req.query?.q || '').trim().slice(0, 100);
      if (q.length < 2) return { hits: [] };
      // FTS5 query syntax: prefix-match each token (e.g. "ada*" matches "adama")
      const tokens = q.split(/\s+/).filter(Boolean).map((t) => t.replace(/["*]/g, '') + '*').join(' ');
      if (!tokens) return { hits: [] };
      const hits = [];
      const push = (kind, id, title, detail) => { if (hits.length < 30) hits.push({ kind, id, title, detail }); };
      for (const row of db.prepare('SELECT c.id, c.firstName, c.lastName, c.email FROM fts_contacts f JOIN contacts c ON c.id = f.id WHERE f.tenantId = ? AND fts_contacts MATCH ? ORDER BY rank LIMIT 12').all(user.tenantId, tokens)) push('contact', row.id, ((row.firstName || '') + ' ' + (row.lastName || '')).trim(), row.email || '');
      for (const row of db.prepare('SELECT c.id, c.name, c.industry FROM fts_companies f JOIN companies c ON c.id = f.id WHERE f.tenantId = ? AND fts_companies MATCH ? ORDER BY rank LIMIT 8').all(user.tenantId, tokens)) push('company', row.id, row.name, row.industry || '');
      for (const row of db.prepare('SELECT l.id, l.firstName, l.lastName, l.companyName FROM fts_leads f JOIN leads l ON l.id = f.id WHERE f.tenantId = ? AND fts_leads MATCH ? ORDER BY rank LIMIT 8').all(user.tenantId, tokens)) push('lead', row.id, ((row.firstName || '') + ' ' + (row.lastName || '')).trim(), row.companyName || '');
      for (const row of db.prepare('SELECT d.id, d.name, d.stage FROM fts_deals f JOIN deals d ON d.id = f.id WHERE f.tenantId = ? AND fts_deals MATCH ? ORDER BY rank LIMIT 8').all(user.tenantId, tokens)) push('deal', row.id, row.name, row.stage || '');
      for (const row of db.prepare('SELECT a.id, a.subject, a.type FROM fts_activities f JOIN activities a ON a.id = f.id WHERE f.tenantId = ? AND fts_activities MATCH ? ORDER BY rank LIMIT 6').all(user.tenantId, tokens)) push('activity', row.id, row.subject || '', a_type_label(row.type));
      return { hits, engine: 'fts5', query: q };
    } catch (e) {
      reply.code(500).send({ error: 'FTS search failed: ' + (e.message || 'unknown error') });
    }
  });
  function a_type_label(t) { return String(t || 'TASK').replace('_', ' ').toLowerCase(); }

  app.get('/crm/api/events', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    return db.prepare('SELECT id, name, status, attempts, lastError, createdAt FROM crm_events WHERE tenantId = ? ORDER BY createdAt DESC LIMIT 40').all(user.tenantId);
  });
  app.get('/crm/api/access', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    seedAccess(user.tenantId);
    return { areas: AREAS, actions: ACTIONS, rows: db.prepare('SELECT roleName, area, action, allowed FROM crm_permissions WHERE tenantId = ?').all(user.tenantId) };
  });
  app.post('/crm/api/access', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') return reply.code(403).send({ error: 'Only an owner or an admin can change access.' });
    const roleName = String(req.body?.role || '');
    const area = String(req.body?.area || '');
    const action = String(req.body?.action || '');
    if (!ROLE_SEED[roleName] || !AREAS.includes(area) || !ACTIONS.includes(action)) return reply.code(400).send({ error: 'That permission is not on the board.' });
    if (roleName === 'OWNER') return reply.code(400).send({ error: 'The owner always has every action.' });
    db.prepare('INSERT INTO crm_permissions (tenantId, roleName, area, action, allowed) VALUES (?,?,?,?,?) ON CONFLICT(tenantId, roleName, area, action) DO UPDATE SET allowed = excluded.allowed').run(user.tenantId, roleName, area, action, req.body?.allowed ? 1 : 0);
    writeAudit(user.tenantId, user.sub, 'permission', 'access', roleName, area + ' ' + action + ' ' + (req.body?.allowed ? 'on' : 'off'));
    return { ok: true };
  });
  app.get('/crm/api/sessions', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    return db.prepare('SELECT id, ip, agent, createdAt, revokedAt FROM crm_sessions WHERE accountId = ? ORDER BY createdAt DESC LIMIT 12').all(user.sub);
  });
  app.post('/crm/api/sessions/:id/revoke', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    db.prepare('UPDATE crm_sessions SET revokedAt = ? WHERE id = ? AND accountId = ? AND revokedAt IS NULL').run(new Date().toISOString(), req.params.id, user.sub);
    writeAudit(user.tenantId, user.sub, 'revoke', 'session', req.params.id, 'Session closed');
    return { ok: true };
  });
  app.post('/crm/api/account/active', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') return reply.code(403).send({ error: 'Only an owner or an admin can switch an account off.' });
    const id = String(req.body?.id || '');
    const row = db.prepare('SELECT id, role FROM crm_accounts WHERE id = ? AND workspaceId = ?').get(id, user.tenantId);
    if (!row) return reply.code(404).send({ error: 'No such person' });
    if (row.role === 'OWNER') return reply.code(400).send({ error: 'The owner stays on.' });
    db.prepare('UPDATE crm_accounts SET active = ? WHERE id = ?').run(req.body?.active ? 1 : 0, id);
    if (!req.body?.active) db.prepare('UPDATE crm_sessions SET revokedAt = ? WHERE accountId = ? AND revokedAt IS NULL').run(new Date().toISOString(), id);
    writeAudit(user.tenantId, user.sub, req.body?.active ? 'activate' : 'deactivate', 'account', id, '');
    return { ok: true };
  });

  // ============================================================
  // Phase 5: CRM user management — list, invite, update role
  // ============================================================

  // GET /crm/api/accounts — list all CRM accounts in this workspace
  app.get('/crm/api/accounts', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const rows = db.prepare('SELECT id, email, fullName, role, active, createdAt, failed, lockedUntil FROM crm_accounts WHERE workspaceId = ? ORDER BY createdAt').all(user.tenantId);
    return rows;
  });

  // POST /crm/api/accounts/invite — invite a new user (creates account with temp password)
  app.post('/crm/api/accounts/invite', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') return reply.code(403).send({ error: 'Only an owner or an admin can invite users.' });
    const email = String(req.body?.email || '').trim().toLowerCase();
    const fullName = String(req.body?.fullName || '').trim();
    const role = String(req.body?.role || 'SALES').toUpperCase();
    if (!email) return reply.code(400).send({ error: 'Email is required.' });
    if (!['ADMIN', 'MANAGER', 'SALES', 'VIEWER'].includes(role)) return reply.code(400).send({ error: 'Role must be Admin, Manager, Sales, or Viewer.' });
    if (db.prepare('SELECT id FROM crm_accounts WHERE email = ?').get(email)) return reply.code(409).send({ error: 'That email already has a CRM account.' });
    const tempPassword = crypto.randomBytes(4).toString('hex');
    const hash = await bcrypt.hash(tempPassword, 10);
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO crm_accounts (id, workspaceId, email, passwordHash, fullName, role, active) VALUES (?,?,?,?,?,?,?,1)').run(id, user.tenantId, email, hash, fullName, role);
    seedAccess(user.tenantId);
    writeAudit(user.tenantId, user.sub, 'invite', 'account', id, email + ' as ' + role);
    publishEvent(user.tenantId, 'account.created', { id, email, role });
    return reply.code(201).send({ id, email, fullName, role, tempPassword });
  });

  // PATCH /crm/api/accounts/:id — update role
  app.patch('/crm/api/accounts/:id', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') return reply.code(403).send({ error: 'Only an owner or an admin can change roles.' });
    const account = db.prepare('SELECT id, role, email FROM crm_accounts WHERE id = ? AND workspaceId = ?').get(req.params.id, user.tenantId);
    if (!account) return reply.code(404).send({ error: 'Account not found.' });
    if (account.role === 'OWNER') return reply.code(403).send({ error: 'The owner role cannot be changed.' });
    const newRole = String(req.body?.role || '').toUpperCase();
    if (!['ADMIN', 'MANAGER', 'SALES', 'VIEWER'].includes(newRole)) return reply.code(400).send({ error: 'Invalid role.' });
    db.prepare('UPDATE crm_accounts SET role = ? WHERE id = ?').run(newRole, req.params.id);
    writeAudit(user.tenantId, user.sub, 'role', 'account', req.params.id, account.role + ' -> ' + newRole);
    return { ok: true };
  });

  app.post('/crm/api/notifications/snooze', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const minutes = Math.min(24 * 60, Math.max(15, Number(req.body?.minutes || 60)));
    const until = new Date(Date.now() + minutes * 60000).toISOString();
    db.prepare('UPDATE notifications SET snoozeUntil = ?, readAt = ? WHERE id = ? AND tenantId = ? AND userId = ?').run(until, new Date().toISOString(), String(req.body?.id || ''), user.tenantId, user.sub);
    return { ok: true, until };
  });
  app.get('/crm/portal/:id', async (req, reply) => {
    const portal = db.prepare("SELECT * FROM objects WHERE id = ? AND kind = 'portal'").get(req.params.id);
    if (!portal) return reply.code(404).type('text/html').send(publicShell('Portal', '<h1>This portal is not here.</h1>'));
    let meta = {};
    try { meta = JSON.parse(portal.meta || '{}'); } catch { meta = {}; }
    const tenant = await prisma.tenant.findUnique({ where: { id: portal.tenantId }, select: { name: true } });
    const companyId = meta.companyId || '';
    const quotes = companyId ? db.prepare('SELECT * FROM quotes WHERE tenantId = ? AND companyId = ? ORDER BY createdAt DESC').all(portal.tenantId, companyId) : [];
    const links = db.prepare("SELECT * FROM objects WHERE tenantId = ? AND kind = 'paylink'").all(portal.tenantId).filter((row) => { try { return JSON.parse(row.meta || '{}').companyId === companyId; } catch { return false; } });
    const subs = db.prepare("SELECT * FROM objects WHERE tenantId = ? AND kind = 'subscription'").all(portal.tenantId).filter((row) => { try { return JSON.parse(row.meta || '{}').companyId === companyId; } catch { return false; } });
    const quoteHtml = quotes.map((row) => `<li>${htmlEscape(row.number || 'Quote')} · ${htmlEscape(row.status)} · NGN ${Number(row.total || 0).toLocaleString('en-NG')}</li>`).join('') || '<li>No quote.</li>';
    const linkHtml = links.map((row) => `<li><a href="/crm/pay/${htmlEscape(row.id)}">${htmlEscape(row.name)}</a></li>`).join('') || '<li>No payment page.</li>';
    const subHtml = subs.map((row) => `<li>${htmlEscape(row.name)} · NGN ${Number(row.amount || 0).toLocaleString('en-NG')}</li>`).join('') || '<li>No subscription on this company.</li>';
    return reply.type('text/html').send(publicShell(portal.name, `<p style="font-family:sans-serif;font-size:12px">${htmlEscape(tenant?.name || 'Afri')}</p><h1>${htmlEscape(portal.name)}</h1><h2>Quotes</h2><ul>${quoteHtml}</ul><h2>Pay</h2><ul>${linkHtml}</ul><h2>Subscriptions</h2><ul>${subHtml}</ul>`));
  });
  // POST /crm/api/setup/demo — load demo data for existing workspaces
  app.post('/crm/api/setup/demo', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') return reply.code(403).send({ error: 'Only an owner or admin can load demo data.' });
    seedDemo(user.tenantId, user.sub);
    writeAudit(user.tenantId, user.sub, 'demo', 'workspace', user.tenantId, 'Demo data loaded');
    return { ok: true, message: 'Demo data loaded' };
  });

  function seedDemo(workspaceId, ownerId) {
    // Defensive: never let demo-seeding failure crash signup or the
    // admin "Load demo data" button. Log + bail to the caller.
    try {
      if (db.prepare('SELECT COUNT(*) AS n FROM companies WHERE tenantId = ?').get(workspaceId).n > 0) return;
      ensurePipeline(workspaceId);
      ensureSequences(workspaceId);
      ensureWorkflows(workspaceId);
    const tags = ['VIP', 'Wholesale', 'Lagos', 'Abuja', 'Repeat buyer'];
    for (let i = 0; i < tags.length; i++) {
      db.prepare('INSERT INTO tags (id, tenantId, name, color) VALUES (?,?,?,?)').run(crypto.randomUUID(), workspaceId, tags[i], ['#dc2626','#7c3aed','#2563eb','#059669','#d97706'][i]);
    }
    const companies = [
      ['Zenith Foods Ltd','Food & Beverage','CUSTOMER','Lagos','contact@zenithfoods.ng','01-234-5678'],
      ['Lekki Tech Hub','Technology','PROSPECT','Lagos','hello@lekkitech.ng','01-876-5432'],
      ['Atlantic Logistics','Transportation','CUSTOMER','Port Harcourt','info@atlanticlog.ng','084-123-4567'],
      ['Savannah Trading Co','Trading','PROSPECT','Abuja','sales@savannahtc.ng','09-345-6789'],
      ['Naija Builds Ltd','Construction','PARTNER','Abuja','projects@naijabuilds.ng','09-987-6543'],
    ];
    const companyIds = companies.map(function(c) {
      var id = crypto.randomUUID();
      db.prepare('INSERT INTO companies (id, tenantId, name, industry, type, city, email, phone, country, ownerId, source, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(id, workspaceId, c[0], c[1], c[2], c[3], c[4], c[5], 'Nigeria', ownerId, 'Referral', new Date(Date.now() - Math.random() * 30 * 86400000).toISOString());
      return id;
    });
    var contacts = [
      ['Ada','Okafor','Operations Manager',companyIds[0],'ada@zenithfoods.ng','0803-555-0101'],
      ['Bola','Adeyemi','CEO',companyIds[1],'bola@lekkitech.ng','0805-555-0202'],
      ['Chidi','Nwosu','Sales Director',companyIds[2],'chidi@atlanticlog.ng','0807-555-0303'],
      ['Fatima','Bello','General Manager',companyIds[3],'fatima@savannahtc.ng','0809-555-0404'],
      ['Emeka','Obi','Project Director',companyIds[4],'emeka@naijabuilds.ng','0811-555-0505'],
      ['Grace','Eze','Marketing Lead',companyIds[1],'grace@lekkitech.ng','0813-555-0606'],
      ['Tunde','Adesanya','Procurement',companyIds[0],'tunde@zenithfoods.ng','0815-555-0707'],
      ['Zainab','Yusuf','Founder',companyIds[3],'zainab@savannahtc.ng','0817-555-0808'],
    ];
    var contactIds = contacts.map(function(c) {
      var id = crypto.randomUUID();
      db.prepare('INSERT INTO contacts (id, tenantId, firstName, lastName, title, companyId, email, phone, city, country, ownerId, source, status, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(id, workspaceId, c[0], c[1], c[2], c[3], c[4], c[5], 'Lagos', 'Nigeria', ownerId, 'Referral', 'ACTIVE', new Date(Date.now() - Math.random() * 20 * 86400000).toISOString());
      return id;
    });
    var stages = db.prepare('SELECT id, code FROM stages WHERE tenantId = ? ORDER BY position').all(workspaceId);
    var findStage = function(code) { return (stages.find(function(s) { return s.code === code; }) || stages[0]).id; };
    var deals = [
      ['Software implementation for Zenith', companyIds[0], contactIds[0], 2500000, 'PROPOSAL_SENT', 60, '2026-11-15'],
      ['Annual support contract', companyIds[1], contactIds[1], 1200000, 'NEGOTIATION', 80, '2026-10-30'],
      ['Hardware upgrade package', companyIds[2], contactIds[2], 800000, 'NEEDS_ASSESSMENT', 40, '2026-12-01'],
      ['Consulting retainer', companyIds[3], contactIds[3], 3000000, 'PROSPECTING', 10, '2026-12-15'],
      ['Training program (won)', companyIds[4], contactIds[4], 450000, 'CLOSED_WON', 100, '2026-09-20'],
    ];
    var dealIds = [];
    deals.forEach(function(d) {
      var id = crypto.randomUUID();
      db.prepare('INSERT INTO deals (id, tenantId, name, companyId, contactId, amount, stage, probability, closeDate, type, source, ownerId, nextStep, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(id, workspaceId, d[0], d[1], d[2], d[3], findStage(d[4]), d[5], d[6], 'NEW', 'Referral', ownerId, d[4] === 'CLOSED_WON' ? 'Send onboarding' : 'Schedule follow-up', new Date(Date.now() - Math.random() * 15 * 86400000).toISOString());
      dealIds.push(id);
    });
    var today = new Date().toISOString().slice(0,10);
    var tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0,10);
    var nextWeek = new Date(Date.now() + 7*86400000).toISOString().slice(0,10);
    var yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
    var tasks = [
      ['CALL','Call Ada about the software proposal', contactIds[0], 'deal', yesterday, 'PLANNED', 'HIGH'],
      ['TASK','Send updated quote to Bola', contactIds[1], 'contact', today, 'PLANNED', 'HIGH'],
      ['MEETING','Demo session with Atlantic Logistics', contactIds[2], 'deal', tomorrow, 'PLANNED', 'NORMAL'],
      ['TASK','Follow up on Savannah Trading retainer', contactIds[3], 'deal', nextWeek, 'PLANNED', 'NORMAL'],
      ['CALL','Check in with Emeka on training', contactIds[4], 'deal', yesterday, 'PLANNED', 'NORMAL'],
      ['TASK','Update pricing sheet for Q4', null, null, today, 'PLANNED', 'NORMAL'],
      ['EMAIL','Send contract to Zenith Foods', contactIds[0], 'deal', today, 'PLANNED', 'HIGH'],
      ['CALL','Welcome call to Zainab', contactIds[7], 'contact', tomorrow, 'PLANNED', 'NORMAL'],
    ];
    tasks.forEach(function(t) {
      var id = crypto.randomUUID();
      db.prepare('INSERT INTO activities (id, tenantId, type, subject, relatedType, relatedId, dueAt, status, priority, ownerId, notes, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(id, workspaceId, t[0], t[1], t[3] || null, t[2] || null, t[4], t[5], t[6], ownerId, '', new Date(Date.now() - Math.random() * 5 * 86400000).toISOString());
    });
    var notes = [
      [contactIds[0], 'contact', 'Ada mentioned they are evaluating 3 vendors. We are the frontrunner because of local support.'],
      [contactIds[1], 'contact', 'Bola wants a pilot program for 5 users before committing to the annual contract.'],
      [contactIds[3], 'contact', 'Savannah Trading is expanding to 3 new branches. They need multi-branch inventory management.'],
    ];
    notes.forEach(function(n) {
      db.prepare('INSERT INTO notes (id, tenantId, relatedType, relatedId, body, createdAt) VALUES (?,?,?,?,?,?)').run(crypto.randomUUID(), workspaceId, n[1], n[0], n[2], new Date().toISOString());
    });
    db.prepare('INSERT OR REPLACE INTO workspace (tenantId, size, industry, goal, channel, done) VALUES (?,?,?,?,?,?)').run(workspaceId, '11-50', 'Services', 'Close deals', 'Phone & WhatsApp', 0);
    // Populate FTS5 index so search works immediately after seeding
    if (fts5Ready) {
      try {
        for (let i = 0; i < companies.length; i++) {
          const c = companies[i];
          ftsUpsert('companies', companyIds[i], workspaceId, { name: c[0], email: c[4], phone: c[5], industry: c[1] });
        }
        for (let i = 0; i < contacts.length; i++) {
          const c = contacts[i];
          ftsUpsert('contacts', contactIds[i], workspaceId, { firstName: c[0], lastName: c[1], email: c[4], phone: c[5], company: '' });
        }
        for (let i = 0; i < deals.length; i++) {
          const d = deals[i];
          ftsUpsert('deals', dealIds[i], workspaceId, { name: d[0], description: '', nextStep: '' });
        }
      } catch (e) { log.warn('fts5.seed.indexing.failed', { err: e.message }); }
    }
    } catch (e) {
      log.error('seedDemo.failed', { err: e.message, tenantId: workspaceId });
    }
  }

  // ============================================================
  // API KEYS — generate/revoke keys for programmatic access
  // External apps can authenticate with X-API-Key header
  // ============================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS crm_api_keys (
      id TEXT PRIMARY KEY,
      tenantId TEXT NOT NULL,
      name TEXT NOT NULL,
      keyHash TEXT NOT NULL,
      prefix TEXT NOT NULL,
      lastUsedAt TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS ix_crm_api_keys ON crm_api_keys(tenantId);
  `);

  // API key auth helper — checks X-API-Key header
  async function apiKeyAuth(req) {
    const key = req.headers['x-api-key'];
    if (!key) return null;
    const row = db.prepare('SELECT * FROM crm_api_keys WHERE keyHash = ?').run != null ? null : null;
    // Use a simple hash (SHA256 of the key)
    const { createHash } = await import('crypto');
    const hash = createHash('sha256').update(key).digest('hex');
    const account = db.prepare('SELECT * FROM crm_api_keys WHERE keyHash = ?').get(hash);
    if (!account) return null;
    db.prepare('UPDATE crm_api_keys SET lastUsedAt = ? WHERE id = ?').run(new Date().toISOString(), account.id);
    return { tenantId: account.tenantId, role: 'ADMIN', sub: 'api-key-' + account.id };
  }

  app.get('/crm/api/api-keys', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') return reply.code(403).send({ error: 'Only owners and admins can manage API keys.' });
    const rows = db.prepare('SELECT id, name, prefix, lastUsedAt, createdAt FROM crm_api_keys WHERE tenantId = ? ORDER BY createdAt DESC').all(user.tenantId);
    return rows;
  });

  app.post('/crm/api/api-keys', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') return reply.code(403).send({ error: 'Only owners and admins can create API keys.' });
    const name = String(req.body?.name || '').trim().slice(0, 80);
    if (!name) return reply.code(400).send({ error: 'Name your API key.' });
    const rawKey = 'afri_crm_' + crypto.randomBytes(16).toString('hex');
    const { createHash } = await import('crypto');
    const hash = createHash('sha256').update(rawKey).digest('hex');
    const id = crypto.randomUUID();
    const prefix = rawKey.slice(0, 18) + '...';
    db.prepare('INSERT INTO crm_api_keys (id, tenantId, name, keyHash, prefix) VALUES (?,?,?,?,?)').run(id, user.tenantId, name, hash, prefix);
    writeAudit(user.tenantId, user.sub, 'create', 'api-key', id, name);
    return reply.code(201).send({ id, name, key: rawKey, prefix, message: 'Save this key — it will not be shown again.' });
  });

  app.delete('/crm/api/api-keys/:id', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') return reply.code(403).send({ error: 'Only owners and admins can revoke API keys.' });
    const row = db.prepare('SELECT * FROM crm_api_keys WHERE id = ? AND tenantId = ?').get(req.params.id, user.tenantId);
    if (!row) return reply.code(404).send({ error: 'Key not found.' });
    db.prepare('DELETE FROM crm_api_keys WHERE id = ?').run(req.params.id);
    writeAudit(user.tenantId, user.sub, 'revoke', 'api-key', req.params.id, row.name);
    return { ok: true };
  });

  // ============================================================
  // WEBHOOKS — inbound + outbound configuration
  // External apps can POST data to /crm/api/webhook/:id
  // CRM fires outbound webhooks when events happen
  // ============================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS crm_webhooks (
      id TEXT PRIMARY KEY,
      tenantId TEXT NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      events TEXT NOT NULL DEFAULT '*',
      secret TEXT,
      active INTEGER DEFAULT 1,
      lastFiredAt TEXT,
      lastStatus TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS ix_crm_webhooks ON crm_webhooks(tenantId);
  `);

  app.get('/crm/api/webhooks', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') return reply.code(403).send({ error: 'Only owners and admins can manage webhooks.' });
    const rows = db.prepare('SELECT * FROM crm_webhooks WHERE tenantId = ? ORDER BY createdAt DESC').all(user.tenantId);
    return rows;
  });

  app.post('/crm/api/webhooks', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') return reply.code(403).send({ error: 'Only owners and admins can create webhooks.' });
    const name = String(req.body?.name || '').trim().slice(0, 80);
    const url = String(req.body?.url || '').trim();
    const events = String(req.body?.events || '*').trim();
    if (!name) return reply.code(400).send({ error: 'Name your webhook.' });
    if (!url || !url.startsWith('https://')) return reply.code(400).send({ error: 'URL must start with https://' });
    const id = crypto.randomUUID();
    const secret = crypto.randomBytes(16).toString('hex');
    db.prepare('INSERT INTO crm_webhooks (id, tenantId, name, url, events, secret) VALUES (?,?,?,?,?,?)').run(id, user.tenantId, name, url, events, secret);
    writeAudit(user.tenantId, user.sub, 'create', 'webhook', id, name);
    return reply.code(201).send({ id, name, url, events, secret, message: 'Use this secret to verify webhook signatures (X-Afri-Signature header, HMAC-SHA256 of the body).' });
  });

  app.delete('/crm/api/webhooks/:id', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') return reply.code(403).send({ error: 'Only owners and admins can delete webhooks.' });
    const row = db.prepare('SELECT * FROM crm_webhooks WHERE id = ? AND tenantId = ?').get(req.params.id, user.tenantId);
    if (!row) return reply.code(404).send({ error: 'Webhook not found.' });
    db.prepare('DELETE FROM crm_webhooks WHERE id = ?').run(req.params.id);
    writeAudit(user.tenantId, user.sub, 'delete', 'webhook', req.params.id, row.name);
    return { ok: true };
  });

  // Inbound webhook endpoint — external apps POST here
  app.post('/crm/api/webhook/:id', async (req, reply) => {
    const row = db.prepare('SELECT * FROM crm_webhooks WHERE id = ? AND active = 1').get(req.params.id);
    if (!row) return reply.code(404).send({ error: 'Webhook not found or inactive.' });
    // Verify signature if secret is set
    if (row.secret) {
      const signature = req.headers['x-afri-signature'];
      const { createHmac } = await import('crypto');
      const expected = createHmac('sha256', row.secret).update(JSON.stringify(req.body || {})).digest('hex');
      if (signature !== expected) return reply.code(401).send({ error: 'Invalid signature.' });
    }
    // Process the incoming event
    const payload = req.body || {};
    const eventName = payload.event || payload.type || 'webhook.received';
    // If it's a contact creation event, create the contact
    if (eventName === 'contact.created' && payload.email) {
      const existing = db.prepare('SELECT id FROM contacts WHERE tenantId = ? AND email = ?').get(row.tenantId, payload.email.toLowerCase());
      if (!existing) {
        const id = crypto.randomUUID();
        db.prepare('INSERT INTO contacts (id, tenantId, firstName, lastName, email, phone, source, status, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)').run(
          id, row.tenantId, payload.firstName || '', payload.lastName || '', payload.email.toLowerCase(),
          payload.phone || '', 'Webhook: ' + row.name, 'ACTIVE', new Date().toISOString()
        );
        writeAudit(row.tenantId, '', 'webhook.create', 'contact', id, payload.email);
        return { ok: true, created: 'contact', id };
      }
      return { ok: true, skipped: 'duplicate' };
    }
    // If it's a deal creation event
    if (eventName === 'deal.created' && payload.name) {
      const id = crypto.randomUUID();
      const stages = db.prepare('SELECT id FROM stages WHERE tenantId = ? ORDER BY position LIMIT 1').get(row.tenantId);
      db.prepare('INSERT INTO deals (id, tenantId, name, amount, stage, probability, closeDate, type, source, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(
        id, row.tenantId, payload.name, Number(payload.amount || 0), stages ? stages.id : '', Number(payload.probability || 50),
        payload.closeDate || null, 'NEW', 'Webhook: ' + row.name, new Date().toISOString()
      );
      writeAudit(row.tenantId, '', 'webhook.create', 'deal', id, payload.name);
      return { ok: true, created: 'deal', id };
    }
    // Generic — just log it
    writeAudit(row.tenantId, '', 'webhook.received', 'webhook', row.id, eventName);
    db.prepare('UPDATE crm_webhooks SET lastFiredAt = ?, lastStatus = ? WHERE id = ?').run(new Date().toISOString(), '200', row.id);
    return { ok: true, event: eventName };
  });

  // ============================================================
  // INTEGRATION MARKETPLACE — list available integrations
  // ============================================================
  app.get('/crm/api/integrations', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    const connections = db.prepare('SELECT provider, email, status FROM connections WHERE tenantId = ?').all(user.tenantId);
    const connected = {};
    const connEmail = {};
    connections.forEach(c => { connected[c.provider] = c.status === 'CONNECTED'; if (c.email) connEmail[c.provider] = c.email; });
    const tools = db.prepare('SELECT provider, clientId FROM tool_apps WHERE tenantId = ?').all(user.tenantId);
    const configured = {};
    tools.forEach(t => { configured[t.provider] = Boolean(t.clientId); });
    // Platform OAuth enabled when env vars are set on Railway — works for all tenants in one click
    const googlePlatform = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    const microsoftPlatform = Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
    const googleReady = googlePlatform || configured.google;
    const microsoftReady = microsoftPlatform || configured.microsoft;
    return [
      { id: 'gmail', name: 'Gmail', icon: '✉', category: 'Email', status: connected.gmail ? 'connected' : (googleReady ? 'ready' : 'not_configured'), description: 'Sync emails, send from CRM, log conversations.', email: connEmail.gmail, oauthUrl: '/crm/api/connect/gmail', platform: googlePlatform },
      { id: 'google_calendar', name: 'Google Calendar', icon: '📅', category: 'Calendar', status: connected.calendar ? 'connected' : (googleReady ? 'ready' : 'not_configured'), description: 'See meetings, sync tasks to calendar.', email: connEmail.calendar, oauthUrl: '/crm/api/connect/calendar', platform: googlePlatform },
      { id: 'outlook', name: 'Outlook', icon: '📧', category: 'Email', status: connected.outlook ? 'connected' : (microsoftReady ? 'ready' : 'not_configured'), description: 'Sync Outlook emails and calendar.', email: connEmail.outlook, oauthUrl: '/crm/api/connect/outlook', platform: microsoftPlatform },
      { id: 'whatsapp', name: 'WhatsApp', icon: '💬', category: 'Messaging', status: process.env.WHATSAPP_TOKEN ? 'connected' : 'not_configured', description: 'Send WhatsApp messages from contact records.' },
      { id: 'email', name: 'Email (Resend)', icon: '📨', category: 'Email', status: process.env.RESEND_API_KEY ? 'connected' : 'not_configured', description: 'Send transactional emails via Resend API.' },
      { id: 'flutterwave', name: 'Flutterwave', icon: '💳', category: 'Payments', status: process.env.FLUTTERWAVE_SECRET_KEY ? 'connected' : 'not_configured', description: 'Collect payments, generate payment links.' },
      { id: 'paystack', name: 'Paystack', icon: '💰', category: 'Payments', status: process.env.PAYSTACK_SECRET_KEY ? 'connected' : 'not_configured', description: 'Collect payments, verify transactions.' },
      { id: 'gemini', name: 'AI Assistant', icon: '🤖', category: 'AI', status: process.env.GEMINI_API_KEY ? 'connected' : 'not_configured', description: 'Ask Afri — AI-powered insights about your pipeline.' },
      { id: 'api_keys', name: 'API Keys', icon: '🔑', category: 'Developer', status: 'always', description: 'Generate API keys for programmatic access.' },
      { id: 'webhooks', name: 'Webhooks', icon: '🔗', category: 'Developer', status: 'always', description: 'Receive data from external apps, or push data out.' },
      { id: 'slack', name: 'Slack', icon: '💬', category: 'Notifications', status: 'coming_soon', description: 'Get notifications in Slack when deals move.' },
      { id: 'telegram', name: 'Telegram', icon: '✈️', category: 'Notifications', status: 'coming_soon', description: 'Get notifications in Telegram.' },
      { id: 'calendly', name: 'Calendly', icon: '📆', category: 'Scheduling', status: 'coming_soon', description: 'Embed booking links, sync meetings.' },
      { id: 'zapier', name: 'Zapier', icon: '⚡', category: 'Automation', status: 'coming_soon', description: 'Connect 5000+ apps via Zapier webhooks.' },
    ];
  });

  // ============================================================
  // OAUTH SETUP — gives the workspace owner clear setup instructions
  // Returns redirect URLs + Railway env var names + console links
  // ============================================================
  app.get('/crm/api/oauth/setup', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') return reply.code(403).send({ error: 'Only owners and admins can view OAuth setup.' });
    const origin = originOf(req);
    return {
      redirect_base: origin,
      providers: [
        {
          id: 'google',
          name: 'Google (Gmail + Calendar)',
          console_url: 'https://console.cloud.google.com/apis/credentials',
          env_vars: { client_id: 'GOOGLE_CLIENT_ID', client_secret: 'GOOGLE_CLIENT_SECRET' },
          redirect_urls: [
            origin + '/crm/api/connect/google/callback',
          ],
          scopes: 'openid email https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly',
          platform_enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
          steps: [
            'Go to Google Cloud Console → APIs & Services → Credentials',
            'Click "Create Credentials" → "OAuth client ID"',
            'Application type: Web application',
            'Add the redirect URL above to "Authorized redirect URIs"',
            'Copy the Client ID and Client Secret',
            'On Railway, add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET as variables',
            'Redeploy. All users in your workspace can now click Connect Gmail.'
          ]
        },
        {
          id: 'microsoft',
          name: 'Microsoft (Outlook + Calendar)',
          console_url: 'https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade',
          env_vars: { client_id: 'MICROSOFT_CLIENT_ID', client_secret: 'MICROSOFT_CLIENT_SECRET' },
          redirect_urls: [
            origin + '/crm/api/connect/microsoft/callback',
          ],
          scopes: 'openid email offline_access User.Read Mail.Send Calendars.Read',
          platform_enabled: Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET),
          steps: [
            'Go to Azure Portal → App registrations → New registration',
            'Name: Afri CRM',
            'Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"',
            'Add the redirect URL above as a Web platform redirect URI',
            'Under Certificates & secrets, create a new client secret and copy the value',
            'Under API permissions, add Mail.Send, Calendars.Read, User.Read (delegated)',
            'On Railway, add MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET as variables',
            'Redeploy. All users can now click Connect Outlook.'
          ]
        }
      ]
    };
  });

  // Per-tenant "Bring your own credentials" — for owners who want their own OAuth client
  app.post('/crm/api/oauth/credentials/:provider', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') return reply.code(403).send({ error: 'Only owners and admins can configure credentials.' });
    const provider = ['google', 'microsoft'].includes(req.params.provider) ? req.params.provider : '';
    if (!provider) return reply.code(400).send({ error: 'Unknown provider' });
    const clientId = String(req.body?.clientId || '').trim();
    const clientSecret = String(req.body?.clientSecret || '').trim();
    if (!clientId || !clientSecret) return reply.code(400).send({ error: 'Client ID and secret are required.' });
    db.prepare('INSERT INTO tool_apps (tenantId, provider, clientId, clientSecret) VALUES (?,?,?,?) ON CONFLICT(tenantId, provider) DO UPDATE SET clientId = excluded.clientId, clientSecret = excluded.clientSecret').run(user.tenantId, provider, clientId, clientSecret);
    writeAudit(user.tenantId, user.sub, 'configure', 'oauth-' + provider, provider, clientId.slice(0, 12) + '...');
    return { ok: true, message: 'Credentials saved. Users can now click Connect.' };
  });

  app.delete('/crm/api/oauth/credentials/:provider', async (req, reply) => {
    const user = await guard(req, reply); if (!user) return;
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') return reply.code(403).send({ error: 'Only owners and admins can remove credentials.' });
    const provider = ['google', 'microsoft'].includes(req.params.provider) ? req.params.provider : '';
    if (!provider) return reply.code(400).send({ error: 'Unknown provider' });
    db.prepare('DELETE FROM tool_apps WHERE tenantId = ? AND provider = ?').run(user.tenantId, provider);
    db.prepare('DELETE FROM connections WHERE tenantId = ? AND provider IN (?,?)').run(user.tenantId, provider === 'google' ? 'gmail' : 'outlook', provider === 'google' ? 'calendar' : 'outlook');
    writeAudit(user.tenantId, user.sub, 'remove', 'oauth-' + provider, provider, '');
    return { ok: true };
  });


}
