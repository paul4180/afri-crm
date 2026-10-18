export class Afri {
  constructor(key, base = '') {
    this.key = key;
    this.base = String(base || '').replace(/\/$/, '');
  }
  async _send(path, body) {
    const res = await fetch(this.base + path, {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: 'Bearer ' + this.key, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || res.statusText);
    return data;
  }
  me() { return this._send('/v1/me'); }
  customers() { return this._send('/v1/customers'); }
  invoices() { return this._send('/v1/invoices'); }
  owing() { return this._send('/v1/owing'); }
  createInvoice(invoice) { return this._send('/v1/invoices', invoice); }
}
