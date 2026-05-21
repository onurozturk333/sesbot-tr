export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { apiKey, voiceId } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'API key eksik' });
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId || 's6NwEvQL6ubnC5i0wAGj'}`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify({ text: 'Merhaba!', model_id: 'eleven_flash_v2_5', voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
    });
    if (response.status === 401) return res.status(401).json({ error: 'Geçersiz API anahtarı' });
    if (response.status === 402) return res.status(402).json({ error: 'Plan yetersiz' });
    if (!response.ok) { const err = await response.text(); return res.status(response.status).json({ error: err }); }
    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
