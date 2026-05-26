export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return res.status(500).json({ error: 'Stripe key eksik' });

  const { plan } = req.body;

  const prices = {
    starter:      { amount: 8999, name: 'SesBot TR Başlangıç', description: 'Aylık 500 dakika · 1 ajan' },
    professional: { amount: 15000, name: 'SesBot TR Profesyonel', description: 'Aylık 2000 dakika · 5 ajan' },
  };

  const selected = prices[plan] || prices.starter;

  try {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + stripeKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][product_data][name]': selected.name,
        'line_items[0][price_data][product_data][description]': selected.description,
        'line_items[0][price_data][unit_amount]': selected.amount,
        'line_items[0][price_data][recurring][interval]': 'month',
        'line_items[0][quantity]': '1',
        'mode': 'subscription',
        'success_url': 'https://sesbot-tr.vercel.app/success.html?plan=' + plan,
        'cancel_url': 'https://sesbot-tr.vercel.app/index.html#fiyatlar',
      }).toString(),
    });

    const session = await response.json();
    if (!response.ok) return res.status(400).json({ error: session.error?.message || 'Stripe hatası' });

    res.json({ url: session.url });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
