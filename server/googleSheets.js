const { google } = require('googleapis');
const fs = require('fs');

let authClient = null;

async function initAuth() {
  if (authClient) return authClient;

  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
  const keyJSONBase64 = process.env.GOOGLE_SERVICE_ACCOUNT;

  let credentials;
  if (keyPath && fs.existsSync(keyPath)) {
    credentials = JSON.parse(fs.readFileSync(keyPath));
  } else if (keyJSONBase64) {
    credentials = JSON.parse(Buffer.from(keyJSONBase64, 'base64').toString('utf8'));
  } else {
    throw new Error('Google service account credentials not found. Set GOOGLE_SERVICE_ACCOUNT_PATH or GOOGLE_SERVICE_ACCOUNT');
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  authClient = await auth.getClient();
  return authClient;
}

async function appendRow(spreadsheetId, sheetName, values) {
  const auth = await initAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const range = `${sheetName}!A1`;
  return sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values]
    }
  });
}

module.exports = {
  appendRow
};