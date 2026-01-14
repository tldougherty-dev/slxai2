import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

// Use server-side environment variable (no VITE_ prefix)
const resendApiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const DEFAULT_FROM_EMAIL = 'SLxAI Portal <notifications@slxai.org>';

// Enable CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({}).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Check if Resend is configured
  if (!resend || !resendApiKey) {
    console.error('Resend API key not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const { to, subject, html, from } = req.body;

  // Validate required fields
  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    const result = await resend.emails.send({
      from: from || DEFAULT_FROM_EMAIL,
      to: to,
      subject: subject,
      html: html,
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      return res.status(500).json({ 
        error: 'Failed to send email',
        details: result.error.message || 'Unknown error'
      });
    }

    return res.status(200).json({ 
      success: true,
      id: result.data?.id 
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message || 'Unknown error'
    });
  }
}
