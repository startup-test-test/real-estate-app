import React from 'react';
import MetricCard from './MetricCard';
import CashFlowChart from './CashFlowChart';

interface ShareMetricsProps {
  simulationData: any;
  propertyData: any;
}

const ShareMetrics: React.FC<ShareMetricsProps> = ({ simulationData, propertyData }) => {
  return (
    <>
      {/* 物件基本情報 */}
      <div className="bg-white rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">物件情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">物件名</p>
            <p className="font-medium">{propertyData.propertyName || '未設定'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">所在地</p>
            <p className="font-medium">{propertyData.location || '未設定'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">購入価格</p>
            <p className="font-medium">{propertyData.purchasePrice?.toLocaleString() || 0}円</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">想定家賃（月額）</p>
            <p className="font-medium">{propertyData.monthlyRent?.toLocaleString() || 0}円</p>
          </div>
        </div>
      </div>

      {/* 重要指標 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="表面利回り"
          value={simulationData.surfaceYield || 0}
          unit="%"
          format="percentage"
        />
        <MetricCard
          title="実質利回り"
          value={simulationData.netYield || 0}
          unit="%"
          format="percentage"
        />
        <MetricCard
          title="月間キャッシュフロー"
          value={simulationData.monthlyCashFlow || 0}
          unit="円"
          format="currency"
        />
        <MetricCard
          title="IRR"
          value={simulationData.irr || null}
          unit="%"
          format="percentage"
        />
      </div>

      {/* 詳細指標 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">収益指標</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">年間家賃収入</span>
              <span className="font-medium">{simulationData.annualRentalIncome?.toLocaleString() || 0}円</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">年間経費</span>
              <span className="font-medium">{simulationData.annualExpenses?.toLocaleString() || 0}円</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">年間ローン返済</span>
              <span className="font-medium">{simulationData.annualLoanPayment?.toLocaleString() || 0}円</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">年間キャッシュフロー</span>
              <span className={`font-medium ${simulationData.annualCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {simulationData.annualCashFlow?.toLocaleString() || 0}円
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">投資効率指標</h3>
          <div className="space-y-3">
            {simulationData.ccr !== null && (
              <div className="flex justify-between">
                <span className="text-gray-600">CCR (自己資金回収率)</span>
                <span className="font-medium">{simulationData.ccr}%</span>
              </div>
            )}
            {simulationData.dscr !== null && (
              <div className="flex justify-between">
                <span className="text-gray-600">DSCR (返済余裕率)</span>
                <span className="font-medium">{simulationData.dscr}</span>
              </div>
            )}
            {simulationData.roi !== null && (
              <div className="flex justify-between">
                <span className="text-gray-600">ROI</span>
                <span className="font-medium">{simulationData.roi}%</span>
              </div>
            )}
            {simulationData.ltv !== null && (
              <div className="flex justify-between">
                <span className="text-gray-600">LTV (融資比率)</span>
                <span className="font-medium">{simulationData.ltv}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* キャッシュフローチャート */}
      {simulationData.cash_flow_data && (
        <div className="bg-white rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">キャッシュフロー推移</h3>
          <CashFlowChart data={simulationData.cash_flow_data} />
        </div>
      )}
    </>
  );
};

export default ShareMetrics;