import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { AppState, AppContextType, AppAction, Event, Team, ThemeType } from '@/types';

// ============================================
// App State Management with Context + Reducer
// ============================================

const STORAGE_KEY = 'sportify-app-state';

const initialState: AppState = {
  events: [
    { 
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
      description: '全國最大型的春季籃球聯賽，廣邀各路好手共襄盛舉。' 
    },
    { 
      id: 2, 
      title: '大專院校排球邀請賽', 
      sport: '排球', 
      date: '2026-05-20', 
      startDate: '2026-05-20', 
      endDate: '2026-05-25', 
      location: '台灣大學綜合體育館', 
      organizer: '大專體總', 
      status: '進行中', 
      teams: 8, 
      maxTeams: 8, 
      bannerColor: '#3b82f6', 
      description: '頂尖大專院校排球隊伍齊聚一堂，爭奪年度總冠軍。' 
    },
    { 
      id: 3, 
      title: '夏季街頭 3v3 爭霸戰', 
      sport: '籃球', 
      date: '2026-06-10', 
      startDate: '2026-06-10', 
      endDate: '2026-06-12', 
      location: '新生高架橋下籃球場', 
      organizer: '街頭籃球聯盟', 
      status: '籌備中', 
      teams: 0, 
      maxTeams: 32, 
      bannerColor: '#10b981', 
      description: '熱血的街頭 3v3 賽事，隨機分組單敗淘汰，挑戰極限。' 
    },
  ],
  teams: [
    { id: 1, name: '猛龍隊', contact: '王小明', phone: '0912-345-678', status: '審核通過', paid: true },
    { id: 2, name: '飛鷹隊', contact: '李大華', phone: '0923-456-789', status: '審核通過', paid: true },
    { id: 3, name: '閃電俠', contact: '張小龍', phone: '0934-567-890', status: '資料不全', paid: false },
    { id: 4, name: '暴風雪', contact: '陳小美', phone: '0945-678-901', status: '候補中', paid: false },
    { id: 5, name: '火焰鳥', contact: '林志強', phone: '0956-789-012', status: '待審核', paid: false },
  ],
  announcements: [
    { id: 1, title: '賽程表已正式公佈，請各隊伍查閱', date: '2026-04-01', pinned: true, status: '已發布' },
    { id: 2, title: '報名期限延長至 4/10', date: '2026-03-25', pinned: false, status: '已發布' },
    { id: 3, title: '裁判會議紀錄', date: '2026-03-20', pinned: false, status: '草稿' },
  ],
  currentUser: null,
  theme: 'dark',
  searchQuery: '',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_EVENTS':
      return { ...state, events: action.payload };
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(e => e.id === action.payload.id ? action.payload : e)
      };
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(e => e.id !== action.payload)
      };
    case 'SET_TEAMS':
      return { ...state, teams: action.payload };
    case 'ADD_TEAM':
      return { ...state, teams: [...state.teams, action.payload] };
    case 'UPDATE_TEAM':
      return {
        ...state,
        teams: state.teams.map(t => t.id === action.payload.id ? action.payload : t)
      };
    case 'SET_ANNOUNCEMENTS':
      return { ...state, announcements: action.payload };
    case 'ADD_ANNOUNCEMENT':
      return { ...state, announcements: [...state.announcements, action.payload] };
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'LOAD_FROM_STORAGE':
      return state;
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, (init) => {
    // Load from localStorage on init
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return { ...init, ...parsed };
        } catch {
          console.warn('Failed to parse stored state');
        }
      }
    }
    return init;
  });

  // Persist to localStorage on state change
  useEffect(() => {
    const toStore = {
      theme: state.theme,
      currentUser: state.currentUser,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  }, [state.theme, state.currentUser]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState(): AppState {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context.state;
}

export function useAppDispatch(): React.Dispatch<AppAction> {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppDispatch must be used within AppProvider');
  }
  return context.dispatch;
}

// Custom hooks for common operations
export function useEvents() {
  const { state, dispatch } = useContext(AppContext)!;
  
  const addEvent = useCallback((event: Omit<Event, 'id'>) => {
    const newEvent = { ...event, id: Date.now() };
    dispatch({ type: 'ADD_EVENT', payload: newEvent });
    return newEvent;
  }, [dispatch]);

  const updateEvent = useCallback((event: Event) => {
    dispatch({ type: 'UPDATE_EVENT', payload: event });
  }, [dispatch]);

  const deleteEvent = useCallback((id: number) => {
    dispatch({ type: 'DELETE_EVENT', payload: id });
  }, [dispatch]);

  return {
    events: state.events,
    addEvent,
    updateEvent,
    deleteEvent,
  };
}

export function useTeams() {
  const { state, dispatch } = useContext(AppContext)!;
  
  const addTeam = useCallback((team: Omit<Team, 'id'>) => {
    const newTeam = { ...team, id: Date.now() };
    dispatch({ type: 'ADD_TEAM', payload: newTeam });
    return newTeam;
  }, [dispatch]);

  const updateTeam = useCallback((team: Team) => {
    dispatch({ type: 'UPDATE_TEAM', payload: team });
  }, [dispatch]);

  return {
    teams: state.teams,
    addTeam,
    updateTeam,
  };
}

export function useTheme() {
  const { state, dispatch } = useContext(AppContext)!;
  
  const setTheme = useCallback((theme: ThemeType) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, [dispatch]);

  const toggleTheme = useCallback(() => {
    const themes: ThemeType[] = ['dark', 'orange', 'blue', 'minimal'];
    const currentIndex = themes.indexOf(state.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    dispatch({ type: 'SET_THEME', payload: nextTheme });
  }, [dispatch, state.theme]);

  return {
    theme: state.theme,
    setTheme,
    toggleTheme,
  };
}

export function useSearch() {
  const { state, dispatch } = useContext(AppContext)!;
  
  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, [dispatch]);

  const searchResults = useCallback(() => {
    const query = state.searchQuery.toLowerCase();
    if (!query) return [];

    const results = [
      ...state.events
        .filter(e => e.title.toLowerCase().includes(query))
        .map(e => ({ type: 'event' as const, id: e.id, title: e.title, subtitle: e.organizer })),
      ...state.teams
        .filter(t => t.name.toLowerCase().includes(query))
        .map(t => ({ type: 'team' as const, id: t.id, title: t.name, subtitle: t.contact })),
      ...state.announcements
        .filter(a => a.title.toLowerCase().includes(query))
        .map(a => ({ type: 'announcement' as const, id: a.id, title: a.title, subtitle: a.date })),
    ];

    return results.slice(0, 10);
  }, [state.searchQuery, state.events, state.teams, state.announcements]);

  return {
    searchQuery: state.searchQuery,
    setSearchQuery,
    searchResults: searchResults(),
  };
}
