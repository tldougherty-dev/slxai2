import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendTransactionalEmail } from './lib/sendTransactionalEmail';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({}).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to, subject, html, from } = req.body as {
    to?: string;
    subject?: string;
    html?: string;
    from?: string;
  };

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    const { messageId } = await sendTransactionalEmail({ to, subject, html, from });
    return res.status(200).json({ success: true, id: messageId });
  } catch (error: unknown) {
    const err = error as { message?: string; name?: string; stack?: string };
    console.error('SES error:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
    });
    return res.status(500).json({
      error: 'Failed to send email',
      details: err.message || 'Unknown error',
      type: err.name || 'Error',
      help:
        'Verify the From address and domain in Amazon SES (sandbox: only verified recipients). Check Vercel function logs.',
    });
  }
}
