import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, Users, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// ============================================
// Medal Ranking System
// ============================================

export type RankingType = 'team' | 'organization' | 'school';

export interface MedalRecord {
  id: string;
  name: string;
  category?: string; // organization, school, department
  gold: number;
  silver: number;
  bronze: number;
  total?: number;
  points?: number;
}

interface MedalRankingProps {
  data: MedalRecord[];
  type?: RankingType;
  showPoints?: boolean;
  className?: string;
}

const rankingTypeLabels: Record<RankingType, { title: string; subtitle: string; icon: typeof Trophy }> = {
  team: {
    title: '隊伍獎牌榜',
    subtitle: '依隊伍統計獎牌數',
    icon: Trophy,
  },
  organization: {
    title: '單位獎牌榜',
    subtitle: '依主辦/參與單位統計',
    icon: Building2,
  },
  school: {
    title: '學校獎牌榜',
    subtitle: '依學校統計獎牌數',
    icon: Users,
  },
};

export function MedalRanking({
  data,
  type = 'team',
  showPoints = true,
  className = '',
}: MedalRankingProps) {
  const [sortBy, setSortBy] = useState<'medals' | 'points'>('medals');

  const { title, subtitle, icon: Icon } = rankingTypeLabels[type];

  // Calculate totals and sort
  const rankedData = useMemo(() => {
    const withTotals = data.map(record => ({
      ...record,
      total: record.gold + record.silver + record.bronze,
      points: (record.gold * 5) + (record.silver * 3) + (record.bronze * 1),
    }));

    return withTotals.sort((a, b) => {
      if (sortBy === 'medals') {
        // Sort by gold, then silver, then bronze
        if (b.gold !== a.gold) return b.gold - a.gold;
        if (b.silver !== a.silver) return b.silver - a.silver;
        return b.bronze - a.bronze;
      } else {
        return (b.points || 0) - (a.points || 0);
      }
    }).map((record, index) => ({
      ...record,
      rank: index + 1,
    }));
  }, [data, sortBy]);

  // Calculate totals
  const totals = useMemo(() => {
    return rankedData.reduce(
      (acc, record) => ({
        gold: acc.gold + record.gold,
        silver: acc.silver + record.silver,
        bronze: acc.bronze + record.bronze,
        total: acc.total + (record.total || 0),
      }),
      { gold: 0, silver: 0, bronze: 0, total: 0 }
    );
  }, [rankedData]);

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 2:
        return 'bg-slate-300/20 text-slate-300 border-slate-300/50';
      case 3:
        return 'bg-amber-700/20 text-amber-600 border-amber-700/50';
      default:
        return 'bg-slate-700/50 text-slate-400 border-slate-700';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-300" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center font-bold">{rank}</span>;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-slate-400 text-sm">{subtitle}</p>
          </div>
        </div>

        {/* Sort Toggle */}
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'medals' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('medals')}
            className={sortBy === 'medals' ? 'bg-orange-500' : ''}
          >
            <Medal className="w-4 h-4 mr-1" />
            獎牌數
          </Button>
          {showPoints && (
            <Button
              variant={sortBy === 'points' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('points')}
              className={sortBy === 'points' ? 'bg-orange-500' : ''}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              積分
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-yellow-500/10 border-yellow-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-yellow-500 font-medium">金牌</span>
          </div>
          <p className="text-2xl font-bold text-white">{totals.gold}</p>
        </Card>

        <Card className="p-4 bg-slate-300/10 border-slate-300/30">
          <div className="flex items-center gap-2 mb-2">
            <Medal className="w-5 h-5 text-slate-300" />
            <span className="text-slate-300 font-medium">銀牌</span>
          </div>
          <p className="text-2xl font-bold text-white">{totals.silver}</p>
        </Card>

        <Card className="p-4 bg-amber-700/10 border-amber-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-amber-600" />
            <span className="text-amber-600 font-medium">銅牌</span>
          </div>
          <p className="text-2xl font-bold text-white">{totals.bronze}</p>
        </Card>

        <Card className="p-4 bg-orange-500/10 border-orange-500/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <span className="text-orange-500 font-medium">總計</span>
          </div>
          <p className="text-2xl font-bold text-white">{totals.total}</p>
        </Card>
      </div>

      {/* Ranking Table */}
      <Card className="overflow-hidden bg-slate-800 border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-sm">
                <th className="px-4 py-3 text-left font-medium">排名</th>
                <th className="px-4 py-3 text-left font-medium">名稱</th>
                <th className="px-4 py-3 text-center font-medium">
                  <span className="text-yellow-500">金牌</span>
                </th>
                <th className="px-4 py-3 text-center font-medium">
                  <span className="text-slate-300">銀牌</span>
                </th>
                <th className="px-4 py-3 text-center font-medium">
                  <span className="text-amber-600">銅牌</span>
                </th>
                <th className="px-4 py-3 text-center font-medium">總數</th>
                {showPoints && (
                  <th className="px-4 py-3 text-center font-medium">積分</th>
                )}
              </tr>
            </thead>
            <tbody>
              {rankedData.map((record, index) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getRankStyle(record.rank)}`}>
                      {getRankIcon(record.rank)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-white">{record.name}</p>
                      {record.category && (
                        <p className="text-xs text-slate-500">{record.category}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-yellow-500 font-bold">{record.gold}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-slate-300 font-bold">{record.silver}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-amber-600 font-bold">{record.bronze}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-white font-bold">{record.total}</span>
                  </td>
                  {showPoints && (
                    <td className="px-4 py-3 text-center">
                      <span className="text-orange-500 font-bold">{record.points}</span>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Empty State */}
      {rankedData.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">暫無獎牌資料</p>
          <p className="text-slate-500 text-sm mt-1">比賽結束後將自動統計</p>
        </div>
      )}
    </div>
  );
}

// Compact Medal Display
interface CompactMedalDisplayProps {
  gold: number;
  silver: number;
  bronze: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CompactMedalDisplay({
  gold,
  silver,
  bronze,
  size = 'md',
  className = '',
}: CompactMedalDisplayProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-7 h-7 text-sm',
    lg: 'w-9 h-9 text-base',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {gold > 0 && (
        <div className={`${sizeClasses[size]} bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center font-bold`}>
          {gold}
        </div>
      )}
      {silver > 0 && (
        <div className={`${sizeClasses[size]} bg-slate-300/20 text-slate-300 rounded-full flex items-center justify-center font-bold`}>
          {silver}
        </div>
      )}
      {bronze > 0 && (
        <div className={`${sizeClasses[size]} bg-amber-700/20 text-amber-600 rounded-full flex items-center justify-center font-bold`}>
          {bronze}
        </div>
      )}
    </div>
  );
}
