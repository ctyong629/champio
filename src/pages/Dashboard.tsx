import { useState, useEffect } from 'react';
import { motion, } from 'framer-motion';
import { 
  Activity, FileText, Users, Trophy, MonitorSmartphone,
   CheckCircle2, Clock,
  Download, Shuffle, Medal, FormInput, Zap, Loader2, Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


import { MedalRanking } from '@/components/MedalRanking';
import { FormBuilder } from '@/components/FormBuilder';
import { TournamentBracket } from '@/components/TournamentBracket';
import { AutoScheduler } from '@/components/AutoScheduler';
import { RichTextEditor,  } from '@/components/RichTextEditor';
import { DrawAnimation } from '@/components/DrawAnimation';
import { useToast } from '@/hooks/useToast';
import { FadeIn } from '@/components/PageTransition';
import type { RouteType } from '@/App';
import type { Team } from '@/types';

// 🌟 引入 Firebase 與 Auth 功能
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const MOCK_TEAMS: Team[] = [
  { id: 1, name: '猛龍隊', contact: '王小明', phone: '0912-345-678', email: 'team1@example.com', status: '審核通過', paid: true, registeredAt: '2026-01-15' },
];

const MOCK_MEDAL_DATA = [
  { id: '1', name: '國立陽明交通大學', category: '學校', gold: 3, silver: 2, bronze: 1 },
];

interface DashboardProps {
  setRoute: (route: RouteType) => void;
}

export function Dashboard({ setRoute }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { addToast } = useToast();
  
  // 🌟 賽事與報名資料狀態
  const { currentUser } = useAuth();
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRegs, setIsLoadingRegs] = useState(false);

  // 1. 抓取目前使用者的賽事
  useEffect(() => {
    const fetchEvent = async () => {
      if (!currentUser) return;
      try {
        const q = query(collection(db, 'events'), where('organizerId', '==', currentUser.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setCurrentEvent({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }
      } catch (error) {
        console.error("抓取賽事失敗:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [currentUser]);

  // 2. 當賽事載入完成後，抓取該賽事的「報名名單」
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!currentEvent) return;
      setIsLoadingRegs(true);
      try {
        const q = query(collection(db, 'registrations'), where('eventId', '==', currentEvent.id));
        const snap = await getDocs(q);
        setRegistrations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("抓取報名資料失敗:", error);
      } finally {
        setIsLoadingRegs(false);
      }
    };
    fetchRegistrations();
  }, [currentEvent]);

  // 3. 處理審核狀態更新
  const handleUpdateStatus = async (regId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const regRef = doc(db, 'registrations', regId);
      await updateDoc(regRef, { status: newStatus });
      
      // 更新本地狀態，讓畫面即時反應
      setRegistrations(prev => prev.map(reg => 
        reg.id === regId ? { ...reg, status: newStatus } : reg
      ));
      
      addToast({ 
        title: newStatus === 'approved' ? '已審核通過' : '已退回報名', 
        variant: newStatus === 'approved' ? 'success' : 'error' 
      });
    } catch (error) {
      console.error("更新狀態失敗:", error);
      addToast({ title: '狀態更新失敗', variant: 'error' });
    }
  };

  const drawTeams = MOCK_TEAMS.map(t => ({ id: t.id.toString(), name: t.name }));

  const tabs = [
    { id: 'overview', label: '總覽儀表板', icon: Activity },
    { id: 'registration', label: '報名管理', icon: Users }, // 移到前面比較好找
    { id: 'cms', label: '公告管理', icon: FileText },
    { id: 'formbuilder', label: '表單建構器', icon: FormInput },
    { id: 'bracket', label: '賽程樹狀圖', icon: Trophy },
    { id: 'scheduler', label: '自動排程', icon: Zap },
    { id: 'draw', label: '線上抽籤', icon: Shuffle },
    { id: 'ranking', label: '獎牌排名', icon: Medal },
  ];

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>;
  }

  // 計算待審核數量
  const pendingCount = registrations.filter(r => r.status === 'pending').length;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
        <div className="p-4 flex flex-col gap-2 overflow-y-auto">
          <div className="mb-6 px-2">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              {currentEvent ? currentEvent.sport : '賽事管理'}
            </h2>
            <p className="text-white text-lg font-semibold mt-1 leading-tight truncate">
              {currentEvent ? currentEvent.name : '尚未建立賽事'}
            </p>
          </div>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${activeTab === tab.id ? 'bg-orange-500/10 text-orange-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <div className="flex items-center gap-3">
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </div>
              {/* 顯示待審核紅點 */}
              {tab.id === 'registration' && pendingCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
           <Button 
             variant="outline" 
             className="w-full justify-start border-slate-700 hover:bg-slate-800 text-slate-300" 
             onClick={() => setRoute('public_event')}
           >
             <MonitorSmartphone className="w-4 h-4 mr-2" /> 預覽前台頁面
           </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-slate-950">
        {!currentEvent && activeTab === 'overview' ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <Trophy className="w-16 h-16 text-slate-700" />
            <h2 className="text-2xl font-bold text-white">您還沒有建立任何賽事</h2>
            <Button onClick={() => setRoute('wizard')} className="bg-orange-500 hover:bg-orange-600 text-white">
              立即建立賽事
            </Button>
          </div>
        ) : activeTab === 'overview' && (
          <FadeIn className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">賽事現況總覽</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: '已報名隊伍', value: registrations.length.toString(), color: 'text-orange-500', icon: Users },
                { label: '待審核名單', value: pendingCount.toString(), color: 'text-amber-500', icon: Clock },
                { label: '報名費設定', value: currentEvent?.requirePayment ? `$${currentEvent.registrationFee}` : '免費', color: 'text-emerald-500', icon: CheckCircle2 },
                { label: '賽事關注度', value: '1,204', color: 'text-blue-500', icon: Activity }
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="p-6 bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </FadeIn>
        )}

        {/* 🌟 實作：真實報名管理分頁 */}
        {activeTab === 'registration' && (
          <FadeIn>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">報名管理</h2>
              <Button variant="outline" className="border-slate-700 text-slate-300">
                <Download className="w-4 h-4 mr-2" /> 匯出名單
              </Button>
            </div>
            
            <Card className="bg-slate-800 border-slate-700 overflow-hidden">
              {isLoadingRegs ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
                  載入資料中...
                </div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                  目前尚無隊伍報名
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400 text-sm">
                        <th className="p-4 font-medium">隊伍名稱</th>
                        <th className="p-4 font-medium">隊長信箱</th>
                        <th className="p-4 font-medium">報名時間</th>
                        <th className="p-4 font-medium">狀態</th>
                        <th className="p-4 font-medium text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((reg) => (
                        <tr key={reg.id} className="border-b border-slate-700 hover:bg-slate-750 transition-colors">
                          <td className="p-4 text-white font-medium">{reg.teamName}</td>
                          <td className="p-4 text-slate-300">{reg.captainEmail}</td>
                          <td className="p-4 text-slate-400 text-sm">
                            {reg.createdAt?.toDate ? reg.createdAt.toDate().toLocaleDateString() : '剛剛'}
                          </td>
                          <td className="p-4">
                            {reg.status === 'pending' && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">待審核</Badge>}
                            {reg.status === 'approved' && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">已通過</Badge>}
                            {reg.status === 'rejected' && <Badge className="bg-red-500/20 text-red-400 border-red-500/30">已退回</Badge>}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            {reg.status === 'pending' ? (
                              <>
                                <Button size="sm" variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10" onClick={() => handleUpdateStatus(reg.id, 'approved')}>
                                  <Check className="w-4 h-4 mr-1" /> 通過
                                </Button>
                                <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={() => handleUpdateStatus(reg.id, 'rejected')}>
                                  <X className="w-4 h-4 mr-1" /> 退回
                                </Button>
                              </>
                            ) : (
                              <span className="text-sm text-slate-500">已處理</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </FadeIn>
        )}

        {/* 其他分頁保留 */}
        {activeTab === 'cms' && <FadeIn><h2 className="text-2xl font-bold text-white mb-4">公告管理</h2><Card className="p-6 bg-slate-800 border-slate-700"><RichTextEditor /></Card></FadeIn>}
        {activeTab === 'formbuilder' && <FadeIn><h2 className="text-2xl font-bold text-white mb-4">表單建構器</h2><Card className="h-[calc(100%-4rem)] bg-slate-900 border-slate-700 overflow-hidden"><FormBuilder /></Card></FadeIn>}
        {activeTab === 'bracket' && <FadeIn><h2 className="text-2xl font-bold text-white mb-4">賽程樹狀圖</h2><Card className="h-[calc(100%-4rem)] bg-slate-900 border-slate-700 overflow-hidden"><TournamentBracket /></Card></FadeIn>}
        {activeTab === 'scheduler' && <FadeIn><h2 className="text-2xl font-bold text-white mb-4">自動排程</h2><Card className="h-[calc(100%-4rem)] bg-slate-900 border-slate-700 overflow-hidden"><AutoScheduler /></Card></FadeIn>}
        {activeTab === 'draw' && <FadeIn><h2 className="text-2xl font-bold text-white mb-4">線上抽籤</h2><Card className="p-6 bg-slate-800 border-slate-700"><DrawAnimation teams={drawTeams} onComplete={() => {}} /></Card></FadeIn>}
        {activeTab === 'ranking' && <FadeIn><h2 className="text-2xl font-bold text-white mb-4">獎牌排名</h2><MedalRanking data={MOCK_MEDAL_DATA} type="school" showPoints={true} /></FadeIn>}
      </div>
    </div>
  );
}