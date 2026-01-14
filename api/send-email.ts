import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

// Use server-side environment variable (no VITE_ prefix)
const resendApiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Default sender email - make sure this domain is verified in Resend Dashboard
// Update this to your verified domain email once domain is verified in Resend
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
    console.error('Resend API key not configured. RESEND_API_KEY:', resendApiKey ? 'Set (hidden)' : 'Not set');
    return res.status(500).json({ 
      error: 'Email service not configured',
      message: 'RESEND_API_KEY environment variable is not set in Vercel. Please add it in Project Settings → Environment Variables.'
    });
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
    const fromEmail = from || DEFAULT_FROM_EMAIL;
    
    // Log request details (without sensitive data)
    console.log('Sending email:', {
      to,
      from: fromEmail,
      subject,
      htmlLength: html.length,
      apiKeySet: !!resendApiKey
    });

    const result = await resend.emails.send({
      from: fromEmail,
      to: to,
      subject: subject,
      html: html,
    });

    if (result.error) {
      console.error('Resend API error:', JSON.stringify(result.error, null, 2));
      return res.status(500).json({ 
        error: 'Failed to send email',
        details: result.error.message || 'Unknown error',
        code: result.error.name || 'RESEND_ERROR',
        statusCode: result.error.statusCode || null,
        help: result.error.message?.includes('domain') 
          ? 'Make sure your domain is verified in Resend Dashboard'
          : 'Check Resend Dashboard for more details'
      });
    }

    console.log('Email sent successfully:', result.data?.id);
    return res.status(200).json({ 
      success: true,
      id: result.data?.id 
    });
  } catch (error: any) {
    console.error('Error sending email:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message || 'Unknown error',
      type: error.constructor?.name || 'Error',
      help: 'Check Vercel function logs for more details'
    });
  }
}
