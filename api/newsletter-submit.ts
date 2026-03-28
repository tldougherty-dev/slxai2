import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const SHEET_NAME = 'Newsletter';

function getGoogleSheetsEnv() {
  const sheetId = process.env.GOOGLE_SHEET_ID?.trim();
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim();
  const rawKey = process.env.GOOGLE_PRIVATE_KEY ?? '';
  const privateKey = rawKey.replace(/\\n/g, '\n');
  return { sheetId, clientEmail, privateKey };
}

async function getSheetsClient(clientEmail: string, privateKey: string) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email } = req.body;

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
      range: `${SHEET_NAME}!A:A`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[email]],
      },
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Google Sheets error:', err);
    res.status(500).json({ error: 'Failed to write to Google Sheet' });
  }
}