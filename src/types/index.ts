// ============================================
// Champio TypeScript Type Definitions
// ============================================

// --- Enums ---

export type SportType = 'basketball' | 'volleyball' | 'soccer' | 'softball' | 'badminton' | 'tabletennis' | 'beachvolleyball' | 'other';

export type EventStatus = '報名中' | '進行中' | '籌備中' | '已結束';

export type TeamStatus = '審核通過' | '待審核' | '資料不全' | '候補中' | '已退賽';

export type UserRole = 'admin' | 'organizer' | 'captain' | 'scorekeeper' | 'viewer';

export type AnnouncementStatus = '已發布' | '草稿' | '已下架';

export type ThemeType = 'dark' | 'orange' | 'blue' | 'minimal';

// --- Base Interfaces ---

export interface Event {
  id: number;
  title: string;
  sport: string;
  date: string;
  startDate: string;
  endDate: string;
  location: string;
  organizer: string;
  status: EventStatus;
  teams: number;
  maxTeams: number;
  bannerColor: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Team {
  id: number;
  name: string;
  contact: string;
  phone: string;
  email?: string;
  status: TeamStatus;
  paid: boolean;
  paymentAmount?: number;
  paymentDate?: string;
  registeredAt?: string;
  members?: TeamMember[];
}

export interface TeamMember {
  id: number;
  name: string;
  jerseyNumber?: number;
  position?: string;
  isCaptain: boolean;
}

export interface Announcement {
  id: number;
  title: string;
  content?: string;
  date: string;
  pinned: boolean;
  status: AnnouncementStatus;
  author?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
}

export interface Game {
  id: number;
  eventId: number;
  round: number;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  status: 'scheduled' | 'live' | 'finished';
  startTime?: string;
  court?: string;
}

export interface Theme {
  id: ThemeType;
  name: string;
  gradient: string;
  primary: string;
  secondary?: string;
}

// --- Component Props Interfaces ---

export interface TournamentCardProps {
  event: Event;
  onClick: (eventId: number) => void;
}

export interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onEdit?: (item: T) => void;
  onView?: (item: T) => void;
  onDelete?: (item: T) => void;
  emptyMessage?: string;
  cardTitle?: (item: T) => string;
  cardSubtitle?: (item: T) => string;
  loading?: boolean;
}

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

export interface NavbarProps {
  route: string;
  setRoute: (route: string) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeSport: SportType;
  setActiveSport: (sport: SportType) => void;
}

export interface PageTransitionProps {
  children: React.ReactNode;
  route: string;
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
}

export interface SearchResult {
  type: 'event' | 'team' | 'announcement';
  id: number;
  title: string;
  subtitle?: string;
}

// --- Context Types ---

export interface AppState {
  events: Event[];
  teams: Team[];
  announcements: Announcement[];
  currentUser: User | null;
  theme: ThemeType;
  searchQuery: string;
}

export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export type AppAction =
  | { type: 'SET_EVENTS'; payload: Event[] }
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'DELETE_EVENT'; payload: number }
  | { type: 'SET_TEAMS'; payload: Team[] }
  | { type: 'ADD_TEAM'; payload: Team }
  | { type: 'UPDATE_TEAM'; payload: Team }
  | { type: 'SET_ANNOUNCEMENTS'; payload: Announcement[] }
  | { type: 'ADD_ANNOUNCEMENT'; payload: Announcement }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_THEME'; payload: ThemeType }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'LOAD_FROM_STORAGE' };

// --- API Response Types ---

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// --- Utility Types ---

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RouteType = 'home' | 'wizard' | 'dashboard' | 'public_event' | 'scorekeeper' | 'not_found';

// --- Tournament & Wizard Types ---

export type TournamentFormat = 'single_elimination' | 'double_elimination' | 'round_robin' | 'hybrid';

export interface EventWizardData {
  // Step 1: Basic Info
  name: string;
  sport: SportType;
  startDate: string;
  endDate: string;
  location: string;
  organizer: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  
  // Step 2: Theme & Banner
  theme: ThemeType;
  bannerImage: string | null;
  
  // Step 3: Registration Settings
  maxTeams: number;
  registrationFee: number;
  registrationDeadline: string;
  minPlayersPerTeam: number;
  maxPlayersPerTeam: number;
  requirePayment: boolean;
  allowWaitlist: boolean;
  
  // Step 4: Tournament Rules
  format: TournamentFormat;
  groups: number;
  teamsPerGroup: number;
  advanceCount: number;
  courts: string[];
  gameDuration: number;
  breakDuration: number;
}
