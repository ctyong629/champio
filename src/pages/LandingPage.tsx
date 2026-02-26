import { motion } from 'framer-motion';
import { 
  Trophy, Globe, ArrowRight, Calendar, MapPin, Users,
  ClipboardList, GitBranch, Dice5, Zap, CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/Footer';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { StaggerContainer, StaggerItem, FadeIn } from '@/components/PageTransition';
import { useToast } from '@/hooks/useToast';

const MOCK_EVENTS = [
  { id: 1, title: '2026 全國春季盃籃球聯賽', sport: '籃球', date: '2026-04-15', startDate: '2026-04-15', endDate: '2026-04-30', location: '台北市立體育館', organizer: '中華籃球協會', status: '報名中', teams: 12, maxTeams: 16, bannerColor: '#f97316', description: '全國最大型的春季籃球聯賽，廣邀各路好手共襄盛舉。' },
  { id: 2, title: '大專院校排球邀請賽', sport: '排球', date: '2026-05-20', startDate: '2026-05-20', endDate: '2026-05-25', location: '台灣大學綜合體育館', organizer: '大專體總', status: '進行中', teams: 8, maxTeams: 8, bannerColor: '#3b82f6', description: '頂尖大專院校排球隊伍齊聚一堂，爭奪年度總冠軍。' },
  { id: 3, title: '夏季街頭 3v3 爭霸戰', sport: '籃球', date: '2026-06-10', startDate: '2026-06-10', endDate: '2026-06-12', location: '新生高架橋下籃球場', organizer: '街頭籃球聯盟', status: '籌備中', teams: 0, maxTeams: 32, bannerColor: '#10b981', description: '熱血的街頭 3v3 賽事，隨機分組單敗淘汰，挑戰極限。' },
  { id: 4, title: '2026 全國大專足球錦標賽', sport: '足球', date: '2026-03-15', startDate: '2026-03-15', endDate: '2026-04-05', location: '國立體育大學足球場', organizer: '大專體總足球協會', status: '進行中', teams: 16, maxTeams: 16, bannerColor: '#22c55e', description: '全國大專院校足球最高殿堂，爭奪榮譽冠軍。' },
  { id: 5, title: '企業壘球聯賽春季賽', sport: '壘球', date: '2026-04-01', startDate: '2026-04-01', endDate: '2026-06-30', location: '台北市青年公園壘球場', organizer: '中華民國壘球協會', status: '報名中', teams: 10, maxTeams: 12, bannerColor: '#eab308', description: '企業壘球聯賽春季賽事，促進職場運動風氣。' },
  { id: 6, title: '全國羽球團體錦標賽', sport: '羽球', date: '2026-05-10', startDate: '2026-05-10', endDate: '2026-05-15', location: '台北體育館羽球場', organizer: '中華羽球協會', status: '報名中', teams: 24, maxTeams: 32, bannerColor: '#06b6d4', description: '全國最高水準羽球團體賽事，各路好手齊聚。' },
  { id: 7, title: '桌球精英邀請賽', sport: '桌球', date: '2026-06-20', startDate: '2026-06-20', endDate: '2026-06-22', location: '新北市桌球館', organizer: '中華民國桌球協會', status: '籌備中', teams: 6, maxTeams: 8, bannerColor: '#a855f7', description: '頂尖桌球選手邀請賽，精采對決不容錯過。' },
  { id: 8, title: '沙灘排球公開賽', sport: '沙排', date: '2026-07-15', startDate: '2026-07-15', endDate: '2026-07-20', location: '福隆海水浴場', organizer: '台灣沙灘排球協會', status: '報名中', teams: 8, maxTeams: 16, bannerColor: '#f59e0b', description: '夏日沙灘排球盛會，陽光沙灘熱血競技。' },
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

import type { RouteType } from '@/App';

interface TournamentCardProps {
  t: typeof MOCK_EVENTS[0];
  setRoute: (route: RouteType) => void;
}

function TournamentCard({ t, setRoute }: TournamentCardProps) {
  const s = statusLabel[t.status] || statusLabel['籌備中'];
  const progress = Math.round((t.teams / t.maxTeams) * 100) || 0;
  
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="group overflow-hidden transition-all hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-500/50 cursor-pointer bg-slate-800 border-slate-700" 
        onClick={() => setRoute('public_event')}
      >
        {/* Color bar */}
        <motion.div 
          className="h-2 w-full" 
          style={{ background: t.bannerColor }}
          whileHover={{ scaleY: 1.5 }}
          transition={{ duration: 0.2 }}
        />
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between">
            <Badge className={`${s.className} border-0 text-xs px-2 py-0.5`}>{s.text}</Badge>
            <span className="text-sm opacity-80">
              {t.sport === '籃球' ? '🏀' : '🏐'}
            </span>
          </div>
          <h3 className="mb-2 font-bold text-white text-lg leading-tight group-hover:text-orange-400 transition-colors">{t.title}</h3>
          <p className="mb-4 text-sm text-slate-400 line-clamp-2 h-10">{t.description}</p>
          <div className="space-y-2 text-xs text-slate-400 border-t border-slate-700/50 pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-500" />
              <span>{t.organizer}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>{t.startDate} ~ {t.endDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span>{t.location}</span>
            </div>
          </div>
          {/* Registration progress */}
          <div className="mt-5 bg-slate-900/50 p-3 rounded-lg">
            <div className="mb-2 flex justify-between text-xs">
              <span className="text-slate-400">已報名 <span className="text-white font-medium">{t.teams}/{t.maxTeams}</span> 隊</span>
              <span className="font-bold text-orange-500">{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

interface LandingPageProps {
  setRoute: (route: RouteType) => void;
  role: string;
}

export function LandingPage({ setRoute, role }: LandingPageProps) {
  const { addToast } = useToast();

  return (
    <div className="flex flex-col pb-12">
      {/* Hero Section */}
      <section
        className="relative flex min-h-[560px] items-center justify-center overflow-hidden border-b border-slate-800"
        style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)' }}
      >
        {/* Animated background circles */}
        <motion.div 
          className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-orange-500/10 blur-[100px]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute -bottom-16 -right-16 h-96 w-96 rounded-full bg-orange-500/5 blur-[100px]"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="container relative z-10 py-20 px-6 text-center max-w-5xl mx-auto">
          <FadeIn>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full mb-6 bg-orange-500/10 text-orange-400 border border-orange-500/20 text-sm font-medium">
              🏆 支援籃球・排球・多種運動
            </div>
          </FadeIn>
          
          <FadeIn delay={0.1}>
            <h1 className="mb-6 font-extrabold text-5xl tracking-tight md:text-7xl text-white drop-shadow-lg">
              三分鐘建立您的
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                賽事管理官網
              </span>
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <p className="mx-auto mb-10 max-w-2xl text-lg md:text-xl text-slate-400 leading-relaxed">
              從報名表單、賽程編排、線上抽籤到即時比分，
              <br className="hidden sm:block" />
              一站式解決所有賽務管理需求。
            </p>
          </FadeIn>
          
          <FadeIn delay={0.3}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button 
                className="px-8 py-3.5 text-lg bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20" 
                onClick={() => {
                  if (role === 'organizer') {
                    setRoute('wizard');
                  } else {
                    setRoute('public_event');
                  }
                }}
              >
                <Globe className="mr-2 h-5 w-5" />
                {role === 'organizer' ? '免費建立官網' : '探索精彩賽事'}
              </Button>
              <Button 
                variant="outline" 
                className="px-8 py-3.5 text-lg border-slate-700 bg-slate-800/50 hover:bg-slate-800"
                onClick={() => addToast({
                  title: '即將推出',
                  description: '更多功能正在開發中，敬請期待！',
                  variant: 'warning'
                })}
              >
                瞭解更多
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </FadeIn>

          {/* Stats with animated counters */}
          <FadeIn delay={0.5}>
            <div className="mt-20 flex flex-wrap justify-center gap-12 md:gap-20 text-center">
              {[
                { value: 1200, suffix: '+', label: '場賽事' },
                { value: 8500, suffix: '+', label: '支隊伍' },
                { value: 52000, suffix: '+', label: '位選手' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-5xl md:text-6xl text-orange-400 mb-2">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm md:text-base font-medium text-slate-500">{stat.label}</div>
                </div>
              ))}
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
          <Button 
            variant="ghost" 
            className="w-fit"
            onClick={() => addToast({
              title: '即將推出',
              description: '完整賽事列表功能開發中',
              variant: 'default'
            })}
          >
            查看全部 <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.15}>
          {MOCK_EVENTS.map((t) => (
            <StaggerItem key={t.id}>
              <TournamentCard t={t} setRoute={setRoute} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Features */}
      <section className="border-t border-slate-800/50 bg-slate-900/30 py-20 px-6">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-white">平台功能亮點</h2>
            <p className="mt-3 text-slate-400 max-w-xl mx-auto">
              從建站到賽後數據，我們提供您辦比賽所需要的一切工具，全流程一站搞定。
            </p>
          </div>
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
            {platformFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <StaggerItem key={f.title}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border border-slate-800 bg-slate-900/80 shadow-none hover:shadow-lg hover:border-slate-700 h-full">
                      <div className="p-8">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 mb-6">
                          <Icon className="h-7 w-7" />
                        </div>
                        <h3 className="mb-3 font-bold text-white text-xl">{f.title}</h3>
                        <p className="text-slate-400 leading-relaxed">{f.description}</p>
                      </div>
                    </Card>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center max-w-3xl mx-auto">
        <motion.div 
          className="bg-slate-900 border border-slate-800 rounded-3xl p-10 md:p-16 relative overflow-hidden"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Trophy className="mx-auto mb-6 h-16 w-16 text-orange-500" />
          </motion.div>
          <h2 className="mb-4 font-bold text-3xl md:text-4xl text-white">準備好舉辦下一場賽事了嗎？</h2>
          <p className="mb-10 text-slate-400 text-lg">
            免費方案支援最多 100 支隊伍，立即開始打造您的專屬賽事品牌。
          </p>
          <Button 
            className="px-10 py-4 text-lg font-bold bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/20" 
            onClick={() => setRoute('wizard')}
          >
            <Globe className="mr-2 h-6 w-6" />
            立即免費開始
          </Button>
        </motion.div>
      </section>
      
      <Footer />
    </div>
  );
}
