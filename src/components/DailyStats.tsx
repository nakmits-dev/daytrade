import React from 'react';
import { getTradeData } from '../data/mockTradeData';

interface DailyStatsProps {
  selectedDate: Date;
}

export default function DailyStats({ selectedDate }: DailyStatsProps) {
  const stats = getTradeData(selectedDate);

  if (!stats) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日の取引
        </h3>
        <p className="text-gray-500 text-center py-4">取引データがありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">
        {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日の取引
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-600">トータル損益</span>
          <span className={`font-bold ${stats.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.pnl >= 0 ? '+' : ''}{stats.pnl.toLocaleString()}円
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">取引回数</div>
            <div className="font-bold">{stats.trades}回</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">勝率</div>
            <div className="font-bold">{stats.winRate}%</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">ルール遵守</div>
            <div className={`font-bold ${stats.rulesFollowed ? 'text-green-600' : 'text-red-600'}`}>
              {stats.rulesFollowed ? '遵守' : '違反'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}