import { useState, useRef, useEffect } from "react";

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
const SLEEP_TARGET = 8;

const WORKOUT_GROUPS = [
  { id: "chest", icon: "💪", name: "อก", color: "#ff6b35", exercises: ["Bench Press", "Incline Press", "Cable Fly", "Dumbbell Fly", "Push Up"] },
  { id: "back", icon: "🏋️", name: "หลัง", color: "#4ecdc4", exercises: ["Deadlift", "Pull Up", "Lat Pulldown", "Seated Row", "Barbell Row"] },
  { id: "shoulder", icon: "🔱", name: "ไหล่", color: "#a78bfa", exercises: ["Shoulder Press", "Lateral Raise", "Front Raise", "Face Pull", "Shrug"] },
  { id: "leg", icon: "🦵", name: "ขา", color: "#f7c948", exercises: ["Squat", "Leg Press", "Leg Curl", "Leg Extension", "Calf Raise"] },
  { id: "core", icon: "⚡", name: "Core", color: "#f472b6", exercises: ["Plank", "Crunch", "Leg Raise", "Russian Twist", "Cable Crunch"] },
  { id: "cardio", icon: "🏃", name: "Cardio", color: "#4ecdc4", exercises: ["วิ่ง", "ปั่นจักรยาน", "ว่ายน้ำ", "Rowing", "Jump Rope"] },
];

const SECTIONS = [
  { id: "connect", icon: "🌐", name: "Connect", color: "#4ecdc4", score: 1, items: [
    { id: "Line Friends 💬", label: "คุยไลน์เล่นกับเพื่อนๆ" },
    { id: "Hangout 🤝", label: "ทำกิจกรรมกับเพื่อน" },
    { id: "Event 🎉", label: "เข้าร่วม event/กิจกรรมใหม่" }
  ]},
  { id: "grow", icon: "🧠", name: "Grow", color: "#a78bfa", score: 1, items: [
    { id: "Podcast 🎧", label: "ฟัง Podcast" },
    { id: "Bujo 📓", label: "บันทึก Bujo" }
  ]},
  { id: "create", icon: "🎨", name: "Create", color: "#f472b6", score: 1, items: [
    { id: "Idea Content 💡", label: "จด idea content" },
    { id: "Make Content ✂️", label: "ตัด/ทำ content" }
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

const isStats = window.location.pathname === "/stats";

export default function App() {
  const today = getTodayStr();
  const weekDates = getWeekDates();
  const [page, setPage] = useState(isStats ? "stats" : "check");
  const [selected, setSelected] = useState(today);
  const [checks, setChecks] = useState({});
  const [walkSteps, setWalkSteps] = useState({});
  const [sleepHours, setSleepHours] = useState({});
  const [workoutDone, setWorkoutDone] = useState({});
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");
  const [status, setStatus] = useState(null);

  // Food
  const [meals, setMeals] = useState({});
  const [analyzingFood, setAnalyzingFood] = useState(false);
  const [foodError, setFoodError] = useState(null);
  const [foodDesc, setFoodDesc] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const fileInputRef = useRef(null);

  // Workout page state
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [workoutLog, setWorkoutLog] = useState({}); // { date: { exerciseName: [{sets, reps, kg}] } }
  const [customExercise, setCustomExercise] = useState("");
  const [customExercises, setCustomExercises] = useState({});
  const [bodyWeight, setBodyWeight] = useState(() => parseFloat(localStorage.getItem("bodyWeight") || "62"));
  const [showSettings, setShowSettings] = useState(false);
  const [workoutMinutes, setWorkoutMinutes] = useState({});

  const [loading, setLoading] = useState(true);

  // Load data from Notion on mount
  useEffect(() => {
    fetch('/api/get-notion')
      .then(r => r.json())
      .then(data => {
        if (!data.rows) return;
        const newChecks = {};
        const newWalkSteps = {};
        const newSleepHours = {};
        const newWorkoutDone = {};

        data.rows.forEach(row => {
          if (!row.date) return;
          newChecks[row.date] = {
            "Water 2L 💧": row.water,
            "Egg 🥚": row.egg,
            "Line Friends 💬": row.line,
            "Hangout 🤝": row.hangout,
            "Event 🎉": row.event,
            "Podcast 🎧": row.podcast,
            "Bujo 📓": row.bujo,
            "Idea Content 💡": row.idea,
            "Make Content ✂️": row.make,
          };
          if (row.dailyScore) newWalkSteps[row.date] = String(row.dailyScore);
          if (row.workout) newWorkoutDone[row.date] = true;
        });

        setChecks(newChecks);
        setWalkSteps(newWalkSteps);
        setWorkoutDone(newWorkoutDone);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const dayChecks = checks[selected] || {};
  const sleep = sleepHours[selected] || "";
  const dayMeals = meals[selected] || [];
  const totalCalories = dayMeals.reduce((s, m) => s + (m.total_calories || m.total || 0), 0);
  const isWorkoutToday = workoutDone[selected] || false;

  // Scoring
  const walkScore = steps ? Math.min(0.5, parseInt(steps) / WALK_TARGET * 0.5) : 0;
  const sleepScore = sleep ? Math.min(0.5, parseFloat(sleep) / SLEEP_TARGET * 0.5) : 0;
  const workoutScore = isWorkoutToday ? 1 : 0;
  const waterScore = dayChecks["Water 2L 💧"] ? 0.5 : 0;
  const eggScore = dayChecks["Egg 🥚"] ? 0.5 : 0;
  const checkScore = ALL_ITEMS.filter(item => dayChecks[item.id]).length;
  const scoreDisplay = parseFloat((walkScore + sleepScore + workoutScore + waterScore + eggScore + checkScore).toFixed(1));

  const toggle = (itemId) => {
    setChecks(prev => ({ ...prev, [selected]: { ...prev[selected], [itemId]: !prev[selected]?.[itemId] } }));
    setStatus(null);
  };

  const getDayScore = (date) => {
    const d = checks[date] || {};
    const w = walkSteps[date] ? Math.min(0.5, parseInt(walkSteps[date]) / WALK_TARGET * 0.5) : 0;
    const sl = sleepHours[date] ? Math.min(0.5, parseFloat(sleepHours[date]) / SLEEP_TARGET * 0.5) : 0;
    const wo = workoutDone[date] ? 1 : 0;
    const water = d["Water 2L 💧"] ? 0.5 : 0;
    const egg = d["Egg 🥚"] ? 0.5 : 0;
    return w + sl + wo + water + egg + ALL_ITEMS.filter(item => d[item.id]).length;
  };

  const analyzeFood = async (file, desc) => {
    setAnalyzingFood(true);
    setFoodError(null);
    try {
      const doAnalyze = async (imageBase64, mediaType) => {
        const res = await fetch('/api/analyze-food', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64, mediaType, description: desc }),
        });
        const data = await res.json();
        if (res.ok) {
          setMeals(prev => ({ ...prev, [selected]: [...(prev[selected] || []), { ...data, time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) }] }));
          setFoodDesc(""); setPendingFile(null);
        } else { setFoodError('วิเคราะห์ไม่ได้ ลองใหม่'); }
        setAnalyzingFood(false);
      };
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const img = new Image();
          img.onload = async () => {
            const canvas = document.createElement('canvas');
            const MAX = 800;
            let w = img.width, h = img.height;
            if (w > h && w > MAX) { h = h * MAX / w; w = MAX; } else if (h > MAX) { w = w * MAX / h; h = MAX; }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            await doAnalyze(canvas.toDataURL('image/jpeg', 0.7).split(',')[1], 'image/jpeg');
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      } else { await doAnalyze(null, null); }
    } catch (e) { setFoodError('เกิดข้อผิดพลาด'); setAnalyzingFood(false); }
  };

  const removeMeal = (index) => setMeals(prev => ({ ...prev, [selected]: prev[selected].filter((_, i) => i !== index) }));

  const addSet = (exercise) => {
    setWorkoutLog(prev => {
      const dayLog = prev[selected] || {};
      const sets = dayLog[exercise] || [];
      return { ...prev, [selected]: { ...dayLog, [exercise]: [...sets, { sets: "3", reps: "10", kg: "" }] } };
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
      const sets = (dayLog[exercise] || []).filter((_, i) => i !== idx);
      return { ...prev, [selected]: { ...dayLog, [exercise]: sets } };
    });
  };

  // Get last session for an exercise
  const getLastSession = (exercise) => {
    const dates = Object.keys(workoutLog).sort().reverse();
    for (const date of dates) {
      if (date === selected) continue;
      const sets = workoutLog[date]?.[exercise];
      if (sets && sets.length > 0) return { date, sets };
    }
    return null;
  };

  // Estimate calories burned using MET formula
  const calcWorkoutCalories = (date) => {
    const minutes = workoutMinutes[date] || 0;
    if (!minutes) return 0;
    return Math.round(5 * bodyWeight * (minutes / 60));
  };

  const submit = async () => {
    setStatus("loading");
    try {
      const pageId = PAGE_IDS[selected];
      if (!pageId) { setStatus("error"); return; }
      const properties = {};
      ALL_ITEMS.forEach(item => { properties[item.id] = { checkbox: !!dayChecks[item.id] }; });
      properties["Water 2L 💧"] = { checkbox: !!dayChecks["Water 2L 💧"] };
      properties["Egg 🥚"] = { checkbox: !!dayChecks["Egg 🥚"] };
      properties["Walk 8k 👟"] = { checkbox: steps ? parseInt(steps) >= WALK_TARGET : false };
      properties["Sleep 6h 😴"] = { checkbox: sleep ? parseFloat(sleep) >= 6 : false };
      properties["Workout 💪"] = { checkbox: isWorkoutToday };
      if (steps) properties["Daily Score"] = { number: parseInt(steps) };
      if (income) properties["รายรับ 💰"] = { number: parseFloat(income) };
      if (expense) properties["รายจ่าย 💸"] = { number: parseFloat(expense) };
      if (totalCalories > 0) properties["แคลอรี่ 🔥"] = { number: totalCalories };
      const dayLog = workoutLog[selected] || {};
      const workoutSummary = Object.entries(dayLog).filter(([, sets]) => sets.length > 0)
        .map(([ex, sets]) => `${ex}: ${sets.map(s => `${s.sets}x${s.reps}${s.kg ? `@${s.kg}kg` : ''}`).join(', ')}`).join(' | ');
      if (workoutSummary) properties["Workout Log 📝"] = { rich_text: [{ text: { content: workoutSummary } }] };

      const res = await fetch("/api/update-notion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pageId, properties }) });
      if (res.ok) { setStatus("success"); } else { setStatus("error"); }
    } catch (e) { setStatus("error"); }
  };

  // ── WORKOUT PAGE ──
  if (page === "workout") {
    const dayLog = workoutLog[selected] || {};
    const allExercises = selectedGroup ? [...selectedGroup.exercises, ...(Object.keys(dayLog).filter(k => !WORKOUT_GROUPS.flatMap(g => g.exercises).includes(k)))] : [];

    return (
      <div style={{ background: "#0e0e12", minHeight: "100vh", color: "#f0f0f5", fontFamily: "'Sarabun', sans-serif", padding: "20px 16px 80px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 20, position: "relative" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#6b6b80", marginBottom: 4 }}>WORKOUT</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{getThaiDate(selected)}</div>
          <div onClick={() => setShowSettings(!showSettings)} style={{ position: "absolute", right: 0, top: 0, fontSize: 20, cursor: "pointer" }}>⚙️</div>
        </div>

        {/* Settings popup */}
        {showSettings && (
          <div style={{ background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", padding: "16px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>⚙️ ตั้งค่า</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: "#6b6b80", flexShrink: 0 }}>น้ำหนักตัว (kg)</span>
              <input type="number" value={bodyWeight}
                onChange={e => { const v = parseFloat(e.target.value); if (v > 0) { setBodyWeight(v); localStorage.setItem("bodyWeight", v); } }}
                style={{ flex: 1, background: "#0e0e12", border: "1px solid #2a2a36", borderRadius: 8, padding: "8px 12px", color: "#f0f0f5", fontSize: 16, outline: "none", textAlign: "center" }} />
              <span style={{ fontSize: 13, color: "#6b6b80" }}>kg</span>
            </div>
          </div>
        )}

        {/* Workout duration */}
        <div style={{ background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#6b6b80" }}>⏱️ เวลา workout วันนี้</span>
            <input type="number" value={workoutMinutes[selected] || ""}
              onChange={e => setWorkoutMinutes(prev => ({ ...prev, [selected]: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              style={{ flex: 1, background: "#0e0e12", border: "1px solid #2a2a36", borderRadius: 8, padding: "8px 12px", color: "#f0f0f5", fontSize: 16, outline: "none", textAlign: "center" }} />
            <span style={{ fontSize: 13, color: "#6b6b80" }}>นาที</span>
          </div>
          {workoutMinutes[selected] > 0 && (
            <div style={{ marginTop: 8, fontSize: 13, color: "#ff6b35", textAlign: "center" }}>
              🔥 เผาผลาญประมาณ {calcWorkoutCalories(selected)} kcal
            </div>
          )}
        </div>

        {!selectedGroup ? (
          <>
            <div style={{ fontSize: 13, color: "#6b6b80", marginBottom: 16, textAlign: "center" }}>เลือก Muscle Group</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {WORKOUT_GROUPS.map(g => {
                const hasLog = Object.keys(dayLog).some(k => g.exercises.includes(k) && dayLog[k].length > 0);
                return (
                  <div key={g.id} onClick={() => setSelectedGroup(g)}
                    style={{ background: "#17171f", borderRadius: 16, border: `1px solid ${hasLog ? g.color : "#2a2a36"}`, padding: "20px 16px", cursor: "pointer", textAlign: "center" }}>
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
              <button onClick={() => setSelectedGroup(null)} style={{ background: "#17171f", border: "1px solid #2a2a36", borderRadius: 8, padding: "8px 12px", color: "#f0f0f5", cursor: "pointer", fontSize: 13 }}>← กลับ</button>
              <span style={{ fontSize: 18, fontWeight: 700, color: selectedGroup.color }}>{selectedGroup.icon} {selectedGroup.name}</span>
            </div>

            {selectedGroup.exercises.concat(customExercises[selectedGroup.id] || []).map(ex => {
              const sets = dayLog[ex] || [];
              const last = getLastSession(ex);
              return (
                <div key={ex} style={{ marginBottom: 12, background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{ex}</span>
                      {last && <div style={{ fontSize: 10, color: "#6b6b80", marginTop: 2 }}>
                        ครั้งล่าสุด {getThaiDate(last.date).split(' ').slice(1).join(' ')}: {last.sets.map(s => `${s.sets}x${s.reps}${s.kg ? `@${s.kg}kg` : ''}`).join(', ')}
                      </div>}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {last && sets.length === 0 && <button onClick={() => {
                        setWorkoutLog(prev => ({ ...prev, [selected]: { ...(prev[selected] || {}), [ex]: last.sets.map(s => ({ ...s })) } }));
                      }} style={{ background: "transparent", border: `1px solid ${selectedGroup.color}`, borderRadius: 8, padding: "6px 10px", color: selectedGroup.color, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>ใช้เหมือนเดิม</button>}
                      <button onClick={() => addSet(ex)} style={{ background: selectedGroup.color, border: "none", borderRadius: 8, padding: "6px 12px", color: "#0e0e12", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Set</button>
                    </div>
                  </div>
                  {sets.length > 0 && (
                    <div style={{ padding: "0 16px 12px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 24px", gap: 6, marginBottom: 6 }}>
                        {["Sets", "Reps", "kg", ""].map(h => <div key={h} style={{ fontSize: 10, color: "#6b6b80", textAlign: "center" }}>{h}</div>)}
                      </div>
                      {sets.map((set, idx) => (
                        <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 24px", gap: 6, marginBottom: 6 }}>
                          {["sets", "reps", "kg"].map(field => (
                            <input key={field} type="number" value={set[field]} onChange={e => updateSet(ex, idx, field, e.target.value)}
                              placeholder={field === "kg" ? "kg" : field}
                              style={{ background: "#0e0e12", border: "1px solid #2a2a36", borderRadius: 6, padding: "8px", color: "#f0f0f5", fontSize: 14, outline: "none", textAlign: "center", width: "100%", boxSizing: "border-box" }} />
                          ))}
                          <div onClick={() => removeSet(ex, idx)} style={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b6b80", fontSize: 14 }}>✕</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add custom exercise */}
            <div style={{ background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", padding: "14px 16px", marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#6b6b80", marginBottom: 8 }}>➕ เพิ่มท่าเอง</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" value={customExercise} onChange={e => setCustomExercise(e.target.value)} placeholder="ชื่อท่า..."
                  style={{ flex: 1, background: "#0e0e12", border: "1px solid #2a2a36", borderRadius: 8, padding: "10px 12px", color: "#f0f0f5", fontSize: 14, outline: "none" }} />
                <button onClick={() => {
                  if (customExercise.trim()) {
                    const name = customExercise.trim();
                    setCustomExercises(prev => ({
                      ...prev,
                      [selectedGroup.id]: [...(prev[selectedGroup.id] || []), name]
                    }));
                    addSet(name);
                    setCustomExercise("");
                  }
                }} style={{ background: selectedGroup.color, border: "none", borderRadius: 8, padding: "10px 14px", color: "#0e0e12", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>เพิ่ม</button>
              </div>
            </div>

            {/* Calories estimate */}
            {calcWorkoutCalories(selected) > 0 && (
              <div style={{ background: "#17171f", borderRadius: 16, border: "1px solid #ff6b35", padding: "14px 16px", marginBottom: 12, textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#6b6b80", marginBottom: 4 }}>🔥 พลังงานที่ใช้ (ประมาณการ)</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#ff6b35" }}>{calcWorkoutCalories(selected)} kcal</div>
              </div>
            )}
          </>
        )}

        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#17171f", borderTop: "1px solid #2a2a36", display: "flex", justifyContent: "space-around", padding: "10px 0 20px", zIndex: 100 }}>
          <div onClick={() => setPage("check")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", opacity: 0.4 }}>
            <span style={{ fontSize: 20 }}>✅</span><span style={{ fontSize: 10, color: "#f0f0f5" }}>Check</span>
          </div>
          <div onClick={() => setPage("workout")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", opacity: 1 }}>
            <span style={{ fontSize: 20 }}>💪</span><span style={{ fontSize: 10, color: "#f0f0f5" }}>Workout</span>
          </div>
          <div onClick={() => setPage("stats")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", opacity: 0.4 }}>
            <span style={{ fontSize: 20 }}>📊</span><span style={{ fontSize: 10, color: "#f0f0f5" }}>Stats</span>
          </div>
        </div>
      </div>
    );
  }

  // ── STATS PAGE ──
  if (page === "stats") {
    const allDates = Object.keys(PAGE_IDS).sort();
    const scored = allDates.map(date => ({ date, score: getDayScore(date) }));
    const avg = scored.length ? (scored.reduce((a, b) => a + b.score, 0) / scored.length).toFixed(1) : 0;
    const best = scored.reduce((a, b) => b.score > a.score ? b : a, scored[0] || { score: 0 });
    const workoutDays = weekDates.filter(d => workoutDone[d]).length;

    return (
      <div style={{ background: "#0e0e12", minHeight: "100vh", color: "#f0f0f5", fontFamily: "'Sarabun', sans-serif", padding: "20px 16px 80px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#6b6b80", marginBottom: 4 }}>STATS</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>ภาพรวมเดือนนี้</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { label: "เฉลี่ยต่อวัน", value: avg, unit: `/ ${TOTAL}` },
            { label: "วันที่ดีสุด", value: best.score.toFixed(1), unit: best.date ? best.date.slice(5) : "-" },
            { label: "Workout สัปดาห์นี้", value: workoutDays, unit: "วัน", color: workoutDays >= 3 ? "#4ecdc4" : "#f7c948" },
          ].map(card => (
            <div key={card.label} style={{ background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", padding: "12px" }}>
              <div style={{ fontSize: 10, color: "#6b6b80", marginBottom: 6 }}>{card.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: card.color || "#f0f0f5" }}>{card.value}</div>
              <div style={{ fontSize: 10, color: "#6b6b80" }}>{card.unit}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", padding: "16px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6b6b80", marginBottom: 12 }}>Score รายวัน</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 80 }}>
            {allDates.slice(-14).map(date => {
              const sc = getDayScore(date);
              const h = TOTAL > 0 ? (sc / TOTAL) * 80 : 0;
              return (
                <div key={date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div style={{ width: "100%", height: h, background: sc >= TOTAL * 0.7 ? "#4ecdc4" : sc >= TOTAL * 0.4 ? "#f7c948" : "#2a2a36", borderRadius: 3, transition: "height 0.3s" }} />
                  <div style={{ fontSize: 8, color: "#6b6b80" }}>{new Date(date + "T00:00:00").getDate()}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", padding: "16px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6b6b80", marginBottom: 12 }}>Workout สัปดาห์นี้</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
            {weekDates.map(date => {
              const d = new Date(date + "T00:00:00");
              const done = workoutDone[date];
              return (
                <div key={date} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#6b6b80", marginBottom: 4 }}>{DAY_SHORT[d.getDay()]}</div>
                  <div style={{ width: "100%", aspectRatio: "1", borderRadius: 6, background: done ? "#ff6b35" : "#2a2a36", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                    {done ? "💪" : ""}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: workoutDays >= 3 ? "#4ecdc4" : "#6b6b80", textAlign: "center" }}>
            {workoutDays >= 3 ? `✅ ${workoutDays} วัน — เป้าหมายสำเร็จ!` : `${workoutDays}/3 วัน — ต้องการอีก ${3 - workoutDays} วัน`}
          </div>
        </div>

        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#17171f", borderTop: "1px solid #2a2a36", display: "flex", justifyContent: "space-around", padding: "10px 0 20px", zIndex: 100 }}>
          <div onClick={() => setPage("check")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", opacity: 0.4 }}>
            <span style={{ fontSize: 20 }}>✅</span><span style={{ fontSize: 10, color: "#f0f0f5" }}>Check</span>
          </div>
          <div onClick={() => setPage("workout")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", opacity: 0.4 }}>
            <span style={{ fontSize: 20 }}>💪</span><span style={{ fontSize: 10, color: "#f0f0f5" }}>Workout</span>
          </div>
          <div onClick={() => setPage("stats")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", opacity: 1 }}>
            <span style={{ fontSize: 20 }}>📊</span><span style={{ fontSize: 10, color: "#f0f0f5" }}>Stats</span>
          </div>
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

      {/* Settings popup */}
      {showSettings && (
        <div style={{ background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", padding: "16px", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>⚙️ ตั้งค่า</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#6b6b80", flexShrink: 0 }}>น้ำหนักตัว</span>
            <input type="number" value={bodyWeight}
              onChange={e => { const v = parseFloat(e.target.value); if (v > 0) { setBodyWeight(v); localStorage.setItem("bodyWeight", v); } }}
              style={{ flex: 1, background: "#0e0e12", border: "1px solid #2a2a36", borderRadius: 8, padding: "8px 12px", color: "#f0f0f5", fontSize: 16, outline: "none", textAlign: "center" }} />
            <span style={{ fontSize: 13, color: "#6b6b80" }}>kg</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: "#6b6b80", textAlign: "center" }}>BMI: {(bodyWeight / (1.70 * 1.70)).toFixed(1)}</div>
        </div>
      )}

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

      {/* Move Section */}
      <div style={{ marginBottom: 12, background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>🔥</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#ff6b35" }}>Move</span>
          </div>
          <span style={{ fontSize: 11, color: "#6b6b80" }}>{(walkScore + sleepScore + workoutScore).toFixed(1)} / 2 คะแนน</span>
        </div>
        <div style={{ height: 1, background: "#2a2a36", marginBottom: 12 }} />

        {/* Walk */}
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
          {steps && <div style={{ marginTop: 4, fontSize: 11, color: parseInt(steps) >= WALK_TARGET ? "#ff6b35" : "#6b6b80" }}>
            {parseInt(steps) >= WALK_TARGET ? "✅ ถึงเป้าแล้ว! (+0.5)" : `ขาดอีก ${(WALK_TARGET - parseInt(steps)).toLocaleString()} ก้าว · +${walkScore.toFixed(2)}`}
          </div>}
        </div>

        {/* Sleep */}
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
          {sleep && <div style={{ marginTop: 4, fontSize: 11, color: parseFloat(sleep) >= SLEEP_TARGET ? "#ff6b35" : "#6b6b80" }}>
            {parseFloat(sleep) >= SLEEP_TARGET ? "✅ นอนครบแล้ว! (+0.5)" : `+${sleepScore.toFixed(2)} คะแนน`}
          </div>}
        </div>

        {/* Workout checkbox */}
        <div onClick={() => { setWorkoutDone(prev => ({ ...prev, [selected]: !prev[selected] })); setStatus(null); }}
          style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "10px 12px", borderRadius: 10, border: `1px solid ${isWorkoutToday ? "transparent" : "#2a2a36"}`, background: isWorkoutToday ? "rgba(255,107,53,0.08)" : "#0e0e12", transition: "all 0.2s", userSelect: "none" }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: isWorkoutToday ? "#ff6b35" : "transparent", border: `2px solid ${isWorkoutToday ? "#ff6b35" : "#2a2a36"}`, color: isWorkoutToday ? "#fff" : "transparent", transition: "all 0.2s" }}>✓</div>
          <span style={{ fontSize: 14, color: isWorkoutToday ? "#6b6b80" : "#f0f0f5", textDecoration: isWorkoutToday ? "line-through" : "none" }}>💪 ออกกำลังกายวันนี้ (+1)</span>
          {isWorkoutToday && <button onClick={e => { e.stopPropagation(); setPage("workout"); }} style={{ marginLeft: "auto", background: "#ff6b35", border: "none", borderRadius: 6, padding: "4px 10px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>บันทึก →</button>}
        </div>
      </div>

      {/* Fuel Section */}
      <div style={{ marginBottom: 12, background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#f7c948" }}>Fuel</span>
          </div>
          <span style={{ fontSize: 11, color: "#6b6b80" }}>{(waterScore + eggScore).toFixed(1)}/1</span>
        </div>
        <div style={{ height: 1, background: "#2a2a36", margin: "0 16px 8px" }} />
        <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
          {[{ id: "Water 2L 💧", label: "ดื่มน้ำ 2 ลิตร (+0.5)" }, { id: "Egg 🥚", label: "กินไข่ 2 ฟอง (+0.5)" }].map(item => {
            const checked = !!dayChecks[item.id];
            return (
              <div key={item.id} onClick={() => toggle(item.id)}
                style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "10px 12px", borderRadius: 10, border: `1px solid ${checked ? "transparent" : "#2a2a36"}`, background: checked ? "rgba(255,255,255,0.02)" : "#0e0e12", transition: "all 0.2s", userSelect: "none" }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: checked ? "#f7c948" : "transparent", border: `2px solid ${checked ? "#f7c948" : "#2a2a36"}`, color: checked ? "#0e0e12" : "transparent", transition: "all 0.2s" }}>✓</div>
                <span style={{ fontSize: 14, color: checked ? "#6b6b80" : "#f0f0f5", textDecoration: checked ? "line-through" : "none" }}>{item.label}</span>
              </div>
            );
          })}

          {/* Food Analysis */}
          <div style={{ marginTop: 8 }}>
            <div style={{ height: 1, background: "#2a2a36", marginBottom: 12 }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#f7c948", fontWeight: 700 }}>🍽️ แคลอรี่วันนี้</span>
              {totalCalories > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: "#f7c948" }}>{totalCalories} kcal · 🥩 {dayMeals.reduce((s, m) => s + (m.total_protein || 0), 0)}g</span>}
            </div>
            {dayMeals.map((meal, i) => (
              <div key={i} style={{ background: "#0e0e12", borderRadius: 10, padding: "10px 12px", marginBottom: 6, border: "1px solid #2a2a36" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "#6b6b80" }}>มื้อ {i+1} · {meal.time}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#f7c948" }}>{meal.total_calories || meal.total || 0} kcal</span>
                    <span onClick={() => removeMeal(i)} style={{ fontSize: 11, color: "#6b6b80", cursor: "pointer" }}>✕</span>
                  </div>
                </div>
                {meal.items?.map((item, j) => (
                  <div key={j} style={{ fontSize: 12, color: "#6b6b80" }}>{item.name} · {item.calories} kcal · 🥩 {item.protein || 0}g</div>
                ))}
              </div>
            ))}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={e => { if (e.target.files[0]) setPendingFile(e.target.files[0]); }} style={{ display: "none" }} />
            <input type="text" value={foodDesc} onChange={e => setFoodDesc(e.target.value)} placeholder="รายละเอียดเพิ่มเติม เช่น ข้าวผัดกะเพรา 1 จาน..."
              style={{ width: "100%", background: "#0e0e12", border: "1px solid #2a2a36", borderRadius: 8, padding: "10px 12px", color: "#f0f0f5", fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => fileInputRef.current?.click()} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px dashed #f7c948", background: pendingFile ? "rgba(247,201,72,0.1)" : "transparent", color: "#f7c948", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                {pendingFile ? `📷 ${pendingFile.name.slice(0, 12)}...` : "📸 เลือกรูป"}
              </button>
              <button onClick={() => analyzeFood(pendingFile, foodDesc)} disabled={analyzingFood || (!pendingFile && !foodDesc)}
                style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: (pendingFile || foodDesc) ? "#f7c948" : "#2a2a36", color: "#0e0e12", fontSize: 12, fontWeight: 700, cursor: (pendingFile || foodDesc) ? "pointer" : "not-allowed", opacity: analyzingFood ? 0.6 : 1 }}>
                {analyzingFood ? "⏳ วิเคราะห์..." : "🔍 วิเคราะห์แคล"}
              </button>
            </div>
            {foodError && <div style={{ marginTop: 6, fontSize: 11, color: "#ff6b6b", textAlign: "center" }}>{foodError}</div>}
          </div>
        </div>
      </div>

      {/* Other Sections */}
      {SECTIONS.map(sec => {
        const done = sec.items.filter(item => dayChecks[item.id]).length;
        return (
          <div key={sec.id} style={{ marginBottom: 12, background: "#17171f", borderRadius: 16, border: "1px solid #2a2a36", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{sec.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: sec.color }}>{sec.name}</span>
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
                  <div key={item.id} onClick={() => toggle(item.id)}
                    style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "10px 12px", borderRadius: 10, border: `1px solid ${checked ? "transparent" : "#2a2a36"}`, background: checked ? "rgba(255,255,255,0.02)" : "#0e0e12", transition: "all 0.2s", userSelect: "none" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: checked ? sec.color : "transparent", border: `2px solid ${checked ? sec.color : "#2a2a36"}`, color: checked ? "#fff" : "transparent", transition: "all 0.2s" }}>✓</div>
                    <span style={{ fontSize: 14, color: checked ? "#6b6b80" : "#f0f0f5", textDecoration: checked ? "line-through" : "none", textDecorationColor: "#2a2a36" }}>{item.label}</span>
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

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#17171f", borderTop: "1px solid #2a2a36", display: "flex", justifyContent: "space-around", padding: "10px 0 20px", zIndex: 100 }}>
        <div onClick={() => setPage("check")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", opacity: 1 }}>
          <span style={{ fontSize: 20 }}>✅</span><span style={{ fontSize: 10, color: "#f0f0f5" }}>Check</span>
        </div>
        <div onClick={() => { if (isWorkoutToday) setPage("workout"); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: isWorkoutToday ? "pointer" : "default", opacity: isWorkoutToday ? 1 : 0.2 }}>
          <span style={{ fontSize: 20 }}>💪</span><span style={{ fontSize: 10, color: "#f0f0f5" }}>Workout</span>
        </div>
        <div onClick={() => setPage("stats")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", opacity: 0.4 }}>
          <span style={{ fontSize: 20 }}>📊</span><span style={{ fontSize: 10, color: "#f0f0f5" }}>Stats</span>
        </div>
      </div>
    </div>
  );
}
