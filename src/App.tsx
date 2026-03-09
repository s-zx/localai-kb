import { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar.js';
import { SearchBar } from './components/SearchBar.js';
import { QAPanel } from './components/QAPanel.js';
import { useEdgeFlow } from './hooks/useEdgeFlow.js';
import { useDocuments } from './hooks/useDocuments.js';
import { useQA } from './hooks/useQA.js';
import type { ProcessingProgress } from './lib/documentProcessor.js';
import { DEFAULT_LABELS } from './lib/documentProcessor.js';

export default function App() {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<ProcessingProgress | null>(null);

  const { status: pipelineStatus, initAll } = useEdgeFlow();
  const { documents, loading: uploadLoading, addDocument, removeDocument } = useDocuments();
  const { query, answers, topChunks, isSearching, error, ask } = useQA();

  const handleFiles = useCallback(async (files: File[]) => {
    // Load models if not yet started
    initAll();

    for (const file of files) {
      try {
        await addDocument(file, DEFAULT_LABELS, (progress) => {
          setUploadProgress(progress);
          if (progress.phase === 'done' || progress.phase === 'error') {
            setTimeout(() => setUploadProgress(null), 2000);
          }
        });
      } catch (err) {
        console.error('Upload failed:', err);
        setUploadProgress(null);
      }
    }
  }, [addDocument, initAll]);

  const handleSearch = useCallback((q: string) => {
    // Kick off model loading if not started
    initAll();
    ask(q);
  }, [ask, initAll]);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg-0)',
    }}>
      {/* Left sidebar */}
      <Sidebar
        documents={documents}
        selectedDocId={selectedDocId}
        onSelectDoc={setSelectedDocId}
        onDeleteDoc={removeDocument}
        onFiles={handleFiles}
        uploadLoading={uploadLoading}
        uploadProgress={uploadProgress}
        pipelineStatus={pipelineStatus}
        onInitModels={initAll}
      />

      {/* Main content area */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--bg-0)',
      }}>
        {/* Top bar */}
        <header style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: 'var(--bg-1)',
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <SearchBar
              onSearch={handleSearch}
              isSearching={isSearching}
              disabled={documents.length === 0}
            />
          </div>
          {documents.length === 0 && (
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-3)',
              whiteSpace: 'nowrap',
              fontStyle: 'italic',
            }}>
              Upload a document to begin
            </div>
          )}
        </header>

        {/* Q&A results area */}
        <QAPanel
          query={query}
          answers={answers}
          topChunks={topChunks}
          isSearching={isSearching}
          error={error}
        />

        {/* Empty state prompt */}
        {!query && !isSearching && documents.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-3)',
              letterSpacing: '0.1em',
            }}>
              {documents.length} {documents.length === 1 ? 'document' : 'documents'} indexed ·
              {' '}ask anything
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
