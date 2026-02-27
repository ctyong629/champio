import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Loader2, Users, Trophy, X, AlertCircle, 
  Bell, Info,  CheckCircle2, ClipboardList, UploadCloud
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Footer } from '@/components/Footer';
import { useToast } from '@/hooks/useToast';

import { useAuth } from '@/contexts/AuthContext';
import type { RouteType } from '@/types'; 

// 🌟 引入 Firebase (包含 doc 與 onSnapshot 供即時比分使用)
import { collection, query, orderBy, limit, getDocs, where, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

interface PublicEventPageProps {
  setRoute: (route: RouteType) => void;
}

export function PublicEventPage({ setRoute }: PublicEventPageProps) {
  const [tab, setTab] = useState('info');
  const { addToast } = useToast();
  const { currentUser, userRole } = useAuth(); 
  
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({}); 
  const [customFiles, setCustomFiles] = useState<Record<string, File>>({}); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🌟 即時比分狀態 (監聽記錄台發出的資料)
  const [liveMatch, setLiveMatch] = useState<any>(null);

  useEffect(() => {
    // 1. 抓取賽事基本資料
    const fetchEvent = async () => {
      try {
        const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setEvent({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }
      } catch (error) {
        console.error("抓取賽事失敗:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();

    // 2. 🌟 監聽 DEMO_LIVE_MATCH 的即時資料
    const unsubscribeLive = onSnapshot(doc(db, 'live_matches', 'DEMO_LIVE_MATCH'), (docSnap) => {
      if (docSnap.exists()) {
        setLiveMatch(docSnap.data());
      }
    });

    return () => unsubscribeLive(); // 卸載時取消監聽
  }, []);

  const displayEvent = event || {
    id: 'mock-id',
    name: '2026 全國春季盃籃球聯賽',
    sport: '籃球',
    startDate: '2026-04-15',
    endDate: '2026-04-30',
    location: '台北市立體育館',
    organizer: '中華籃球協會',
    description: '此為範例賽事。',
    maxTeams: 16,
    teamsRegistered: 0,
    registrationFee: 3000,
    registrationDeadline: '2026-04-10',
    divisions: [
      { name: '一般男子組', limit: 8, registered: 0, confirmed: 0 },
      { name: '一般女子組', limit: 8, registered: 0, confirmed: 0 },
    ],
    milestones: [
      { date: '2026/01/16', label: '報名開始', status: 'past' },
      { date: '2026/04/10', label: '報名截止', status: 'upcoming' },
      { date: '2026/04/15', label: '比賽開始', status: 'upcoming' },
    ],
    customFields: [] 
  };

  const registered = displayEvent.teamsRegistered || 0;
  const max = displayEvent.maxTeams || 16;

  const isOrganizerRole = userRole === 'organizer' || userRole === 'admin';
  const isMyEvent = currentUser && displayEvent.organizerId === currentUser.uid;
  const isFull = registered >= max;

  let buttonText = '立即報名';
  let isButtonDisabled = false;

  if (isMyEvent) { buttonText = '這是您主辦的賽事'; isButtonDisabled = true; }
  else if (isOrganizerRole) { buttonText = '您是主辦方 (無法報名)'; isButtonDisabled = true; }
  else if (isFull) { buttonText = '報名已額滿'; isButtonDisabled = true; }

  const handleOpenRegistrationModal = async () => {
    if (!currentUser) {
      addToast({ title: '請先登入', description: '您需要登入並建立隊伍才能報名賽事', variant: 'error' });
      return;
    }
    if (isButtonDisabled) return;
    setIsModalOpen(true);
    setIsLoadingTeams(true);
    setCustomAnswers({}); 
    setCustomFiles({});
    try {
      const q = query(collection(db, 'teams'), where('captainId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const fetchedTeams = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyTeams(fetchedTeams);
      if (fetchedTeams.length > 0) setSelectedTeamId(fetchedTeams[0].id);
    } catch (error) {
      addToast({ title: '無法取得您的隊伍資料', variant: 'error' });
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const handleConfirmRegistration = async () => {
    if (!selectedTeamId || !currentUser) return;
    if (displayEvent.customFields) {
      for (const field of displayEvent.customFields) {
        if (field.required) {
          if (field.type === 'file' && !customFiles[field.id]) {
            addToast({ title: `請上傳檔案：${field.label}`, variant: 'warning' }); return;
          }
          if (field.type !== 'file' && !customAnswers[field.id]) {
            addToast({ title: `請填寫必填欄位：${field.label}`, variant: 'warning' }); return;
          }
        }
      }
    }
    setIsSubmitting(true);
    try {
      let finalAnswers = { ...customAnswers };
      for (const [fieldId, file] of Object.entries(customFiles)) {
        const fileRef = ref(storage, `registrations/${displayEvent.id}/${currentUser.uid}_${fieldId}_${file.name}`);
        await uploadBytes(fileRef, file);
        const downloadUrl = await getDownloadURL(fileRef);
        finalAnswers[fieldId] = downloadUrl; 
      }
      const selectedTeam = myTeams.find(t => t.id === selectedTeamId);
      await addDoc(collection(db, 'registrations'), {
        eventId: displayEvent.id,
        eventName: displayEvent.name,
        teamId: selectedTeam.id,
        teamName: selectedTeam.name,
        captainId: currentUser.uid,
        status: 'pending',
        customAnswers: finalAnswers, 
        createdAt: serverTimestamp(),
      });
      addToast({ title: '報名成功！', description: '請等候主辦方審核您的資料', variant: 'success' });
      setIsModalOpen(false);
    } catch (error) {
      addToast({ title: '報名失敗，請稍後再試', variant: 'error' });
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const renderDynamicField = (field: any) => {
    const baseClass = "w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:border-orange-500 focus:outline-none transition-colors";
    switch (field.type) {
      case 'textarea': return <textarea rows={3} required={field.required} value={customAnswers[field.id] || ''} onChange={(e) => setCustomAnswers({ ...customAnswers, [field.id]: e.target.value })} className={`${baseClass} resize-none`} placeholder="請輸入多行說明..." />;
      case 'select': return (<select required={field.required} value={customAnswers[field.id] || ''} onChange={(e) => setCustomAnswers({ ...customAnswers, [field.id]: e.target.value })} className={baseClass}><option value="" disabled hidden>請選擇...</option>{field.options?.map((opt: string, i: number) => <option key={i} value={opt}>{opt}</option>)}</select>);
      case 'radio': return (<div className="flex flex-wrap gap-4 mt-2">{field.options?.map((opt: string, i: number) => (<label key={i} className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-white transition-colors"><input type="radio" name={field.id} value={opt} required={field.required} onChange={(e) => setCustomAnswers({ ...customAnswers, [field.id]: e.target.value })} className="accent-orange-500 w-4 h-4" />{opt}</label>))}</div>);
      case 'checkbox': return (<div className="space-y-3 mt-2">{field.options?.map((opt: string, i: number) => { const currentValues = customAnswers[field.id] ? customAnswers[field.id].split(',') : []; return (<label key={i} className="flex items-center gap-3 text-slate-300 cursor-pointer hover:text-white transition-colors"><input type="checkbox" value={opt} checked={currentValues.includes(opt)} onChange={(e) => { const newValues = e.target.checked ? [...currentValues, opt] : currentValues.filter(v => v !== opt); setCustomAnswers({ ...customAnswers, [field.id]: newValues.join(',') }); }} className="accent-orange-500 w-4 h-4 rounded border-slate-700" />{opt}</label>); })}</div>);
      case 'file': return (<div className="relative mt-1"><input type="file" required={field.required} onChange={(e) => { if (e.target.files?.[0]) setCustomFiles({...customFiles, [field.id]: e.target.files[0]}) }} className="hidden" id={`file_${field.id}`} /><label htmlFor={`file_${field.id}`} className="flex items-center justify-center gap-2 w-full h-12 border-2 border-dashed border-slate-700 hover:border-orange-500 rounded-lg text-slate-400 hover:text-orange-400 cursor-pointer transition-colors bg-slate-900/50"><UploadCloud className="w-5 h-5" />{customFiles[field.id] ? customFiles[field.id].name : '點擊選擇檔案 (圖片/PDF)'}</label></div>);
      default: return <input type={field.type} required={field.required} value={customAnswers[field.id] || ''} onChange={(e) => setCustomAnswers({ ...customAnswers, [field.id]: e.target.value })} className={baseClass} placeholder={`請填寫${field.label}`} />;
    }
  };

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      {/* 1. 專業版 Header Banner */}
      <div className="h-80 bg-slate-900 relative border-b border-orange-500/20 overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${displayEvent.bannerImage || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2090'})` }}
          animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 20, repeat: Infinity }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 h-full flex flex-col justify-end pb-10">
          <Badge className="w-fit mb-4 bg-orange-600 text-white border-0 px-3 py-1">{displayEvent.sport}</Badge>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">{displayEvent.name}</h1>
          <div className="flex flex-wrap gap-6 text-slate-300 text-sm md:text-base">
            <span className="flex items-center gap-2"><Calendar className="w-5 h-5 text-orange-500" /> {displayEvent.startDate}</span>
            <span className="flex items-center gap-2"><MapPin className="w-5 h-5 text-orange-500" /> {displayEvent.location || '地點待定'}</span>
            <span className="flex items-center gap-2"><Users className="w-5 h-5 text-orange-500" /> {displayEvent.organizer}</span>
          </div>
        </div>
      </div>

      {/* 2. Sticky Tab Nav */}
      <nav className="sticky top-16 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 flex gap-8">
          {['info:首頁', 'bracket:賽程章程', 'teams:報名名單', 'live:即時比分'].map(item => {
            const [id, label] = item.split(':');
            return (
              <button key={id} onClick={() => setTab(id)} className={`py-5 text-sm font-bold transition-all relative ${tab === id ? 'text-orange-500' : 'text-slate-400 hover:text-white'}`}>
                {label}
                {tab === id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 3. Main Content Grid */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* === [首頁 (info)] === */}
        {tab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <section>
                <div className="flex items-center gap-2 mb-4 text-orange-500 font-bold text-lg"><Bell className="w-5 h-5" /> 最新公告</div>
                <Card className="bg-slate-900 border-slate-800 p-6 space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3 hover:bg-slate-800/30 transition-colors p-2 rounded cursor-pointer">
                    <span className="text-slate-200 text-sm">報名錄取順序以報名費匯交完成時間為準</span>
                    <span className="text-slate-500 text-xs">2026/01/16</span>
                  </div>
                </Card>
              </section>
              <section>
                <div className="flex items-center gap-2 mb-4 text-orange-500 font-bold text-lg"><Info className="w-5 h-5" /> 活動簡介</div>
                <Card className="bg-slate-900 border-slate-800 p-8 shadow-2xl">
                  <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed"><p className="whitespace-pre-wrap">{displayEvent.description || '主辦單位尚未提供詳細簡介。'}</p></div>
                </Card>
              </section>
            </div>
            <div className="space-y-8">
              <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-2xl">
                <div className="bg-orange-600 px-4 py-3 text-white font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2"><Users className="w-5 h-5" /> 報名現況</span>
                  <Badge variant="outline" className="text-white border-white/30">{registered}/{max} 隊</Badge>
                </div>
                <div className="p-0">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-800 text-orange-400">
                      <tr><th className="px-4 py-3 font-bold">組別</th><th className="px-4 py-3 text-center">上限</th><th className="px-4 py-3 text-center">已報名</th><th className="px-4 py-3 text-center">核准</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {(displayEvent.divisions || []).map((div: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-4 text-slate-200 font-medium">{div.name}</td>
                          <td className="px-4 py-4 text-center text-orange-500 font-bold">{div.limit || div.maxTeams}</td>
                          <td className="px-4 py-4 text-center text-slate-300">{div.registered || 0}</td>
                          <td className="px-4 py-4 text-center text-emerald-400 font-bold">{div.confirmed || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-slate-800">
                  <Button className={`w-full py-6 text-lg font-black tracking-widest ${isButtonDisabled ? 'bg-slate-800 text-slate-500' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'}`} onClick={handleOpenRegistrationModal} disabled={isButtonDisabled}>
                    {buttonText}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* === [賽程與隊伍] === */}
        {tab === 'bracket' && <div className="text-center py-40 text-slate-500 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">賽程表編排中，敬請期待</div>}
        {tab === 'teams' && <div className="text-center py-40 text-slate-500 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">報名名單確認中</div>}

        {/* === 🌟 [即時比分 (LIVE Scoreboard)] === */}
        {tab === 'live' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            {liveMatch ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                {/* 發光裝飾背景 */}
                <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2" />
                <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-orange-500/20 rounded-full blur-[100px] -translate-y-1/2" />

                <div className="flex justify-between items-center relative z-10">
                  {/* Team A */}
                  <div className="flex flex-col items-center w-1/3">
                    <h3 className="text-2xl md:text-4xl font-black text-white mb-6 tracking-widest text-center">{liveMatch.teamA}</h3>
                    <motion.div key={liveMatch.scoreA} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-7xl md:text-[8rem] font-black text-blue-400 font-mono drop-shadow-[0_0_20px_rgba(96,165,250,0.5)] leading-none">
                      {liveMatch.scoreA}
                    </motion.div>
                    <div className="mt-8 flex gap-2">
                      {[1, 2, 3, 4, 5].map(f => (
                        <div key={f} className={`w-3 h-3 md:w-5 md:h-5 rounded-full border-2 ${liveMatch.foulsA >= f ? 'bg-red-500 border-red-500' : 'border-slate-700'}`} />
                      ))}
                    </div>
                  </div>

                  {/* 中間時間 */}
                  <div className="flex flex-col items-center justify-center w-1/3 px-4">
                    <div className="bg-slate-950 border border-slate-800 px-6 py-2 rounded-full mb-6">
                      <span className="text-orange-500 font-black text-xl md:text-2xl">{liveMatch.quarter}</span>
                    </div>
                    <div className="text-4xl md:text-5xl font-black text-white font-mono tracking-widest">{liveMatch.time}</div>
                    <div className="mt-6 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-emerald-400 text-xs font-bold tracking-widest">LIVE</span>
                    </div>
                  </div>

                  {/* Team B */}
                  <div className="flex flex-col items-center w-1/3">
                    <h3 className="text-2xl md:text-4xl font-black text-white mb-6 tracking-widest text-center">{liveMatch.teamB}</h3>
                    <motion.div key={liveMatch.scoreB} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-7xl md:text-[8rem] font-black text-orange-400 font-mono drop-shadow-[0_0_20px_rgba(249,115,22,0.5)] leading-none">
                      {liveMatch.scoreB}
                    </motion.div>
                    <div className="mt-8 flex gap-2">
                      {[1, 2, 3, 4, 5].map(f => (
                        <div key={f} className={`w-3 h-3 md:w-5 md:h-5 rounded-full border-2 ${liveMatch.foulsB >= f ? 'bg-red-500 border-red-500' : 'border-slate-700'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-40 text-slate-500 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-slate-600" />
                <p>等待記錄台連線中...</p>
              </div>
            )}
          </motion.div>
        )}

      </div>

      {/* 🌟 報名 Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950 shrink-0">
                <h3 className="text-xl font-black text-white flex items-center gap-3"><Trophy className="w-6 h-6 text-orange-500" /> 填寫報名資料</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-8">
                {isLoadingTeams ? (
                  <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-orange-500" /></div> 
                ) : myTeams.length === 0 ? (
                  <div className="text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-slate-300 font-bold">您尚未建立任何隊伍</p>
                    <Button onClick={() => setRoute('member')} className="bg-orange-500">前往會員中心建立</Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-300 flex items-center gap-2"><Users className="w-4 h-4 text-orange-500" /> 選擇要報名的隊伍</label>
                      <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                        <SelectTrigger className="bg-slate-950 border-slate-700 text-white h-12 text-md font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          {myTeams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {displayEvent.customFields && displayEvent.customFields.length > 0 && (
                      <div className="space-y-5 pt-6 border-t border-slate-700/50">
                        <h4 className="text-orange-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2 mb-2">
                          <ClipboardList className="w-4 h-4" /> 大會附加收集資料
                        </h4>
                        {displayEvent.customFields.map((field: any) => (
                          <div key={field.id} className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 block">
                              {field.label} {field.required && <span className="text-red-500 text-xs ml-1">*</span>}
                            </label>
                            {renderDynamicField(field)}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20 flex gap-3 text-xs text-orange-200 mt-6"><CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" /><p>送出後需由主辦單位審核通過並繳費，方可取得參賽資格。</p></div>
                  </>
                )}
              </div>
              <div className="p-6 bg-slate-950 border-t border-slate-800 flex gap-4 shrink-0">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1">取消</Button>
                <Button className="flex-2 bg-orange-500 hover:bg-orange-600 font-bold px-8" onClick={handleConfirmRegistration} disabled={isSubmitting || myTeams.length === 0}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '確認報名'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}