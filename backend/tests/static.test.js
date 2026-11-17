import { describe, it, expect } from 'vitest';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createMemoryRepositories } from './helpers/memoryRepositories.js';

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public');

const app = createApp({
  repositories: createMemoryRepositories(),
  config: {
    jwtSecret: 's', jwtExpiresIn: '1h', corsOrigin: '*',
    uploadDir: path.join(os.tmpdir(), 'tommusic-static'),
    frontendDir: publicDir,
  },
});

describe('front-end estático (public/)', () => {
  it('serve index e login', async () => {
    expect((await request(app).get('/')).status).toBe(200);
    const login = await request(app).get('/login.html');
    expect(login.status).toBe(200);
    expect(login.text).toContain('script.js');
  });

  it('não expõe o código do back-end', async () => {
    expect((await request(app).get('/backend/src/app.js')).status).toBe(404);
    expect((await request(app).get('/package.json')).status).toBe(404);
  });
});