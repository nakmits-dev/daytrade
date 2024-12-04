import React, { useState, useEffect } from 'react';
import { Check, Trash2, Plus } from 'lucide-react';
import { TradeRule } from '../lib/types';
import { getJSTDateString } from '../lib/date';
import { createNewRule } from '../lib/trade';
import { saveTradeEntry } from '../lib/db';

interface TradeFormProps {
  selectedDate: Date;
  onSave: (data: { pnl: number; rulesFollowed: TradeRule[]; memo?: string; } | null) => void;
  tradeData: { [date: string]: { pnl: number; rulesFollowed: TradeRule[]; memo?: string; } };
  userId: string;
}

export default function TradeForm({ selectedDate, onSave, tradeData, userId }: TradeFormProps) {
  const [pnl, setPnl] = useState<string>('');
  const [rules, setRules] = useState<TradeRule[]>([]);
  const [memo, setMemo] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitialRules = () => {
    const dateString = getJSTDateString(selectedDate);
    const dayData = tradeData[dateString];

    if (dayData?.rulesFollowed) {
      return dayData.rulesFollowed;
    }

    // 日付でソートして直近の取引ルールを取得（先月のデータも含む）
    const sortedEntries = Object.entries(tradeData)
      .filter(([date]) => date < dateString)
      .sort(([a], [b]) => b.localeCompare(a));

    const lastEntry = sortedEntries[0];
    if (lastEntry && lastEntry[1]?.rulesFollowed) {
      return lastEntry[1].rulesFollowed.map(rule => ({
        ...rule,
        followed: true
      }));
    }

    return [createNewRule()];
  };

  useEffect(() => {
    const dateString = getJSTDateString(selectedDate);
    const dayData = tradeData[dateString];

    if (dayData) {
      setPnl(dayData.pnl.toString());
      setRules(dayData.rulesFollowed || []);
      setMemo(dayData.memo || '');
      setIsEditing(true);
    } else {
      setPnl('');
      const initialRules = loadInitialRules();
      setRules(initialRules);
      setMemo('');
      setIsEditing(false);
    }
    setError(null);
  }, [selectedDate, tradeData]);

  const handlePnlChange = (value: string) => {
    setError(null);
    const sanitizedValue = value.replace(/[^\d-]/g, '');
    if (sanitizedValue === '' || sanitizedValue === '-') {
      setPnl(sanitizedValue);
      return;
    }
    
    const numValue = parseInt(sanitizedValue, 10);
    if (!isNaN(numValue)) {
      setPnl(numValue.toString());
    }
  };

  const handlePnlBlur = () => {
    if (pnl) {
      const numValue = parseInt(pnl.replace(/,/g, ''), 10);
      if (!isNaN(numValue)) {
        setPnl(numValue.toLocaleString());
      }
    }
  };

  const handleAddRule = () => {
    if (rules.length < 7) {
      setRules([...rules, createNewRule()]);
    }
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleToggleRule = (index: number) => {
    setRules(rules.map((rule, i) => 
      i === index ? { ...rule, followed: !rule.followed } : rule
    ));
  };

  const handleUpdateRuleName = (index: number, name: string) => {
    setRules(rules.map((rule, i) => 
      i === index ? { ...rule, name } : rule
    ));
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isSaving) return;

    if (!pnl.trim()) {
      setError('損益は必須項目です');
      return;
    }

    setIsSaving(true);
    setError(null);
    
    try {
      const numericPnl = parseInt(pnl.replace(/,/g, ''), 10);
      if (isNaN(numericPnl)) {
        throw new Error('無効な数値です');
      }

      const dateString = getJSTDateString(selectedDate);
      const saveData = {
        pnl: numericPnl,
        rulesFollowed: rules,
        memo: memo.trim() || undefined,
      };

      await saveTradeEntry(userId, dateString, saveData);
      await onSave(saveData);
      
      setIsEditing(true);
    } catch (error) {
      console.error('保存エラー:', error);
      setError('保存中にエラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);

    if (isSaving) return;

    setIsSaving(true);
    try {
      const dateString = getJSTDateString(selectedDate);
      
      await saveTradeEntry(userId, dateString, null);
      await onSave(null);
      
      setPnl('');
      setMemo('');
      setIsEditing(false);
      
      const initialRules = loadInitialRules();
      setRules(initialRules);
    } catch (error) {
      console.error('クリアエラー:', error);
      setError('クリア中にエラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">
        {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日の取引
      </h3>

      <form className="space-y-6" onSubmit={e => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            損益<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={pnl}
              onChange={(e) => handlePnlChange(e.target.value)}
              onBlur={handlePnlBlur}
              disabled={isSaving}
              required
              className={`
                w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2
                ${error ? 'border-red-300 ring-red-100' : ''}
                ${pnl && parseInt(pnl.replace(/,/g, ''), 10) >= 0 
                  ? 'border-green-200 bg-green-50 text-green-600 focus:ring-green-200'
                  : pnl
                    ? 'border-red-200 bg-red-50 text-red-600 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-indigo-200'
                }
                disabled:opacity-50
              `}
              placeholder="入力してください"
            />
            {pnl && <span className="absolute right-4 top-2 text-gray-400">円</span>}
          </div>
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              取引ルール
            </label>
            {rules.length < 7 && (
              <button
                type="button"
                onClick={handleAddRule}
                disabled={isSaving}
                className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                追加
              </button>
            )}
          </div>
          <div className="space-y-1">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-gray-50"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    value={rule.name}
                    onChange={(e) => handleUpdateRuleName(index, e.target.value)}
                    disabled={isSaving}
                    className="w-full bg-transparent px-2 py-1 text-sm rounded border-0 focus:outline-none focus:ring-1 focus:ring-indigo-200 disabled:opacity-50"
                    placeholder="ルールを入力..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(index)}
                    disabled={isSaving}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleRule(index)}
                    disabled={isSaving}
                    className={`
                      p-1.5 rounded-full transition-colors disabled:opacity-50
                      ${rule.followed 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'text-gray-400 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            メモ
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            disabled={isSaving}
            className="w-full h-24 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm disabled:opacity-50"
            placeholder="今日の取引メモ..."
          />
        </div>

        <div className="flex justify-end gap-3">
          {isEditing && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              クリア
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 min-w-[80px]"
          >
            {isSaving ? '保存中...' : (isEditing ? '更新' : '追加')}
          </button>
        </div>
      </form>
    </div>
  );
}