# TomyUnici Backend (Node/Express)

This backend provides:
- POST /api/signup -> saves signups to Google Sheets (sheet "zgloszenia")
- POST /api/create-order -> creates a PayPal order (sandbox) and saves to sheet "zamowienia"
- POST /api/capture-order -> captures PayPal order and saves capture data

Setup
1. Copy `.env.example` to `.env` and fill values (SPREADSHEET_ID, PAYPAL_CLIENT_ID/SECRET, GOOGLE service account path).
2. Place the Google service account JSON in the server folder and set `GOOGLE_SERVICE_ACCOUNT_PATH=./service-account.json` or set `GOOGLE_SERVICE_ACCOUNT` environment variable to base64 of the JSON.
3. Share your Google Sheet with the service account email and create sheets named exactly `zgloszenia` and `zamowienia` (or change code accordingly).
4. Run `npm install` and `npm run dev`.

PayPal sandbox
- Create app at https://developer.paypal.com/developer/applications and use the client id/secret for sandbox.

Security notes
- PESEL is personal data — keep the spreadsheet access-limited and consider encrypting sensitive data for production.
- In production use HTTPS and set CORS origins strictly.
