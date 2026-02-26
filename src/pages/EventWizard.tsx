import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, ChevronRight, ChevronLeft, Upload, Trophy,
  Users, DollarSign, Calendar, MapPin, Phone, Mail, User,
  Palette, Layout, Swords, Clock, Target, Image as ImageIcon,
  CircleDot, Flag, Hash, Gamepad2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import type { SportType, ThemeType, TournamentFormat, EventWizardData, RouteType } from '@/types';

// 🌟 引入 Firebase 與 Auth 功能
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

// ============================================
// Constants
// ============================================

const sportOptions: { value: SportType; label: string; icon: React.ElementType }[] = [
  { value: 'basketball', label: '籃球', icon: Gamepad2 },
  { value: 'volleyball', label: '排球', icon: CircleDot },
  { value: 'soccer', label: '足球', icon: CircleDot },
  { value: 'badminton', label: '羽球', icon: Flag },
  { value: 'tabletennis', label: '桌球', icon: CircleDot },
  { value: 'softball', label: '壘球', icon: CircleDot },
  { value: 'beachvolleyball', label: '沙排', icon: CircleDot },
  { value: 'other', label: '其他', icon: Hash },
];

const themes: { id: ThemeType; name: string; gradient: string; primary: string; accent: string }[] = [
  { id: 'dark', name: '深邃曜黑', gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', primary: '#f97316', accent: '#fb923c' },
  { id: 'orange', name: '熱血橘紅', gradient: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)', primary: '#fb923c', accent: '#fdba74' },
  { id: 'blue', name: '海洋湛藍', gradient: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)', primary: '#60a5fa', accent: '#93c5fd' },
  { id: 'minimal', name: '極簡純白', gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', primary: '#475569', accent: '#64748b' },
];

const tournamentFormats: { value: TournamentFormat; label: string; description: string }[] = [
  { value: 'single_elimination', label: '單敗淘汰', description: '輸一場即淘汰，快速決出冠軍' },
  { value: 'double_elimination', label: '雙敗淘汰', description: '輸兩場才淘汰，給予隊伍第二次機會' },
  { value: 'round_robin', label: '循環賽', description: '每隊互相對戰，積分最高者獲勝' },
  { value: 'hybrid', label: '混合制', description: '預賽循環 + 決賽淘汰' },
];

// ============================================
// Step Components
// ============================================

function Step1BasicInfo({ data, onChange }: { data: EventWizardData; onChange: (data: Partial<EventWizardData>) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">步驟一：賽事基本資訊</h3>
          <p className="text-sm text-slate-400">填寫賽事的基本資料</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Event Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            賽事名稱 <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all" 
            placeholder="例如：2026 台北週末籃球聯賽" 
          />
        </div>

        {/* Sport Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">運動項目</label>
          <div className="grid grid-cols-4 gap-3">
            {sportOptions.map((sport) => {
              const Icon = sport.icon;
              return (
                <motion.button
                  key={sport.value}
                  type="button"
                  onClick={() => onChange({ sport: sport.value })}
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    data.sport === sport.value 
                      ? 'border-orange-500 bg-orange-500/10' 
                      : 'border-slate-700 hover:border-slate-500'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className={`w-6 h-6 ${data.sport === sport.value ? 'text-orange-500' : 'text-slate-400'}`} />
                  <span className={`text-xs ${data.sport === sport.value ? 'text-orange-400' : 'text-slate-400'}`}>
                    {sport.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" /> 開始日期
            </label>
            <input 
              type="date" 
              value={data.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" /> 結束日期
            </label>
            <input 
              type="date" 
              value={data.endDate}
              onChange={(e) => onChange({ endDate: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" /> 比賽地點
          </label>
          <input 
            type="text" 
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
            placeholder="例如：台北市立體育館" 
          />
        </div>

        {/* Organizer */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <User className="w-4 h-4 inline mr-1" /> 主辦單位
          </label>
          <input 
            type="text" 
            value={data.organizer}
            onChange={(e) => onChange({ organizer: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
            placeholder="例如：中華籃球協會" 
          />
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Mail className="w-4 h-4 inline mr-1" /> 聯絡 Email
            </label>
            <input 
              type="email" 
              value={data.contactEmail}
              onChange={(e) => onChange({ contactEmail: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
              placeholder="contact@example.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Phone className="w-4 h-4 inline mr-1" /> 聯絡電話
            </label>
            <input 
              type="tel" 
              value={data.contactPhone}
              onChange={(e) => onChange({ contactPhone: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
              placeholder="0912-345-678" 
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">賽事簡介</label>
          <textarea 
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none resize-none" 
            rows={3}
            placeholder="簡短描述您的賽事..." 
          />
        </div>
      </div>
    </div>
  );
}

function Step2Theme({ data, onChange }: { data: EventWizardData; onChange: (data: Partial<EventWizardData>) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ bannerImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
          <Palette className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">步驟二：選擇佈景主題</h3>
          <p className="text-sm text-slate-400">自訂您的賽事官網外觀</p>
        </div>
      </div>

      {/* Banner Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <ImageIcon className="w-4 h-4 inline mr-1" /> Banner 圖片
        </label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative h-40 rounded-xl border-2 border-dashed border-slate-600 hover:border-orange-500 transition-colors cursor-pointer overflow-hidden bg-slate-900 flex items-center justify-center"
        >
          {data.bannerImage ? (
            <img src={data.bannerImage} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <Upload className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <p className="text-slate-400">點擊上傳 Banner 圖片</p>
              <p className="text-xs text-slate-500 mt-1">建議尺寸 1200x400px</p>
            </div>
          )}
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="hidden" 
          />
        </div>
      </div>

      {/* Theme Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          <Layout className="w-4 h-4 inline mr-1" /> 選擇配色方案
        </label>
        <div className="grid grid-cols-2 gap-4">
          {themes.map((theme) => (
            <motion.div 
              key={theme.id}
              className={`
                p-4 rounded-xl border-2 cursor-pointer transition-all
                ${data.theme === theme.id ? 'border-orange-500 bg-slate-900' : 'border-slate-700 hover:border-slate-500'}
              `}
              onClick={() => onChange({ theme: theme.id })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="h-24 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden"
                style={{ background: theme.gradient }}
              >
                <div className="text-center">
                  <Trophy className="w-6 h-6 mx-auto mb-1" style={{ color: theme.primary }} />
                  <p className="text-xs font-medium" style={{ color: theme.id === 'minimal' ? '#1e293b' : '#fff' }}>
                    {data.name || '賽事名稱'}
                  </p>
                </div>
                {data.theme === theme.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </div>
              <p className="text-center text-white font-medium text-sm">{theme.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step3Registration({ data, onChange }: { data: EventWizardData; onChange: (data: Partial<EventWizardData>) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">步驟三：報名設定</h3>
          <p className="text-sm text-slate-400">設定報名規則與名額</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Max Teams */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Users className="w-4 h-4 inline mr-1" /> 隊伍上限
          </label>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="4" 
              max="64" 
              value={data.maxTeams}
              onChange={(e) => onChange({ maxTeams: parseInt(e.target.value) })}
              className="flex-1 accent-orange-500" 
            />
            <span className="w-16 text-center text-xl font-bold text-orange-400">{data.maxTeams}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">建議：籃球 16-32 隊，排球 8-16 隊</p>
        </div>

        {/* Registration Fee */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" /> 報名費用（每隊）
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input 
                type="number" 
                value={data.registrationFee}
                onChange={(e) => onChange({ registrationFee: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
                placeholder="3000" 
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={!data.requirePayment}
                onChange={(e) => onChange({ requirePayment: !e.target.checked })}
                className="w-5 h-5 accent-orange-500" 
              />
              <span className="text-sm text-slate-400">免費</span>
            </label>
          </div>
        </div>

        {/* Registration Deadline */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" /> 報名截止日期
          </label>
          <input 
            type="date" 
            value={data.registrationDeadline}
            onChange={(e) => onChange({ registrationDeadline: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
          />
        </div>

        {/* Players per Team */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">最少人數</label>
            <input 
              type="number" 
              min="1"
              value={data.minPlayersPerTeam}
              onChange={(e) => onChange({ minPlayersPerTeam: parseInt(e.target.value) || 1 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">最多人數</label>
            <input 
              type="number" 
              min="1"
              value={data.maxPlayersPerTeam}
              onChange={(e) => onChange({ maxPlayersPerTeam: parseInt(e.target.value) || 1 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
            />
          </div>
        </div>

        {/* Waitlist */}
        <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
          <div>
            <p className="text-slate-300 font-medium">開放候補名單</p>
            <p className="text-xs text-slate-500">額滿後允許隊伍加入候補</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={data.allowWaitlist}
              onChange={(e) => onChange({ allowWaitlist: e.target.checked })}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

function Step4TournamentRules({ data, onChange }: { data: EventWizardData; onChange: (data: Partial<EventWizardData>) => void }) {
  const [newCourt, setNewCourt] = useState('');

  const addCourt = () => {
    if (newCourt.trim() && !data.courts.includes(newCourt.trim())) {
      onChange({ courts: [...data.courts, newCourt.trim()] });
      setNewCourt('');
    }
  };

  const removeCourt = (court: string) => {
    onChange({ courts: data.courts.filter(c => c !== court) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
          <Swords className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">步驟四：賽程規則</h3>
          <p className="text-sm text-slate-400">設定比賽賽制與場地</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Tournament Format */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            <Target className="w-4 h-4 inline mr-1" /> 賽制類型
          </label>
          <div className="space-y-3">
            {tournamentFormats.map((format) => (
              <motion.div 
                key={format.value}
                className={`
                  p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${data.format === format.value 
                    ? 'border-orange-500 bg-orange-500/10' 
                    : 'border-slate-700 hover:border-slate-500'}
                `}
                onClick={() => onChange({ format: format.value })}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${data.format === format.value ? 'text-orange-400' : 'text-white'}`}>
                      {format.label}
                    </p>
                    <p className="text-sm text-slate-500">{format.description}</p>
                  </div>
                  {data.format === format.value && (
                    <CheckCircle2 className="w-5 h-5 text-orange-500" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Group Settings (for round_robin and hybrid) */}
        {(data.format === 'round_robin' || data.format === 'hybrid') && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">分組數量</label>
                <input 
                  type="number" 
                  min="1" 
                  max="8"
                  value={data.groups}
                  onChange={(e) => onChange({ groups: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">每組隊伍數</label>
                <input 
                  type="number" 
                  min="2" 
                  max="16"
                  value={data.teamsPerGroup}
                  onChange={(e) => onChange({ teamsPerGroup: parseInt(e.target.value) || 2 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">晉級名額（每組）</label>
              <input 
                type="number" 
                min="1" 
                max="4"
                value={data.advanceCount}
                onChange={(e) => onChange({ advanceCount: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
              />
            </div>
          </motion.div>
        )}

        {/* Courts */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" /> 比賽場地
          </label>
          <div className="flex gap-2 mb-3">
            <input 
              type="text" 
              value={newCourt}
              onChange={(e) => setNewCourt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCourt()}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
              placeholder="輸入場地名稱（如：A場、B場）" 
            />
            <Button onClick={addCourt} variant="secondary">
              新增
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.courts.map((court) => (
              <span 
                key={court}
                className="inline-flex items-center gap-1 px-3 py-1 bg-slate-700 rounded-full text-sm text-white"
              >
                {court}
                <button 
                  onClick={() => removeCourt(court)}
                  className="text-slate-400 hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Game Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Clock className="w-4 h-4 inline mr-1" /> 每場比賽時間（分鐘）
            </label>
            <input 
              type="number" 
              min="10" 
              max="120"
              value={data.gameDuration}
              onChange={(e) => onChange({ gameDuration: parseInt(e.target.value) || 30 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Clock className="w-4 h-4 inline mr-1" /> 休息時間（分鐘）
            </label>
            <input 
              type="number" 
              min="5" 
              max="60"
              value={data.breakDuration}
              onChange={(e) => onChange({ breakDuration: parseInt(e.target.value) || 10 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Step5Preview({ data, onFinish, isSubmitting }: { 
  data: EventWizardData; 
  onFinish: () => void;
  isSubmitting: boolean;
}) {
  const selectedTheme = themes.find(t => t.id === data.theme);
  const selectedFormat = tournamentFormats.find(f => f.value === data.format);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">步驟五：預覽與發布</h3>
          <p className="text-sm text-slate-400">確認設定無誤後發布</p>
        </div>
      </div>

      {/* Preview Card */}
      <Card className="overflow-hidden border-slate-700">
        {/* Banner Preview */}
        <div 
          className="h-32 relative"
          style={{ background: data.bannerImage ? `url(${data.bannerImage}) center/cover` : selectedTheme?.gradient }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-xl font-bold text-white">{data.name || '未命名賽事'}</h2>
            <p className="text-sm text-white/80">{data.organizer || '主辦單位'}</p>
          </div>
        </div>

        {/* Info Summary */}
        <div className="p-6 bg-slate-800 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">運動項目</p>
              <p className="text-white">{sportOptions.find(s => s.value === data.sport)?.label}</p>
            </div>
            <div>
              <p className="text-slate-500">比賽日期</p>
              <p className="text-white">{data.startDate} ~ {data.endDate}</p>
            </div>
            <div>
              <p className="text-slate-500">比賽地點</p>
              <p className="text-white">{data.location || '待定'}</p>
            </div>
            <div>
              <p className="text-slate-500">隊伍上限</p>
              <p className="text-white">{data.maxTeams} 隊</p>
            </div>
            <div>
              <p className="text-slate-500">報名費用</p>
              <p className="text-white">{data.requirePayment ? `$${data.registrationFee}/隊` : '免費'}</p>
            </div>
            <div>
              <p className="text-slate-500">賽制</p>
              <p className="text-white">{selectedFormat?.label}</p>
            </div>
          </div>

          <div className="h-px bg-slate-700" />

          <div>
            <p className="text-slate-500 text-sm mb-1">主題風格</p>
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded"
                style={{ background: selectedTheme?.gradient }}
              />
              <span className="text-white">{selectedTheme?.name}</span>
            </div>
          </div>

          {data.courts.length > 0 && (
            <div>
              <p className="text-slate-500 text-sm mb-1">比賽場地</p>
              <div className="flex flex-wrap gap-1">
                {data.courts.map(court => (
                  <span key={court} className="px-2 py-0.5 bg-slate-700 rounded text-xs text-white">
                    {court}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Submit Button */}
      <Button 
        className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg font-bold"
        onClick={onFinish}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
            />
            處理中...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5 mr-2" />
            確認發布賽事
          </>
        )}
      </Button>
    </div>
  );
}

// ============================================
// Main Wizard Component
// ============================================

interface EventWizardProps {
  setRoute: (route: RouteType) => void;
}

const initialData: EventWizardData = {
  name: '',
  sport: 'basketball',
  startDate: '',
  endDate: '',
  location: '',
  organizer: '',
  contactEmail: '',
  contactPhone: '',
  description: '',
  theme: 'dark',
  bannerImage: null,
  maxTeams: 16,
  registrationFee: 3000,
  registrationDeadline: '',
  minPlayersPerTeam: 5,
  maxPlayersPerTeam: 12,
  requirePayment: true,
  allowWaitlist: true,
  format: 'single_elimination',
  groups: 4,
  teamsPerGroup: 4,
  advanceCount: 2,
  courts: [],
  gameDuration: 30,
  breakDuration: 10,
};

export function EventWizard({ setRoute }: EventWizardProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<EventWizardData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addToast } = useToast();
  // 🌟 取得目前登入的使用者資訊
  const { currentUser } = useAuth();

  const steps = [
    { id: 1, title: '基本資訊', icon: Trophy },
    { id: 2, title: '選擇版型', icon: Palette },
    { id: 3, title: '報名設定', icon: Users },
    { id: 4, title: '賽程規則', icon: Swords },
    { id: 5, title: '預覽發布', icon: CheckCircle2 },
  ];

  const handleDataChange = useCallback((newData: Partial<EventWizardData>) => {
    setData(prev => ({ ...prev, ...newData }));
  }, []);

  const validateStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        if (!data.name.trim()) {
          addToast({ title: '請輸入賽事名稱', variant: 'warning' });
          return false;
        }
        if (!data.startDate || !data.endDate) {
          addToast({ title: '請選擇比賽日期', variant: 'warning' });
          return false;
        }
        return true;
      case 2:
        return true;
      case 3:
        if (!data.registrationDeadline) {
          addToast({ title: '請設定報名截止日期', variant: 'warning' });
          return false;
        }
        return true;
      case 4:
        if (data.courts.length === 0) {
          addToast({ title: '請至少新增一個比賽場地', variant: 'warning' });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step) && step < 5) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // 🌟 將賽事資料儲存至 Firestore 的邏輯
  const handleFinish = async () => {
    if (!currentUser) {
      addToast({ title: '請先登入', variant: 'warning' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let bannerUrl = null;
      
      // 如果有上傳圖片 (base64格式)，先上傳到 Firebase Storage
      if (data.bannerImage && data.bannerImage.startsWith('data:image')) {
        addToast({ title: '正在上傳圖片...', variant: 'info' });
        const bannerRef = ref(storage, `banners/${currentUser.uid}_${Date.now()}`);
        await uploadString(bannerRef, data.bannerImage, 'data_url');
        bannerUrl = await getDownloadURL(bannerRef);
      }

      // 準備要儲存到資料庫的完整資料
      const eventDataToSave = {
        ...data,
        bannerImage: bannerUrl || data.bannerImage, // 使用雲端網址，如果沒有就存 null
        organizerId: currentUser.uid,               // 綁定建立者的 ID
        organizerEmail: currentUser.email,
        createdAt: serverTimestamp(),               // 記錄建立時間
        status: '報名中',                           // 預設狀態
        teamsRegistered: 0,                         // 預設已報名隊伍數為 0
      };

      // 寫入 Firestore 的 'events' 集合中
      await addDoc(collection(db, 'events'), eventDataToSave);

      addToast({
        title: '賽事建立成功！',
        description: '您的賽事官網已經準備好上線了',
        variant: 'success'
      });
      
      // 建立完成後跳轉至主控台 (Dashboard)
      setRoute('dashboard');
      
    } catch (error) {
      console.error("建立賽事失敗:", error);
      addToast({
        title: '建立失敗',
        description: '發生錯誤，請稍後再試',
        variant: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">建立賽事官網</h1>
          <p className="text-slate-400">按照以下步驟建立您的專屬賽事頁面</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex flex-col items-center gap-2 relative flex-1">
                  <motion.div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      step > s.id ? 'bg-emerald-500 text-white' : 
                      step === s.id ? 'bg-orange-500 text-white' : 
                      'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                    animate={step === s.id ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {step > s.id ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                  </motion.div>
                  <span className={`text-xs ${step >= s.id ? 'text-orange-400' : 'text-slate-500'}`}>
                    {s.title}
                  </span>
                  {i < steps.length - 1 && (
                    <div className={`absolute top-6 left-1/2 w-full h-0.5 -z-0 ${step > s.id ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-6 md:p-8 bg-slate-800 border-slate-700">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && <Step1BasicInfo data={data} onChange={handleDataChange} />}
              {step === 2 && <Step2Theme data={data} onChange={handleDataChange} />}
              {step === 3 && <Step3Registration data={data} onChange={handleDataChange} />}
              {step === 4 && <Step4TournamentRules data={data} onChange={handleDataChange} />}
              {step === 5 && <Step5Preview data={data} onFinish={handleFinish} isSubmitting={isSubmitting} />}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          {step < 5 && (
            <div className="mt-8 pt-6 border-t border-slate-700 flex justify-between">
              <Button 
                variant="ghost" 
                onClick={step === 1 ? () => setRoute('home') : handlePrev}
                disabled={isSubmitting}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {step === 1 ? '取消' : '上一步'}
              </Button>
              <Button 
                className="bg-orange-500 hover:bg-orange-600" 
                onClick={handleNext}
              >
                下一步
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}