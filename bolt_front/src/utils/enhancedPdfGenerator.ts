import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import DOMPurify from 'dompurify';
import { SimulationResult } from '../types/simulation';

/**
 * 改良されたPDF生成関数
 * 専用レイアウトコンポーネントを使用してPDFを生成
 */
export const generateEnhancedPDF = async (
  simulation: SimulationResult,
  elementId: string = 'pdf-preview-content'
): Promise<void> => {
  try {
    console.log('📄 Starting PDF generation with data:', simulation);
    
    // まずプレビューモーダルを確認
    let element = document.getElementById(elementId);
    
    // プレビューモーダルが開いていない場合は、メインコンテンツを使用
    if (!element) {
      console.log('📄 PDF preview not found, using main content');
      element = document.getElementById('pdf-content');
    }
    
    if (!element) {
      throw new Error('PDF生成対象の要素が見つかりません（pdf-preview-content または pdf-content）');
    }
    
    console.log('📄 Using element:', element.id);

    // 高品質な画像キャプチャ設定
    const canvas = await html2canvas(element, {
      scale: 2, // 高解像度
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      allowTaint: false,
      foreignObjectRendering: true,
      imageTimeout: 10000,
      removeContainer: true
    });

    // PDF設定（A4サイズ）
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // A4サイズの寸法（mm）
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10; // 上下左右のマージン
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);

    // Canvas から画像データを取得
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // 画像の実際のサイズを計算
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // ページ分割が必要かチェック
    if (imgHeight <= contentHeight) {
      // 1ページに収まる場合
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    } else {
      // 複数ページに分割する場合
      let remainingHeight = imgHeight;
      let currentY = 0;
      let pageNumber = 1;

      while (remainingHeight > 0) {
        // 現在のページに表示する高さを計算
        const currentPageHeight = Math.min(contentHeight, remainingHeight);
        
        // ページを追加（1ページ目は既存のページを使用）
        if (pageNumber > 1) {
          pdf.addPage();
        }

        // 画像の一部を描画
        const sourceY = imgHeight - remainingHeight;
        const canvasSlice = document.createElement('canvas');
        const sliceCtx = canvasSlice.getContext('2d');
        
        if (sliceCtx) {
          // スライス用のキャンバスサイズを設定
          canvasSlice.width = canvas.width;
          canvasSlice.height = (currentPageHeight * canvas.width) / imgWidth;
          
          // 元のキャンバスから該当部分を切り出し
          sliceCtx.drawImage(
            canvas,
            0, (sourceY * canvas.width) / imgWidth, // ソースの位置
            canvas.width, canvasSlice.height, // ソースのサイズ
            0, 0, // 出力位置
            canvas.width, canvasSlice.height // 出力サイズ
          );

          const sliceData = canvasSlice.toDataURL('image/png', 1.0);
          pdf.addImage(sliceData, 'PNG', margin, margin, imgWidth, currentPageHeight);
        }

        remainingHeight -= currentPageHeight;
        pageNumber++;
      }
    }

    // ファイル名を生成
    const fileName = generatePDFFileName(simulation);
    
    // PDFを保存
    pdf.save(fileName);

  } catch (error) {
    console.error('Enhanced PDF generation error:', error);
    throw new Error('PDFの生成に失敗しました。しばらく待ってから再度お試しください。');
  }
};

/**
 * PDF専用要素を一時的に作成してPDF生成
 * 既存のレイアウトに影響を与えずにPDF生成
 */
export const generatePDFFromComponent = async (
  simulation: SimulationResult,
  componentHTML: string
): Promise<void> => {
  const tempContainer = document.createElement('div');
  tempContainer.id = 'temp-pdf-container';
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '210mm';
  tempContainer.style.background = 'white';
  // SEC-029: innerHTMLの安全な使用のためDOMPurifyでサニタイズ
  const sanitizedHTML = DOMPurify.sanitize(componentHTML, {
    ADD_TAGS: ['style'], // PDFスタイルを許可
    ADD_ATTR: ['style'], // インラインスタイルを許可
    ALLOW_DATA_ATTR: false, // data-*属性は不要
    ALLOW_UNKNOWN_PROTOCOLS: false // 未知のプロトコルを拒否
  });
  tempContainer.innerHTML = sanitizedHTML;

  document.body.appendChild(tempContainer);

  try {
    await generateEnhancedPDF(simulation, 'temp-pdf-container');
  } finally {
    document.body.removeChild(tempContainer);
  }
};

/**
 * PDFファイル名を生成
 */
const generatePDFFileName = (simulation: SimulationResult): string => {
  const propertyName = simulation.simulation_name || '物件';
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD形式
  const sanitizedName = propertyName.replace(/[<>:"/\\|?*]/g, '_'); // ファイル名に使用できない文字を置換
  
  return `シミュレーション結果_${sanitizedName}_${date}.pdf`;
};

/**
 * PDFプレビュー用の一時的なスタイルを適用
 */
export const applyPDFStyles = (): void => {
  const style = document.createElement('style');
  style.id = 'pdf-temp-styles';
  style.textContent = `
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .pdf-report {
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
      }
      
      .no-print {
        display: none !important;
      }
      
      .page-break {
        page-break-before: always;
      }
      
      .avoid-page-break {
        page-break-inside: avoid;
      }
    }
  `;
  document.head.appendChild(style);
};

/**
 * 一時的なPDFスタイルを削除
 */
export const removePDFStyles = (): void => {
  const style = document.getElementById('pdf-temp-styles');
  if (style) {
    style.remove();
  }
};