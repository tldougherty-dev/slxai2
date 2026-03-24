import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

/** Same region as SES SMTP host email-smtp.us-east-1.amazonaws.com (API uses regional endpoint, not SMTP). */
const DEFAULT_AWS_REGION = 'us-east-1';

const DEFAULT_FROM_EMAIL = 'SLxAI Portal <notifications@slxai.org>';

function getSesClient(): SESClient | null {
  const region = (process.env.AWS_REGION?.trim() || DEFAULT_AWS_REGION) as string;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

  if (!accessKeyId || !secretAccessKey) {
    return null;
  }

  return new SESClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({}).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const client = getSesClient();
  if (!client) {
    console.error(
      'Amazon SES not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY on the server (e.g. Vercel). Optional: AWS_REGION (defaults to us-east-1, same region as email-smtp.us-east-1.amazonaws.com).'
    );
    return res.status(500).json({
      error: 'Email service not configured',
      message:
        'Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your host environment (not VITE_*). Region defaults to us-east-1. Verify the sender in Amazon SES.',
    });
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

  const fromHeader = (from || DEFAULT_FROM_EMAIL).trim();

  try {
    console.log('Sending email via SES:', {
      to,
      from: fromHeader,
      subject,
      htmlLength: html.length,
      region: process.env.AWS_REGION?.trim() || DEFAULT_AWS_REGION,
    });

    const cmd = new SendEmailCommand({
      Source: fromHeader,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: { Html: { Data: html, Charset: 'UTF-8' } },
      },
    });

    const result = await client.send(cmd);
    console.log('Email sent successfully:', result.MessageId);

    return res.status(200).json({
      success: true,
      id: result.MessageId,
    });
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
