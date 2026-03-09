import { useState, useEffect } from 'react';
import { edgeflow, type PipelineState } from '../lib/edgeflow.js';

export function useEdgeFlow() {
  const [status, setStatus] = useState<PipelineState>(edgeflow.status);

  useEffect(() => {
    const unsubscribe = edgeflow.onStatusChange(setStatus);
    return unsubscribe;
  }, []);

  const isReady =
    status.extractor === 'ready' &&
    status.classifier === 'ready' &&
    status.qa === 'ready';

  const isLoading =
    status.extractor === 'loading' ||
    status.classifier === 'loading' ||
    status.qa === 'loading';

  const hasError =
    status.extractor === 'error' ||
    status.classifier === 'error' ||
    status.qa === 'error';

  function initAll() {
    edgeflow.initAll().catch(console.error);
  }

  return { status, isReady, isLoading, hasError, initAll };
}
