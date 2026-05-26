export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return res.status(500).json({ error: 'Stripe key eksik' });

  const { plan } = req.body || {};

  const prices = {
    starter:      { amount: 8999,  name: 'SesBot TR Baslangiç', description: 'Aylik 500 dakika, 1 ajan' },
    professional: { amount: 15000, name: 'SesBot TR Profesyonel', description: 'Aylik 2000 dakika, 5 ajan' },
  };

  const selected = prices[plan] || prices.starter;

  try {
    const params = new URLSearchParams();
    params.append('payment_method_types[]', 'card');
    params.append('line_items[0][price_data][currency]', 'usd');
    params.append('line_items[0][price_data][product_data][name]', selected.name);
    params.append('line_items[0][price_data][product_data][description]', selected.description);
    params.append('line_items[0][price_data][unit_amount]', String(selected.amount));
    params.append('line_items[0][price_data][recurring][interval]', 'month');
    params.append('line_items[0][quantity]', '1');
    params.append('mode', 'subscription');
    params.append('success_url', 'https://sesbot-tr.vercel.app/success.html?plan=' + (plan || 'starter'));
    params.append('cancel_url', 'https://sesbot-tr.vercel.app/index.html');

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + stripeKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await response.json();

    if (!response.ok) {
      console.error('Stripe error:', session);
      return res.status(400).json({ error: session.error?.message || 'Stripe hatasi' });
    }

    res.json({ url: session.url });

  } catch (err) {
    console.error('Handler error:', err);
    res.status(500).json({ error: err.message });
  }
}
