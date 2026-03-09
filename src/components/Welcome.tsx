interface Props {
  onInit: () => void;
  modelsReady: boolean;
  modelsLoading: boolean;
}

const STEPS = [
  {
    num: '01',
    title: 'Load AI Models',
    desc: 'Three small models download once and are cached locally. No API key, no server.',
    icon: '⬡',
  },
  {
    num: '02',
    title: 'Upload Documents',
    desc: 'Add contracts, reports, research papers, or any text. Supported: PDF, TXT, MD.',
    icon: '⬡',
  },
  {
    num: '03',
    title: 'Ask Anything',
    desc: 'Ask natural-language questions and get answers extracted directly from your documents.',
    icon: '⬡',
  },
];

const USE_CASES = [
  { icon: '📋', label: 'Contracts & Agreements', hint: 'e.g. "What is the notice period for termination?"' },
  { icon: '⚕️', label: 'Medical Reports',        hint: 'e.g. "What medications are listed?"' },
  { icon: '📊', label: 'Financial Documents',     hint: 'e.g. "What fees apply after the trial period?"' },
  { icon: '🔬', label: 'Research Papers',          hint: 'e.g. "What are the key findings?"' },
];

export function Welcome({ onInit, modelsReady, modelsLoading }: Props) {
  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '48px 40px',
      display: 'flex',
      flexDirection: 'column',
      gap: 40,
      maxWidth: 720,
      margin: '0 auto',
      width: '100%',
    }}>
      {/* Hero */}
      <div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          background: 'rgba(100, 200, 130, 0.07)',
          border: '1px solid rgba(100, 200, 130, 0.2)',
          borderRadius: 20,
          marginBottom: 20,
        }}>
          <span style={{ fontSize: 11 }}>🔒</span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--green)',
            letterSpacing: '0.08em',
          }}>
            YOUR FILES NEVER LEAVE YOUR BROWSER
          </span>
        </div>

        <h1 style={{
          margin: 0,
          fontSize: 32,
          fontWeight: 700,
          color: 'var(--text-0)',
          lineHeight: 1.25,
          letterSpacing: '-0.02em',
        }}>
          Ask questions about<br />
          <span style={{ color: 'var(--amber)' }}>your private documents</span>
        </h1>

        <p style={{
          marginTop: 14,
          fontSize: 15,
          color: 'var(--text-2)',
          lineHeight: 1.7,
          maxWidth: 560,
        }}>
          AI-powered document analysis that runs entirely in your browser.
          No uploads to external servers. No API keys. Works offline.
          Built for documents you can't share with ChatGPT.
        </p>
      </div>

      {/* Steps */}
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-3)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}>
          How it works
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{
              flex: 1,
              padding: '16px',
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              position: 'relative',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--amber)',
                fontWeight: 700,
                marginBottom: 8,
                letterSpacing: '0.04em',
              }}>
                {step.num}
              </div>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-0)',
                marginBottom: 6,
              }}>
                {step.title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Use cases */}
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-3)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}>
          Made for sensitive documents
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}>
          {USE_CASES.map((uc, i) => (
            <div key={i} style={{
              padding: '12px 14px',
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 18, lineHeight: 1.2, flexShrink: 0 }}>{uc.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-0)', marginBottom: 3 }}>
                  {uc.label}
                </div>
                <div style={{
                  fontSize: 11,
                  color: 'var(--text-3)',
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                }}>
                  {uc.hint}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      {!modelsReady && !modelsLoading && (
        <div style={{
          padding: '20px 24px',
          background: 'var(--amber-glow)',
          border: '1px solid var(--amber-dim)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-0)', marginBottom: 4 }}>
              Ready to get started?
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>
              Load the AI models first — they download once (~178 MB) and are cached locally.
            </div>
          </div>
          <button
            onClick={onInit}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              background: 'var(--amber)',
              color: '#1a1200',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '10px 18px',
              cursor: 'pointer',
              fontWeight: 700,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Load Models →
          </button>
        </div>
      )}

      {modelsLoading && (
        <div style={{
          padding: '16px 20px',
          background: 'rgba(230, 160, 60, 0.06)',
          border: '1px solid var(--amber-dim)',
          borderRadius: 'var(--radius-lg)',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--amber)',
          letterSpacing: '0.04em',
        }}>
          ⟳ Downloading models… upload a document whenever you're ready.
        </div>
      )}

      {modelsReady && (
        <div style={{
          padding: '16px 20px',
          background: 'rgba(100, 200, 130, 0.07)',
          border: '1px solid rgba(100, 200, 130, 0.2)',
          borderRadius: 'var(--radius-lg)',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--green)',
          letterSpacing: '0.04em',
        }}>
          ✓ Models ready · Upload a document from the sidebar to begin
        </div>
      )}

      {/* Privacy note */}
      <div style={{
        paddingTop: 16,
        borderTop: '1px solid var(--border)',
        fontSize: 11,
        color: 'var(--text-3)',
        lineHeight: 1.7,
      }}>
        <strong style={{ color: 'var(--text-2)' }}>Privacy guarantee:</strong>{' '}
        All AI inference runs locally using WebAssembly. Your documents are stored only in your
        browser's IndexedDB. No network requests are made with your document content.
        Models are downloaded from HuggingFace once and cached locally.
      </div>
    </div>
  );
}
