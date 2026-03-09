import { useState, useCallback } from 'react';
import { edgeflow } from '../lib/edgeflow.js';
import { searchDocuments } from '../lib/search.js';
import type { SearchResult } from '../lib/vectorStore.js';

export interface QAAnswer {
  answer: string;
  score: number;
  context: string;
  docId: string;
}

export interface QAState {
  query: string;
  answers: QAAnswer[];
  topChunks: SearchResult[];
  isSearching: boolean;
  error: string | null;
}

export function useQA() {
  const [state, setState] = useState<QAState>({
    query: '',
    answers: [],
    topChunks: [],
    isSearching: false,
    error: null,
  });

  const ask = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setState(prev => ({ ...prev, query, isSearching: true, error: null, answers: [], topChunks: [] }));

    try {
      // Step 1: semantic search for top-3 relevant chunks
      const topChunks = await searchDocuments(query, 3);

      if (topChunks.length === 0) {
        setState(prev => ({
          ...prev,
          isSearching: false,
          topChunks: [],
          answers: [],
          error: 'No relevant documents found. Try uploading some documents first.',
        }));
        return;
      }

      // Step 2: run QA concurrently on all top chunks — edgeFlow.js scheduler handles concurrency
      const qa = await edgeflow.getQA();
      const qaResults = await Promise.all(
        topChunks.map(async ({ chunk, score: chunkScore }) => {
          try {
            const result = await qa.run({ question: query, context: chunk.text }) as {
              answer: string;
              score: number;
              start: number;
              end: number;
            };
            return {
              answer: result.answer,
              score: result.score * chunkScore, // combine QA confidence with retrieval score
              context: chunk.text,
              docId: chunk.docId,
            };
          } catch {
            return null;
          }
        })
      );

      const validAnswers = qaResults
        .filter((r): r is QAAnswer => r !== null && r.answer.trim().length > 0)
        .sort((a, b) => b.score - a.score);

      setState(prev => ({
        ...prev,
        isSearching: false,
        topChunks,
        answers: validAnswers,
        error: validAnswers.length === 0 ? 'Could not find a specific answer. Try rephrasing your question.' : null,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        isSearching: false,
        error: err instanceof Error ? err.message : 'Search failed',
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({ query: '', answers: [], topChunks: [], isSearching: false, error: null });
  }, []);

  return { ...state, ask, reset };
}
