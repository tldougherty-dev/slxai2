# Google Sheets Integration Setup

This guide will help you connect the founding member application form to Google Sheets.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name the first sheet "Founding Members"
4. Add these column headers in row 1:
   - A: Timestamp
   - B: First Name
   - C: Last Name
   - D: Email
   - E: Organization
   - F: Role/Title
   - G: Country
   - H: Experience
   - I: Goals
   - J: Communications

## Step 2: Set up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

## Step 3: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: "SLxAI Form Handler"
   - Description: "Service account for handling form submissions"
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

## Step 4: Generate JSON Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the JSON file (keep it secure!)

## Step 5: Share Google Sheet

1. Open your Google Sheet
2. Click "Share" in the top right
3. Add the service account email (found in the JSON file under `client_email`)
4. Give it "Editor" permissions
5. Click "Send"

## Step 6: Set Environment Variables

You need to set these environment variables in your deployment platform (Vercel, Netlify, etc.):

```
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key_from_json
```

### How to find these values:

- **GOOGLE_SHEET_ID**: Found in the URL of your Google Sheet
  - URL format: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
- **GOOGLE_CLIENT_EMAIL**: Found in the downloaded JSON file under `client_email`
- **GOOGLE_PRIVATE_KEY**: Found in the downloaded JSON file under `private_key`
  - Copy the entire private key including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts

## Step 7: Deploy

1. Make sure your API files are in the `/api` directory
2. Deploy your application
3. Test the form submission

## Testing

1. Fill out the founding member application form
2. Submit the form
3. Check your Google Sheet - you should see a new row with the submitted data

## Troubleshooting

- **"Failed to submit application"**: Check your environment variables are set correctly
- **"Missing required fields"**: Make sure all required form fields are filled
- **Permission errors**: Ensure the service account has editor access to the Google Sheet

## Security Notes

- Never commit the JSON key file to your repository
- Keep your environment variables secure
- The service account should only have access to the specific Google Sheet it needs 