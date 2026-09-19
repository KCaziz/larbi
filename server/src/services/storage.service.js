import { randomBytes } from 'node:crypto';
import { mkdirSync, promises as fs } from 'node:fs';
import path from 'node:path';
import { fileTypeFromFile } from 'file-type';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

// Private media storage (shared by the CMS: formations now, articles later).
//
// Security model:
// - The real file type is sniffed from the file CONTENT. The client-supplied
//   name / Content-Type are never trusted.
// - The stored name is random and its extension comes from the sniffed type,
//   so a hostile file name can neither traverse directories nor smuggle an
//   executable extension.
// - Files live in storageDir, which is not served statically. They are only
//   reachable through authorised API routes.
// - SVG and HTML are deliberately NOT allowed (script execution vector).

export const PRIVATE_DIR = path.join(env.storageDir, 'private');
export const TMP_DIR = path.join(env.storageDir, 'tmp');
mkdirSync(PRIVATE_DIR, { recursive: true });
mkdirSync(TMP_DIR, { recursive: true });

const ALLOWED_TYPES = {
  'image/jpeg': { kind: 'image', ext: 'jpg' },
  'image/png': { kind: 'image', ext: 'png' },
  'image/webp': { kind: 'image', ext: 'webp' },
  'application/pdf': { kind: 'document', ext: 'pdf' },
  'video/mp4': { kind: 'video', ext: 'mp4' },
  'video/webm': { kind: 'video', ext: 'webm' },
};

const MAX_BYTES = {
  image: env.maxImageBytes,
  document: env.maxDocumentBytes,
  video: env.maxVideoBytes,
};

const KEY_PATTERN = /^[a-f0-9]{32}\.[a-z0-9]{2,4}$/;

export function cleanOriginalName(name) {
  return (
    path
      .basename(String(name ?? 'file'))
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001f\u007f]/g, '')
      .slice(0, 200) || 'file'
  );
}

export async function discardTemp(file) {
  if (file?.path) await fs.unlink(file.path).catch(() => {});
}

// Validates an uploaded temp file and moves it into private storage.
// `allowedKinds` restricts what this particular endpoint accepts.
export async function ingestUpload(file, allowedKinds) {
  if (!file) throw new HttpError(400, 'No file received');
  try {
    const sniffed = await fileTypeFromFile(file.path);
    const type = sniffed && ALLOWED_TYPES[sniffed.mime];
    if (!type || !allowedKinds.includes(type.kind)) {
      throw new HttpError(415, 'Unsupported file type');
    }
    if (file.size > MAX_BYTES[type.kind]) {
      throw new HttpError(413, 'File too large');
    }

    const storageKey = `${randomBytes(16).toString('hex')}.${type.ext}`;
    await fs.rename(file.path, path.join(PRIVATE_DIR, storageKey));
    return {
      kind: type.kind,
      mimeType: sniffed.mime,
      storageKey,
      sizeBytes: file.size,
      originalName: cleanOriginalName(file.originalname),
    };
  } catch (err) {
    await discardTemp(file);
    throw err;
  }
}

export function pathForKey(storageKey) {
  if (!KEY_PATTERN.test(storageKey)) throw new HttpError(500, 'Invalid storage key');
  return path.join(PRIVATE_DIR, storageKey);
}

// Best effort: a missing file must never break a database operation.
export async function removeStored(storageKeys) {
  await Promise.all(
    storageKeys.filter((k) => KEY_PATTERN.test(k)).map((k) => fs.unlink(path.join(PRIVATE_DIR, k)).catch(() => {})),
  );
}
