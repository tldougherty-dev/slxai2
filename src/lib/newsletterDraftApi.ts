import { supabase } from '@/lib/supabase';
import type { SignalNewsletterSectionKey } from '@/lib/signalNewsletterTemplate';

export type DraftNewsletterParams = {
  section: SignalNewsletterSectionKey;
  title: string;
  issueNumber?: number | null;
  prompt?: string;
  currentContent?: string;
  context?: string;
};

export async function requestNewsletterDraft(params: DraftNewsletterParams): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) {
    throw new Error('You must be logged in to use the drafting assistant.');
  }

  const response = await fetch('/api/newsletter-draft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  const json = (await response.json()) as { draft?: string; error?: string; message?: string };
  if (!response.ok) {
    throw new Error(json.message || json.error || 'Failed to generate draft');
  }
  if (!json.draft) {
    throw new Error('No draft returned');
  }
  return json.draft;
}
