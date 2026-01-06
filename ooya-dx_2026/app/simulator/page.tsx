import { Suspense } from 'react';
import SimulatorClient from './SimulatorClient';

export const metadata = {
  title: '不動産賃貸経営シミュレーション | 大家DX',
  description: '投資物件の収益性をシミュレーション。IRR、CCR、DSCRなどの指標を計算します。',
};

export default function SimulatorPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">読み込み中...</div>}>
      <SimulatorClient />
    </Suspense>
  );
}
