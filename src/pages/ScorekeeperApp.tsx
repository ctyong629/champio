import  { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Minus, Clock, RotateCcw, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import type { RouteType } from '@/types';

// 🌟 引入 Firebase 核心功能
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const MATCH_ID = 'DEMO_LIVE_MATCH';

export function ScorekeeperApp({ setRoute }: { setRoute: (route: RouteType) => void }) {
  const { addToast } = useToast();
  const [matchData, setMatchData] = useState<any>(null);
  
  // 計時器專用 State
  const [timeLeft, setTimeLeft] = useState(600); // 預設 600 秒 (10 分鐘)
  const [isRunning, setIsRunning] = useState(false);

  // 1. 初始化並監聽比賽資料
  useEffect(() => {
    const matchRef = doc(db, 'live_matches', MATCH_ID);
    const initMatch = async () => {
      await setDoc(matchRef, {
        teamA: '台大戰神', scoreA: 0, foulsA: 0,
        teamB: '政大黑熊', scoreB: 0, foulsB: 0,
        quarter: 'Q1', time: '10:00', status: 'live'
      }, { merge: true });
    };
    initMatch();

    const unsubscribe = onSnapshot(matchRef, (docSnap) => {
      if (docSnap.exists()) {
        setMatchData(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. 計時馬達：每秒倒數並同步到 Firebase
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          const m = Math.floor(newTime / 60).toString().padStart(2, '0');
          const s = (newTime % 60).toString().padStart(2, '0');
          updateDoc(doc(db, 'live_matches', MATCH_ID), { time: `${m}:${s}` });
          return newTime;
        });
      }, 1000);
    } else if (timeLeft <= 0) {
      setIsRunning(false); // 時間到自動停止
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // 🌟 3. 新增：手動微調時間功能 (回錶 / 設定單節長度)
  const adjustTime = (amount: number) => {
    setTimeLeft(prev => {
      const newTime = Math.max(0, prev + amount); // 確保時間不會變負數
      // 轉換並立刻同步到 Firebase
      const m = Math.floor(newTime / 60).toString().padStart(2, '0');
      const s = (newTime % 60).toString().padStart(2, '0');
      updateDoc(doc(db, 'live_matches', MATCH_ID), { time: `${m}:${s}` });
      return newTime;
    });
  };

  // 更新分數與犯規
  const updateMatch = async (field: string, change: number) => {
    if (!matchData) return;
    const newValue = Math.max(0, matchData[field] + change);
    try {
      await updateDoc(doc(db, 'live_matches', MATCH_ID), { [field]: newValue });
    } catch (error) {
      addToast({ title: '同步失敗，請檢查網路', variant: 'error' });
    }
  };

  // 重置小節時間
  const resetQuarter = (q: string) => {
    setIsRunning(false);
    setTimeLeft(600); // 預設回 10 分鐘
    updateDoc(doc(db, 'live_matches', MATCH_ID), { quarter: q, time: '10:00' });
  };

  if (!matchData) return <div className="h-screen w-screen bg-black flex items-center justify-center text-white text-2xl font-bold animate-pulse">載入記錄台系統中...</div>;

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col font-mono selection:bg-transparent overflow-hidden">
      
      {/* 頂部導覽列 */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
        <button onClick={() => setRoute('dashboard')} className="text-slate-400 hover:text-white flex items-center gap-2 font-sans font-bold">
          <ChevronLeft className="w-5 h-5" /> 返回後台
        </button>
        <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-400/10 px-4 py-1.5 rounded-full animate-pulse">
          <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" /> LIVE SYNC 毫秒級同步中
        </div>
        <button onClick={() => {
          setIsRunning(false);
          setTimeLeft(600);
          updateDoc(doc(db, 'live_matches', MATCH_ID), { scoreA: 0, scoreB: 0, foulsA: 0, foulsB: 0, quarter: 'Q1', time: '10:00' });
          addToast({ title: '比賽已重置', variant: 'success' });
        }} className="text-slate-500 hover:text-red-400 flex items-center gap-2 font-sans text-sm">
          <RotateCcw className="w-4 h-4" /> 重置比賽
        </button>
      </div>

      {/* 記錄台主畫面 */}
      <div className="flex-1 flex">
        
        {/* 左邊：Team A */}
        <div className="flex-1 border-r border-slate-800 flex flex-col">
          <div className="h-20 bg-blue-900/20 border-b border-blue-900/50 flex items-center justify-center">
            <h2 className="text-4xl font-black text-blue-400 tracking-widest">{matchData.teamA}</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
            <p className="text-[12rem] font-black text-white leading-none tabular-nums drop-shadow-[0_0_30px_rgba(96,165,250,0.3)]">
              {matchData.scoreA}
            </p>
            <div className="grid grid-cols-3 gap-4 w-full max-w-md mt-12">
              <Button onClick={() => updateMatch('scoreA', 1)} className="h-24 text-3xl font-black bg-slate-800 hover:bg-slate-700 text-white">+1</Button>
              <Button onClick={() => updateMatch('scoreA', 2)} className="h-24 text-4xl font-black bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]">+2</Button>
              <Button onClick={() => updateMatch('scoreA', 3)} className="h-24 text-4xl font-black bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)]">+3</Button>
              <Button onClick={() => updateMatch('scoreA', -1)} variant="outline" className="col-span-3 h-14 border-slate-800 text-slate-500 hover:text-slate-300">-1 扣除分數</Button>
            </div>
            {/* 犯規區 */}
            <div className="mt-auto w-full max-w-md bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-bold mb-1 uppercase tracking-widest">TEAM FOULS</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(f => (
                    <div key={f} className={`w-6 h-6 rounded-full border-2 ${matchData.foulsA >= f ? 'bg-red-500 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-slate-700'}`} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateMatch('foulsA', -1)} className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"><Minus className="w-6 h-6"/></button>
                <button onClick={() => updateMatch('foulsA', 1)} className="w-12 h-12 rounded-xl bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"><Plus className="w-6 h-6"/></button>
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 中間：時鐘與控制 */}
        <div className="w-80 bg-[#0a0f1c] flex flex-col items-center py-10 shrink-0 z-10 shadow-2xl">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl w-48 flex items-center justify-center mb-8 shadow-inner">
            <span className="text-4xl font-black text-orange-500">{matchData.quarter}</span>
          </div>
          
          {/* 使用本地的 timeLeft 顯示時間，確保操作零延遲 */}
          <div className={`text-6xl font-black tracking-widest tabular-nums mb-2 ${timeLeft <= 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <p className="text-slate-500 font-bold tracking-widest flex items-center gap-2 mb-4"><Clock className="w-4 h-4"/> GAME CLOCK</p>
          
          {/* 🌟 新增：時間微調控制面板 */}
          <div className="grid grid-cols-4 gap-1 w-full px-6 mb-8">
            <button onClick={() => adjustTime(60)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded py-2.5 text-xs font-bold transition-colors">+1 分</button>
            <button onClick={() => adjustTime(-60)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded py-2.5 text-xs font-bold transition-colors">-1 分</button>
            <button onClick={() => adjustTime(1)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded py-2.5 text-xs font-bold transition-colors">+1 秒</button>
            <button onClick={() => adjustTime(-1)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded py-2.5 text-xs font-bold transition-colors">-1 秒</button>
          </div>
          
          <div className="w-48 mb-auto">
            <Button 
              className={`w-full h-16 text-xl font-bold tracking-widest transition-all ${isRunning ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? <><Pause className="w-6 h-6 mr-2"/> 暫停計時</> : <><Play className="w-6 h-6 mr-2"/> 開始比賽</>}
            </Button>
          </div>
          
          <div className="space-y-3 w-48 mt-8">
            <p className="text-slate-600 text-xs font-bold text-center tracking-widest uppercase mb-2">切換小節 (自動重置 10分)</p>
            <Button variant="outline" className="w-full h-12 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => resetQuarter('Q1')}>第一節</Button>
            <Button variant="outline" className="w-full h-12 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => resetQuarter('Q2')}>第二節</Button>
            <Button variant="outline" className="w-full h-12 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => resetQuarter('Q3')}>第三節</Button>
            <Button variant="outline" className="w-full h-12 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => resetQuarter('Q4')}>第四節</Button>
          </div>
        </div>

        {/* 右邊：Team B */}
        <div className="flex-1 flex flex-col">
          <div className="h-20 bg-orange-900/20 border-b border-orange-900/50 flex items-center justify-center">
            <h2 className="text-4xl font-black text-orange-400 tracking-widest">{matchData.teamB}</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
            <p className="text-[12rem] font-black text-white leading-none tabular-nums drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]">
              {matchData.scoreB}
            </p>
            <div className="grid grid-cols-3 gap-4 w-full max-w-md mt-12">
              <Button onClick={() => updateMatch('scoreB', 1)} className="h-24 text-3xl font-black bg-slate-800 hover:bg-slate-700 text-white">+1</Button>
              <Button onClick={() => updateMatch('scoreB', 2)} className="h-24 text-4xl font-black bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)]">+2</Button>
              <Button onClick={() => updateMatch('scoreB', 3)} className="h-24 text-4xl font-black bg-orange-500 hover:bg-orange-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.6)]">+3</Button>
              <Button onClick={() => updateMatch('scoreB', -1)} variant="outline" className="col-span-3 h-14 border-slate-800 text-slate-500 hover:text-slate-300">-1 扣除分數</Button>
            </div>
            {/* 犯規區 */}
            <div className="mt-auto w-full max-w-md bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-bold mb-1 uppercase tracking-widest">TEAM FOULS</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(f => (
                    <div key={f} className={`w-6 h-6 rounded-full border-2 ${matchData.foulsB >= f ? 'bg-red-500 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-slate-700'}`} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateMatch('foulsB', -1)} className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"><Minus className="w-6 h-6"/></button>
                <button onClick={() => updateMatch('foulsB', 1)} className="w-12 h-12 rounded-xl bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"><Plus className="w-6 h-6"/></button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}