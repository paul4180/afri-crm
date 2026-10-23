export function grade(score) {
  const n = Number(score) || 0;
  if (n >= 80) return 'A';
  if (n >= 60) return 'B';
  if (n >= 40) return 'C';
  return 'D';
}

export function lifts(lead) {
  const tips = [];
  if (!lead.email) tips.push('Add an email');
  if (!lead.phone && !lead.mobile) tips.push('Add a phone number');
  if (!lead.companyName && !lead.companyId) tips.push('Add a company');
  return tips.slice(0, 3);
}

export function winChance({ stageProbability, ageDays, medianAge, daysSinceTouch, decided, won }) {
  let chance = Math.min(95, Math.max(5, Number(stageProbability || 20)));
  const reasons = ['The stage starts at ' + Math.round(chance) + '%'];
  const closed = Number(decided) || 0;
  if (closed >= 5) {
    const rate = (Number(won) || 0) / closed;
    chance = chance * 0.5 + rate * 100 * 0.5;
    reasons.push('This workspace has closed ' + won + ' of ' + closed + ' deals');
  } else {
    reasons.push('Fewer than 5 closed deals, so the stage percent still leads');
  }
  if (medianAge && ageDays > medianAge * 1.5) {
    chance *= 0.8;
    reasons.push('Older than most open deals in this stage');
  }
  if (Number(daysSinceTouch) > 14) {
    chance *= 0.85;
    reasons.push('No logged work for ' + daysSinceTouch + ' days');
  }
  const probability = Math.max(1, Math.min(99, Math.round(chance)));
  const days = Math.max(7, Math.round((medianAge || 21) * (1.4 - probability / 200)));
  return { probability, reasons: reasons.slice(0, 3), days };
}

export function forecastRange(deals, runs = 4000) {
  const list = Array.isArray(deals) ? deals : [];
  const weighted = Math.round(list.reduce((sum, row) => sum + Number(row.amount || 0) * (Number(row.probability) || 0) / 100, 0));
  const samples = [];
  for (let i = 0; i < runs; i += 1) {
    let total = 0;
    for (const row of list) if (Math.random() < (Number(row.probability) || 0) / 100) total += Number(row.amount || 0);
    samples.push(total);
  }
  samples.sort((a, b) => a - b);
  const at = (q) => Math.round(samples[Math.min(samples.length - 1, Math.max(0, Math.floor(q * (samples.length - 1))))] || 0);
  return { weighted, p10: at(0.1), p50: at(0.5), p90: at(0.9), runs: list.length ? runs : 0 };
}

export function phoneTail(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('234') && digits.length > 10) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(-10);
}

export function companyKey(name) {
  return String(name || '').toLowerCase().replace(/\b(ltd|limited|plc|nig|nigeria|inc|llc|co)\b/g, '').replace(/[^a-z0-9]/g, '');
}

export function findDuplicates(contacts) {
  const rows = (contacts || []).slice(0, 400);
  const pairs = [];
  for (let i = 0; i < rows.length; i += 1) {
    for (let j = i + 1; j < rows.length; j += 1) {
      const a = rows[i];
      const b = rows[j];
      let score = 0;
      const why = [];
      if (a.email && b.email && String(a.email).toLowerCase() === String(b.email).toLowerCase()) { score += 90; why.push('same email'); }
      const pa = phoneTail(a.phone || a.mobile);
      const pb = phoneTail(b.phone || b.mobile);
      if (pa && pa.length >= 7 && pa === pb) { score += 80; why.push('same phone'); }
      const ca = companyKey(a.companyName || a.lastName);
      const cb = companyKey(b.companyName || b.lastName);
      const na = String(a.firstName || '').toLowerCase();
      const nb = String(b.firstName || '').toLowerCase();
      if (na && na === nb && ca && ca === cb) { score += 70; why.push('same name and company'); }
      if (score >= 70) pairs.push({ a: a.id, b: b.id, score: Math.min(100, score), why });
    }
  }
  pairs.sort((x, y) => y.score - x.score);
  return pairs.slice(0, 30);
}

export function bestHour(times) {
  const counts = {};
  for (const value of times || []) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) continue;
    const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', hour: 'numeric', hourCycle: 'h23' }).format(date));
    counts[hour] = (counts[hour] || 0) + 1;
  }
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (!ranked.length || ranked[0][1] < 3) return { hour: 10, known: false };
  return { hour: Number(ranked[0][0]), known: true };
}
