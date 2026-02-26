import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Globe, Calendar, MapPin, Users,
  ClipboardList, GitBranch, Dice5, Zap, CreditCard, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/Footer';
import { StaggerContainer, StaggerItem, FadeIn } from '@/components/PageTransition';
import { useNavigate } from 'react-router-dom';
import type { RouteType } from '@/App';
import type { SportType } from '@/types'; // 🌟 修正 1：從 @/types 引入 SportType

// 引入 Firebase 與 Auth
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const MOCK_EVENTS = [
  { id: 1, name: '2026 全國春季盃籃球聯賽', sport: 'basketball', startDate: '2026-04-15', endDate: '2026-04-30', location: '台北市立體育館', organizer: '中華籃球協會', status: '報名中', teamsRegistered: 12, maxTeams: 16, bannerColor: '#f97316', description: '全國最大型的春季籃球聯賽，廣邀各路好手共襄盛舉。' },
  { id: 2, name: '大專院校排球邀請賽', sport: 'volleyball', startDate: '2026-05-20', endDate: '2026-05-25', location: '台灣大學綜合體育館', organizer: '大專體總', status: '進行中', teamsRegistered: 8, maxTeams: 8, bannerColor: '#3b82f6', description: '頂尖大專院校排球隊伍齊聚一堂，爭奪年度總冠軍。' },
  { id: 3, name: '夏季街頭 3v3 爭霸戰', sport: 'basketball', startDate: '2026-06-10', endDate: '2026-06-12', location: '新生高架橋下籃球場', organizer: '街頭籃球聯盟', status: '籌備中', teamsRegistered: 0, maxTeams: 32, bannerColor: '#10b981', description: '熱血的街頭 3v3 賽事，隨機分組單敗淘汰，挑戰極限。' },
];

const platformFeatures = [
  { icon: Globe, title: '專屬賽事官網', description: '三分鐘快速建立專業的賽事專屬網頁。' },
  { icon: ClipboardList, title: '動態報名表單', description: '自訂欄位，支援文件上傳與即時驗證。' },
  { icon: GitBranch, title: '賽程自動編排', description: '支援多種賽制，一鍵產生賽程樹狀圖。' },
  { icon: Dice5, title: '線上公開抽籤', description: '公平公正的線上抽籤系統，即時更新賽程。' },
  { icon: Zap, title: '即時比分看板', description: '手機/平板專屬記錄台介面，比分即時同步。' },
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
  if (s === 'softball' || s === '壘球') return '🥎';
  if (s === 'badminton' || s === '羽球') return '🏸';
  if (s === 'tabletennis' || s === '桌球') return '🏓';
  if (s === 'beachvolleyball' || s === '沙排') return '🏖️';
  return '🏆';
};

function TournamentCard({ t }: { t: any }) {
  const s = statusLabel[t.status] || statusLabel['籌備中'];
  const registered = t.teamsRegistered || 0;
  const max = t.maxTeams || 16;
  const progress = Math.round((registered / max) * 100) || 0;
  const navigate = useNavigate();
  
  return (
    <motion.div whileHover={{ y: -8, scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.3 }} className="h-full">
      <Card 
        className="group overflow-hidden transition-all hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-500/50 cursor-pointer bg-slate-800 border-slate-700 h-full flex flex-col" 
        onClick={() => navigate('/event')}
      >
        <motion.div 
          className={`${t.bannerImage ? 'h-32' : 'h-2'} w-full relative shrink-0`} 
          style={{ background: t.bannerImage ? `url(${t.bannerImage}) center/cover` : (t.bannerColor || '#f97316') }}
          whileHover={{ scaleY: t.bannerImage ? 1.05 : 1.5 }}
          transition={{ duration: 0.2 }}
        >
          {t.bannerImage && <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />}
        </motion.div>
        
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-3 flex items-start justify-between">
            <Badge className={`${s.className} border-0 text-xs px-2 py-0.5`}>{s.text}</Badge>
            <span className="text-sm opacity-80">{getSportEmoji(t.sport)}</span>
          </div>
          <h3 className="mb-2 font-bold text-white text-lg leading-tight group-hover:text-orange-400 transition-colors line-clamp-2">{t.name}</h3>
          <p className="mb-4 text-sm text-slate-400 line-clamp-2">{t.description}</p>
          
          <div className="mt-auto">
            <div className="space-y-2 text-xs text-slate-400 border-t border-slate-700/50 pt-4">
              <div className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0" /><span className="truncate">{t.organizer}</span></div>
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 shrink-0" /><span className="truncate">{t.startDate} ~ {t.endDate}</span></div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /><span className="truncate">{t.location}</span></div>
            </div>
            <div className="mt-5 bg-slate-900/50 p-3 rounded-lg">
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-slate-400">已報名 <span className="text-white font-medium">{registered}/{max}</span> 隊</span>
                <span className="font-bold text-orange-500">{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: 0.3 }} />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export interface LandingPageProps {
  setRoute: (route: RouteType) => void;
  activeSport: SportType; 
}

// 🌟 修正 2：使用 _setRoute 避免未使用變數報錯 (因為我們現在用 navigate)
export function LandingPage({ setRoute: _setRoute, activeSport }: LandingPageProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const fetchedEvents = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllEvents(fetchedEvents.length > 0 ? fetchedEvents : MOCK_EVENTS);
      } catch (error) {
        console.error("抓取賽事失敗:", error);
        setAllEvents(MOCK_EVENTS); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = allEvents.filter((event) => {
    const sportMap: Record<string, string> = {
      'basketball': '籃球',
      'volleyball': '排球',
      'soccer': '足球',
      'softball': '壘球',
      'badminton': '羽球',
      'tabletennis': '桌球',
      'beachvolleyball': '沙排',
      'other': '其他'
    };
    return event.sport === activeSport || event.sport === sportMap[activeSport];
  });

  return (
    <div className="flex flex-col pb-12">
      {/* Hero Section */}
      <section className="relative flex min-h-[560px] items-center justify-center overflow-hidden border-b border-slate-800" style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)' }}>
        <motion.div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-orange-500/10 blur-[100px]" animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        <div className="container relative z-10 py-20 px-6 text-center max-w-5xl mx-auto">
          <FadeIn><div className="inline-flex items-center px-4 py-1.5 rounded-full mb-6 bg-orange-500/10 text-orange-400 border border-orange-500/20 text-sm font-medium">🏆 支援籃球・排球・多種運動</div></FadeIn>
          <FadeIn delay={0.1}><h1 className="mb-6 font-extrabold text-5xl tracking-tight md:text-7xl text-white drop-shadow-lg">三分鐘建立您的<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">賽事管理官網</span></h1></FadeIn>
          <FadeIn delay={0.2}><p className="mx-auto mb-10 max-w-2xl text-lg md:text-xl text-slate-400 leading-relaxed">從報名表單、賽程編排、線上抽籤到即時比分，一站式解決所有賽務管理需求。</p></FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button 
                className="px-8 py-3.5 text-lg bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20" 
                onClick={() => navigate(currentUser ? '/dashboard' : '/wizard')}
              >
                <Globe className="mr-2 h-5 w-5" /> {currentUser ? '進入主控台' : '免費建立官網'}
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Featured tournaments */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">最新賽事</h2>
            <p className="mt-2 text-slate-400">瀏覽平台上的熱門賽事活動</p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
            <Trophy className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-300 mb-2">目前尚無賽事</h3>
            <p className="text-slate-500">這個運動分類目前還沒有主辦方建立賽事，搶先成為第一位！</p>
            <Button variant="outline" className="mt-6 border-slate-700 hover:bg-slate-800" onClick={() => navigate('/wizard')}>
              立即建立賽事
            </Button>
          </div>
        ) : (
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.15}>
            {filteredEvents.map((t) => (
              <StaggerItem key={t.id} className="h-full">
                <TournamentCard t={t} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>

      {/* Features & Footer */}
      <section className="border-t border-slate-800/50 bg-slate-900/30 py-20 px-6">
        <div className="max-w-6xl mx-auto w-full text-center">
          <h2 className="text-3xl font-bold text-white mb-10">平台功能亮點</h2>
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
            {platformFeatures.map((f) => (
              <StaggerItem key={f.title}>
                <Card className="p-8 border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-colors h-full flex flex-col items-center">
                  <f.icon className="h-10 w-10 text-orange-500 mb-4 mx-auto" />
                  <h3 className="mb-2 font-bold text-white text-xl">{f.title}</h3>
                  <p className="text-slate-400 text-sm">{f.description}</p>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
      <Footer />
    </div>
  );
}