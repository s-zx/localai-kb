import type { PipelineState, PipelineStatus } from '../lib/edgeflow.js';

interface Props {
  status: PipelineState;
  onInit: () => void;
}

const MODEL_INFO: Record<keyof PipelineState, { name: string; desc: string; size: string }> = {
  extractor: { name: 'all-MiniLM-L6-v2', desc: 'Semantic search',   size: '23 MB'  },
  classifier: { name: 'nli-deberta-v3-small', desc: 'Topic tagging', size: '88 MB'  },
  qa:         { name: 'distilbert-squad',  desc: 'Question answering', size: '67 MB'  },
};

function StatusDot({ status }: { status: PipelineStatus }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 7,
      height: 7,
      borderRadius: '50%',
      flexShrink: 0,
      background:
        status === 'ready'   ? 'var(--green)' :
        status === 'loading' ? 'var(--amber)' :
        status === 'error'   ? 'var(--red)'   : 'var(--text-3)',
      animation: status === 'loading' ? 'pulse-amber 1.4s ease-in-out infinite' : undefined,
      boxShadow: status === 'ready' ? '0 0 6px var(--green-dim)' : undefined,
    }} />
  );
}

function StatusLabel({ status, size }: { status: PipelineStatus; size: string }) {
  if (status === 'ready') return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--green)', letterSpacing: '0.06em' }}>
      cached
    </span>
  );
  if (status === 'loading') return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--amber)', letterSpacing: '0.06em' }}>
      {size} ↓
    </span>
  );
  if (status === 'error') return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--red)', letterSpacing: '0.06em' }}>
      error
    </span>
  );
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.06em' }}>
      {size}
    </span>
  );
}

export function ModelStatus({ status, onInit }: Props) {
  const allIdle    = Object.values(status).every(s => s === 'idle');
  const allReady   = Object.values(status).every(s => s === 'ready');
  const anyLoading = Object.values(status).some(s => s === 'loading');
  const anyError   = Object.values(status).some(s => s === 'error');

  return (
    <div style={{
      padding: '12px 14px',
      background: 'var(--bg-2)',
      borderRadius: 'var(--radius-md)',
      border: `1px solid ${allReady ? 'rgba(100,200,130,0.2)' : 'var(--border)'}`,
      transition: 'border-color 0.4s ease',
    }}>
      {/* Header row */}
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

        {allIdle && (
          <button onClick={onInit} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            background: 'var(--amber-glow)',
            color: 'var(--amber)',
            border: '1px solid var(--amber-dim)',
            borderRadius: 'var(--radius-sm)',
            padding: '3px 9px',
            cursor: 'pointer',
            letterSpacing: '0.06em',
          }}>
            Load Models
          </button>
        )}
        {anyLoading && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--amber)',
            letterSpacing: '0.06em',
          }}>
            downloading…
          </span>
        )}
        {allReady && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--green)', letterSpacing: '0.06em' }}>
            ● ready
          </span>
        )}
        {anyError && !anyLoading && (
          <button onClick={onInit} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            background: 'rgba(232, 96, 96, 0.08)',
            color: 'var(--red)',
            border: '1px solid rgba(232, 96, 96, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '3px 9px',
            cursor: 'pointer',
            letterSpacing: '0.06em',
          }}>
            Retry
          </button>
        )}
      </div>

      {/* Model rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {(Object.entries(MODEL_INFO) as [keyof PipelineState, typeof MODEL_INFO[keyof PipelineState]][]).map(
          ([key, { name, desc, size }]) => (
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
                <span style={{ marginLeft: 5, fontSize: 10, color: 'var(--text-3)', fontStyle: 'italic' }}>
                  {desc}
                </span>
              </div>
              <StatusLabel status={status[key]} size={size} />
            </div>
          )
        )}
      </div>

      {/* Post-load hint */}
      {allReady && (
        <div style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--text-3)',
          letterSpacing: '0.04em',
          lineHeight: 1.6,
        }}>
          Models cached locally · Instant load next visit
        </div>
      )}

      {/* First-load hint */}
      {allIdle && (
        <div style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--text-3)',
          letterSpacing: '0.04em',
          lineHeight: 1.6,
        }}>
          ~178 MB total · cached after first load
        </div>
      )}
    </div>
  );
}
