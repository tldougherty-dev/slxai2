/**
 * Verbatim workshop / panel submission text for the program book.
 *
 * Do not paraphrase values: paste exactly what submitters entered (portal form or spreadsheet export).
 *
 * Add verbatim text (use any combination):
 * 1) Regenerate src/data/workshopVerbatimFromDocs.json from workshop .docx/.pdf via scripts/extract_workshop_docx.py (merged below).
 * 2) Fill WORKSHOP_VERBATIM_RAW_BY_SLUG[slug] and/or WORKSHOP_VERBATIM_FIELDS_BY_SLUG[slug] in this file.
 *
 * Slug keys must match summit2026Workshops.ts.
 */

import { SUMMIT_2026_WORKSHOPS } from '@/data/summit2026Workshops';
import workshopVerbatimFromDocs from '@/data/workshopVerbatimFromDocs.json';

export type WorkshopVerbatimField = {
  /** Exact question or column title from the form / export */
  label: string;
  /** Exact response text (preserve line breaks) */
  value: string;
};

function emptyRawMap(): Record<string, string> {
  return Object.fromEntries(SUMMIT_2026_WORKSHOPS.map((w) => [w.slug, ''])) as Record<string, string>;
}

function emptyFieldsMap(): Record<string, WorkshopVerbatimField[]> {
  return Object.fromEntries(SUMMIT_2026_WORKSHOPS.map((w) => [w.slug, []])) as Record<
    string,
    WorkshopVerbatimField[]
  >;
}

/** Full submission as a single pasted block (no edits). */
export const WORKSHOP_VERBATIM_RAW_BY_SLUG: Record<string, string> = {
  ...emptyRawMap(),
  ...(workshopVerbatimFromDocs as Record<string, string>),
};

/** Field-by-field: same order as your export; labels must match exactly. */
export const WORKSHOP_VERBATIM_FIELDS_BY_SLUG: Record<string, WorkshopVerbatimField[]> = {
  ...emptyFieldsMap(),
};

export function getVerbatimRawForSlug(slug: string): string {
  return WORKSHOP_VERBATIM_RAW_BY_SLUG[slug] ?? '';
}

export function getVerbatimFieldsForSlug(slug: string): WorkshopVerbatimField[] {
  return WORKSHOP_VERBATIM_FIELDS_BY_SLUG[slug] ?? [];
}
