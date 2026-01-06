'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, X } from 'lucide-react';

interface FixedCTAProps {
  isAuthenticated?: boolean;
}

const FixedCTA: React.FC<FixedCTAProps> = ({ isAuthenticated = false }) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // ヒーローセクションを過ぎたら表示（約500px下）
      const shouldShow = currentScrollY > 500;
      
      // フッターエリアに近づいたら非表示（下から200px）
      const nearFooter = currentScrollY + windowHeight > documentHeight - 200;
      
      // スクロール方向を検知（下にスクロール中は表示、上は非表示）
      const scrollingDown = currentScrollY > lastScrollY;
      
      if (shouldShow && !nearFooter && !isHidden) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    // 初回チェック
    handleScroll();
    
    // スクロールイベントリスナー
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, isHidden]);

  // ログイン済みユーザーには表示しない
  if (isAuthenticated) {
    return null;
  }

  // ユーザーが閉じるボタンを押した場合
  const handleClose = () => {
    setIsHidden(true);
    setIsVisible(false);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transform transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-white/95 backdrop-blur-sm shadow-2xl border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="py-3 sm:py-4 flex items-center justify-center">
            {/* ボタン部分（中央配置） */}
            <button
              onClick={() => router.push('/auth/signup')}
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
            >
              <div className="flex flex-col items-center">
                <span className="text-base sm:text-lg font-bold">まずは10秒で無料登録する</span>
                <span className="text-xs sm:text-sm mt-1 opacity-90">（クレジットカード登録不要）</span>
              </div>
              <ArrowRight className="hidden sm:block h-5 w-5 ml-3" />
            </button>
          </div>
          
          {/* 閉じるボタン（絶対配置で右端） */}
          <button
            onClick={handleClose}
            className="absolute top-1/2 -translate-y-1/2 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* プログレスバー（オプション） */}
      <div className="h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 animate-pulse"></div>
    </div>
  );
};

export default FixedCTA;