import React from 'react';
import { TradeDataStore } from '../lib/types';
import { BarChart3, TrendingUp, CalendarDays, CheckCircle } from 'lucide-react';
import { formatAmount } from '../lib/trade';
import { getJSTDate } from '../lib/date';

interface MonthlySummaryProps {
  selectedDate: Date;
  tradeData: TradeDataStore;
}

export default function MonthlySummary({ selectedDate, tradeData }: MonthlySummaryProps) {
  const getMonthlyStats = () => {
    const jstDate = getJSTDate(selectedDate);
    const year = jstDate.getUTCFullYear();
    const month = jstDate.getUTCMonth() + 1;
    
    const monthData = Object.entries(tradeData)
      .filter(([date]) => {
        const [y, m] = date.split('-').map(Number);
        return y === year && m === month;
      })
      .filter(([_, data]) => data !== undefined);

    if (monthData.length === 0) {
      return {
        totalPnL: 0,
        winRate: 0,
        tradingDays: 0,
        ruleAdherence: 0
      };
    }

    // 損益の合計を計算
    const totalPnL = monthData.reduce((sum, [_, data]) => {
      return sum + (data?.pnl || 0);
    }, 0);

    // 損益が0円の取引を除外して勝率を計算
    const validTrades = monthData.filter(([_, data]) => data?.pnl !== 0);
    const tradingDays = validTrades.length;
    const profitDays = validTrades.filter(([_, data]) => (data?.pnl || 0) > 0).length;
    const winRate = tradingDays > 0 ? (profitDays / tradingDays) * 100 : 0;

    // ルール遵守率の計算（全取引を対象）
    const totalRules = monthData.reduce((sum, [_, data]) => 
      sum + (data?.rulesFollowed?.length || 0), 0);
    const followedRules = monthData.reduce((sum, [_, data]) => 
      sum + (data?.rulesFollowed?.filter(rule => rule.followed)?.length || 0), 0);
    const ruleAdherence = totalRules > 0 ? (followedRules / totalRules) * 100 : 0;

    return {
      totalPnL,
      winRate,
      tradingDays,
      ruleAdherence
    };
  };

  const stats = getMonthlyStats();
  const jstDate = getJSTDate(selectedDate);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">
        {jstDate.getUTCMonth() + 1}月のサマリー
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm">月間損益</span>
          </div>
          <div className={`text-lg font-bold ${
            stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatAmount(stats.totalPnL)}
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">勝率</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {Math.round(stats.winRate)}%
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <CalendarDays className="w-4 h-4" />
            <span className="text-sm">取引日数</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {stats.tradingDays}日
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">ルール遵守率</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {Math.round(stats.ruleAdherence)}%
          </div>
        </div>
      </div>
    </div>
  );
}