import type { StoredDocument } from '../lib/vectorStore.js';

interface Props {
  doc: StoredDocument;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function DocumentCard({ doc, isSelected, onSelect, onDelete }: Props) {
  const ext = doc.name.split('.').pop()?.toUpperCase() ?? 'FILE';

  return (
    <div
      onClick={() => onSelect(doc.id)}
      style={{
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${isSelected ? 'var(--amber-dim)' : 'var(--border)'}`,
        background: isSelected ? 'var(--amber-glow)' : 'transparent',
        cursor: 'pointer',
        transition: 'all var(--transition)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        animation: 'fadeIn 200ms ease forwards',
      }}
      onMouseEnter={e => {
        if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-hover)';
      }}
      onMouseLeave={e => {
        if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
      }}
    >
      {/* File type badge */}
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.05em',
        color: isSelected ? 'var(--amber)' : 'var(--text-2)',
        background: isSelected ? 'var(--amber-glow-strong)' : 'var(--bg-3)',
        border: `1px solid ${isSelected ? 'var(--amber-dim)' : 'var(--border)'}`,
        borderRadius: 3,
        padding: '2px 5px',
        flexShrink: 0,
        marginTop: 1,
      }}>
        {ext}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13,
          color: 'var(--text-0)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: 1.4,
        }}>
          {doc.name}
        </div>
        <div style={{
          marginTop: 3,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-2)',
          display: 'flex',
          gap: 8,
        }}>
          <span>{doc.chunkCount} chunks</span>
          <span style={{ color: 'var(--text-3)' }}>·</span>
          <span>{formatBytes(doc.fileSize)}</span>
          <span style={{ color: 'var(--text-3)' }}>·</span>
          <span>{formatDate(doc.addedAt)}</span>
        </div>
      </div>

      <button
        onClick={e => { e.stopPropagation(); onDelete(doc.id); }}
        title="Delete document"
        style={{
          flexShrink: 0,
          width: 20,
          height: 20,
          border: 'none',
          background: 'transparent',
          color: 'var(--text-3)',
          cursor: 'pointer',
          borderRadius: 3,
          fontSize: 14,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color var(--transition)',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
      >
        ×
      </button>
    </div>
  );
}
