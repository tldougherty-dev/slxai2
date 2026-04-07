/**
 * First `max` sentences from plain text (whitespace normalized).
 * Uses Intl.Segmenter when available; otherwise a simple punctuation split.
 */
export function takeFirstSentences(text: string, max: number): string {
  const normalized = text.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';

  try {
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      const seg = new Intl.Segmenter('en', { granularity: 'sentence' });
      const parts = [...seg.segment(normalized)]
        .map((s) => s.segment.trim())
        .filter(Boolean);
      if (parts.length > 0) {
        return parts.slice(0, max).join(' ').trim();
      }
    }
  } catch {
    // fall through
  }

  const rough = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  if (!rough?.length) return normalized;
  return rough
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max)
    .join(' ')
    .trim();
}
