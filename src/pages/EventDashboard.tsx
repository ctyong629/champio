import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Users, FileText, LayoutList, Trophy, 
  Zap, Shuffle, Medal, ChevronLeft, Plus, Type, 
  Hash, Mail, Phone, Calendar as CalendarIcon, 
  GripVertical, Settings, Trash2, Save, Send, Loader2,
  CheckCircle2, XCircle, Search, Edit2, X,
  AlignLeft, ListCollapse, CheckSquare, UploadCloud // 🌟 新增的進階表單圖示
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import type { RouteType } from '@/types';

// 引入 Firebase 核心功能
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// ============================================
// 子組件：總覽儀表板 (Overview)
// ============================================
function OverviewTab({ event }: { event: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">總覽儀表板</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-slate-900 border-slate-800 shadow-xl">
          <p className="text-slate-400 text-sm mb-2">已報名隊伍</p>
          <p className="text-4xl font-extrabold text-white">
            {event?.teamsRegistered || 0} <span className="text-lg text-slate-500 font-medium">/ {event?.maxTeams || 0}</span>
          </p>
        </Card>
        <Card className="p-6 bg-slate-900 border-slate-800 shadow-xl">
          <p className="text-slate-400 text-sm mb-2">待審核隊伍</p>
          <p className="text-4xl font-extrabold text-orange-500">0</p>
        </Card>
        <Card className="p-6 bg-slate-900 border-slate-800 shadow-xl">
          <p className="text-slate-400 text-sm mb-2">預計收入</p>
          <p className="text-4xl font-extrabold text-emerald-500">$0</p>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// 子組件：公告管理 (Announcement)
// ============================================
function AnnouncementTab() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSave = async (status: string) => {
    if (!title.trim() || !content.trim()) return addToast({ title: '請填寫完整資訊', variant: 'warning' });
    setIsSubmitting(true);
    setTimeout(() => {
      addToast({ title: status === 'published' ? '公告已發布' : '草稿已儲存', variant: 'success' });
      setTitle(''); setContent(''); setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">公告管理</h2>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <input type="text" placeholder="請輸入公告標題..." value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-transparent text-xl font-bold text-white placeholder:text-slate-500 border-none focus:outline-none focus:ring-0" />
        </div>
        <div className="flex flex-col h-[400px]">
          <div className="border-b border-slate-800 p-2 flex gap-4 bg-slate-900 text-slate-400 text-sm font-mono px-4">
             <span className="cursor-pointer hover:text-white font-bold">B</span>
             <span className="cursor-pointer hover:text-white italic">I</span>
             <span className="cursor-pointer hover:text-white line-through">S</span>
             <div className="w-px h-4 bg-slate-700 self-center" />
             <span className="cursor-pointer hover:text-white font-bold">H1</span>
             <span className="cursor-pointer hover:text-white font-bold">H2</span>
          </div>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="開始輸入內容..." className="flex-1 w-full bg-slate-900 p-4 text-slate-300 border-none focus:outline-none resize-none" />
        </div>
        <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex justify-between items-center">
          <span className="text-xs text-slate-500">{content.length} 字元</span>
          <div className="flex gap-3">
            <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={() => handleSave('draft')} disabled={isSubmitting}><Save className="w-4 h-4 mr-2"/> 儲存草稿</Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => handleSave('published')} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4 mr-2"/>} 正式發布</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 🌟 史詩級升級：表單建構器 (Form Builder)
// ============================================

// 擴充自訂欄位型別，加入 options 屬性以支援選單
interface ExtendedFormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[]; // 供單選、多選、下拉選單使用
}

const FIELD_TYPES = [
  // 基礎欄位
  { type: 'text', label: '短文字輸入', desc: '姓名、隊伍名等', icon: Type },
  { type: 'number', label: '數字欄位', desc: '球衣號碼、身高', icon: Hash },
  { type: 'email', label: '電子信箱', desc: '聯絡 Email', icon: Mail },
  { type: 'tel', label: '電話號碼', desc: '聯絡手機', icon: Phone },
  { type: 'date', label: '日期選擇', desc: '出生年月日', icon: CalendarIcon },
  // 進階欄位
  { type: 'textarea', label: '多行文字', desc: '經歷、備註說明', icon: AlignLeft },
  { type: 'select', label: '下拉選單', desc: '尺寸、組別選擇', icon: ListCollapse },
  { type: 'radio', label: '單選按鈕', desc: '是/否、葷/素等', icon: CheckCircle2 },
  { type: 'checkbox', label: '多選勾選', desc: '身分或同意聲明', icon: CheckSquare },
  { type: 'file', label: '檔案上傳', desc: '身分證、照片', icon: UploadCloud },
];

function FormBuilderTab({ event, refreshEvent }: { event: any, refreshEvent: () => void }) {
  const [fields, setFields] = useState<ExtendedFormField[]>(event?.customFields || []);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  const addField = (type: string, label: string) => {
    const needsOptions = ['select', 'radio', 'checkbox'].includes(type);
    const newField: ExtendedFormField = { 
      id: `f_${Date.now()}`, 
      type, 
      label, 
      required: true,
      ...(needsOptions ? { options: ['選項 1', '選項 2'] } : {}) // 如果是選單類型，預設給兩個選項
    };
    setFields([...fields, newField]);
    setActiveFieldId(newField.id);
  };
  
  const activeField = fields.find(f => f.id === activeFieldId);

  const updateActiveField = (updates: Partial<ExtendedFormField>) => {
    setFields(fields.map(f => f.id === activeFieldId ? { ...f, ...updates } : f));
  };

  const saveForm = async () => {
    if (!event?.id) return;
    setIsSaving(true);
    try {
      const eventRef = doc(db, 'events', event.id);
      await updateDoc(eventRef, { customFields: fields });
      addToast({ title: '報名表單已成功儲存！前台已同步更新', variant: 'success' });
      refreshEvent();
    } catch (error) {
      addToast({ title: '儲存失敗', variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">表單建構器</h2>
          <p className="text-sm text-slate-400">自訂前台報名表單，支援檔案上傳與多種輸入格式</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600" onClick={saveForm} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          儲存表單並同步前台
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900 p-4 rounded-xl border border-slate-800 flex-1 overflow-hidden">
        
        {/* 左側：欄位庫 (分成基礎與進階) */}
        <div className="md:col-span-3 border-r border-slate-800 pr-4 overflow-y-auto pb-8">
          <p className="font-bold text-white mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-orange-500"/> 新增欄位</p>
          <div className="space-y-2">
            {FIELD_TYPES.map((ft, idx) => (
              <div key={idx}>
                {idx === 0 && <p className="text-xs text-slate-500 mb-2 mt-1 font-bold tracking-widest uppercase">基礎欄位</p>}
                {idx === 5 && <p className="text-xs text-slate-500 mb-2 mt-6 font-bold tracking-widest uppercase">進階欄位</p>}
                <div onClick={() => addField(ft.type, ft.label)} className="p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-orange-500 flex items-center gap-3 group mb-2 transition-all hover:-translate-y-0.5">
                  <div className="p-2 bg-slate-800 rounded group-hover:text-orange-400"><ft.icon className="w-4 h-4"/></div>
                  <div><p className="text-sm text-white font-medium">{ft.label}</p><p className="text-[10px] text-slate-500">{ft.desc}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 中間：表單預覽區 */}
        <div className="md:col-span-6 flex flex-col overflow-y-auto pr-2 pb-8">
          <div className="flex justify-between mb-4"><h4 className="text-white font-bold">表單預覽</h4><span className="text-xs text-slate-500">{fields.length} 個欄位</span></div>
          <div className="space-y-3">
            {fields.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl"><LayoutList className="w-10 h-10 mb-2 opacity-50"/><p>點擊左側新增欄位</p></div>
            ) : fields.map(f => (
              <div key={f.id} onClick={() => setActiveFieldId(f.id)} className={`p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all ${activeFieldId === f.id ? 'border-orange-500 bg-slate-950 scale-[1.02] shadow-lg' : 'border-slate-800 bg-slate-900 hover:border-slate-600'}`}>
                <GripVertical className="w-5 h-5 text-slate-600" />
                <div className="flex-1">
                  <p className="text-white text-sm font-bold flex items-center gap-2">
                    {/* 動態顯示對應的 Icon */}
                    {FIELD_TYPES.find(t => t.type === f.type)?.icon && React.createElement(FIELD_TYPES.find(t => t.type === f.type)!.icon, { className: "w-4 h-4 text-orange-400" })}
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{FIELD_TYPES.find(t => t.type === f.type)?.label}</p>
                </div>
                {activeFieldId === f.id && <button onClick={(e) => { e.stopPropagation(); setFields(fields.filter(x => x.id !== f.id)); }} className="p-2"><Trash2 className="w-4 h-4 text-slate-500 hover:text-red-500 transition-colors"/></button>}
              </div>
            ))}
          </div>
        </div>

        {/* 右側：屬性設定區 */}
        <div className="md:col-span-3 border-l border-slate-800 pl-4 overflow-y-auto pr-2 pb-8">
          <p className="font-bold text-white mb-4 flex items-center gap-2"><Settings className="w-4 h-4 text-orange-500"/> 屬性設定</p>
          {activeField ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs text-slate-400">欄位標題</label>
                <input type="text" value={activeField.label} onChange={(e) => updateActiveField({ label: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none" />
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-sm text-white">必填欄位</span>
                <button onClick={() => updateActiveField({ required: !activeField.required })} className={`w-10 h-6 rounded-full transition-colors relative ${activeField.required ? 'bg-orange-500' : 'bg-slate-700'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${activeField.required ? 'left-5' : 'left-1'}`} />
                </button>
              </div>

              {/* 🌟 只有多選/單選/下拉 才顯示「選項設定」 */}
              {['select', 'radio', 'checkbox'].includes(activeField.type) && (
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <label className="text-xs text-slate-400 block mb-2">編輯選項內容</label>
                  <div className="space-y-2">
                    {(activeField.options || []).map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...(activeField.options || [])];
                            newOptions[idx] = e.target.value;
                            updateActiveField({ options: newOptions });
                          }}
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm focus:border-orange-500 focus:outline-none"
                        />
                        <button onClick={() => {
                           const newOptions = activeField.options?.filter((_, i) => i !== idx);
                           updateActiveField({ options: newOptions });
                        }} className="text-slate-500 hover:text-red-500"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full text-xs border-slate-700 border-dashed text-slate-400 hover:text-orange-500 mt-2" onClick={() => {
                      updateActiveField({ options: [...(activeField.options || []), `選項 ${(activeField.options?.length || 0) + 1}`] });
                    }}>
                      <Plus className="w-3 h-3 mr-1" /> 新增選項
                    </Button>
                  </div>
                </div>
              )}
              
              {/* 如果是圖片上傳，顯示提示 */}
              {activeField.type === 'file' && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-blue-300">此欄位允許參賽者上傳圖片或 PDF 檔案。檔案將安全儲存於雲端空間，主辦方可於後台直接預覽或下載。</p>
                </div>
              )}

            </div>
          ) : <div className="text-center mt-20 text-slate-600 text-sm">點擊中間的欄位來編輯屬性</div>}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 子組件：報名管理 (真實串接 Firebase)
// ============================================
function RegistrationTab({ event }: { event: any }) {
  const { addToast } = useToast();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. 抓取該賽事的所有報名資料
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!event?.id) return;
      try {
        const q = query(collection(db, 'registrations'), where('eventId', '==', event.id));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRegistrations(data);
      } catch (error) {
        console.error("載入報名資料失敗", error);
        addToast({ title: '載入報名資料失敗', variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [event]);

  // 2. 更新核准 / 退回 狀態至 Firebase
  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'registrations', id), { status });
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      addToast({ title: `已變更為${status === 'approved' ? '審核通過' : '已退件'}`, variant: 'success' });
    } catch (error) {
      addToast({ title: '更新狀態失敗', variant: 'error' });
    }
  };

  // 3. 更新繳費狀態至 Firebase
  const togglePayment = async (id: string, currentPaid: boolean) => {
    try {
      await updateDoc(doc(db, 'registrations', id), { paid: !currentPaid });
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, paid: !currentPaid } : r));
      addToast({ title: '繳費狀態已更新', variant: 'success' });
    } catch (error) {
      addToast({ title: '更新繳費狀態失敗', variant: 'error' });
    }
  };

  const filteredRegs = registrations.filter(r => 
    r.teamName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-500" /> 報名管理
          </h2>
          <p className="text-sm text-slate-400">審核真實隊伍資料與追蹤繳費狀況</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="搜尋隊伍..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-orange-500 focus:outline-none w-64" 
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
        ) : filteredRegs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Users className="w-12 h-12 mb-4 opacity-20" />
            <p>目前尚無隊伍報名</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4 font-medium">隊伍名稱</th>
                <th className="p-4 font-medium">附加報名資料</th>
                <th className="p-4 font-medium">審核狀態</th>
                <th className="p-4 font-medium">繳費狀態</th>
                <th className="p-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredRegs.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-bold text-white">{reg.teamName}</td>
                  
                  {/* 🌟 動態顯示球員填寫的自訂表單答案，如果答案是圖片網址，轉換成可點擊的連結 */}
                  <td className="p-4 text-slate-300 text-xs">
                    {reg.customAnswers && Object.keys(reg.customAnswers).length > 0 ? (
                      <div className="space-y-1.5">
                        {Object.entries(reg.customAnswers).map(([fieldId, answer]) => {
                          const fieldConfig = event?.customFields?.find((f: any) => f.id === fieldId);
                          const label = fieldConfig ? fieldConfig.label : fieldId;
                          const answerStr = String(answer);
                          
                          // 判斷是否為檔案網址 (通常 Firebase Storage 的網址包含 firebasestorage)
                          const isFileUrl = answerStr.startsWith('http') && answerStr.includes('firebasestorage');

                          return (
                            <div key={fieldId} className="flex gap-2">
                              <span className="text-slate-500 shrink-0">{label}:</span> 
                              {isFileUrl ? (
                                <a href={answerStr} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded underline decoration-blue-500/50 w-fit">
                                  <UploadCloud className="w-3 h-3" /> 點擊查看檔案
                                </a>
                              ) : (
                                <span className="text-orange-200">{answerStr}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-slate-600">無附加資料</span>
                    )}
                  </td>

                  <td className="p-4">
                    {reg.status === 'approved' 
                      ? <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded text-xs"><CheckCircle2 className="w-3 h-3"/> 已通過</span>
                      : reg.status === 'rejected'
                      ? <span className="inline-flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-1 rounded text-xs"><XCircle className="w-3 h-3"/> 已退回</span>
                      : <span className="inline-flex items-center gap-1 text-orange-400 bg-orange-400/10 px-2 py-1 rounded text-xs"><Activity className="w-3 h-3"/> 待審核</span>
                    }
                  </td>
                  <td className="p-4">
                    <button onClick={() => togglePayment(reg.id, reg.paid)} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors border ${reg.paid ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-slate-400 border-slate-700 bg-slate-800 hover:border-orange-500'}`}>
                      $ {reg.paid ? '已繳費' : '未繳費'}
                    </button>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {reg.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(reg.id, 'approved')} className="p-2 text-emerald-500 hover:bg-emerald-500/20 rounded transition-colors" title="核准"><CheckCircle2 className="w-4 h-4"/></button>
                        <button onClick={() => updateStatus(reg.id, 'rejected')} className="p-2 text-red-500 hover:bg-red-500/20 rounded transition-colors" title="退件"><XCircle className="w-4 h-4"/></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============================================
// 子組件：互動式賽程樹狀圖 (Interactive Bracket)
// ============================================
function BracketTab() {
  const { addToast } = useToast();
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [score1Input, setScore1Input] = useState('');
  const [score2Input, setScore2Input] = useState('');

  type MatchType = { id: number; team1: string; score1: number | null; team2: string; score2: number | null; winner: 1 | 2 | null; };
  type StageType = { round: string; matches: MatchType[]; };

  const [bracket, setBracket] = useState<StageType[]>([
    {
      round: '八強賽',
      matches: [
        { id: 1, team1: '台大戰神', score1: null, team2: '政大黑熊', score2: null, winner: null },
        { id: 2, team1: '師大飛鷹', score1: null, team2: '輔大雄獅', score2: null, winner: null },
        { id: 3, team1: '交大狂虎', score1: null, team2: '清大野狼', score2: null, winner: null },
        { id: 4, team1: '成大水手', score1: null, team2: '中央騎士', score2: null, winner: null },
      ]
    },
    {
      round: '四強賽',
      matches: [
        { id: 5, team1: 'TBD', score1: null, team2: 'TBD', score2: null, winner: null },
        { id: 6, team1: 'TBD', score1: null, team2: 'TBD', score2: null, winner: null },
      ]
    },
    {
      round: '冠軍賽',
      matches: [
        { id: 7, team1: 'TBD', score1: null, team2: 'TBD', score2: null, winner: null },
      ]
    }
  ]);

  const openScoreModal = (roundIndex: number, matchIndex: number, match: any) => {
    if (match.team1 === 'TBD' || match.team2 === 'TBD') return;
    setSelectedMatch({ roundIndex, matchIndex, ...match });
    setScore1Input(match.score1?.toString() || '');
    setScore2Input(match.score2?.toString() || '');
  };

  const handleScoreSubmit = () => {
    if (!selectedMatch) return;
    const { roundIndex, matchIndex } = selectedMatch;
    const s1 = parseInt(score1Input);
    const s2 = parseInt(score2Input);

    if (isNaN(s1) || isNaN(s2) || s1 === s2) {
      addToast({ title: '請輸入有效且不平手的比分', variant: 'warning' });
      return;
    }

    const newBracket = [...bracket];
    const match = newBracket[roundIndex].matches[matchIndex];
    match.score1 = s1;
    match.score2 = s2;
    match.winner = s1 > s2 ? 1 : 2;

    if (roundIndex < newBracket.length - 1) {
      const nextRound = newBracket[roundIndex + 1];
      const nextMatchIndex = Math.floor(matchIndex / 2);
      const isTeam1 = matchIndex % 2 === 0;
      const advancingTeam = match.winner === 1 ? match.team1 : match.team2;

      if (isTeam1) {
        nextRound.matches[nextMatchIndex].team1 = advancingTeam;
      } else {
        nextRound.matches[nextMatchIndex].team2 = advancingTeam;
      }
    }

    setBracket(newBracket);
    setSelectedMatch(null);
    addToast({ title: '比分已更新，隊伍成功晉級！', variant: 'success' });
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-orange-500" /> 賽程樹狀圖
          </h2>
          <p className="text-sm text-slate-400">點擊卡片輸入比分，系統將自動晉級獲勝隊伍</p>
        </div>
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-8 overflow-x-auto">
        <div className="flex gap-16 min-w-max h-full">
          {bracket.map((stage, roundIndex) => (
            <div key={roundIndex} className="flex flex-col w-64 shrink-0">
              <h3 className="text-center text-sm font-black tracking-widest text-slate-500 uppercase mb-8">{stage.round}</h3>
              <div className="flex-1 flex flex-col justify-around relative">
                {stage.matches.map((match, matchIndex) => (
                  <div key={match.id} className="relative group">
                    {roundIndex < bracket.length - 1 && <div className="absolute top-1/2 -right-8 w-8 h-[2px] bg-slate-700" />}
                    {roundIndex > 0 && <div className="absolute top-1/2 -left-8 w-8 h-[2px] bg-slate-700" />}
                    {roundIndex < bracket.length - 1 && matchIndex % 2 === 0 && <div className="absolute top-1/2 -right-8 w-[2px] h-[calc(50%+2rem)] bg-slate-700" />}
                    {roundIndex < bracket.length - 1 && matchIndex % 2 === 1 && <div className="absolute bottom-1/2 -right-8 w-[2px] h-[calc(50%+2rem)] bg-slate-700" />}

                    <div 
                      onClick={() => openScoreModal(roundIndex, matchIndex, match)}
                      className={`relative z-10 rounded-lg overflow-hidden border transition-all duration-300 shadow-lg cursor-pointer
                      ${match.winner ? 'border-slate-700 bg-slate-950' : 'border-slate-800 bg-slate-900/50 hover:border-orange-500 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]'}
                      ${roundIndex === bracket.length - 1 ? 'border-orange-500/50' : ''}
                    `}>
                      <div className={`flex justify-between items-center px-4 py-3 border-b border-slate-800/50 ${match.winner === 1 ? 'bg-orange-500/10' : ''}`}>
                        <span className={`text-sm font-bold ${match.winner === 1 ? 'text-orange-400' : 'text-slate-300'}`}>{match.team1}</span>
                        <span className={`text-lg font-black ${match.winner === 1 ? 'text-orange-400' : 'text-slate-500'}`}>{match.score1 ?? '-'}</span>
                      </div>
                      <div className={`flex justify-between items-center px-4 py-3 ${match.winner === 2 ? 'bg-orange-500/10' : ''}`}>
                        <span className={`text-sm font-bold ${match.winner === 2 ? 'text-orange-400' : 'text-slate-300'}`}>{match.team2}</span>
                        <span className={`text-lg font-black ${match.winner === 2 ? 'text-orange-400' : 'text-slate-500'}`}>{match.score2 ?? '-'}</span>
                      </div>
                      
                      {match.team1 !== 'TBD' && match.team2 !== 'TBD' && !match.winner && (
                        <div className="absolute inset-0 bg-orange-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                          <Edit2 className="w-4 h-4 mr-2" /> 輸入比分
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="flex flex-col w-32 shrink-0 justify-center items-center pl-8">
            <div className={`w-24 h-24 rounded-full p-1 transition-all duration-1000 ${bracket[2].matches[0].winner ? 'bg-gradient-to-tr from-orange-600 to-yellow-400 shadow-[0_0_40px_rgba(249,115,22,0.6)] scale-110' : 'bg-slate-800 grayscale'}`}>
              <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center">
                <Trophy className={`w-8 h-8 mb-1 ${bracket[2].matches[0].winner ? 'text-yellow-500' : 'text-slate-600'}`} />
                <span className={`text-[10px] font-bold tracking-widest ${bracket[2].matches[0].winner ? 'text-yellow-500' : 'text-slate-600'}`}>CHAMPION</span>
              </div>
            </div>
            {bracket[2].matches[0].winner && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center">
                <p className="text-orange-400 font-black text-xl">
                  {bracket[2].matches[0].winner === 1 ? bracket[2].matches[0].team1 : bracket[2].matches[0].team2}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedMatch && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedMatch(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl w-96 z-10">
              <button onClick={() => setSelectedMatch(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
              <h3 className="text-lg font-bold text-white mb-6 text-center">記錄比賽結果</h3>
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm font-bold text-white">{selectedMatch.team1}</span>
                  <input type="number" value={score1Input} onChange={(e) => setScore1Input(e.target.value)} className="w-20 h-16 text-center text-2xl font-black bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-orange-500 focus:outline-none" placeholder="0" autoFocus />
                </div>
                <span className="text-slate-500 font-black text-xl">VS</span>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm font-bold text-white">{selectedMatch.team2}</span>
                  <input type="number" value={score2Input} onChange={(e) => setScore2Input(e.target.value)} className="w-20 h-16 text-center text-2xl font-black bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-orange-500 focus:outline-none" placeholder="0" />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {/* 🌟 記錄台入口：點擊後在新分頁打開 /scorekeeper */}
                <Button 
                  variant="outline" 
                  className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 h-12 text-md font-bold tracking-wide"
                  onClick={() => window.open('/scorekeeper', '_blank')}
                >
                  📡 啟動即時記錄台 (另開視窗)
                </Button>
                
                <div className="flex items-center gap-4 my-2">
                  <div className="h-px bg-slate-800 flex-1" />
                  <span className="text-xs text-slate-500">或</span>
                  <div className="h-px bg-slate-800 flex-1" />
                </div>

                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-lg font-bold h-12" onClick={handleScoreSubmit}>
                  手動輸入並晉級
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// 主組件：Event Dashboard
// ============================================
export function EventDashboard({ setRoute }: { setRoute: (route: RouteType) => void }) {
  const [activeTab, setActiveTab] = useState('overview'); 
  const { currentUser } = useAuth();
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMyEvent = async () => {
    if (!currentUser) return;
    try {
      const q = query(collection(db, 'events'), where('organizerId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docData = snapshot.docs[0];
        setCurrentEvent({ id: docData.id, ...docData.data() });
      }
    } catch (error) {
      console.error("載入賽事失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvent();
  }, [currentUser]);

  const MENU_ITEMS = [
    { id: 'overview', label: '總覽儀表板', icon: Activity },
    { id: 'registration', label: '報名管理', icon: Users },
    { id: 'announcement', label: '公告管理', icon: FileText },
    { id: 'form', label: '表單建構器', icon: LayoutList },
    { id: 'bracket', label: '賽程樹狀圖', icon: Trophy },
    { id: 'schedule', label: '自動排程', icon: Zap },
    { id: 'draw', label: '線上抽籤', icon: Shuffle },
    { id: 'ranking', label: '獎牌排名', icon: Medal },
  ];

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>;

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      
      {/* 側邊導覽列 */}
      <aside className="w-64 bg-[#0a0f1c] border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800/50">
          <button onClick={() => setRoute('home')} className="text-slate-500 hover:text-white flex items-center gap-1 text-xs mb-6 transition-colors">
            <ChevronLeft className="w-3 h-3" /> 返回首頁
          </button>
          <p className="text-xs text-slate-500 font-black tracking-widest mb-1 uppercase">{currentEvent?.sport || 'SPORT'}</p>
          <h1 className="text-2xl font-bold text-white tracking-wide truncate">{currentEvent?.name || '尚未建立賽事'}</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium text-sm
                  ${isActive 
                    ? 'bg-[#221714] text-orange-500 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 右側主要內容區 */}
      <main className="flex-1 overflow-y-auto p-8 md:p-10 bg-slate-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'overview' && <OverviewTab event={currentEvent} />}
            {/* 🌟 傳入 event 讓報名管理能抓取該賽事的名單 */}
            {activeTab === 'registration' && <RegistrationTab event={currentEvent} />}
            {activeTab === 'announcement' && <AnnouncementTab />}
            {activeTab === 'form' && <FormBuilderTab event={currentEvent} refreshEvent={fetchMyEvent} />}
            {activeTab === 'bracket' && <BracketTab />}
            
            {['schedule', 'draw', 'ranking'].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
                <LayoutList className="w-16 h-16 mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-slate-400">模組開發中</h3>
                <p className="text-sm mt-2">此功能將在下一階段開放</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}