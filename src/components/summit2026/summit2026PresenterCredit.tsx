import { Fragment, type ReactNode } from 'react';
import type { Summit2026Workshop } from '@/data/summit2026Workshops';

export function stripPresenterCreditPrefixes(line: string): string {
  return line
    .replace(/^\s*Presenters:\s*/i, '')
    .replace(/^\s*Presenter:\s*/i, '')
    .replace(/^\s*Featuring:\s*/i, '')
    .trim();
}

/**
 * Renders presenter names with organization in italics when structured `presenters[].organization`
 * is present for everyone. Otherwise returns the one-line `presentersLine` (optionally stripped).
 */
export function presenterCreditWithItalicOrgs(
  workshop: Summit2026Workshop,
  options: { stripLeadingLabels?: boolean } = {},
): ReactNode {
  const { stripLeadingLabels = false } = options;
  const { presenters, presentersLine } = workshop;

  const fallbackLine = stripLeadingLabels ? stripPresenterCreditPrefixes(presentersLine) : presentersLine;

  if (presenters.length === 0) {
    return fallbackLine;
  }

  const orgs = presenters.map((p) => p.organization?.trim()).filter((o): o is string => !!o);
  if (orgs.length === 0) {
    return fallbackLine;
  }

  const allHaveOrg = presenters.every((p) => p.organization?.trim());
  if (!allHaveOrg) {
    return fallbackLine;
  }

  const unique = [...new Set(orgs.map((o) => o.trim()))];

  if (unique.length === 1) {
    const names = presenters.map((p) => p.name).join(', ');
    return (
      <>
        {names}
        {', '}
        <em className="italic text-inherit">{unique[0]}</em>
      </>
    );
  }

  return (
    <>
      {presenters.map((p, i) => (
        <Fragment key={`${p.name}-${i}`}>
          {i > 0 ? '; ' : ''}
          {p.name}
          {', '}
          <em className="italic text-inherit">{p.organization!.trim()}</em>
        </Fragment>
      ))}
    </>
  );
}
