import { useState, useEffect } from "react";

const DAY_SHORT = ['อา','จ','อ','พ','พฤ','ศ','ส'];

function getWeekDates() {
  const today = new Date();
  const sun = new Date(today);
  sun.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sun);
    d.setDate(sun.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function getThaiShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAY_SHORT[d.getDay()]} ${d.getDate()}`;
}

function calcStats(rows, weekDates) {
  const weekRows = weekDates.map(date => rows.find(r => r.date === date) || null);
  const pct = (vals) => Math.round((vals.filter(Boolean).length / 7) * 100);
  const walkPct = pct(weekRows.map(r => r?.walk));
  const sleepPct = pct(weekRows.map(r => r?.sleep));
  const workoutPct = pct(weekRows.map(r => r?.workout));
  const movePct = Math.round((walkPct + sleepPct + workoutPct * 2) / 4);
  const fuelPct = Math.round((pct(weekRows.map(r => r?.water)) + pct(weekRows.map(r => r?.egg))) / 2);
  const connectPct = Math.round((pct(weekRows.map(r => r?.hangout)) + pct(weekRows.map(r => r?.event)) + pct(weekRows.map(r => r?.tiktok))) / 3);
  const growPct = Math.round((pct(weekRows.map(r => r?.podcast)) + pct(weekRows.map(r => r?.bujo)) + pct(weekRows.map(r => r?.learnCategory))) / 3);
  const createPct = Math.round((pct(weekRows.map(r => r?.idea)) + pct(weekRows.map(r => r?.postReal)) * 3) / 4);
  return { movePct, fuelPct, connectPct, growPct, createPct };
}

function getClass(stats) {
  const { movePct, fuelPct, connectPct, growPct, createPct } = stats;
  const all = [movePct, fuelPct, connectPct, growPct, createPct];
  const avg = all.reduce((a, b) => a + b, 0) / 5;
  if (avg >= 70) return { icon: "👑", name: "Shadow Monarch", color: "#a78bfa" };
  const max = Math.max(...all);
  if (max === movePct) return { icon: "⚔️", name: "Warrior", color: "#ff6b35" };
  if (max === growPct) return { icon: "🧙", name: "Mage", color: "#a78bfa" };
  if (max === createPct) return { icon: "🎨", name: "Artist", color: "#f472b6" };
  if (max === connectPct) return { icon: "🌐", name: "Ranger", color: "#4ecdc4" };
  if (max === fuelPct) return { icon: "⚡", name: "Guardian", color: "#f7c948" };
  return { icon: "❓", name: "Unknown", color: "#6b6b80" };
}

function RadarChart({ stats }) {
  const { movePct, fuelPct, connectPct, growPct, createPct } = stats;
  const cls = getClass(stats);
  const size = 280, cx = size / 2, cy = size / 2, r = 100;
  const axes = [
    { label: "MOVE", pct: movePct, color: "#ff6b35" },
    { label: "CREATE", pct: createPct, color: "#f472b6" },
    { label: "FUEL", pct: fuelPct, color: "#f7c948" },
    { label: "CONNECT", pct: connectPct, color: "#4ecdc4" },
    { label: "GROW", pct: growPct, color: "#a78bfa" },
  ];
  const angle = (i) => (Math.PI * 2 * i) / 5 - Math.PI / 2;
  const point = (i, pct) => { const a = angle(i), dist = (pct / 100) * r; return { x: cx + dist * Math.cos(a), y: cy + dist * Math.sin(a) }; };
  const outerPoint = (i) => { const a = angle(i); return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }; };
  const labelPoint = (i) => { const a = angle(i), dist = r + 28; return { x: cx + dist * Math.cos(a), y: cy + dist * Math.sin(a) }; };
  const dataPoints = axes.map((ax, i) => point(i, ax.pct));
  const polygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {[25,50,75,100].map(g => {
          const pts = axes.map((_, i) => { const a = angle(i), dist = (g/100)*r; return `${cx+dist*Math.cos(a)},${cy+dist*Math.sin(a)}`; }).join(' ');
          return <polygon key={g} points={pts} fill="none" stroke="#2a2a36" strokeWidth="1" />;
        })}
        {axes.map((_, i) => { const op = outerPoint(i); return <line key={i} x1={cx} y1={cy} x2={op.x} y2={op.y} stroke="#2a2a36" strokeWidth="1" />; })}
        <polygon points={polygon} fill={`${cls.color}30`} stroke={cls.color} strokeWidth="2" strokeLinejoin="round" />
        {dataPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill={axes[i].color} />)}
        {axes.map((ax, i) => { const lp = labelPoint(i); return (
          <g key={i}>
            <text x={lp.x} y={lp.y-6} textAnchor="middle" fill={ax.color} fontSize="10" fontWeight="700" fontFamily="Sarabun, sans-serif">{ax.label}</text>
            <text x={lp.x} y={lp.y+8} textAnchor="middle" fill="#6b6b80" fontSize="9" fontFamily="Sarabun, sans-serif">{ax.pct}%</text>
          </g>
        ); })}
        <text x={cx} y={cy-8} textAnchor="middle" fontSize="22">{cls.icon}</text>
        <text x={cx} y={cy+12} textAnchor="middle" fill={cls.color} fontSize="11" fontWeight="700" fontFamily="Sarabun, sans-serif">{cls.name}</text>
      </svg>
    </div>
  );
}

export default function Stats() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const weekDates = getWeekDates();

  useEffect(() => {
    fetch('/api/get-notion')
      .then(r => r.json())
      .then(d => { setRows(d.rows || []); setLoading(false); })
      .catch(() => { setError('โหลดไม่ได้'); setLoading(false); });
  }, []);

  const s = { background: '#0e0e12', minHeight: '100vh', color: '#f0f0f5', fontFamily: "'Sarabun', sans-serif", padding: '20px 16px 80px', maxWidth: 480, margin: '0 auto' };

  const BottomNav = () => (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#17171f", borderTop: "1px solid #2a2a36", display: "flex", justifyContent: "space-around", padding: "10px 0 20px", zIndex: 100 }}>
      <div onClick={() => window.location.href = '/'} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", opacity: 0.4 }}>
        <span style={{ fontSize: 20 }}>✅</span><span style={{ fontSize: 10, color: "#f0f0f5" }}>Check</span>
      </div>
      <div onClick={() => window.location.href = '/'} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", opacity: 0.4 }}>
        <span style={{ fontSize: 20 }}>💪</span><span style={{ fontSize: 10, color: "#f0f0f5" }}>Workout</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: 1 }}>
        <span style={{ fontSize: 20 }}>📊</span><span style={{ fontSize: 10, color: "#f0f0f5" }}>Stats</span>
      </div>
    </div>
  );

  if (loading) return <div style={{ ...s, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#6b6b80' }}>กำลังโหลด...<BottomNav /></div>;
  if (error) return <div style={{ ...s, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#ff6b6b' }}>{error}<BottomNav /></div>;

  const activeRows = rows.filter(r => r.date);
  const totalIncome = activeRows.reduce((s, r) => s + r.income, 0);
  const totalExpense = activeRows.reduce((s, r) => s + r.expense, 0);

  const getDayScore = (row) => {
    if (!row) return 0;
    const walk = row.walkSteps ? Math.min(0.5, row.walkSteps / 6500 * 0.5) : 0;
    const sleep = row.sleepHours ? Math.min(0.5, row.sleepHours / 6 * 0.5) : 0;
    const workout = row.workout ? 2 : 0;
    const water = row.water ? 0.5 : 0;
    const egg = row.egg ? 0.5 : 0;
    const hangout = row.hangout ? 1 : 0;
    const event = row.event ? 1 : 0;
    const tiktok = row.tiktok ? 0.5 : 0;
    const podcast = row.podcast ? 1 : 0;
    const bujo = row.bujo ? 0.5 : 0;
    const learn = row.learnCategory ? 1 : 0;
    const idea = row.idea ? 0.5 : 0;
    const post = row.postReal ? 1.5 : 0;
    return walk + sleep + workout + water + egg + hangout + event + tiktok + podcast + bujo + learn + idea + post;
  };

  const scored = activeRows.map(r => ({ date: r.date, score: getDayScore(r), cal: r.workoutCalories || 0 }));
  const avg = scored.length ? (scored.reduce((a, b) => a + b.score, 0) / scored.length).toFixed(1) : 0;
  const best = scored.reduce((a, b) => b.score > a.score ? b : a, scored[0] || { score: 0 });
  const workoutDays = weekDates.filter(d => rows.find(r => r.date === d)?.workout).length;
  const weekCalTotal = weekDates.reduce((sum, d) => sum + (rows.find(r => r.date === d)?.workoutCalories || 0), 0);
  const weekStats = calcStats(rows, weekDates);
  const cls = getClass(weekStats);

  return (
    <div style={s}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#6b6b80', marginBottom: 4 }}>STATS</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>ภาพรวม</div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Avg Score', value: avg, unit: '/10', color: '#f0f0f5' },
          { label: 'รายรับรวม', value: totalIncome.toLocaleString(), unit: '฿', color: '#4ecdc4' },
          { label: 'รายจ่ายรวม', value: totalExpense.toLocaleString(), unit: '฿', color: '#ff6b6b' },
        ].map(card => (
          <div key={card.label} style={{ background: '#17171f', borderRadius: 12, border: '1px solid #2a2a36', padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#6b6b80', marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 10, color: '#6b6b80' }}>{card.unit}</div>
          </div>
        ))}
      </div>

      {/* Radar Chart */}
      <div style={{ background: '#17171f', borderRadius: 16, border: `1px solid ${cls.color}40`, padding: '16px', marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#6b6b80', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>⚡ Weekly Stats</div>
        <div style={{ fontSize: 11, color: '#6b6b80', marginBottom: 16 }}>สัปดาห์นี้ (% จาก 7 วัน)</div>
        <RadarChart stats={weekStats} />
      </div>

      {/* Workout Cal สัปดาห์ */}
      <div style={{ background: '#17171f', borderRadius: 16, border: '1px solid #ff6b35', padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#6b6b80', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>🔥 Calories สัปดาห์นี้</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 12 }}>
          {weekDates.map(date => {
            const d = new Date(date + 'T00:00:00');
            const row = rows.find(r => r.date === date);
            const cal = row?.workoutCalories || 0;
            const maxCal = Math.max(...weekDates.map(d2 => rows.find(r => r.date === d2)?.workoutCalories || 0), 1);
            return (
              <div key={date} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#6b6b80', marginBottom: 4 }}>{DAY_SHORT[d.getDay()]}</div>
                <div style={{ height: 40, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 4 }}>
                  <div style={{ width: '80%', height: `${(cal/maxCal)*100}%`, minHeight: cal > 0 ? 4 : 0, background: '#ff6b35', borderRadius: '3px 3px 0 0', transition: 'height 0.3s' }} />
                </div>
                <div style={{ fontSize: 8, color: cal > 0 ? '#ff6b35' : '#2a2a36' }}>{cal > 0 ? cal : '-'}</div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: 'center', fontSize: 13, color: '#ff6b35', fontWeight: 700 }}>
          รวมสัปดาห์นี้ {weekCalTotal.toLocaleString()} kcal
        </div>
      </div>

      {/* Score Bar Chart */}
      <div style={{ background: '#17171f', borderRadius: 16, border: '1px solid #2a2a36', padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#6b6b80', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>📊 Score รายวัน</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
          {scored.slice(-14).map((row, i) => {
            const pct = row.score / 10 * 100;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ fontSize: 8, color: '#6b6b80' }}>{row.score > 0 ? row.score.toFixed(1) : ''}</div>
                <div style={{ width: '100%', height: Math.max(2, pct * 0.6), background: pct > 60 ? '#4ecdc4' : pct > 30 ? '#f7c948' : '#2a2a36', borderRadius: '3px 3px 0 0', transition: 'height 0.4s' }} />
                <div style={{ fontSize: 8, color: '#6b6b80' }}>{new Date(row.date + 'T00:00:00').getDate()}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workout Week */}
      <div style={{ background: '#17171f', borderRadius: 16, border: '1px solid #2a2a36', padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#6b6b80', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>💪 Workout สัปดาห์นี้</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
          {weekDates.map(date => {
            const d = new Date(date + 'T00:00:00');
            const done = rows.find(r => r.date === date)?.workout;
            return (
              <div key={date} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#6b6b80', marginBottom: 4 }}>{DAY_SHORT[d.getDay()]}</div>
                <div style={{ width: '100%', aspectRatio: '1', borderRadius: 6, background: done ? '#ff6b35' : '#2a2a36', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{done ? '💪' : ''}</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: workoutDays >= 3 ? '#4ecdc4' : '#6b6b80', textAlign: 'center' }}>
          {workoutDays >= 3 ? `✅ ${workoutDays} วัน — เป้าหมายสำเร็จ!` : `${workoutDays}/3 วัน — ต้องการอีก ${3 - workoutDays} วัน`}
        </div>
      </div>

      {/* Finance */}
      <div style={{ background: '#17171f', borderRadius: 16, border: '1px solid #2a2a36', padding: '14px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#6b6b80', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>💰 การเงินรายวัน</div>
        {activeRows.filter(r => r.income > 0 || r.expense > 0).slice(-10).map((row, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #2a2a36' }}>
            <div style={{ fontSize: 13, color: '#6b6b80' }}>{getThaiShort(row.date)}</div>
            <div style={{ display: 'flex', gap: 16 }}>
              {row.income > 0 && <div style={{ fontSize: 13, color: '#4ecdc4' }}>+{row.income.toLocaleString()}</div>}
              {row.expense > 0 && <div style={{ fontSize: 13, color: '#ff6b6b' }}>-{row.expense.toLocaleString()}</div>}
            </div>
          </div>
        ))}
        {activeRows.filter(r => r.income > 0 || r.expense > 0).length === 0 && (
          <div style={{ fontSize: 13, color: '#6b6b80', textAlign: 'center', padding: '20px 0' }}>ยังไม่มีข้อมูลการเงินครับ</div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
