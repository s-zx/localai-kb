import { useState, useCallback, useEffect } from 'react';
import { vectorStore, type StoredDocument } from '../lib/vectorStore.js';
import { processDocument, type ProgressCallback } from '../lib/documentProcessor.js';

export function useDocuments() {
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const docs = await vectorStore.getAllDocuments();
      docs.sort((a, b) => b.addedAt - a.addedAt);
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addDocument = useCallback(async (
    file: File,
    labels: string[],
    onProgress?: ProgressCallback
  ) => {
    setLoading(true);
    setError(null);
    try {
      await processDocument(file, labels, onProgress);
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process document';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const removeDocument = useCallback(async (docId: string) => {
    try {
      await vectorStore.deleteDocument(docId);
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete document';
      setError(message);
    }
  }, [refresh]);

  return { documents, loading, error, addDocument, removeDocument, refresh };
}
