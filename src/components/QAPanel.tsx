import type { QAAnswer } from '../hooks/useQA.js';
import type { SearchResult } from '../lib/vectorStore.js';

interface Props {
  query: string;
  answers: QAAnswer[];
  topChunks: SearchResult[];
  isSearching: boolean;
  error: string | null;
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score * 100));
  return (
    <div style={{
      height: 3,
      background: 'var(--bg-3)',
      borderRadius: 2,
      overflow: 'hidden',
      marginTop: 8,
    }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: pct > 50 ? 'var(--green)' : pct > 20 ? 'var(--amber)' : 'var(--text-3)',
        borderRadius: 2,
        transition: 'width 600ms ease',
      }} />
    </div>
  );
}

function HighlightedContext({ text, answer }: { text: string; answer: string }) {
  if (!answer || !text.includes(answer)) {
    return <span style={{ color: 'var(--text-1)' }}>{text.slice(0, 300)}{text.length > 300 ? '…' : ''}</span>;
  }
  const idx = text.indexOf(answer);
  const before = text.slice(Math.max(0, idx - 80), idx);
  const after = text.slice(idx + answer.length, idx + answer.length + 80);
  return (
    <span style={{ color: 'var(--text-1)' }}>
      {before.length < (idx - 80 > 0 ? 80 : idx) ? '…' : ''}{before}
      <mark style={{
        background: 'var(--amber-glow-strong)',
        color: 'var(--amber)',
        borderRadius: 2,
        padding: '0 2px',
      }}>
        {answer}
      </mark>
      {after}{after.length === 80 ? '…' : ''}
    </span>
  );
}

export function QAPanel({ query, answers, topChunks, isSearching, error }: Props) {
  if (!query && !isSearching) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-3)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, marginBottom: 12, opacity: 0.3 }}>?</div>
          <div style={{ fontSize: 14, fontStyle: 'italic' }}>Ask a question to get started</div>
        </div>
      </div>
    );
  }

  if (isSearching) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        color: 'var(--text-2)',
      }}>
        <div style={{
          width: 24,
          height: 24,
          border: '2px solid var(--border)',
          borderTopColor: 'var(--amber)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.06em' }}>
          searching + reasoning…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        flex: 1,
        padding: '24px',
        display: 'flex',
        alignItems: 'flex-start',
      }}>
        <div style={{
          padding: '12px 16px',
          background: 'rgba(232, 96, 96, 0.08)',
          border: '1px solid var(--red-dim)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--red)',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          width: '100%',
        }}>
          {error}
        </div>
      </div>
    );
  }

  const best = answers[0];

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      animation: 'fadeIn 300ms ease forwards',
    }}>
      {/* Query echo */}
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-3)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}>
          Question
        </div>
        <div style={{ fontSize: 18, color: 'var(--text-0)', fontStyle: 'italic', lineHeight: 1.5 }}>
          {query}
        </div>
      </div>

      {best && (
        <div style={{
          padding: '16px 20px',
          background: 'var(--amber-glow)',
          border: '1px solid var(--amber-dim)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--amber)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            Best Answer
          </div>
          <div style={{ fontSize: 17, color: 'var(--text-0)', lineHeight: 1.6 }}>
            {best.answer}
          </div>
          <ScoreBar score={best.score} />
          <div style={{
            marginTop: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-2)',
          }}>
            confidence: {(best.score * 100).toFixed(1)}%
          </div>
        </div>
      )}

      {/* Supporting context chunks */}
      {topChunks.length > 0 && (
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-3)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}>
            Source Passages · {topChunks.length} retrieved
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topChunks.map(({ chunk, score }, i) => (
              <div key={chunk.id} style={{
                padding: '12px 14px',
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'var(--text-3)',
                    }}>
                      #{i + 1}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      letterSpacing: '0.06em',
                      color: 'var(--blue)',
                      background: 'rgba(111, 168, 216, 0.1)',
                      border: '1px solid rgba(111, 168, 216, 0.2)',
                      borderRadius: 3,
                      padding: '1px 5px',
                    }}>
                      {chunk.category}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--text-3)',
                  }}>
                    sim: {(score * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                  {best ? (
                    <HighlightedContext text={chunk.text} answer={best.docId === chunk.docId ? best.answer : ''} />
                  ) : (
                    <span style={{ color: 'var(--text-1)' }}>
                      {chunk.text.slice(0, 300)}{chunk.text.length > 300 ? '…' : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other candidate answers */}
      {answers.length > 1 && (
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-3)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            Other Candidates
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {answers.slice(1).map((ans, i) => (
              <div key={i} style={{
                padding: '10px 14px',
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-1)' }}>{ans.answer}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text-3)',
                  flexShrink: 0,
                }}>
                  {(ans.score * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
