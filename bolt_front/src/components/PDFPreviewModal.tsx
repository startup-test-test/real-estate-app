import React, { useState, useEffect } from 'react';
import { X, Download, Printer, Eye } from 'lucide-react';
import SimulationPDFReport from './SimulationPDFReport';
import { SimulationResult } from '../types/simulation';
import { loadGoogleFonts, createSecureLink } from '../utils/sriUtils';

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
  
  // SEC-032: Google Fontsを安全に読み込み
  useEffect(() => {
    loadGoogleFonts('Noto Sans JP', ['400', '500', '600', '700']);
  }, []);

  if (!isOpen) return null;

  const handlePrint = () => {
    // PDF専用ウィンドウで印刷
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) return;

    const printContent = document.getElementById('pdf-preview-content');
    if (!printContent) return;

    // SEC-045/SEC-029: document.writeとinnerHTMLの危険な使用を回避
    const doc = printWindow.document;
    
    // HTMLの基本構造を作成（innerHTMLを使わずにDOM操作で実装）
    while (doc.documentElement.firstChild) {
      doc.documentElement.removeChild(doc.documentElement.firstChild);
    }
    const html = doc.createElement('html');
    const head = doc.createElement('head');
    const body = doc.createElement('body');
    
    // タイトルを設定
    const title = doc.createElement('title');
    title.textContent = `シミュレーション結果 - ${simulation.simulation_name || '物件'}`;
    head.appendChild(title);
    
    // メタタグを設定
    const meta = doc.createElement('meta');
    meta.setAttribute('charset', 'utf-8');
    head.appendChild(meta);
    
    // SEC-032: Google Fontsを別途読み込み（@importを回避）
    const fontLink = createSecureLink(
      'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap'
    );
    head.appendChild(fontLink);
    
    // スタイルを設定
    const style = doc.createElement('style');
    style.textContent = `
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
        width: 100%;
        max-width: none;
      }
      
      .page-break {
        page-break-before: always;
      }
      
      .no-print {
        display: none !important;
      }
    `;
    head.appendChild(style);
    
    // コンテンツを安全に複製
    const printContainer = doc.createElement('div');
    printContainer.className = 'print-container';
    
    // cloneNodeを使用して安全にコンテンツをコピー
    const clonedContent = printContent.cloneNode(true);
    printContainer.appendChild(clonedContent);
    body.appendChild(printContainer);
    
    // HTMLを組み立て
    html.appendChild(head);
    html.appendChild(body);
    doc.documentElement.replaceWith(html);
    
    // 少し待ってから印刷ダイアログを表示
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      onDownloadPDF();
      // PDF生成完了後にフラグをリセット
      setTimeout(() => setIsGeneratingPDF(false), 2000);
    } catch (error) {
      console.error('PDF download error:', error);
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose} data-testid="modal-overlay">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
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
              aria-label="close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* プレビューエリア */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="max-w-none mx-auto">
            <div 
              id="pdf-preview-content"
              className="bg-white shadow-lg rounded-lg overflow-hidden"
              data-testid="pdf-content"
              style={{ 
                width: '210mm', 
                minHeight: '297mm',
                margin: '0 auto',
                transform: 'scale(0.8)',
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