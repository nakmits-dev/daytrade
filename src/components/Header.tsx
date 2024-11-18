import React from 'react';
import { LineChart, LogOut, User as UserIcon } from 'lucide-react';
import { UserProfile } from '../lib/db';
import ShareButtons from './ShareButtons';

interface HeaderProps {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <LineChart className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">デイトレード日記</h1>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={onProfileClick}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-100 rounded-lg"
            >
              <UserIcon className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-700 hidden sm:inline">{profile.name}</span>
            </button>
            <ShareButtons />
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