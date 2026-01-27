'use client';

import { useState, useEffect } from 'react';
import { X, Smartphone, MoreVertical } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // デバイス検出
    const userAgent = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(userAgent);
    const android = /Android/.test(userAgent);
    const isMobile = ios || android;

    // スマートフォンではバナーを表示しない
    if (isMobile) {
      return;
    }

    setIsIOS(ios);
    setIsAndroid(android);

    // 既に閉じたことがあるか確認
    const wasDismissed = localStorage.getItem('pwa-banner-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // スタンドアロンモード（既にインストール済み）の場合は表示しない
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // PCでbeforeinstallpromptイベントが発火した場合のみ表示
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // deferredPromptがない場合は手順を表示
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowInstructions(false);
    setDismissed(true);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  if (!showBanner || dismissed) {
    return null;
  }

  // 手順モーダル
  if (showInstructions) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-4 print:hidden relative z-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-3">
            <p className="font-medium text-sm sm:text-base">
              ホーム画面への追加方法
            </p>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation cursor-pointer active:bg-white/30 flex-shrink-0"
              aria-label="閉じる"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isIOS ? (
            <ol className="text-sm text-blue-100 space-y-2">
              <li>1. 画面下部の共有ボタン（□↑）をタップ</li>
              <li>2. 「ホーム画面に追加」を選択</li>
              <li>3. 右上の「追加」をタップ</li>
            </ol>
          ) : (
            <ol className="text-sm text-blue-100 space-y-2">
              <li className="flex items-center gap-2">
                1. 右上の <MoreVertical className="w-4 h-4 inline" /> メニューをタップ
              </li>
              <li>2. 「ホーム画面に追加」または「アプリをインストール」を選択</li>
              <li>3. 「追加」または「インストール」をタップ</li>
            </ol>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-4 print:hidden relative z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-sm sm:text-base">
              大家DXをホーム画面に追加
            </p>
            <p className="text-xs sm:text-sm text-blue-100">
              {isIOS
                ? '共有ボタン → 「ホーム画面に追加」'
                : 'アプリのようにすぐアクセス'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors min-h-[44px] touch-manipulation cursor-pointer active:bg-blue-100"
          >
            {deferredPrompt ? '追加する' : '方法を見る'}
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation cursor-pointer active:bg-white/30"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
