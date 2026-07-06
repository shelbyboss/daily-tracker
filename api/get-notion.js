export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const NOTION_API_KEY = process.env.VITE_NOTION_API_KEY;
  const DB_ID = '8473e7569526433e9dd583a187257a5e';

  try {
    let allResults = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
      const body = {
        sorts: [{ property: 'Date', direction: 'ascending' }],
        page_size: 100,
      };
      if (startCursor) body.start_cursor = startCursor;

      const response = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) return res.status(400).json({ error: data });

      allResults = allResults.concat(data.results);
      hasMore = data.has_more;
      startCursor = data.next_cursor;
    }

    const rows = allResults.map(page => {
      const p = page.properties;
      const getCheck = (key) => p[key]?.checkbox || false;
      const getNum = (key) => p[key]?.number || 0;
      const getText = (key) => p[key]?.rich_text?.[0]?.text?.content || '';
      const getSelect = (key) => p[key]?.select?.name || '';
      const getDate = () => p['Date']?.date?.start || '';

      // Parse workout log string → object
      const workoutLogStr = getText('Workout Log 📝');
      const workoutLogParsed = {};
      if (workoutLogStr) {
        workoutLogStr.split(' | ').forEach(part => {
          const colonIdx = part.indexOf(':');
          if (colonIdx === -1) return;
          const exName = part.slice(0, colonIdx).trim();
          const setsStr = part.slice(colonIdx + 1).trim();
          const sets = setsStr.split(', ').map(s => {
            const match = s.match(/^(\d+)x(\d+)(?:@([\d.]+)kg)?$/);
            if (match) return { sets: match[1], reps: match[2], kg: match[3] || '' };
            return null;
          }).filter(Boolean);
          if (sets.length > 0) workoutLogParsed[exName] = sets;
        });
      }

      return {
        pageId: page.id,
        date: getDate(),
        walk: getCheck('Walk 8k 👟'),
        sleep: getCheck('Sleep 6h 😴'),
        workout: getCheck('Workout 💪'),
        walkSteps: getNum('Walk Steps'),
        sleepHours: getNum('Sleep Hours'),
        water: getCheck('Water 2L 💧'),
        egg: getCheck('Egg 🥚'),
        hangout: getCheck('Hangout 🤝'),
        event: getCheck('Event 🎉'),
        tiktok: getCheck('TikTok 🔥'),
        podcast: getCheck('Podcast 🎧'),
        bujo: getCheck('Bujo 📓'),
        learnCategory: getSelect('Learn Category'),
        learnDetail: getText('Learn Detail'),
        idea: getCheck('Idea Content 💡'),
        postReal: getCheck('Post Real ✅'),
        income: getNum('รายรับ 💰'),
        expense: getNum('รายจ่าย 💸'),
        dailyScore: getNum('Daily Score'),
        workoutCalories: getNum('Workout Calories'),
        workoutLog: workoutLogStr,
        workoutLogParsed,
      };
    });

    return res.status(200).json({ rows });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
