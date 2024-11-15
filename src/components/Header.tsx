import React from 'react';
import { LineChart, LogOut, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';
import { TradeDataStore } from '../data/mockTradeData';
import { UserProfile } from '../lib/db';

interface HeaderProps {
  tradeData: TradeDataStore;
  selectedDate: Date;
  profile: UserProfile;
  onSignOut: () => void;
  onProfileClick: () => void;
}

export default function Header({ 
  profile, 
  onSignOut,
  onProfileClick 
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LineChart className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">デイトレード日記</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onProfileClick}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg"
            >
              <UserIcon className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-700">{profile.name}</span>
            </button>
            <button
              onClick={onSignOut}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}