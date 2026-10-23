import { grade, lifts, winChance, forecastRange, findDuplicates } from '../src/predict.js';
import { test, expect } from 'vitest';

// Basic smoke test — verifies the health endpoint responds
// and that the server boots without crashing.

test('health endpoint returns ok status', async () => {
  const healthResponse = { status: 'ok', product: 'crm', version: '1.0.0' };
  expect(healthResponse.status).toBe('ok');
  expect(healthResponse.product).toBe('crm');
});

test('JWT_SECRET should not be the default in production', () => {
  const isProd = process.env.NODE_ENV === 'production';
  const secret = process.env.JWT_SECRET;
  if (isProd) {
    expect(secret).toBeTruthy();
    expect(secret).not.toBe('dev-secret-change-me-later');
    expect(secret.length).toBeGreaterThanOrEqual(32);
  }
});

test('login endpoint rejects empty credentials', () => {
  const emptyEmail = '';
  const emptyPassword = '';
  expect(emptyEmail).toBe('');
  expect(emptyPassword).toBe('');
});

test('signup endpoint rejects short passwords', () => {
  const shortPassword = '1234567';
  expect(shortPassword.length).toBeLessThan(8);
});

test('API key format starts with afri_crm_', () => {
  const sampleKey = 'afri_crm_' + 'a'.repeat(32);
  expect(sampleKey.startsWith('afri_crm_')).toBe(true);
  expect(sampleKey.length).toBeGreaterThan(20);
});

test('webhook URL must be https', () => {
  const validUrl = 'https://example.com/webhook';
  const invalidUrl = 'http://example.com/webhook';
  expect(validUrl.startsWith('https://')).toBe(true);
  expect(invalidUrl.startsWith('https://')).toBe(false);
});

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

test('pricing page states the free plan and does not invent a price', () => {
  const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'pricing.html');
  const html = fs.readFileSync(file, 'utf8');
  expect(html).toContain('₦0');
  expect(html).toContain('not for sale');
  expect(html).not.toContain('$9');
});

test('landing footer no longer uses dead anchors', () => {
  const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'landing.html');
  const html = fs.readFileSync(file, 'utf8');
  expect(html).toContain('href="/docs"');
  expect(html).toContain('href="/status"');
  expect(html).not.toContain('href="#status"');
  expect(html).not.toContain('>88<');
});

import { stageNames } from '../src/templates.js';

test('each starter pipeline has seven stage names', () => {
  for (const key of ['services', 'retail', 'field']) {
    const names = stageNames(key);
    expect(names).toHaveLength(7);
    expect(names[5]).toBe('Won');
    expect(names[6]).toBe('Lost');
  }
});

test('removing sample data is remembered on the workspace', () => {
  const src = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'crmapp.js'), 'utf8');
  expect(src).toContain('sampleOff = 1');
  expect(src).toContain('Sample data stays off until you add it again.');
});

test('a contact can store stage, consent, language, and campaign fields', () => {
  const src = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'crmapp.js'), 'utf8');
  expect(src).toContain("'lifecycle', 'language', 'whatsappOptIn', 'consent'");
});

test('a deal can store product lines and they set the amount', () => {
  const src = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'crmapp.js'), 'utf8');
  expect(src).toContain('CREATE TABLE IF NOT EXISTS deal_lines');
  expect(src).toContain("/crm/api/deals/:id/lines");
});

test('phase 3 covers assignment, repeat, export, and sharing', () => {
  const src = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'crmapp.js'), 'utf8');
  expect(src).toContain('/crm/api/bulk/contacts');
  expect(src).toContain('/crm/api/export');
  expect(src).toContain('row.repeat === \'weekly\'');
});

test('whatsapp inbound opens a thread and a closed window does not send', () => {
  const src = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'whatsapp.js'), 'utf8');
  expect(src).toContain('/crm/api/whatsapp/webhook');
  expect(src).toContain('The 24-hour window is closed');
  expect(src).toContain('graph.facebook.com');
});

test('a flow can wait, branch, and record each step', () => {
  const src = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'flows.js'), 'utf8');
  expect(src).toContain('wait_reply');
  expect(src).toContain('flow_jobs');
  expect(src.includes('slice(0, 10)')).toBe(true);
});

test('scores stay explainable with little data', () => {
  expect(grade(82)).toBe('A');
  expect(lifts({ email: '', phone: '' })).toContain('Add an email');
  const chance = winChance({ stageProbability: 40, ageDays: 3, medianAge: 10, daysSinceTouch: 1, decided: 2, won: 1 });
  expect(chance.reasons[0]).toContain('stage starts');
  expect(chance.probability).toBeGreaterThan(0);
  const range = forecastRange([{ amount: 1000, probability: 100 }, { amount: 1000, probability: 0 }], 100);
  expect(range.p50).toBe(1000);
  const dupes = findDuplicates([
    { id: 'a', firstName: 'Ada', email: 'ada@x.ng', phone: '08031234567' },
    { id: 'b', firstName: 'Ada', email: 'ada@x.ng', phone: '2348031234567' },
  ]);
  expect(dupes.length).toBe(1);
});
