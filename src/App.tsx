import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import Header from './components/Header';
import Calendar from './components/Calendar';
import TradeForm from './components/TradeForm';
import Auth from './components/Auth';
import Profile from './components/Profile';
import MonthlySummary from './components/MonthlySummary';
import { auth } from './lib/firebase';
import { fetchTradeData, fetchUserProfile, UserProfile } from './lib/db';
import { getJSTDate } from './lib/date';
import { TradeStats } from './lib/types';
import { calculateTradeStats } from './lib/stats';

const initialStats: TradeStats = {
  oneMonthStats: { totalPnL: 0, winRate: 0, tradingDays: 0, ruleAdherence: 0 },
  threeMonthsStats: { totalPnL: 0, winRate: 0, tradingDays: 0, ruleAdherence: 0 },
  sixMonthsStats: { totalPnL: 0, winRate: 0, tradingDays: 0, ruleAdherence: 0 },
  oneYearStats: { totalPnL: 0, winRate: 0, tradingDays: 0, ruleAdherence: 0 },
  totalStats: { totalPnL: 0, winRate: 0, tradingDays: 0, ruleAdherence: 0 },
  accountSize: 1000000
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tradeData, setTradeData] = useState<{ [key: string]: any }>({});
  const [yearlyTradeData, setYearlyTradeData] = useState<{ [key: string]: any }>({});
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [stats, setStats] = useState<TradeStats>(initialStats);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        if (!user.emailVerified) {
          await auth.signOut();
          setUser(null);
          setProfile(null);
          setInitialLoading(false);
          return;
        }
        setUser(user);
        const jstDate = getJSTDate(selectedDate);
        await Promise.all([
          loadTradeData(user.uid, jstDate.getUTCFullYear(), jstDate.getUTCMonth() + 1),
          loadUserProfile(user.uid)
        ]);
      } else {
        setUser(null);
        setTradeData({});
        setProfile(null);
      }
      setInitialLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadTradeData = async (userId: string, year?: number, month?: number) => {
    try {
      // 現在の月のデータを取得
      const monthlyData = await fetchTradeData(userId, year, month);
      
      // 前月のデータも取得
      const prevDate = new Date(Date.UTC(year || 0, (month || 1) - 2, 1));
      const prevMonthData = await fetchTradeData(
        userId,
        prevDate.getUTCFullYear(),
        prevDate.getUTCMonth() + 1
      );

      // データをマージ
      setTradeData({ ...prevMonthData, ...monthlyData });

      if (showProfile) {
        const yearlyData = await fetchTradeData(userId, year, undefined, true);
        setYearlyTradeData(yearlyData);
      }

      const allData = { ...prevMonthData, ...monthlyData, ...yearlyTradeData };
      const newStats = calculateTradeStats(allData);
      setStats(newStats);
    } catch (error) {
      console.error('データ読み込みエラー:', error);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const userProfile = await fetchUserProfile(userId);
      if (userProfile) {
        setProfile(userProfile);
      } else {
        await auth.signOut();
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('プロフィール読み込みエラー:', error);
      await auth.signOut();
      setUser(null);
      setProfile(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const handleMonthChange = (year: number, month: number) => {
    if (user) {
      loadTradeData(user.uid, year, month);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleProfileToggle = () => {
    setShowProfile(!showProfile);
    if (!showProfile && user) {
      const jstDate = getJSTDate(selectedDate);
      loadTradeData(user.uid, jstDate.getUTCFullYear(), undefined, true);
    }
  };

  if (!user) {
    return <Auth />;
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-gray-600">プロフィールが見つかりません</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header
        profile={profile}
        onSignOut={handleSignOut}
        onProfileClick={handleProfileToggle}
      />
      
      <main className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {showProfile ? (
            <Profile
              profile={profile}
              userId={user.uid}
              onUpdate={() => loadUserProfile(user.uid)}
              stats={stats}
              tradeData={{ ...tradeData, ...yearlyTradeData }}
              onBack={() => setShowProfile(false)}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Calendar 
                    selectedDate={selectedDate} 
                    onDateSelect={handleDateSelect}
                    tradeData={tradeData}
                    onMonthChange={handleMonthChange}
                  />
                </div>
                <div>
                  <TradeForm
                    selectedDate={selectedDate}
                    onSave={async (data) => {
                      if (!user) return;
                      const jstDate = getJSTDate(selectedDate);
                      await loadTradeData(user.uid, jstDate.getUTCFullYear(), jstDate.getUTCMonth() + 1);
                    }}
                    tradeData={tradeData}
                    userId={user.uid}
                  />
                </div>
              </div>
              <MonthlySummary
                selectedDate={selectedDate}
                tradeData={tradeData}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}