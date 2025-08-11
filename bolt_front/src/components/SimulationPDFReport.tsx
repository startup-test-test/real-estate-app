import React from 'react';
import { SimulationResult } from '../types/simulation';
import MetricCard from './MetricCard';

interface SimulationPDFReportProps {
  simulation: SimulationResult;
  isPreview?: boolean;
}

const SimulationPDFReport: React.FC<SimulationPDFReportProps> = ({ 
  simulation, 
  isPreview = false 
}) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()}円`;
  };

  const formatPercent = (value: number) => {
    return `${value}%`;
  };

  return (
    <div className={`pdf-report ${isPreview ? 'preview-mode' : 'print-mode'}`}>
      {/* PDF専用スタイル */}
      <style jsx>{`
        .pdf-report {
          font-family: 'Noto Sans JP', sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
        }
        
        .print-mode {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 15mm;
          box-sizing: border-box;
        }
        
        .preview-mode {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          background: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .pdf-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #3b82f6;
        }
        
        .pdf-title {
          font-size: 24px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 10px;
        }
        
        .pdf-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 5px;
        }
        
        .pdf-date {
          font-size: 12px;
          color: #9ca3af;
        }
        
        .pdf-section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        
        .pdf-section-title {
          font-size: 18px;
          font-weight: bold;
          color: #374151;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .pdf-metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .pdf-metric-card {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 15px;
          background: #f9fafb;
        }
        
        .pdf-metric-title {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 5px;
        }
        
        .pdf-metric-value {
          font-size: 20px;
          font-weight: bold;
          color: #1f2937;
        }
        
        .pdf-metric-unit {
          font-size: 14px;
          color: #6b7280;
          margin-left: 3px;
        }
        
        .pdf-property-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .pdf-info-group {
          background: #f8fafc;
          padding: 15px;
          border-radius: 6px;
        }
        
        .pdf-info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .pdf-info-label {
          color: #6b7280;
          font-weight: 500;
        }
        
        .pdf-info-value {
          color: #374151;
          font-weight: 600;
        }
        
        .pdf-chart-placeholder {
          width: 100%;
          height: 200px;
          border: 1px dashed #d1d5db;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          font-size: 14px;
          background: #f9fafb;
        }
        
        .pdf-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 11px;
          color: #6b7280;
          text-align: center;
        }
        
        @media print {
          .pdf-report {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          
          .pdf-section {
            page-break-inside: avoid;
          }
          
          .pdf-metrics-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          
          .pdf-property-info {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        
        @page {
          margin: 15mm;
          size: A4;
        }
      `}</style>

      {/* ヘッダー */}
      <div className="pdf-header">
        <div className="pdf-title">
          不動産投資シミュレーション結果
        </div>
        <div className="pdf-subtitle">
          {simulation.simulation_name || '物件名未設定'}
        </div>
        <div className="pdf-date">
          作成日: {new Date().toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* 物件基本情報 */}
      <div className="pdf-section">
        <div className="pdf-section-title">物件基本情報</div>
        <div className="pdf-property-info">
          <div className="pdf-info-group">
            <div className="pdf-info-item">
              <span className="pdf-info-label">物件価格</span>
              <span className="pdf-info-value">
                {formatCurrency(simulation.input_data?.purchase_price || 0)}
              </span>
            </div>
            <div className="pdf-info-item">
              <span className="pdf-info-label">自己資金</span>
              <span className="pdf-info-value">
                {formatCurrency(simulation.result_data?.['自己資金（円）'] || 0)}
              </span>
            </div>
            <div className="pdf-info-item">
              <span className="pdf-info-label">借入金額</span>
              <span className="pdf-info-value">
                {formatCurrency(simulation.result_data?.['借入額（円）'] || 0)}
              </span>
            </div>
          </div>
          
          <div className="pdf-info-group">
            <div className="pdf-info-item">
              <span className="pdf-info-label">月額家賃収入</span>
              <span className="pdf-info-value">
                {formatCurrency(simulation.input_data?.monthly_rent || 0)}
              </span>
            </div>
            <div className="pdf-info-item">
              <span className="pdf-info-label">年間家賃収入</span>
              <span className="pdf-info-value">
                {formatCurrency((simulation.input_data?.monthly_rent || 0) * 12)}
              </span>
            </div>
            <div className="pdf-info-item">
              <span className="pdf-info-label">表面利回り</span>
              <span className="pdf-info-value">
                {(simulation.result_data?.['表面利回り（%）'] || 0).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 投資指標 */}
      <div className="pdf-section">
        <div className="pdf-section-title">投資指標</div>
        <div className="pdf-metrics-grid">
          <div className="pdf-metric-card">
            <div className="pdf-metric-title">IRR（内部収益率）</div>
            <div className="pdf-metric-value">
              {(simulation.result_data?.['IRR（%）'] || 0).toFixed(2)}
              <span className="pdf-metric-unit">%</span>
            </div>
          </div>
          
          <div className="pdf-metric-card">
            <div className="pdf-metric-title">CCR（自己資金収益率）</div>
            <div className="pdf-metric-value">
              {(simulation.result_data?.['CCR（%）'] || 0).toFixed(2)}
              <span className="pdf-metric-unit">%</span>
            </div>
          </div>
          
          <div className="pdf-metric-card">
            <div className="pdf-metric-title">NOI（純営業収入）</div>
            <div className="pdf-metric-value">
              {formatCurrency(simulation.result_data?.['NOI（円）'] || 0)}
            </div>
          </div>
          
          <div className="pdf-metric-card">
            <div className="pdf-metric-title">年間キャッシュフロー</div>
            <div className="pdf-metric-value">
              {formatCurrency(simulation.result_data?.['年間キャッシュフロー（円）'] || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* キャッシュフロー推移 */}
      <div className="pdf-section">
        <div className="pdf-section-title">キャッシュフロー推移</div>
        <div className="pdf-chart-placeholder">
          ※ キャッシュフロー推移グラフ（PDF版では詳細データ表を表示）
        </div>
      </div>

      {/* 注意事項・免責事項 */}
      <div className="pdf-section">
        <div className="pdf-section-title">重要事項・免責事項</div>
        <div style={{ fontSize: '12px', lineHeight: '1.8', color: '#4b5563' }}>
          <p>• 本シミュレーション結果は、入力された条件に基づく計算結果であり、実際の投資成果を保証するものではありません。</p>
          <p>• 不動産投資にはリスクが伴います。投資判断は専門家のアドバイスを受け、十分にご検討ください。</p>
          <p>• 市場環境の変化、金利変動、空室リスク等により実際の結果は大きく異なる場合があります。</p>
          <p>• 税金、手数料、修繕費等の詳細な費用は含まれていない場合があります。</p>
        </div>
      </div>

      {/* フッター */}
      <div className="pdf-footer">
        <div>大家DX - 不動産投資シミュレーションシステム</div>
        <div>https://ooya-dx.com | ooya.tech2025@gmail.com</div>
      </div>
    </div>
  );
};

export default SimulationPDFReport;