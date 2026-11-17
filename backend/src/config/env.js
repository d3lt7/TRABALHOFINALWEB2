import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Raiz do repositório (este arquivo fica em backend/src/config/).
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
dotenv.config({ path: path.join(root, '.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const onVercel = Boolean(process.env.VERCEL);

if (nodeEnv === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET é obrigatório em produção.');
}

export const env = {
  nodeEnv,
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-apenas-para-desenvolvimento',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  // Na Vercel só /tmp é gravável. Localmente usa backend/uploads.
  uploadDir: process.env.UPLOAD_DIR || (onVercel ? '/tmp/uploads' : path.join(root, 'backend', 'uploads')),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  // Na Vercel os arquivos estáticos são servidos pela CDN, não pelo Express.
 frontendDir: onVercel ? null : (process.env.FRONTEND_DIR || path.join(root, 'public')),
};