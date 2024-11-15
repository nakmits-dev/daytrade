export interface PeriodStats {
  totalPnL: number;
  winRate: number;
  tradingDays: number;
  ruleAdherence: number;
}

export interface TradeStats {
  oneMonthStats: PeriodStats;
  threeMonthsStats: PeriodStats;
  sixMonthsStats: PeriodStats;
  oneYearStats: PeriodStats;
  totalStats: PeriodStats;
  accountSize: number;
}

export interface TradeRule {
  name: string;
  followed: boolean;
}

export interface TradeDay {
  pnl: number;
  rulesFollowed: TradeRule[];
  memo?: string;
  deleted?: boolean;
}

export interface TradeDataStore {
  [date: string]: TradeDay;
}