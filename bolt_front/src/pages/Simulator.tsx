import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useAuthContext } from '../components/AuthProvider';
import { useLocation } from 'react-router-dom';
import CashFlowChart from '../components/CashFlowChart';
import Tooltip from '../components/Tooltip';
import Tutorial from '../components/Tutorial';
import BackButton from '../components/BackButton';
import Breadcrumb from '../components/Breadcrumb';
import ImageUpload from '../components/ImageUpload';
import ErrorAlert from '../components/ErrorMessage';
import ErrorModal from '../components/ErrorModal';
// import { LegalDisclaimer } from '../components';
import { SimulationResultData, CashFlowData } from '../types';
import { validatePropertyUrl } from '../utils/validation';
import { validateSimulatorInputs } from '../utils/securityValidation';
import { transformFormDataToApiData } from '../utils/dataTransform';
import { emptyPropertyData } from '../constants/sampleData';
import { tooltips } from '../constants/tooltips';
import { propertyStatusOptions, loanTypeOptions, ownershipTypeOptions, buildingStructureOptions } from '../constants/masterData';
import { formatCurrencyNoSymbol } from '../utils/formatHelpers';
import { handleApiError, logError, getUserFriendlyErrorMessage } from '../utils/errorHandler';

// FAST API のベースURL
// const API_BASE_URL = 'https://real-estate-app-1-iii4.onrender.com';

interface SimulationResult {
  results: SimulationResultData;
  cash_flow_table?: CashFlowData[];
}




const Simulator: React.FC = () => {
  const { user } = useAuthContext();
  const { saveSimulation, getSimulations } = useSupabaseData();
  const location = useLocation();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResult | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isManualDepreciation, setIsManualDepreciation] = useState(false);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [showEvaluationPopup, setShowEvaluationPopup] = useState(false);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  const [inputs, setInputs] = useState<any>(emptyPropertyData);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorModalData, setErrorModalData] = useState<{
    isOpen: boolean;
    errorCode?: string;
    message: string;
    solution?: string;
    details?: string[];
  }>({ isOpen: false, message: '' });
  
  // エラー時のフィールドクラス名を取得
  const getFieldClassName = (fieldName: string, baseClass: string = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent") => {
    return `${baseClass} ${
      fieldErrors[fieldName] 
        ? 'border-red-300 bg-red-50 focus:ring-red-500' 
        : 'border-gray-300 focus:ring-indigo-500'
    }`;
  };
  
  // フィールド変更時のハンドラー（エラークリア付き）
  const handleFieldChange = (fieldName: string, value: any) => {
    handleInputChange(fieldName, value);
    // 入力時にエラーをクリア
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // フォーカス時の処理（0をクリアまたは全選択）
  const handleNumberInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const fieldName = e.target.name || e.target.getAttribute('data-field');
    
    // 値が0の場合は状態を空にする
    if (e.target.value === '0' && fieldName) {
      handleFieldChange(fieldName, '');
    } else if (e.target.value) {
      // 値がある場合は全選択（モバイルでも確実に動作するように）
      requestAnimationFrame(() => {
        e.target.select();
      });
    }
  };

  // キー入力時の処理（0の場合の特別処理）
  const handleNumberInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const fieldName = e.currentTarget.name || e.currentTarget.getAttribute('data-field');
    
    // 値が0で、数字キーまたはDeleteキーが押された場合
    if (e.currentTarget.value === '0' && fieldName) {
      if ((e.key >= '0' && e.key <= '9') || e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleFieldChange(fieldName, e.key >= '0' && e.key <= '9' ? e.key : '');
      }
    }
  };
  
  // エラーメッセージコンポーネント
  const ErrorMessage = ({ fieldName }: { fieldName: string }) => {
    if (!fieldErrors[fieldName]) return null;
    return (
      <p className="text-xs text-red-600 mt-1 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {fieldErrors[fieldName]}
      </p>
    );
  };




  // 初回アクセス時にチュートリアルを表示
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      localStorage.setItem('hasSeenTutorial', 'true');
    }
  }, []);

  // URLパラメータから編集IDまたは閲覧IDを取得
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const editId = searchParams.get('edit');
    const viewId = searchParams.get('view');
    
    if (editId) {
      setEditingId(editId);
      loadExistingData(editId);
    } else if (viewId) {
      setEditingId(viewId);
      loadExistingData(viewId);
    }
  }, [location.search]);


  // Hash-based scrolling to results section
  useEffect(() => {
    // Check if URL contains #results hash
    if (location.hash === '#results' && simulationResults && resultsRef.current) {
      // Delay scroll to ensure results are fully rendered
      const timer = setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [location.hash, simulationResults]);

  // 既存データを読み込む
  const loadExistingData = async (simulationId: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await getSimulations();
      
      if (error) {
        setSaveError(`データ読み込みエラー: ${error}`);
        return;
      }
      
      const simulation = data?.find(sim => sim.id === simulationId);
      if (simulation && simulation.simulation_data) {
        const simData = simulation.simulation_data;
        console.log('📖 読み込みデータ詳細:', {
          renovationCost: simData.renovationCost,
          managementFee: simData.managementFee,
          vacancyRate: simData.vacancyRate,
          fixedCost: simData.fixedCost,
          fullData: simData
        });
        setInputs({
          propertyName: simData.propertyName || '品川区投資物件',
          location: simData.location || '東京都品川区',
          yearBuilt: simData.yearBuilt !== undefined ? simData.yearBuilt : 2020,
          propertyType: simData.propertyType || '',
          landArea: simData.landArea !== undefined ? simData.landArea : 135.00,
          buildingArea: simData.buildingArea !== undefined ? simData.buildingArea : 150.00,
          roadPrice: simData.roadPrice !== undefined ? simData.roadPrice : 250000,
          marketValue: simData.marketValue !== undefined ? simData.marketValue : 8000,
          purchasePrice: simData.purchasePrice !== undefined ? simData.purchasePrice : 6980,
          otherCosts: simData.otherCosts !== undefined ? simData.otherCosts : 300,
          renovationCost: simData.renovationCost !== undefined ? simData.renovationCost : 200,
          monthlyRent: simData.monthlyRent !== undefined ? simData.monthlyRent : 250000,
          managementFee: simData.managementFee !== undefined ? simData.managementFee : 5000,
          fixedCost: simData.fixedCost !== undefined ? simData.fixedCost : 0,
          propertyTax: simData.propertyTax !== undefined ? simData.propertyTax : 100000,
          vacancyRate: simData.vacancyRate !== undefined ? simData.vacancyRate : 5.00,
          rentDecline: simData.rentDecline !== undefined ? simData.rentDecline : 1.00,
          loanAmount: simData.loanAmount !== undefined ? simData.loanAmount : 6500,
          interestRate: simData.interestRate !== undefined ? simData.interestRate : 0.70,
          loanYears: simData.loanYears !== undefined ? simData.loanYears : 35,
          loanType: simData.loanType || '元利均等',
          holdingYears: simData.holdingYears !== undefined ? simData.holdingYears : 10,
          exitCapRate: simData.exitCapRate !== undefined ? simData.exitCapRate : 6.00,
          expectedSalePrice: simData.expectedSalePrice !== undefined ? simData.expectedSalePrice : 1600,
          ownershipType: simData.ownershipType || '個人',
          effectiveTaxRate: simData.effectiveTaxRate !== undefined ? simData.effectiveTaxRate : 20,
          majorRepairCycle: simData.majorRepairCycle !== undefined ? simData.majorRepairCycle : 10,
          majorRepairCost: simData.majorRepairCost !== undefined ? simData.majorRepairCost : 200,
          buildingPriceForDepreciation: simData.buildingPriceForDepreciation !== undefined ? simData.buildingPriceForDepreciation : 3000,
          depreciationYears: simData.depreciationYears !== undefined ? simData.depreciationYears : 27,
          propertyUrl: simData.propertyUrl || '',
          propertyMemo: simData.propertyMemo || '',
          propertyImageUrl: simData.propertyImageUrl || '',
          propertyStatus: simData.propertyStatus || '検討中',
          annualDepreciationRate: simData.annualDepreciationRate !== undefined ? simData.annualDepreciationRate : 1.0,
          priceDeclineRate: simData.priceDeclineRate !== undefined && simData.priceDeclineRate !== null ? simData.priceDeclineRate : 0
        });
        
        // 既存の結果も表示
        if (simulation.results) {
          setSimulationResults({
            results: {
              '表面利回り（%）': simulation.results.surfaceYield || simulation.results['表面利回り（%）'],
              '実質利回り（%）': simulation.results.netYield || simulation.results['実質利回り'] || simulation.results['実質利回り（%）'],
              'IRR（%）': simulation.results.irr || simulation.results['IRR'] || simulation.results['IRR（%）'],
              'CCR（%）': simulation.results.ccr || simulation.results['CCR'] || simulation.results['CCR（%）'],
              'CCR（初年度）（%）': simulation.results['CCR（初年度）（%）'] || 0,
              'CCR（全期間）（%）': simulation.results['CCR（全期間）（%）'] || 0,
              'ROI（%）': simulation.results.roi || simulation.results['ROI'] || simulation.results['ROI（%）'],
              'ROI（初年度）（%）': simulation.results['ROI（初年度）（%）'] || 0,
              'ROI（全期間）（%）': simulation.results['ROI（全期間）（%）'] || 0,
              'DSCR（返済余裕率）': simulation.results.dscr || simulation.results['DSCR'],
              'NOI（円）': simulation.results.noi || simulation.results['NOI'] || simulation.results['NOI（円）'],
              'LTV（%）': simulation.results.ltv || simulation.results['LTV'] || simulation.results['LTV（%）'],
              '月間キャッシュフロー（円）': simulation.results.monthlyCashFlow,
              '年間キャッシュフロー（円）': simulation.results.annualCashFlow,
              '積算評価合計（万円）': simulation.results.assessedTotal || simulation.results['積算評価合計（万円）'],
              '収益還元評価額（万円）': simulation.results.capRateEval || simulation.results['収益還元評価額（万円）'],
              '想定売却価格（万円）': simulation.results.expectedSalePrice || simulation.results['想定売却価格（万円）'] || simulation.results['売却時想定価格'],
              '残債（万円）': simulation.results['残債（万円）'] || 0,
              '売却コスト（万円）': simulation.results['売却コスト（万円）'] || 0,
              '売却益（万円）': simulation.results['売却益（万円）'] || 0,
              '総投資額（円）': simulation.results['総投資額（円）'] || 0,
              '自己資金（円）': simulation.results['自己資金（円）'] || 0,
              '借入額（円）': simulation.results['借入額（円）'] || 0,
              '土地積算評価（万円）': simulation.results['土地積算評価（万円）'] || 0,
              '建物積算評価（万円）': simulation.results['建物積算評価（万円）'] || 0
            },
            cash_flow_table: simulation.cash_flow_table
          });
        }
        
        
      }
    } catch (err: any) {
      setSaveError(`データ読み込みエラー: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 全角数字を半角に変換する関数（BUG_011対応）
  const convertFullWidthToHalfWidth = (str: string): string => {
    // 全角数字を半角に変換
    let result = str.replace(/[０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
    
    // 全角ピリオドを半角に変換
    result = result.replace(/．/g, '.');
    
    // 全角カンマを半角に変換（さらに除去）
    result = result.replace(/，/g, ',');
    
    // カンマを除去（BUG_016対応の準備）
    result = result.replace(/,/g, '');
    
    return result;
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    // 数値入力フィールドの場合、全角数字を半角に変換
    if (typeof value === 'string') {
      const convertedValue = convertFullWidthToHalfWidth(value);
      const numValue = Number(convertedValue);
      if (!isNaN(numValue) && convertedValue !== '') {
        value = numValue;
      } else if (convertedValue === '') {
        value = '';  // 空文字列の場合はそのまま
      }
    } else if (typeof value === 'number' && isNaN(value)) {
      // NaNの場合は0に変換
      value = 0;
    }
    
    setInputs((prev: any) => {
      const newInputs = {
        ...prev,
        [field]: value
      };

      // 自動設定機能
      if (field === 'purchasePrice' && typeof value === 'number' && value > 0) {
        // 建物価格：購入価格の30%を自動設定
        if (!prev.buildingPriceForDepreciation || prev.buildingPriceForDepreciation === 0) {
          newInputs.buildingPriceForDepreciation = Math.round(value * 0.3);
        }
        // 諸経費：購入価格の7%を自動設定
        if (!prev.otherCosts || prev.otherCosts === 0) {
          newInputs.otherCosts = Math.round(value * 0.07);
        }
        // 固定資産税：購入価格の0.7%を自動設定
        if (!prev.propertyTax || prev.propertyTax === 0) {
          newInputs.propertyTax = Math.round(value * 0.007 * 10000); // 万円→円
        }
      }

      // 管理手数料：月額賃料の5%を自動設定
      if (field === 'monthlyRent' && typeof value === 'number' && value > 0) {
        if (!prev.managementFee || prev.managementFee === 0) {
          newInputs.managementFee = Math.round(value * 0.05);
        }
      }

      // 建築年・建物構造変更時の減価償却年数自動計算（手動モードでない場合のみ）
      if (!isManualDepreciation && (field === 'yearBuilt' || field === 'propertyType')) {
        const currentYear = new Date().getFullYear();
        const buildingYear = field === 'yearBuilt' ? Number(value) : newInputs.yearBuilt;
        const structure = field === 'propertyType' ? String(value) : newInputs.propertyType;
        
        console.log('🔧 減価償却自動計算:', {
          field,
          value,
          buildingYear,
          structure,
          isManualDepreciation
        });
        
        if (buildingYear && buildingYear > 0 && structure) {
          // 法定耐用年数の取得
          const getLegalUsefulLife = (structure: string): number => {
            switch (structure) {
              case 'RC': return 47;
              case 'SRC': return 39;
              case 'S': return 34; // 重量鉄骨造
              case '木造': return 22;
              default: return 27; // 軽量鉄骨造をデフォルト
            }
          };
          
          const legalYears = getLegalUsefulLife(structure);
          const buildingAge = currentYear - buildingYear;
          let remainingYears: number;
          
          // 中古資産の耐用年数計算（税務上の正しい計算）
          if (buildingAge >= legalYears) {
            // 法定耐用年数を超過している場合
            remainingYears = Math.floor(legalYears * 0.2); // 法定耐用年数の20%
            remainingYears = Math.max(4, remainingYears); // 最低4年
          } else {
            // 法定耐用年数内の場合
            remainingYears = Math.floor((legalYears - buildingAge) + buildingAge * 0.2);
            remainingYears = Math.max(4, remainingYears); // 最低4年
          }
          
          console.log('📊 計算結果:', {
            legalYears,
            buildingAge,
            remainingYears,
            isExceeded: buildingAge >= legalYears
          });
          
          newInputs.depreciationYears = remainingYears;
        }
      }

      return newInputs;
    });
  };

  const urlError = inputs.propertyUrl ? validatePropertyUrl(inputs.propertyUrl) : null;

  // バリデーションチェック関数
  const validateForm = () => {
    const errors: string[] = [];
    const fieldErrorsMap: Record<string, string> = {};
    
    // 物件情報（必須）
    if (!inputs.propertyName) {
      errors.push('物件名を入力してください');
      fieldErrorsMap.propertyName = '物件名を入力してください';
    }
    if (!inputs.location) {
      errors.push('所在地を入力してください');
      fieldErrorsMap.location = '所在地を入力してください';
    }
    if (!inputs.yearBuilt || inputs.yearBuilt <= 0) {
      errors.push('建築年を入力してください');
      fieldErrorsMap.yearBuilt = '建築年を入力してください';
    }
    if (!inputs.propertyType) {
      errors.push('建物構造を選択してください');
      fieldErrorsMap.propertyType = '建物構造を選択してください';
    }
    
    // 取得・初期費用（必須）
    if (!inputs.purchasePrice || inputs.purchasePrice <= 0) {
      errors.push('物件価格を入力してください');
      fieldErrorsMap.purchasePrice = '物件価格を入力してください';
    }
    
    // 収益情報（必須）
    if (!inputs.monthlyRent || inputs.monthlyRent <= 0) {
      errors.push('月額賃料を入力してください');
      fieldErrorsMap.monthlyRent = '月額賃料を入力してください';
    }
    
    // 借入条件（必須）
    if (inputs.loanAmount === undefined || inputs.loanAmount < 0) {
      errors.push('借入額を入力してください');
      fieldErrorsMap.loanAmount = '借入額を入力してください';
    }
    if (inputs.interestRate === undefined || inputs.interestRate < 0) {
      errors.push('金利を入力してください');
      fieldErrorsMap.interestRate = '金利を入力してください';
    }
    if (!inputs.loanYears || inputs.loanYears <= 0) {
      errors.push('借入年数を入力してください');
      fieldErrorsMap.loanYears = '借入年数を入力してください';
    }
    if (!inputs.loanType) {
      errors.push('借入タイプを選択してください');
      fieldErrorsMap.loanType = '借入タイプを選択してください';
    }
    
    // 出口戦略（必須）
    if (!inputs.holdingYears || inputs.holdingYears <= 0) {
      errors.push('保有年数を入力してください');
      fieldErrorsMap.holdingYears = '保有年数を入力してください';
    }
    if (!inputs.exitCapRate || inputs.exitCapRate <= 0) {
      errors.push('売却時想定Cap Rateを入力してください');
      fieldErrorsMap.exitCapRate = '売却時想定Cap Rateを入力してください';
    }
    
    setFieldErrors(fieldErrorsMap);
    return errors;
  };

  const handleSimulation = async () => {
    // 必須項目チェック（BUG_010対応）
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setSaveError('必須項目を入力してください');
      
      // 最初のエラーフィールドにスクロール
      setTimeout(() => {
        const firstErrorField = Object.keys(fieldErrors)[0];
        if (firstErrorField) {
          const element = document.querySelector(
            `[data-field="${firstErrorField}"]`
          ) as HTMLElement;
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // フォーカスを当てる
            const input = element.querySelector('input, select') as HTMLElement;
            if (input) {
              input.focus();
            }
          }
        }
      }, 100);
      return;
    }
    
    // ゼロ値バリデーションチェック（BUG_008対応）
    const zeroValueErrors: string[] = [];
    const zeroFieldErrors: Record<string, string> = {};
    
    // 必須数値フィールドのゼロチェック
    if (!inputs.purchasePrice || inputs.purchasePrice <= 0) {
      zeroValueErrors.push('物件価格は0より大きい値を入力してください');
      zeroFieldErrors.purchasePrice = '物件価格は必須です（0より大きい値）';
    }
    
    if (!inputs.monthlyRent || inputs.monthlyRent <= 0) {
      zeroValueErrors.push('月額賃料は0より大きい値を入力してください');
      zeroFieldErrors.monthlyRent = '月額賃料は必須です（0より大きい値）';
    }
    
    // ゼロ値エラーがある場合は計算を中止
    if (zeroValueErrors.length > 0) {
      setValidationErrors(zeroValueErrors);
      setFieldErrors(zeroFieldErrors);
      setSaveError('入力エラー: ' + zeroValueErrors.join(', '));
      
      // エラーメッセージ表示後にスクロール
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
      return;
    }
    
    // 上限値チェック（BUG_009対応）
    const maxValueErrors: string[] = [];
    const maxFieldErrors: Record<string, string> = {};
    
    // 物件価格の上限チェック（最大100億円 = 1,000,000万円）
    if (inputs.purchasePrice > 1000000) {
      maxValueErrors.push('物件価格は100億円（1,000,000万円）以下で入力してください');
      maxFieldErrors.purchasePrice = '最大値: 1,000,000万円';
    }
    
    // 月額賃料の上限チェック（最大1000万円）
    if (inputs.monthlyRent > 10000000) {
      maxValueErrors.push('月額賃料は1000万円以下で入力してください');
      maxFieldErrors.monthlyRent = '最大値: 1,000万円';
    }
    
    // 借入期間の上限チェック（最大50年）
    if (inputs.loanYears > 50) {
      maxValueErrors.push('借入期間は50年以下で入力してください');
      maxFieldErrors.loanYears = '最大値: 50年';
    }
    
    // 金利の上限チェック（最大20%）
    if (inputs.interestRate > 20) {
      maxValueErrors.push('金利は20%以下で入力してください');
      maxFieldErrors.interestRate = '最大値: 20%';
    }
    
    // 建築年の範囲チェック（1900年～未来5年まで許可）
    const currentYear = new Date().getFullYear();
    const maxFutureYear = currentYear + 5; // 5年先まで許可（建設予定物件対応）
    if (inputs.yearBuilt && (inputs.yearBuilt < 1900 || inputs.yearBuilt > maxFutureYear)) {
      maxValueErrors.push(`建築年は1900年から${maxFutureYear}年の間で入力してください`);
      maxFieldErrors.yearBuilt = `範囲: 1900年～${maxFutureYear}年`;
    }
    
    // 保有期間の上限チェック（最大50年）
    if (inputs.holdingYears > 50) {
      maxValueErrors.push('保有期間は50年以下で入力してください');
      maxFieldErrors.holdingYears = '最大値: 50年';
    }
    
    // 管理手数料の上限チェック（賃料の50%まで）
    if (inputs.monthlyRent > 0 && inputs.managementFee > inputs.monthlyRent * 0.5) {
      maxValueErrors.push('管理手数料は月額賃料の50%以下で入力してください');
      maxFieldErrors.managementFee = `最大値: ${Math.floor(inputs.monthlyRent * 0.5).toLocaleString()}円`;
    }
    
    // 上限値エラーがある場合は計算を中止
    if (maxValueErrors.length > 0) {
      setValidationErrors(maxValueErrors);
      setFieldErrors(maxFieldErrors);
      setSaveError('入力エラー: ' + maxValueErrors.join(', '));
      
      // エラーメッセージ表示後にスクロール
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
      return;
    }
    
    // 表面利回りチェック（BUG_013対応）
    // 表面利回り = (月額賃料 × 12) / (物件価格 × 10000) × 100
    if (inputs.purchasePrice > 0 && inputs.monthlyRent > 0) {
      const surfaceYield = (inputs.monthlyRent * 12) / (inputs.purchasePrice * 10000) * 100;
      
      if (surfaceYield > 99) {
        const maxMonthlyRent = Math.floor((inputs.purchasePrice * 10000 * 99) / (12 * 100));
        const yieldErrors = [`表面利回りが${surfaceYield.toFixed(1)}%になります。99%を超える値は入力できません。月額賃料は${maxMonthlyRent.toLocaleString()}円以下にしてください。`];
        const yieldFieldErrors: Record<string, string> = {
          monthlyRent: `表面利回り99%以下となる値を入力してください（最大: ${maxMonthlyRent.toLocaleString()}円）`
        };
        
        setValidationErrors(yieldErrors);
        setFieldErrors(yieldFieldErrors);
        setSaveError('入力エラー: ' + yieldErrors.join(', '));
        
        // エラーメッセージ表示後にスクロール
        setTimeout(() => {
          if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 100);
        return;
      }
      
      // 警告表示（30%以上の場合）
      if (surfaceYield >= 30) {
        console.warn(`⚠️ 表面利回りが${surfaceYield.toFixed(1)}%と高い値です。入力値をご確認ください。`);
      }
    }
    
    // セキュリティバリデーションチェック
    const securityValidation = validateSimulatorInputs(inputs);
    if (!securityValidation.isValid) {
      // エラーメッセージを配列に変換
      const securityErrors = Object.entries(securityValidation.errors).map(([, error]) => error);
      setValidationErrors(securityErrors);
      setFieldErrors(securityValidation.errors);
      
      // 最初のエラーフィールドにスクロール
      setTimeout(() => {
        const firstErrorField = Object.keys(securityValidation.errors)[0];
        if (firstErrorField) {
          const element = document.querySelector(
            `[data-field="${firstErrorField}"]`
          ) as HTMLElement;
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // フォーカスを当てる
            const input = element.querySelector('input, select') as HTMLElement;
            if (input) {
              input.focus();
            }
          }
        }
      }, 100);
      return;
    }
    
    setValidationErrors([]);
    setFieldErrors({});
    setIsSimulating(true);
    setSaveError(null);
    
    try {
      // FAST API への送信データを構築
      const apiData = transformFormDataToApiData(inputs);
      
      // APIデータの必須フィールドチェック
      if (!apiData.property_name || apiData.property_name.trim() === '') {
        logError('API送信データ検証', { 
          message: 'property_nameが空です', 
          propertyName: inputs.propertyName 
        });
        throw new Error('物件名を入力してください');
      }
      
      // 開発環境でのみ詳細ログ
      if (import.meta.env.DEV) {
        console.log('FAST API送信データ:', apiData);
        console.log('新機能フィールド確認:', {
          ownership_type: apiData.ownership_type,
          effective_tax_rate: apiData.effective_tax_rate,
          major_repair_cycle: apiData.major_repair_cycle,
          major_repair_cost: apiData.major_repair_cost,
          building_price: apiData.building_price,
          depreciation_years: apiData.depreciation_years
        });
      }
      
      // FAST API呼び出し（タイムアウト対応）
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://real-estate-app-rwf1.onrender.com';
      
      // 最初にAPIを起動させる（Health Check）
      try {
        await fetch(`${API_BASE_URL}/`, { method: 'GET' });
      } catch (e) {
        console.log('API起動中...');
      }
      
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2分でタイムアウト
      
      const response = await fetch(`${API_BASE_URL}/api/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // エラーコードがある場合はモーダルを表示
        if (errorData.error_code) {
          setErrorModalData({
            isOpen: true,
            errorCode: errorData.error_code,
            message: errorData.message || errorData.error || 'エラーが発生しました',
            solution: errorData.solution,
            details: errorData.details
          });
          setIsSimulating(false);
          return;
        }
        
        // バリデーションエラーの場合
        if (errorData.error_details) {
          const fieldErrorsMap: Record<string, string> = {};
          errorData.error_details.forEach((detail: any) => {
            fieldErrorsMap[detail.field] = detail.message;
          });
          setFieldErrors(fieldErrorsMap);
          setValidationErrors(errorData.details || []);
          
          // エラーコードも表示
          if (errorData.error_code) {
            setErrorModalData({
              isOpen: true,
              errorCode: errorData.error_code,
              message: '入力内容にエラーがあります',
              solution: '赤色で表示されている項目を修正してください',
              details: errorData.details
            });
          }
          setIsSimulating(false);
          return;
        }
        
        const error = await handleApiError(response);
        throw error;
      }
      
      const result = await response.json();
      
      // 開発環境でのみ詳細ログ
      if (import.meta.env.DEV) {
        console.log('FAST APIレスポンス:', result);
        console.log('キャッシュフローテーブルの件数:', result.cash_flow_table?.length);
      }
      
      if (result.results) {
        setSimulationResults(result);
        
        // 結果表示後に自動スクロール
        setTimeout(() => {
          if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 100);
        
        // ユーザーがログインしている場合はSupabaseに保存
        if (user) {
          try {
            // Supabaseスキーマに合わせたデータ形式
            const simulationData = {
              // simulation_data (JSONB) - 入力データ
              simulation_data: {
                propertyName: inputs.propertyName || '無題の物件',
                location: inputs.location,
                yearBuilt: inputs.yearBuilt,
                propertyType: inputs.propertyType,
                landArea: inputs.landArea,
                buildingArea: inputs.buildingArea,
                roadPrice: inputs.roadPrice,
                marketValue: inputs.marketValue,
                purchasePrice: inputs.purchasePrice,
                otherCosts: inputs.otherCosts,
                renovationCost: inputs.renovationCost,
                monthlyRent: inputs.monthlyRent,
                managementFee: inputs.managementFee,
                fixedCost: inputs.fixedCost,
                propertyTax: inputs.propertyTax,
                vacancyRate: inputs.vacancyRate,
                rentDecline: inputs.rentDecline,
                loanAmount: inputs.loanAmount,
                interestRate: inputs.interestRate,
                loanYears: inputs.loanYears,
                loanType: inputs.loanType,
                holdingYears: inputs.holdingYears,
                exitCapRate: inputs.exitCapRate,
                expectedSalePrice: inputs.expectedSalePrice,
                priceDeclineRate: inputs.priceDeclineRate,
                annualDepreciationRate: inputs.annualDepreciationRate,
                ownershipType: inputs.ownershipType,
                effectiveTaxRate: inputs.effectiveTaxRate,
                majorRepairCycle: inputs.majorRepairCycle,
                majorRepairCost: inputs.majorRepairCost,
                buildingPriceForDepreciation: inputs.buildingPriceForDepreciation,
                depreciationYears: inputs.depreciationYears,
                propertyUrl: inputs.propertyUrl,
                propertyMemo: inputs.propertyMemo,
                propertyImageUrl: inputs.propertyImageUrl,
                propertyStatus: inputs.propertyStatus
              },
              // results (JSONB) - 計算結果
              results: {
                surfaceYield: result.results['表面利回り（%）'] || 0,
                netYield: result.results['実質利回り（%）'] || 0,
                irr: result.results['IRR（%）'] || 0,
                ccr: result.results['CCR（%）'] || 0,
                'CCR（初年度）（%）': result.results['CCR（初年度）（%）'] || 0,
                'CCR（全期間）（%）': result.results['CCR（全期間）（%）'] || 0,
                roi: result.results['ROI（%）'] || 0,
                'ROI（初年度）（%）': result.results['ROI（初年度）（%）'] || 0,
                'ROI（全期間）（%）': result.results['ROI（全期間）（%）'] || 0,
                dscr: result.results['DSCR（返済余裕率）'] || 0,
                noi: result.results['NOI（円）'] || 0,
                ltv: result.results['LTV（%）'] || 0,
                monthlyCashFlow: result.results['月間キャッシュフロー（円）'] || 0,
                annualCashFlow: result.results['年間キャッシュフロー（円）'] || 0,
                assessedTotal: result.results['積算評価合計（万円）'] || 0,
                capRateEval: result.results['収益還元評価額（万円）'] || 0,
                expectedSalePrice: result.results['想定売却価格（万円）'] || 0,
                '実質利回り': result.results['実質利回り（%）'] || 0,
                'ROI': result.results['ROI（%）'] || 0,
                'NOI': result.results['NOI（円）'] || 0,
                'LTV': result.results['LTV（%）'] || 0
              },
              // cash_flow_table (JSONB) - キャッシュフローテーブル
              cash_flow_table: result.cash_flow_table || []
            };
            
            console.log('保存データ詳細:', {
              renovationCost: simulationData.simulation_data.renovationCost,
              managementFee: simulationData.simulation_data.managementFee,
              vacancyRate: simulationData.simulation_data.vacancyRate,
              fixedCost: simulationData.simulation_data.fixedCost,
              fullData: simulationData
            });
            
            // 編集モードかどうかを判定
            const isEditMode = Boolean(editingId);
            console.log('🔍 編集モード:', isEditMode, 'editingId:', editingId);
            
            // シミュレーションデータを保存（編集モードの場合は更新、新規の場合は作成）
            const { data, error: saveError } = await saveSimulation(
              simulationData, 
              undefined, // 共有トークンは不要
              isEditMode ? editingId ?? undefined : undefined
            );
            
            if (saveError) {
              throw new Error(saveError);
            }
            
            setSaveMessage(isEditMode ? '✅ シミュレーション結果を更新しました！' : '✅ シミュレーション結果を保存しました！');
            console.log('保存成功:', data);
            
            // 新規保存の場合、次回から更新になるようにeditingIdを設定
            if (!isEditMode && data && data.id) {
              setEditingId(data.id);
              console.log('新規保存後、editingIdを設定:', data.id);
            }
            // 編集モードの場合でも、保存後にeditingIdが正しく設定されていることを確認
            else if (isEditMode && data && data.id && !editingId) {
              setEditingId(data.id);
            }
            
          } catch (saveError) {
            console.error('保存エラー:', saveError);
            setSaveMessage('⚠️ シミュレーションは完了しましたが、保存に失敗しました。');
          }
        } else {
          setSaveMessage('ℹ️ シミュレーションが正常に完了しました！（ログインすると結果を保存できます）');
        }
      } else {
        throw new Error('APIから予期しない形式のレスポンスが返されました');
      }
      
    } catch (error: any) {
      logError('シミュレーション', error);
      
      // エラーコードがある場合
      if (error.error_code) {
        setErrorModalData({
          isOpen: true,
          errorCode: error.error_code,
          message: error.message,
          solution: error.solution,
          details: error.details
        });
      } else {
        let errorMessage: string;
        if (error.name === 'AbortError') {
          errorMessage = 'APIサーバーの応答がタイムアウトしました。Renderの無料プランでは初回アクセス時に時間がかかる場合があります。再度お試しください。';
        } else if (error.message && error.message.includes('500')) {
          errorMessage = 'サーバーでエラーが発生しました。入力内容を確認して再度お試しください。';
        } else {
          errorMessage = error.userMessage || getUserFriendlyErrorMessage(error);
        }
        
        setSaveError(`シミュレーション処理でエラーが発生しました: ${errorMessage}`);
      }
      
      // エラーメッセージを画面に表示（結果エリアまでスクロール）
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    } finally {
      setIsSimulating(false);
    }
  };

  // PDF保存機能
  const handleSaveToPDF = () => {
    // PDFの印刷時に表示するタイトル
    const originalTitle = document.title;
    document.title = `${inputs.propertyName} - 不動産投資シミュレーション結果`;
    
    // 印刷ダイアログを表示
    window.print();
    
    // タイトルを元に戻す
    document.title = originalTitle;
  };


  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto pt-1 md:pt-0">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">既存データを読み込み中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen print:p-4 print:bg-white">
      <div className="max-w-6xl mx-auto print:max-w-full pt-1 md:pt-0">
        {/* Breadcrumb - PC版のみ表示 */}
        <div className="print:hidden hidden md:block">
          <Breadcrumb />
        </div>
        
        {/* Header */}
        <div className="mb-6 print:hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                物件収益シミュレーター
              </h1>
              <p className="text-gray-600">
                物件の収益性を詳細に計算し、投資判断の参考情報を提供します。
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowTutorial(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>使い方を見る</span>
                <span className="text-sm">📖</span>
              </button>
              <div className="hidden lg:block">
                <BackButton />
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        {/* <LegalDisclaimer variant="full" /> */}

        {/* Success/Error Messages */}
        {saveMessage && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-blue-800">{saveMessage}</span>
            </div>
          </div>
        )}

        {saveError && (
          <ErrorAlert 
            message={saveError} 
            onRetry={() => {
              setSaveError(null);
              handleSimulation();
            }}
            className="mb-6 print:hidden"
          />
        )}

        {/* Input Form */}
        <div className="bg-transparent md:bg-white md:rounded-lg md:border md:border-gray-200 p-0 md:p-6 space-y-6 print:hidden">
          {/* 🏠 物件情報 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 md:border-0 md:pb-0">🏠 物件情報 <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded ml-2">必須</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 物件名 */}
              <div data-field="propertyName">
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    物件名
                  </label>
                  <Tooltip content={tooltips.propertyName} />
                </div>
                <input
                  type="text"
                  value={inputs.propertyName}
                  onChange={(e) => handleFieldChange('propertyName', e.target.value)}
                  placeholder="例：カーサ○○マンション"
                  className={getFieldClassName('propertyName')}
                  maxLength={50}
                />
                <ErrorMessage fieldName="propertyName" />
              </div>

              {/* 住所 */}
              <div data-field="location">
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    住所
                  </label>
                  <Tooltip content={tooltips.location} />
                </div>
                <input
                  type="text"
                  value={inputs.location}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  placeholder="例：東京都渋谷区神宮前1-1-1"
                  className={getFieldClassName('location')}
                  maxLength={100}
                />
                <ErrorMessage fieldName="location" />
              </div>

              {/* 物件ステータス */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    物件ステータス
                  </label>
                  <Tooltip content={tooltips.propertyStatus} />
                </div>
                <select
                  value={inputs.propertyStatus || ''}
                  onChange={(e) => handleInputChange('propertyStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {propertyStatusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* 土地面積 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    土地面積
                  </label>
                  <Tooltip content={tooltips.landArea} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="1"
                    value={inputs.landArea || ''}
                    onChange={(e) => handleInputChange('landArea', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="landArea"
                    placeholder="162.52"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">㎡</span>
                </div>
              </div>
              {/* 建物面積 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    建物面積
                  </label>
                  <Tooltip content={tooltips.buildingArea} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="1"
                    value={inputs.buildingArea || ''}
                    onChange={(e) => handleInputChange('buildingArea', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="buildingArea"
                    placeholder="122.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">㎡</span>
                </div>
              </div>
              {/* 路線価 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    路線価
                  </label>
                  <Tooltip content={tooltips.roadPrice} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={inputs.roadPrice || ''}
                    onChange={(e) => handleInputChange('roadPrice', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="roadPrice"
                    placeholder="120000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">円/㎡</span>
                </div>
              </div>
              {/* 建築年 */}
              <div data-field="yearBuilt">
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    建築年
                  </label>
                  <Tooltip content="建築年を入力してください。自動的に築年数と減価償却年数が計算されます。" />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={inputs.yearBuilt || ''}
                    onChange={(e) => handleFieldChange('yearBuilt', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="yearBuilt"
                    placeholder="2020"
                    className={getFieldClassName('yearBuilt')}
                  />
                  <span className="text-sm text-gray-500 ml-2">年</span>
                </div>
                {inputs.yearBuilt && inputs.yearBuilt > 0 && (
                  <div className="text-xs text-gray-600 mt-1">
                    {inputs.yearBuilt > new Date().getFullYear() 
                      ? `建設予定（${inputs.yearBuilt}年完成予定）`
                      : `築${new Date().getFullYear() - inputs.yearBuilt}年（${new Date().getFullYear()}年現在）`
                    }
                  </div>
                )}
                <ErrorMessage fieldName="yearBuilt" />
              </div>

              {/* 建物構造 */}
              <div data-field="propertyType">
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    建物構造
                  </label>
                  <Tooltip content="建物の構造を選択してください。構造により法定耐用年数が自動設定されます。" />
                </div>
                <select
                  value={inputs.propertyType || ''}
                  onChange={(e) => handleFieldChange('propertyType', e.target.value)}
                  className={getFieldClassName('propertyType')}
                >
                  {buildingStructureOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ErrorMessage fieldName="propertyType" />
              </div>
            </div>
          </div>

          {/* 💰 取得・初期費用 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 md:border-0 md:pb-0">💰 取得・初期費用 <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded ml-2">必須</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 購入価格 */}
              <div data-field="purchasePrice">
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    購入価格
                  </label>
                  <Tooltip content={tooltips.purchasePrice} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={inputs.purchasePrice || ''}
                    onChange={(e) => handleFieldChange('purchasePrice', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="purchasePrice"
                    placeholder="12000"
                    className={getFieldClassName('purchasePrice')}
                  />
                  <span className="text-sm text-gray-500 ml-2">万円</span>
                </div>
                <ErrorMessage fieldName="purchasePrice" />
              </div>

              {/* 諸経費 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    諸経費
                  </label>
                  <Tooltip content={tooltips.otherCosts} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.otherCosts || ''}
                    onChange={(e) => handleInputChange('otherCosts', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="otherCosts"
                    placeholder="500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">万円</span>
                </div>
              </div>

              {/* 改装費 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    改装費
                  </label>
                  <Tooltip content={tooltips.renovationCost} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.renovationCost || ''}
                    onChange={(e) => handleInputChange('renovationCost', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="renovationCost"
                    placeholder="370"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">万円</span>
                </div>
              </div>
            </div>
            
            {/* 改装費の説明 */}
            <div className="col-span-2 mt-4">
              <p className="text-xs text-gray-500">
                ※ 改装費は資本的支出として計上され、建物と同じ償却年数で減価償却されます
              </p>
            </div>
          </div>

          {/* 📈 収益情報 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 md:border-0 md:pb-0">📈 収益情報 <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded ml-2">必須</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 月額賃料 */}
              <div data-field="monthlyRent">
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    月額賃料
                  </label>
                  <Tooltip content={tooltips.monthlyRent} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={inputs.monthlyRent || ''}
                    onChange={(e) => handleFieldChange('monthlyRent', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="monthlyRent"
                    placeholder="250000"
                    className={getFieldClassName('monthlyRent')}
                  />
                  <span className="text-sm text-gray-500 ml-2">円</span>
                </div>
                <ErrorMessage fieldName="monthlyRent" />
              </div>

              {/* 管理費 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    管理費
                  </label>
                  <Tooltip content={tooltips.managementFee} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={inputs.managementFee || ''}
                    onChange={(e) => handleInputChange('managementFee', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="managementFee"
                    placeholder="12500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">円</span>
                </div>
              </div>

              {/* その他固定費 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    その他固定費
                  </label>
                  <Tooltip content={tooltips.fixedCost} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={inputs.fixedCost || ''}
                    onChange={(e) => handleInputChange('fixedCost', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="fixedCost"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">円</span>
                </div>
              </div>

              {/* 固定資産税 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    固定資産税
                  </label>
                  <Tooltip content={tooltips.propertyTax} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={inputs.propertyTax || ''}
                    onChange={(e) => handleInputChange('propertyTax', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="propertyTax"
                    placeholder="100000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">円</span>
                </div>
              </div>

              {/* 空室率 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    空室率
                  </label>
                  <Tooltip content={tooltips.vacancyRate} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.vacancyRate || ''}
                    onChange={(e) => handleInputChange('vacancyRate', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="vacancyRate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">%</span>
                </div>
              </div>

              {/* 家賃下落率 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    家賃下落率
                  </label>
                  <Tooltip content={tooltips.rentDecline} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.rentDecline || ''}
                    onChange={(e) => handleInputChange('rentDecline', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="rentDecline"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">%/年</span>
                </div>
              </div>
            </div>
          </div>

          {/* 🏦 借入条件 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 md:border-0 md:pb-0">🏦 借入条件 <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded ml-2">必須</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 借入額 */}
              <div data-field="loanAmount">
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    借入額
                  </label>
                  <Tooltip content={tooltips.loanAmount} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={inputs.loanAmount || ''}
                    onChange={(e) => handleFieldChange('loanAmount', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="loanAmount"
                    placeholder="10000"
                    className={getFieldClassName('loanAmount')}
                  />
                  <span className="text-sm text-gray-500 ml-2">万円</span>
                </div>
                <ErrorMessage fieldName="loanAmount" />
              </div>

              {/* 金利 */}
              <div data-field="interestRate">
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    金利
                  </label>
                  <Tooltip content={tooltips.interestRate} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={inputs.interestRate || ''}
                    onChange={(e) => handleFieldChange('interestRate', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="interestRate"
                    placeholder="2.875"
                    className={getFieldClassName('interestRate')}
                  />
                  <span className="text-sm text-gray-500 ml-2">%</span>
                </div>
                <ErrorMessage fieldName="interestRate" />
              </div>

              {/* 返済期間 */}
              <div data-field="loanYears">
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    返済期間
                  </label>
                  <Tooltip content={tooltips.loanYears} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={inputs.loanYears || ''}
                    onChange={(e) => handleFieldChange('loanYears', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="loanYears"
                    placeholder="25"
                    className={getFieldClassName('loanYears')}
                  />
                  <span className="text-sm text-gray-500 ml-2">年</span>
                </div>
                <ErrorMessage fieldName="loanYears" />
              </div>

              {/* 借入形式 */}
              <div data-field="loanType">
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    借入形式
                  </label>
                  <Tooltip content={tooltips.loanType} />
                </div>
                <select
                  value={inputs.loanType}
                  onChange={(e) => handleFieldChange('loanType', e.target.value)}
                  className={getFieldClassName('loanType')}
                >
                  {loanTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ErrorMessage fieldName="loanType" />
              </div>
            </div>
          </div>

          {/* 🎯 出口戦略 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 md:border-0 md:pb-0">🎯 出口戦略 <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded ml-2">必須</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 保有年数 */}
              <div data-field="holdingYears">
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    保有年数
                  </label>
                  <Tooltip content={tooltips.holdingYears} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={inputs.holdingYears || ''}
                    onChange={(e) => handleFieldChange('holdingYears', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="holdingYears"
                    className={getFieldClassName('holdingYears')}
                  />
                  <span className="text-sm text-gray-500 ml-2">年</span>
                </div>
                <ErrorMessage fieldName="holdingYears" />
              </div>

              {/* 売却CapRate */}
              <div data-field="exitCapRate">
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    売却CapRate
                  </label>
                  <Tooltip content={tooltips.exitCapRate} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.exitCapRate || ''}
                    onChange={(e) => handleFieldChange('exitCapRate', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="exitCapRate"
                    className={getFieldClassName('exitCapRate')}
                  />
                  <span className="text-sm text-gray-500 ml-2">%</span>
                </div>
                <ErrorMessage fieldName="exitCapRate" />
              </div>

              {/* 想定売却価格 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    想定売却価格
                  </label>
                  <Tooltip content={tooltips.marketValue} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.marketValue || ''}
                    onChange={(e) => handleInputChange('marketValue', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="marketValue"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">万円</span>
                </div>
              </div>

              {/* 年間価格下落率（売却価格） */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    年間価格下落率
                  </label>
                  <Tooltip content="売却価格が年間で下落する割合（%）。市場環境や経年劣化により毎年一定割合で下落します。通常0.5〜2.0%程度を設定します。" />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.priceDeclineRate || 0}
                    onChange={(e) => handleInputChange('priceDeclineRate', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="priceDeclineRate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="1.0"
                  />
                  <span className="text-sm text-gray-500 ml-2">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 📊 税務・会計設定 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 md:border-0 md:pb-0">📊 税務・会計設定</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 所有形態 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    所有形態
                  </label>
                  <Tooltip content={tooltips.ownershipType} />
                </div>
                <select
                  value={inputs.ownershipType || '個人'}
                  onChange={(e) => {
                    const newOwnershipType = e.target.value;
                    handleInputChange('ownershipType', newOwnershipType);
                    // 所有形態に応じて実効税率のデフォルト値を設定
                    if (newOwnershipType === '個人') {
                      handleInputChange('effectiveTaxRate', 30); // 個人の一般的な実効税率（所得税20% + 住民税10%）
                    } else if (newOwnershipType === '法人') {
                      handleInputChange('effectiveTaxRate', 30); // 法人の一般的な実効税率（中小法人）
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {ownershipTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 実効税率 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    実効税率
                  </label>
                  <Tooltip content={tooltips.effectiveTaxRate} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.effectiveTaxRate || ''}
                    onChange={(e) => handleFieldChange('effectiveTaxRate', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="effectiveTaxRate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">%</span>
                </div>
              </div>

              {/* 建物価格（減価償却対象） */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    建物価格（減価償却対象）
                  </label>
                  <Tooltip content={tooltips.buildingPriceForDepreciation} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="100"
                    value={inputs.buildingPriceForDepreciation || ''}
                    onChange={(e) => handleFieldChange('buildingPriceForDepreciation', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="buildingPriceForDepreciation"
                    placeholder="8000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">万円</span>
                </div>
              </div>

              {/* 償却年数（自動計算） */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    償却年数（残存耐用年数）
                  </label>
                  <Tooltip content={tooltips.depreciationYears} />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={inputs.depreciationYears || ''}
                    onChange={(e) => handleFieldChange('depreciationYears', e.target.value)}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="depreciationYears"
                    disabled={!isManualDepreciation}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      !isManualDepreciation ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                    }`}
                  />
                  <span className="text-sm text-gray-500">年</span>
                </div>
                
                {/* 自動計算の説明と手動調整リンク */}
                <div className="text-xs text-gray-500 mt-1">
                  {inputs.yearBuilt && inputs.propertyType && !isManualDepreciation ? (
                    <>
                      {(() => {
                        const currentYear = new Date().getFullYear();
                        const buildingAge = currentYear - inputs.yearBuilt;
                        const getLegalLife = (structure: string) => {
                          switch (structure) {
                            case 'RC': return 47;
                            case 'SRC': return 39;
                            case 'S': return 34;
                            case '木造': return 22;
                            default: return 27;
                          }
                        };
                        const legalLife = getLegalLife(inputs.propertyType);
                        const isExceeded = buildingAge >= legalLife;
                        
                        if (isExceeded) {
                          return (
                            <>
                              <span className="text-orange-600 font-medium">
                                ⚠️ 耐用年数超過物件
                              </span>
                              ：{inputs.propertyType}（法定{legalLife}年）で築{buildingAge}年 
                              → 残存{inputs.depreciationYears}年
                            </>
                          );
                        } else {
                          return `自動計算：${inputs.propertyType}（法定${legalLife}年）で築${buildingAge}年 → 残存${inputs.depreciationYears}年`;
                        }
                      })()}
                      {' '}
                      <button
                        type="button"
                        onClick={() => {
                          handleInputChange('depreciationYears', inputs.loanYears || 35);
                          setIsManualDepreciation(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        融資期間に合わせる（{inputs.loanYears || 35}年）
                      </button>
                    </>
                  ) : isManualDepreciation ? (
                    <>
                      手動編集モード
                      {inputs.yearBuilt && inputs.propertyType && (
                        <>
                          {' '}
                          <button
                            type="button"
                            onClick={() => {
                              setIsManualDepreciation(false);
                              // 自動モードに戻った時に再計算
                              if (inputs.yearBuilt && inputs.propertyType) {
                                handleInputChange('yearBuilt', inputs.yearBuilt);
                              }
                            }}
                            className="text-gray-600 hover:text-gray-800 underline"
                          >
                            自動計算値に戻す
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    '建築年・構造から自動計算されます'
                  )}
                </div>
                
                {/* 手動編集時のクイックボタン */}
                {isManualDepreciation && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleInputChange('depreciationYears', inputs.loanYears || 15)}
                      className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      融資期間と同じ（{inputs.loanYears || 15}年）
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('depreciationYears', 10)}
                      className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      10年
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('depreciationYears', 15)}
                      className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      15年
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('depreciationYears', 20)}
                      className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      20年
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 🔧 大規模修繕設定 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 md:border-0 md:pb-0">🔧 大規模修繕設定</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 修繕周期 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    修繕周期
                  </label>
                  <Tooltip content={tooltips.majorRepairCycle} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="1"
                    max="35"
                    value={inputs.majorRepairCycle || 0}
                    onChange={(e) => handleInputChange('majorRepairCycle', Number(e.target.value))}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="majorRepairCycle"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">年</span>
                </div>
              </div>

              {/* 修繕費用 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    修繕費用
                  </label>
                  <Tooltip content={tooltips.majorRepairCost} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="10"
                    value={inputs.majorRepairCost || 0}
                    onChange={(e) => handleInputChange('majorRepairCost', Number(e.target.value))}
                    onFocus={handleNumberInputFocus}
                    onKeyDown={handleNumberInputKeyDown}
                    data-field="majorRepairCost"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">万円</span>
                </div>
              </div>
            </div>
          </div>

          {/* 📌 物件ブックマーク */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 md:border-0 md:pb-0">📌 物件ブックマーク</h3>
            <div className="space-y-4">
              {/* URLとメモを横並び */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 物件URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    物件URL
                  </label>
                  <input
                    type="url"
                    value={inputs.propertyUrl || ''}
                    onChange={(e) => handleInputChange('propertyUrl', e.target.value)}
                    placeholder="https://ooya.tech/..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      urlError 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                    maxLength={500}
                  />
                  {urlError && (
                    <p className="text-xs text-red-600 mt-1">
                      ❌ {urlError}
                    </p>
                  )}
                </div>

                {/* メモ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メモ（任意）
                  </label>
                  <input
                    type="text"
                    value={inputs.propertyMemo || ''}
                    onChange={(e) => handleInputChange('propertyMemo', e.target.value)}
                    placeholder="物件の特徴、気になるポイント、検討事項など..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    maxLength={500}
                  />
                </div>
              </div>

              {/* 物件画像 */}
              <div className="mb-6">
                <ImageUpload
                  onImageUploaded={(imageUrl) => handleInputChange('propertyImageUrl', imageUrl)}
                  onImageRemoved={() => handleInputChange('propertyImageUrl', '')}
                  currentImageUrl={inputs.propertyImageUrl}
                  disabled={isSimulating}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-6">
            {/* バリデーションエラー表示 */}
            {validationErrors.length > 0 && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-800 mb-2">
                      以下の必須項目を入力してください：
                    </h4>
                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                      {validationErrors.map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-center">
              <button 
                onClick={handleSimulation}
                disabled={isSimulating}
                className={`flex items-center justify-center px-10 py-5 rounded-lg font-semibold text-xl transition-all duration-200 min-h-[64px] touch-manipulation ${
                  isSimulating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.98] text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {isSimulating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    計算中...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Zap className="h-6 w-6 mr-3" />
                    実行する
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 保存状況表示 */}
        {(saveMessage || saveError) && (
          <div className="mt-6">
            {saveMessage && (
              <div className={`p-4 rounded-lg border flex items-center ${
                saveMessage.includes('✅') ? 'text-green-700 bg-green-50 border-green-200' :
                saveMessage.includes('⚠️') ? 'text-yellow-700 bg-yellow-50 border-yellow-200' :
                'text-blue-700 bg-blue-50 border-blue-200'
              }`}>
                <span>{saveMessage}</span>
              </div>
            )}
            {saveError && (
              <ErrorAlert 
                message={saveError} 
                className="mt-4"
              />
            )}
          </div>
        )}
      </div>

      {/* シミュレーション結果表示 - SP版は枠外、PC版は枠内 */}
      {simulationResults && (
        <div className="md:p-4 md:sm:p-6 md:lg:p-8">
          <div className="md:max-w-6xl md:mx-auto">
            <div 
              ref={resultsRef}
              className="mt-6 bg-white md:rounded-lg md:border-2 md:border-blue-200 md:shadow-lg p-2 sm:p-4 md:p-6 scroll-mt-4 simulation-results print:m-0 print:shadow-none"
            >
            <div className="mb-6">
              {/* PC版: タイトルとボタンを横並び */}
              <div className="hidden md:flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-8 bg-blue-500 rounded-full mr-3"></div>
                  <h2 className="text-2xl font-bold text-gray-900">📊 シミュレーション結果</h2>
                </div>
                <div className="flex items-center space-x-3">
                  {user && saveMessage?.includes('✅') && (
                    <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      ✓ マイページに保存済み
                    </span>
                  )}
                  
                  {/* メール招待・共有ボタン */}
                  
                  
                  <button
                    onClick={handleSaveToPDF}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 print:hidden"
                    title="PDFとして保存"
                  >
                    <Download size={18} />
                    <span>PDF保存</span>
                  </button>
                </div>
              </div>
              
              {/* SP版: タイトルとボタンを縦並び */}
              <div className="md:hidden">
                <div className="flex items-center mb-3">
                  <div className="w-1 h-8 bg-blue-500 rounded-full mr-3"></div>
                  <h2 className="text-2xl font-bold text-gray-900">📊 シミュレーション結果</h2>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleSaveToPDF}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm print:hidden"
                    title="PDFとして保存"
                  >
                    <Download size={16} />
                    <span>PDF保存</span>
                  </button>
                  {user && saveMessage?.includes('✅') && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      ✓ 保存済み
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* 物件価値評価と重要投資指標 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 評価額と投資指標</h3>
              
              {/* SP版: 4つの重要指標のみ表示 */}
              <div className="md:hidden">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* 積算評価額 */}
                  <div className="p-3 bg-blue-100 rounded-lg text-center">
                    <div className="text-xs text-gray-600 mb-1">積算評価額</div>
                    <div className="text-lg font-bold">
                      {simulationResults?.results['積算評価合計（万円）']?.toFixed(0) || '0'}万円
                    </div>
                  </div>
                  
                  {/* 収益還元評価額 */}
                  <div className="p-3 bg-green-100 rounded-lg text-center">
                    <div className="text-xs text-gray-600 mb-1">収益還元</div>
                    <div className="text-lg font-bold">
                      {simulationResults?.results['収益還元評価額（万円）']?.toFixed(0) || '0'}万円
                    </div>
                  </div>
                  
                  {/* IRR */}
                  <div className={`p-3 rounded-lg text-center ${
                    simulationResults?.results['IRR（%）'] && simulationResults.results['IRR（%）'] >= 15 ? 'bg-green-100' :
                    simulationResults?.results['IRR（%）'] && simulationResults.results['IRR（%）'] >= 10 ? 'bg-yellow-100' :
                    simulationResults?.results['IRR（%）'] && simulationResults.results['IRR（%）'] >= 5 ? 'bg-orange-100' :
                    'bg-red-100'
                  }`}>
                    <div className="text-xs text-gray-600 mb-1">IRR</div>
                    <div className="text-lg font-bold">
                      {simulationResults?.results['IRR（%）']?.toFixed(1) || '0.0'}%
                    </div>
                  </div>
                  
                  {/* DSCR */}
                  <div className={`p-3 rounded-lg text-center ${
                    simulationResults.results['DSCR（返済余裕率）'] >= 1.5 ? 'bg-green-100' :
                    simulationResults.results['DSCR（返済余裕率）'] >= 1.3 ? 'bg-yellow-100' :
                    simulationResults.results['DSCR（返済余裕率）'] >= 1.1 ? 'bg-orange-100' :
                    'bg-red-100'
                  }`}>
                    <div className="text-xs text-gray-600 mb-1">DSCR</div>
                    <div className="text-lg font-bold">
                      {simulationResults.results['DSCR（返済余裕率）']?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </div>
                
                {/* もっと見るボタン */}
                <button
                  onClick={() => setShowEvaluationPopup(true)}
                  className="w-full py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  もっと見る ▼
                </button>
              </div>
              
              {/* PC版: 従来の全指標表示 */}
              <div className="hidden md:flex flex-wrap gap-2">
                {/* 積算評価額 */}
                <div className="group relative">
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help">
                    <span className="font-normal mr-1">積算</span>
                    <span className="font-semibold">{simulationResults?.results['積算評価合計（万円）']?.toFixed(0) || '0'}万円</span>
                    <span className="text-xs ml-1">※</span>
                  </div>
                  <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-80">
                    <div className="font-semibold mb-2">積算評価額の内訳</div>
                    <div className="space-y-1 mb-2">
                      <div className="flex justify-between">
                        <span>土地評価額:</span>
                        <span className="font-semibold">{simulationResults?.results['土地積算評価（万円）']?.toFixed(0) || '0'}万円</span>
                      </div>
                      <div className="flex justify-between">
                        <span>建物評価額:</span>
                        <span className="font-semibold">{simulationResults?.results['建物積算評価（万円）']?.toFixed(0) || '0'}万円</span>
                      </div>
                      <div className="border-t border-gray-600 pt-1 flex justify-between font-semibold">
                        <span>合計:</span>
                        <span>{simulationResults?.results['積算評価合計（万円）']?.toFixed(0) || '0'}万円</span>
                      </div>
                    </div>
                    <div className="text-gray-300 text-xs">
                      {simulationResults?.results['建物積算評価（万円）'] === 0 && (
                        <div className="mt-1">※建物は耐用年数超過のため評価0円</div>
                      )}
                      <div>※改装費は積算評価に含まれません</div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                
                {/* 収益還元評価額 */}
                <div className="group relative">
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help">
                    <span className="font-normal mr-1">収益還元</span>
                    <span className="font-semibold">{simulationResults?.results['収益還元評価額（万円）']?.toFixed(0) || '0'}万円</span>
                    <span className="text-xs ml-1">※</span>
                  </div>
                  <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64">
                    <div className="font-semibold mb-1">収益還元評価額</div>
                    <div className="mb-2">物件の収益力から逆算した評価額です。</div>
                    <div className="text-gray-300 text-xs mb-1">計算式：年間純収益（NOI） ÷ 還元利回り</div>
                    <div className="text-gray-400 text-xs">※ 投資物件の収益性を重視した評価方法</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                
                {/* 想定売却価格 */}
                <div className="group relative">
                  <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help">
                    <span className="font-normal mr-1">想定売却価格</span>
                    <span className="font-semibold">{simulationResults?.results['想定売却価格（万円）']?.toFixed(0) || '0'}万円</span>
                    <span className="text-xs ml-1">※</span>
                  </div>
                  <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64">
                    <div className="font-semibold mb-1">想定売却価格</div>
                    <div className="mb-2">出口戦略で設定した想定売却価格です。</div>
                    <div className="text-gray-300 text-xs">
                      将来の売却時に期待される価格を表示しています。
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                
                {/* 区切り線 */}
                <div className="flex items-center px-2">
                  <div className="h-8 w-px bg-gray-300"></div>
                </div>
                
                {/* 表面利回り */}
                <div className="group relative">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help ${
                    simulationResults.results['表面利回り（%）'] >= 8 ? 'bg-green-100 text-green-800' :
                    simulationResults.results['表面利回り（%）'] >= 6 ? 'bg-yellow-100 text-yellow-800' :
                    simulationResults.results['表面利回り（%）'] >= 4 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-normal mr-1">表面利回り</span>
                    <span className="font-semibold">{simulationResults.results['表面利回り（%）']?.toFixed(2) || '0.00'}%</span>
                    {simulationResults.results['表面利回り（%）'] >= 8 && <span className="ml-1">⭐</span>}
                    {simulationResults.results['表面利回り（%）'] < 4 && <span className="ml-1">⚠️</span>}
                  </div>
                  <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64">
                    <div className="font-semibold mb-1">表面利回り</div>
                    <div className="mb-2">年間家賃収入を物件価格で割った基本的な利回りです。</div>
                    <div className="text-gray-300 text-xs mb-1">計算式：年間家賃収入 ÷ 物件価格 × 100</div>
                    <div className="text-gray-400 text-xs">※ 経費を考慮しない単純計算</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                
                {/* 実質利回り */}
                <div className="group relative">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help ${
                    simulationResults?.results['実質利回り（%）'] && simulationResults.results['実質利回り（%）'] >= 6 ? 'bg-green-100 text-green-800' :
                    simulationResults?.results['実質利回り（%）'] && simulationResults.results['実質利回り（%）'] >= 4.5 ? 'bg-yellow-100 text-yellow-800' :
                    simulationResults?.results['実質利回り（%）'] && simulationResults.results['実質利回り（%）'] >= 3 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-normal mr-1">実質利回り</span>
                    <span className="font-semibold">{simulationResults?.results['実質利回り（%）']?.toFixed(2) || '0.00'}%</span>
                    {simulationResults?.results['実質利回り（%）'] && simulationResults.results['実質利回り（%）'] >= 6 && <span className="ml-1">⭐</span>}
                    {simulationResults?.results['実質利回り（%）'] && simulationResults.results['実質利回り（%）'] < 3 && <span className="ml-1">⚠️</span>}
                  </div>
                  <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64">
                    <div className="font-semibold mb-1">実質利回り</div>
                    <div className="mb-2">経費を差し引いた実際の収益率です。</div>
                    <div className="text-gray-300 text-xs mb-1">計算式：(年間家賃収入 - 年間経費) ÷ 物件価格 × 100</div>
                    <div className="text-gray-400 text-xs">※ より現実的な収益性を表す指標</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* 2行目: 投資指標 - PC版のみ表示 */}
              <div className="hidden md:flex flex-wrap gap-2 mt-3">
                {/* IRR */}
                <div className="group relative">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help ${
                    simulationResults?.results['IRR（%）'] && simulationResults.results['IRR（%）'] >= 15 ? 'bg-green-100 text-green-800' :
                    simulationResults?.results['IRR（%）'] && simulationResults.results['IRR（%）'] >= 10 ? 'bg-yellow-100 text-yellow-800' :
                    simulationResults?.results['IRR（%）'] && simulationResults.results['IRR（%）'] >= 5 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-normal mr-1">IRR</span>
                    <span className="font-semibold">{simulationResults?.results['IRR（%）']?.toFixed(2) || '0.00'}%</span>
                    {simulationResults?.results['IRR（%）'] && simulationResults.results['IRR（%）'] >= 15 && <span className="ml-1">⭐</span>}
                    {simulationResults?.results['IRR（%）'] && simulationResults.results['IRR（%）'] < 5 && <span className="ml-1">⚠️</span>}
                  </div>
                  <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64">
                    <div className="font-semibold mb-1">IRR（内部収益率）</div>
                    <div className="mb-2">投資した資金が年何％で増えているかを示します。</div>
                    <div className="text-gray-300 text-xs mb-1">計算式：投資額と将来収益から複利計算で算出</div>
                    <div className="text-gray-400 text-xs">※ 定期預金の金利のようなもの</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                
                {/* CCR（初年度） */}
                <div className="group relative">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help ${
                    simulationResults?.results['CCR（初年度）（%）'] && simulationResults.results['CCR（初年度）（%）'] >= 12 ? 'bg-green-100 text-green-800' :
                    simulationResults?.results['CCR（初年度）（%）'] && simulationResults.results['CCR（初年度）（%）'] >= 8 ? 'bg-yellow-100 text-yellow-800' :
                    simulationResults?.results['CCR（初年度）（%）'] && simulationResults.results['CCR（初年度）（%）'] >= 5 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-normal mr-1">CCR（初年度）</span>
                    <span className="font-semibold">{simulationResults?.results['CCR（初年度）（%）']?.toFixed(2) || '0.00'}%</span>
                    {simulationResults?.results['CCR（初年度）（%）'] && simulationResults.results['CCR（初年度）（%）'] >= 12 && <span className="ml-1">⭐</span>}
                    {simulationResults?.results['CCR（初年度）（%）'] && simulationResults.results['CCR（初年度）（%）'] < 5 && <span className="ml-1">⚠️</span>}
                  </div>
                  <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-80">
                    <div className="font-semibold mb-1">CCR（初年度）</div>
                    <div className="mb-2">初年度の自己資金回収率を示します。</div>
                    <div className="text-gray-300 text-xs mb-1">計算式：初年度CF ÷ 自己資金 × 100</div>
                    <div className="text-gray-400 text-xs">※ 改装費を含む初年度実質収益</div>
                    <div className="text-yellow-400 text-xs border-t border-gray-600 pt-2 mt-2">
                      <div className="font-semibold mb-1">⚠️ 初年度のCCRについて</div>
                      初年度に改装費などがある場合、CCRはマイナスになることがあります。
                      これは、その年に現金収支がマイナスであったことを示す正常な値です。
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                
                {/* CCR（全期間） */}
                <div className="group relative">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help ${
                    simulationResults?.results['CCR（全期間）（%）'] && simulationResults.results['CCR（全期間）（%）'] >= 12 ? 'bg-green-100 text-green-800' :
                    simulationResults?.results['CCR（全期間）（%）'] && simulationResults.results['CCR（全期間）（%）'] >= 8 ? 'bg-yellow-100 text-yellow-800' :
                    simulationResults?.results['CCR（全期間）（%）'] && simulationResults.results['CCR（全期間）（%）'] >= 5 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-normal mr-1">CCR（全期間）</span>
                    <span className="font-semibold">{simulationResults?.results['CCR（全期間）（%）']?.toFixed(2) || '0.00'}%</span>
                    {simulationResults?.results['CCR（全期間）（%）'] && simulationResults.results['CCR（全期間）（%）'] >= 12 && <span className="ml-1">⭐</span>}
                    {simulationResults?.results['CCR（全期間）（%）'] && simulationResults.results['CCR（全期間）（%）'] < 5 && <span className="ml-1">⚠️</span>}
                  </div>
                  <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-80">
                    <div className="font-semibold mb-1">CCR（自己資金回収率）</div>
                    <div className="mb-2">投資した自己資金が年何％戻ってくるかを示します。</div>
                    <div className="text-gray-300 text-xs mb-1">計算式：年間平均CF ÷ 自己資金 × 100</div>
                    <div className="text-gray-400 text-xs">※ 10%なら約10年で元本回収</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                
                {/* DSCR */}
                <div className="group relative">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help ${
                    simulationResults.results['DSCR（返済余裕率）'] >= 1.5 ? 'bg-green-100 text-green-800' :
                    simulationResults.results['DSCR（返済余裕率）'] >= 1.3 ? 'bg-yellow-100 text-yellow-800' :
                    simulationResults.results['DSCR（返済余裕率）'] >= 1.1 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-normal mr-1">DSCR</span>
                    <span className="font-semibold">{simulationResults.results['DSCR（返済余裕率）']?.toFixed(2) || '0.00'}</span>
                    {simulationResults.results['DSCR（返済余裕率）'] >= 1.5 && <span className="ml-1">✓</span>}
                    {simulationResults.results['DSCR（返済余裕率）'] < 1.1 && <span className="ml-1">⚠️</span>}
                  </div>
                  <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64">
                    <div className="font-semibold mb-1">DSCR（債務返済能力）</div>
                    <div className="mb-2">年間純収益がローン返済額の何倍あるかを示します。</div>
                    <div className="text-gray-300 text-xs mb-1">計算式：年間純収益 ÷ 年間ローン返済額</div>
                    <div className="text-gray-400 text-xs">※ 1.0以上で返済可能、1.3以上が一般的な目安</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                
                {/* NOI */}
                <div className="group relative">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help ${
                    (simulationResults.results['NOI（円）'] || 0) >= 1000000 ? 'bg-green-100 text-green-800' :
                    (simulationResults.results['NOI（円）'] || 0) >= 500000 ? 'bg-yellow-100 text-yellow-800' :
                    (simulationResults.results['NOI（円）'] || 0) >= 100000 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-normal mr-1">NOI</span>
                    <span className="font-semibold">
                      {((simulationResults.results['NOI（円）'] || 0) / 10000).toFixed(0)}万円
                    </span>
                  </div>
                  <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64">
                    <div className="font-semibold mb-1">NOI（純営業収益）</div>
                    <div className="mb-2">年間家賃収入から運営費を差し引いた純収益です。</div>
                    <div className="text-gray-300 text-xs mb-1">計算式：年間家賃収入 - 運営費（管理費・税金等）</div>
                    <div className="text-gray-400 text-xs">※ ローン返済前の実質的な収益力</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                
                {/* ROI（初年度） */}
                <div className="group relative">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help ${
                    (simulationResults.results['ROI（初年度）（%）'] || 0) >= 15 ? 'bg-green-100 text-green-800' :
                    (simulationResults.results['ROI（初年度）（%）'] || 0) >= 10 ? 'bg-yellow-100 text-yellow-800' :
                    (simulationResults.results['ROI（初年度）（%）'] || 0) >= 5 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-normal mr-1">ROI（初年度）</span>
                    <span className="font-semibold">
                      {(simulationResults.results['ROI（初年度）（%）'] || 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64">
                    <div className="font-semibold mb-1">ROI（初年度）</div>
                    <div className="mb-2">初年度の投資収益率を示します。</div>
                    <div className="text-gray-300 text-xs mb-1">計算式：初年度CF ÷ 総投資額 × 100</div>
                    <div className="text-gray-400 text-xs">※ 改装費含む初年度実質収益</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                
                {/* ROI（全期間） */}
                <div className="group relative">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help ${
                    (simulationResults.results['ROI（全期間）（%）'] || 0) >= 15 ? 'bg-green-100 text-green-800' :
                    (simulationResults.results['ROI（全期間）（%）'] || 0) >= 10 ? 'bg-yellow-100 text-yellow-800' :
                    (simulationResults.results['ROI（全期間）（%）'] || 0) >= 5 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-normal mr-1">ROI（全期間）</span>
                    <span className="font-semibold">
                      {(simulationResults.results['ROI（全期間）（%）'] || 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64">
                    <div className="font-semibold mb-1">ROI（投資収益率）</div>
                    <div className="mb-2">投資した総額に対する年間収益の割合です。</div>
                    <div className="text-gray-300 text-xs mb-1">計算式：年間キャッシュフロー ÷ 総投資額 × 100</div>
                    <div className="text-gray-400 text-xs">※ 投資効率を測る基本指標</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                
                {/* LTV */}
                <div className="group relative">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help ${
                    (simulationResults.results['LTV（%）'] || 0) <= 70 ? 'bg-green-100 text-green-800' :
                    (simulationResults.results['LTV（%）'] || 0) <= 80 ? 'bg-yellow-100 text-yellow-800' :
                    (simulationResults.results['LTV（%）'] || 0) <= 90 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-normal mr-1">LTV</span>
                    <span className="font-semibold">
                      {(simulationResults.results['LTV（%）'] || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64">
                    <div className="font-semibold mb-1">LTV（融資比率）</div>
                    <div className="mb-2">物件価格に対する借入金額の割合です。</div>
                    <div className="text-gray-300 text-xs mb-1">計算式：借入金額 ÷ 物件価格 × 100</div>
                    <div className="text-gray-400 text-xs">※ 低いほど安全性が高い（70%以下推奨）</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 📋 年次キャッシュフロー詳細 - 最優先表示 */}
            {simulationResults.cash_flow_table && simulationResults.cash_flow_table.length > 0 && (
              <div className="mb-6">
                {/* PC版: タイトルとデータ数を横並び */}
                <div className="hidden md:flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">📋 年次キャッシュフロー詳細</h3>
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                    35年分のデータ
                  </span>
                </div>
                
                {/* SP版: タイトルとデータ数を縦並び */}
                <div className="md:hidden mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">📋 年次キャッシュフロー詳細</h3>
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded inline-block">
                    35年分のデータ
                  </span>
                </div>

                {/* キャッシュフローグラフ */}
                <div className="mb-6">
                  <CashFlowChart data={simulationResults.cash_flow_table} />
                </div>
                
                {/* 詳細キャッシュフロー分析 */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 詳細キャッシュフロー分析</h3>
                  {/* スクロール案内 */}
                  <p className="text-xs text-gray-500 mb-2">
                    <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                    横スクロールで全項目を確認できます
                  </p>
                </div>
                
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  {/* PC版・SP版ともに横スクロール可能に */}
                  <div className="relative max-h-[600px] overflow-y-auto overflow-x-auto cashflow-table-container">
                    <table className="min-w-full bg-white" style={{ minWidth: '1100px' }}>
                      <thead className="bg-blue-900 sticky top-0 z-10">
                        <tr>
                        <th className="px-0.5 py-2 text-center text-sm font-medium text-white border-b border-blue-900">年次</th>
                        <th className="px-0.5 py-2 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          不動産<br/>収入
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none min-w-[200px]">
                            家賃収入の推移。<br/>前面面で家賃下落（上昇）を選択した場合は次第に変化していきます。<br/>また、各年度で売却した際の売却価格（キャピタルゲイン）に影響を与えます。
                          </div>
                        </th>
                        <th className="px-0.5 py-2 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          経費
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none">
                            ランニングコスト
                          </div>
                        </th>
                        <th className="px-0.5 py-2 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          減価<br/>償却
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none">
                            減価償却費
                          </div>
                        </th>
                        <th className="px-0.5 py-2 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          税金
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none">
                            所得税・住民税
                          </div>
                        </th>
                        <th className="px-0.5 py-2 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          改装費<br/>修繕費
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none min-w-[320px]">
                            <div className="mb-2">
                              <span className="font-semibold">改装費・大規模修繕費の会計処理</span>
                            </div>
                            <div className="space-y-1">
                              <div>• 20万円以上: <span className="text-yellow-400">資本的支出</span></div>
                              <div className="ml-4 text-gray-300">→ 支出年度のCFから直接差し引かれます</div>
                              <div className="ml-4 text-gray-300">→ 税金計算上は減価償却処理されます</div>
                              <div>• 20万円未満: <span className="text-blue-400">通常修繕費</span></div>
                              <div className="ml-4 text-gray-300">→ 経費として即時計上されます</div>
                            </div>
                          </div>
                        </th>
                        <th className="px-0.5 py-2 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          ローン<br/>返済
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none">
                            年間ローン返済額（元金＋利息）
                          </div>
                        </th>
                        <th className="px-0.5 py-2 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          元金<br/>返済
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none">
                            ローン返済額のうち元金部分
                          </div>
                        </th>
                        <th className="px-0.5 py-2 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          年間<br/>CF
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none">
                            年間キャッシュフロー（税引後）
                          </div>
                        </th>
                        <th className="px-0.5 py-2 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          累計<br/>CF
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none">
                            累計キャッシュフロー
                          </div>
                        </th>
                        <th className="px-0.5 py-2 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          借入<br/>残高
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none">
                            借入残高
                          </div>
                        </th>
                        <th className="px-0.5 py-2 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          自己資金<br/>回収率
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none">
                            累計CFの自己資金に対する割合
                          </div>
                        </th>
                        <th className="px-0.5 py-2 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          自己資金<br/>推移
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none min-w-[250px]">
                            投下した自己資金の回収状況<br/>
                            <div className="text-yellow-400 mt-1">マイナス: まだ回収中</div>
                            <div className="text-green-400">プラス: 元本回収済み</div>
                          </div>
                        </th>
                        <th className="px-0.5 py-2 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          繰越<br/>欠損金
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 right-0 top-full mt-1 pointer-events-none min-w-[250px]">
                            繰越欠損金<br/>
                            過去の損失を累積し、<br/>
                            利益発生時に相殺して<br/>
                            税金を軽減する仕組み
                          </div>
                        </th>
                        <th className="px-0.5 py-2 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          売却<br/>金額
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 right-0 top-full mt-1 pointer-events-none min-w-[320px]">
                            物件の売却価格<br/>
                            <div className="mt-2 pt-2 border-t border-gray-600">
                              <div className="font-semibold mb-2">売却価格の算出方法</div>
                              <div className="space-y-1 mb-2">
                                <div className="text-yellow-300">採用値：</div>
                                <div>① 想定価格: ユーザー入力値 × 価格下落率</div>
                                <div className="text-gray-400">参考値：</div>
                                <div className="text-gray-400">② 収益還元価格: NOI ÷ Cap Rate</div>
                                <div className="text-gray-400">③ 積算評価: 土地評価額 + 建物評価額</div>
                              </div>
                              <div className="pt-2 border-t border-gray-600">
                                <div className="font-semibold mb-1">現在の評価額</div>
                                <div className="space-y-1">
                                  <div>積算評価: {simulationResults?.results['積算評価合計（万円）']?.toFixed(0) || '0'}万円</div>
                                  <div>収益還元: {simulationResults?.results['収益還元評価額（万円）']?.toFixed(0) || '0'}万円</div>
                                  <div>想定売却: {simulationResults?.results['想定売却価格（万円）']?.toFixed(0) || '0'}万円</div>
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-gray-600 font-semibold">→ 想定売却価格を採用しています</div>
                            </div>
                          </div>
                        </th>
                        <th className="px-0.5 py-2 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          売却<br/>純利益
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 right-0 top-full mt-1 pointer-events-none min-w-[250px]">
                            売却純利益<br/>
                            = 売却時累計CF - 累計CF<br/>
                            売却により追加される利益を表します
                          </div>
                        </th>
                        <th className="px-0.5 py-2 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          売却時<br/>累計CF
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 right-0 top-full mt-1 pointer-events-none min-w-[300px]">
                            売却時の累計キャッシュフロー<br/>
                            = 累計CF + 売却による純利益<br/>
                            投資全体の純利益を表します
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulationResults.cash_flow_table.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-0.5 py-2 text-sm text-gray-900 border-b text-center">{row['年次']}</td>
                          <td className={`px-0.5 py-2 text-sm border-b text-center ${(row['実効収入'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['実効収入'])}</td>
                          <td className={`px-0.5 py-2 text-sm border-b text-center ${(row['経費'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['経費'])}</td>
                          <td className={`px-0.5 py-2 text-sm border-b text-center ${(row['減価償却'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['減価償却'])}</td>
                          <td className={`px-0.5 py-2 text-sm border-b text-center ${(row['税金'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['税金'])}</td>
                          <td className={`px-0.5 py-2 text-sm border-b text-center ${(row['修繕費（参考）'] || 0) < 0 ? 'text-red-600' : 'text-gray-600'}`}>{formatCurrencyNoSymbol(row['修繕費（参考）'] || 0)}</td>
                          <td className={`px-0.5 py-2 text-sm border-b text-center ${(row['ローン返済'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['ローン返済'])}</td>
                          <td className={`px-0.5 py-2 text-sm border-b text-center ${(row['元金返済'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['元金返済'] || 0)}</td>
                          <td className={`px-0.5 py-2 text-sm border-b text-center ${(row['営業CF'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['営業CF'] || 0)}</td>
                          <td className={`px-0.5 py-2 text-sm border-b text-center ${(row['累計CF'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['累計CF'])}</td>
                          <td className={`px-0.5 py-2 text-sm border-b text-center ${(row['借入残高'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{Math.round(row['借入残高'] || 0).toLocaleString()}</td>
                          <td className={`px-0.5 py-2 text-sm border-b text-center ${(row['自己資金回収率'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{(row['自己資金回収率'] || 0).toFixed(1)}%</td>
                          <td className={`px-0.5 py-2 text-sm border-b text-center font-semibold ${(row['自己資金推移'] || 0) < 0 ? 'text-orange-600' : 'text-green-600'}`}>{formatCurrencyNoSymbol(row['自己資金推移'] || 0)}</td>
                          <td className={`px-0.5 py-2 text-sm border-b text-center ${((row as any)['繰越欠損金'] || 0) > 0 ? 'text-blue-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol((row as any)['繰越欠損金'] || 0)}</td>
                          <td className={`px-0.5 py-2 text-sm border-b text-center ${(row['売却金額'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['売却金額'] || 0)}</td>
                          <td className={`px-0.5 py-2 text-sm border-b text-center ${(row['売却による純利益'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['売却による純利益'] || 0)}</td>
                          <td className={`px-0.5 py-2 text-sm border-b text-center ${(row['売却時累計CF'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['売却時累計CF'] || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            )}

            
            </div>
          </div>
        </div>
      )}

      {/* 計算ロジック説明・注意事項 */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {simulationResults && (
          <div className="mt-6 bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="h-5 w-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              計算ロジック・注意事項
            </h3>
            
            {/* 計算ロジック説明 */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">📊 主要指標の計算方法</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
                <div>
                  <span className="font-medium">・表面利回り</span>：年間家賃収入 ÷ 物件価格 × 100
                </div>
                <div>
                  <span className="font-medium">・CCR（自己資金回収率）</span>：年間CF ÷ 自己資金 × 100
                </div>
                <div>
                  <span className="font-medium">・IRR（内部収益率）</span>：投資期間全体の収益率
                </div>
                <div>
                  <span className="font-medium">・DSCR（返済余裕率）</span>：NOI ÷ 年間ローン返済額
                </div>
              </div>
            </div>
            
            {/* 物件価値評価の計算方法 */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">📐 物件価値評価の算出方法</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600">
                <div>
                  <span className="font-medium">・積算評価額</span>：土地評価額 + 建物評価額
                </div>
                <div>
                  <span className="font-medium">・収益還元評価額</span>：年間NOI ÷ CapRate
                </div>
                <div>
                  <span className="font-medium">・想定売却価格</span>：出口戦略で設定した売却予定価格
                </div>
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded text-xs">
                <span className="font-medium text-blue-800">💡 売却価格の算定方法</span>
                <p className="mt-1 text-gray-700">
                  売却価格は想定売却価格を採用しています：<br/>
                  ① 想定売却価格（手動入力値に価格下落率を適用）<br/>
                  <span className="text-gray-500">参考値：<br/>
                  ② 収益還元価格（売却時のNOI ÷ 売却時Cap Rate）<br/>
                  ③ 積算評価（土地評価額 + 建物評価額）</span>
                </p>
              </div>
            </div>
            
            {/* 注意事項 */}
            <div className="border-t border-gray-300 pt-4">
              <h4 className="text-sm font-semibold text-red-600 mb-2">⚠️ 重要な注意事項</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>※ これらの数値はユーザー入力値に基づく参考計算値です。実際の取引価格は市況により変動します。</p>
                <p>※ 投資判断は必ず複数の専門家（不動産業者、税理士、FP等）にご相談の上、自己責任で行ってください。</p>
                <p>※ 本シミュレーションは簡易計算であり、実際の収支とは異なる場合があります。</p>
                <p>※ 税制改正、金利変動、空室リスク等により実際の収益は変動する可能性があります。</p>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* チュートリアル */}
      <Tutorial 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
      />
      
      {/* SP版詳細指標ポップアップ */}
      {showDetailPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 md:hidden">
          <div className="bg-white rounded-lg max-w-sm w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">詳細投資指標</h3>
              <button
                onClick={() => setShowDetailPopup(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* 評価額 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">■ 評価額</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">積算評価額</span>
                    <span className="font-semibold">{simulationResults?.results['積算評価合計（万円）']?.toFixed(0) || '0'}万円</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">収益還元評価額</span>
                    <span className="font-semibold">{simulationResults?.results['収益還元評価額（万円）']?.toFixed(0) || '0'}万円</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">想定売却価格</span>
                    <span className="font-semibold">{simulationResults?.results['想定売却価格（万円）']?.toFixed(0) || '0'}万円</span>
                  </div>
                </div>
              </div>
              
              {/* 収益性指標 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">■ 収益性指標</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ROI（投資収益率）</span>
                    <span className="font-semibold">{simulationResults?.results['ROI（%）']?.toFixed(0) || '0'}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IRR（内部収益率）</span>
                    <span className="font-semibold">{simulationResults?.results['IRR（%）']?.toFixed(1) || '0.0'}%</span>
                  </div>
                </div>
              </div>
              
              {/* 安全性指標 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">■ 安全性指標</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">DSCR（返済余裕率）</span>
                    <span className="font-semibold">{simulationResults?.results['DSCR（返済余裕率）']?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">LTV（借入比率）</span>
                    <span className="font-semibold">{simulationResults?.results['LTV（%）']?.toFixed(0) || '0'}%</span>
                  </div>
                </div>
              </div>
              
              {/* その他 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">■ その他</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">月間キャッシュフロー</span>
                    <span className="font-semibold">{((simulationResults?.results['月間キャッシュフロー（円）'] || 0) / 10000).toFixed(1)}万円</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">NOI（営業純収益）</span>
                    <span className="font-semibold">{((simulationResults?.results['NOI（円）'] || 0) / 10000).toFixed(0)}万円</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* SP版評価額と投資指標ポップアップ */}
      {showEvaluationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 md:hidden">
          <div className="bg-white rounded-lg max-w-sm w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">評価額と投資指標の詳細</h3>
              <button
                onClick={() => setShowEvaluationPopup(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* 物件価値評価 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">■ 物件価値評価</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">積算評価額</span>
                    <span className="font-semibold">{simulationResults?.results['積算評価合計（万円）']?.toFixed(0) || '0'}万円</span>
                  </div>
                  <div className="ml-4 text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>土地:</span>
                      <span>{simulationResults?.results['土地積算評価（万円）']?.toFixed(0) || '0'}万円</span>
                    </div>
                    <div className="flex justify-between">
                      <span>建物:</span>
                      <span>{simulationResults?.results['建物積算評価（万円）']?.toFixed(0) || '0'}万円</span>
                    </div>
                    {simulationResults?.results['建物積算評価（万円）'] === 0 && (
                      <div className="text-xs text-gray-400">※耐用年数超過</div>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">収益還元評価額</span>
                    <span className="font-semibold">{simulationResults?.results['収益還元評価額（万円）']?.toFixed(0) || '0'}万円</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">想定売却価格</span>
                    <span className="font-semibold">{simulationResults?.results['想定売却価格（万円）']?.toFixed(0) || '0'}万円</span>
                  </div>
                </div>
              </div>
              
              {/* 利回り指標 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">■ 利回り指標</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">表面利回り</span>
                    <span className="font-semibold">{simulationResults?.results['表面利回り（%）']?.toFixed(2) || '0.00'}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">実質利回り</span>
                    <span className="font-semibold">{simulationResults?.results['実質利回り（%）']?.toFixed(2) || '0.00'}%</span>
                  </div>
                </div>
              </div>
              
              {/* 投資効率指標 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">■ 投資効率指標</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">IRR（内部収益率）</span>
                    <span className="font-semibold">{simulationResults?.results['IRR（%）']?.toFixed(2) || '0.00'}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CCR（初年度）</span>
                    <span className="font-semibold">{simulationResults?.results['CCR（初年度）（%）']?.toFixed(2) || '0.00'}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CCR（全期間）</span>
                    <span className="font-semibold">{simulationResults?.results['CCR（全期間）（%）']?.toFixed(2) || '0.00'}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ROI（初年度）</span>
                    <span className="font-semibold">{simulationResults?.results['ROI（初年度）（%）']?.toFixed(2) || '0.00'}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ROI（全期間）</span>
                    <span className="font-semibold">{simulationResults?.results['ROI（全期間）（%）']?.toFixed(2) || '0.00'}%</span>
                  </div>
                </div>
              </div>
              
              {/* 安全性指標 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">■ 安全性指標</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">DSCR（返済余裕率）</span>
                    <span className="font-semibold">{simulationResults?.results['DSCR（返済余裕率）']?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">LTV（借入比率）</span>
                    <span className="font-semibold">{simulationResults?.results['LTV（%）']?.toFixed(1) || '0.0'}%</span>
                  </div>
                </div>
              </div>
              
              {/* 収益力指標 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">■ 収益力指標</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">年間キャッシュフロー</span>
                    <span className="font-semibold">{((simulationResults?.results['年間キャッシュフロー（円）'] || 0) / 10000).toFixed(1)}万円</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">月間キャッシュフロー</span>
                    <span className="font-semibold">{((simulationResults?.results['月間キャッシュフロー（円）'] || 0) / 10000).toFixed(1)}万円</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">NOI（営業純収益）</span>
                    <span className="font-semibold">{((simulationResults?.results['NOI（円）'] || 0) / 10000).toFixed(0)}万円</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* エラーモーダル */}
      <ErrorModal
        isOpen={errorModalData.isOpen}
        onClose={() => setErrorModalData({ ...errorModalData, isOpen: false })}
        errorCode={errorModalData.errorCode}
        message={errorModalData.message}
        solution={errorModalData.solution}
        details={errorModalData.details}
        onRetry={handleSimulation}
      />
    </div>
  );
};

export default Simulator;