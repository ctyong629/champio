import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileSpreadsheet, FileText, FileCode, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportData, type ExportFormat } from '@/utils/exportUtils';
import { useToast } from '@/hooks/useToast';
import type { Team, Event } from '@/types';

interface ExportButtonProps {
  teams: Team[];
  event: Event;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const exportOptions: { format: ExportFormat; label: string; icon: typeof FileSpreadsheet; description: string }[] = [
  { 
    format: 'excel', 
    label: 'Excel 格式', 
    icon: FileSpreadsheet, 
    description: '適合進一步編輯處理' 
  },
  { 
    format: 'pdf', 
    label: 'PDF 秩序冊', 
    icon: FileText, 
    description: '正式比賽文件格式' 
  },
  { 
    format: 'csv', 
    label: 'CSV 格式', 
    icon: FileCode, 
    description: '輕量格式，相容性高' 
  },
];

export function ExportButton({ 
  teams, 
  event, 
  variant = 'outline', 
  size = 'default',
  className = '' 
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { addToast } = useToast();

  const handleExport = async (format: ExportFormat) => {
    if (teams.length === 0) {
      addToast({
        title: '無法匯出',
        description: '目前沒有報名資料',
        variant: 'warning',
      });
      return;
    }

    setIsExporting(true);

    try {
      // Simulate async export
      await new Promise(resolve => setTimeout(resolve, 500));
      
      exportData(format, teams, event);
      
      addToast({
        title: '匯出成功',
        description: `已匯出 ${teams.length} 筆資料到 ${format.toUpperCase()}`,
        variant: 'success',
      });
      
      setIsOpen(false);
    } catch (error) {
      addToast({
        title: '匯出失敗',
        description: '請稍後再試',
        variant: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
      >
        {isExporting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
          />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        匯出資料
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="absolute right-0 top-full mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                <span className="font-medium text-white">選擇匯出格式</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-2">
                {exportOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <motion.button
                      key={option.format}
                      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors text-left"
                      onClick={() => handleExport(option.format)}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{option.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{option.description}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-700">
                <p className="text-xs text-slate-500">
                  共 {teams.length} 筆報名資料
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
