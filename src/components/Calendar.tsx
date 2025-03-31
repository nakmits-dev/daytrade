import React from 'react';
import { MessageSquare } from 'lucide-react';
import { TradeDataStore } from '../lib/types';
import { getJSTDate, getJSTDateString } from '../lib/date';
import { formatAmount } from '../lib/trade';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  tradeData: TradeDataStore;
  onMonthChange?: (year: number, month: number) => void;
}

export default function Calendar({ selectedDate, onDateSelect, tradeData, onMonthChange }: CalendarProps) {
  const jstDate = getJSTDate(selectedDate);

  const firstDayOfMonth = new Date(
    Date.UTC(jstDate.getUTCFullYear(), jstDate.getUTCMonth(), 1)
  ).getUTCDay();

  const daysInMonth = new Date(
    Date.UTC(jstDate.getUTCFullYear(), jstDate.getUTCMonth() + 1, 0)
  ).getUTCDate();

  const handlePrevMonth = () => {
    const newDate = new Date(Date.UTC(jstDate.getUTCFullYear(), jstDate.getUTCMonth() - 1, 1));
    onDateSelect(newDate);
    if (onMonthChange) {
      const jstNewDate = getJSTDate(newDate);
      onMonthChange(jstNewDate.getUTCFullYear(), jstNewDate.getUTCMonth() + 1);
    }
  };

  const handleNextMonth = () => {
    const newDate = new Date(Date.UTC(jstDate.getUTCFullYear(), jstDate.getUTCMonth() + 1, 1));
    onDateSelect(newDate);
    if (onMonthChange) {
      const jstNewDate = getJSTDate(newDate);
      onMonthChange(jstNewDate.getUTCFullYear(), jstNewDate.getUTCMonth() + 1);
    }
  };

  const getDayData = (date: Date) => {
    const dateString = getJSTDateString(date);
    return tradeData[dateString];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg sm:text-xl font-semibold">
          {jstDate.getUTCFullYear()}年 {jstDate.getUTCMonth() + 1}月
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            ←
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1 sm:gap-2">
        {['月', '火', '水', '木', '金'].map((day) => (
          <div key={day} className="text-center py-2 text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
        
        {Array.from({ length: 42 }, (_, i) => {
          const dayNumber = i - firstDayOfMonth + 1;
          const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
          const date = new Date(Date.UTC(jstDate.getUTCFullYear(), jstDate.getUTCMonth(), dayNumber));
          const dayData = isCurrentMonth ? getDayData(date) : undefined;
          const dayOfWeek = date.getUTCDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const isSelected = isCurrentMonth && 
            getJSTDateString(date) === getJSTDateString(selectedDate);

          if (isWeekend) return null;

          return (
            <button
              key={i}
              onClick={() => {
                if (isCurrentMonth && !isWeekend) {
                  onDateSelect(date);
                }
              }}
              disabled={!isCurrentMonth || isWeekend}
              className={`
                h-16 sm:h-24 p-1 sm:p-2 rounded-lg relative flex flex-col items-stretch
                ${isCurrentMonth && !isWeekend ? 'hover:bg-indigo-50' : 'opacity-30 bg-gray-50'}
                ${dayData?.pnl && dayData.pnl > 0 ? 'bg-green-50' : ''}
                ${dayData?.pnl && dayData.pnl < 0 ? 'bg-red-50' : ''}
                ${isSelected ? 'ring-2 ring-indigo-500' : ''}
              `}
            >
              <div className="flex justify-between items-start">
                <span className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-indigo-600' : ''}`}>
                  {isCurrentMonth ? dayNumber : ''}
                </span>
              </div>
              
              {dayData && (
                <div className="flex flex-col flex-1">
                  <div className={`text-xs sm:text-sm font-medium mt-1 sm:mt-2 text-center ${
                    dayData.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatAmount(dayData.pnl)}
                  </div>
                  <div className="mt-auto flex justify-between items-center h-3 sm:h-4">
                    <div className="flex gap-0.5 items-center">
                      {dayData.rulesFollowed?.map((rule, i) => (
                        <div
                          key={i}
                          className={`w-1 h-1 rounded-full ${
                            rule.followed ? 'bg-green-400' : 'bg-red-400'
                          }`}
                        />
                      ))}
                    </div>
                    {dayData.memo && (
                      <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                    )}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}