import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { getTradeData } from '../data/mockTradeData';

interface TradeRulesProps {
  selectedDate: Date;
}

export default function TradeRules({ selectedDate }: TradeRulesProps) {
  const dayData = getTradeData(selectedDate);

  if (!dayData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">取引ルール</h3>
        <p className="text-gray-500 text-center py-4">取引データがありません</p>
      </div>
    );
  }

  const totalRulesFollowed = dayData.rulesFollowed.filter(rule => rule.followed).length;
  const allRulesFollowed = totalRulesFollowed === dayData.rulesFollowed.length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">取引ルール</h3>
      
      <div className={`p-4 rounded-lg mb-4 ${
        allRulesFollowed ? 'bg-green-50' : 'bg-red-50'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">取引ルールの遵守状況</span>
          <div className="text-sm">
            <span className="font-medium">{totalRulesFollowed}</span>
            <span className="text-gray-500">/{dayData.rulesFollowed.length}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {dayData.rulesFollowed.map((rule, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              rule.followed ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-700">{rule.name}</span>
              {rule.followed ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}