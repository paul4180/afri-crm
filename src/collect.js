import crypto from 'crypto';

export function splitCsvLine(line) {
  const cells = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { cells.push(field.trim()); field = ''; }
    else field += char;
  }
  cells.push(field.trim());
  return cells;
}

export function parseStatement(text) {
  const lines = String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return [];
  const header = splitCsvLine(lines[0]).map((cell) => cell.toLowerCase());
  const at = (...names) => names.map((name) => header.indexOf(name)).find((index) => index >= 0);
  const dateAt = at('date', 'txn date', 'transaction date', 'value date');
  const descAt = at('description', 'narration', 'details', 'remark', 'remarks');
  const refAt = at('reference', 'ref', 'transaction ref');
  const amountAt = at('amount');
  const debitAt = at('debit', 'withdrawal', 'dr');
  const creditAt = at('credit', 'deposit', 'cr');
  const headed = [dateAt, descAt, amountAt, debitAt, creditAt].some((index) => index >= 0);
  const rows = [];
  for (const line of lines.slice(headed ? 1 : 0)) {
    const cells = splitCsvLine(line);
    const description = descAt >= 0 ? cells[descAt] : cells[1] || '';
    const reference = refAt >= 0 ? cells[refAt] : '';
    let amount = 0;
    if (amountAt >= 0) amount = Number(String(cells[amountAt] || '').replace(/[,₦\s]/g, ''));
    else {
      const credit = Number(String(cells[creditAt] || '').replace(/[,₦\s]/g, '')) || 0;
      const debit = Number(String(cells[debitAt] || '').replace(/[,₦\s]/g, '')) || 0;
      amount = credit > 0 ? credit : -Math.abs(debit);
    }
    if (!description || !Number.isFinite(amount) || amount === 0) continue;
    const rawDate = dateAt >= 0 ? cells[dateAt] : cells[0];
    const date = rawDate && !Number.isNaN(new Date(rawDate).getTime()) ? new Date(rawDate) : new Date();
    rows.push({ date, description, reference: reference || null, amount });
  }
  return rows;
}

export function matchOpenInvoice(invoices, amount, text) {
  const hay = String(text || '').toUpperCase();
  const named = invoices.find((invoice) => hay.includes(String(invoice.number).toUpperCase()));
  if (named) {
    const due = Number(named.total) * (named.fxRate || 1);
    return Math.abs(due - amount) < 1 ? named : null;
  }
  const exact = invoices.filter((invoice) => Math.abs(Number(invoice.total) * (invoice.fxRate || 1) - amount) < 1);
  return exact.length === 1 ? exact[0] : null;
}

export function connectionStatus() {
  return {
    paystack: Boolean(process.env.PAYSTACK_SECRET_KEY),
    flutterwave: Boolean(process.env.FLUTTERWAVE_SECRET_KEY),
    whatsapp: Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID),
    email: Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM),
  };
}

async function paystack(path, body) {
  const res = await fetch('https://api.paystack.co' + path, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return data.status ? data.data : null;
}

export async function ensureCollectAccount(prisma, customer, tenant) {
  if (!process.env.PAYSTACK_SECRET_KEY) return null;
  if (customer.collectAccount) return { accountNumber: customer.collectAccount, bankName: customer.collectBank || 'Paystack' };
  let code = customer.paystackCode;
  if (!code) {
    const email = customer.email || `billing+${customer.id.slice(0, 8)}@customers.afrios.test`;
    const created = await paystack('/customer', { email, first_name: String(customer.name || 'Customer').slice(0, 40), phone: customer.phone || undefined });
    code = created?.customer_code;
    if (!code) return null;
    await prisma.customer.update({ where: { id: customer.id }, data: { paystackCode: code } });
  }
  const account = await paystack('/dedicated_account', { customer: code, preferred_bank: process.env.PAYSTACK_BANK || 'test-bank' });
  const number = account?.account_number;
  const bank = account?.bank?.name || 'Paystack';
  if (!number) return null;
  await prisma.customer.update({ where: { id: customer.id }, data: { collectAccount: number, collectBank: bank } });
  return { accountNumber: number, bankName: bank };
}

export async function sendWhatsApp(to, body) {
  if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_ID || !to) return false;
  const res = await fetch('https://graph.facebook.com/v21.0/' + process.env.WHATSAPP_PHONE_ID + '/messages', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.WHATSAPP_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: String(body).slice(0, 4000) } }),
  });
  return res.ok;
}

export async function sendMail({ to, subject, text }) {
  if (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM || !to) return false;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.MAIL_FROM, to: [to], subject, text }),
  });
  return res.ok;
}

export async function flutterwaveLink({ email, amount, txRef, redirect, name }) {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secret) return null;
  const res = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + secret, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tx_ref: txRef,
      amount,
      currency: 'NGN',
      redirect_url: redirect,
      customer: { email, name },
      meta: { invoiceId: txRef },
      customizations: { title: 'Afri OS', description: 'Bill ' + txRef },
    }),
  });
  const data = await res.json().catch(() => ({}));
  return data.status === 'success' ? data.data?.link : null;
}

export async function flutterwaveVerify(id) {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secret || !id) return null;
  const res = await fetch('https://api.flutterwave.com/v3/transactions/' + encodeURIComponent(id) + '/verify', {
    headers: { Authorization: 'Bearer ' + secret },
  });
  const data = await res.json().catch(() => ({}));
  if (data.status !== 'success' || data.data?.status !== 'successful') return null;
  return data.data;
}

export function flutterwaveHashOk(header) {
  const expected = process.env.FLUTTERWAVE_HASH;
  if (!expected) return false;
  const given = String(header || '');
  const left = Buffer.from(given);
  const right = Buffer.from(expected);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
