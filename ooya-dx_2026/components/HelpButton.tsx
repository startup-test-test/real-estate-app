"use client";

import React, { useState, useRef, useEffect } from "react";
import { HelpCircle, BookOpen, MessageCircle, PlayCircle } from "lucide-react";
import Link from "next/link";

interface HelpButtonProps {
  onStartTutorial?: () => void;
  showPulse?: boolean; // 初回ユーザー用のアニメーション
}

export default function HelpButton({ onStartTutorial, showPulse = false }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ヘルプボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative flex items-center justify-center
          w-9 h-9 rounded-full
          bg-gray-100 hover:bg-gray-200
          text-gray-600 hover:text-gray-800
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${showPulse ? "animate-pulse-subtle" : ""}
        `}
        aria-label="ヘルプメニューを開く"
      >
        <HelpCircle className="h-5 w-5" />

        {/* 初回ユーザー用のドット */}
        {showPulse && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        )}
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {/* チュートリアル開始 */}
            {onStartTutorial && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onStartTutorial();
                }}
                className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <PlayCircle className="h-5 w-5 mr-3 text-blue-500" />
                <div className="text-left">
                  <div className="font-medium">使い方を確認</div>
                  <div className="text-xs text-gray-500">ステップバイステップで案内</div>
                </div>
              </button>
            )}

            {/* 使い方ガイド */}
            <Link
              href="/mypage/guide"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <BookOpen className="h-5 w-5 mr-3 text-green-500" />
              <div className="text-left">
                <div className="font-medium">ガイド・FAQ</div>
                <div className="text-xs text-gray-500">よくある質問と解説</div>
              </div>
            </Link>

            {/* お問い合わせ */}
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="h-5 w-5 mr-3 text-purple-500" />
              <div className="text-left">
                <div className="font-medium">お問い合わせ</div>
                <div className="text-xs text-gray-500">ご質問・ご要望はこちら</div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
