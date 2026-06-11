import { useState } from "react";

const NOTION_API_KEY = import.meta.env.VITE_NOTION_API_KEY;

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

const SECTIONS = [
  {
    id: "move", icon: "🔥", name: "Move", color: "#ff6b35",
    items: [
      { id: "Walk 8k 👟", label: "เดินวันละ >8,000 ก้าว" },
      { id: "Sleep 6h 😴", label: "นอน >6 ชม." },
    ]
  },
  {
    id: "fuel", icon: "⚡", name: "Fuel", color: "#f7c948",
    items: [
      { id: "Water 2L 💧", label: "ดื่มน้ำ 2 ลิตร" },
      { id: "Egg 🥚", label: "กินไข่ 2 ฟอง" },
    ]
  },
  {
    id: "connect", icon: "🌐", name: "Connect", color: "#4ecdc4",
    items: [
      { id: "Line Friends 💬", label: "คุยไลน์เล่นกับเพื่อนๆ" },
      { id: "Hangout 🤝", label: "ทำกิจกรรมกับเพื่อน" },
      { id: "Event 🎉", label: "เข้าร่วม event/กิจกรรมใหม่" },
    ]
  },
  {
    id: "grow", icon: "🧠", name: "Grow", color: "#a78bfa",
    items: [
      { id: "Podcast 🎧", label: "ฟัง Podcast" },
      { id: "Bujo 📓", label: "บันทึก Bujo" },
    ]
  },
  {
    id: "create", icon: "🎨", name: "Create", color: "#f472b6",
    items: [
      { id: "Idea Content 💡", label: "จด idea content" },
      { id: "Make Content ✂️", label: "ตัด/ทำ content" },
    ]
  },
];

const ALL_ITEMS = SECTIONS.flatMap(s => s.items);
const TOTAL = ALL_ITEMS.length;
const DAY_SHORT = ["อา","จ","อ","พ","พฤ","ศ","ส"];

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getThaiDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัส","ศุกร์","เสาร์"];
  const months = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
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

export default function App() {
  const today = getTodayStr();
  const weekDates = getWeekDates();
  const [selected, setSelected] = useState(today);
  const [checks, setChecks] = useState({});
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");
  const [status, setStatus] = useState(null);

  const dayChecks = checks[selected] || {};
  const score = ALL_ITEMS.filter(item => dayChecks[item.id]).length;

  const toggle = (itemId) => {
    setChecks(prev => ({
      ...prev,
      [selected]: { ...prev[selected], [itemId]: !prev[selected]?.[itemId] }
    }));
    setStatus(null);
  };

  const getDayScore = (date) => {
    const d = checks[date] || {};
    return ALL_ITEMS.filter(item => d[item.id]).length;
  };

  const submit = async () => {
    setStatus("loading");
    try {
      const pageId = PAGE_IDS[selected];
      if (!pageId) { setStatus("error"); return; }

      const properties = {};
      ALL_ITEMS.forEach(item => {
        properties[item.id] = { checkbox: !!dayChecks[item.id] };
      });
      if (income) properties["รายรับ 💰"] = { number: parseFloat(income) };
      if (expense) properties["รายจ่าย 💸"] = { number: parseFloat(expense) };

      const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${NOTION_API_KEY}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({ properties }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (e) {
      setStatus("error");
    }
  };

  const s = { background: "#0e0e12", minHeight: "100vh", color: "#f0f0f5", fontFamily: "'Sarabun', sans-serif", padding: "20px 16px 80px", maxWidth: 480, margin: "0 auto" };

  return (
    <div style={s}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#6b6b80", marginBottom: 4 }}>DAILY TRACKER</div>
        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{getThaiDate(selected)}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, background: "#17171f", borderRadius: 99, padding: "4px 14px", border: "1px solid #2a2a36" }}>
          <span style={{ fontSize: 13, color: "#6b6b80" }}>Score</span>
          <span style={{ fontSize: 18, fontWeight: 700 }}>{score}</span>
          <span style={{ fontSize: 13, color: "#6b6b80" }}>/ {TOTAL}</span>
        </div>
      </div>

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

      {SECTIONS.map(sec => {
        const done = sec.items.filter(item => dayChecks[item.id]).length;
        return (
          <div key={sec.id} style={{ marginBottom: 12, background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{sec.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: sec.color, fontFamily: "'Space Grotesk', sans-serif" }}>{sec.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 40, height: 3, background: "#2a2a36", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${done/sec.items.length*100}%`, background: sec.color, borderRadius: 99, transition: "width 0.3s" }} />
                </div>
                <span style={{ fontSize: 11, color: "#6b6b80" }}>{done}/{sec.items.length}</span>
              </div>
            </div>
            <div style={{ height: 1, background: "#2a2a36", margin: "0 16px 8px" }} />
            <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
              {sec.items.map(item => {
                const checked = !!dayChecks[item.id];
                return (
                  <div key={item.id} onClick={() => toggle(item.id)} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "10px 12px", borderRadius: 10, border: `1px solid ${checked ? "transparent" : "#2a2a36"}`, background: checked ? "rgba(255,255,255,0.02)" : "#0e0e12", transition: "all 0.2s", userSelect: "none" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: checked ? sec.color : "transparent", border: `2px solid ${checked ? sec.color : "#2a2a36"}`, color: checked ? "#fff" : "transparent", transition: "all 0.2s" }}>✓</div>
                    <span style={{ fontSize: 14, color: checked ? "#6b6b80" : "#f0f0f5", textDecoration: checked ? "line-through" : "none", textDecorationColor: "#2a2a36" }}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div style={{ marginBottom: 20, background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", padding: "14px 16px" }}>
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

      <button onClick={submit} disabled={status === "loading"} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: status === "success" ? "#4ecdc4" : status === "error" ? "#ff6b6b" : "#f0f0f5", color: "#0e0e12", fontSize: 15, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", cursor: status === "loading" ? "not-allowed" : "pointer", transition: "all 0.3s", opacity: status === "loading" ? 0.7 : 1 }}>
        {status === "loading" ? "⏳ กำลังบันทึก..." : status === "success" ? "✅ บันทึกเข้า Notion แล้ว!" : status === "error" ? "❌ ลองอีกครั้ง" : "📤 Save to Notion"}
      </button>

      {status === "success" && <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#6b6b80" }}>Score {score}/{TOTAL} · {getThaiDate(selected)} 🎉</div>}
      {status === "error" && <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#ff6b6b" }}>บันทึกไม่ได้ — ลองใหม่อีกครั้งครับ</div>}
    </div>
  );
}
