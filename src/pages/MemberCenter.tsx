import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Trophy, Users, Calendar, CreditCard, Bell,
  ChevronRight, CheckCircle2, Clock, AlertCircle,
  XCircle, TrendingUp, Edit3, Camera, Plus,
  DollarSign, Phone, MapPin, Shield,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RouteType } from '@/App';
import type { UserRole } from '@/types';

// ============================================
// Mock Data
// ============================================

const MOCK_USER = {
  id: 'user-1',
  name: '王小明',
  email: 'xiaoming@example.com',
  phone: '0912-345-678',
  avatar: null,
  role: 'captain' as UserRole,
  memberSince: '2025-01-15',
  bio: '熱愛籃球，帶領猛龍隊征戰各大赛事',
  location: '台北市',
};

const MOCK_STATS = {
  totalEvents: 12,
  upcomingEvents: 3,
  teamsManaged: 2,
  winRate: 68,
  totalMatches: 45,
  wins: 31,
};

const MOCK_MY_EVENTS = [
  { id: 1, name: '2026 全國春季盃籃球聯賽', status: '審核通過', date: '2026-04-15', team: '猛龍隊', paid: true },
  { id: 2, name: '大專院校排球邀請賽', status: '審核中', date: '2026-05-20', team: '飛鷹隊', paid: false },
  { id: 3, name: '夏季街頭 3v3 爭霸戰', status: '未繳費', date: '2026-06-10', team: '猛龍隊', paid: false },
  { id: 4, name: '秋季籃球錦標賽', status: '候補', date: '2026-09-15', team: '猛龍隊', paid: false },
];

const MOCK_MY_TEAMS = [
  {
    id: 1,
    name: '猛龍隊',
    role: '隊長',
    members: [
      { id: 1, name: '王小明', role: '隊長', progress: 100 },
      { id: 2, name: '李大華', role: '隊員', progress: 85 },
      { id: 3, name: '張小龍', role: '隊員', progress: 70 },
      { id: 4, name: '陳小美', role: '隊員', progress: 90 },
      { id: 5, name: '林志強', role: '隊員', progress: 60 },
    ],
    eventCount: 8,
    winRate: 75,
  },
  {
    id: 2,
    name: '飛鷹隊',
    role: '隊員',
    members: [
      { id: 1, name: '王小明', role: '隊員', progress: 100 },
      { id: 2, name: '趙大偉', role: '隊長', progress: 100 },
      { id: 3, name: '孫小文', role: '隊員', progress: 80 },
    ],
    eventCount: 4,
    winRate: 50,
  },
];

const MOCK_HOSTED_EVENTS = [
  { id: 1, name: '2026 台北週末籃球聯賽', teams: 16, registered: 12, revenue: 36000, status: '報名中' },
  { id: 2, name: '夏季三人籃球賽', teams: 32, registered: 28, revenue: 56000, status: '進行中' },
];

const MOCK_PAYMENTS = [
  { id: 1, event: '2026 全國春季盃籃球聯賽', amount: 3000, date: '2026-01-15', status: '已繳費', method: '銀行匯款' },
  { id: 2, event: '大專院校排球邀請賽', amount: 2500, date: null, status: '待繳費', method: null },
  { id: 3, event: '夏季街頭 3v3 爭霸戰', amount: 1500, date: null, status: '待繳費', method: null },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'event', title: '賽程表已公佈', message: '2026 全國春季盃籃球聯賽賽程已更新', time: '10 分鐘前', read: false },
  { id: 2, type: 'team', title: '隊伍審核通過', message: '猛龍隊報名已通過審核', time: '2 小時前', read: false },
  { id: 3, type: 'payment', title: '繳費提醒', message: '夏季街頭 3v3 爭霸戰報名費尚未繳納', time: '1 天前', read: true },
  { id: 4, type: 'system', title: '系統公告', message: '平台將於今晚進行維護', time: '3 天前', read: true },
];

// ============================================
// Overview Tab
// ============================================

function OverviewTab({ user, stats }: { user: typeof MOCK_USER; stats: typeof MOCK_STATS }) {
  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card className="p-6 bg-slate-800 border-slate-700">
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-3xl font-bold text-white">
              {user.name[0]}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{user.name}</h3>
                <p className="text-slate-400">{user.email}</p>
              </div>
              <Button variant="outline" size="sm">
                <Edit3 className="w-4 h-4 mr-1" /> 編輯資料
              </Button>
            </div>
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" /> {user.phone}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {user.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> 加入於 {user.memberSince}
              </span>
            </div>
            <p className="mt-3 text-slate-300">{user.bio}</p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '參與賽事', value: stats.totalEvents, icon: Trophy, color: 'text-orange-500' },
          { label: '即將到來', value: stats.upcomingEvents, icon: Calendar, color: 'text-blue-500' },
          { label: '管理隊伍', value: stats.teamsManaged, icon: Users, color: 'text-emerald-500' },
          { label: '勝率', value: `${stats.winRate}%`, icon: TrendingUp, color: 'text-purple-500' },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-between">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <span className="text-2xl font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-sm text-slate-400 mt-2">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="p-6 bg-slate-800 border-slate-700">
        <h4 className="font-bold text-white mb-4">最近活動</h4>
        <div className="space-y-3">
          {[
            { action: '報名', target: '2026 全國春季盃籃球聯賽', time: '2 天前' },
            { action: '建立', target: '猛龍隊', time: '1 週前' },
            { action: '繳費', target: '報名費 $3,000', time: '2 週前' },
          ].map((activity, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="text-slate-300">
                  <span className="text-orange-400">{activity.action}</span> {activity.target}
                </span>
              </div>
              <span className="text-sm text-slate-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ============================================
// My Events Tab
// ============================================

function MyEventsTab() {
  const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
    '審核通過': { color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle2 },
    '審核中': { color: 'bg-amber-500/20 text-amber-400', icon: Clock },
    '未繳費': { color: 'bg-red-500/20 text-red-400', icon: XCircle },
    '候補': { color: 'bg-slate-500/20 text-slate-400', icon: AlertCircle },
  };

  return (
    <div className="space-y-4">
      {MOCK_MY_EVENTS.map((event) => {
        const config = statusConfig[event.status];
        const Icon = config.icon;
        return (
          <Card key={event.id} className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${config.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{event.name}</h4>
                  <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {event.team}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className={config.color}>{event.status}</Badge>
                {event.paid && (
                  <p className="text-xs text-emerald-400 mt-1">已繳費</p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ============================================
// My Teams Tab
// ============================================

function MyTeamsTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">我的隊伍</h3>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-1" /> 建立隊伍
        </Button>
      </div>

      {MOCK_MY_TEAMS.map((team) => (
        <Card key={team.id} className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xl font-bold text-white">{team.name}</h4>
                <Badge className={team.role === '隊長' ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-600'}>
                  {team.role}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                <span>{team.members.length} 位成員</span>
                <span>{team.eventCount} 場賽事</span>
                <span className="text-emerald-400">勝率 {team.winRate}%</span>
              </div>
            </div>
            {team.role === '隊長' && (
              <Button variant="outline" size="sm">
                <Edit3 className="w-4 h-4 mr-1" /> 管理
              </Button>
            )}
          </div>

          {/* Member Progress */}
          <div className="space-y-3">
            <p className="text-sm text-slate-400">成員資料完成度</p>
            {team.members.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm">
                  {member.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-300">{member.name}</span>
                    <span className="text-slate-400">{member.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${member.progress}%` }}
                      className={`h-full rounded-full ${
                        member.progress === 100 ? 'bg-emerald-500' : 'bg-orange-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ============================================
// Hosted Events Tab
// ============================================

function HostedEventsTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">舉辦的賽事</h3>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-1" /> 建立賽事
        </Button>
      </div>

      {MOCK_HOSTED_EVENTS.map((event) => (
        <Card key={event.id} className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-white">{event.name}</h4>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> {event.registered}/{event.teams} 隊報名
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" /> ${event.revenue.toLocaleString()} 收入
                </span>
              </div>
            </div>
            <div className="text-right">
              <Badge className={
                event.status === '報名中' 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-orange-500/20 text-orange-400'
              }>
                {event.status}
              </Badge>
              <Button variant="ghost" size="sm" className="mt-2">
                管理 <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ============================================
// Payment Records Tab
// ============================================

function PaymentRecordsTab() {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-800 border-slate-700 text-center">
          <p className="text-2xl font-bold text-white">$7,500</p>
          <p className="text-sm text-slate-400">總繳費金額</p>
        </Card>
        <Card className="p-4 bg-slate-800 border-slate-700 text-center">
          <p className="text-2xl font-bold text-emerald-400">1</p>
          <p className="text-sm text-slate-400">已繳費</p>
        </Card>
        <Card className="p-4 bg-slate-800 border-slate-700 text-center">
          <p className="text-2xl font-bold text-red-400">2</p>
          <p className="text-sm text-slate-400">待繳費</p>
        </Card>
      </div>

      {/* Payment List */}
      <div className="space-y-3">
        {MOCK_PAYMENTS.map((payment) => (
          <Card key={payment.id} className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  payment.status === '已繳費' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                }`}>
                  <CreditCard className={`w-5 h-5 ${
                    payment.status === '已繳費' ? 'text-emerald-400' : 'text-red-400'
                  }`} />
                </div>
                <div>
                  <h4 className="font-medium text-white">{payment.event}</h4>
                  <p className="text-sm text-slate-400">
                    {payment.status === '已繳費' 
                      ? `${payment.method} · ${payment.date}` 
                      : '尚未繳費'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-white">${payment.amount.toLocaleString()}</p>
                <Badge className={
                  payment.status === '已繳費' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/20 text-red-400'
                }>
                  {payment.status}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Notifications Tab
// ============================================

function NotificationsTab() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const typeIcons: Record<string, React.ElementType> = {
    event: Trophy,
    team: Users,
    payment: CreditCard,
    system: Shield,
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-white">通知中心</h3>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white">{unreadCount} 未讀</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            全部標記為已讀
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((notification) => {
          const Icon = typeIcons[notification.type];
          return (
            <Card 
              key={notification.id} 
              className={`p-4 border-slate-700 cursor-pointer transition-colors ${
                notification.read ? 'bg-slate-800/50' : 'bg-slate-800'
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  notification.read ? 'bg-slate-700' : 'bg-orange-500/20'
                }`}>
                  <Icon className={`w-5 h-5 ${notification.read ? 'text-slate-400' : 'text-orange-400'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium ${notification.read ? 'text-slate-400' : 'text-white'}`}>
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{notification.message}</p>
                  <p className="text-xs text-slate-500 mt-2">{notification.time}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// Main Member Center Component
// ============================================

interface MemberCenterProps {
  setRoute: (route: RouteType) => void;
  role: UserRole;
}

export function MemberCenter({ setRoute, role }: MemberCenterProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: '個人總覽', icon: User },
    { id: 'events', label: '我的賽事', icon: Trophy },
    { id: 'teams', label: '我的隊伍', icon: Users },
    ...(role === 'organizer' || role === 'admin' ? [{ id: 'hosted', label: '舉辦的賽事', icon: Calendar }] : []),
    { id: 'payments', label: '繳費紀錄', icon: CreditCard },
    { id: 'notifications', label: '通知中心', icon: Bell },
  ];

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">會員中心</h1>
            <p className="text-slate-400 mt-1">管理您的賽事、隊伍和帳戶資訊</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setRoute('home')}>
              <LogOut className="w-4 h-4 mr-1" /> 返回首頁
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all
                    ${activeTab === tab.id 
                      ? 'bg-orange-500/10 text-orange-500' 
                      : 'text-slate-400 hover:bg-slate-700 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.id === 'notifications' && unreadCount > 0 && (
                    <span className="w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {activeTab === 'overview' && <OverviewTab user={MOCK_USER} stats={MOCK_STATS} />}
                {activeTab === 'events' && <MyEventsTab />}
                {activeTab === 'teams' && <MyTeamsTab />}
                {(role === 'organizer' || role === 'admin') && activeTab === 'hosted' && <HostedEventsTab />}
                {activeTab === 'payments' && <PaymentRecordsTab />}
                {activeTab === 'notifications' && <NotificationsTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
