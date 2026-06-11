import { useState, useEffect } from "react";

const SECTION_KEYS = [
  { key: 'move', label: '🔥 Move', color: '#ff6b35', fields: ['walk', 'sleep'] },
  { key: 'fuel', label: '⚡ Fuel', color: '#f7c948', fields: ['water', 'egg'] },
  { key: 'connect', label: '🌐 Connect', color: '#4ecdc4', fields: ['line', 'hangout', 'event'] },
  { key: 'grow', label: '🧠 Grow', color: '#a78bfa', fields: ['podcast', 'bujo'] },
  { key: 'create', label: '🎨 Create', color: '#f472b6', fields: ['idea', 'make'] },
];

const DAY_SHORT = ['อา','จ','อ','พ','พฤ','ศ','ส'];

function getThaiShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAY_SHORT[d.getDay()]} ${d.getDate()}`;
}

function getSectionScore(row, fields) {
  return fields.filter(f => row[f]).length / fields.length * 100;
}

export default function Stats() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/get-notion')
      .then(r => r.json())
      .then(d => { setRows(d.rows || []); setLoading(false); })
      .catch(() => { setError('โหลดไม่ได้'); setLoading(false); });
  }, []);

  const activeRows = rows.filter(r => r.date);
  const totalIncome = activeRows.reduce((s, r) => s + r.income, 0);
  const totalExpense = activeRows.reduce((s, r) => s + r.expense, 0);
  const avgScore = activeRows.length ? (activeRows.reduce((s, r) => s + r.score, 0) / activeRows.length).toFixed(1) : 0;

  const s = { background: '#0e0e12', minHeight: '100vh', color: '#f0f0f5', fontFamily: "'Sarabun', sans-serif", padding: '20px 16px 80px', maxWidth: 480, margin: '0 auto' };

  if (loading) return <div style={{ ...s, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#6b6b80' }}>กำลังโหลด...</div>;
  if (error) return <div style={{ ...s, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#ff6b6b' }}>{error}</div>;

  return (
    <div style={s}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#6b6b80', marginBottom: 4 }}>WEEKLY STATS</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>มิถุนายน 2026</div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Avg Score', value: avgScore, unit: '/11', color: '#f0f0f5' },
          { label: 'รายรับ', value: totalIncome.toLocaleString(), unit: '฿', color: '#4ecdc4' },
          { label: 'รายจ่าย', value: totalExpense.toLocaleString(), unit: '฿', color: '#ff6b6b' },
        ].map(card => (
          <div key={card.label} style={{ background: '#17171f', borderRadius: 12, border: '1px solid #2a2a36', padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#6b6b80', marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 10, color: '#6b6b80' }}>{card.unit}</div>
          </div>
        ))}
      </div>

      {/* Daily Score Bar Chart */}
      <div style={{ background: '#17171f', borderRadius: 16, border: '1px solid #2a2a36', padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#6b6b80', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>📊 Score รายวัน</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
          {activeRows.map((row, i) => {
            const pct = row.score / 11 * 100;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ fontSize: 8, color: '#6b6b80' }}>{row.score > 0 ? row.score : ''}</div>
                <div style={{ width: '100%', height: Math.max(2, pct * 0.6), background: pct > 60 ? '#4ecdc4' : pct > 30 ? '#f7c948' : '#2a2a36', borderRadius: '3px 3px 0 0', transition: 'height 0.4s' }} />
                <div style={{ fontSize: 8, color: '#6b6b80', whiteSpace: 'nowrap' }}>{getThaiShort(row.date).split(' ')[1]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section Breakdown */}
      <div style={{ background: '#17171f', borderRadius: 16, border: '1px solid #2a2a36', padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#6b6b80', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>📈 % แต่ละด้าน</div>
        {SECTION_KEYS.map(sec => {
          const avg = activeRows.length
            ? activeRows.reduce((s, r) => s + getSectionScore(r, sec.fields), 0) / activeRows.length
            : 0;
          return (
            <div key={sec.key} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>{sec.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: sec.color }}>{avg.toFixed(0)}%</span>
              </div>
              <div style={{ height: 6, background: '#2a2a36', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${avg}%`, background: sec.color, borderRadius: 99, transition: 'width 0.6s' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Heat Map */}
      <div style={{ background: '#17171f', borderRadius: 16, border: '1px solid #2a2a36', padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#6b6b80', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>🗓 Heat Map</div>
        <div style={{ display: 'grid', gridTemplateColumns: '44px repeat(5,1fr)', gap: 3, fontSize: 9, color: '#6b6b80', marginBottom: 4 }}>
          <div/>
          {SECTION_KEYS.map(s => <div key={s.key} style={{ textAlign: 'center' }}>{s.label.split(' ')[1]}</div>)}
        </div>
        {activeRows.filter(r => r.score > 0 || r.income > 0).slice(-14).map((row, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '44px repeat(5,1fr)', gap: 3, marginBottom: 3 }}>
            <div style={{ fontSize: 9, color: '#6b6b80', display: 'flex', alignItems: 'center' }}>{getThaiShort(row.date)}</div>
            {SECTION_KEYS.map(sec => {
              const pct = getSectionScore(row, sec.fields);
              const opacity = pct === 0 ? 0.08 : 0.2 + pct / 100 * 0.8;
              return (
                <div key={sec.key} style={{ height: 20, borderRadius: 4, background: sec.color, opacity }} />
              );
            })}
          </div>
        ))}
      </div>

      {/* Finance */}
      <div style={{ background: '#17171f', borderRadius: 16, border: '1px solid #2a2a36', padding: '14px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#6b6b80', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>💰 การเงินรายวัน</div>
        {activeRows.filter(r => r.income > 0 || r.expense > 0).map((row, i) => (
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
    </div>
  );
}
