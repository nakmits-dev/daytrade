import React, { useState } from 'react';
import { UserProfile } from '../lib/db';
import { TradeStats, TradeDataStore } from '../lib/types';
import YearlyPnLChart from './YearlyPnLChart';
import { User, Edit3 } from 'lucide-react';

interface ProfileProps {
  profile: UserProfile;
  userId: string;
  onUpdate: () => void;
  stats: TradeStats;
  tradeData: TradeDataStore;
}

const periods = [
  { title: '1ヶ月', statsKey: 'oneMonthStats' },
  { title: '3ヶ月', statsKey: 'threeMonthsStats' },
  { title: '6ヶ月', statsKey: 'sixMonthsStats' },
  { title: '12ヶ月', statsKey: 'oneYearStats' }
];

export default function Profile({ profile, userId, onUpdate, stats, tradeData }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await saveUserProfile(userId, {
        name,
        bio,
        updatedAt: new Date().toISOString()
      });
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 表示する期間を決定（少なくとも1ヶ月は表示）
  const visiblePeriods = periods.filter(({ statsKey }) => {
    if (statsKey === 'oneMonthStats') return true;
    return stats[statsKey].tradingDays > 0;
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg overflow-hidden">
        {!isEditing ? (
          <div className="relative">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                title="プロフィールを編集"
              >
                <Edit3 className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/10 rounded-full">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
              </div>
              <div className="text-white/90 whitespace-pre-line text-sm leading-relaxed">
                {profile.bio || '自己紹介が未設定です'}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                名前
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                自己紹介
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                rows={4}
                placeholder="あなたのトレードスタイルや目標を書いてみましょう"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? '更新中...' : '更新'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
          トレード実績
        </h3>
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle px-6">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left font-medium text-gray-500">期間</th>
                  <th className="py-2 px-4 text-right font-medium text-gray-500">取引日数</th>
                  <th className="py-2 px-4 text-right font-medium text-gray-500">勝率</th>
                  <th className="py-2 px-4 text-right font-medium text-gray-500">損益</th>
                  <th className="py-2 px-4 text-right font-medium text-gray-500">遵守率</th>
                </tr>
              </thead>
              <tbody>
                {visiblePeriods.map(({ title, statsKey }) => {
                  const periodStats = stats[statsKey];
                  return (
                    <tr key={title} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{title}</td>
                      <td className="py-3 px-4 text-right">
                        {periodStats.tradingDays}日
                      </td>
                      <td className="py-3 px-4 text-right">
                        {Math.round(periodStats.winRate)}%
                      </td>
                      <td className={`py-3 px-4 text-right ${
                        periodStats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {periodStats.totalPnL.toLocaleString()}円
                      </td>
                      <td className="py-3 px-4 text-right">
                        {Math.round(periodStats.ruleAdherence)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <YearlyPnLChart tradeData={tradeData} />
    </div>
  );
}