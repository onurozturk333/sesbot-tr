export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { voiceId, text, stability, similarity, apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'API key eksik' });
  if (!voiceId) return res.status(400).json({ error: 'Voice ID eksik' });
  if (!text) return res.status(400).json({ error: 'Metin eksik' });

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_flash_v2_5',
        voice_settings: {
          stability: stability || 0.5,
          similarity_boost: similarity || 0.75,
          style: 0.35,
          use_speaker_boost: true,
        },
      }),
    });

    if (response.status === 401) return res.status(401).json({ error: 'Geçersiz API anahtarı' });
    if (response.status === 402) return res.status(402).json({ error: 'ElevenLabs planınız bu sese erişime izin vermiyor' });
    if (response.status === 403) return res.status(403).json({ error: 'TTS izni yok' });
    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(Buffer.from(buffer));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
