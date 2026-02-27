import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Globe, Calendar, MapPin, Users,
  ClipboardList, GitBranch, Dice5, Zap, CreditCard, Loader2,
  MessageSquarePlus, X, Send, Save, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/Footer';
import { StaggerContainer, StaggerItem, FadeIn } from '@/components/PageTransition';
import { useNavigate } from 'react-router-dom';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/hooks/useToast';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import type { RouteType } from '@/App';
import type { SportType } from '@/types';

// 引入 Firebase 與 Auth
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// ============================================
// 定義常數
// ============================================
const YEARS = ['2026', '2025', '2024', '2023', '2022'];

const MOCK_EVENTS = [
  { id: 1, name: '2026 全國春季盃籃球聯賽', sport: 'basketball', startDate: '2026-04-15', endDate: '2026-04-30', location: '台北市', organizer: '中華籃球協會', status: '報名中', teamsRegistered: 12, maxTeams: 16, bannerColor: '#f97316', description: '全國最大型的春季籃球聯賽。' },
  { id: 2, name: '大專院校排球邀請賽', sport: 'volleyball', startDate: '2026-05-20', endDate: '2026-05-25', location: '九龍城區', organizer: '大專體總', status: '進行中', teamsRegistered: 8, maxTeams: 8, bannerColor: '#3b82f6', description: '頂尖大專院校排球隊伍齊聚一堂。' },
  { id: 3, name: '香港街頭 3v3 爭霸戰', sport: 'basketball', startDate: '2026-06-10', endDate: '2026-06-12', location: '油尖旺區', organizer: '街頭籃球聯盟', status: '報名中', teamsRegistered: 0, maxTeams: 32, bannerColor: '#10b981', description: '熱血的街頭 3v3 賽事。' },
];

const platformFeatures = [
  { icon: Globe, title: '專屬賽事官網', description: '三分鐘快速建立專業的賽事專屬網頁。' },
  { icon: ClipboardList, title: '動態報名表單', description: '自訂欄位，支援文件上傳與即時驗證。' },
  { icon: GitBranch, title: '賽程自動編排', description: '支援多種賽制，一鍵產生賽程樹狀圖。' },
  { icon: Dice5, title: '線上公開抽籤', description: '公平公正的線上抽籤系統。' },
  { icon: Zap, title: '即時比分看板', description: '手機專屬記錄台介面，比分即時同步。' },
  { icon: CreditCard, title: '費用對帳模組', description: '清楚掌握各隊伍繳費狀態與匯款回報。' }
];

const statusLabel: Record<string, { text: string; className: string }> = {
  '報名中': { text: '報名中', className: 'bg-emerald-500 text-white' },
  '進行中': { text: '進行中', className: 'bg-orange-500 text-white' },
  '籌備中': { text: '籌備中', className: 'bg-slate-700 text-slate-300' },
};

const getSportEmoji = (sport: string) => {
  const s = sport?.toLowerCase();
  if (s === 'basketball' || s === '籃球') return '🏀';
  if (s === 'volleyball' || s === '排球') return '🏐';
  if (s === 'soccer' || s === '足球') return '⚽';
  if (s === 'badminton' || s === '羽球') return '🏸';
  return '🏆';
};

// ============================================
// 子組件：賽事卡片 (融合參考版型)
// ============================================
function TournamentCard({ t }: { t: any }) {
  const s = statusLabel[t.status] || statusLabel['籌備中'];
  const registered = t.teamsRegistered || 0;
  const max = t.maxTeams || 16;
  const progress = Math.round((registered / max) * 100) || 0;
  const navigate = useNavigate();
  
  return (
    <motion.div whileHover={{ y: -4, scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }} className="h-full">
      <Card 
        className="group overflow-hidden transition-all hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-500/50 cursor-pointer bg-slate-800 border-slate-700 h-full flex flex-col" 
        onClick={() => navigate('/event')}
      >
        <div className="h-2 w-full shrink-0" style={{ background: t.bannerColor || '#f97316' }} />
        {t.bannerImage && (
           <div className="h-28 w-full relative shrink-0" style={{ background: `url(${t.bannerImage}) center/cover` }}>
             <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors" />
           </div>
        )}
        
        <CardContent className="p-5 flex flex-col flex-1">
          <div className="mb-3 flex items-start justify-between">
            <Badge className={`${s.className} border-0 text-xs px-2 py-0.5`}>{s.text}</Badge>
            <span className="text-sm opacity-80">{getSportEmoji(t.sport)}</span>
          </div>
          <h3 className="mb-2 font-bold text-white text-lg leading-tight group-hover:text-orange-400 transition-colors line-clamp-2">{t.name}</h3>
          <p className="mb-4 text-xs text-slate-400 line-clamp-2">{t.description}</p>
          
          <div className="mt-auto">
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{t.organizer}</span></div>
              <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{t.startDate} ~ {t.endDate}</span></div>
              <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{t.location}</span></div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/50">
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-slate-400">已報名 <span className="text-white font-medium">{registered}/{max}</span> 隊</span>
                <span className="font-medium text-orange-500">{progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-900">
                <motion.div 
                  className="h-full rounded-full bg-orange-500 transition-all" 
                  initial={{ width: 0 }} 
                  animate={{ width: `${progress}%` }} 
                  transition={{ duration: 1, delay: 0.1 }} 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export interface LandingPageProps {
  setRoute: (route: RouteType) => void;
  activeSport: SportType; 
}

// ============================================
// 主頁面組件
// ============================================
export function LandingPage({ setRoute: _setRoute, activeSport }: LandingPageProps) {
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();
  const { addToast } = useToast();
  
  const getAutoDetectedLocation = () => {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timeZone.includes('Taipei')) return '台北市';
      if (timeZone.includes('Hong_Kong')) return '中西區';
    } catch (e) {}
    return '不限地點';
  };

  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState(getAutoDetectedLocation());
  const [selectedYear, setSelectedYear] = useState('2026');

  // 公告編輯器狀態
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [isSubmittingAnnouncement, setIsSubmittingAnnouncement] = useState(false);

  const canPostAnnouncement = currentUser && (userRole === 'admin' || userRole === 'organizer');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const fetchedEvents = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllEvents(fetchedEvents.length > 0 ? fetchedEvents : MOCK_EVENTS);
      } catch (error) {
        setAllEvents(MOCK_EVENTS); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = allEvents.filter((event) => {
    const sportMap: Record<string, string> = { 'basketball': '籃球', 'volleyball': '排球', 'soccer': '足球', 'badminton': '羽球' };
    const sportMatch = event.sport === activeSport || event.sport === sportMap[activeSport];
    const statusMatch = filterStatus === 'all' || event.status === '報名中';
    const locationMatch = selectedLocation === '不限地點' || event.location?.includes(selectedLocation);
    const yearMatch = event.startDate?.startsWith(selectedYear);
    return sportMatch && statusMatch && locationMatch && yearMatch;
  });

  const handleSaveAnnouncement = async (status: '已發布' | '草稿') => {
    if (!announcementTitle.trim() || !announcementContent.trim()) {
      addToast({ title: '請填寫公告標題與內容', variant: 'warning' }); return;
    }
    setIsSubmittingAnnouncement(true);
    try {
      await addDoc(collection(db, 'announcements'), {
        title: announcementTitle.trim(), content: announcementContent.trim(),
        status: status, authorId: currentUser?.uid || 'unknown',
        eventId: 'global', createdAt: serverTimestamp(),
      });
      addToast({ title: status === '已發布' ? '🎉 公告已成功發布！' : '💾 草稿已儲存', variant: 'success' });
      setIsEditorOpen(false); setAnnouncementTitle(''); setAnnouncementContent('');
    } catch (error) {
      addToast({ title: '操作失敗，請稍後再試', variant: 'error' });
    } finally { setIsSubmittingAnnouncement(false); }
  };

  return (
    <div className="flex flex-col pb-0 bg-slate-950">
      {/* 🌟 1. 升級版 Hero Section (加入數據統計) */}
      <section className="relative flex min-h-[580px] items-center justify-center overflow-hidden border-b border-slate-800" style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)' }}>
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="absolute -bottom-16 -right-16 h-96 w-96 rounded-full bg-orange-600/5 blur-[100px]" />

        <div className="container relative z-10 py-20 px-6 text-center max-w-5xl mx-auto">
          <FadeIn>
            <Badge className="mb-6 border border-orange-500/30 bg-orange-500/10 text-orange-400 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              🏆 支援籃球・排球・多種運動
            </Badge>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="mb-6 font-extrabold text-5xl md:text-7xl text-white tracking-tight leading-tight">
              三分鐘建立您的<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">賽事管理官網</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mx-auto mb-10 max-w-2xl text-lg md:text-xl text-slate-400 leading-relaxed">
              從報名表單、賽程編排、線上抽籤到即時比分，<br className="hidden sm:block" />
              一站式解決所有賽務管理需求。
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="px-8 py-6 text-lg bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20" onClick={() => navigate(currentUser ? '/dashboard' : '/wizard')}>
                <Globe className="mr-2 h-5 w-5" /> {currentUser ? '進入主控台' : '免費建立官網'}
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                瞭解更多 <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </FadeIn>

          {/* 🌟 Hero 數據統計區塊 */}
          <FadeIn delay={0.4}>
            <div className="mt-16 flex flex-wrap justify-center gap-10 md:gap-20 text-center border-t border-slate-800/50 pt-10">
              {[
                { value: "1,200+", label: "場賽事" },
                { value: "8,500+", label: "支隊伍" },
                { value: "52,000+", label: "位選手" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-extrabold text-4xl text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-500 font-medium tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 2. 進階篩選列 */}
      <section className="bg-slate-900/90 border-b border-slate-800 py-5 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6">
              <RadioGroup value={filterStatus} onValueChange={setFilterStatus} className="flex items-center gap-6 bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                <div className="flex items-center space-x-2 px-2"><RadioGroupItem value="all" id="all" /><label htmlFor="all" className="text-sm text-slate-300 cursor-pointer">全部比賽</label></div>
                <div className="flex items-center space-x-2 px-2"><RadioGroupItem value="registering" id="reg" /><label htmlFor="reg" className="text-sm text-slate-300 cursor-pointer">報名中</label></div>
              </RadioGroup>

              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">地點：</span>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white h-9">
                    <SelectValue placeholder="選擇地點" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-[300px]">
                    <SelectItem value="不限地點">不限地點</SelectItem>
                    <SelectGroup><SelectLabel className="text-orange-400">台灣</SelectLabel>{['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市'].map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}</SelectGroup>
                    <SelectGroup><SelectLabel className="text-orange-400">香港</SelectLabel>{['中西區', '油尖旺區', '沙田區'].map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}</SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {canPostAnnouncement && (
              <Button variant="outline" onClick={() => setIsEditorOpen(true)} className="border-orange-500/50 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 ml-auto h-9">
                <MessageSquarePlus className="w-4 h-4 mr-2" /> 張貼訊息
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {YEARS.map(year => (
              <button key={year} onClick={() => setSelectedYear(year)} className={`px-5 py-1 rounded text-sm transition-all border ${selectedYear === year ? 'bg-slate-100 text-slate-900 font-bold border-slate-100' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>
                {year}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 🌟 3. 最新賽事區塊 (加入查看全部標題) */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full min-h-[400px]">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-extrabold text-3xl tracking-wide text-white mb-2">最新賽事</h2>
            <p className="text-sm text-slate-400">瀏覽平台上的熱門賽事活動</p>
          </div>
          <Button variant="ghost" className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/10 hidden sm:flex">
            查看全部 <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700">
             <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
             <p className="text-slate-400 text-lg">找不到符合條件的賽事</p>
             <Button variant="link" className="text-orange-500 mt-2" onClick={() => { setFilterStatus('all'); setSelectedLocation('不限地點'); setSelectedYear('2026'); }}>重設篩選</Button>
          </div>
        ) : (
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
            {filteredEvents.map((t) => (
              <StaggerItem key={t.id}><TournamentCard t={t} /></StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>

      {/* 🌟 4. 平台功能亮點 (橫向卡片排列) */}
      <section id="features" className="border-t border-slate-800 bg-slate-900/50 py-20 px-6">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-12 text-center">
            <h2 className="font-extrabold text-3xl tracking-wide text-white mb-3">平台功能亮點</h2>
            <p className="text-sm text-slate-400">從建站到賽後數據，全流程一站搞定</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {platformFeatures.map((f) => (
              <Card key={f.title} className="border-slate-800 bg-slate-900 shadow-sm transition-shadow hover:shadow-lg hover:border-slate-700">
                <CardContent className="flex items-start gap-5 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-bold text-white text-lg">{f.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 🌟 5. CTA 區塊 */}
      <section className="py-24 text-center px-6 border-t border-slate-800">
        <div className="mx-auto max-w-xl">
          <Trophy className="mx-auto mb-6 h-16 w-16 text-orange-500" />
          <h2 className="mb-4 font-extrabold text-4xl text-white tracking-wide">準備好了嗎？</h2>
          <p className="mb-8 text-lg text-slate-400">
            免費方案支援最多 100 支隊伍，<br className="hidden sm:block" />立即開始打造您的賽事品牌。
          </p>
          <Button size="lg" className="bg-orange-500 text-white hover:bg-orange-600 px-10 py-6 text-lg font-bold shadow-xl shadow-orange-500/20" onClick={() => navigate('/wizard')}>
            <Globe className="mr-2 h-5 w-5" />
            立即免費開始
          </Button>
        </div>
      </section>

      <Footer />

      {/* 公告編輯器 Modal */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><MessageSquarePlus className="w-5 h-5 text-orange-400" /> 發布平台公告</h3>
                <button onClick={() => setIsEditorOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                  <input type="text" placeholder="請輸入公告標題..." value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} className="w-full bg-transparent text-xl font-bold text-white placeholder:text-slate-500 border-none focus:outline-none focus:ring-0" />
                </div>
                <div className="flex flex-col h-64 md:h-96">
                  <div className="border-b border-slate-800 p-2 flex gap-4 bg-slate-900 text-slate-400 text-sm font-mono px-4">
                     <span className="cursor-pointer hover:text-white font-bold">B</span>
                     <span className="cursor-pointer hover:text-white italic">I</span>
                     <span className="cursor-pointer hover:text-white line-through">S</span>
                     <div className="w-px h-4 bg-slate-700 self-center" />
                     <span className="cursor-pointer hover:text-white font-bold">H1</span>
                     <span className="cursor-pointer hover:text-white font-bold">H2</span>
                  </div>
                  <textarea value={announcementContent} onChange={(e) => setAnnouncementContent(e.target.value)} placeholder="開始輸入公告內容..." className="flex-1 w-full bg-slate-900 p-4 text-slate-300 border-none focus:outline-none resize-none" />
                </div>
              </div>
              <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex items-center justify-between">
                <div className="text-xs text-slate-500">{announcementContent.length} 字元</div>
                <div className="flex gap-3">
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-700" onClick={() => handleSaveAnnouncement('草稿')} disabled={isSubmittingAnnouncement}>
                    <Save className="w-4 h-4 mr-2" /> 儲存草稿
                  </Button>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold" onClick={() => handleSaveAnnouncement('已發布')} disabled={isSubmittingAnnouncement}>
                    {isSubmittingAnnouncement ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 處理中...</> : <><Send className="w-4 h-4 mr-2" /> 正式發布</>}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}