import { useState, useEffect } from "react";

const PAGE_IDS = {
  "2026-06-01": "37c35d7f-367d-81c0-b77c-e4cb3337e8ea",
  "2026-06-02": "37c35d7f-367d-8159-87e2-d0ebd251f554",
  "2026-06-03": "37c35d7f-367d-8165-903d-f75e8310ad0b",
  "2026-06-04": "37c35d7f-367d-811e-83a8-d5894833a80e",
  "2026-06-06": "37c35d7f-367d-8100-9e07-ea6f0505d7a1",
  "2026-06-08": "37c35d7f-367d-81ae-ba1b-f9a025c73097",
  "2026-06-09": "37c35d7f-367d-8154-9f98-d65afc673c1e",
  "2026-06-10": "37c35d7f-367d-819b-9563-f343e8a3fe23",
  "2026-06-11": "37c35d7f-367d-81db-96a5-c48333238cce",
  "2026-06-12": "37c35d7f-367d-8195-9cc3-d01757c9e86e",
  "2026-06-13": "37c35d7f-367d-8120-b62a-df1c2bcbd6a0",
  "2026-06-14": "37c35d7f-367d-81f9-9e92-f01b4058ef59",
  "2026-06-15": "37c35d7f-367d-8138-8042-da91b6dbc93d",
  "2026-06-16": "37c35d7f-367d-8176-87d9-e75ff792ba53",
  "2026-06-18": "37c35d7f-367d-81a9-84e8-c8909994242e",
  "2026-06-19": "37c35d7f-367d-8185-bea5-ef1029f3b644",
  "2026-06-20": "37c35d7f-367d-8145-9072-c87bad588036",
  "2026-06-21": "37c35d7f-367d-8184-82a0-c11b02ade249",
  "2026-06-22": "37c35d7f-367d-8195-8859-fcbb5b7bd2a7",
  "2026-06-23": "37c35d7f-367d-819e-9db8-fd1be9e2a809",
  "2026-06-26": "37c35d7f-367d-8149-a720-c124f5d0f732",
  "2026-06-27": "37c35d7f-367d-81e6-91e4-c4a68326c295",
  "2026-06-28": "37c35d7f-367d-81cd-bf0a-cd7007c7bb06",
  "2026-06-29": "37c35d7f-367d-8108-8226-dc641cefcbee",
  "2026-06-30": "37c35d7f-367d-81be-a203-e64bb1362cd6",
};

const WALK_TARGET = 8000;

const SECTIONS = [
  { id: "move", icon: "🔥", name: "Move", color: "#ff6b35", items: [{ id: "Sleep 6h 😴", label: "นอน >6 ชม." }] },
  { id: "fuel", icon: "⚡", name: "Fuel", color: "#f7c948", items: [{ id: "Water 2L 💧", label: "ดื่มน้ำ 2 ลิตร" }, { id: "Egg 🥚", label: "กินไข่ 2 ฟอง" }] },
  { id: "connect", icon: "🌐", name: "Connect", color: "#4ecdc4", items: [{ id: "Line Friends 💬", label: "คุยไลน์เล่นกับเพื่อนๆ" }, { id: "Hangout 🤝", label: "ทำกิจกรรมกับเพื่อน" }, { id: "Event 🎉", label: "เข้าร่วม event/กิจกรรมใหม่" }] },
  { id: "grow", icon: "🧠", name: "Grow", color: "#a78bfa", items: [{ id: "Podcast 🎧", label: "ฟัง Podcast" }, { id: "Bujo 📓", label: "บันทึก Bujo" }] },
  { id: "create", icon: "🎨", name: "Create", color: "#f472b6", items: [{ id: "Idea Content 💡", label: "จด idea content" }, { id: "Make Content ✂️", label: "ตัด/ทำ content" }] },
];

const SECTION_KEYS = [
  { key: "move", label: "🔥 Move", color: "#ff6b35", fields: ["walk", "sleep"] },
  { key: "fuel", label: "⚡ Fuel", color: "#f7c948", fields: ["water", "egg"] },
  { key: "connect", label: "🌐 Connect", color: "#4ecdc4", fields: ["line", "hangout", "event"] },
  { key: "grow", label: "🧠 Grow", color: "#a78bfa", fields: ["podcast", "bujo"] },
  { key: "create", label: "🎨 Create", color: "#f472b6", fields: ["idea", "make"] },
];

const FIELD_MAP = {
  "Sleep 6h 😴": "sleep", "Water 2L 💧": "water", "Egg 🥚": "egg",
  "Line Friends 💬": "line", "Hangout 🤝": "hangout", "Event 🎉": "event",
  "Podcast 🎧": "podcast", "Bujo 📓": "bujo",
  "Idea Content 💡": "idea", "Make Content ✂️": "make",
};

const ALL_ITEMS = SECTIONS.flatMap(s => s.items);
const TOTAL = ALL_ITEMS.length + 1;
const DAY_SHORT = ["อา","จ","อ","พ","พฤ","ศ","ส"];

function getTodayStr() { return new Date().toISOString().slice(0, 10); }

function getThaiDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัส","ศุกร์","เสาร์"];
  const months = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}

function getThaiShort(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return `${DAY_SHORT[d.getDay()]} ${d.getDate()}`;
}

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

// ── STATS COMPONENT ──────────────────────────────────────────────────────────
function Stats() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/get-notion")
      .then(r => r.json())
      .then(d => { setRows(d.rows || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const activeRows = rows.filter(r => r.date && r.score > 0);
  const totalIncome = rows.reduce((s, r) => s + (r.income || 0), 0);
  const totalExpense = rows.reduce((s, r) => s + (r.expense || 0), 0);
  const avgScore = activeRows.length ? (activeRows.reduce((s, r) => s + r.score, 0) / activeRows.length).toFixed(1) : 0;

  const getSectionPct = (row, fields) => fields.filter(f => row[f]).length / fields.length * 100;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#6b6b80", fontSize: 14 }}>
      กำลังโหลด...
    </div>
  );

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#6b6b80", marginBottom: 4 }}>WEEKLY STATS</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>มิถุนายน 2026</div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Avg Score", value: avgScore, unit: `/11`, color: "#f0f0f5" },
          { label: "รายรับ", value: totalIncome.toLocaleString(), unit: "฿", color: "#4ecdc4" },
          { label: "รายจ่าย", value: totalExpense.toLocaleString(), unit: "฿", color: "#ff6b6b" },
        ].map(card => (
          <div key={card.label} style={{ background: "#17171f", borderRadius: 12, border: "1px solid #2a2a36", padding: "12px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#6b6b80", marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 10, color: "#6b6b80" }}>{card.unit}</div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div style={{ background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#6b6b80", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>📊 Score รายวัน</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 80 }}>
          {rows.filter(r => r.date).slice(-14).map((row, i) => {
            const pct = (row.score || 0) / 11 * 100;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{ fontSize: 8, color: "#6b6b80" }}>{row.score > 0 ? row.score : ""}</div>
                <div style={{ width: "100%", height: Math.max(2, pct * 0.6), background: pct > 60 ? "#4ecdc4" : pct > 30 ? "#f7c948" : "#2a2a36", borderRadius: "3px 3px 0 0" }} />
                <div style={{ fontSize: 8, color: "#6b6b80" }}>{getThaiShort(row.date).split(" ")[1]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section Bars */}
      <div style={{ background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#6b6b80", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>📈 % แต่ละด้าน</div>
        {SECTION_KEYS.map(sec => {
          const avg = activeRows.length ? activeRows.reduce((s, r) => s + getSectionPct(r, sec.fields), 0) / activeRows.length : 0;
          return (
            <div key={sec.key} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>{sec.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: sec.color }}>{avg.toFixed(0)}%</span>
              </div>
              <div style={{ height: 6, background: "#2a2a36", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${avg}%`, background: sec.color, borderRadius: 99 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Heat Map */}
      <div style={{ background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#6b6b80", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>🗓 Heat Map</div>
        <div style={{ display: "grid", gridTemplateColumns: "40px repeat(5,1fr)", gap: 3, fontSize: 9, color: "#6b6b80", marginBottom: 6 }}>
          <div />
          {SECTION_KEYS.map(s => <div key={s.key} style={{ textAlign: "center" }}>{s.label.split(" ")[1]}</div>)}
        </div>
        {rows.filter(r => r.date).slice(-10).map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "40px repeat(5,1fr)", gap: 3, marginBottom: 3 }}>
            <div style={{ fontSize: 9, color: "#6b6b80", display: "flex", alignItems: "center" }}>{getThaiShort(row.date)}</div>
            {SECTION_KEYS.map(sec => {
              const pct = getSectionPct(row, sec.fields);
              return (
                <div key={sec.key} style={{ height: 18, borderRadius: 4, background: sec.color, opacity: pct === 0 ? 0.08 : 0.2 + pct / 100 * 0.8 }} />
              );
            })}
          </div>
        ))}
      </div>

      {/* Finance */}
      <div style={{ background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", padding: "14px 16px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#6b6b80", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>💰 การเงินรายวัน</div>
        {rows.filter(r => r.income > 0 || r.expense > 0).length === 0
          ? <div style={{ fontSize: 13, color: "#6b6b80", textAlign: "center", padding: "16px 0" }}>ยังไม่มีข้อมูลครับ</div>
          : rows.filter(r => r.income > 0 || r.expense > 0).map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #2a2a36" }}>
              <div style={{ fontSize: 13, color: "#6b6b80" }}>{getThaiShort(row.date)}</div>
              <div style={{ display: "flex", gap: 12 }}>
                {row.income > 0 && <span style={{ fontSize: 13, color: "#4ecdc4" }}>+{row.income.toLocaleString()}</span>}
                {row.expense > 0 && <span style={{ fontSize: 13, color: "#ff6b6b" }}>-{row.expense.toLocaleString()}</span>}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const today = getTodayStr();
  const weekDates = getWeekDates();
  const [tab, setTab] = useState("check");
  const [selected, setSelected] = useState(today);
  const [checks, setChecks] = useState({});
  const [walkSteps, setWalkSteps] = useState({});
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");
  const [status, setStatus] = useState(null);

  const dayChecks = checks[selected] || {};
  const steps = walkSteps[selected] || "";
  const walkScore = steps ? Math.min(1, parseInt(steps) / WALK_TARGET) : 0;
  const checkScore = ALL_ITEMS.filter(item => dayChecks[item.id]).length;
  const scoreDisplay = parseFloat((walkScore + checkScore).toFixed(1));

  const toggle = (itemId) => {
    setChecks(prev => ({ ...prev, [selected]: { ...prev[selected], [itemId]: !prev[selected]?.[itemId] } }));
    setStatus(null);
  };

  const getDayScore = (date) => {
    const d = checks[date] || {};
    const w = walkSteps[date] ? Math.min(1, parseInt(walkSteps[date]) / WALK_TARGET) : 0;
    return w + ALL_ITEMS.filter(item => d[item.id]).length;
  };

  const submit = async () => {
    setStatus("loading");
    try {
      const pageId = PAGE_IDS[selected];
      if (!pageId) { setStatus("error"); return; }
      const properties = {};
      ALL_ITEMS.forEach(item => { properties[item.id] = { checkbox: !!dayChecks[item.id] }; });
      properties["Walk 8k 👟"] = { checkbox: steps ? parseInt(steps) >= WALK_TARGET : false };
      if (steps) properties["Daily Score"] = { number: parseInt(steps) };
      if (income) properties["รายรับ 💰"] = { number: parseFloat(income) };
      if (expense) properties["รายจ่าย 💸"] = { number: parseFloat(expense) };
      const res = await fetch("/api/update-notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, properties }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch { setStatus("error"); }
  };

  return (
    <div style={{ background: "#0e0e12", minHeight: "100vh", color: "#f0f0f5", fontFamily: "'Sarabun', sans-serif", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ padding: "20px 16px 100px" }}>

        {tab === "check" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#6b6b80", marginBottom: 4 }}>DAILY TRACKER</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{getThaiDate(selected)}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, background: "#17171f", borderRadius: 99, padding: "4px 14px", border: "1px solid #2a2a36" }}>
                <span style={{ fontSize: 13, color: "#6b6b80" }}>Score</span>
                <span style={{ fontSize: 18, fontWeight: 700 }}>{scoreDisplay}</span>
                <span style={{ fontSize: 13, color: "#6b6b80" }}>/ {TOTAL}</span>
              </div>
            </div>

            {/* Day Picker */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, marginBottom: 20 }}>
              {weekDates.map((date) => {
                const d = new Date(date + "T00:00:00");
                const isActive = date === selected;
                const isToday = date === today;
                const sc = getDayScore(date);
                const dots = Math.min(3, Math.round(sc / TOTAL * 3.5));
                return (
                  <div key={date} onClick={() => { setSelected(date); setStatus(null); setIncome(""); setExpense(""); }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 4px", borderRadius: 10, border: `1px solid ${isActive ? "#f0f0f5" : "#2a2a36"}`, background: isActive ? "#f0f0f5" : "#17171f", cursor: "pointer", userSelect: "none" }}>
                    <div style={{ fontSize: 10, color: isActive ? "#0e0e12" : "#6b6b80" }}>{DAY_SHORT[d.getDay()]}{isToday ? "·" : ""}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: isActive ? "#0e0e12" : "#f0f0f5" }}>{d.getDate()}</div>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: isActive ? (i < dots ? "#0e0e12" : "rgba(0,0,0,0.15)") : (i < dots ? "#f0f0f5" : "#2a2a36") }} />)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Walk */}
            <div style={{ marginBottom: 12, background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🔥</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#ff6b35" }}>Move</span>
                </div>
                <span style={{ fontSize: 11, color: "#6b6b80" }}>{steps ? `${Math.round(walkScore * 100)}%` : "0%"} · {walkScore.toFixed(2)} คะแนน</span>
              </div>
              <div style={{ height: 1, background: "#2a2a36", marginBottom: 12 }} />
              <div style={{ fontSize: 12, color: "#6b6b80", marginBottom: 6 }}>👟 จำนวนก้าววันนี้</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="number" value={steps}
                  onChange={e => { setWalkSteps(prev => ({ ...prev, [selected]: e.target.value })); setStatus(null); }}
                  placeholder="0"
                  style={{ flex: 1, background: "#0e0e12", border: `1px solid ${steps && parseInt(steps) >= WALK_TARGET ? "#ff6b35" : "#2a2a36"}`, borderRadius: 8, padding: "10px 12px", color: "#f0f0f5", fontSize: 16, outline: "none" }} />
                <div style={{ fontSize: 12, color: "#6b6b80" }}>/ 8,000</div>
              </div>
              <div style={{ marginTop: 8, height: 4, background: "#2a2a36", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(100, walkScore * 100)}%`, background: "#ff6b35", borderRadius: 99 }} />
              </div>
              {steps && <div style={{ marginTop: 4, fontSize: 11, color: parseInt(steps) >= WALK_TARGET ? "#ff6b35" : "#6b6b80" }}>
                {parseInt(steps) >= WALK_TARGET ? "✅ ถึงเป้าแล้ว!" : `ขาดอีก ${(WALK_TARGET - parseInt(steps)).toLocaleString()} ก้าว`}
              </div>}
            </div>

            {/* Sections */}
            {SECTIONS.map(sec => {
              const done = sec.items.filter(item => dayChecks[item.id]).length;
              return (
                <div key={sec.id} style={{ marginBottom: 12, background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{sec.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: sec.color }}>{sec.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 40, height: 3, background: "#2a2a36", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${done/sec.items.length*100}%`, background: sec.color, borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#6b6b80" }}>{done}/{sec.items.length}</span>
                    </div>
                  </div>
                  <div style={{ height: 1, background: "#2a2a36", margin: "0 16px 8px" }} />
                  <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                    {sec.items.map(item => {
                      const checked = !!dayChecks[item.id];
                      return (
                        <div key={item.id} onClick={() => toggle(item.id)}
                          style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "10px 12px", borderRadius: 10, border: `1px solid ${checked ? "transparent" : "#2a2a36"}`, background: checked ? "rgba(255,255,255,0.02)" : "#0e0e12", userSelect: "none" }}>
                          <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: checked ? sec.color : "transparent", border: `2px solid ${checked ? sec.color : "#2a2a36"}`, color: checked ? "#fff" : "transparent" }}>✓</div>
                          <span style={{ fontSize: 14, color: checked ? "#6b6b80" : "#f0f0f5", textDecoration: checked ? "line-through" : "none" }}>{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Finance */}
            <div style={{ marginBottom: 16, background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", padding: "14px 16px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6b6b80", marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>💰 การเงินวันนี้</div>
              <div style={{ display: "flex", gap: 10 }}>
                {[["รายรับ 💰", income, setIncome], ["รายจ่าย 💸", expense, setExpense]].map(([label, val, setter]) => (
                  <div key={label} style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#6b6b80", marginBottom: 4 }}>{label}</div>
                    <input type="number" value={val} onChange={e => { setter(e.target.value); setStatus(null); }} placeholder="0"
                      style={{ width: "100%", background: "#0e0e12", border: "1px solid #2a2a36", borderRadius: 8, padding: "8px 10px", color: "#f0f0f5", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button onClick={submit} disabled={status === "loading"} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: status === "success" ? "#4ecdc4" : status === "error" ? "#ff6b6b" : "#f0f0f5", color: "#0e0e12", fontSize: 15, fontWeight: 700, cursor: status === "loading" ? "not-allowed" : "pointer", opacity: status === "loading" ? 0.7 : 1 }}>
              {status === "loading" ? "⏳ กำลังบันทึก..." : status === "success" ? "✅ บันทึกเข้า Notion แล้ว!" : status === "error" ? "❌ ลองอีกครั้ง" : "📤 Save to Notion"}
            </button>
            {status === "success" && <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#6b6b80" }}>Score {scoreDisplay}/{TOTAL} · {getThaiDate(selected)} 🎉</div>}
          </>
        )}

        {tab === "stats" && <Stats />}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#17171f", borderTop: "1px solid #2a2a36", display: "flex", zIndex: 100 }}>
        {[{ id: "check", icon: "✅", label: "Check" }, { id: "stats", icon: "📊", label: "Stats" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "12px 0", background: "transparent", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 11, color: tab === t.id ? "#f0f0f5" : "#6b6b80", fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</span>
            {tab === t.id && <div style={{ width: 20, height: 2, background: "#f0f0f5", borderRadius: 99 }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
