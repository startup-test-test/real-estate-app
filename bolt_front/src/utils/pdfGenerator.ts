/**
 * PDF生成関連のユーティリティ関数
 */

/**
 * シミュレーション結果をPDFとして保存する
 * @param propertyName 物件名（PDFタイトルに使用）
 */
export const generateSimulationPDF = (propertyName: string) => {
  // PDFの印刷時に表示するタイトル
  const originalTitle = document.title;
  const pdfTitle = propertyName 
    ? `${propertyName} - 不動産投資シミュレーション結果`
    : '不動産投資シミュレーション結果';
  
  document.title = pdfTitle;
  
  // 印刷ダイアログを表示
  window.print();
  
  // タイトルを元に戻す
  document.title = originalTitle;
};