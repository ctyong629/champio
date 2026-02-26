import { useState } from 'react';
import {
  Plus, Trash2, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Simplified Rule Engine Component
export function RuleEngine() {
  const [rules] = useState([
    { id: 1, name: '年齡限制', condition: '年齡 ≥ 18 且 ≤ 40', active: true },
    { id: 2, name: '隊伍人數', condition: '隊伍人數 = 5-12 人', active: true },
    { id: 3, name: '黑名單檢查', condition: '不在黑名單中', active: true },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-500" />
          資格驗證規則
        </h3>
        <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-1" /> 新增規則
        </Button>
      </div>

      <div className="space-y-2">
        {rules.map((rule) => (
          <Card key={rule.id} className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={rule.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600'}>
                  {rule.active ? '啟用' : '停用'}
                </Badge>
                <div>
                  <p className="font-medium text-white">{rule.name}</p>
                  <p className="text-sm text-slate-400">{rule.condition}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-white">
                  <Shield className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-slate-800/50 border-dashed border-slate-700">
        <p className="text-center text-slate-500 text-sm">
          點擊「新增規則」建立複雜的資格驗證條件
        </p>
      </Card>
    </div>
  );
}
