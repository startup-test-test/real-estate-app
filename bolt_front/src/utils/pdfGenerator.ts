/**
 * PDF生成関連のユーティリティ関数
 */

import { escapeHtml } from './sanitize';

/**
 * シミュレーション結果をPDFとして保存する
 * @param propertyName 物件名（PDFタイトルに使用）
 */
export const generateSimulationPDF = (propertyName: string) => {
  // PDFの印刷時に表示するタイトル（SEC-015対応: XSS対策）
  const originalTitle = document.title;
  const sanitizedPropertyName = escapeHtml(propertyName);
  const pdfTitle = sanitizedPropertyName 
    ? `${sanitizedPropertyName} - 不動産投資シミュレーション結果`
    : '不動産投資シミュレーション結果';
  
  document.title = pdfTitle;
  
  // 印刷ダイアログを表示
  window.print();
  
  // タイトルを元に戻す
  document.title = originalTitle;
};