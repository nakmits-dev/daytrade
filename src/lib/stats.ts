import { TradeDataStore, PeriodStats, TradeStats } from './types';
import { getJSTDate } from './date';

function calculatePeriodStats(trades: any[]): PeriodStats {
  if (trades.length === 0) {
    return {
      totalPnL: 0,
      winRate: 0,
      tradingDays: 0,
      ruleAdherence: 0
    };
  }

  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const profitableTrades = trades.filter(trade => trade.pnl > 0);
  const winRate = (profitableTrades.length / trades.length) * 100;

  // ルール遵守率の計算
  const totalRules = trades.reduce((sum, trade) => 
    sum + (trade.rulesFollowed?.length || 0), 0);
  const followedRules = trades.reduce((sum, trade) => 
    sum + (trade.rulesFollowed?.filter(rule => rule.followed)?.length || 0), 0);
  const ruleAdherence = totalRules > 0 ? (followedRules / totalRules) * 100 : 0;

  return {
    totalPnL,
    winRate,
    tradingDays: trades.length,
    ruleAdherence
  };
}

export function calculateTradeStats(tradeData: TradeDataStore): TradeStats {
  const now = getJSTDate(new Date());
  
  // 各期間の開始日を計算
  const periods = {
    oneMonth: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    threeMonths: new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000),
    sixMonths: new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000),
    oneYear: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
  };

  // 取引データを日付でソート
  const trades = Object.entries(tradeData)
    .filter(([_, data]) => data !== undefined && !data.deleted)
    .map(([date, data]) => ({
      date: new Date(date),
      ...data
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  // 各期間のデータをフィルタリング
  const periodTrades = {
    oneMonth: trades.filter(trade => trade.date >= periods.oneMonth),
    threeMonths: trades.filter(trade => trade.date >= periods.threeMonths),
    sixMonths: trades.filter(trade => trade.date >= periods.sixMonths),
    oneYear: trades.filter(trade => trade.date >= periods.oneYear)
  };

  // 各期間の統計を計算
  const stats = {
    oneMonth: calculatePeriodStats(periodTrades.oneMonth),
    threeMonths: calculatePeriodStats(periodTrades.threeMonths),
    sixMonths: calculatePeriodStats(periodTrades.sixMonths),
    oneYear: calculatePeriodStats(periodTrades.oneYear),
    total: calculatePeriodStats(trades)
  };

  return {
    oneMonthStats: stats.oneMonth,
    threeMonthsStats: stats.threeMonths,
    sixMonthsStats: stats.sixMonths,
    oneYearStats: stats.oneYear,
    totalStats: stats.total,
    accountSize: 1000000
  };
}