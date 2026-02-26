import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit3, ChevronRight } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onEdit?: (item: T) => void;
  onView?: (item: T) => void;
  emptyMessage?: string;
  cardTitle?: (item: T) => string;
  cardSubtitle?: (item: T) => string;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  onEdit,
  onView,
  emptyMessage = '暫無資料',
  cardTitle,
  cardSubtitle,
}: ResponsiveTableProps<T>) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="space-y-3">
        {data.map((item) => (
          <Card 
            key={keyExtractor(item)} 
            className="p-4 bg-slate-800/50 border-slate-700/50 hover:border-orange-500/30 transition-all"
          >
            {/* Card Header */}
            {(cardTitle || cardSubtitle) && (
              <div className="mb-3 pb-3 border-b border-slate-700/50">
                {cardTitle && (
                  <h4 className="font-bold text-white text-base">{cardTitle(item)}</h4>
                )}
                {cardSubtitle && (
                  <p className="text-slate-400 text-sm mt-0.5">{cardSubtitle(item)}</p>
                )}
              </div>
            )}
            
            {/* Card Body */}
            <div className="space-y-2">
              {columns.filter(col => col.key !== 'actions').map((column) => (
                <div key={column.key} className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">{column.header}</span>
                  <span className="text-slate-300 text-sm text-right">
                    {column.render ? column.render(item) : (item as any)[column.key]}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Card Actions */}
            {(onEdit || onView) && (
              <div className="mt-4 pt-3 border-t border-slate-700/50 flex gap-2">
                {onView && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-slate-600 text-slate-300"
                    onClick={() => onView(item)}
                  >
                    查看 <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
                {onEdit && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-slate-600 text-slate-300"
                    onClick={() => onEdit(item)}
                  >
                    <Edit3 className="w-4 h-4 mr-1" /> 編輯
                  </Button>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  }

  // Desktop Table View
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-800/50 text-slate-400 text-sm">
            {columns.map((column) => (
              <th 
                key={column.key} 
                className={`p-4 font-medium ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr 
              key={keyExtractor(item)} 
              className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
            >
              {columns.map((column) => (
                <td key={column.key} className={`p-4 ${column.className || ''}`}>
                  {column.render ? column.render(item) : (item as any)[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
