import { useMemo, type ReactNode } from 'react';

/**
 * Renders bylaws plain text with typography similar to a formal legal PDF
 * (centered title block, ALL CAPS articles, Section headings, justified body,
 * hanging-indented bullets and numbered lists).
 */
function parseBylaws(text: string): ReactNode[] {
  const lines = text.split(/\r?\n/);
  const elements: ReactNode[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (!trimmed) {
      i++;
      continue;
    }
    if (/^--\s*\d+\s+of\s+\d+\s*--$/.test(trimmed)) {
      i++;
      continue;
    }

    // Split ARTICLE heading across two lines (Word/PDF export quirk)
    if (trimmed.startsWith('ARTICLE ') && !trimmed.includes('PROCEDURES') && i + 1 < lines.length) {
      const next = lines[i + 1].trim();
      if (next === 'PROCEDURES' && trimmed.includes('BOARD MEETINGS AND')) {
        elements.push(
          <h2 key={`${++key}-article`} className="bylaws-doc-article">
            {trimmed} {next}
          </h2>
        );
        i += 2;
        continue;
      }
    }

    if (trimmed === 'BYLAWS OF SLxAI') {
      elements.push(
        <h1 key={++key} className="bylaws-doc-title">
          {trimmed}
        </h1>
      );
      i++;
      continue;
    }
    if (trimmed === 'A Nonprofit Public Benefit Corporation') {
      elements.push(
        <p key={++key} className="bylaws-doc-subtitle">
          {trimmed}
        </p>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('ARTICLE ')) {
      elements.push(
        <h2 key={++key} className="bylaws-doc-article">
          {trimmed}
        </h2>
      );
      i++;
      continue;
    }
    if (trimmed === 'CERTIFICATE OF ADOPTION') {
      elements.push(
        <h2 key={++key} className="bylaws-doc-article">
          {trimmed}
        </h2>
      );
      i++;
      continue;
    }
    if (/^Section \d+\.\d+/.test(trimmed)) {
      elements.push(
        <h3 key={++key} className="bylaws-doc-section">
          {trimmed}
        </h3>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('●')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('●')) {
        items.push(lines[i].trim().replace(/^●\s*/, ''));
        i++;
      }
      elements.push(
        <ul key={++key} className="bylaws-doc-bullet-list">
          {items.map((t, idx) => (
            <li key={idx}>{t}</li>
          ))}
        </ul>
      );
      continue;
    }
    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s*/, ''));
        i++;
      }
      elements.push(
        <ol key={++key} className="bylaws-doc-numbered-list">
          {items.map((t, idx) => (
            <li key={idx}>{t}</li>
          ))}
        </ol>
      );
      continue;
    }
    if (/^[A-Z]\.\s/.test(trimmed)) {
      const m = trimmed.match(/^([A-Z]\.\s)([\s\S]*)$/);
      if (m) {
        elements.push(
          <p key={++key} className="bylaws-doc-lettered">
            <span className="bylaws-doc-letter-label">{m[1].trimEnd()}</span>
            <span>{m[2]}</span>
          </p>
        );
        i++;
        continue;
      }
    }

    const paraLines: string[] = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t) break;
      if (/^--\s*\d+\s+of\s+\d+\s*--$/.test(t)) {
        i++;
        continue;
      }
      if (t === 'BYLAWS OF SLxAI') break;
      if (t === 'A Nonprofit Public Benefit Corporation') break;
      if (t.startsWith('ARTICLE ')) break;
      if (t === 'CERTIFICATE OF ADOPTION') break;
      if (/^Section \d+\.\d+/.test(t)) break;
      if (t.startsWith('●')) break;
      if (/^\d+\.\s/.test(t)) break;
      if (/^[A-Z]\.\s/.test(t)) break;
      if (t === 'PROCEDURES' && paraLines.length && paraLines[paraLines.length - 1].includes('BOARD MEETINGS AND')) {
        break;
      }
      paraLines.push(t);
      i++;
    }
    if (paraLines.length) {
      elements.push(
        <p key={++key} className="bylaws-doc-paragraph">
          {paraLines.join(' ')}
        </p>
      );
    }
  }

  return elements;
}

export function BylawsDocument({ text }: { text: string }) {
  const nodes = useMemo(() => parseBylaws(text), [text]);
  return <div className="bylaws-document">{nodes}</div>;
}
