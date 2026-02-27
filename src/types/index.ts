// ============================================
// Champio TypeScript Type Definitions
// ============================================

// --- Enums & Literals ---

export type SportType = 'basketball' | 'volleyball' | 'soccer' | 'softball' | 'badminton' | 'tabletennis' | 'beachvolleyball' | 'other';

export type EventStatus = '報名中' | '進行中' | '籌備中' | '已結束';

export type TeamStatus = '審核通過' | '待審核' | '資料不全' | '候補中' | '已退賽' | 'approved' | 'pending' | 'rejected';

export type UserRole = 'admin' | 'organizer' | 'captain' | 'scorekeeper' | 'viewer';

export type AnnouncementStatus = '已發布' | '草稿' | '已下架' | 'published' | 'draft';

export type ThemeType = 'dark' | 'orange' | 'blue' | 'minimal';

// --- Base Interfaces ---

// 🌟 賽事公告型別 (修復 TS2305 錯誤)
export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  status?: AnnouncementStatus;
  authorId?: string;
  pinned?: boolean;
}

// 賽事組別型別
export interface EventDivision {
  name: string;
  maxTeams: number;
  fee: number;
  registered?: number; 
  confirmed?: number;  
}

// 賽事里程碑型別
export interface EventMilestone {
  label: string;
  date: any; 
  status: 'past' | 'upcoming';
}

export interface Event {
  id: string; 
  name: string;        // 統一使用 name，對應導出工具的修正
  sport: string;
  startDate: string;
  endDate: string;
  location: string;
  organizer: string;
  organizerId?: string; 
  status: EventStatus;
  teamsRegistered: number; 
  maxTeams: number;
  bannerColor?: string;
  bannerImage?: string | null; 
  description: string;
  divisions?: EventDivision[]; 
  milestones?: EventMilestone[]; 
  customFields?: CustomFormField[]; 
  createdAt?: any;
  updatedAt?: any;
}

export interface Team {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email?: string;
  status: TeamStatus;
  paid: boolean;
  captainId?: string;
  paymentAmount?: number;
  paymentDate?: string;
  registeredAt?: any; 
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  name: string;
  jerseyNumber?: number | string;
  position?: string;
  isCaptain: boolean;
}

// --- 🌟 Form Builder 進階型別 (支援圖片與選單) ---

export type FormFieldType = 
  | 'text' 
  | 'number' 
  | 'email' 
  | 'tel' 
  | 'date' 
  | 'textarea' 
  | 'select' 
  | 'radio' 
  | 'checkbox' 
  | 'file'; // 🌟 確保包含圖片上傳

export interface CustomFormField {
  id: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  options?: string[]; // 🌟 供下拉選單、單選、多選使用
}

// --- 🌟 AppContext 狀態型別 (修復 TS2305 錯誤) ---

export interface AppState {
  events: Event[];
  teams: Team[];
  announcements: Announcement[];
  currentUser: any | null;
  isLoading: boolean;
  theme: ThemeType;
  searchQuery: string;
}

export type AppAction = 
  | { type: 'SET_EVENTS'; payload: Event[] }
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'SET_TEAMS'; payload: Team[] }
  | { type: 'ADD_TEAM'; payload: Team }
  | { type: 'UPDATE_TEAM'; payload: Team }
  | { type: 'SET_ANNOUNCEMENTS'; payload: Announcement[] }
  | { type: 'ADD_ANNOUNCEMENT'; payload: Announcement }
  | { type: 'SET_USER'; payload: any | null }
  | { type: 'SET_THEME'; payload: ThemeType }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'LOAD_FROM_STORAGE'; payload: Partial<AppState> };

export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

// --- Tournament & Wizard Types ---

export type TournamentFormat = 'single_elimination' | 'double_elimination' | 'round_robin' | 'hybrid';

export interface EventWizardData {
  name: string;
  sport: SportType;
  startDate: string;
  endDate: string;
  location: string;
  organizer: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  theme: ThemeType;
  bannerImage: string | null;
  maxTeams: number;
  registrationFee: number;
  registrationDeadline: string;
  minPlayersPerTeam: number;
  maxPlayersPerTeam: number;
  requirePayment: boolean;
  allowWaitlist: boolean;
  divisions: EventDivision[]; 
  customFields: CustomFormField[];
  format: TournamentFormat;
  groups: number;
  teamsPerGroup: number;
  advanceCount: number;
  courts: string[];
  gameDuration: number;
  breakDuration: number;
  milestones?: EventMilestone[]; 
}

export type RouteType = 'home' | 'wizard' | 'dashboard' | 'public_event' | 'scorekeeper' | 'member' | 'not_found';