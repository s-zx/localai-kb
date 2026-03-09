import { useState, type FormEvent, type KeyboardEvent } from 'react';

interface Props {
  onSearch: (query: string) => void;
  isSearching: boolean;
  disabled?: boolean;
}

export function SearchBar({ onSearch, isSearching, disabled }: Props) {
  const [value, setValue] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (value.trim() && !isSearching) {
      onSearch(value.trim());
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isSearching) {
        onSearch(value.trim());
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-end',
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '10px 14px',
        transition: 'border-color var(--transition)',
      }}
        onFocusCapture={e => (e.currentTarget.style.borderColor = 'var(--amber-dim)')}
        onBlurCapture={e => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          color: 'var(--amber)',
          lineHeight: '24px',
          flexShrink: 0,
          opacity: 0.7,
        }}>
          ›
        </span>
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your documents..."
          disabled={disabled || isSearching}
          rows={1}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-0)',
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            lineHeight: 1.5,
            resize: 'none',
            padding: 0,
            overflow: 'hidden',
          }}
          onInput={e => {
            const el = e.currentTarget;
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
          }}
        />
        <button
          type="submit"
          disabled={!value.trim() || isSearching || disabled}
          style={{
            flexShrink: 0,
            background: (!value.trim() || isSearching || disabled) ? 'var(--bg-3)' : 'var(--amber)',
            color: (!value.trim() || isSearching || disabled) ? 'var(--text-3)' : 'var(--bg-0)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '4px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 600,
            cursor: (!value.trim() || isSearching || disabled) ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition)',
            letterSpacing: '0.04em',
          }}
        >
          {isSearching ? (
            <span style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              border: '2px solid var(--text-3)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
          ) : 'Ask'}
        </button>
      </div>
    </form>
  );
}
