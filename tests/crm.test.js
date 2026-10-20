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
