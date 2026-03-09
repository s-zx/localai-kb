import type { StoredDocument } from '../lib/vectorStore.js';
import type { PipelineState } from '../lib/edgeflow.js';
import type { ProcessingProgress } from '../lib/documentProcessor.js';
import { DocumentCard } from './DocumentCard.js';
import { UploadZone } from './UploadZone.js';
import { ModelStatus } from './ModelStatus.js';

interface Props {
  documents: StoredDocument[];
  selectedDocId: string | null;
  onSelectDoc: (id: string) => void;
  onDeleteDoc: (id: string) => void;
  onFiles: (files: File[]) => void;
  uploadLoading: boolean;
  uploadProgress: ProcessingProgress | null;
  pipelineStatus: PipelineState;
  onInitModels: () => void;
}

export function Sidebar({
  documents,
  selectedDocId,
  onSelectDoc,
  onDeleteDoc,
  onFiles,
  uploadLoading,
  uploadProgress,
  pipelineStatus,
  onInitModels,
}: Props) {
  return (
    <aside style={{
      width: 280,
      flexShrink: 0,
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--bg-1)',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 16px 14px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--amber)',
            letterSpacing: '-0.01em',
          }}>
            localai
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-3)',
            letterSpacing: '0.08em',
          }}>
            KB
          </span>
        </div>
        <div style={{
          marginTop: 2,
          fontSize: 11,
          color: 'var(--text-2)',
          fontStyle: 'italic',
        }}>
          Private · Browser-native AI
        </div>
      </div>

      {/* Model Status */}
      <div style={{ padding: '12px 12px 0' }}>
        <ModelStatus status={pipelineStatus} onInit={onInitModels} />
      </div>

      {/* Upload Zone */}
      <div style={{ padding: '12px 12px 0' }}>
        <UploadZone onFiles={onFiles} disabled={uploadLoading} />

        {uploadProgress && (
          <div style={{
            marginTop: 8,
            padding: '8px 10px',
            background: 'var(--bg-2)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-1)' }}>
                {uploadProgress.message}
              </span>
            </div>
            <div style={{
              height: 3,
              background: 'var(--bg-3)',
              borderRadius: 2,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: uploadProgress.total > 0
                  ? `${(uploadProgress.current / uploadProgress.total) * 100}%`
                  : '0%',
                background: 'var(--amber)',
                borderRadius: 2,
                transition: 'width 300ms ease',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Document List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        {documents.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '24px 0',
            color: 'var(--text-3)',
            fontSize: 12,
            fontStyle: 'italic',
          }}>
            No documents yet
          </div>
        ) : (
          <>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.12em',
              color: 'var(--text-3)',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}>
              {documents.length} {documents.length === 1 ? 'Document' : 'Documents'}
            </div>
            {documents.map(doc => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                isSelected={selectedDocId === doc.id}
                onSelect={onSelectDoc}
                onDelete={onDeleteDoc}
              />
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
