export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken) return res.status(500).json({ error: 'Twilio credentials eksik' });

  const { to } = req.body;
  if (!to) return res.status(400).json({ error: 'Telefon numarası eksik' });

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(accountSid + ':' + authToken).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To:   to,
          From: fromNumber,
          Url:  'https://sesbot-tr.vercel.app/api/voice',
        }).toString(),
      }
    );

    const data = await response.json();
    if (!response.ok) return res.status(400).json({ error: data.message || 'Twilio hatası' });

    res.json({ success: true, callSid: data.sid, status: data.status });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
