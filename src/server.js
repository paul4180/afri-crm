// ============================================================
// Afri CRM — standalone server (CRM-only, no ERP code)
// Phase 4: extracted from the monolithic afri-erp repo into
// its own repo. This server is ~100 lines vs the 4214-line
// monolith. It does ONLY CRM — no ERP routes, no retail/trades
// packs, no e-invoicing, no payroll, no banking.
// ============================================================

import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerCrm } from './crmapp.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = Fastify({ logger: true });

// JWT for CRM auth (shared secret with ERP for SSO — set JWT_SECRET
// to the same value as the afri-erp service if you want cross-product
// single sign-on).
await app.register(jwt, { secret: process.env.JWT_SECRET || 'dev-secret-change-me-later' });

// Static file serving (crm.html, crm-studio.js, favicon.svg, sdk/)
await app.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/',
  index: false,
});

// Landing page is the whole product's front door — serves landing.html at root /
app.get('/', async (req, reply) => reply.sendFile('landing.html'));
// CRM app stays at /crm (for direct access + ERP cross-links)
app.get('/crm', async (req, reply) => reply.sendFile('crm.html'));
// Privacy Policy + Terms of Service — required by Google OAuth verification
app.get('/privacy', async (req, reply) => reply.sendFile('privacy.html'));
app.get('/terms', async (req, reply) => reply.sendFile('terms.html'));

// ============================================================
// Prisma — optional, for cross-product features only
// If DATABASE_URL is set, use real Prisma to read from the ERP DB
// (User, Tenant, Customer, Invoice tables — for quote→invoice
// creation, People page, tenant name on PDFs, etc.)
// If not set, use a no-op proxy that returns sensible defaults
// (empty arrays, null, 0). The CRM works standalone.
// ============================================================
let prisma = null;
if (process.env.DATABASE_URL) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();
    console.log('Prisma connected to ERP database for cross-product features');
  } catch (e) {
    console.log('Prisma not available — CRM running standalone. Cross-product features will return empty.');
  }
}
if (!prisma) {
  // No-op Prisma proxy — returns empty results for any call
  prisma = new Proxy({}, {
    get() {
      return new Proxy({}, {
        get(_t, method) {
          return async () => {
            if (method === 'findMany') return [];
            if (method === 'count') return 0;
            return null;
          };
        }
      });
    }
  });
}

// Register all 88 CRM API routes (/crm/api/*)
registerCrm(app, prisma);

// Security headers + cache control (same as the ERP service)
app.addHook('onSend', async (req, reply) => {
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  reply.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  const url = req.url || '';
  if (url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.svg') || url.endsWith('.png') || url.endsWith('.ico')) {
    reply.header('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  } else if (url.endsWith('.html') || url === '/' || url === '/crm' || url === '/privacy' || url === '/terms') {
    reply.header('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
  }
});

// Health check (Railway uses this)
app.get('/health', async () => ({ status: 'ok', product: 'crm', version: '1.0.0' }));

// Boot
const start = async () => {
  try {
    const PORT = process.env.PORT || 3000;
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Afri CRM running on port ${PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  start();
}

export { app };
