import { Suspense } from 'react';
import SimulatorLPClient from './SimulatorLPClient';

export const metadata = {
  title: '収益シミュレーター | 大家DX',
  description: '不動産投資の収益性をシミュレーション。IRR、CCR、DSCR、35年キャッシュフローを一括計算。完全無料で利用可能。',
};

export default function SimulatorLPPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">読み込み中...</div>}>
      <SimulatorLPClient />
    </Suspense>
  );
}
