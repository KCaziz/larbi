import multer from 'multer';
import { env } from '../config/env.js';
import { TMP_DIR } from '../services/storage.service.js';
import { HttpError } from '../utils/httpError.js';

// Receives ONE file in the multipart field "file" into a temporary directory.
// The real checks (content sniffing, per-kind size limit) happen in
// ingestUpload(); this hard ceiling only stops absurdly large bodies early.
const uploader = multer({
  dest: TMP_DIR,
  defParamCharset: 'utf8',
  limits: {
    files: 1,
    fields: 5,
    fileSize: Math.max(env.maxImageBytes, env.maxDocumentBytes, env.maxVideoBytes),
  },
}).single('file');

export function receiveFile(req, res, next) {
  uploader(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      return next(new HttpError(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400, 'Invalid upload'));
    }
    return next(err);
  });
}
