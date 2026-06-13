export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageBase64, mediaType, description } = req.body;
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  const descText = description ? `ข้อมูลเพิ่มเติม: ${description}` : '';
  const jsonFormat = '{"items": [{"name": "ชื่ออาหาร", "calories": 0, "protein": 0}], "total_calories": 0, "total_protein": 0}';

  try {
    const content = imageBase64 ? [
      {
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: imageBase64 }
      },
      {
        type: 'text',
        text: 'วิเคราะห์แคลอรี่และโปรตีนอาหารในรูปนี้ ' + descText + ' ตอบเป็นภาษาไทย ตอบใน JSON เท่านั้น ไม่มีข้อความอื่น รูปแบบ: ' + jsonFormat
      }
    ] : [
      {
        type: 'text',
        text: 'วิเคราะห์แคลอรี่และโปรตีนอาหารนี้: ' + description + ' ตอบเป็นภาษาไทย ตอบใน JSON เท่านั้น ไม่มีข้อความอื่น รูปแบบ: ' + jsonFormat
      }
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content }]
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
