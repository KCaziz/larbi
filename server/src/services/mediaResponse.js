import { MEDIA_KIND } from '../constants/elearning.js';
import { pathForKey } from './storage.service.js';

// Streams a stored file to the client (Range requests supported, so videos can
// be seeked). CALLERS MUST HAVE CHECKED PERMISSIONS FIRST: this function only
// sends. Shared by the admin preview and the learner routes.
//
// Headers: the type comes from our own database (sniffed at upload), documents
// are forced to download, and the CSP/sandbox stops any embedded content from
// running scripts even if a browser tried to render it.
export function sendStoredMedia(res, media, { cache = 'private, no-store' } = {}) {
  const asAttachment = media.kind === MEDIA_KIND.DOCUMENT;
  res.sendFile(
    pathForKey(media.storageKey),
    {
      headers: {
        'Content-Type': media.mimeType,
        'Content-Disposition': `${asAttachment ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(media.originalName)}`,
        'Cache-Control': cache,
        'Content-Security-Policy': "default-src 'none'; sandbox",
      },
    },
    (err) => {
      if (err && !res.headersSent) res.status(404).json({ error: { message: 'File not found' } });
    },
  );
}
