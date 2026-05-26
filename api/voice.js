export default async function handler(req, res) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  let greeting = 'Merhaba! Ben Kaya, SesBot TR müşteri temsilcisi. Size nasıl yardımcı olabilirim?';

  if (anthropicKey) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 150,
          messages: [{
            role: 'user',
            content: 'Sen Kaya sin, SesBot TR yapay zeka musteri temsilcisi. Telefonu yeni acan bir musteriye Turkce kisa ve sicak bir karsilama soyle. Maksimum 2 cumle.'
          }]
        })
      });
      const data = await response.json();
      if (data.content?.[0]?.text) greeting = data.content[0].text;
    } catch (err) {
      console.error('Claude hata:', err.message);
    }
  }

  // Türkçe Amazon Polly sesi - Filiz
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="tr-TR" voice="Polly.Filiz">${greeting}</Say>
  <Gather input="speech" language="tr-TR" speechTimeout="3" action="/api/voice-respond" method="POST">
    <Say language="tr-TR" voice="Polly.Filiz">Sizi dinliyorum, buyurun.</Say>
  </Gather>
  <Say language="tr-TR" voice="Polly.Filiz">Yanit alamadim. Lutfen tekrar arayin. Iyi gunler!</Say>
</Response>`;

  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.send(twiml);
}
