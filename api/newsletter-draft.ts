import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SECTION_LABELS: Record<string, string> = {
  editors_note: "Editor's Note",
  community_highlights: 'Community Highlights',
  academy_updates: 'Academy Updates',
  ai_in_sign_language: 'AI in Sign Language',
  events: 'Upcoming Events',
  member_spotlight: 'Member Spotlight',
  closing: 'Closing',
};

async function verifyAdmin(req: VercelRequest) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const token = header.slice(7);
  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  const role = (data.user.user_metadata?.role as string) || '';
  if (role !== 'admin' && role !== 'super_admin') return null;
  return data.user;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({}).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = await verifyAdmin(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return res.status(500).json({
      error: 'AI drafting is not configured',
      message: 'Set OPENAI_API_KEY in your server environment (e.g. Vercel).',
    });
  }

  const { section, title, issueNumber, prompt, currentContent, context } = req.body as {
    section?: string;
    title?: string;
    issueNumber?: number | null;
    prompt?: string;
    currentContent?: string;
    context?: string;
  };

  if (!section || !SECTION_LABELS[section]) {
    return res.status(400).json({ error: 'Invalid or missing section' });
  }

  const sectionLabel = SECTION_LABELS[section];
  const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';

  const systemPrompt = `You are an editorial assistant for ${'SLxAI Signal'}, the newsletter of SLxAI (Sign Language × AI), a global cooperative nonprofit advancing ethical sign language AI.

Write clear, warm, professional copy for deaf and hearing professionals in the sign language and AI community. Use plain language. Avoid hype. Do not use em dashes.

Return only the draft text for the requested section. No markdown headings unless they help readability. No preamble or meta commentary.`;

  const userPrompt = [
    `Newsletter title: ${title || 'SLxAI Signal'}`,
    issueNumber ? `Issue number: ${issueNumber}` : null,
    `Section: ${sectionLabel}`,
    context ? `Additional context from the editor:\n${context}` : null,
    prompt ? `Editor request:\n${prompt}` : `Draft the "${sectionLabel}" section for this issue.`,
    currentContent?.trim() ? `Current draft (revise or expand as requested):\n${currentContent}` : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI error:', response.status, errText);
      return res.status(502).json({ error: 'AI service failed', message: errText.slice(0, 200) });
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const draft = json.choices?.[0]?.message?.content?.trim() ?? '';
    if (!draft) {
      return res.status(502).json({ error: 'Empty response from AI service' });
    }

    return res.status(200).json({ draft });
  } catch (err) {
    console.error('newsletter-draft error:', err);
    return res.status(500).json({ error: 'Failed to generate draft' });
  }
}
