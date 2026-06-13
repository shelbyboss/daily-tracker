export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageBase64, mediaType } = req.body;
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageBase64 }
            },
            {
              type: 'text',
              text: 'วิเคราะห์อาหารในรูปนี้ ตอบเป็นภาษาไทย บอกว่าเห็นอาหารอะไรบ้าง แต่ละอย่างประมาณกี่แคลอรี่ และรวมทั้งหมดกี่แคลอรี่ ตอบในรูปแบบ JSON เท่านั้น ไม่ต้องมีข้อความอื่น รูปแบบ: {"items": [{"name": "ชื่ออาหาร", "calories": 000}], "total": 000}'
            }
          ]
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(400).json({ error: data });

    const text = data.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
