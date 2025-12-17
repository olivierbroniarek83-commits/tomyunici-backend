require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { appendRow } = require('./googleSheets');
const { createOrder, captureOrder } = require('./paypal');

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.ORIGIN || '*' }));

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
if (!SPREADSHEET_ID) console.warn('Warning: SPREADSHEET_ID not set. Signups/orders will fail until configured.');

app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, pesel } = req.body;
    if (!name || !email || !pesel) return res.status(400).json({ error: 'Missing required fields' });

    // basic validation
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });
    if (!/^\d{11}$/.test(pesel)) return res.status(400).json({ error: 'Invalid PESEL (11 digits expected)' });

    // Append to Google Sheets
    await appendRow(SPREADSHEET_ID, 'zgloszenia', [new Date().toISOString(), name, email, pesel]);

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/create-order', async (req, res) => {
  try {
    const { items, customer } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Cart empty' });

    const total = items.reduce((s, it) => s + (it.price * (it.quantity || 1)), 0);
    const ppResp = await createOrder(total, 'PLN', items);

    // Save order to sheet
    const orderId = ppResp.id || 'unknown';
    await appendRow(SPREADSHEET_ID, 'zamowienia', [new Date().toISOString(), orderId, JSON.stringify(items), JSON.stringify(customer || {}), 'CREATED']);

    // Find approval link
    const approveLink = (ppResp.links || []).find(l => l.rel === 'approve')?.href || null;

    return res.json({ ok: true, orderId, approveLink, raw: ppResp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/capture-order', async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: 'orderId required' });

    const cap = await captureOrder(orderId);

    await appendRow(SPREADSHEET_ID, 'zamowienia', [new Date().toISOString(), orderId, 'CAPTURED', JSON.stringify(cap)]);

    return res.json({ ok: true, capture: cap });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
