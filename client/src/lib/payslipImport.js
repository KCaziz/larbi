// Reading a payslip file IN THE BROWSER (P8-30): the text of a PDF, or the text of
// a photo. The file never leaves the person's machine — nothing is uploaded,
// nothing is kept — which is the whole point of doing it here: a payslip is the
// most personal document of the application.
//
// Both readers are loaded ONLY when a file is chosen (dynamic imports), so the
// application pays nothing for them otherwise. The OCR engine, its worker and the
// French language data are served from this site (`/ocr`), never from a third
// party.
//
// A reader that finds nothing says so (an empty text); the screen then falls back
// to the manual entry. A guessed salary is never an acceptable answer.
const MIN_TEXT = 20;

/** Lines of text from a PDF's text layer, in reading order. */
async function readPdf(file) {
  const pdfjs = await import('pdfjs-dist/build/pdf.min.mjs');
  const worker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = worker;
  const document = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const lines = [];
  for (let number = 1; number <= Math.min(document.numPages, 4); number += 1) {
    // eslint-disable-next-line no-await-in-loop -- pages in order
    const page = await document.getPage(number);
    // eslint-disable-next-line no-await-in-loop
    const content = await page.getTextContent();
    // Items on the same baseline are one line, left to right.
    const rows = new Map();
    for (const item of content.items) {
      if (!item.str || !item.str.trim()) continue;
      const y = Math.round(item.transform[5] / 3);
      rows.set(y, [...(rows.get(y) ?? []), { x: item.transform[4], text: item.str }]);
    }
    const ordered = [...rows.entries()].sort((a, b) => b[0] - a[0]);
    for (const [, items] of ordered) lines.push(items.sort((a, b) => a.x - b.x).map((item) => item.text).join('  '));
  }
  return lines.join('\n');
}

/** The text of a photo, by optical character recognition, all in the browser. */
async function readImage(file, onProgress) {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('fra', 1, {
    workerPath: '/ocr/worker.min.js',
    corePath: '/ocr',
    langPath: '/ocr',
    gzip: true,
    logger: (message) => {
      if (message.status === 'recognizing text' && typeof message.progress === 'number') onProgress?.(message.progress);
    },
  });
  try {
    const { data } = await worker.recognize(file);
    return data.text ?? '';
  } finally {
    await worker.terminate();
  }
}

/**
 * `{ text, source }` for a PDF or an image; `text` is '' when nothing legible was
 * found (a scanned PDF has no text layer: the person is told to send a photo of
 * it instead, rather than the app pretending to read it).
 */
export async function readPayslipFile(file, { onProgress } = {}) {
  if (file.type === 'application/pdf') {
    const text = await readPdf(file);
    return { text: text.trim().length >= MIN_TEXT ? text : '', source: 'pdf', scanned: text.trim().length < MIN_TEXT };
  }
  if (file.type.startsWith('image/')) {
    const text = await readImage(file, onProgress);
    return { text: text.trim().length >= MIN_TEXT ? text : '', source: 'image', scanned: false };
  }
  return { text: '', source: 'other', scanned: false };
}
