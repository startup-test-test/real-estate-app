'use client';

import { useState, useEffect } from 'react';
import { X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
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
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // iOS Safari用の検出
  const isIOS = typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  // iOSの場合は手動インストール案内を表示
  useEffect(() => {
    if (isIOS && !dismissed) {
      const wasDismissed = localStorage.getItem('pwa-banner-dismissed');
      if (!wasDismissed && !window.matchMedia('(display-mode: standalone)').matches) {
        setShowBanner(true);
      }
    }
  }, [isIOS, dismissed]);

  if (!showBanner || dismissed) {
    return null;
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
          {!isIOS && deferredPrompt && (
            <button
              onClick={handleInstall}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors min-h-[44px] min-w-[44px] touch-manipulation cursor-pointer active:bg-blue-100"
            >
              追加する
            </button>
          )}
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
