// src/components/PreviewView.tsx
import { useState, useRef } from 'react';
import { marked } from 'marked';
import { generateMarkdown, copyToClipboard, downloadMarkdown } from '../utils/export';

interface PreviewViewProps {
  existingMd?: string;
}

export default function PreviewView({ existingMd }: PreviewViewProps) {
  const [mdInput, setMdInput] = useState(existingMd || '');
  const [renderedHtml, setRenderedHtml] = useState('');
  const [error, setError] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  function renderMarkdown() {
    if (!mdInput.trim()) {
      setError('Enter some markdown to render');
      return;
    }
    try {
      marked.setOptions({
        gfm: true,
        breaks: false,
      });
      const html = marked.parse(mdInput) as string;
      setRenderedHtml(html);
      setError('');
    } catch (err) {
      setRenderedHtml('');
      setError('Invalid markdown — check formatting');
    }
  }

  function exportPdf() {
    if (!previewRef.current) return;
    // For now, trigger download instead of PDF (pdf.js not in scope)
    // In production, use: import('html2pdf.js').then(async ({ default: html2pdf }) => { ... })
    const content = previewRef.current.innerHTML;
    const fullHtml = `<!DOCTYPE html><html><head><style>body{font-family:sans-serif;padding:20px;}h1{color:#813405}h2{color:#d45113}ul{margin-left:0}li{margin:4px 0}</style></head><body>${content}</body></html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2>Preview</h2>

      {/* Markdown input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label>Markdown Input</label>
        <textarea
          value={mdInput}
          onChange={(e) => setMdInput(e.target.value)}
          rows={8}
          style={{ width: '100%', fontFamily: '"Courier New", monospace', fontSize: '14px', padding: '8px' }}
          placeholder="Paste quiz markdown here..."
        />
        <button onClick={renderMarkdown}>Render</button>
        {error && <p style={{ color: 'var(--clr-error)', fontSize: '14px' }}>{error}</p>}
      </div>

      {/* Rendered preview */}
      {renderedHtml && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2>Rendered Output</h2>
          <button onClick={exportPdf}>Export HTML</button>
          <div
            ref={previewRef}
            style={{
              border: '1px solid var(--clr-border)',
              borderRadius: 'var(--border-radius)',
              padding: '16px',
              background: 'var(--clr-surface)',
              overflow: 'auto',
            }}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </div>
      )}
    </div>
  );
}
