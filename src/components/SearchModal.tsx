import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Trophy, Users, FileText, ArrowRight } from 'lucide-react';
import { useAppState } from '@/contexts/AppContext';
import type { Event, Team, Announcement } from '@/types';

interface SearchResult {
  type: 'event' | 'team' | 'announcement';
  item: Event | Team | Announcement;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: string, id: string) => void;
}

export function SearchModal({ isOpen, onClose, onSelect }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { events, teams, announcements } = useAppState();

  // Filter results based on query
  const filteredResults: SearchResult[] = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();

    const eventResults: SearchResult[] = events
      .filter(e => 
        e.name.toLowerCase().includes(lowerQuery) ||
        e.organizer.toLowerCase().includes(lowerQuery) ||
        e.location.toLowerCase().includes(lowerQuery)
      )
      .map(e => ({ type: 'event' as const, item: e }));

    const teamResults: SearchResult[] = teams
      .filter(t => 
        t.name.toLowerCase().includes(lowerQuery) ||
        t.contact.toLowerCase().includes(lowerQuery)
      )
      .map(t => ({ type: 'team' as const, item: t }));

    const announcementResults: SearchResult[] = announcements
      .filter(a => a.title.toLowerCase().includes(lowerQuery))
      .map(a => ({ type: 'announcement' as const, item: a }));

    return [...eventResults, ...teamResults, ...announcementResults].slice(0, 8);
  }, [query, events, teams, announcements]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => Math.min(i + 1, filteredResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredResults[selectedIndex]) {
            handleSelect(filteredResults[selectedIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredResults, onClose]);

  const handleSelect = useCallback((result: SearchResult) => {
    onSelect(result.type, result.item.id);
    onClose();
  }, [onClose, onSelect]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'event': return <Trophy className="w-5 h-5 text-orange-500" />;
      case 'team': return <Users className="w-5 h-5 text-blue-500" />;
      case 'announcement': return <FileText className="w-5 h-5 text-emerald-500" />;
      default: return <Search className="w-5 h-5 text-slate-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'event': return '賽事';
      case 'team': return '隊伍';
      case 'announcement': return '公告';
      default: return type;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800">
                <Search className="w-6 h-6 text-slate-500" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="搜尋賽事、隊伍、公告..."
                  className="flex-1 bg-transparent text-white text-lg placeholder:text-slate-500 focus:outline-none"
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery('');
                      inputRef.current?.focus();
                    }}
                    className="p-1 hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                )}
                <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs text-slate-500">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {filteredResults.length > 0 ? (
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs text-slate-500 uppercase tracking-wider">
                      搜尋結果 ({filteredResults.length})
                    </div>
                    {filteredResults.map((result, index) => (
                      <motion.button
                        key={`${result.type}-${result.item.id}`}
                        className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors ${
                          index === selectedIndex 
                            ? 'bg-orange-500/10 border-l-2 border-orange-500' 
                            : 'hover:bg-slate-800/50 border-l-2 border-transparent'
                        }`}
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                          {getIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">
                            {'title' in result.item ? result.item.title : ''}
                          </p>
                          <p className="text-sm text-slate-500">
                            {result.type === 'event' && 'organizer' in result.item && result.item.organizer}
                            {result.type === 'team' && 'contact' in result.item && `${result.item.contact} · ${result.item.phone}`}
                            {result.type === 'announcement' && 'date' in result.item && result.item.date}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-slate-500 px-2 py-1 bg-slate-800 rounded">
                            {getTypeLabel(result.type)}
                          </span>
                          {index === selectedIndex && (
                            <ArrowRight className="w-4 h-4 text-orange-500" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : query.trim() ? (
                  <div className="py-12 text-center">
                    <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">找不到符合「{query}」的結果</p>
                    <p className="text-sm text-slate-500 mt-1">試試其他關鍵字</p>
                  </div>
                ) : (
                  <div className="py-8 px-4">
                    <p className="text-sm text-slate-500 mb-4">快速搜尋</p>
                    <div className="flex flex-wrap gap-2">
                      {['籃球', '排球', '報名中', '猛龍隊'].map((keyword) => (
                        <button
                          key={keyword}
                          onClick={() => setQuery(keyword)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-full transition-colors"
                        >
                          {keyword}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">↓</kbd>
                    選擇
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">↵</kbd>
                    確認
                  </span>
                </div>
                <span>Champio Search</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
