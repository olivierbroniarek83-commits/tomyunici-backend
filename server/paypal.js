const fetch = require('node-fetch');
const baseUrl = process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const client = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!client || !secret) throw new Error('PayPal credentials missing');

  const auth = Buffer.from(`${client}:${secret}`).toString('base64');
  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('No access token from PayPal: ' + JSON.stringify(data));
  return data.access_token;
}

async function createOrder(total, currency = 'PLN', items = []) {
  const token = await getAccessToken();
  const itemTotal = items.reduce((s, i) => s + (i.price * i.quantity), 0).toFixed(2);
  const res = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: total.toFixed(2),
          breakdown: {
            item_total: { currency_code: currency, value: itemTotal }
          }
        },
        items: items.map(i => ({
          name: i.name,
          unit_amount: { currency_code: currency, value: i.price.toFixed(2) },
          quantity: i.quantity.toString()
        }))
      }],
      application_context: {
        brand_name: 'TomyUnici',
        user_action: 'PAY_NOW'
      }
    })
  });
  const data = await res.json();
  console.log('PayPal createOrder response:', JSON.stringify(data, null, 2));
  return data;
}

async function captureOrder(orderId) {
  const token = await getAccessToken();
  const res = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return res.json();
}

module.exports = {
  createOrder,
  captureOrder
};