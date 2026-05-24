export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // Çağrı bilgileri
  const callerNumber = req.body?.From || 'Bilinmeyen';
  const callSid = req.body?.CallSid || '';

  // Claude'dan karşılama metni al
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
            content: `Sen Kaya'sın, SesBot TR AI müşteri temsilcisi. Türkçe konuşuyorsun. Telefonu yeni açan bir müşteriye kısa ve samimi bir karşılama cümlesi söyle. Maksimum 2 cümle.`
          }]
        })
      });
      const data = await response.json();
      if (data.content?.[0]?.text) {
        greeting = data.content[0].text;
      }
    } catch (err) {
      console.error('Claude hata:', err.message);
    }
  }

  // TwiML yanıtı - Twilio bu XML'i okuyarak sesi sentezler
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="tr-TR" voice="Polly.Filiz">${greeting}</Say>
  <Gather input="speech" language="tr-TR" action="/api/voice-respond" timeout="5">
    <Say language="tr-TR" voice="Polly.Filiz">Sizi dinliyorum.</Say>
  </Gather>
  <Say language="tr-TR" voice="Polly.Filiz">Yanıt alamadım. Lütfen tekrar arayın. İyi günler!</Say>
</Response>`;

  res.setHeader('Content-Type', 'text/xml');
  res.send(twiml);
}
