import type { PipelineState, PipelineStatus } from '../lib/edgeflow.js';

interface Props {
  status: PipelineState;
  onInit: () => void;
}

const MODEL_LABELS: Record<keyof PipelineState, { name: string; desc: string }> = {
  extractor: { name: 'all-MiniLM-L6-v2', desc: 'Semantic embeddings' },
  classifier: { name: 'distilbart-mnli', desc: 'Topic classifier' },
  qa: { name: 'distilbert-squad', desc: 'Question answering' },
};

function StatusDot({ status }: { status: PipelineStatus }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 7,
        height: 7,
        borderRadius: '50%',
        flexShrink: 0,
        background:
          status === 'ready'    ? 'var(--green)'  :
          status === 'loading'  ? 'var(--amber)'  :
          status === 'error'    ? 'var(--red)'    : 'var(--text-3)',
        animation: status === 'loading' ? 'pulse-amber 1.4s ease-in-out infinite' : undefined,
        boxShadow: status === 'ready' ? '0 0 6px var(--green-dim)' : undefined,
      }}
    />
  );
}

export function ModelStatus({ status, onInit }: Props) {
  const anyIdle = Object.values(status).some(s => s === 'idle');
  const allReady = Object.values(status).every(s => s === 'ready');

  return (
    <div style={{
      padding: '12px 14px',
      background: 'var(--bg-2)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.12em',
          color: 'var(--text-2)',
          textTransform: 'uppercase',
        }}>
          AI Models
        </span>
        {anyIdle && (
          <button
            onClick={onInit}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              background: 'var(--amber-glow)',
              color: 'var(--amber)',
              border: '1px solid var(--amber-dim)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 8px',
              cursor: 'pointer',
              letterSpacing: '0.06em',
            }}
          >
            Load Models
          </button>
        )}
        {allReady && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--green)',
            letterSpacing: '0.06em',
          }}>
            ● All Ready
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {(Object.entries(MODEL_LABELS) as [keyof PipelineState, { name: string; desc: string }][]).map(
          ([key, { name, desc }]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <StatusDot status={status[key]} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: status[key] === 'ready' ? 'var(--text-0)' : 'var(--text-2)',
                }}>
                  {name}
                </span>
                <span style={{
                  marginLeft: 6,
                  fontSize: 11,
                  color: 'var(--text-3)',
                  fontStyle: 'italic',
                }}>
                  {desc}
                </span>
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                {status[key]}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
