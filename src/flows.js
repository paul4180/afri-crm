import crypto from 'crypto';
let ctx = null;

export function bindFlows(helpers) {
  ctx = helpers;
}

function stepsOf(rule) {
  try {
    const graph = JSON.parse(rule.graph || '{}');
    const steps = Array.isArray(graph.steps) ? graph.steps : [];
    const allowed = new Set(['task', 'wait', 'wait_reply', 'branch', 'whatsapp', 'email', 'notify', 'update', 'assign']);
    return steps.filter((step) => step && allowed.has(step.type)).slice(0, 10);
  } catch {
    return [];
  }
}

function labelOf(record) {
  return record.name || [record.firstName, record.lastName].filter(Boolean).join(' ') || 'record';
}

function related(trigger) {
  return String(trigger || '').startsWith('deal') ? 'deal' : String(trigger || '').startsWith('message') ? 'contact' : 'lead';
}

function lagosWait(days) {
  const when = new Date(Date.now() + Math.min(30, Math.max(0, Number(days || 0))) * 86400000);
  const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', weekday: 'short' }).format(when);
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', hour: 'numeric', hourCycle: 'h23' }).format(when));
  let extra = 0;
  if (weekday === 'Sat') extra = 2;
  else if (weekday === 'Sun') extra = 1;
  else if (hour >= 18) extra = 1;
  return new Date(when.getTime() + extra * 86400000).toISOString();
}

function capped(db, tenantId, contactId) {
  if (!contactId) return false;
  const since = new Date(Date.now() - 86400000).toISOString();
  const row = db.prepare("SELECT COUNT(*) AS n FROM activities WHERE tenantId = ? AND relatedId = ? AND type IN ('EMAIL','WHATSAPP') AND createdAt >= ?").get(tenantId, contactId, since);
  return row.n >= 3;
}

function blocked(record, channel) {
  if (!record) return 'There is no record';
  if (record.consent === 'no') return 'They refused contact';
  if (channel === 'whatsapp' && record.whatsappOptIn === 'no') return 'They opted out of WhatsApp';
  return '';
}

function logRun(db, tenantId, workflowId, recordId, status, detail) {
  db.prepare('INSERT INTO workflow_runs (id, tenantId, workflowId, recordId, status, detail, ranAt) VALUES (?,?,?,?,?,?,?)')
    .run(crypto.randomUUID(), tenantId, workflowId, recordId, status, String(detail || '').slice(0, 300), new Date().toISOString());
}

function failCount(db, tenantId, workflowId) {
  return db.prepare("SELECT COUNT(*) AS n FROM workflow_runs WHERE tenantId = ? AND workflowId = ? AND status = 'FAILED'").get(tenantId, workflowId).n;
}

export function describeSteps(rule, record) {
  const steps = stepsOf(rule);
  const lines = [];
  let index = 0;
  let guard = 0;
  while (index < steps.length && guard < 10) {
    const step = steps[index];
    guard += 1;
    if (step.type === 'wait') {
      lines.push('Wait ' + (step.days || 1) + ' day(s), skipping Lagos Saturday and Sunday');
      index += 1;
    } else if (step.type === 'wait_reply') {
      lines.push('Wait for a WhatsApp reply' + (step.days ? ', or ' + step.days + ' day(s)' : ''));
      index += 1;
    } else if (step.type === 'branch') {
      const value = record ? record[step.field] : '';
      const yes = String(value || '') === String(step.equals || '');
      lines.push((step.field || 'field') + ' is ' + (value || 'empty') + ' so take step ' + (yes ? step.yes : step.no));
      const next = Number(yes ? step.yes : step.no);
      index = Number.isInteger(next) ? next : index + 1;
    } else {
      lines.push(step.type + (step.subject || step.body || step.value ? ': ' + (step.subject || step.body || step.value) : ''));
      index += 1;
    }
  }
  return lines;
}

async function execute(db, helpers, tenantId, rule, record, from) {
  const steps = stepsOf(rule);
  if (!steps.length) return;
  const job = db.prepare('SELECT * FROM flow_jobs WHERE tenantId = ? AND workflowId = ? AND recordId = ?').get(tenantId, rule.id, record.id);
  if (job && job.status === 'DONE') return;
  if (job && job.status === 'RUNNING' && from == null) return;
  if (job && (job.status === 'WAITING' || job.status === 'WAITING_REPLY') && from == null) return;
  let index = from == null ? (job && job.status === 'FAILED' ? 0 : (job ? job.step : 0)) : from;
  if (!job) {
    db.prepare('INSERT INTO flow_jobs (id, tenantId, workflowId, recordId, object, step, status, contactId, updatedAt) VALUES (?,?,?,?,?,?,?,?,?)')
      .run(crypto.randomUUID(), tenantId, rule.id, record.id, related(rule.trigger), index, 'RUNNING', record.contactId || (rule.trigger.startsWith('message') ? record.id : null), new Date().toISOString());
  } else {
    db.prepare("UPDATE flow_jobs SET status = 'RUNNING', step = ?, updatedAt = ? WHERE id = ?").run(index, new Date().toISOString(), job.id);
  }
  const current = () => db.prepare('SELECT * FROM flow_jobs WHERE tenantId = ? AND workflowId = ? AND recordId = ?').get(tenantId, rule.id, record.id);
  let guard = 0;
  while (index < steps.length && guard < 10) {
    const step = steps[index];
    guard += 1;
    try {
      if (step.type === 'wait') {
        const until = lagosWait(step.days || 1);
        db.prepare("UPDATE flow_jobs SET status = 'WAITING', step = ?, waitUntil = ?, updatedAt = ? WHERE tenantId = ? AND workflowId = ? AND recordId = ?")
          .run(index + 1, until, new Date().toISOString(), tenantId, rule.id, record.id);
        logRun(db, tenantId, rule.id, record.id, 'WAITING', 'Waiting until ' + until.slice(0, 16));
        return;
      }
      if (step.type === 'wait_reply') {
        const until = step.days ? lagosWait(step.days) : null;
        db.prepare("UPDATE flow_jobs SET status = 'WAITING_REPLY', step = ?, waitUntil = ?, contactId = ?, updatedAt = ? WHERE tenantId = ? AND workflowId = ? AND recordId = ?")
          .run(index + 1, until, record.contactId || record.id, new Date().toISOString(), tenantId, rule.id, record.id);
        logRun(db, tenantId, rule.id, record.id, 'WAITING', 'Waiting for a WhatsApp reply');
        return;
      }
      if (step.type === 'branch') {
        const yes = String(record[step.field] || '') === String(step.equals || '');
        const next = Number(yes ? step.yes : step.no);
        logRun(db, tenantId, rule.id, record.id, 'OK', (step.field || 'field') + (yes ? ' matched' : ' did not match'));
        index = Number.isInteger(next) && next >= 0 && next < steps.length ? next : index + 1;
        continue;
      }
      const who = record.contactId || (related(rule.trigger) === 'contact' ? record.id : null);
      if (step.type === 'whatsapp' || step.type === 'email') {
        const why = blocked(record, step.type) || (capped(db, tenantId, who) ? 'This person already got 3 messages today' : '');
        if (why) {
          logRun(db, tenantId, rule.id, record.id, 'SKIPPED', why);
          index += 1;
          continue;
        }
      }
      if (step.type === 'task') {
        const due = new Date(Date.now() + Number(step.days || 0) * 86400000).toISOString().slice(0, 10);
        helpers.insert('activities', tenantId, { type: 'TASK', subject: (step.subject || rule.taskSubject || rule.name) + ': ' + labelOf(record), dueAt: due, status: 'PLANNED', relatedType: related(rule.trigger), relatedId: record.id, ownerId: record.ownerId || null, notes: 'Opened by the flow "' + rule.name + '".' });
        logRun(db, tenantId, rule.id, record.id, 'OK', 'Task opened');
      } else if (step.type === 'notify') {
        if (!record.ownerId) throw new Error('This record has no owner');
        helpers.notifyUser(tenantId, record.ownerId, { kind: 'task', title: step.subject || rule.name, body: labelOf(record), recordType: related(rule.trigger), recordId: record.id });
        logRun(db, tenantId, rule.id, record.id, 'OK', 'Owner notified');
      } else if (step.type === 'assign') {
        const people = db.prepare("SELECT id FROM crm_accounts WHERE workspaceId = ? AND COALESCE(active, 1) = 1 AND role IN ('OWNER','ADMIN','MANAGER','SALES') AND email NOT LIKE '%@sample.invalid'").all(tenantId);
        if (!people.length) throw new Error('Nobody to assign');
        const table = related(rule.trigger) === 'deal' ? 'deals' : related(rule.trigger) === 'contact' ? 'contacts' : 'leads';
        helpers.patch(table, tenantId, record.id, { ownerId: people[0].id });
        record.ownerId = people[0].id;
        logRun(db, tenantId, rule.id, record.id, 'OK', 'Owner set');
      } else if (step.type === 'update') {
        const field = ['lifecycle', 'status', 'source', 'rating', 'nextStep'].includes(step.field) ? step.field : '';
        if (!field) throw new Error('That field cannot be changed by a flow');
        const table = related(rule.trigger) === 'deal' ? 'deals' : related(rule.trigger) === 'contact' ? 'contacts' : 'leads';
        helpers.patch(table, tenantId, record.id, { [field]: String(step.value || '').slice(0, 80) });
        record[field] = step.value;
        logRun(db, tenantId, rule.id, record.id, 'OK', field + ' updated');
      } else if (step.type === 'whatsapp') {
        logRun(db, tenantId, rule.id, record.id, 'SKIPPED', 'A flow does not send WhatsApp by itself. The thread window and the line have to be used by a person, or the step is skipped.');
      } else if (step.type === 'email') {
        const sent = record.email ? await helpers.sendMail({ to: record.email, subject: step.subject || rule.name, text: step.body || step.subject || '' }) : false;
        logRun(db, tenantId, rule.id, record.id, sent ? 'OK' : 'SKIPPED', sent ? 'Email sent' : 'Mail is not configured or the record has no email');
      } else {
        logRun(db, tenantId, rule.id, record.id, 'SKIPPED', 'Unknown step');
      }
      index += 1;
    } catch (error) {
      logRun(db, tenantId, rule.id, record.id, 'FAILED', error.message || 'Failed');
      db.prepare("UPDATE flow_jobs SET status = 'FAILED', step = ?, updatedAt = ? WHERE tenantId = ? AND workflowId = ? AND recordId = ?")
        .run(index, new Date().toISOString(), tenantId, rule.id, record.id);
      if (failCount(db, tenantId, rule.id) >= 5) db.prepare('UPDATE workflows SET active = 0 WHERE id = ?').run(rule.id);
      return;
    }
  }
  db.prepare("UPDATE flow_jobs SET status = 'DONE', step = ?, updatedAt = ? WHERE tenantId = ? AND workflowId = ? AND recordId = ?")
    .run(index, new Date().toISOString(), tenantId, rule.id, record.id);
  logRun(db, tenantId, rule.id, record.id, 'OK', 'Flow finished');
  if (!current()) return;
}

export async function runGraph(helpers, tenantId, rule, record) {
  if (!record || !rule.graph) return false;
  if (!stepsOf(rule).length) return false;
  await execute(helpers.db, helpers, tenantId, rule, record, null);
  return true;
}

export function sweepFlows() {
  if (!ctx) return;
  const due = ctx.db.prepare("SELECT * FROM flow_jobs WHERE status = 'WAITING' AND waitUntil IS NOT NULL AND waitUntil <= ?").all(new Date().toISOString());
  for (const job of due) {
    const rule = ctx.db.prepare('SELECT * FROM workflows WHERE id = ? AND active = 1').get(job.workflowId);
    const record = rule && ctx.one(job.object === 'deal' ? 'deals' : job.object === 'contact' ? 'contacts' : 'leads', job.tenantId, job.recordId);
    if (!rule || !record) continue;
    execute(ctx.db, ctx, job.tenantId, rule, record, job.step).catch(() => {});
  }
  const quiet = ctx.db.prepare("SELECT * FROM flow_jobs WHERE status = 'WAITING_REPLY' AND waitUntil IS NOT NULL AND waitUntil <= ?").all(new Date().toISOString());
  for (const job of quiet) {
    const rule = ctx.db.prepare('SELECT * FROM workflows WHERE id = ? AND active = 1').get(job.workflowId);
    const record = rule && ctx.one(job.object === 'deal' ? 'deals' : job.object === 'contact' ? 'contacts' : 'leads', job.tenantId, job.recordId);
    if (!rule || !record) continue;
    logRun(ctx.db, job.tenantId, job.workflowId, job.recordId, 'OK', 'No reply in time');
    execute(ctx.db, ctx, job.tenantId, rule, record, job.step).catch(() => {});
  }
}

export function resumeReply(tenantId, contactId) {
  if (!ctx || !contactId) return;
  const jobs = ctx.db.prepare("SELECT * FROM flow_jobs WHERE tenantId = ? AND status = 'WAITING_REPLY' AND (contactId = ? OR recordId = ?)").all(tenantId, contactId, contactId);
  for (const job of jobs) {
    const rule = ctx.db.prepare('SELECT * FROM workflows WHERE id = ? AND active = 1').get(job.workflowId);
    const record = rule && ctx.one(job.object === 'deal' ? 'deals' : job.object === 'contact' ? 'contacts' : 'leads', tenantId, job.recordId);
    if (!rule || !record) continue;
    logRun(ctx.db, tenantId, job.workflowId, job.recordId, 'OK', 'Reply arrived');
    execute(ctx.db, ctx, tenantId, rule, record, job.step).catch(() => {});
  }
  ctx.db.prepare("UPDATE sequence_runs SET paused = 1 WHERE tenantId = ? AND dealId IN (SELECT id FROM deals WHERE tenantId = ? AND contactId = ?)").run(tenantId, tenantId, contactId);
}
