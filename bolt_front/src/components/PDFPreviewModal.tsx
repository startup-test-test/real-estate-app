import React, { useState } from 'react';
import { X, Download, Printer, Eye } from 'lucide-react';
import SimulationPDFReport from './SimulationPDFReport';
import { SimulationResult } from '../types/simulation';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulation: SimulationResult;
  onDownloadPDF: () => void;
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  simulation,
  onDownloadPDF
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    // PDF専用ウィンドウで印刷
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = document.getElementById('pdf-preview-content');
    if (!printContent) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>シミュレーション結果 - ${simulation.simulation_name || '物件'}</title>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Noto Sans JP', sans-serif;
              line-height: 1.6;
              color: #333;
              background: white;
            }
            
            @page {
              margin: 15mm;
              size: A4;
            }
            
            .print-container {
              width: 210mm;
              max-width: 210mm;
              margin: 0 auto;
              box-sizing: border-box;
            }
            
            @media print {
              .print-container {
                width: 210mm !important;
                max-width: 210mm !important;
              }
            }
            
            .page-break {
              page-break-before: always;
            }
            
            .no-print {
              display: none !important;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // 少し待ってから印刷ダイアログを表示
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await onDownloadPDF();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <Eye className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              PDF プレビュー
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 印刷ボタン */}
            <button
              onClick={handlePrint}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Printer className="h-4 w-4 mr-2" />
              印刷
            </button>
            
            {/* PDF ダウンロードボタン */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? 'PDF生成中...' : 'PDF保存'}
            </button>
            
            {/* 閉じるボタン */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* プレビューエリア */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="max-w-none mx-auto">
            <div 
              id="pdf-preview-content"
              className="bg-white shadow-lg rounded-lg overflow-hidden"
              style={{ 
                width: '210mm', 
                minHeight: '297mm',
                margin: '0 auto',
                transform: window.innerWidth >= 1600 ? 'scale(1)' : window.innerWidth >= 1400 ? 'scale(0.9)' : 'scale(0.85)',
                transformOrigin: 'top center'
              }}
            >
              <SimulationPDFReport 
                simulation={simulation} 
                isPreview={true}
              />
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <p>• プレビューは実際のPDFと若干異なる場合があります</p>
              <p>• 印刷時は「詳細設定」で「背景色を印刷」を有効にすることをお勧めします</p>
            </div>
            <div className="text-right">
              <p className="font-medium">
                物件: {simulation.simulation_name || '名称未設定'}
              </p>
              <p>
                作成日: {new Date().toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;