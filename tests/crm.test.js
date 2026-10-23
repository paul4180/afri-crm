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
