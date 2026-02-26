import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, FileText, Users, Trophy, MonitorSmartphone,
  Plus, Edit3, AlertCircle, CheckCircle2, XCircle, Clock,
  Download, Shuffle, Medal, Mail, FormInput, Zap, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTable } from '@/components/ResponsiveTable';
import { ExportButton } from '@/components/ExportButton';
// DrawSystem removed - using DrawAnimation instead
import { FileUpload } from '@/components/FileUpload';
import { MedalRanking } from '@/components/MedalRanking';
import { FormBuilder } from '@/components/FormBuilder';
import { TournamentBracket } from '@/components/TournamentBracket';
import { AutoScheduler } from '@/components/AutoScheduler';
import { RichTextEditor, AnnouncementEditor } from '@/components/RichTextEditor';
import { DrawAnimation } from '@/components/DrawAnimation';
import { useToast } from '@/hooks/useToast';
import { FadeIn } from '@/components/PageTransition';
import type { RouteType } from '@/App';
import type { Team, Event } from '@/types';

const MOCK_TEAMS: Team[] = [
  { id: 1, name: '猛龍隊', contact: '王小明', phone: '0912-345-678', email: 'team1@example.com', status: '審核通過', paid: true, registeredAt: '2026-01-15' },
  { id: 2, name: '飛鷹隊', contact: '李大華', phone: '0923-456-789', email: 'team2@example.com', status: '審核通過', paid: true, registeredAt: '2026-01-16' },
  { id: 3, name: '閃電俠', contact: '張小龍', phone: '0934-567-890', email: 'team3@example.com', status: '資料不全', paid: false, registeredAt: '2026-01-17' },
  { id: 4, name: '暴風雪', contact: '陳小美', phone: '0945-678-901', email: 'team4@example.com', status: '候補中', paid: false, registeredAt: '2026-01-18' },
  { id: 5, name: '火焰鳥', contact: '林志強', phone: '0956-789-012', email: 'team5@example.com', status: '待審核', paid: false, registeredAt: '2026-01-19' },
];

const MOCK_ANNOUNCEMENTS = [
  { id: 1, title: '賽程表已正式公佈，請各隊伍查閱', date: '2026-04-01', pinned: true, status: '已發布' },
  { id: 2, title: '報名期限延長至 4/10', date: '2026-03-25', pinned: false, status: '已發布' },
  { id: 3, title: '裁判會議紀錄', date: '2026-03-20', pinned: false, status: '草稿' },
];

const MOCK_MEDAL_DATA = [
  { id: '1', name: '國立陽明交通大學', category: '學校', gold: 3, silver: 2, bronze: 1 },
  { id: '2', name: '國立台灣大學', category: '學校', gold: 2, silver: 3, bronze: 2 },
  { id: '3', name: '國立清華大學', category: '學校', gold: 2, silver: 1, bronze: 3 },
  { id: '4', name: '國立成功大學', category: '學校', gold: 1, silver: 2, bronze: 2 },
  { id: '5', name: '國立政治大學', category: '學校', gold: 1, silver: 1, bronze: 1 },
];

const MOCK_EVENT: Event = {
  id: 1,
  title: '2026 全國春季盃籃球聯賽',
  sport: '籃球',
  date: '2026-04-15',
  startDate: '2026-04-15',
  endDate: '2026-04-30',
  location: '台北市立體育館',
  organizer: '中華籃球協會',
  status: '報名中',
  teams: 12,
  maxTeams: 16,
  bannerColor: '#f97316',
  description: '全國最大型的春季籃球聯賽',
};

interface DashboardProps {
  setRoute: (route: RouteType) => void;
}

export function Dashboard({ setRoute }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<typeof MOCK_ANNOUNCEMENTS[0] | null>(null);
  const { addToast } = useToast();

  const drawTeams = MOCK_TEAMS.map(t => ({ id: t.id.toString(), name: t.name }));

  const tabs = [
    { id: 'overview', label: '總覽儀表板', icon: Activity },
    { id: 'cms', label: '公告管理', icon: FileText },
    { id: 'formbuilder', label: '表單建構器', icon: FormInput },
    { id: 'registration', label: '報名管理', icon: Users },
    { id: 'bracket', label: '賽程樹狀圖', icon: Trophy },
    { id: 'scheduler', label: '自動排程', icon: Zap },
    { id: 'draw', label: '線上抽籤', icon: Shuffle },
    { id: 'ranking', label: '獎牌排名', icon: Medal },
  ];

  const handleViewTeam = (team: typeof MOCK_TEAMS[0]) => {
    addToast({
      title: '查看隊伍',
      description: `隊伍：${team.name}`,
      variant: 'default'
    });
  };

  const handleSendEmail = () => {
    addToast({
      title: '發送 Email 通知',
      description: '已發送報名確認信給所有隊伍',
      variant: 'success'
    });
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-2 overflow-y-auto">
        <div className="mb-6 px-2">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">2026 春季聯賽</h2>
          <p className="text-white text-lg font-semibold mt-1">主控台</p>
        </div>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.id ? 'bg-orange-500/10 text-orange-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
            `}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
        <div className="mt-auto pt-4 border-t border-slate-800">
           <Button 
             variant="outline" 
             className="w-full justify-start border-slate-700 hover:bg-slate-800" 
             onClick={() => setRoute('public_event')}
           >
             <MonitorSmartphone className="w-4 h-4 mr-2" /> 檢視前台頁面
           </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-slate-950">
        {activeTab === 'overview' && (
          <FadeIn className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">賽事現況總覽</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: '已報名隊伍', value: '12/16', color: 'text-orange-500', icon: Users },
                { label: '待審核名單', value: '3', color: 'text-amber-500', icon: Clock },
                { label: '總收入預估', value: '$36,000', color: 'text-emerald-500', icon: CheckCircle2 },
                { label: '賽事關注度', value: '1,204', color: 'text-blue-500', icon: Activity }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
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
            
            {/* Todo List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <Card className="p-6 bg-slate-800 border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">待辦事項清單</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-slate-300 p-3 bg-slate-900/50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p>有 3 支隊伍尚未上傳身分證明文件</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-orange-400 hover:text-orange-300 mt-1 p-0 h-auto"
                        onClick={() => setActiveTab('registration')}
                      >
                        前往處理
                      </Button>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300 p-3 bg-slate-900/50 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p>「閃電俠」隊伍匯款回報金額不符</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-orange-400 hover:text-orange-300 mt-1 p-0 h-auto"
                        onClick={() => setActiveTab('registration')}
                      >
                        前往核對
                      </Button>
                    </div>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-slate-800 border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">快速操作</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="border-slate-600 h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => setActiveTab('cms')}
                  >
                    <FileText className="w-6 h-6" />
                    <span className="text-sm">發布公告</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-slate-600 h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => setActiveTab('registration')}
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-sm">審核報名</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-slate-600 h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => setActiveTab('draw')}
                  >
                    <Shuffle className="w-6 h-6" />
                    <span className="text-sm">線上抽籤</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-slate-600 h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => setRoute('public_event')}
                  >
                    <MonitorSmartphone className="w-6 h-6" />
                    <span className="text-sm">預覽網站</span>
                  </Button>
                </div>
              </Card>
            </div>
          </FadeIn>
        )}

        {activeTab === 'cms' && (
          <FadeIn className="space-y-6">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-white">公告管理</h2>
               <Button 
                 className="bg-orange-500 hover:bg-orange-600"
                 onClick={() => {
                   setEditingAnnouncement(null);
                   setIsEditorOpen(true);
                 }}
               >
                 <Plus className="w-4 h-4 mr-2" /> 新增公告
               </Button>
             </div>
             
             {/* Rich Text Editor Demo */}
             <Card className="p-6 bg-slate-800 border-slate-700">
               <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                 <Sparkles className="w-5 h-5 text-orange-500" />
                 快速編輯
               </h3>
               <RichTextEditor 
                 placeholder="輸入公告內容...支援粗體、斜體、標題、列表、圖片、連結等格式"
                 minHeight="200px"
               />
             </Card>

             <Card className="bg-slate-800 border-slate-700">
               <ResponsiveTable
                 data={MOCK_ANNOUNCEMENTS}
                 keyExtractor={(item) => item.id.toString()}
                 cardTitle={(item) => item.title}
                 cardSubtitle={(item) => item.date}
                 onEdit={(item) => {
                   setEditingAnnouncement(item);
                   setIsEditorOpen(true);
                 }}
                 columns={[
                   { 
                     key: 'title', 
                     header: '標題',
                     render: (item) => (
                       <div className="flex items-center gap-2">
                         {item.pinned && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">置頂</Badge>}
                         <span className="text-white">{item.title}</span>
                       </div>
                     )
                   },
                   { key: 'date', header: '發布日期' },
                   { 
                     key: 'status', 
                     header: '狀態',
                     render: (item) => (
                       <Badge className={
                         item.status === '已發布' 
                           ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                           : 'bg-slate-700 text-slate-400'
                       }>
                         {item.status}
                       </Badge>
                     )
                   },
                   { 
                     key: 'actions', 
                     header: '操作',
                     className: 'text-right',
                     render: (item) => (
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="text-slate-400 hover:text-white"
                         onClick={() => {
                           setEditingAnnouncement(item);
                           setIsEditorOpen(true);
                         }}
                       >
                         <Edit3 className="w-4 h-4" />
                       </Button>
                     )
                   },
                 ]}
               />
             </Card>

             {/* Announcement Editor Modal */}
             <AnimatePresence>
               {isEditorOpen && (
                 <AnnouncementEditor
                   isOpen={isEditorOpen}
                   onClose={() => setIsEditorOpen(false)}
                   onSave={(data) => {
                     addToast({
                       title: editingAnnouncement ? '公告已更新' : '公告已發布',
                       description: data.title,
                       variant: 'success'
                     });
                   }}
                   initialData={editingAnnouncement ? {
                     title: editingAnnouncement.title,
                     content: '<p>這是公告內容...</p>',
                     pinned: editingAnnouncement.pinned,
                   } : undefined}
                 />
               )}
             </AnimatePresence>
          </FadeIn>
        )}

        {activeTab === 'registration' && (
          <FadeIn className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">報名隊伍管理</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-slate-700"
                  onClick={handleSendEmail}
                >
                  <Mail className="w-4 h-4 mr-2" /> 發送通知
                </Button>
                <ExportButton 
                  teams={MOCK_TEAMS} 
                  event={MOCK_EVENT}
                />
              </div>
            </div>

            {/* File Upload Section */}
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">批次上傳報名資料</h3>
              <FileUpload
                accept=".csv,.xlsx,.xls"
                maxSize={5}
                maxFiles={3}
                onUpload={(files) => {
                  addToast({
                    title: '檔案已接收',
                    description: `已上傳 ${files.length} 個檔案，系統正在處理`,
                    variant: 'success'
                  });
                }}
              />
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <ResponsiveTable
                data={MOCK_TEAMS}
                keyExtractor={(item) => item.id.toString()}
                cardTitle={(item) => item.name}
                cardSubtitle={(item) => item.contact}
                onView={handleViewTeam}
                columns={[
                   { key: 'name', header: '隊伍名稱', render: (item) => <span className="font-medium text-white">{item.name}</span> },
                   { 
                     key: 'contact', 
                     header: '負責人',
                     render: (item) => `${item.contact} (${item.phone})`
                   },
                   { 
                     key: 'status', 
                     header: '審核狀態',
                     render: (item) => {
                       const variants: Record<string, string> = {
                         '審核通過': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
                         '候補中': 'bg-amber-500/20 text-amber-400 border-amber-500/50',
                         '資料不全': 'bg-red-500/20 text-red-400 border-red-500/50',
                         '待審核': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
                       };
                       return (
                         <Badge className={variants[item.status] || 'bg-slate-700 text-slate-400'}>
                           {item.status}
                         </Badge>
                       );
                     }
                   },
                   { 
                     key: 'paid', 
                     header: '繳費狀態',
                     render: (item) => (
                       <Badge className={item.paid ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-700 text-slate-400'}>
                         {item.paid ? '已繳費' : '未繳費'}
                       </Badge>
                     )
                   },
                   { 
                     key: 'actions', 
                     header: '操作',
                     className: 'text-right',
                     render: (item) => (
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className="border-slate-600 text-slate-300 hover:text-white"
                         onClick={() => handleViewTeam(item)}
                       >
                         審查
                       </Button>
                     )
                   },
                 ]}
              />
            </Card>
          </FadeIn>
        )}

        {activeTab === 'formbuilder' && (
          <FadeIn className="h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">報名表單建構器</h2>
                <p className="text-sm text-slate-400">拖曳欄位來設計您的報名表單</p>
              </div>
            </div>
            <Card className="h-[calc(100%-4rem)] bg-slate-900 border-slate-700 overflow-hidden">
              <FormBuilder />
            </Card>
          </FadeIn>
        )}

        {activeTab === 'bracket' && (
          <FadeIn className="h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">淘汰賽樹狀圖</h2>
                <p className="text-sm text-slate-400">點擊比賽卡片編輯比分，使用縮放控制調整視圖</p>
              </div>
            </div>
            <Card className="h-[calc(100%-4rem)] bg-slate-900 border-slate-700 overflow-hidden">
              <TournamentBracket />
            </Card>
          </FadeIn>
        )}

        {activeTab === 'scheduler' && (
          <FadeIn className="h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">自動排程</h2>
                <p className="text-sm text-slate-400">設定參數後一鍵產生最佳賽程安排</p>
              </div>
            </div>
            <Card className="h-[calc(100%-4rem)] bg-slate-900 border-slate-700 overflow-hidden">
              <AutoScheduler />
            </Card>
          </FadeIn>
        )}

        {activeTab === 'draw' && (
          <FadeIn className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">線上抽籤</h2>
                <p className="text-sm text-slate-400">三種動畫效果：拉霸機、洗牌、輪盤</p>
              </div>
            </div>
            
            <Card className="p-6 bg-slate-800 border-slate-700">
              <DrawAnimation
                teams={drawTeams}
                onComplete={(results) => {
                  addToast({
                    title: '抽籤完成！',
                    description: `已完成 ${results.length} 隊的抽籤`,
                    variant: 'success'
                  });
                }}
              />
            </Card>
          </FadeIn>
        )}

        {activeTab === 'ranking' && (
          <FadeIn className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">獎牌排名</h2>
              <Button 
                variant="outline" 
                className="border-slate-700"
                onClick={() => addToast({
                  title: '匯出排名',
                  description: '獎牌榜已匯出',
                  variant: 'success'
                })}
              >
                <Download className="w-4 h-4 mr-2" /> 匯出排名
              </Button>
            </div>
            
            <MedalRanking
              data={MOCK_MEDAL_DATA}
              type="school"
              showPoints={true}
            />
          </FadeIn>
        )}
      </div>
    </div>
  );
}
