import { useState, useRef, useEffect } from "react";

const PAGE_IDS = {};

const WALK_TARGET = 6500;
const SLEEP_TARGET = 6;

const LEARN_CATEGORIES = ["MOVE", "FUEL", "CONNECT", "GROW", "CREATE", "WEALTH"];

const WORKOUT_GROUPS = [
  { id: "chest", icon: "💪", name: "อก", color: "#ff6b35", exercises: ["Bench Press", "Incline Press", "Cable Fly", "Dumbbell Fly", "Push Up"] },
  { id: "back", icon: "🏋️", name: "หลัง", color: "#4ecdc4", exercises: ["Deadlift", "Pull Up", "Lat Pulldown", "Seated Row", "Barbell Row"] },
  { id: "shoulder", icon: "🔱", name: "ไหล่", color: "#a78bfa", exercises: ["Shoulder Press", "Lateral Raise", "Front Raise", "Face Pull", "Shrug"] },
  { id: "leg", icon: "🦵", name: "ขา", color: "#f7c948", exercises: ["Squat", "Leg Press", "Leg Curl", "Leg Extension", "Calf Raise"] },
  { id: "core", icon: "⚡", name: "Core", color: "#f472b6", exercises: ["Plank", "Crunch", "Leg Raise", "Russian Twist", "Cable Crunch"] },
  { id: "cardio", icon: "🏃", name: "Cardio", color: "#4ecdc4", exercises: [], isCardio: true },
];

const SECTIONS = [
  { id: "connect", icon: "🌐", name: "Connect", color: "#4ecdc4", items: [
    { id: "Hangout 🤝", label: "ทำกิจกรรมกับเพื่อน", score: 1 },
    { id: "Event 🎉", label: "เข้าร่วม event/กิจกรรมใหม่", score: 1 },
    { id: "TikTok 🔥", label: "ดู TikTok เติมไฟ", score: 0.5 },
  ]},
  { id: "grow", icon: "🧠", name: "Grow", color: "#a78bfa", items: [
    { id: "Podcast 🎧", label: "ฟัง Podcast/เรียนรู้", score: 1 },
    { id: "Bujo 📓", label: "บันทึก Bujo", score: 0.5 },
    { id: "Learn 📚", label: "เรียนรู้ skill ใหม่", score: 1, requireDetail: true },
  ]},
  { id: "create", icon: "🎨", name: "Create", color: "#f472b6", items: [
    { id: "Idea Content 💡", label: "จด idea content", score: 0.5 },
    { id: "Post Real ✅", label: "โพสต์จริง", score: 1.5 },
  ]},
];

const ALL_ITEMS = SECTIONS.flatMap(s => s.items);
const TOTAL = 10;
const DAY_SHORT = ["อา","จ","อ","พ","พฤ","ศ","ส"];

function getTodayStr() { return new Date().toISOString().slice(0, 10); }

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

// ประมาณแคลอรี่สำหรับวันที่ไม่มี Workout Calories บันทึกไว้จริง (สูตรเดียวกับหน้า Stats)
const FLAT_CAL_ESTIMATE = 300; // ติ๊ก ✅ เฉยๆ ไม่มี log เซ็ตเลย
const MIN_PER_SET = 3; // นาทีเฉลี่ยต่อเซ็ต (รวมพัก) ใช้ประมาณเวลาจากจำนวนเซ็ตที่ log ไว้
const CAL_PER_KG_PER_HOUR = 5;

function estimateRowCalories(row, bodyWeight) {
  if (row?.workoutCalories > 0) return { cal: row.workoutCalories, source: 'logged' };
  if (!row?.workout) return { cal: 0, source: 'none' };
  const totalSets = Object.values(row.workoutLogParsed || {}).flat().reduce((sum, set) => sum + (parseInt(set.sets) || 0), 0);
  if (totalSets > 0) {
    const estMinutes = totalSets * MIN_PER_SET;
    return { cal: Math.round(CAL_PER_KG_PER_HOUR * bodyWeight * (estMinutes / 60)), source: 'sets' };
  }
  return { cal: FLAT_CAL_ESTIMATE, source: 'flat' };
}

export default function App() {
  const today = getTodayStr();
  const weekDates = getWeekDates();
  const [page, setPage] = useState("check");
  const [selected, setSelected] = useState(today);
  const [checks, setChecks] = useState({});
  const [walkSteps, setWalkSteps] = useState({});
  const [sleepHours, setSleepHours] = useState({});
  const [workoutDone, setWorkoutDone] = useState({});
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");
  const [status, setStatus] = useState(null);
  const [learnCategory, setLearnCategory] = useState({});
  const [learnDetail, setLearnDetail] = useState({});
  const [showLearnModal, setShowLearnModal] = useState(false);
  const [learnCatTemp, setLearnCatTemp] = useState("");
  const [learnDetailTemp, setLearnDetailTemp] = useState("");

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [workoutLog, setWorkoutLog] = useState({});
  const [customExercise, setCustomExercise] = useState("");
  const [customExercises, setCustomExercises] = useState({});
  const [bodyWeight, setBodyWeight] = useState(() => parseFloat(localStorage.getItem("bodyWeight") || "62"));
  const [showSettings, setShowSettings] = useState(false);
  const [workoutMinutes, setWorkoutMinutes] = useState({});
  const [cardioMinutes, setCardioMinutes] = useState({});
  const [aiRecommend, setAiRecommend] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageIds, setPageIds] = useState({});
  const [historyRows, setHistoryRows] = useState([]);

  useEffect(() => {
    fetch('/api/get-notion')
      .then(r => r.json())
      .then(data => {
        if (!data.rows) return;
        const newChecks = {}, newWalkSteps = {}, newSleepHours = {}, newWorkoutDone = {};
        const newPageIds = {}, newLearnCat = {}, newLearnDetail = {}, newWorkoutLog = {};

        data.rows.forEach(row => {
          if (!row.date) return;
          if (row.pageId) newPageIds[row.date] = row.pageId;
          newChecks[row.date] = {
            "Hangout 🤝": row.hangout, "Event 🎉": row.event, "TikTok 🔥": row.tiktok,
            "Podcast 🎧": row.podcast, "Bujo 📓": row.bujo, "Learn 📚": !!(row.learnCategory),
            "Idea Content 💡": row.idea, "Post Real ✅": row.postReal,
            "Water 2L 💧": row.water, "Egg 🥚": row.egg,
          };
          if (row.walkSteps) newWalkSteps[row.date] = String(row.walkSteps);
          if (row.sleepHours) newSleepHours[row.date] = String(row.sleepHours);
          if (row.workout) newWorkoutDone[row.date] = true;
          if (row.learnCategory) newLearnCat[row.date] = row.learnCategory;
          if (row.learnDetail) newLearnDetail[row.date] = row.learnDetail;
          if (row.workoutLogParsed && Object.keys(row.workoutLogParsed).length > 0) {
            newWorkoutLog[row.date] = row.workoutLogParsed;
          }
        });

        setChecks(newChecks); setWalkSteps(newWalkSteps); setSleepHours(newSleepHours);
        setWorkoutDone(newWorkoutDone); setPageIds(newPageIds);
        setLearnCategory(newLearnCat); setLearnDetail(newLearnDetail);
        setWorkoutLog(newWorkoutLog);
        setHistoryRows(data.rows.filter(r => r.date));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const dayChecks = checks[selected] || {};
  const steps = walkSteps[selected] || "";
  const sleep = sleepHours[selected] || "";
  const isWorkoutToday = workoutDone[selected] || false;

  const walkScore = steps ? Math.min(0.5, parseInt(steps) / WALK_TARGET * 0.5) : 0;
  const sleepScore = sleep ? Math.min(0.5, parseFloat(sleep) / SLEEP_TARGET * 0.5) : 0;
  const workoutScore = isWorkoutToday ? 2 : 0;
  const waterScore = dayChecks["Water 2L 💧"] ? 0.5 : 0;
  const eggScore = dayChecks["Egg 🥚"] ? 0.5 : 0;
  const sectionScore = ALL_ITEMS.reduce((sum, item) => sum + (dayChecks[item.id] ? (item.score || 1) : 0), 0);
  const scoreDisplay = parseFloat((walkScore + sleepScore + workoutScore + waterScore + eggScore + sectionScore).toFixed(1));

  const toggle = (itemId) => {
    const item = ALL_ITEMS.find(i => i.id === itemId);
    if (item?.requireDetail) {
      if (!dayChecks[itemId]) {
        setLearnCatTemp(learnCategory[selected] || "");
        setLearnDetailTemp(learnDetail[selected] || "");
        setShowLearnModal(true);
      } else {
        setChecks(prev => ({ ...prev, [selected]: { ...prev[selected], [itemId]: false } }));
        setLearnCategory(prev => { const n = {...prev}; delete n[selected]; return n; });
        setLearnDetail(prev => { const n = {...prev}; delete n[selected]; return n; });
        setStatus(null);
      }
      return;
    }
    setChecks(prev => ({ ...prev, [selected]: { ...prev[selected], [itemId]: !prev[selected]?.[itemId] } }));
    setStatus(null);
  };

  const confirmLearn = () => {
    if (!learnCatTemp || learnDetailTemp.trim().length < 5) return;
    setChecks(prev => ({ ...prev, [selected]: { ...prev[selected], "Learn 📚": true } }));
    setLearnCategory(prev => ({ ...prev, [selected]: learnCatTemp }));
    setLearnDetail(prev => ({ ...prev, [selected]: learnDetailTemp.trim() }));
    setShowLearnModal(false);
    setStatus(null);
  };

  const getDayScore = (date) => {
    const d = checks[date] || {};
    const w = walkSteps[date] ? Math.min(0.5, parseInt(walkSteps[date]) / WALK_TARGET * 0.5) : 0;
    const sl = sleepHours[date] ? Math.min(0.5, parseFloat(sleepHours[date]) / SLEEP_TARGET * 0.5) : 0;
    const wo = workoutDone[date] ? 2 : 0;
    const water = d["Water 2L 💧"] ? 0.5 : 0;
    const egg = d["Egg 🥚"] ? 0.5 : 0;
    const sec = ALL_ITEMS.reduce((sum, item) => sum + (d[item.id] ? (item.score || 1) : 0), 0);
    return w + sl + wo + water + egg + sec;
  };

  const addSet = (exercise) => {
    setWorkoutLog(prev => {
      const dayLog = prev[selected] || {};
      return { ...prev, [selected]: { ...dayLog, [exercise]: [...(dayLog[exercise] || []), { sets: "3", reps: "10", kg: "" }] } };
    });
  };

  const updateSet = (exercise, idx, field, value) => {
    setWorkoutLog(prev => {
      const dayLog = prev[selected] || {};
      const sets = [...(dayLog[exercise] || [])];
      sets[idx] = { ...sets[idx], [field]: value };
      return { ...prev, [selected]: { ...dayLog, [exercise]: sets } };
    });
  };

  const removeSet = (exercise, idx) => {
    setWorkoutLog(prev => {
      const dayLog = prev[selected] || {};
      return { ...prev, [selected]: { ...dayLog, [exercise]: (dayLog[exercise] || []).filter((_, i) => i !== idx) } };
    });
  };

  const getAIRecommend = async (group) => {
    setLoadingAI(true); setAiRecommend(null);
    try {
      const history = Object.entries(workoutLog)
        .filter(([, log]) => Object.keys(log).some(k => group.exercises.includes(k)))
        .sort(([a], [b]) => b.localeCompare(a)).slice(0, 5)
        .map(([date, log]) => ({ date: getThaiDate(date), log: Object.entries(log).filter(([k]) => group.exercises.includes(k)).map(([ex, sets]) => `${ex}: ${sets.map(s => `${s.sets}x${s.reps}${s.kg ? '@' + s.kg + 'kg' : ''}`).join(', ')}`).join(' | ') }));
      const res = await fetch('/api/recommend-workout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ muscleGroup: group.name, history }) });
      const data = await res.json();
      if (res.ok) setAiRecommend(data.exercises || []);
    } catch (e) { console.error(e); }
    setLoadingAI(false);
  };

  const getLastSession = (exercise) => {
    for (const date of Object.keys(workoutLog).sort().reverse()) {
      if (date === selected) continue;
      const sets = workoutLog[date]?.[exercise];
      if (sets?.length > 0) return { date, sets };
    }
    return null;
  };

  const calcWorkoutCalories = (date) => {
    const wMin = workoutMinutes[date] || 0, cMin = cardioMinutes[date] || 0;
    const w = wMin > 0 ? Math.round(5 * bodyWeight * (wMin / 60)) : 0;
    const c = cMin > 0 ? Math.round(8 * bodyWeight * (cMin / 60)) : 0;
    return { weight: w, cardio: c, total: w + c };
  };

  const getSelectedDayCalories = () => {
    const live = calcWorkoutCalories(selected).total;
    if (live > 0) return { cal: live, source: 'live' };
    const hist = historyRows.find(r => r.date === selected);
    if (hist?.workoutCalories > 0) return { cal: hist.workoutCalories, source: 'logged' };
    const setsSource = workoutLog[selected] || hist?.workoutLogParsed || {};
    const totalSets = Object.values(setsSource).flat().reduce((sum, s) => sum + (parseInt(s.sets) || 0), 0);
    if (totalSets > 0) {
      const estMinutes = totalSets * MIN_PER_SET;
      return { cal: Math.round(CAL_PER_KG_PER_HOUR * bodyWeight * (estMinutes / 60)), source: 'sets' };
    }
    if (isWorkoutToday) return { cal: FLAT_CAL_ESTIMATE, source: 'flat' };
    return { cal: 0, source: 'none' };
  };

  const getPreviousWorkoutDay = () => {
    const past = historyRows.filter(r => r.date < selected && r.workout).sort((a, b) => b.date.localeCompare(a.date));
    if (past.length === 0) return null;
    return { date: past[0].date, ...estimateRowCalories(past[0], bodyWeight) };
  };

  const submit = async () => {
    setStatus("loading");
    try {
      const pageId = pageIds[selected] || PAGE_IDS[selected];
      if (!pageId) { setStatus("error"); return; }
      const properties = {
        "Hangout 🤝": { checkbox: !!dayChecks["Hangout 🤝"] },
        "Event 🎉": { checkbox: !!dayChecks["Event 🎉"] },
        "TikTok 🔥": { checkbox: !!dayChecks["TikTok 🔥"] },
        "Podcast 🎧": { checkbox: !!dayChecks["Podcast 🎧"] },
        "Bujo 📓": { checkbox: !!dayChecks["Bujo 📓"] },
        "Idea Content 💡": { checkbox: !!dayChecks["Idea Content 💡"] },
        "Post Real ✅": { checkbox: !!dayChecks["Post Real ✅"] },
        "Water 2L 💧": { checkbox: !!dayChecks["Water 2L 💧"] },
        "Egg 🥚": { checkbox: !!dayChecks["Egg 🥚"] },
        "Walk 8k 👟": { checkbox: steps ? parseInt(steps) >= WALK_TARGET : false },
        "Sleep 6h 😴": { checkbox: sleep ? parseFloat(sleep) >= 6 : false },
        "Workout 💪": { checkbox: isWorkoutToday },
        "Daily Score": { number: scoreDisplay },
      };
      if (steps) properties["Walk Steps"] = { number: parseInt(steps) };
      if (sleep) properties["Sleep Hours"] = { number: parseFloat(sleep) };
      if (income) properties["รายรับ 💰"] = { number: parseFloat(income) };
      if (expense) properties["รายจ่าย 💸"] = { number: parseFloat(expense) };
      if (learnCategory[selected]) properties["Learn Category"] = { select: { name: learnCategory[selected] } };
      if (learnDetail[selected]) properties["Learn Detail"] = { rich_text: [{ text: { content: learnDetail[selected] } }] };

      // Save workout calories
      const cal = calcWorkoutCalories(selected);
      if (cal.total > 0) properties["Workout Calories"] = { number: cal.total };

      const workoutSummary = Object.entries(workoutLog[selected] || {}).filter(([, sets]) => sets.length > 0)
        .map(([ex, sets]) => `${ex}: ${sets.map(s => `${s.sets}x${s.reps}${s.kg ? `@${s.kg}kg` : ''}`).join(', ')}`).join(' | ');
      if (workoutSummary) properties["Workout Log 📝"] = { rich_text: [{ text: { content: workoutSummary } }] };

      const res = await fetch("/api/update-notion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pageId, properties }) });
      if (res.ok) { setStatus("success"); } else { setStatus("error"); }
    } catch (e) { setStatus("error"); }
  };

  // ── WORKOUT PAGE ──
  if (page === "workout") {
    const dayLog = workoutLog[selected] || {};
    return (
      <div style={{ background: "#0e0e12", minHeight: "100vh", color: "#f0f0f5", fontFamily: "'Sarabun', sans-serif", padding: "20px 16px 80px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 20, position: "relative" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#6b6b80", marginBottom: 4 }}>WORKOUT</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{getThaiDate(selected)}</div>
          <div onClick={() => setShowSettings(!showSettings)} style={{ position: "absolute", right: 0, top: 0, fontSize: 20, cursor: "pointer" }}>⚙️</div>
        </div>
        {showSettings && (
          <div style={{ background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", padding: "16px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>⚙️ ตั้งค่า</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: "#6b6b80", flexShrink: 0 }}>น้ำหนักตัว (kg)</span>
              <input type="number" value={bodyWeight} onChange={e => { const v = parseFloat(e.target.value); if (v > 0) { setBodyWeight(v); localStorage.setItem("bodyWeight", v); } }}
                style={{ flex: 1, background: "#0e0e12", border: "1px solid #2a2a36", borderRadius: 8, padding: "8px 12px", color: "#f0f0f5", fontSize: 16, outline: "none", textAlign: "center" }} />
              <span style={{ fontSize: 13, color: "#6b6b80" }}>kg</span>
            </div>
          </div>
        )}

        {/* Workout duration */}
        <div style={{ background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#6b6b80" }}>⏱️ เวลา workout วันนี้</span>
            <input type="number" value={workoutMinutes[selected] || ""} onChange={e => setWorkoutMinutes(prev => ({ ...prev, [selected]: parseInt(e.target.value) || 0 }))} placeholder="0"
              style={{ flex: 1, background: "#0e0e12", border: "1px solid #2a2a36", borderRadius: 8, padding: "8px 12px", color: "#f0f0f5", fontSize: 16, outline: "none", textAlign: "center" }} />
            <span style={{ fontSize: 13, color: "#6b6b80" }}>นาที</span>
          </div>
          {calcWorkoutCalories(selected).total > 0 && (
            <div style={{ marginTop: 8, fontSize: 13, color: "#ff6b35", textAlign: "center" }}>
              🔥 เผาผลาญ {calcWorkoutCalories(selected).total} kcal
            </div>
          )}
        </div>

        {/* Cal เทียบกับครั้งก่อน */}
        {(() => {
          const todayInfo = getSelectedDayCalories();
          if (todayInfo.cal === 0) return null;
          const prevInfo = getPreviousWorkoutDay();
          const delta = prevInfo ? todayInfo.cal - prevInfo.cal : null;
          return (
            <div style={{ background: "#17171f", borderRadius: 16, border: "1px solid #ff6b35", padding: "14px 16px", marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#6b6b80", marginBottom: 6 }}>🔥 Cal {getThaiDate(selected).split(' ').slice(1).join(' ')}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#ff6b35" }}>{todayInfo.source === 'sets' || todayInfo.source === 'flat' ? '~' : ''}{todayInfo.cal.toLocaleString()} kcal</div>
              {prevInfo ? (
                <div style={{ fontSize: 12, marginTop: 8, color: delta > 0 ? "#4ecdc4" : delta < 0 ? "#ff6b6b" : "#6b6b80", fontWeight: 700 }}>
                  {delta > 0 ? `▲ +${delta}` : delta < 0 ? `▼ ${delta}` : '– เท่าเดิม'} เทียบกับครั้งก่อน ({getThaiDate(prevInfo.date).split(' ').slice(1).join(' ')} · {prevInfo.source !== 'logged' ? '~' : ''}{prevInfo.cal} kcal)
                </div>
              ) : (
                <div style={{ fontSize: 11, color: "#6b6b80", marginTop: 8 }}>ยังไม่มีข้อมูลครั้งก่อนเทียบ</div>
              )}
            </div>
          );
        })()}

        {selectedGroup?.isCardio ? (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <button onClick={() => setSelectedGroup(null)} style={{ background: "#17171f", border: "1px solid #2a2a36", borderRadius: 8, padding: "8px 12px", color: "#f0f0f5", cursor: "pointer", fontSize: 13 }}>← กลับ</button>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#4ecdc4" }}>🏃 Cardio</span>
            </div>
            <div style={{ background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="number" value={cardioMinutes[selected] || ""} onChange={e => setCardioMinutes(prev => ({ ...prev, [selected]: parseInt(e.target.value) || 0 }))} placeholder="0"
                  style={{ flex: 1, background: "#0e0e12", border: "1px solid #2a2a36", borderRadius: 8, padding: "10px 12px", color: "#f0f0f5", fontSize: 20, outline: "none", textAlign: "center" }} />
                <span style={{ fontSize: 13, color: "#6b6b80" }}>นาที</span>
              </div>
              {cardioMinutes[selected] > 0 && <div style={{ marginTop: 8, fontSize: 14, color: "#4ecdc4", textAlign: "center", fontWeight: 700 }}>🔥 {Math.round(8 * bodyWeight * (cardioMinutes[selected] / 60))} kcal</div>}
            </div>
          </div>
        ) : !selectedGroup ? (
          <>
            <div style={{ fontSize: 13, color: "#6b6b80", marginBottom: 16, textAlign: "center" }}>เลือก Muscle Group</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {WORKOUT_GROUPS.map(g => {
                const hasLog = Object.keys(dayLog).some(k => g.exercises.includes(k) && dayLog[k].length > 0);
                return (
                  <div key={g.id} onClick={() => setSelectedGroup(g)} style={{ background: "#17171f", borderRadius: 16, border: `1px solid ${hasLog ? g.color : "#2a2a36"}`, padding: "20px 16px", cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{g.icon}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: g.color }}>{g.name}</div>
                    {hasLog && <div style={{ fontSize: 10, color: g.color, marginTop: 4 }}>✅ มีข้อมูล</div>}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <button onClick={() => { setSelectedGroup(null); setAiRecommend(null); }} style={{ background: "#17171f", border: "1px solid #2a2a36", borderRadius: 8, padding: "8px 12px", color: "#f0f0f5", cursor: "pointer", fontSize: 13 }}>← กลับ</button>
              <span style={{ fontSize: 18, fontWeight: 700, color: selectedGroup.color }}>{selectedGroup.icon} {selectedGroup.name}</span>
              <button onClick={() => getAIRecommend(selectedGroup)} disabled={loadingAI} style={{ marginLeft: "auto", background: "#a78bfa", border: "none", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: loadingAI ? 0.6 : 1 }}>
                {loadingAI ? "⏳..." : "🤖 แนะนำ"}
              </button>
            </div>

            {aiRecommend && (
              <div style={{ background: "#17171f", borderRadius: 16, border: "1px solid #a78bfa", padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", marginBottom: 12 }}>🤖 AI แนะนำวันนี้</div>
                {aiRecommend.map((ex, i) => (
                  <div key={i} style={{ marginBottom: 10, padding: "10px 12px", background: "#0e0e12", borderRadius: 10, border: "1px solid #2a2a36" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{ex.name}</span>
                      <button onClick={() => { const sets = Array(parseInt(ex.sets)||3).fill(null).map(() => ({ sets: ex.sets, reps: ex.reps, kg: ex.kg||'' })); setWorkoutLog(prev => ({ ...prev, [selected]: { ...(prev[selected]||{}), [ex.name]: sets } })); }} style={{ background: selectedGroup.color, border: "none", borderRadius: 6, padding: "4px 10px", color: "#0e0e12", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ เพิ่ม</button>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b6b80", marginTop: 4 }}>{ex.sets} sets × {ex.reps} reps {ex.kg ? `@ ${ex.kg}kg` : ''}</div>
                    {ex.note && <div style={{ fontSize: 11, color: "#a78bfa", marginTop: 2 }}>💡 {ex.note}</div>}
                  </div>
                ))}
              </div>
            )}

            {selectedGroup.exercises.concat(customExercises[selectedGroup.id] || []).map(ex => {
              const sets = dayLog[ex] || [];
              const last = getLastSession(ex);
              // คำนวณ volume ครั้งล่าสุด
              const lastVolume = last ? last.sets.reduce((sum, s) => {
                const vol = parseInt(s.sets||0) * parseInt(s.reps||0) * parseFloat(s.kg||0);
                return sum + (isNaN(vol) ? 0 : vol);
              }, 0) : 0;

              return (
                <div key={ex} style={{ marginBottom: 12, background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{ex}</span>
                      {last && (
                        <div style={{ fontSize: 10, color: "#6b6b80", marginTop: 2 }}>
                          ครั้งล่าสุด ({getThaiDate(last.date).split(' ').slice(1).join(' ')}): {last.sets.map(s => `${s.sets}x${s.reps}${s.kg?`@${s.kg}kg`:''}`).join(', ')}
                          {lastVolume > 0 && <span style={{ color: "#f7c948" }}> · {lastVolume.toLocaleString()}kg vol</span>}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {last && sets.length === 0 && <button onClick={() => setWorkoutLog(prev => ({ ...prev, [selected]: { ...(prev[selected]||{}), [ex]: last.sets.map(s=>({...s})) } }))} style={{ background: "transparent", border: `1px solid ${selectedGroup.color}`, borderRadius: 8, padding: "6px 10px", color: selectedGroup.color, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>ใช้เหมือนเดิม</button>}
                      <button onClick={() => addSet(ex)} style={{ background: selectedGroup.color, border: "none", borderRadius: 8, padding: "6px 12px", color: "#0e0e12", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Set</button>
                    </div>
                  </div>
                  {sets.length > 0 && (
                    <div style={{ padding: "0 16px 12px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 24px", gap: 6, marginBottom: 6 }}>
                        {["Sets","Reps","kg",""].map(h => <div key={h} style={{ fontSize: 10, color: "#6b6b80", textAlign: "center" }}>{h}</div>)}
                      </div>
                      {sets.map((set, idx) => (
                        <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 24px", gap: 6, marginBottom: 6 }}>
                          {["sets","reps","kg"].map(field => <input key={field} type="number" value={set[field]} onChange={e => updateSet(ex, idx, field, e.target.value)} style={{ background: "#0e0e12", border: "1px solid #2a2a36", borderRadius: 6, padding: "8px", color: "#f0f0f5", fontSize: 14, outline: "none", textAlign: "center", width: "100%", boxSizing: "border-box" }} />)}
                          <div onClick={() => removeSet(ex, idx)} style={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b6b80", fontSize: 14 }}>✕</div>
                        </div>
                      ))}
                      {/* Volume วันนี้ */}
                      {(() => {
                        const vol = sets.reduce((sum, s) => {
                          const v = parseInt(s.sets||0) * parseInt(s.reps||0) * parseFloat(s.kg||0);
                          return sum + (isNaN(v) ? 0 : v);
                        }, 0);
                        return vol > 0 ? (
                          <div style={{ fontSize: 11, color: "#4ecdc4", textAlign: "right", marginTop: 4 }}>
                            Volume: {vol.toLocaleString()} kg
                            {lastVolume > 0 && <span style={{ color: vol > lastVolume ? "#4ecdc4" : "#ff6b6b", marginLeft: 6 }}>
                              {vol > lastVolume ? `▲ +${(vol-lastVolume).toLocaleString()}` : `▼ ${(vol-lastVolume).toLocaleString()}`}
                            </span>}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{ background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", padding: "14px 16px", marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#6b6b80", marginBottom: 8 }}>➕ เพิ่มท่าเอง</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" value={customExercise} onChange={e => setCustomExercise(e.target.value)} placeholder="ชื่อท่า..." style={{ flex: 1, background: "#0e0e12", border: "1px solid #2a2a36", borderRadius: 8, padding: "10px 12px", color: "#f0f0f5", fontSize: 14, outline: "none" }} />
                <button onClick={() => { if (customExercise.trim()) { const name = customExercise.trim(); setCustomExercises(prev => ({ ...prev, [selectedGroup.id]: [...(prev[selectedGroup.id]||[]), name] })); addSet(name); setCustomExercise(""); } }} style={{ background: selectedGroup.color, border: "none", borderRadius: 8, padding: "10px 14px", color: "#0e0e12", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>เพิ่ม</button>
              </div>
            </div>

            {calcWorkoutCalories(selected).total > 0 && (
              <div style={{ background: "#17171f", borderRadius: 16, border: "1px solid #ff6b35", padding: "14px 16px", marginBottom: 12, textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#6b6b80", marginBottom: 4 }}>🔥 พลังงานที่ใช้</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#ff6b35" }}>{calcWorkoutCalories(selected).total} kcal</div>
                {calcWorkoutCalories(selected).cardio > 0 && <div style={{ fontSize: 11, color: "#6b6b80" }}>Cardio {calcWorkoutCalories(selected).cardio} + Weights {calcWorkoutCalories(selected).weight}</div>}
              </div>
            )}
          </>
        )}

        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#17171f", borderTop: "1px solid #2a2a36", display: "flex", justifyContent: "space-around", padding: "10px 0 20px", zIndex: 100 }}>
          <div onClick={() => setPage("check")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", opacity: 0.4 }}><span style={{ fontSize: 20 }}>✅</span><span style={{ fontSize: 10, color: "#f0f0f5" }}>Check</span></div>
          <div onClick={() => setPage("workout")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", opacity: 1 }}><span style={{ fontSize: 20 }}>💪</span><span style={{ fontSize: 10, color: "#f0f0f5" }}>Workout</span></div>
          <div onClick={() => window.location.href = '/stats'} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", opacity: 0.4 }}><span style={{ fontSize: 20 }}>📊</span><span style={{ fontSize: 10, color: "#f0f0f5" }}>Stats</span></div>
        </div>
      </div>
    );
  }

  // ── CHECK PAGE ──
  if (loading) return (
    <div style={{ background: "#0e0e12", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 32 }}>⏳</div>
      <div style={{ fontSize: 14, color: "#6b6b80" }}>กำลังโหลดข้อมูล...</div>
    </div>
  );

  return (
    <div style={{ background: "#0e0e12", minHeight: "100vh", color: "#f0f0f5", fontFamily: "'Sarabun', sans-serif", padding: "20px 16px 80px", maxWidth: 480, margin: "0 auto" }}>

      {/* Learn Modal */}
      {showLearnModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#17171f", borderRadius: 20, border: "1px solid #2a2a36", padding: 24, width: "100%", maxWidth: 400 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📚 เรียนรู้อะไรวันนี้?</div>
            <div style={{ fontSize: 12, color: "#6b6b80", marginBottom: 8 }}>เลือก Category</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              {LEARN_CATEGORIES.map(cat => (
                <div key={cat} onClick={() => setLearnCatTemp(cat)}
                  style={{ padding: "8px", borderRadius: 10, border: `1px solid ${learnCatTemp === cat ? "#a78bfa" : "#2a2a36"}`, background: learnCatTemp === cat ? "rgba(167,139,250,0.15)" : "#0e0e12", textAlign: "center", cursor: "pointer", fontSize: 12, fontWeight: 700, color: learnCatTemp === cat ? "#a78bfa" : "#6b6b80" }}>
                  {cat}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#6b6b80", marginBottom: 8 }}>เรียนรู้เรื่องอะไร? (อย่างน้อย 5 ตัวอักษร)</div>
            <textarea value={learnDetailTemp} onChange={e => setLearnDetailTemp(e.target.value)} placeholder="เช่น เรียน affiliate marketing จาก YouTube..."
              style={{ width: "100%", background: "#0e0e12", border: "1px solid #2a2a36", borderRadius: 10, padding: "10px 12px", color: "#f0f0f5", fontSize: 13, outline: "none", resize: "none", height: 80, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowLearnModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid #2a2a36", background: "transparent", color: "#6b6b80", fontSize: 14, cursor: "pointer" }}>ยกเลิก</button>
              <button onClick={confirmLearn} disabled={!learnCatTemp || learnDetailTemp.trim().length < 5}
                style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: (!learnCatTemp || learnDetailTemp.trim().length < 5) ? "#2a2a36" : "#a78bfa", color: "#fff", fontSize: 14, fontWeight: 700, cursor: (!learnCatTemp || learnDetailTemp.trim().length < 5) ? "not-allowed" : "pointer" }}>
                ✓ บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", marginBottom: 20, position: "relative" }}>
        <div onClick={() => setShowSettings(!showSettings)} style={{ position: "absolute", right: 0, top: 0, fontSize: 18, cursor: "pointer" }}>⚙️</div>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#6b6b80", marginBottom: 4 }}>DAILY TRACKER</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{getThaiDate(selected)}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, background: "#17171f", borderRadius: 99, padding: "4px 14px", border: "1px solid #2a2a36" }}>
          <span style={{ fontSize: 13, color: "#6b6b80" }}>Score</span>
          <span style={{ fontSize: 18, fontWeight: 700 }}>{scoreDisplay}</span>
          <span style={{ fontSize: 13, color: "#6b6b80" }}>/ {TOTAL}</span>
        </div>
      </div>

      {showSettings && (
        <div style={{ background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", padding: "16px", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>⚙️ ตั้งค่า</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#6b6b80", flexShrink: 0 }}>น้ำหนักตัว</span>
            <input type="number" value={bodyWeight} onChange={e => { const v = parseFloat(e.target.value); if (v > 0) { setBodyWeight(v); localStorage.setItem("bodyWeight", v); } }}
              style={{ flex: 1, background: "#0e0e12", border: "1px solid #2a2a36", borderRadius: 8, padding: "8px 12px", color: "#f0f0f5", fontSize: 16, outline: "none", textAlign: "center" }} />
            <span style={{ fontSize: 13, color: "#6b6b80" }}>kg</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: "#6b6b80", textAlign: "center" }}>BMI: {(bodyWeight / (1.70 * 1.70)).toFixed(1)}</div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, marginBottom: 20 }}>
        {weekDates.map((date) => {
          const d = new Date(date + "T00:00:00");
          const isActive = date === selected, isToday = date === today;
          const sc = getDayScore(date), dots = Math.min(3, Math.round(sc / TOTAL * 3.5));
          return (
            <div key={date} onClick={() => { setSelected(date); setStatus(null); setIncome(""); setExpense(""); }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 4px", borderRadius: 10, border: `1px solid ${isActive ? "#f0f0f5" : "#2a2a36"}`, background: isActive ? "#f0f0f5" : "#17171f", cursor: "pointer", userSelect: "none" }}>
              <div style={{ fontSize: 10, color: isActive ? "#0e0e12" : "#6b6b80" }}>{DAY_SHORT[d.getDay()]}{isToday ? "·" : ""}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: isActive ? "#0e0e12" : "#f0f0f5" }}>{d.getDate()}</div>
              <div style={{ display: "flex", gap: 2 }}>{[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: isActive ? (i < dots ? "#0e0e12" : "rgba(0,0,0,0.15)") : (i < dots ? "#f0f0f5" : "#2a2a36") }} />)}</div>
            </div>
          );
        })}
      </div>

      {/* MOVE */}
      <div style={{ marginBottom: 12, background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 16 }}>🔥</span><span style={{ fontSize: 14, fontWeight: 700, color: "#ff6b35" }}>Move</span></div>
          <span style={{ fontSize: 11, color: "#6b6b80" }}>{(walkScore + sleepScore + workoutScore).toFixed(1)} / 3 คะแนน</span>
        </div>
        <div style={{ height: 1, background: "#2a2a36", marginBottom: 12 }} />
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "#6b6b80", marginBottom: 6 }}>👟 จำนวนก้าววันนี้ (เต็ม 0.5)</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="number" value={steps} onChange={e => { setWalkSteps(prev => ({ ...prev, [selected]: e.target.value })); setStatus(null); }} placeholder="0"
              style={{ flex: 1, background: "#0e0e12", border: `1px solid ${steps && parseInt(steps) >= WALK_TARGET ? "#ff6b35" : "#2a2a36"}`, borderRadius: 8, padding: "10px 12px", color: "#f0f0f5", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
            <div style={{ fontSize: 12, color: "#6b6b80", flexShrink: 0 }}>/ {WALK_TARGET.toLocaleString()}</div>
          </div>
          <div style={{ marginTop: 8, height: 4, background: "#2a2a36", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, walkScore / 0.5 * 100)}%`, background: "#ff6b35", borderRadius: 99, transition: "width 0.3s" }} />
          </div>
          {steps && <div style={{ marginTop: 4, fontSize: 11, color: parseInt(steps) >= WALK_TARGET ? "#ff6b35" : "#6b6b80" }}>{parseInt(steps) >= WALK_TARGET ? "✅ ถึงเป้าแล้ว! (+0.5)" : `ขาดอีก ${(WALK_TARGET - parseInt(steps)).toLocaleString()} ก้าว`}</div>}
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "#6b6b80", marginBottom: 6 }}>😴 นอนกี่ชั่วโมง (เต็ม 0.5)</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="number" value={sleep} step="0.5" onChange={e => { setSleepHours(prev => ({ ...prev, [selected]: e.target.value })); setStatus(null); }} placeholder="0"
              style={{ flex: 1, background: "#0e0e12", border: `1px solid ${sleep && parseFloat(sleep) >= SLEEP_TARGET ? "#ff6b35" : "#2a2a36"}`, borderRadius: 8, padding: "10px 12px", color: "#f0f0f5", fontSize: 16, outline: "none", boxSizing: "border-box" }} />
            <div style={{ fontSize: 12, color: "#6b6b80", flexShrink: 0 }}>/ {SLEEP_TARGET} ชม.</div>
          </div>
          <div style={{ marginTop: 8, height: 4, background: "#2a2a36", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, sleepScore / 0.5 * 100)}%`, background: "#ff6b35", borderRadius: 99, transition: "width 0.3s" }} />
          </div>
          {sleep && <div style={{ marginTop: 4, fontSize: 11, color: parseFloat(sleep) >= SLEEP_TARGET ? "#ff6b35" : "#6b6b80" }}>{parseFloat(sleep) >= SLEEP_TARGET ? "✅ นอนครบแล้ว! (+0.5)" : `+${sleepScore.toFixed(2)} คะแนน`}</div>}
        </div>
        <div onClick={() => { setWorkoutDone(prev => ({ ...prev, [selected]: !prev[selected] })); setStatus(null); }}
          style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "10px 12px", borderRadius: 10, border: `1px solid ${isWorkoutToday ? "transparent" : "#2a2a36"}`, background: isWorkoutToday ? "rgba(255,107,53,0.08)" : "#0e0e12", transition: "all 0.2s", userSelect: "none" }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: isWorkoutToday ? "#ff6b35" : "transparent", border: `2px solid ${isWorkoutToday ? "#ff6b35" : "#2a2a36"}`, color: isWorkoutToday ? "#fff" : "transparent", transition: "all 0.2s" }}>✓</div>
          <span style={{ fontSize: 14, color: isWorkoutToday ? "#6b6b80" : "#f0f0f5", textDecoration: isWorkoutToday ? "line-through" : "none" }}>💪 ออกกำลังกายวันนี้ (+2)</span>
          {isWorkoutToday && <button onClick={e => { e.stopPropagation(); setPage("workout"); }} style={{ marginLeft: "auto", background: "#ff6b35", border: "none", borderRadius: 6, padding: "4px 10px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>บันทึก →</button>}
        </div>
      </div>

      {/* FUEL */}
      <div style={{ marginBottom: 12, background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 16 }}>⚡</span><span style={{ fontSize: 14, fontWeight: 700, color: "#f7c948" }}>Fuel</span></div>
          <span style={{ fontSize: 11, color: "#6b6b80" }}>{(waterScore + eggScore).toFixed(1)}/1</span>
        </div>
        <div style={{ height: 1, background: "#2a2a36", margin: "0 16px 8px" }} />
        <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
          {[{ id: "Water 2L 💧", label: "ดื่มน้ำ 2 ลิตร (+0.5)" }, { id: "Egg 🥚", label: "กินไข่ 2 ฟอง (+0.5)" }].map(item => {
            const checked = !!dayChecks[item.id];
            return (
              <div key={item.id} onClick={() => { setChecks(prev => ({ ...prev, [selected]: { ...prev[selected], [item.id]: !prev[selected]?.[item.id] } })); setStatus(null); }}
                style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "10px 12px", borderRadius: 10, border: `1px solid ${checked ? "transparent" : "#2a2a36"}`, background: checked ? "rgba(255,255,255,0.02)" : "#0e0e12", transition: "all 0.2s", userSelect: "none" }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: checked ? "#f7c948" : "transparent", border: `2px solid ${checked ? "#f7c948" : "#2a2a36"}`, color: checked ? "#0e0e12" : "transparent", transition: "all 0.2s" }}>✓</div>
                <span style={{ fontSize: 14, color: checked ? "#6b6b80" : "#f0f0f5", textDecoration: checked ? "line-through" : "none" }}>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONNECT / GROW / CREATE */}
      {SECTIONS.map(sec => {
        const done = sec.items.reduce((sum, item) => sum + (dayChecks[item.id] ? item.score : 0), 0);
        const total = sec.items.reduce((sum, item) => sum + item.score, 0);
        return (
          <div key={sec.id} style={{ marginBottom: 12, background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 16 }}>{sec.icon}</span><span style={{ fontSize: 14, fontWeight: 700, color: sec.color }}>{sec.name}</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 40, height: 3, background: "#2a2a36", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(done/total)*100}%`, background: sec.color, borderRadius: 99, transition: "width 0.3s" }} />
                </div>
                <span style={{ fontSize: 11, color: "#6b6b80" }}>{done.toFixed(1)}/{total}</span>
              </div>
            </div>
            <div style={{ height: 1, background: "#2a2a36", margin: "0 16px 8px" }} />
            <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
              {sec.items.map(item => {
                const checked = !!dayChecks[item.id];
                return (
                  <div key={item.id}>
                    <div onClick={() => toggle(item.id)}
                      style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "10px 12px", borderRadius: 10, border: `1px solid ${checked ? "transparent" : "#2a2a36"}`, background: checked ? "rgba(255,255,255,0.02)" : "#0e0e12", transition: "all 0.2s", userSelect: "none" }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: checked ? sec.color : "transparent", border: `2px solid ${checked ? sec.color : "#2a2a36"}`, color: checked ? "#fff" : "transparent", transition: "all 0.2s" }}>✓</div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 14, color: checked ? "#6b6b80" : "#f0f0f5", textDecoration: checked ? "line-through" : "none" }}>{item.label}</span>
                        <span style={{ fontSize: 10, color: "#6b6b80", marginLeft: 6 }}>(+{item.score})</span>
                      </div>
                    </div>
                    {item.requireDetail && checked && learnCategory[selected] && (
                      <div onClick={() => { setLearnCatTemp(learnCategory[selected]); setLearnDetailTemp(learnDetail[selected] || ""); setShowLearnModal(true); }}
                        style={{ marginTop: 4, marginLeft: 12, padding: "8px 12px", borderRadius: 8, background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", cursor: "pointer" }}>
                        <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700 }}>{learnCategory[selected]}</div>
                        <div style={{ fontSize: 11, color: "#6b6b80", marginTop: 2 }}>{learnDetail[selected]}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Finance */}
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

      <button onClick={submit} disabled={status === "loading"} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: status === "success" ? "#4ecdc4" : status === "error" ? "#ff6b6b" : "#f0f0f5", color: "#0e0e12", fontSize: 15, fontWeight: 700, cursor: status === "loading" ? "not-allowed" : "pointer", transition: "all 0.3s", opacity: status === "loading" ? 0.7 : 1 }}>
        {status === "loading" ? "⏳ กำลังบันทึก..." : status === "success" ? "✅ บันทึกเข้า Notion แล้ว!" : status === "error" ? "❌ ลองอีกครั้ง" : "📤 Save to Notion"}
      </button>
      {status === "success" && <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#6b6b80" }}>Score {scoreDisplay}/{TOTAL} · {getThaiDate(selected)} 🎉</div>}
      {status === "error" && <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#ff6b6b" }}>บันทึกไม่ได้ — ลองใหม่อีกครั้งครับ</div>}

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#17171f", borderTop: "1px solid #2a2a36", display: "flex", justifyContent: "space-around", padding: "10px 0 20px", zIndex: 100 }}>
        <div onClick={() => setPage("check")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", opacity: 1 }}><span style={{ fontSize: 20 }}>✅</span><span style={{ fontSize: 10, color: "#f0f0f5" }}>Check</span></div>
        <div onClick={() => { if (isWorkoutToday) setPage("workout"); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: isWorkoutToday ? "pointer" : "default", opacity: isWorkoutToday ? 1 : 0.2 }}><span style={{ fontSize: 20 }}>💪</span><span style={{ fontSize: 10, color: "#f0f0f5" }}>Workout</span></div>
        <div onClick={() => window.location.href = '/stats'} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", opacity: 0.4 }}><span style={{ fontSize: 20 }}>📊</span><span style={{ fontSize: 10, color: "#f0f0f5" }}>Stats</span></div>
      </div>
    </div>
  );
}
