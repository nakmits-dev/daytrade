export interface TradeRule {
  name: string;
  followed: boolean;
}

export interface TradeDay {
  pnl: number;
  rulesFollowed: TradeRule[];
  memo?: string;
}

export interface TradeDataStore {
  [date: string]: TradeDay;
}

export const createNewRule = () => {
  return { name: '新しいルール', followed: true };
};