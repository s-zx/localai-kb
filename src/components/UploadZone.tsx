import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';

interface Props {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export function UploadZone({ onFiles, disabled }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files).filter(f =>
      f.type === 'text/plain' ||
      f.type === 'application/pdf' ||
      f.name.endsWith('.md') ||
      f.name.endsWith('.txt') ||
      f.name.endsWith('.pdf')
    );
    if (files.length > 0) onFiles(files);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) onFiles(files);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={e => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      style={{
        border: `1.5px dashed ${isDragging ? 'var(--amber)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '16px 12px',
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: isDragging ? 'var(--amber-glow)' : 'var(--bg-2)',
        transition: 'all var(--transition)',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,.pdf,text/plain,application/pdf"
        multiple
        onChange={handleChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      <div style={{
        fontSize: 20,
        marginBottom: 6,
        color: isDragging ? 'var(--amber)' : 'var(--text-2)',
      }}>
        {isDragging ? '↓' : '📄'}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 500 }}>
        {disabled ? 'Processing…' : 'Drop a document or click'}
      </div>
      <div style={{
        marginTop: 5,
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text-3)',
        letterSpacing: '0.06em',
        lineHeight: 1.8,
      }}>
        PDF · TXT · MD
        <br />
        <span style={{ fontStyle: 'italic', fontFamily: 'inherit' }}>contracts, reports, research</span>
      </div>
    </div>
  );
}
