import { createContext, useContext, useState, useCallback, type ReactNode, type ReactElement } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// Toast System with TypeScript
// ============================================

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const variantConfig: Record<ToastVariant, { 
  icon: typeof Info; 
  bgColor: string; 
  borderColor: string;
  iconColor: string;
}> = {
  default: { 
    icon: Info, 
    bgColor: 'bg-slate-800', 
    borderColor: 'border-slate-700',
    iconColor: 'text-slate-400'
  },
  success: { 
    icon: CheckCircle, 
    bgColor: 'bg-slate-800', 
    borderColor: 'border-emerald-500/50',
    iconColor: 'text-emerald-500'
  },
  error: { 
    icon: AlertCircle, 
    bgColor: 'bg-slate-800', 
    borderColor: 'border-red-500/50',
    iconColor: 'text-red-500'
  },
  warning: { 
    icon: AlertTriangle, 
    bgColor: 'bg-slate-800', 
    borderColor: 'border-amber-500/50',
    iconColor: 'text-amber-500'
  },
  info: { 
    icon: Info, 
    bgColor: 'bg-slate-800', 
    borderColor: 'border-blue-500/50',
    iconColor: 'text-blue-500'
  },
};

export function ToastProvider({ children }: { children: ReactNode }): ReactElement {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duration = toast.duration || 4000;
    
    setToasts((prev) => [...prev, { ...toast, id }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const config = variantConfig[toast.variant || 'default'];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`
        pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl 
        min-w-[320px] max-w-[400px] border ${config.bgColor} ${config.borderColor}
      `}
    >
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white text-sm">{toast.title}</p>
        {toast.description && (
          <p className="text-slate-400 text-xs mt-1">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-slate-500 hover:text-white transition-colors shrink-0 p-0.5 hover:bg-slate-700 rounded"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
