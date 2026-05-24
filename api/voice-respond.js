export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const speechResult = req.body?.SpeechResult || '';

  let reply = 'Anladım. Size daha iyi yardımcı olmak için bir temsilciye bağlıyorum.';

  if (anthropicKey && speechResult) {
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
          max_tokens: 200,
          system: `Sen Kaya'sın, SesBot TR AI müşteri temsilcisi. Türkçe konuşuyorsun. Samimi, yardımsever ve kısa yanıtlar ver. Maksimum 3 cümle.`,
          messages: [{
            role: 'user',
            content: speechResult
          }]
        })
      });
      const data = await response.json();
      if (data.content?.[0]?.text) {
        reply = data.content[0].text;
      }
    } catch (err) {
      console.error('Claude hata:', err.message);
    }
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="tr-TR" voice="Polly.Filiz">${reply}</Say>
  <Gather input="speech" language="tr-TR" action="/api/voice-respond" timeout="5">
    <Say language="tr-TR" voice="Polly.Filiz">Başka bir konuda yardımcı olabilir miyim?</Say>
  </Gather>
  <Say language="tr-TR" voice="Polly.Filiz">Görüşmek üzere! İyi günler!</Say>
</Response>`;

  res.setHeader('Content-Type', 'text/xml');
  res.send(twiml);
}
