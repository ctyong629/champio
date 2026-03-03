import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Users, FileText, LayoutList, Trophy, 
  Zap, Shuffle, Medal, ChevronLeft, Plus, Type, 
  Hash, Mail, Phone, Calendar as CalendarIcon, 
  GripVertical, Settings, Trash2, Save, Send, Loader2,
  CheckCircle2, XCircle, Search, Edit2, X,
  AlignLeft, ListCollapse, CheckSquare, UploadCloud
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import type { RouteType } from '@/types';

// 引入 Firebase 核心功能
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// 🌟 引入你的超強賽程表元件 
// (注意：如果你的 TournamentBracket 放在 pages 資料夾，請把 @/components 改成 @/pages)
import { TournamentBracket } from '@/components/TournamentBracket';

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
// 子組件：表單建構器 (Form Builder)
// ============================================
interface ExtendedFormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
}

const FIELD_TYPES = [
  { type: 'text', label: '短文字輸入', desc: '姓名、隊伍名等', icon: Type },
  { type: 'number', label: '數字欄位', desc: '球衣號碼、身高', icon: Hash },
  { type: 'email', label: '電子信箱', desc: '聯絡 Email', icon: Mail },
  { type: 'tel', label: '電話號碼', desc: '聯絡手機', icon: Phone },
  { type: 'date', label: '日期選擇', desc: '出生年月日', icon: CalendarIcon },
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
      ...(needsOptions ? { options: ['選項 1', '選項 2'] } : {})
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
        
        {/* 左側：欄位庫 */}
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
// 子組件：報名管理 (Registration)
// ============================================
function RegistrationTab({ event }: { event: any }) {
  const { addToast } = useToast();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'registrations', id), { status });
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      addToast({ title: `已變更為${status === 'approved' ? '審核通過' : '已退件'}`, variant: 'success' });
    } catch (error) {
      addToast({ title: '更新狀態失敗', variant: 'error' });
    }
  };

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
                  
                  <td className="p-4 text-slate-300 text-xs">
                    {reg.customAnswers && Object.keys(reg.customAnswers).length > 0 ? (
                      <div className="space-y-1.5">
                        {Object.entries(reg.customAnswers).map(([fieldId, answer]) => {
                          const fieldConfig = event?.customFields?.find((f: any) => f.id === fieldId);
                          const label = fieldConfig ? fieldConfig.label : fieldId;
                          const answerStr = String(answer);
                          
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
// 子組件：互動式賽程樹狀圖 (串接真實資料版)
// ============================================
function BracketTab({ event }: { event: any }) {
  const [teams, setTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!event?.id) return;
      try {
        // 🌟 只抓取該賽事「已審核通過 (approved)」的報名隊伍
        const q = query(
          collection(db, 'registrations'),
          where('eventId', '==', event.id),
          where('status', '==', 'approved')
        );
        const snap = await getDocs(q);
        
        // 把撈回來的資料轉換成純文字的隊伍名稱陣列
        const teamNames = snap.docs.map(doc => doc.data().teamName);

        // 如果目前報名通過的隊伍少於 2 隊，塞入預設文字避免畫面太空
        if (teamNames.length < 2) {
          setTeams(['等待隊伍加入...', '等待隊伍加入...']);
        } else {
          setTeams(teamNames);
        }
      } catch (error) {
        console.error("載入隊伍失敗", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [event]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] w-full relative">
      {/* 🌟 召喚你的超強元件，並把真實的隊伍名單餵給它！ */}
      <TournamentBracket teams={teams} bracketType="single" />
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
            {activeTab === 'registration' && <RegistrationTab event={currentEvent} />}
            {activeTab === 'announcement' && <AnnouncementTab />}
            {activeTab === 'form' && <FormBuilderTab event={currentEvent} refreshEvent={fetchMyEvent} />}
            {/* 🌟 修改此處，將 event 傳入 BracketTab */}
            {activeTab === 'bracket' && <BracketTab event={currentEvent} />}
            
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