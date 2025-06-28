import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n');

const SHEET_NAME = 'Founding Members';

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_CLIENT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { 
    firstName, 
    lastName, 
    email, 
    organization, 
    role, 
    country, 
    experience, 
    goals, 
    communications 
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !organization || !role || !country) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const sheets = await getSheetsClient();

    // Prepare the data row
    const timestamp = new Date().toISOString();
    const dataRow = [
      timestamp,
      firstName,
      lastName,
      email,
      organization,
      role,
      country,
      experience || '',
      goals || '',
      communications ? 'Yes' : 'No'
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:J`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [dataRow],
      },
    });

    res.status(200).json({ success: true, message: 'Application submitted successfully' });
  } catch (err) {
    console.error('Google Sheets error:', err);
    res.status(500).json({ error: 'Failed to submit application' });
  }
} 