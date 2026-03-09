import { edgeflow } from './edgeflow.js';
import { vectorStore, type StoredChunk, type StoredDocument } from './vectorStore.js';

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

export const DEFAULT_LABELS = [
  'technology',
  'science',
  'business',
  'health',
  'history',
  'law',
  'personal',
  'other',
];

export interface ProcessingProgress {
  phase: 'parsing' | 'chunking' | 'embedding' | 'classifying' | 'saving' | 'done' | 'error';
  current: number;
  total: number;
  message: string;
}

export type ProgressCallback = (progress: ProcessingProgress) => void;

function splitIntoChunks(text: string): string[] {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + CHUNK_SIZE, words.length);
    const chunk = words.slice(start, end).join(' ');
    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }
    if (end >= words.length) break;
    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}

async function readFileAsText(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    return readPDFAsText(file);
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

async function readPDFAsText(file: File): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjsLib: any = await import('pdfjs-dist');

  // Point the worker at the static file copied to public/pdf/
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf/pdf.worker.min.mjs';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pageText = (content.items as any[])
      .filter((item: any) => typeof item.str === 'string')
      .map((item: any) => item.str as string)
      .join(' ');
    textParts.push(pageText);
  }
  return textParts.join('\n\n');
}

export async function processDocument(
  file: File,
  labels: string[] = DEFAULT_LABELS,
  onProgress?: ProgressCallback
): Promise<StoredDocument> {
  const docId = `doc_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  const report = (phase: ProcessingProgress['phase'], current: number, total: number, message: string) => {
    onProgress?.({ phase, current, total, message });
  };

  // Phase 1: Parse the file
  report('parsing', 0, 1, `Reading ${file.name}...`);
  const rawText = await readFileAsText(file);

  // Phase 2: Chunk the text
  report('chunking', 0, 1, 'Splitting text into chunks...');
  const rawChunks = splitIntoChunks(rawText);
  const total = rawChunks.length;

  if (total === 0) {
    throw new Error('No text content found in document');
  }

  // Phase 3: Concurrent embed + classify for each chunk
  // Load pipelines in parallel before processing
  const [extractor, classifier] = await Promise.all([
    edgeflow.getExtractor(),
    edgeflow.getClassifier(),
  ]);

  const storedChunks: StoredChunk[] = [];
  let processed = 0;

  // Process in batches of 4 to avoid overwhelming the scheduler
  const BATCH_SIZE = 4;
  for (let i = 0; i < rawChunks.length; i += BATCH_SIZE) {
    const batch = rawChunks.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(
      batch.map(async (chunkText, batchIdx) => {
        const chunkIndex = i + batchIdx;
        report('embedding', chunkIndex, total, `Processing chunk ${chunkIndex + 1}/${total}...`);

        // Run embed + classify concurrently for each chunk — this is the edgeFlow.js showcase
        const [embedResult, classifyResult] = await Promise.all([
          extractor.run(chunkText) as Promise<{ embeddings: number[] }>,
          classifier.classify(chunkText, labels),
        ]);

        const embedding = embedResult.embeddings ?? [];
        const classifyFirst = Array.isArray(classifyResult) ? classifyResult[0] : classifyResult;
        const category = classifyFirst?.labels?.[0] ?? 'other';

        const chunk: StoredChunk = {
          id: `chunk_${docId}_${chunkIndex}`,
          docId,
          text: chunkText,
          embedding,
          category,
          chunkIndex,
        };

        processed++;
        report('classifying', processed, total, `Processed ${processed}/${total} chunks`);
        return chunk;
      })
    );

    storedChunks.push(...batchResults);
  }

  // Phase 4: Save to IndexedDB
  report('saving', 0, 1, 'Saving to local database...');

  const doc: StoredDocument = {
    id: docId,
    name: file.name,
    addedAt: Date.now(),
    chunkCount: storedChunks.length,
    fileSize: file.size,
  };

  await vectorStore.addDocument(doc);
  await vectorStore.addChunks(storedChunks);

  report('done', total, total, `"${file.name}" indexed successfully (${storedChunks.length} chunks)`);

  return doc;
}
