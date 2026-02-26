import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Trophy, Users, Calendar, CreditCard, Bell,
  TrendingUp, Edit3, Camera, Plus,
  Phone, MapPin,  Loader2,  X, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RouteType } from '@/App';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';

import { doc, getDoc, setDoc, collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

// ============================================
// Constants & Mock Data
// ============================================

const SPORT_OPTIONS = ['籃球', '排球', '棒球', '羽球', '桌球', '足球', '網球', '其他'];

const MOCK_STATS = { totalEvents: 12, upcomingEvents: 3, teamsManaged: 2, winRate: 68 };


// ============================================
// Overview Tab (個人資料)
// ============================================
function OverviewTab({ stats }: { stats: typeof MOCK_STATS }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', location: '', bio: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          setEditForm({
            name: data.name || '', phone: data.phone || '', location: data.location || '', bio: data.bio || ''
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'users', currentUser.uid);
      await setDoc(docRef, editForm, { merge: true });
      setProfile((prev: any) => ({ ...prev, ...editForm }));
      setIsEditing(false);
      addToast({ title: '個人資料已更新', variant: 'success' });
    } catch (error) {
      addToast({ title: '儲存失敗', variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setIsSaving(true);
    addToast({ title: '圖片上傳中...', variant: 'info' });
    try {
      const storageRef = ref(storage, `avatars/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await setDoc(doc(db, 'users', currentUser.uid), { avatarUrl: url }, { merge: true });
      setProfile((prev: any) => ({ ...prev, avatarUrl: url }));
      addToast({ title: '大頭貼上傳成功！', variant: 'success' });
    } catch (error) {
      addToast({ title: '上傳失敗', variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-slate-800 border-slate-700">
        <div className="flex items-start gap-6">
          <div className="relative shrink-0 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarUpload} />
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-3xl font-bold text-white uppercase shadow-lg overflow-hidden relative">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile.name ? profile.name[0] : 'U'
              )}
              {isSaving && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-colors border-2 border-slate-800 z-10">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white truncate">{profile.name}</h3>
                <p className="text-slate-400 truncate">{currentUser?.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="border-slate-700 text-slate-300">
                <Edit3 className="w-4 h-4 mr-1" /> 編輯
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {profile.phone || '未填寫'}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {profile.location || '未填寫'}</span>
            </div>
            <p className="mt-4 text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">{profile.bio}</p>
          </div>
        </div>
      </Card>

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

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl">
              <div className="p-4 border-b border-slate-800 flex justify-between">
                <h3 className="text-lg font-bold text-white">編輯個人資料</h3>
                <button onClick={() => setIsEditing(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <Label className="text-slate-300">顯示名稱</Label>
                  <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="bg-slate-950 border-slate-800 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">電話</Label>
                    <Input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="bg-slate-950 border-slate-800 text-white" />
                  </div>
                  <div>
                    <Label className="text-slate-300">地區</Label>
                    <Input value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} className="bg-slate-950 border-slate-800 text-white" />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">簡介</Label>
                  <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full h-24 p-3 bg-slate-950 border border-slate-800 rounded-md text-white resize-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 bg-slate-900/50 border-t border-slate-800">
                <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-slate-300">取消</Button>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSave} disabled={isSaving}>儲存</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// My Teams Tab (隊伍管理)
// ============================================
function MyTeamsTab() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamSport, setNewTeamSport] = useState('籃球');

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState({
    id: '', name: '', number: '', shirtSize: 'L', pantsSize: 'L', phone: '', role: '隊員'
  });

  const fetchTeams = useCallback(async () => {
    if (!currentUser) return;
    try {
      const q = query(collection(db, 'teams'), where('captainId', '==', currentUser.uid));
      const snap = await getDocs(q);
      setTeams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim() || !currentUser) return;
    try {
      await addDoc(collection(db, 'teams'), {
        name: newTeamName,
        sport: newTeamSport,
        captainId: currentUser.uid,
        captainEmail: currentUser.email,
        createdAt: new Date().toISOString(),
        members: [{ id: currentUser.uid, name: currentUser.email?.split('@')[0], role: '隊長', number: '00', shirtSize: 'L', pantsSize: 'L', phone: '' }],
        eventCount: 0,
        winRate: 0
      });
      addToast({ title: '隊伍建立成功！', variant: 'success' });
      setIsCreating(false);
      setNewTeamName('');
      fetchTeams();
    } catch (e) {
      addToast({ title: '建立失敗', variant: 'error' });
    }
  };

  const handleSaveMember = async (team: any) => {
    if (!memberForm.name) return addToast({ title: '請填寫姓名', variant: 'error' });
    try {
      const teamRef = doc(db, 'teams', team.id);
      let updatedMembers = [...(team.members || [])];
      if (memberForm.id) {
        updatedMembers = updatedMembers.map(m => m.id === memberForm.id ? memberForm : m);
      } else {
        updatedMembers.push({ ...memberForm, id: Date.now().toString() });
      }
      await updateDoc(teamRef, { members: updatedMembers });
      addToast({ title: '隊員資訊已儲存', variant: 'success' });
      setEditingTeamId(null);
      fetchTeams();
    } catch (e) {
      addToast({ title: '儲存失敗', variant: 'error' });
    }
  };

  const deleteMember = async (team: any, memberId: string) => {
    if (!confirm('確定要刪除此隊員嗎？')) return;
    const updatedMembers = team.members.filter((m: any) => m.id !== memberId);
    await updateDoc(doc(db, 'teams', team.id), { members: updatedMembers });
    fetchTeams();
  };

  if (isLoading) return <div className="py-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">我的隊伍</h3>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setIsCreating(!isCreating)}>
          <Plus className="w-4 h-4 mr-1" /> 建立隊伍
        </Button>
      </div>

      {isCreating && (
        <Card className="p-4 bg-slate-800 border-orange-500/50 flex flex-wrap gap-4 items-end mb-4">
          <div className="flex-1 space-y-2">
            <Label className="text-slate-300">新隊伍名稱</Label>
            <Input value={newTeamName} onChange={e => setNewTeamName(e.target.value)} className="bg-slate-950 border-slate-700 text-white" />
          </div>
          <div className="w-40 space-y-2">
            <Label className="text-slate-300">運動類別</Label>
            <Select value={newTeamSport} onValueChange={setNewTeamSport}>
              <SelectTrigger className="bg-slate-950 text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-slate-900 text-white">
                {SPORT_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" onClick={() => setIsCreating(false)} className="text-white">取消</Button>
          <Button className="bg-orange-500" onClick={handleCreateTeam}>建立</Button>
        </Card>
      )}

      {teams.map(team => (
        <Card key={team.id} className="p-6 bg-slate-800 border-slate-700">
          <div className="flex justify-between items-start mb-6 border-b border-slate-700/50 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-2xl font-bold text-white">{team.name}</h4>
                <Badge className="bg-blue-500/20 text-blue-400">{team.sport}</Badge>
              </div>
              <p className="text-sm text-slate-400 mt-2">{team.members?.length} 位成員 · 勝率 {team.winRate}%</p>
            </div>
            <Button variant="outline" className="border-slate-600 text-white" onClick={() => {
              setEditingTeamId(team.id);
              setMemberForm({ id: '', name: '', number: '', shirtSize: 'L', pantsSize: 'L', phone: '', role: '隊員' });
            }}>新增隊員</Button>
          </div>

          <AnimatePresence>
            {editingTeamId === team.id && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-6 bg-slate-900 border border-orange-500/30 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label className="text-slate-300">姓名</Label><Input value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} className="bg-slate-950 text-white" /></div>
                <div className="space-y-2"><Label className="text-slate-300">背號</Label><Input type="number" value={memberForm.number} onChange={e => setMemberForm({...memberForm, number: e.target.value})} className="bg-slate-950 text-white" /></div>
                <div className="space-y-2"><Label className="text-slate-300">電話</Label><Input value={memberForm.phone} onChange={e => setMemberForm({...memberForm, phone: e.target.value})} className="bg-slate-950 text-white" /></div>
                <Button className="md:col-start-3 bg-emerald-600" onClick={() => handleSaveMember(team)}>儲存</Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {team.members?.map((m: any) => (
              <div key={m.id} className="p-4 bg-slate-900 rounded-lg border border-slate-700 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-orange-500 font-bold">{m.number}</div>
                  <div><p className="text-white font-bold">{m.name}</p><p className="text-slate-400 text-xs">{m.shirtSize}/{m.pantsSize}</p></div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => { setEditingTeamId(team.id); setMemberForm(m); }}><Edit3 className="w-4 h-4 text-slate-400" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMember(team, m.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// 其他 Mock 頁籤
function HostedEventsTab() { return <div className="text-slate-400">尚未舉辦賽事</div>; }
function PaymentRecordsTab() { return <div className="text-slate-400">無紀錄</div>; }
function NotificationsTab() { return <div className="text-slate-400">無通知</div>; }

// ============================================
// Main Member Center Component
// ============================================
export function MemberCenter({ setRoute }: { setRoute: (route: RouteType) => void }) {
  const [activeTab, setActiveTab] = useState('overview'); // 只保留一個狀態
  const { logout, userRole } = useAuth();

  const tabs = [
    { id: 'overview', label: '個人總覽', icon: User },
    { id: 'teams', label: '我的隊伍', icon: Users },
    ...(userRole === 'organizer' || userRole === 'admin' ? [{ id: 'hosted', label: '舉辦的賽事', icon: Calendar }] : []),
    { id: 'payments', label: '繳費紀錄', icon: CreditCard },
    { id: 'notifications', label: '通知中心', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div><h1 className="text-3xl font-bold text-white">會員中心</h1></div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setRoute('home')} className="border-slate-700 text-white">返回首頁</Button>
            <Button variant="destructive" onClick={async () => { await logout(); setRoute('home'); }}>登出</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1 bg-slate-800 border-slate-700 p-2 h-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeTab === tab.id ? 'bg-orange-500/10 text-orange-500' : 'text-slate-400 hover:bg-slate-700'}`}
              >
                <tab.icon className="w-5 h-5" /><span>{tab.label}</span>
              </button>
            ))}
          </Card>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {activeTab === 'overview' && <OverviewTab stats={MOCK_STATS} />}
                {activeTab === 'teams' && <MyTeamsTab />}
                {activeTab === 'hosted' && <HostedEventsTab />}
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