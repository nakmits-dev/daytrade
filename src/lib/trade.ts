import { TradeRule } from './types';

export function createNewRule(): TradeRule {
  return { name: '新しいルール', followed: true };
}

export function formatAmount(amount: number | undefined): string {
  if (amount === undefined) return '';
  if (Math.abs(amount) >= 10000) {
    return `${(Math.round(amount / 1000) / 10).toFixed(1)}万円`;
  }
  return `${amount.toLocaleString()}円`;
}