import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap,
  CheckCircle,
  AlertCircle,
  Download,
  Users,
  MessageCircle
} from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useAuthContext } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';
import CashFlowChart from '../components/CashFlowChart';
import Tooltip from '../components/Tooltip';
import Tutorial from '../components/Tutorial';
import BackButton from '../components/BackButton';
import Breadcrumb from '../components/Breadcrumb';
import ImageUpload from '../components/ImageUpload';
import InviteModal from '../components/InviteModal';
import ShareCommentDisplay from '../components/ShareCommentDisplay';
// import { LegalDisclaimer } from '../components';
import { SimulationResultData, CashFlowData, PropertyShare } from '../types';
import { usePropertyShare } from '../hooks/usePropertyShare';
import { validatePropertyUrl } from '../utils/validation';
import { emptyPropertyData } from '../constants/sampleData';
import { useApiCall } from '../hooks/useApiCall';
import { rbacClient, Permission } from '../utils/rbacClient';
import { tooltips } from '../constants/tooltips';
import { sanitizeSimulatorInput, sanitizeMemoInput } from '../utils/xssSanitizer';
import { propertyStatusOptions, loanTypeOptions, ownershipTypeOptions, buildingStructureOptions } from '../constants/masterData';
import { handleError } from '../utils/secureErrorHandler';
import { formatCurrencyNoSymbol } from '../utils/formatHelpers';
import { 
  validateAndSanitizeNumber,
  validatePercentage,
  validateAmount,
  validateYears,
  validateBuildingYear,
  validateInterestRate,
  validateArea,
  validateRoadPrice,
  validateLoanToPurchaseRatio
} from '../utils/numberValidation';
import { 
  validateExtremeValue, 
  preprocessExtremeInput
} from '../utils/extremeValueValidator';

// FAST API のベースURL
// const API_BASE_URL = 'https://real-estate-app-1-iii4.onrender.com';

interface SimulationResult {
  results: SimulationResultData;
  cash_flow_table?: CashFlowData[];
}

// フォーム入力用の型（camelCaseを使用）
interface FormInputData {
  propertyName: string;
  location: string;
  landArea: number;
  buildingArea: number;
  roadPrice: number;
  marketValue: number;
  purchasePrice: number;
  otherCosts: number;
  renovationCost: number;
  monthlyRent: number;
  managementFee: number;
  fixedCost: number;
  propertyTax: number;
  vacancyRate: number;
  rentDecline: number;
  loanAmount: number;
  interestRate: number;
  loanYears: number;
  loanType: '元利均等' | '元金均等';
  holdingYears: number;
  exitCapRate: number;
  ownershipType: '個人' | '法人';
  effectiveTaxRate: number;
  majorRepairCycle: number;
  majorRepairCost: number;
  building_price_for_depreciation: number;
  depreciationYears: number;
  buildingYear?: number;
  buildingStructure?: string;
  propertyUrl?: string;
  propertyMemo?: string;
  propertyImageUrl?: string;
  propertyImageFile?: File;
  propertyStatus?: string;
  annualDepreciationRate?: number;
}




const Simulator: React.FC = () => {
  const { user } = useAuthContext();
  const { saveSimulation, getSimulations } = useSupabaseData();
  const { executeSimulation } = useApiCall();
  const location = useLocation();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResult | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [currentShare, setCurrentShare] = useState<PropertyShare | null>(null);
  const [isManualDepreciation, setIsManualDepreciation] = useState(false);
  
  const { fetchOrCreateShareByPropertyId, fetchShareTokenFromSimulation, fetchShare } = usePropertyShare();
  const resultsRef = useRef<HTMLDivElement>(null);

  const [inputs, setInputs] = useState<FormInputData>(emptyPropertyData as FormInputData);




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

  // ユーザー認証完了後に共有情報を必ず取得
  useEffect(() => {
    if (user?.id && editingId) {
      console.log('🔄 ユーザー認証完了後の共有情報取得/作成');
      const fetchShareInfo = async () => {
        try {
          const propertyName = inputs.propertyName || simulationResults?.results?.propertyName || '物件シミュレーション';
          console.log(`🎯 Property ID: ${editingId}, Property Name: ${propertyName}`);
          
          const share = await fetchOrCreateShareByPropertyId(editingId, propertyName);
          if (share) {
            console.log('✅ 共有情報取得/作成成功:', {
              shareId: share.id,
              shareToken: share.share_token,
              propertyId: share.property_id
            });
            setCurrentShare(share);
          } else {
            if (import.meta.env.DEV) {
              console.log('❌ 共有情報の取得/作成に失敗');
            }
          }
        } catch (error) {
          handleError(error, 'fetchShareInfo');
        }
      };
      fetchShareInfo();
    }
  }, [user?.id, editingId, inputs.propertyName]);

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
      
      const simulation = data?.find((sim: any) => sim.id === simulationId);
      if (simulation && simulation.simulation_data) {
        const simData = simulation.simulation_data;
        setInputs({
          propertyName: simData.propertyName || '品川区投資物件',
          location: simData.location || '東京都品川区',
          landArea: simData.landArea || 135.00,
          buildingArea: simData.buildingArea || 150.00,
          roadPrice: simData.roadPrice || 250000,
          marketValue: simData.marketValue || 8000,
          purchasePrice: simData.purchasePrice || 6980,
          otherCosts: simData.otherCosts || 300,
          renovationCost: simData.renovationCost || 200,
          monthlyRent: simData.monthlyRent || 250000,
          managementFee: simData.managementFee || 5000,
          fixedCost: simData.fixedCost || 0,
          propertyTax: simData.propertyTax || 100000,
          vacancyRate: simData.vacancyRate || 5.00,
          rentDecline: simData.rentDecline || 1.00,
          loanAmount: simData.loanAmount || 6500,
          interestRate: simData.interestRate || 0.70,
          loanYears: simData.loanTerm || 35,
          loanType: simData.loanType || '元利均等',
          holdingYears: simData.holdingYears || 10,
          exitCapRate: simData.exitCapRate || 6.00,
          ownershipType: simData.ownershipType || '個人',
          effectiveTaxRate: simData.effectiveTaxRate || 20,
          majorRepairCycle: simData.majorRepairCycle || 10,
          majorRepairCost: simData.majorRepairCost || 200,
          building_price_for_depreciation: simData.building_price_for_depreciation || 3000,
          depreciationYears: simData.depreciationYears || 27,
          propertyUrl: simData.propertyUrl || '',
          propertyMemo: simData.propertyMemo || '',
          propertyImageUrl: simData.propertyImageUrl || '',
          annualDepreciationRate: simData.annualDepreciationRate || 1.0
        });
        
        // 既存の結果も表示
        if (simulation.results) {
          setSimulationResults({
            results: {
              '表面利回り（%）': simulation.results.surfaceYield || 0,
              '実質利回り（%）': simulation.results.netYield || 0,
              'IRR（%）': simulation.results.irr,
              'CCR（%）': simulation.results.ccr || 0,
              'ROI（%）': simulation.results.roi || 0,
              'DSCR（返済余裕率）': simulation.results.dscr || 0,
              '月間キャッシュフロー（円）': simulation.results.monthlyCashFlow || 0,
              '年間キャッシュフロー（円）': simulation.results.annualCashFlow || 0,
              'NOI（円）': simulation.results.noi || 0,
              'LTV（%）': simulation.results.ltv || 0,
              '想定売却価格（万円）': simulation.results.expectedSalePrice || 0,
              '残債（万円）': simulation.results.remainingDebt || 0,
              '売却コスト（万円）': simulation.results.saleCost || 0,
              '売却益（万円）': simulation.results.saleProfit || 0,
              '総投資額（円）': simulation.results.totalInvestment || 0,
              '自己資金（円）': simulation.results.equity || 0,
              '借入額（円）': simulation.results.loanAmount || 0,
              propertyName: inputs.propertyName
            },
            cash_flow_table: simulation.cash_flow_table
          });
        }
        
        
        // 既存のシミュレーションから共有トークンを取得
        if (simulation.share_token) {
          console.log('🔍 既存シミュレーションから共有トークンを発見:', simulation.share_token);
          try {
            // 共有トークンから共有情報を取得
            const shareData = await fetchShare(simulation.share_token);
            if (shareData) {
              console.log('✅ 既存の共有情報を取得:', shareData);
              setCurrentShare(shareData);
            }
          } catch (shareError) {
            handleError(shareError, 'fetchShareFromExisting');
          }
        }
        
        // 共有情報が見つからない場合は取得/作成（ユーザー認証確認後）
        if (!currentShare && user?.id) {
          try {
            console.log('🔄 既存データの共有情報を取得/作成中...');
            const propertyName = simData.propertyName || '物件シミュレーション';
            const share = await fetchOrCreateShareByPropertyId(simulationId, propertyName);
            
            if (share) {
              console.log('✅ 共有情報の取得/作成に成功:', share);
              setCurrentShare(share);
            } else {
              console.log('⚠️ 共有情報の取得/作成に失敗');
            }
          } catch (shareError) {
            handleError(shareError, 'fetchOrCreateShareByPropertyId');
          }
        } else if (!user?.id && import.meta.env.DEV) {
          console.log('⚠️ ユーザー未認証のため共有情報の取得をスキップ');
        }
      }
    } catch (err: any) {
      const errorInfo = handleError(err, 'loadExistingData');
      setSaveError(errorInfo.userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setInputs((prev: FormInputData) => {
      // テキストフィールドのサニタイゼーション（SEC-012強化版）
      let sanitizedValue: any = value;
      
      if (typeof value === 'string') {
        if (field === 'propertyName' || field === 'location') {
          // SEC-012: DOMPurifyを使用した強化されたXSS対策
          sanitizedValue = sanitizeSimulatorInput(value);
        } else if (field === 'propertyMemo') {
          // SEC-012: メモフィールド用のサニタイズ（改行保持）
          sanitizedValue = sanitizeMemoInput(value);
        }
      }
      
      // 数値フィールドの検証（SEC-013強化版：極端な値対策）
      if (typeof value === 'number' || !isNaN(Number(value))) {
        // SEC-013: 極端な値の前処理
        const preprocessedValue = typeof value === 'string' ? preprocessExtremeInput(value) : String(value);
        
        // フィールドタイプの判定
        let fieldType: 'price' | 'percentage' | 'years' | 'area' | 'general' = 'general';
        
        // 価格系フィールド
        if (['purchasePrice', 'otherCosts', 'renovationCost', 'monthlyRent', 
             'managementFee', 'fixedCost', 'propertyTax', 'loanAmount', 
             'marketValue', 'building_price_for_depreciation', 'majorRepairCost', 'roadPrice'].includes(field)) {
          fieldType = 'price';
        }
        // パーセンテージ系フィールド
        else if (['vacancyRate', 'rentDecline', 'exitCapRate', 'effectiveTaxRate', 
                  'annualDepreciationRate', 'interestRate'].includes(field)) {
          fieldType = 'percentage';
        }
        // 年数系フィールド
        else if (['loanYears', 'holdingYears', 'depreciationYears', 'majorRepairCycle', 'buildingYear'].includes(field)) {
          fieldType = 'years';
        }
        // 面積系フィールド
        else if (['landArea', 'buildingArea'].includes(field)) {
          fieldType = 'area';
        }
        
        // SEC-013: 極端な値の検証
        const extremeValidation = validateExtremeValue(preprocessedValue, fieldType);
        if (!extremeValidation.isValid) {
          console.warn(`SEC-013: 極端な値を検出 - ${field}: ${value} - ${extremeValidation.message}`);
          // エラーメッセージをユーザーに表示する処理を追加できます
          return prev; // 無効な値の場合は前の値を保持
        }
        
        // 既存の検証（SEC-017）
        switch (field) {
          case 'landArea':
          case 'buildingArea':
            sanitizedValue = validateArea(extremeValidation.sanitizedValue);
            break;
          case 'roadPrice':
            sanitizedValue = validateRoadPrice(extremeValidation.sanitizedValue);
            break;
          case 'buildingYear':
            sanitizedValue = validateBuildingYear(extremeValidation.sanitizedValue);
            break;
          case 'purchasePrice':
          case 'otherCosts':
          case 'renovationCost':
          case 'monthlyRent':
          case 'managementFee':
          case 'fixedCost':
          case 'propertyTax':
          case 'loanAmount':
          case 'marketValue':
          case 'building_price_for_depreciation':
          case 'majorRepairCost':
            sanitizedValue = validateAmount(extremeValidation.sanitizedValue);
            break;
          case 'vacancyRate':
          case 'rentDecline':
          case 'exitCapRate':
          case 'effectiveTaxRate':
          case 'annualDepreciationRate':
            sanitizedValue = validatePercentage(extremeValidation.sanitizedValue);
            break;
          case 'interestRate':
            sanitizedValue = validateInterestRate(extremeValidation.sanitizedValue);
            break;
          case 'loanYears':
          case 'holdingYears':
          case 'depreciationYears':
            sanitizedValue = validateYears(extremeValidation.sanitizedValue);
            break;
          case 'majorRepairCycle':
            sanitizedValue = validateYears(extremeValidation.sanitizedValue, 35);
            break;
          default:
            // その他の数値フィールドは基本的な検証のみ
            sanitizedValue = validateAndSanitizeNumber(extremeValidation.sanitizedValue, { min: 0 });
        }
        
        // 無効な値の場合は前の値を保持
        if (sanitizedValue === null) {
          return prev;
        }
      }
      
      const newInputs = {
        ...prev,
        [field]: sanitizedValue
      };

      // 自動設定機能
      if (field === 'purchasePrice' && typeof value === 'number' && value > 0) {
        // 建物価格：購入価格の30%を自動設定
        if (!prev.building_price_for_depreciation || prev.building_price_for_depreciation === 0) {
          newInputs.building_price_for_depreciation = Math.round(value * 0.3);
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
      if (!isManualDepreciation && (field === 'buildingYear' || field === 'buildingStructure')) {
        const currentYear = new Date().getFullYear();
        const buildingYear = field === 'buildingYear' ? Number(value) : newInputs.buildingYear;
        const structure = field === 'buildingStructure' ? String(value) : newInputs.buildingStructure;
        
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
      
      // 借入額と購入価格の論理検証（SEC-018対応）
      if ((field === 'loanAmount' || field === 'purchasePrice' || field === 'otherCosts' || field === 'renovationCost') 
          && newInputs.loanAmount && newInputs.purchasePrice) {
        const validation = validateLoanToPurchaseRatio(
          newInputs.loanAmount, 
          newInputs.purchasePrice,
          newInputs.otherCosts || 0,
          newInputs.renovationCost || 0
        );
        if (!validation.isValid) {
          setSaveError(validation.message || '');
          // 無効な場合は前の値を保持
          return prev;
        } else {
          setSaveError(null);
          // LTV情報を表示用に保存（オプション）
          if (validation.ltv !== undefined) {
            console.log(`LTV: ${validation.ltv.toFixed(1)}%`);
          }
        }
      }

      return newInputs;
    });
  };

  const urlError = inputs.propertyUrl ? validatePropertyUrl(inputs.propertyUrl) : null;

  const handleSimulation = async () => {
    // 権限チェック（認証が有効な場合のみ）
    if (import.meta.env.VITE_DISABLE_API_AUTH !== 'true' && !rbacClient.hasPermission(Permission.SIMULATE_BASIC)) {
      setSaveError(rbacClient.getPermissionDeniedMessage(Permission.SIMULATE_BASIC));
      return;
    }
    
    setIsSimulating(true);
    setSaveError(null);
    
    try {
      // useApiCallのexecuteSimulationを使用（認証付き）
      const result = await executeSimulation(inputs);
      console.log('FAST APIレスポンス:', result);
      console.log('キャッシュフローテーブルの詳細:', result.cash_flow_table);
      console.log('キャッシュフローテーブルの件数:', result.cash_flow_table?.length);
      
      if (result.results) {
        console.log('受信したキャッシュフローテーブル長:', result.cash_flow_table?.length);
        console.log('最初の5行:', result.cash_flow_table?.slice(0, 5));
        console.log('最後の5行:', result.cash_flow_table?.slice(-5));
        setSimulationResults(result);
        
        // 認証ユーザーの場合は自動保存
        if (user) {
          try {
            const simulationName = `${inputs.propertyName || '物件'}_${new Date().toLocaleDateString('ja-JP')}`;
            const saveData = {
              simulation_name: simulationName,
              input_data: inputs,
              result_data: result,
              simulation_data: inputs,
              results: result.results,
              cash_flow_table: result.cash_flow_table
            };
            
            const { data: savedData, error: saveError } = await saveSimulation(saveData);
            if (saveError) {
              console.error('シミュレーション結果の自動保存に失敗:', saveError);
            } else {
              console.log('シミュレーション結果を自動保存しました:', savedData);
              setSaveMessage('シミュレーション結果が自動保存されました');
              setTimeout(() => setSaveMessage(null), 3000);
            }
          } catch (autoSaveError) {
            console.error('自動保存エラー:', autoSaveError);
          }
        }
        
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
                propertyType: '賃貸',  // デフォルト値
                purchasePrice: inputs.purchasePrice,
                monthlyRent: inputs.monthlyRent,
                managementFee: inputs.managementFee || 0,
                loanTerm: inputs.loanYears,
                interestRate: inputs.interestRate,
                loanAmount: inputs.loanAmount,
                holdingYears: inputs.holdingYears,
                vacancyRate: inputs.vacancyRate,
                propertyTax: inputs.propertyTax,
                ownershipType: inputs.ownershipType,
                effectiveTaxRate: inputs.effectiveTaxRate,
                majorRepairCycle: inputs.majorRepairCycle,
                majorRepairCost: inputs.majorRepairCost,
                building_price_for_depreciation: inputs.building_price_for_depreciation,
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
                dscr: result.results['DSCR（返済余裕率）'] || 0,
                monthlyCashFlow: result.results['月間キャッシュフロー（円）'] || 0,
                annualCashFlow: result.results['年間キャッシュフロー（円）'] || 0
              },
              // cash_flow_table (JSONB) - キャッシュフローテーブル
              cash_flow_table: result.cash_flow_table || []
            };
            
            console.log('保存データ:', simulationData);
            
            // 編集モードかどうかを判定
            const isEditMode = Boolean(editingId);
            console.log('🔍 編集モード:', isEditMode, 'editingId:', editingId);
            
            let shareToken: string | null = null;
            
            if (isEditMode) {
              // 編集モードの場合は既存の共有トークンを使用
              if (currentShare?.share_token) {
                shareToken = currentShare.share_token;
                console.log('🔄 編集モード: 既存の共有トークンを使用:', shareToken);
              } else {
                // currentShareがない場合は、シミュレーションから共有トークンを探す
                try {
                  const existingShareToken = await fetchShareTokenFromSimulation(editingId || '');
                  if (existingShareToken) {
                    shareToken = existingShareToken;
                    console.log('🔍 編集モード: シミュレーションから共有トークンを取得:', shareToken);
                  }
                } catch (err) {
                  console.log('⚠️ 既存の共有トークン取得に失敗:', err);
                }
              }
            } else {
              // 新規作成モードの場合は新しい共有を作成
              try {
                console.log('📝 新規作成モード: 共有情報を作成中...');
                const propertyName = inputs.propertyName || '物件シミュレーション';
                const tempId = crypto.randomUUID();
                const share = await fetchOrCreateShareByPropertyId(tempId, propertyName);
                
                if (share) {
                  console.log('✅ 共有情報の作成に成功:', share);
                  shareToken = share.share_token;
                  setCurrentShare(share);
                } else {
                  console.log('⚠️ 共有情報の作成に失敗、共有トークンなしで保存');
                }
              } catch (shareError) {
                console.error('❌ 共有情報の処理中にエラー:', shareError);
              }
            }
            
            // シミュレーションデータを保存（編集モードの場合は更新、新規の場合は作成）
            const { data, error: saveError } = await saveSimulation(
              simulationData, 
              shareToken ?? undefined, 
              isEditMode ? editingId ?? undefined : undefined
            );
            
            if (saveError) {
              throw new Error(saveError);
            }
            
            setSaveMessage(isEditMode ? '✅ シミュレーション結果を更新しました！' : '✅ シミュレーション結果を保存しました！');
            console.log('保存成功:', data);
            
            // 新規作成の場合のみproperty_idを更新
            if (!isEditMode && data && data.id && shareToken && currentShare) {
              try {
                console.log('🔄 新規作成: 共有情報のproperty_idを実際の値に更新中...');
                const { error: updateError } = await supabase
                  .from('property_shares')
                  .update({ property_id: data.id })
                  .eq('id', currentShare.id);
                
                if (updateError) {
                  console.error('❌ 共有情報の更新エラー:', updateError);
                } else {
                  console.log('✅ 共有情報の更新成功');
                  const updatedShare = { ...currentShare, property_id: data.id };
                  setCurrentShare(updatedShare);
                  // editingIdも更新して、以降の共有で同じIDが使われるようにする
                  setEditingId(data.id);
                }
              } catch (updateShareError) {
                console.error('❌ 共有情報の更新中にエラー:', updateShareError);
              }
            }
            
            // 編集モードの場合でも、保存後にeditingIdが正しく設定されていることを確認
            if (isEditMode && data && data.id && !editingId) {
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
      
    } catch (error) {
      handleError(error, 'Simulation Execution');
      let errorMessage = '不明なエラー';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'APIサーバーの応答がタイムアウトしました。Renderの無料プランでは初回アクセス時に時間がかかる場合があります。再度お試しください。';
        } else {
          errorMessage = error.message;
        }
      }
      
      setSaveError(`シミュレーション処理でエラーが発生しました: ${errorMessage}`);
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

  // 必須項目のチェック
  const isFormValid = inputs.propertyName && inputs.purchasePrice > 0;

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
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
      <div className="max-w-6xl mx-auto print:max-w-full">
        {/* Breadcrumb */}
        <div className="print:hidden">
          <Breadcrumb />
        </div>
        
        {/* Header */}
        <div className="mb-6 print:hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                物件収益シミュレーター
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowTutorial(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>使い方を見る</span>
                <span className="text-sm">📖</span>
              </button>
              <BackButton />
            </div>
          </div>
          <p className="text-gray-600">
            物件の収益性を詳細に計算し、投資判断の参考情報を提供します。
          </p>
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
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 print:hidden">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-800">{saveError}</span>
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6 print:hidden">
          {/* 🏠 物件情報 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏠 物件情報 <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded ml-2">必須</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 物件名 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    物件名
                  </label>
                  <Tooltip content={tooltips.propertyName} />
                </div>
                <input
                  type="text"
                  value={inputs.propertyName}
                  onChange={(e) => handleInputChange('propertyName', e.target.value)}
                  placeholder="例：カーサ○○マンション"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* 住所 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    住所
                  </label>
                  <Tooltip content={tooltips.location} />
                </div>
                <input
                  type="text"
                  value={inputs.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="例：東京都渋谷区神宮前1-1-1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
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
                    step="0.01"
                    value={inputs.landArea}
                    onChange={(e) => handleInputChange('landArea', Number(e.target.value))}
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
                    step="0.01"
                    value={inputs.buildingArea}
                    onChange={(e) => handleInputChange('buildingArea', Number(e.target.value))}
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
                    value={inputs.roadPrice}
                    onChange={(e) => handleInputChange('roadPrice', Number(e.target.value))}
                    placeholder="120000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">円/㎡</span>
                </div>
              </div>
              {/* 建築年 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    建築年
                  </label>
                  <Tooltip content="建築年を入力してください。自動的に築年数と減価償却年数が計算されます。" />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={inputs.buildingYear || ''}
                    onChange={(e) => handleInputChange('buildingYear', Number(e.target.value) || 0)}
                    placeholder="2020"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">年</span>
                </div>
                {inputs.buildingYear && inputs.buildingYear > 0 && (
                  <div className="text-xs text-gray-600 mt-1">
                    築{new Date().getFullYear() - inputs.buildingYear}年（{new Date().getFullYear()}年現在）
                  </div>
                )}
              </div>

              {/* 建物構造 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    建物構造
                  </label>
                  <Tooltip content="建物の構造を選択してください。構造により法定耐用年数が自動設定されます。" />
                </div>
                <select
                  value={inputs.buildingStructure || ''}
                  onChange={(e) => handleInputChange('buildingStructure', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {buildingStructureOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 💰 取得・初期費用 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 取得・初期費用 <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded ml-2">必須</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 購入価格 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    購入価格
                  </label>
                  <Tooltip content={tooltips.purchasePrice} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.purchasePrice}
                    onChange={(e) => handleInputChange('purchasePrice', Number(e.target.value))}
                    placeholder="12000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">万円</span>
                </div>
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
                    value={inputs.otherCosts}
                    onChange={(e) => handleInputChange('otherCosts', Number(e.target.value))}
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
                    value={inputs.renovationCost}
                    onChange={(e) => handleInputChange('renovationCost', Number(e.target.value))}
                    placeholder="370"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">万円</span>
                </div>
              </div>
            </div>
          </div>

          {/* 📈 収益情報 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 収益情報 <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded ml-2">必須</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 月額賃料 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    月額賃料
                  </label>
                  <Tooltip content={tooltips.monthlyRent} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={inputs.monthlyRent}
                    onChange={(e) => handleInputChange('monthlyRent', Number(e.target.value))}
                    placeholder="250000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">円</span>
                </div>
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
                    value={inputs.managementFee}
                    onChange={(e) => handleInputChange('managementFee', Number(e.target.value))}
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
                    value={inputs.fixedCost}
                    onChange={(e) => handleInputChange('fixedCost', Number(e.target.value))}
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
                    value={inputs.propertyTax}
                    onChange={(e) => handleInputChange('propertyTax', Number(e.target.value))}
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
                    value={inputs.vacancyRate}
                    onChange={(e) => handleInputChange('vacancyRate', Number(e.target.value))}
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
                    value={inputs.rentDecline}
                    onChange={(e) => handleInputChange('rentDecline', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">%/年</span>
                </div>
              </div>
            </div>
          </div>

          {/* 🏦 借入条件 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏦 借入条件 <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded ml-2">必須</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 借入額 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    借入額
                  </label>
                  <Tooltip content={tooltips.loanAmount} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.loanAmount}
                    onChange={(e) => handleInputChange('loanAmount', Number(e.target.value))}
                    placeholder="10000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">万円</span>
                </div>
              </div>

              {/* 金利 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    金利
                  </label>
                  <Tooltip content={tooltips.interestRate} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.interestRate}
                    onChange={(e) => handleInputChange('interestRate', Number(e.target.value))}
                    placeholder="2.875"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">%</span>
                </div>
              </div>

              {/* 返済期間 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    返済期間
                  </label>
                  <Tooltip content={tooltips.loanYears} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={inputs.loanYears}
                    onChange={(e) => handleInputChange('loanYears', Number(e.target.value))}
                    placeholder="25"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">年</span>
                </div>
              </div>

              {/* 借入形式 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    借入形式
                  </label>
                  <Tooltip content={tooltips.loanType} />
                </div>
                <select
                  value={inputs.loanType}
                  onChange={(e) => handleInputChange('loanType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {loanTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 🎯 出口戦略 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 出口戦略 <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded ml-2">必須</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 保有年数 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    保有年数
                  </label>
                  <Tooltip content={tooltips.holdingYears} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={inputs.holdingYears}
                    onChange={(e) => handleInputChange('holdingYears', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">年</span>
                </div>
              </div>

              {/* 売却CapRate */}
              <div>
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
                    value={inputs.exitCapRate}
                    onChange={(e) => handleInputChange('exitCapRate', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">%</span>
                </div>
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
                    value={inputs.marketValue}
                    onChange={(e) => handleInputChange('marketValue', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">万円</span>
                </div>
              </div>

              {/* 年間価値下落率 */}
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    年間価値下落率
                  </label>
                  <Tooltip content="物件価値が年間で下落する割合（%）。建物の経年劣化や市場環境を考慮します。通常0.5〜2.0%程度を設定します。" />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.annualDepreciationRate || 1.0}
                    onChange={(e) => handleInputChange('annualDepreciationRate', Number(e.target.value))}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 税務・会計設定</h3>
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
                  onChange={(e) => handleInputChange('ownershipType', e.target.value)}
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
                    value={inputs.effectiveTaxRate || 0}
                    onChange={(e) => handleInputChange('effectiveTaxRate', Number(e.target.value))}
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
                  <Tooltip content={tooltips.building_price_for_depreciation} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="100"
                    value={inputs.building_price_for_depreciation || 0}
                    onChange={(e) => handleInputChange('building_price_for_depreciation', Number(e.target.value))}
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
                {!isManualDepreciation ? (
                  <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">{inputs.depreciationYears || 27}年</span>
                      <button
                        type="button"
                        onClick={() => setIsManualDepreciation(true)}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        手動調整
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {inputs.buildingYear && inputs.buildingStructure ? (
                        <>
                          {(() => {
                            const currentYear = new Date().getFullYear();
                            const buildingAge = currentYear - inputs.buildingYear;
                            const getLegalLife = (structure: string) => {
                              switch (structure) {
                                case 'RC': return 47;
                                case 'SRC': return 39;
                                case 'S': return 34;
                                case '木造': return 22;
                                default: return 27;
                              }
                            };
                            const legalLife = getLegalLife(inputs.buildingStructure);
                            const isExceeded = buildingAge >= legalLife;
                            
                            if (isExceeded) {
                              return (
                                <>
                                  <span className="text-orange-600 font-medium">
                                    ⚠️ 耐用年数超過物件
                                  </span>
                                  ：{inputs.buildingStructure}（法定{legalLife}年）で築{buildingAge}年 
                                  → 残存{inputs.depreciationYears}年（法定耐用年数×20%）
                                </>
                              );
                            } else {
                              return `${inputs.buildingStructure}（法定${legalLife}年）で築${buildingAge}年 → 残存${inputs.depreciationYears}年`;
                            }
                          })()}
                        </>
                      ) : (
                        '建築年・構造から自動計算'
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <select
                        value={inputs.depreciationYears || 27}
                        onChange={(e) => handleInputChange('depreciationYears', Number(e.target.value))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value={4}>4年（木造超過）</option>
                        <option value={22}>22年（木造）</option>
                        <option value={27}>27年（軽量鉄骨）</option>
                        <option value={34}>34年（重量鉄骨）</option>
                        <option value={39}>39年（SRC造）</option>
                        <option value={47}>47年（RC造）</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setIsManualDepreciation(false);
                          // 自動モードに戻った時に再計算
                          if (inputs.buildingYear && inputs.buildingStructure) {
                            handleInputChange('buildingYear', inputs.buildingYear);
                          }
                        }}
                        className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 border border-gray-300 rounded"
                      >
                        自動
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      手動調整モード：築年数や資金調達に合わせて調整可能
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 🔧 大規模修繕設定 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 大規模修繕設定</h3>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500 ml-2">万円</span>
                </div>
              </div>
            </div>
          </div>

          {/* 📌 物件ブックマーク */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📌 物件ブックマーク</h3>
            <div className="space-y-4">
              {/* URLとメモを横並び */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 物件URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    物件URL（SUUMO、athome等）
                  </label>
                  <input
                    type="url"
                    value={inputs.propertyUrl || ''}
                    onChange={(e) => handleInputChange('propertyUrl', e.target.value)}
                    placeholder="https://suumo.jp/..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      urlError 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500'
                    }`}
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
                  <textarea
                    value={inputs.propertyMemo || ''}
                    onChange={(e) => handleInputChange('propertyMemo', e.target.value)}
                    placeholder="物件の特徴、気になるポイント、検討事項など..."
                    rows={3}
                    maxLength={1000}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {inputs.propertyMemo ? `${inputs.propertyMemo.length}/1000文字` : '0/1000文字'}
                  </p>
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
            <div className="flex justify-center">
              <button 
                onClick={handleSimulation}
                disabled={isSimulating || !isFormValid}
                className={`flex items-center justify-center px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 min-h-[56px] touch-manipulation ${
                  isSimulating || !isFormValid
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 active:scale-[0.98] text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {isSimulating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    AI分析中...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    シミュレーションを実行する
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
              <div className="p-4 rounded-lg border flex items-center text-red-700 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>{saveError}</span>
              </div>
            )}
          </div>
        )}

        {/* シミュレーション結果表示 */}
        {simulationResults && (
          <div 
            ref={resultsRef}
            className="mt-6 bg-white rounded-lg border-2 border-blue-200 shadow-lg p-6 scroll-mt-4 simulation-results print:m-0 print:shadow-none"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-1 h-8 bg-blue-500 rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-gray-900">📊 シミュレーション結果</h2>
                <div className="ml-3 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full animate-pulse">
                  NEW!
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {user && saveMessage?.includes('✅') && (
                  <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                    ✓ マイページに保存済み
                  </span>
                )}
                
                {/* メール招待・共有ボタン */}
                {user && (editingId || saveMessage?.includes('✅')) && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 print:hidden shadow-md"
                    title="家族や専門家を招待してコメントで相談"
                  >
                    <Users size={18} />
                    <span>メールで招待・共有</span>
                  </button>
                )}
                
                
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
            
            {/* 物件価値評価と重要投資指標 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 評価額と投資指標</h3>
              <div className="flex flex-wrap gap-2">
                {/* 積算評価額 */}
                <div className="group relative">
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help">
                    <span className="font-normal mr-1">積算</span>
                    <span className="font-semibold">7,200万円</span>
                    <span className="text-xs ml-1">※</span>
                  </div>
                  <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64">
                    <div className="font-semibold mb-1">積算評価額</div>
                    <div className="mb-2">土地と建物を別々に評価して合計した価格です。</div>
                    <div className="text-gray-300 text-xs mb-1">計算式：(土地面積 × 路線価) + (建物面積 × 再調達価格)</div>
                    <div className="text-gray-400 text-xs">※ 銀行融資の際に重視される評価方法</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                
                {/* 収益還元評価額 */}
                <div className="group relative">
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help">
                    <span className="font-normal mr-1">収益還元</span>
                    <span className="font-semibold">8,400万円</span>
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
                
                {/* 想定実勢価格 */}
                <div className="group relative">
                  <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help">
                    <span className="font-normal mr-1">実勢</span>
                    <span className="font-semibold">8,000万円</span>
                    <span className="text-xs ml-1">※</span>
                  </div>
                  <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64">
                    <div className="font-semibold mb-1">実勢価格</div>
                    <div className="mb-2">実際の市場で取引される想定価格です。</div>
                    <div className="text-gray-300 text-xs mb-1">入力された想定売却価格を表示</div>
                    <div className="text-gray-400 text-xs">※ 周辺の取引事例等を参考に設定</div>
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
                    simulationResults.results['実質利回り（%）'] >= 6 ? 'bg-green-100 text-green-800' :
                    simulationResults.results['実質利回り（%）'] >= 4.5 ? 'bg-yellow-100 text-yellow-800' :
                    simulationResults.results['実質利回り（%）'] >= 3 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-normal mr-1">実質利回り</span>
                    <span className="font-semibold">{simulationResults.results['実質利回り（%）']?.toFixed(2) || '0.00'}%</span>
                    {simulationResults.results['実質利回り（%）'] >= 6 && <span className="ml-1">⭐</span>}
                    {simulationResults.results['実質利回り（%）'] < 3 && <span className="ml-1">⚠️</span>}
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
              {/* 2行目: 投資指標 */}
              <div className="flex flex-wrap gap-2 mt-3">
                {/* IRR */}
                <div className="group relative">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help ${
                    (simulationResults.results['IRR（%）'] ?? 0) >= 15 ? 'bg-green-100 text-green-800' :
                    (simulationResults.results['IRR（%）'] ?? 0) >= 10 ? 'bg-yellow-100 text-yellow-800' :
                    (simulationResults.results['IRR（%）'] ?? 0) >= 5 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-normal mr-1">IRR</span>
                    <span className="font-semibold">{simulationResults.results['IRR（%）']?.toFixed(2) || '0.00'}%</span>
                    {(simulationResults.results['IRR（%）'] ?? 0) >= 15 && <span className="ml-1">⭐</span>}
                    {(simulationResults.results['IRR（%）'] ?? 0) < 5 && <span className="ml-1">⚠️</span>}
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
                
                {/* CCR */}
                <div className="group relative">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help ${
                    simulationResults.results['CCR（%）'] >= 12 ? 'bg-green-100 text-green-800' :
                    simulationResults.results['CCR（%）'] >= 8 ? 'bg-yellow-100 text-yellow-800' :
                    simulationResults.results['CCR（%）'] >= 5 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-normal mr-1">CCR</span>
                    <span className="font-semibold">{simulationResults.results['CCR（%）']?.toFixed(2) || '0.00'}%</span>
                    {simulationResults.results['CCR（%）'] >= 12 && <span className="ml-1">⭐</span>}
                    {simulationResults.results['CCR（%）'] < 5 && <span className="ml-1">⚠️</span>}
                  </div>
                  <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-3 px-4 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64">
                    <div className="font-semibold mb-1">CCR（自己資金回収率）</div>
                    <div className="mb-2">投資した自己資金が年何％戻ってくるかを示します。</div>
                    <div className="text-gray-300 text-xs mb-1">計算式：年間手取り収入 ÷ 自己資金 × 100</div>
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
                
                {/* ROI */}
                <div className="group relative">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center cursor-help ${
                    (simulationResults.results['ROI（%）'] || 0) >= 15 ? 'bg-green-100 text-green-800' :
                    (simulationResults.results['ROI（%）'] || 0) >= 10 ? 'bg-yellow-100 text-yellow-800' :
                    (simulationResults.results['ROI（%）'] || 0) >= 5 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-normal mr-1">ROI</span>
                    <span className="font-semibold">
                      {(simulationResults.results['ROI（%）'] || 0).toFixed(2)}%
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">📋 年次キャッシュフロー詳細</h3>
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                    {simulationResults.cash_flow_table.length}年分のデータ
                  </span>
                </div>

                {/* キャッシュフローグラフ */}
                <div className="mb-6">
                  <CashFlowChart data={simulationResults.cash_flow_table} />
                </div>
                
                {/* 詳細キャッシュフロー分析 */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 詳細キャッシュフロー分析</h3>
                </div>
                
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto relative">
                    <table className="min-w-full bg-white">
                      <thead className="bg-blue-900">
                        <tr>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white border-b border-blue-900">年次</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          不動産<br/>収入
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none min-w-[200px]">
                            家賃収入の推移。<br/>前面面で家賃下落（上昇）を選択した場合は次第に変化していきます。<br/>また、各年度で売却した際の売却価格（キャピタルゲイン）に影響を与えます。
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          経費
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none">
                            ランニングコスト
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          減価<br/>償却
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none">
                            減価償却費
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          税金
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none">
                            支払利息
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          改装費<br/>修繕費
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none">
                            税引後利益
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          ローン<br/>返済
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none">
                            返済元金
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          元金<br/>返済
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none">
                            インカムゲイン単年
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          年間<br/>CF
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none">
                            インカムゲイン単年
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          累計<br/>CF
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none">
                            累計キャッシュフロー
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          借入<br/>残高
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none">
                            借入残高
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          自己資金<br/>回収率
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none">
                            残債利回り
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          売却<br/>金額
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none min-w-[200px]">
                            物件の売却価格。<br/>
                            市場価値や収益還元法により算出されます。
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white border-b border-blue-900 relative group cursor-help">
                          売却時<br/>手取り
                          <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-full mt-1 pointer-events-none">
                            売却時キャッシュフロー純額
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulationResults.cash_flow_table.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900 border-b text-center">{row['年次']}</td>
                          <td className={`px-4 py-3 text-sm border-b text-center ${(row['実効収入'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['実効収入'])}</td>
                          <td className={`px-4 py-3 text-sm border-b text-center ${(row['経費'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['経費'])}</td>
                          <td className={`px-4 py-3 text-sm border-b text-center ${(row['減価償却'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['減価償却'])}</td>
                          <td className={`px-4 py-3 text-sm border-b text-center ${(row['税金'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['税金'])}</td>
                          <td className={`px-4 py-3 text-sm border-b text-center ${((row['初期リフォーム'] || 0) + (row['大規模修繕'] || 0)) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol((row['初期リフォーム'] || 0) + (row['大規模修繕'] || 0))}</td>
                          <td className={`px-4 py-3 text-sm border-b text-center ${(row['ローン返済'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['ローン返済'])}</td>
                          <td className={`px-4 py-3 text-sm border-b text-center ${(row['元金返済'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['元金返済'] || 0)}</td>
                          <td className={`px-4 py-3 text-sm border-b text-center ${(row['営業CF'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['営業CF'] || 0)}</td>
                          <td className={`px-4 py-3 text-sm border-b text-center ${(row['累計CF'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['累計CF'])}</td>
                          <td className={`px-4 py-3 text-sm border-b text-center ${(row['借入残高'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['借入残高'] || 0)}</td>
                          <td className={`px-4 py-3 text-sm border-b text-center ${(row['自己資金回収率'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{((row['自己資金回収率'] || 0) * 100).toFixed(1)}%</td>
                          <td className={`px-4 py-3 text-sm border-b text-center ${(row['売却金額'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['売却金額'] || 0)}</td>
                          <td className={`px-4 py-3 text-sm border-b text-center ${(row['売却時手取り'] || row['売却益'] || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrencyNoSymbol(row['売却時手取り'] || row['売却益'] || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            )}

            
          </div>
        )}

        {/* 招待者からのコメント */}
        {simulationResults && (
          <div className="mt-6 bg-white rounded-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                招待者からのコメント
                {!currentShare && (
                  <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                    デモ
                  </span>
                )}
              </h3>
              <span className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                投資判断の参考にご活用ください
              </span>
            </div>
            {currentShare?.share_token ? (
              <ShareCommentDisplay
                shareToken={currentShare.share_token}
                title="招待者からのコメント"
                showInviteButton={true}
                onInviteClick={() => setShowInviteModal(true)}
              />
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-lg font-medium text-gray-700 mb-2">コメント機能を有効にする</p>
                <p className="text-sm text-gray-600 mb-4">このシミュレーション結果に対するコメントを受け取るには、まず共有を作成してください。</p>
                {user && (editingId || saveMessage?.includes('✅')) && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="mt-4 flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 mx-auto shadow-md"
                  >
                    <Users size={20} />
                    <span>メールで招待・共有</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 計算ロジック説明・注意事項 */}
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
                  <span className="font-medium">・想定実勢価格</span>：市場での想定取引価格
                </div>
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

        {/* チュートリアル */}
        <Tutorial 
          isOpen={showTutorial} 
          onClose={() => setShowTutorial(false)} 
        />
        
        {/* 招待モーダル */}
        {showInviteModal && simulationResults && (
          <InviteModal
            propertyId={editingId || currentShare?.property_id || 'temp-id'}
            propertyName={inputs.propertyName || '物件'}
            share={currentShare || undefined}
            onClose={() => setShowInviteModal(false)}
            onShareCreated={(share) => {
              setCurrentShare(share);
              setShowInviteModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Simulator;