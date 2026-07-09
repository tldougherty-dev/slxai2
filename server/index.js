import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const app = express();
app.use(cors());
app.use(express.json());

const DEFAULT_FROM_EMAIL = 'SLxAI Portal <notifications@slxai.org>';

function getTransporter() {
  const host = process.env.SMTP_HOST?.trim();
  const port = parseInt(process.env.SMTP_PORT?.trim() || '587', 10);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim();
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

async function sendTransactionalEmail({ to, subject, html, from }) {
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error('Email service not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASSWORD.');
  }
  const fromHeader = (from || process.env.SES_FROM_EMAIL?.trim() || DEFAULT_FROM_EMAIL).trim();
  const info = await transporter.sendMail({ from: fromHeader, to, subject, html });
  if (!info.messageId) throw new Error('SMTP server did not return a message id.');
  return { messageId: info.messageId };
}

app.post('/api/send-email', async (req, res) => {
  const { to, subject, html, from } = req.body || {};
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
  } catch (error) {
    console.error('SMTP error:', error);
    return res.status(500).json({
      error: 'Failed to send email',
      details: error.message || 'Unknown error',
    });
  }
});

function getGoogleSheetsEnv() {
  const sheetId = process.env.GOOGLE_SHEET_ID?.trim();
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim();
  const rawKey = process.env.GOOGLE_PRIVATE_KEY ?? '';
  const privateKey = rawKey.replace(/\\n/g, '\n');
  return { sheetId, clientEmail, privateKey };
}

async function getSheetsClient(clientEmail, privateKey) {
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

app.post('/api/newsletter-submit', async (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid email' });
  }
  const { sheetId, clientEmail, privateKey } = getGoogleSheetsEnv();
  if (!sheetId || !clientEmail || !privateKey) {
    console.error('Newsletter API: missing GOOGLE_SHEET_ID, GOOGLE_CLIENT_EMAIL, or GOOGLE_PRIVATE_KEY');
    return res.status(500).json({ error: 'Server configuration error' });
  }
  try {
    const sheets = await getSheetsClient(clientEmail, privateKey);
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Newsletter!A:B',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[new Date().toISOString(), email]] },
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Newsletter submit error:', err);
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
});

app.post('/api/founding-member-submit', async (req, res) => {
  const {
    firstName, lastName, email, organization, role, country,
    experience, goals, communications,
  } = req.body || {};

  if (!firstName || !lastName || !email || !organization || !role || !country) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { sheetId, clientEmail, privateKey } = getGoogleSheetsEnv();
  if (!sheetId || !clientEmail || !privateKey) {
    console.error('Founding member API: missing Google Sheets env vars');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const sheets = await getSheetsClient(clientEmail, privateKey);
    const timestamp = new Date().toISOString();
    const dataRow = [
      timestamp, firstName, lastName, email, organization, role, country,
      experience || '', goals || '', communications ? 'Yes' : 'No',
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Founding Members!A:J',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [dataRow] },
    });
    return res.status(200).json({ success: true, message: 'Application submitted successfully' });
  } catch (err) {
    console.error('Google Sheets error:', err);
    return res.status(500).json({ error: 'Failed to submit application' });
  }
});

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API server listening on port ${PORT}`));
