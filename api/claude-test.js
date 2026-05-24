export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { apiKey, message, messages, system } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'API key eksik' });

  // message zorunlu değil — messages listesi varsa oradan al
  const userMessage = message || (messages && messages.length > 0 ? messages[messages.length-1]?.content : null) || 'Merhaba';

  try {
    const systemPrompt = system || "Sen Kaya'sin, SesBot TR yapay zeka musteri temsilcisi. Turkce konus, samimi ve kisa yanitlar ver. Maksimum 3 cumle.";
    const msgList = messages && messages.length > 0 ? messages : [{ role: 'user', content: userMessage }];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: systemPrompt,
        messages: msgList,
      }),
    });

    if (response.status === 401) return res.status(401).json({ error: 'Gecersiz API anahtari' });
    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err.slice(0, 100) });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Yanit alinamadi.';
    res.json({ reply });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
