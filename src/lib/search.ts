import { edgeflow } from './edgeflow.js';
import { vectorStore, type SearchResult } from './vectorStore.js';

export async function searchDocuments(query: string, topK = 5): Promise<SearchResult[]> {
  const extractor = await edgeflow.getExtractor();
  const embedResult = await extractor.run(query) as { embeddings: number[] };
  return vectorStore.search(embedResult.embeddings, topK);
}
