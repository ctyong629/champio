import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, ChevronRight, ChevronLeft, Upload, Trophy,
  Users, Calendar, MapPin, User, Palette, Swords, Target, 
  Image as ImageIcon, CircleDot, Flag, Hash, Gamepad2, Plus, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import type { SportType, ThemeType, TournamentFormat, EventWizardData, RouteType } from '@/types';

// 引入 Firebase 與 Auth 功能
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
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">賽事名稱 <span className="text-red-500">*</span></label>
          <input type="text" value={data.name} onChange={(e) => onChange({ name: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none" placeholder="例如：2026 台北週末籃球聯賽" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">運動項目</label>
          <div className="grid grid-cols-4 gap-3">
            {sportOptions.map((sport) => {
              const Icon = sport.icon;
              return (
                <motion.button key={sport.value} type="button" onClick={() => onChange({ sport: sport.value })} className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${data.sport === sport.value ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700 hover:border-slate-500'}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Icon className={`w-6 h-6 ${data.sport === sport.value ? 'text-orange-500' : 'text-slate-400'}`} />
                  <span className={`text-xs ${data.sport === sport.value ? 'text-orange-400' : 'text-slate-400'}`}>{sport.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-2"><Calendar className="w-4 h-4 inline mr-1" /> 開始日期</label><input type="date" value={data.startDate} onChange={(e) => onChange({ startDate: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-2"><Calendar className="w-4 h-4 inline mr-1" /> 結束日期</label><input type="date" value={data.endDate} onChange={(e) => onChange({ endDate: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
        </div>
        <div><label className="block text-sm font-medium text-slate-300 mb-2"><MapPin className="w-4 h-4 inline mr-1" /> 比賽地點</label><input type="text" value={data.location} onChange={(e) => onChange({ location: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500" placeholder="例如：台北市立體育館" /></div>
        <div><label className="block text-sm font-medium text-slate-300 mb-2"><User className="w-4 h-4 inline mr-1" /> 主辦單位</label><input type="text" value={data.organizer} onChange={(e) => onChange({ organizer: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500" placeholder="例如：中華籃球協會" /></div>
        <div><label className="block text-sm font-medium text-slate-300 mb-2">賽事簡介</label><textarea value={data.description} onChange={(e) => onChange({ description: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 resize-none" rows={3} placeholder="簡短描述您的賽事..." /></div>
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
      reader.onloadend = () => { onChange({ bannerImage: reader.result as string }); };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center"><Palette className="w-5 h-5 text-orange-500" /></div>
        <div><h3 className="text-xl font-bold text-white">步驟二：選擇佈景主題</h3><p className="text-sm text-slate-400">自訂您的賽事官網外觀</p></div>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2"><ImageIcon className="w-4 h-4 inline mr-1" /> Banner 圖片</label>
        <div onClick={() => fileInputRef.current?.click()} className="relative h-40 rounded-xl border-2 border-dashed border-slate-600 hover:border-orange-500 transition-colors cursor-pointer overflow-hidden bg-slate-900 flex items-center justify-center">
          {data.bannerImage ? <img src={data.bannerImage} alt="Banner" className="w-full h-full object-cover" /> : <div className="text-center"><Upload className="w-10 h-10 text-slate-500 mx-auto mb-2" /><p className="text-slate-400">點擊上傳 Banner</p></div>}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {themes.map((theme) => (
          <motion.div key={theme.id} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${data.theme === theme.id ? 'border-orange-500 bg-slate-900' : 'border-slate-700 hover:border-slate-500'}`} onClick={() => onChange({ theme: theme.id })} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <div className="h-24 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden" style={{ background: theme.gradient }}>
              <Trophy className="w-6 h-6 mx-auto mb-1" style={{ color: theme.primary }} />
              {data.theme === theme.id && <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-white" /></div>}
            </div>
            <p className="text-center text-white font-medium text-sm">{theme.name}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Step3Registration({ data, onChange }: { data: EventWizardData; onChange: (data: Partial<EventWizardData>) => void }) {
  const addDivision = () => {
    const newDivs = [...(data.divisions || []), { name: '', maxTeams: 16, fee: 3000 }];
    onChange({ divisions: newDivs });
  };

  const updateDivision = (index: number, field: string, value: any) => {
    const newDivs = [...(data.divisions || [])];
    newDivs[index] = { ...newDivs[index], [field]: value };
    onChange({ divisions: newDivs });
  };

  const removeDivision = (index: number) => {
    const newDivs = data.divisions.filter((_, i) => i !== index);
    onChange({ divisions: newDivs });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center"><Users className="w-5 h-5 text-orange-500" /></div>
        <div><h3 className="text-xl font-bold text-white">步驟三：報名與組別設定</h3><p className="text-sm text-slate-400">設定不同組別的名額與費用</p></div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2"><Calendar className="w-4 h-4 inline mr-1" /> 報名截止日期</label>
          <input type="date" value={data.registrationDeadline} onChange={(e) => onChange({ registrationDeadline: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500" />
        </div>

        <div className="flex justify-between items-center pt-4">
          <label className="text-sm font-bold text-orange-400 uppercase tracking-tighter flex items-center gap-2"><Users className="w-4 h-4" /> 賽事組別清單</label>
          <Button size="sm" variant="outline" onClick={addDivision} className="text-xs border-orange-500 text-orange-500"><Plus className="w-3 h-3 mr-1" /> 新增組別</Button>
        </div>

        <div className="space-y-3">
          {data.divisions?.map((div, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 space-y-3 relative">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-6">
                  <label className="text-[10px] text-slate-500 block mb-1">組別名稱</label>
                  <input value={div.name} onChange={(e) => updateDivision(idx, 'name', e.target.value)} className="w-full bg-transparent border-b border-slate-700 text-sm focus:border-orange-500 focus:outline-none text-white py-1" placeholder="例如：一般男子組" />
                </div>
                <div className="col-span-5 md:col-span-3">
                  <label className="text-[10px] text-slate-500 block mb-1">隊伍上限</label>
                  <input type="number" value={div.maxTeams} onChange={(e) => updateDivision(idx, 'maxTeams', parseInt(e.target.value))} className="w-full bg-transparent border-b border-slate-700 text-sm focus:border-orange-500 focus:outline-none text-white py-1 text-center" />
                </div>
                <div className="col-span-5 md:col-span-2">
                  <label className="text-[10px] text-slate-500 block mb-1">費用 ($)</label>
                  <input type="number" value={div.fee} onChange={(e) => updateDivision(idx, 'fee', parseInt(e.target.value))} className="w-full bg-transparent border-b border-slate-700 text-sm focus:border-orange-500 focus:outline-none text-white py-1 text-center" />
                </div>
                <div className="col-span-2 md:col-span-1 flex items-end justify-center">
                  {data.divisions.length > 1 && <button onClick={() => removeDivision(idx)} className="text-slate-600 hover:text-red-500"><Trash2 size={16} /></button>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step4TournamentRules({ data, onChange }: { data: EventWizardData; onChange: (data: Partial<EventWizardData>) => void }) {
  const [newCourt, setNewCourt] = useState('');
  const addCourt = () => { if (newCourt.trim() && !data.courts.includes(newCourt.trim())) { onChange({ courts: [...data.courts, newCourt.trim()] }); setNewCourt(''); } };
  const removeCourt = (court: string) => { onChange({ courts: data.courts.filter(c => c !== court) }); };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center"><Swords className="w-5 h-5 text-orange-500" /></div>
        <div><h3 className="text-xl font-bold text-white">步驟四：賽程與場地</h3><p className="text-sm text-slate-400">設定比賽賽制與可用場地</p></div>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3"><Target className="w-4 h-4 inline mr-1" /> 賽制類型</label>
          <div className="space-y-3">
            {tournamentFormats.map((f) => (
              <div key={f.value} onClick={() => onChange({ format: f.value })} className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${data.format === f.value ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700 hover:border-slate-500'}`}>
                <div className="flex items-center justify-between"><p className="font-bold text-white text-sm">{f.label}</p>{data.format === f.value && <CheckCircle2 className="w-4 h-4 text-orange-500" />}</div>
                <p className="text-xs text-slate-500 mt-1">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">比賽場地</label>
          <div className="flex gap-2"><input value={newCourt} onChange={(e) => setNewCourt(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addCourt()} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none" placeholder="場地名稱 (如：A場、1號桌)" /><Button onClick={addCourt} variant="secondary">新增</Button></div>
          <div className="flex flex-wrap gap-2 mt-3">{data.courts.map((c) => <span key={c} className="px-3 py-1 bg-slate-700 rounded-full text-xs text-white flex items-center gap-2">{c}<button onClick={() => removeCourt(c)} className="hover:text-red-400">×</button></span>)}</div>
        </div>
      </div>
    </div>
  );
}

function Step5Preview({ data, onFinish, isSubmitting }: { data: EventWizardData; onFinish: () => void; isSubmitting: boolean; }) {
  const selectedTheme = themes.find(t => t.id === data.theme);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div>
        <div><h3 className="text-xl font-bold text-white">步驟五：預覽與發布</h3><p className="text-sm text-slate-400">請核對賽事細節</p></div>
      </div>
      <Card className="overflow-hidden border-slate-700 bg-slate-800">
        <div className="h-32 relative" style={{ background: data.bannerImage ? `url(${data.bannerImage}) center/cover` : selectedTheme?.gradient }}>
          <div className="absolute inset-0 bg-black/40" /><div className="absolute bottom-4 left-4"><h2 className="text-xl font-bold text-white">{data.name}</h2><p className="text-xs text-white/70">{data.organizer}</p></div>
        </div>
        <div className="p-6 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-y-4">
            <div><p className="text-slate-500">日期</p><p className="text-white">{data.startDate} ~ {data.endDate}</p></div>
            <div><p className="text-slate-500">賽制</p><p className="text-white">{tournamentFormats.find(f => f.value === data.format)?.label}</p></div>
            
            <div className="col-span-2 pt-2 border-t border-slate-700">
              <p className="text-slate-500 mb-2">組別詳細資訊</p>
              <div className="space-y-2">
                {data.divisions?.map((div, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-900/50 p-2 rounded px-3 border border-slate-700/50">
                    <span className="text-white font-medium">{div.name || '未命名'}</span>
                    <div className="text-xs text-right"><span className="text-slate-400">上限：{div.maxTeams} 隊</span><br/><span className="text-orange-400 font-bold">${div.fee}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
      <Button className="w-full bg-orange-500 hover:bg-orange-600 h-14 text-lg font-black tracking-widest" onClick={onFinish} disabled={isSubmitting}>
        {isSubmitting ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3" />發布中...</> : <><CheckCircle2 className="w-5 h-5 mr-2" />確認並正式上線</>}
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
  name: '', sport: 'basketball', startDate: '', endDate: '', location: '', organizer: '', contactEmail: '', contactPhone: '', description: '',
  theme: 'dark', bannerImage: null,
  maxTeams: 16, registrationFee: 3000, registrationDeadline: '', minPlayersPerTeam: 5, maxPlayersPerTeam: 12, requirePayment: true, allowWaitlist: true,
  divisions: [{ name: '一般組', maxTeams: 16, fee: 3000 }],
  customFields: [], // 欄位留空，給 Dashboard 去擴充
  format: 'single_elimination', groups: 4, teamsPerGroup: 4, advanceCount: 2, courts: [], gameDuration: 30, breakDuration: 10,
};

export function EventWizard({ setRoute }: EventWizardProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<EventWizardData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  const { currentUser } = useAuth();

  const steps = [
    { id: 1, title: '基本資訊', icon: Trophy },
    { id: 2, title: '佈景主題', icon: Palette },
    { id: 3, title: '組別設定', icon: Users },
    { id: 4, title: '賽程規則', icon: Swords },
    { id: 5, title: '預覽發布', icon: CheckCircle2 },
  ];

  const handleDataChange = useCallback((newData: Partial<EventWizardData>) => { setData(prev => ({ ...prev, ...newData })); }, []);

  const validateStep = (stepNum: number): boolean => {
    if (stepNum === 1 && (!data.name.trim() || !data.startDate)) { addToast({ title: '請填寫賽事名稱與日期', variant: 'warning' }); return false; }
    if (stepNum === 3 && data.divisions.some(d => !d.name.trim())) { addToast({ title: '請填寫完整的組別名稱', variant: 'warning' }); return false; }
    if (stepNum === 4 && data.courts.length === 0) { addToast({ title: '請至少新增一個場地', variant: 'warning' }); return false; }
    return true;
  };

  const handleNext = () => { if (validateStep(step) && step < 5) setStep(step + 1); };
  const handlePrev = () => { if (step > 1) setStep(step - 1); };

  const handleFinish = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      let bannerUrl = null;
      if (data.bannerImage && data.bannerImage.startsWith('data:image')) {
        const bannerRef = ref(storage, `banners/${currentUser.uid}_${Date.now()}`);
        await uploadString(bannerRef, data.bannerImage, 'data_url');
        bannerUrl = await getDownloadURL(bannerRef);
      }

      // 🌟 計算總隊伍上限
      const totalMax = data.divisions.reduce((sum, d) => sum + (d.maxTeams || 0), 0);

      const eventDataToSave = {
        ...data,
        bannerImage: bannerUrl || data.bannerImage,
        maxTeams: totalMax, 
        organizerId: currentUser.uid,
        createdAt: serverTimestamp(),
        status: '報名中',
        teamsRegistered: 0,
        milestones: [
          { label: '報名開始', date: new Date().toISOString().split('T')[0], status: 'past' },
          { label: '報名截止', date: data.registrationDeadline, status: 'upcoming' },
          { label: '賽事開始', date: data.startDate, status: 'upcoming' }
        ]
      };

      await addDoc(collection(db, 'events'), eventDataToSave);
      addToast({ title: '賽事建立成功！', variant: 'success' });
      setRoute('dashboard'); 
    } catch (error: any) {
      console.error("🔥 發布失敗詳細原因：", error);
      addToast({ title: '發布失敗', variant: 'error' });
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto"> 
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">建立賽事官網</h1>
          <p className="text-slate-400 text-sm">完成五個步驟，讓您的賽事正式上線</p>
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-center relative">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${step >= s.id ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                    {step > s.id ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : <Icon className="w-4 h-4 md:w-5 md:h-5" />}
                  </div>
                  <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest hidden md:block ${step >= s.id ? 'text-orange-400' : 'text-slate-500'}`}>{s.title}</span>
                  {i < steps.length - 1 && <div className={`absolute top-5 md:top-6 left-1/2 w-full h-0.5 -z-10 ${step > s.id ? 'bg-orange-500' : 'bg-slate-800'}`} />}
                </div>
              );
            })}
          </div>
        </div>

        <Card className="p-4 md:p-8 bg-slate-800 border-slate-700 shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              {step === 1 && <Step1BasicInfo data={data} onChange={handleDataChange} />}
              {step === 2 && <Step2Theme data={data} onChange={handleDataChange} />}
              {step === 3 && <Step3Registration data={data} onChange={handleDataChange} />}
              {step === 4 && <Step4TournamentRules data={data} onChange={handleDataChange} />} 
              {step === 5 && <Step5Preview data={data} onFinish={handleFinish} isSubmitting={isSubmitting} />}
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 pt-8 border-t border-slate-700 flex justify-between">
            <Button variant="ghost" onClick={step === 1 ? () => setRoute('home') : handlePrev} className="text-slate-400 hover:text-white"><ChevronLeft className="w-4 h-4 mr-2" />{step === 1 ? '取消' : '上一步'}</Button>
            {step < 5 && <Button className="bg-orange-500 hover:bg-orange-600 px-8 font-bold" onClick={handleNext}>下一步 <ChevronRight className="w-4 h-4 ml-2" /></Button>}
          </div>
        </Card>
      </div>
    </div>
  );
}