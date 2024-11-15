import { Achievement, TradeStats } from './types';
import { 
  Trophy, Target, CheckCircle2, Zap, 
  LineChart, Rocket, Crown, Shield,
  Timer, Calendar, Star, Brain,
  Scale, Heart, Flame
} from 'lucide-react';

export const achievements: Achievement[] = [
  // 継続性
  {
    id: 'rookie-trader',
    title: '駆け出しトレーダー',
    description: '10日以上の取引を達成',
    icon: Timer.name,
    category: 'consistency',
    difficulty: 'beginner',
    condition: (stats: TradeStats) => stats.tradingDays >= 10,
    progress: (stats: TradeStats) => Math.min((stats.tradingDays / 10) * 100, 100)
  },
  {
    id: 'persistent-trader',
    title: '情熱の継続者',
    description: '30日以上の取引を達成',
    icon: Flame.name,
    category: 'consistency',
    difficulty: 'intermediate',
    condition: (stats: TradeStats) => stats.tradingDays >= 30,
    progress: (stats: TradeStats) => Math.min((stats.tradingDays / 30) * 100, 100)
  },
  {
    id: 'master-of-persistence',
    title: '不屈の継続王',
    description: '100日以上の取引を達成',
    icon: Crown.name,
    category: 'consistency',
    difficulty: 'expert',
    condition: (stats: TradeStats) => stats.tradingDays >= 100,
    progress: (stats: TradeStats) => Math.min((stats.tradingDays / 100) * 100, 100)
  },

  // リスク管理
  {
    id: 'risk-apprentice',
    title: 'リスクの芽生え',
    description: '平均利益が平均損失の1.5倍以上を達成',
    icon: Shield.name,
    category: 'risk',
    difficulty: 'beginner',
    condition: (stats: TradeStats) => stats.profitLossRatio >= 1.5,
    progress: (stats: TradeStats) => Math.min((stats.profitLossRatio / 1.5) * 100, 100)
  },
  {
    id: 'risk-sage',
    title: '損小利大の賢者',
    description: '平均利益が平均損失の2倍以上を達成',
    icon: Brain.name,
    category: 'risk',
    difficulty: 'intermediate',
    condition: (stats: TradeStats) => stats.profitLossRatio >= 2.0,
    progress: (stats: TradeStats) => Math.min((stats.profitLossRatio / 2.0) * 100, 100)
  },
  {
    id: 'risk-master',
    title: 'リスクの支配者',
    description: '平均利益が平均損失の3倍以上を達成',
    icon: Scale.name,
    category: 'risk',
    difficulty: 'expert',
    condition: (stats: TradeStats) => stats.profitLossRatio >= 3.0,
    progress: (stats: TradeStats) => Math.min((stats.profitLossRatio / 3.0) * 100, 100)
  },

  // ルール遵守
  {
    id: 'rule-novice',
    title: 'ルールの友',
    description: 'ルール遵守率60%以上を達成',
    icon: Heart.name,
    category: 'rules',
    difficulty: 'beginner',
    condition: (stats: TradeStats) => stats.ruleAdherence >= 60,
    progress: (stats: TradeStats) => Math.min((stats.ruleAdherence / 60) * 100, 100)
  },
  {
    id: 'rule-keeper',
    title: 'ルールの守護者',
    description: 'ルール遵守率80%以上を達成',
    icon: Shield.name,
    category: 'rules',
    difficulty: 'intermediate',
    condition: (stats: TradeStats) => stats.ruleAdherence >= 80,
    progress: (stats: TradeStats) => Math.min((stats.ruleAdherence / 80) * 100, 100)
  },
  {
    id: 'rule-master',
    title: 'ルールの化身',
    description: 'ルール遵守率90%以上を達成',
    icon: Star.name,
    category: 'rules',
    difficulty: 'expert',
    condition: (stats: TradeStats) => stats.ruleAdherence >= 90,
    progress: (stats: TradeStats) => Math.min((stats.ruleAdherence / 90) * 100, 100)
  },

  // 収益性
  {
    id: 'profit-seed',
    title: '収益の種',
    description: '月間プラスを達成',
    icon: LineChart.name,
    category: 'profit',
    difficulty: 'beginner',
    condition: (stats: TradeStats) => stats.monthlyPnL > 0
  },
  {
    id: 'profit-bloom',
    title: '収益の開花',
    description: '3ヶ月連続でプラスを達成',
    icon: Zap.name,
    category: 'profit',
    difficulty: 'intermediate',
    condition: (stats: TradeStats) => stats.consecutiveProfitableMonths >= 3,
    progress: (stats: TradeStats) => 
      stats.consecutiveProfitableMonths ? 
      Math.min((stats.consecutiveProfitableMonths / 3) * 100, 100) : 0
  },
  {
    id: 'profit-legend',
    title: '黄金の果実',
    description: '年間を通してプラスを維持',
    icon: Trophy.name,
    category: 'profit',
    difficulty: 'expert',
    condition: (stats: TradeStats) => 
      stats.yearlyPnL > 0 && stats.tradingDays >= 100
  },

  // 特別な達成
  {
    id: 'special-streak',
    title: '不敗の一週間',
    description: '1週間連続で負けなし',
    icon: Rocket.name,
    category: 'special',
    difficulty: 'intermediate',
    condition: (stats: TradeStats) => stats.maxConsecutiveWins >= 5,
    progress: (stats: TradeStats) => 
      Math.min((stats.maxConsecutiveWins / 5) * 100, 100)
  }
];