import React from 'react';
import { Share2 } from 'lucide-react';

interface ShareButtonsProps {
  title?: string;
  description?: string;
}

export default function ShareButtons({ 
  title = 'デイトレード日記 - トレード記録・分析アプリ',
  description = 'デイトレードの取引記録と分析を簡単に管理。損益管理、ルール遵守率の追跡、パフォーマンス分析機能を提供する無料のトレード管理ツールです。'
}: ShareButtonsProps) {
  const url = 'https://daytrade.nakmits.com/';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  if (!navigator.share) return null;

  return (
    <button
      onClick={handleShare}
      className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors sm:ml-2"
      title="シェア"
    >
      <Share2 className="w-5 h-5" />
    </button>
  );
}