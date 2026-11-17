// backend/tests/security.test.js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { buildTestContext } from './helpers/setup.js';

describe('segurança básica', () => {
  it('não expõe x-powered-by e envia cabeçalhos do Helmet', async () => {
    const ctx = await buildTestContext();
    const res = await request(ctx.app).get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('rota inexistente da API devolve 404 em JSON', async () => {
    const ctx = await buildTestContext();
    const res = await request(ctx.app).get('/api/nao-existe');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});