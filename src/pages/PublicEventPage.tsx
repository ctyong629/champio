import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Calendar, MapPin, MonitorSmartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/Footer';
import { useToast } from '@/hooks/useToast';
import { FadeIn } from '@/components/PageTransition';

const MOCK_ANNOUNCEMENTS = [
  { id: 1, title: '賽程表已正式公佈，請各隊伍查閱', date: '2026-04-01', pinned: true, status: '已發布' },
  { id: 2, title: '報名期限延長至 4/10', date: '2026-03-25', pinned: false, status: '已發布' },
  { id: 3, title: '裁判會議紀錄', date: '2026-03-20', pinned: false, status: '草稿' },
];

import type { RouteType } from '@/App';

interface PublicEventPageProps {
  setRoute: (route: RouteType) => void;
  role: string;
}

export function PublicEventPage({ setRoute, role }: PublicEventPageProps) {
  const [tab, setTab] = useState('info');
  const { addToast } = useToast();

  const handleRegister = () => {
    addToast({
      title: '開始報名',
      description: '正在導向報名表單...',
      variant: 'default'
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      {/* Event Header Banner */}
      <div className="h-64 bg-slate-900 relative border-b border-orange-500/30 overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2090&auto=format&fit=crop)' }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
        <div className="relative max-w-5xl mx-auto px-6 h-full flex flex-col justify-end pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="w-fit mb-3 bg-orange-500/20 text-orange-400 border-orange-500/50">籃球</Badge>
            <h1 className="text-4xl font-extrabold text-white">2026 全國春季盃籃球聯賽</h1>
            <p className="text-slate-300 mt-2 flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> 2026-04-15 起</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> 台北市立體育館</span>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 sticky top-16 bg-slate-950/80 backdrop-blur z-20">
        <div className="max-w-5xl mx-auto px-6 flex gap-6">
          {['info:賽事資訊', 'bracket:賽程表', 'teams:參賽隊伍', 'live:即時比分'].map(t => {
            const [id, label] = t.split(':');
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`py-4 font-medium text-sm border-b-2 transition-colors relative ${
                  tab === id ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {label}
                {tab === id && (
                  <motion.div
                    layoutId="eventTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {tab === 'info' && (
          <FadeIn className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h3 className="text-xl font-bold text-white mb-4">最新公告</h3>
                <div className="space-y-3">
                  {MOCK_ANNOUNCEMENTS.filter(a => a.status === '已發布').map((a, i) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className="p-4 flex flex-col gap-2 bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
                        <div className="flex items-center gap-2">
                          {a.pinned && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">置頂</Badge>}
                          <span className="text-slate-400 text-sm">{a.date}</span>
                        </div>
                        <p className="text-white font-medium hover:text-orange-400 transition-colors">{a.title}</p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </section>
              <section>
                 <h3 className="text-xl font-bold text-white mb-4">賽事規章</h3>
                 <Card className="p-6 bg-slate-800 border-slate-700">
                    <div className="prose prose-invert max-w-none text-slate-300 space-y-3">
                      <p>一、 宗 旨：推廣籃球運動，提升技術水準...</p>
                      <p>二、 主辦單位：中華民國XX籃球協會</p>
                      <p>三、 比賽日期：2026 年 4 月 15 日至 4 月 30 日</p>
                      <p>四、 比賽地點：台北市立體育館</p>
                      <p>五、 參加資格：凡熱愛籃球運動者均可組隊參加</p>
                    </div>
                 </Card>
              </section>
            </div>
            <div>
              <Card className="p-6 space-y-6 sticky top-36 bg-slate-800 border-slate-700">
                <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">報名資訊</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">報名狀態</span>
                    <span className="text-emerald-400 font-bold">開放報名中</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">報名截止</span>
                    <span className="text-white">2026-04-10</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">剩餘名額</span>
                    <span className="text-orange-400 font-bold">4 / 16 隊</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">報名費用</span>
                    <span className="text-white">$3,000/隊</span>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="bg-slate-900 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-orange-600 to-orange-400"
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <p className="text-xs text-slate-500 text-center">已報名 12 / 16 隊</p>
                
                {/* Register button */}
                <Button 
                  className="w-full py-3 text-lg bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20"
                  onClick={handleRegister}
                >
                  立即報名
                </Button>
              </Card>
            </div>
          </FadeIn>
        )}

        {tab === 'bracket' && (
          <FadeIn className="space-y-6 text-center py-12">
            <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white">單敗淘汰賽程表</h3>
            <p className="text-slate-400">目前賽程已排定，點擊隊伍可查看詳細對戰紀錄。</p>
            
            <div className="mt-8 inline-block text-left">
              <div className="flex min-w-[600px] justify-between text-sm bg-slate-900 p-8 rounded-xl border border-slate-800">
                  <div className="flex flex-col justify-around h-96 w-48 space-y-4">
                    <motion.div 
                      className="bg-slate-800 border border-slate-700 hover:border-orange-500 cursor-pointer rounded p-3 text-white transition-colors relative"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex justify-between"><span>猛龍隊</span><span className="text-slate-500">-</span></div>
                      <div className="border-t border-slate-700 my-1"></div>
                      <div className="flex justify-between text-slate-400"><span>飛鷹隊</span><span>-</span></div>
                      <div className="absolute top-1/2 -right-6 w-6 h-px bg-slate-700"></div>
                    </motion.div>
                    <motion.div 
                      className="bg-slate-800 border border-slate-700 hover:border-orange-500 cursor-pointer rounded p-3 text-white transition-colors relative"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex justify-between"><span>閃電俠</span><span className="text-slate-500">-</span></div>
                      <div className="border-t border-slate-700 my-1"></div>
                      <div className="flex justify-between text-slate-400"><span>暴風雪</span><span>-</span></div>
                      <div className="absolute top-1/2 -right-6 w-6 h-px bg-slate-700"></div>
                    </motion.div>
                  </div>
                  
                  <div className="flex flex-col justify-center h-96 w-48">
                    <motion.div 
                      className="bg-slate-800 border-2 border-orange-500 rounded p-3 text-white shadow relative"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="absolute top-1/2 -left-6 w-6 h-px bg-slate-700"></div>
                      <div className="absolute -left-6 top-[25%] h-[50%] w-px bg-slate-700"></div>
                      <div className="flex justify-between"><span>待定</span><span className="text-orange-500 font-bold">-</span></div>
                      <div className="border-t border-slate-700 my-1"></div>
                      <div className="flex justify-between"><span>待定</span><span>-</span></div>
                    </motion.div>
                  </div>
              </div>
            </div>
          </FadeIn>
        )}

        {tab === 'teams' && (
          <FadeIn className="space-y-6">
            <h3 className="text-xl font-bold text-white">參賽隊伍 (12/16)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {['猛龍隊', '飛鷹隊', '閃電俠', '暴風雪', '火焰鳥', '雷霆隊', '海盜隊', '勇士隊', '王者隊', '傳奇隊', '夢幻隊', '明星隊'].map((team, i) => (
                <motion.div
                  key={team}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="p-4 bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg">
                      {team[0]}
                    </div>
                    <div>
                      <p className="font-medium text-white">{team}</p>
                      <p className="text-xs text-slate-500">已繳費</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </FadeIn>
        )}

        {tab === 'live' && (
          <FadeIn className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                LIVE 即時比分
              </h3>
              {role === 'scorekeeper' && (
                <Button 
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => setRoute('scorekeeper')}
                >
                  進入記錄台介面 <MonitorSmartphone className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
            
            <Card className="max-w-2xl mx-auto border-orange-500/50 bg-slate-900 overflow-hidden relative shadow-[0_0_30px_rgba(249,115,22,0.1)]">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
              <div className="p-8 text-center">
                <Badge className="mb-4 bg-red-500/20 text-red-400 border-red-500/50">第一節 08:42</Badge>
                <div className="flex justify-between items-center px-4">
                  <div className="flex flex-col items-center gap-2 w-1/3">
                    <motion.div 
                      className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-white border border-slate-700"
                      whileHover={{ scale: 1.1 }}
                    >
                      猛
                    </motion.div>
                    <span className="text-white font-bold text-lg">猛龍隊</span>
                  </div>
                  <div className="w-1/3">
                    <motion.div 
                      className="text-5xl font-extrabold text-orange-500 tracking-tighter"
                      key="score"
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                    >
                      78<span className="text-slate-600 mx-2 text-3xl">:</span>65
                    </motion.div>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-1/3">
                    <motion.div 
                      className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-white border border-slate-700"
                      whileHover={{ scale: 1.1 }}
                    >
                      飛
                    </motion.div>
                    <span className="text-white font-bold text-lg">飛鷹隊</span>
                  </div>
                </div>
                
                {/* Game stats */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-800 rounded-lg p-3">
                    <p className="text-slate-400 text-xs">第一節</p>
                    <p className="text-white font-bold">28-22</p>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3">
                    <p className="text-slate-400 text-xs">第二節</p>
                    <p className="text-white font-bold">25-20</p>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3">
                    <p className="text-slate-400 text-xs">第三節</p>
                    <p className="text-white font-bold">25-23</p>
                  </div>
                </div>
              </div>
            </Card>
          </FadeIn>
        )}
      </div>

      <Footer />
    </div>
  );
}
