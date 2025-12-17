// Simple cart (localStorage) and checkout using backend /api/create-order
const CART_KEY = 'tomyunici_cart_v1';

function getCart() { try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; } }
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

function addToCart(product) {
  const cart = getCart();
  const found = cart.find(p => p.id === product.id);
  if (found) found.quantity += 1; else cart.push({ ...product, quantity: 1 });
  saveCart(cart);
  renderCart();
}

function renderCart() {
  const cart = getCart();
  const el = document.getElementById('cart-items');
  if (!el) return;
  el.innerHTML = cart.map(p => `<li>${p.name} x ${p.quantity} — ${p.price.toFixed(2)} PLN</li>`).join('') || '<li>Koszyk pusty</li>';
  document.getElementById('cart-total').textContent = cart.reduce((s,p)=>s+p.price*p.quantity,0).toFixed(2);
}

async function checkout() {
  const cart = getCart();
  if (!cart.length) return alert('Koszyk pusty');
  const customer = { name: document.getElementById('cust-name')?.value || '', email: document.getElementById('cust-email')?.value || '' };
  try {
    const res = await fetch((window.API_BASE || '') + '/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, customer })
    });
    const data = await res.json();
    if (!res.ok) return alert('Błąd: ' + (data.error || 'nieznany'));
    if (data.approveLink) {
      window.location.href = data.approveLink; // redirect to PayPal approval
    } else {
      alert('Brak linku zatwierdzenia od PayPal');
    }
  } catch (err) {
    alert('Błąd sieci: ' + err.message);
  }
}

window.addToCart = addToCart;
window.checkout = checkout;
window.renderCart = renderCart;

document.addEventListener('DOMContentLoaded', () => renderCart());