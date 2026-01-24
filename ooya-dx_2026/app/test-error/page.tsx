'use client';

import { useState } from 'react';

export default function TestErrorPage() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('これはテストエラーです。エラーページの動作確認用。');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          エラーページテスト
        </h1>
        <p className="text-gray-600 mb-8">
          下のボタンをクリックすると、意図的にエラーを発生させてエラーページを表示します。
        </p>

        <button
          onClick={() => setShouldError(true)}
          className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          エラーを発生させる
        </button>

        <p className="mt-8 text-sm text-gray-500">
          ※ 本番環境ではこのページを削除することを推奨します
        </p>
      </div>
    </div>
  );
}
