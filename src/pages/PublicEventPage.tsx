import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Loader2, Users, Trophy, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Footer } from '@/components/Footer';
import { useToast } from '@/hooks/useToast';
import { FadeIn } from '@/components/PageTransition';
import { useAuth } from '@/contexts/AuthContext';
import type { RouteType } from '@/App';

// 引入 Firebase 相關功能
import { collection, query, orderBy, limit, getDocs, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PublicEventPageProps {
  setRoute: (route: RouteType) => void;
}

export function PublicEventPage({ setRoute }: PublicEventPageProps) {
  const [tab, setTab] = useState('info');
  const { addToast } = useToast();
  
  // 取得 currentUser 與 userRole
  const { currentUser, userRole } = useAuth(); 
  
  // 真實賽事資料狀態
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 報名 Modal 相關狀態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
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
  }, []);

  // 防呆預設資料
  const displayEvent = event || {
    id: 'mock-event-id',
    name: '2026 全國春季盃籃球聯賽',
    sport: '籃球',
    startDate: '2026-04-15',
    endDate: '2026-04-30',
    location: '台北市立體育館',
    organizer: '中華籃球協會',
    organizerId: 'mock-organizer-id', 
    description: '此為範例賽事。',
    bannerImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2090&auto=format&fit=crop',
    maxTeams: 16,
    teamsRegistered: 0,
    registrationFee: 3000,
    requirePayment: true,
    registrationDeadline: '2026-04-10'
  };

  // 處理數值
  const registered = displayEvent.teamsRegistered || 0;
  const max = displayEvent.maxTeams || 16;
  const progress = Math.round((registered / max) * 100) || 0;

  // 🌟 動態判斷按鈕狀態與文字
  const isOrganizerRole = userRole === 'organizer' || userRole === 'admin';
  const isMyEvent = currentUser && displayEvent.organizerId === currentUser.uid;
  const isFull = registered >= max;

  let buttonText = '立即報名';
  let isButtonDisabled = false;

  if (isMyEvent) {
    buttonText = '這是您主辦的賽事';
    isButtonDisabled = true;
  } else if (isOrganizerRole) {
    buttonText = '您是主辦方 (無法報名)';
    isButtonDisabled = true;
  } else if (isFull) {
    buttonText = '報名已額滿';
    isButtonDisabled = true;
  }

  // 開啟報名 Modal (還是保留防護網以防萬一)
  const handleOpenRegistrationModal = async () => {
    if (!currentUser) {
      addToast({ title: '請先登入', description: '您需要登入並建立隊伍才能報名賽事', variant: 'error' });
      return;
    }

    if (isButtonDisabled) return; // 如果按鈕被禁用，直接擋掉

    setIsModalOpen(true);
    setIsLoadingTeams(true);

    try {
      const q = query(collection(db, 'teams'), where('captainId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const fetchedTeams = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyTeams(fetchedTeams);
      
      if (fetchedTeams.length > 0) {
        setSelectedTeamId(fetchedTeams[0].id);
      }
    } catch (error) {
      console.error('取得隊伍失敗:', error);
      addToast({ title: '無法取得您的隊伍資料', variant: 'error' });
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const handleConfirmRegistration = async () => {
    if (!selectedTeamId || !currentUser || !displayEvent) return;
    
    setIsSubmitting(true);
    try {
      const selectedTeam = myTeams.find(t => t.id === selectedTeamId);
      
      await addDoc(collection(db, 'registrations'), {
        eventId: displayEvent.id || 'mock-event-id',
        eventName: displayEvent.name,
        teamId: selectedTeam.id,
        teamName: selectedTeam.name,
        captainId: currentUser.uid,
        captainEmail: currentUser.email,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      addToast({ title: '報名成功！', description: '已送出報名申請，請靜候主辦方審核。', variant: 'success' });
      setIsModalOpen(false);
    } catch (error) {
      console.error('報名失敗:', error);
      addToast({ title: '報名發生錯誤，請稍後再試', variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      {/* Event Header Banner */}
      <div className="h-64 bg-slate-900 relative border-b border-orange-500/30 overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${displayEvent.bannerImage || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2090&auto=format&fit=crop'})` }}
          initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
        <div className="relative max-w-5xl mx-auto px-6 h-full flex flex-col justify-end pb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="w-fit mb-3 bg-orange-500/20 text-orange-400 border-orange-500/50">
              {displayEvent.sport}
            </Badge>
            <h1 className="text-4xl font-extrabold text-white drop-shadow-md">{displayEvent.name}</h1>
            <p className="text-slate-300 mt-2 flex items-center gap-4 flex-wrap drop-shadow">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {displayEvent.startDate} 起</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {displayEvent.location || '地點待定'}</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {displayEvent.organizer}</span>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 sticky top-16 bg-slate-950/80 backdrop-blur z-20">
        <div className="max-w-5xl mx-auto px-6 flex gap-6 overflow-x-auto">
          {['info:賽事資訊', 'bracket:賽程表', 'teams:參賽隊伍', 'live:即時比分'].map(t => {
            const [id, label] = t.split(':');
            return (
              <button
                key={id} onClick={() => setTab(id)}
                className={`py-4 font-medium text-sm border-b-2 transition-colors relative whitespace-nowrap ${
                  tab === id ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {label}
                {tab === id && <motion.div layoutId="eventTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 relative">
        {tab === 'info' && (
          <FadeIn className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section>
                 <h3 className="text-xl font-bold text-white mb-4">賽事簡介</h3>
                 <Card className="p-6 bg-slate-800 border-slate-700">
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {displayEvent.description || '主辦單位尚未提供詳細簡介。'}
                    </p>
                 </Card>
              </section>
            </div>
            
            {/* 🌟 優化過的報名資訊卡片 */}
            <div>
              <Card className="p-6 space-y-6 sticky top-36 bg-slate-800 border-slate-700 shadow-xl">
                <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">報名資訊</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">報名狀態</span>
                    <span className="text-emerald-400 font-bold">{displayEvent.status || '報名中'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">報名截止</span>
                    <span className="text-white">{displayEvent.registrationDeadline || '未設定'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">報名費用</span>
                    <span className="text-white">
                      {displayEvent.requirePayment ? `$${displayEvent.registrationFee} / 隊` : '免費'}
                    </span>
                  </div>
                </div>
                
                {/* 🌟 報名進度與長條圖 */}
                <div className="pt-4 border-t border-slate-700/50">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-slate-300">目前報名進度</span>
                    <span className="text-sm font-bold text-orange-400">{registered} / {max} 隊</span>
                  </div>
                  <div className="bg-slate-950 rounded-full h-2.5 overflow-hidden shadow-inner border border-slate-800">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-orange-600 to-orange-400"
                      initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1 }}
                    />
                  </div>
                  {isFull && <p className="text-xs text-red-400 mt-2 text-right">已達隊伍上限</p>}
                </div>
                
                {/* 🌟 動態按鈕：依據身分與滿額狀態變更文字與外觀 */}
                <Button 
                  className={`w-full py-6 text-lg font-bold transition-all shadow-lg ${
                    isButtonDisabled 
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed hover:bg-slate-700 shadow-none' 
                      : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
                  }`}
                  onClick={handleOpenRegistrationModal}
                  disabled={isButtonDisabled}
                >
                  {buttonText}
                </Button>
              </Card>
            </div>
          </FadeIn>
        )}

        {tab === 'bracket' && <FadeIn><div className="text-center py-20 text-slate-400">賽程表尚未公布</div></FadeIn>}
        {tab === 'teams' && <FadeIn><div className="text-center py-20 text-slate-400">參賽隊伍尚未公布</div></FadeIn>}
        {tab === 'live' && <FadeIn><div className="text-center py-20 text-slate-400">比賽尚未開始</div></FadeIn>}
      </div>

      {/* 報名彈出視窗 (Modal) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-orange-400" />
                  選擇報名隊伍
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                {isLoadingTeams ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
                    <p className="text-slate-400">正在讀取您的隊伍...</p>
                  </div>
                ) : myTeams.length === 0 ? (
                  <div className="text-center py-6 bg-slate-950 rounded-lg border border-dashed border-slate-700">
                    <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-300 font-medium mb-1">您目前還沒有建立任何隊伍</p>
                    <p className="text-sm text-slate-500 mb-4">請先前往「會員中心」建立隊伍後再進行報名。</p>
                    <Button onClick={() => { setIsModalOpen(false); setRoute('member'); }} className="bg-slate-800 text-white hover:bg-slate-700">
                      前往建立隊伍
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">請選擇要代表出賽的隊伍</label>
                      <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                        <SelectTrigger className="w-full bg-slate-950 border-slate-700 text-white h-12">
                          <SelectValue placeholder="選擇隊伍" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          {myTeams.map(team => (
                            <SelectItem key={team.id} value={team.id} className="focus:bg-slate-700">
                              {team.name} ({team.sport || '未分類'} - {team.members?.length || 1} 人)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-sm text-orange-200 flex gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                      <p>送出報名後，需等待主辦單位審核通過，才算完成報名程序喔！</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 p-4 bg-slate-800/50 border-t border-slate-800">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white">取消</Button>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white" 
                  onClick={handleConfirmRegistration} 
                  disabled={isSubmitting || myTeams.length === 0}
                >
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 送出中...</> : '確認送出'}
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