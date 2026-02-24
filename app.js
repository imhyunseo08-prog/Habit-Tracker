// 1. 전역 객체에서 사용할 리액트 훅을 가져옵니다.
const { useState, useEffect, useMemo } = React;

// 2. 안전한 localStorage 파서 (데이터 저장용)
const safeParse = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
};

// 3. 차트 컴포넌트
const SimpleChart = ({ data, isTheme }) => {
  const RechartsLib = window.Recharts;
  
  if (!RechartsLib) return <div className="h-32 flex items-center justify-center text-gray-400">Loading Chart...</div>;
  
  const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } = RechartsLib;
  const strokeColor = isTheme ? "#8b5cf6" : "#2563eb";

  return (
    <div className="h-32 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="shortDate" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} hide />
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }} />
          <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.5} />
          <Line type="monotone" dataKey="score" stroke={strokeColor} strokeWidth={3} dot={{ r: 3, fill: strokeColor, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// 4. 날짜 문자열 생성 함수
const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 5. 메인 앱 컴포넌트
function HabitTracker() {
  const { Trash2, ChevronDown, Activity, Check } = window.LucideReact || {};

  const [activeTab, setActiveTab] = useState('tracker');
  const [dateInput, setDateInput] = useState('14');
  const [items, setItems] = useState(() => safeParse('habit_items_v3', [{ id: 1, name: '물 마시기', isGlobal: true, active: true, createdAt: '2025-01-01' }]));
  const [checks, setChecks] = useState(() => safeParse('habit_checks', {}));
  const [themes, setThemes] = useState(() => safeParse('habit_themes', []));
  const [newGlobalName, setNewGlobalName] = useState('');
  const [collapsedThemes, setCollapsedThemes] = useState({});

  useEffect(() => {
    localStorage.setItem('habit_items_v3', JSON.stringify(items));
    localStorage.setItem('habit_checks', JSON.stringify(checks));
    localStorage.setItem('habit_themes', JSON.stringify(themes));
  }, [items, checks, themes]);

  const dates = useMemo(() => {
    const d = [];
    const count = parseInt(dateInput) || 7;
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      d.push(getLocalDateString(date));
    }
    return d;
  }, [dateInput]);

  const addItem = (name, isGlobal = true, themeId = null) => {
    if (!name.trim()) return;
    const newItem = { id: Date.now(), name: name.trim(), isGlobal, active: true, createdAt: getLocalDateString(new Date()) };
    setItems(prev => [...prev, newItem]);
    if (themeId) {
      setThemes(prev => prev.map(t => t.id === themeId ? { ...t, itemIds: [...(t.itemIds || []), newItem.id] } : t));
    }
    return true;
  };

  const HabitSection = ({ title, habitList, isTheme = false, themeId = null }) => {
    const isCollapsed = themeId ? !!collapsedThemes[themeId] : false;
    const [themeInput, setThemeInput] = useState('');

    const chartData = dates.map(d => {
      const checkedCount = habitList.filter(item => checks[d] && checks[d][item.id]).length;
      return { shortDate: d.slice(8), score: habitList.length ? Math.round((checkedCount / habitList.length) * 100) : 0 };
    });

    const avgScore = chartData.length ? Math.round(chartData.reduce((a, b) => a + b.score, 0) / chartData.length) : 0;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => isTheme && setCollapsedThemes(p => ({ ...p, [themeId]: !p[themeId] }))}>
          <div className="flex items-center gap-3">
            {isTheme && <ChevronDown className={isCollapsed ? "-rotate-90" : ""} size={20} />}
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          </div>
          <div className={`text-xs font-bold px-3 py-1 rounded-full ${avgScore >= 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-500'}`}>{avgScore}%</div>
        </div>
        {!isCollapsed && (
          <div className="px-4 pb-6">
            <SimpleChart data={chartData} isTheme={isTheme} />
            <div className="overflow-x-auto mt-6 no-scrollbar">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="w-8"></th>
                    <th className="text-left w-24 text-gray-400 text-[10px] uppercase">Habit</th>
                    {dates.slice(-5).map(d => <th key={d} className="text-center text-[10px] text-gray-300">{d.slice(8)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {habitList.map(item => (
                    <tr key={item.id}>
                      <td className="py-2 text-center">
                        <button onClick={() => confirm('삭제하시겠습니까?') && setItems(prev => prev.map(i => i.id === item.id ? { ...i, active: false } : i))} className="text-gray-200">
                          <Trash2 size={14} />
                        </button>
                      </td>
                      <td className="py-2 font-semibold text-gray-700">{item.name}</td>
                      {dates.slice(-5).map(d => {
                        const isChecked = !!(checks[d] && checks[d][item.id]);
                        return (
                          <td key={d} className="text-center">
                            <button onClick={() => setChecks(prev => ({ ...prev, [d]: { ...(prev[d] || {}), [item.id]: !isChecked } }))}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${isChecked ? (isTheme ? 'bg-violet-500 shadow-md' : 'bg-blue-500 shadow-md') : 'bg-gray-100'}`}>
                              {isChecked && <Check size={16} color="white" strokeWidth={4} />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {isTheme && (
                <div className="mt-4 pt-2 border-t border-gray-50">
                  <input className="w-full text-xs outline-none bg-transparent" placeholder="+ 새 습관 추가 (엔터)" value={themeInput} onChange={e => setThemeInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { addItem(themeInput, false, themeId); setThemeInput(''); } }} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-[#F8FAFC]">
      <header className="px-5 py-6 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-black text-gray-800">Habit Tracker</h1>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setActiveTab('tracker')} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${activeTab === 'tracker' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}>Track</button>
            <button onClick={() => setActiveTab('check')} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${activeTab === 'check' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}>Stats</button>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
          <Activity size={16} className="text-blue-500" />
          <input className="text-sm w-full bg-transparent outline-none font-bold text-slate-600" value={dateInput} onChange={e => setDateInput(e.target.value)} />
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-5 pb-20 no-scrollbar">
        {activeTab === 'tracker' ? (
          <div>
            <HabitSection title="Overall" habitList={items.filter(i => i.isGlobal && i.active)} />
            <input className="w-full p-4 bg-white rounded-2xl border border-gray-100 text-sm shadow-sm outline-none mb-6" placeholder="+ 새로운 전체 습관 추가..." value={newGlobalName} onChange={e => setNewGlobalName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { addItem(newGlobalName, true); setNewGlobalName(''); } }} />
            {themes.map(t => (
              <HabitSection key={t.id} title={t.name} isTheme={true} themeId={t.id} habitList={items.filter(i => (t.itemIds || []).includes(i.id) && i.active)} />
            ))}
            <button onClick={() => { const name = prompt("새 테마 이름:"); if (name) setThemes(p => [...p, { id: Date.now(), name, itemIds: [] }]); }} className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold">+ Create Theme</button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.filter(i => i.active).map(item => {
              const totalCount = Object.values(checks).filter(day => day[item.id]).length;
              return (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                  <div>
                    <div className="font-bold text-gray-800">{item.name}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Since {item.createdAt}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-blue-500">{totalCount}</div>
                    <div className="text-[10px] font-bold text-gray-300 uppercase">Days</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// 6. 실제 화면에 그리기 (ReactDOM 사용)
ReactDOM.render(<HabitTracker />, document.getElementById('root'));
