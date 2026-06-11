export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const NOTION_API_KEY = process.env.VITE_NOTION_API_KEY;
  const DB_ID = '8473e7569526433e9dd583a187257a5e';

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        sorts: [{ property: 'Date', direction: 'ascending' }],
        page_size: 30,
      }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(400).json({ error: data });

    const rows = data.results.map(page => {
      const p = page.properties;
      const getCheck = (key) => p[key]?.checkbox || false;
      const getNum = (key) => p[key]?.number || 0;
      const getDate = () => p['Date']?.date?.start || '';
      return {
        date: getDate(),
        walk: getCheck('Walk 8k 👟'),
        sleep: getCheck('Sleep 6h 😴'),
        water: getCheck('Water 2L 💧'),
        egg: getCheck('Egg 🥚'),
        line: getCheck('Line Friends 💬'),
        hangout: getCheck('Hangout 🤝'),
        event: getCheck('Event 🎉'),
        podcast: getCheck('Podcast 🎧'),
        bujo: getCheck('Bujo 📓'),
        idea: getCheck('Idea Content 💡'),
        make: getCheck('Make Content ✂️'),
        score: getNum('Score 🏆'),
        income: getNum('รายรับ 💰'),
        expense: getNum('รายจ่าย 💸'),
      };
    });

    return res.status(200).json({ rows });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
