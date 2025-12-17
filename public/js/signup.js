document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signup-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const pesel = form.pesel.value.trim();

    if (!name || !email || !pesel) return alert('Uzupełnij wszystkie pola');
    if (!/^\S+@\S+\.\S+$/.test(email)) return alert('Nieprawidłowy e-mail');
    if (!/^\d{11}$/.test(pesel)) return alert('PESEL powinien mieć 11 cyfr');

    try {
      const res = await fetch((window.API_BASE || '') + '/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, pesel })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Dziękujemy! Twoje zgłoszenie zostało zapisane.');
        form.reset();
      } else {
        alert('Błąd: ' + (data.error || 'nieznany'));
      }
    } catch (err) {
      alert('Błąd sieci: ' + err.message);
    }
  });
});