import fs from 'node:fs';
import { put, del } from '@vercel/blob';

// Só usa o Blob quando o token existe (produção). Local e testes usam disco.
export const blobEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

// Envia o arquivo que o multer gravou em disco para o Blob e apaga a cópia local.
export async function saveAvatarToBlob(file) {
  const body = await fs.promises.readFile(file.path);
  const { url } = await put(`avatars/${file.filename}`, body, {
    access: 'public',
    contentType: file.mimetype,
  });
  await fs.promises.unlink(file.path).catch(() => {});
  return url;
}

export async function removeBlob(url) {
  if (!url?.startsWith('https://')) return;
  await del(url).catch(() => {});
}