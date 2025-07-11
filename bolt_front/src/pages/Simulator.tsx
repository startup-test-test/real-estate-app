import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap,
  CheckCircle,
  AlertCircle,
  Download,
  Share2,
  Users,
  MessageCircle
} from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useAuthContext } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';
import CashFlowChart from '../components/CashFlowChart';
import Tooltip from '../components/Tooltip';
import MetricCard from '../components/MetricCard';
import Tutorial from '../components/Tutorial';
import BackButton from '../components/BackButton';
import Breadcrumb from '../components/Breadcrumb';
import ImageUpload from '../components/ImageUpload';
import { ShareButton } from '../components/ShareButton';
import InviteModal from '../components/InviteModal';
import ShareCommentDisplay from '../components/ShareCommentDisplay';
// import { LegalDisclaimer } from '../components';
import { SimulationResultData, CashFlowData, SimulationInputData, PropertyShare } from '../types';
import { usePropertyShare } from '../hooks/usePropertyShare';
import { validatePropertyUrl } from '../utils/validation';
import { transformFormDataToApiData, transformApiResponseToSupabaseData, transformSupabaseDataToFormData, transformSupabaseResultsToDisplayData } from '../utils/dataTransform';
import { generateSimulationPDF } from '../utils/pdfGenerator';
import { emptyPropertyData } from '../constants/sampleData';
import { tooltips } from '../constants/tooltips';
import { propertyStatusOptions, loanTypeOptions, ownershipTypeOptions, buildingStructureOptions } from '../constants/masterData';

// FAST API のベースURL
// const API_BASE_URL = 'https://real-estate-app-1-iii4.onrender.com';

interface SimulationResult {
  results: SimulationResultData;
  cash_flow_table?: CashFlowData[];
}




const Simulator: React.FC = () => {
  const { user } = useAuthContext();
  const { saveSimulation, getSimulations, loading: dbLoading } = useSupabaseData();
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
  
  const { createShare, fetchOrCreateShareByPropertyId, fetchShareTokenFromSimulation, fetchShare } = usePropertyShare();
  const resultsRef = useRef<HTMLDivElement>(null);

  const [inputs, setInputs] = useState<any>(emptyPropertyData);




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
            console.log('❌ 共有情報の取得/作成に失敗');
          }
        } catch (error) {
          console.error('❌ 共有情報取得エラー:', error);
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
      
      const simulation = data?.find(sim => sim.id === simulationId);
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
          buildingPriceForDepreciation: simData.buildingPriceForDepreciation || 3000,
          depreciationYears: simData.depreciationYears || 27,
          propertyUrl: simData.propertyUrl || '',
          propertyMemo: simData.propertyMemo || '',
          propertyImageUrl: simData.propertyImageUrl || ''
        });
        
        // 既存の結果も表示
        if (simulation.results) {
          setSimulationResults({
            results: {
              '表面利回り（%）': simulation.results.surfaceYield,
              'IRR（%）': simulation.results.irr,
              'CCR（%）': simulation.results.ccr,
              'DSCR（返済余裕率）': simulation.results.dscr,
              '月間キャッシュフロー（円）': simulation.results.monthlyCashFlow,
              '年間キャッシュフロー（円）': simulation.results.annualCashFlow
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
            console.error('❌ 既存共有情報の取得エラー:', shareError);
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
            console.error('❌ 共有情報の処理中にエラー:', shareError);
          }
        } else if (!user?.id) {
          console.log('⚠️ ユーザー未認証のため共有情報の取得をスキップ');
        }
      }
    } catch (err: any) {
      setSaveError(`データ読み込みエラー: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setInputs(prev => {
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

      return newInputs;
    });
  };

  const urlError = inputs.propertyUrl ? validatePropertyUrl(inputs.propertyUrl) : null;

  const handleSimulation = async () => {
    setIsSimulating(true);
    setSaveError(null);
    
    try {
      // FAST API への送信データを構築
      const apiData = transformFormDataToApiData(inputs);
      
      console.log('FAST API送信データ:', apiData);
      console.log('ローン期間:', apiData.loan_years, '年');
      console.log('保有年数:', apiData.holding_years, '年');
      console.log('新機能フィールド確認:', {
        ownership_type: apiData.ownership_type,
        effective_tax_rate: apiData.effective_tax_rate,
        major_repair_cycle: apiData.major_repair_cycle,
        major_repair_cost: apiData.major_repair_cost,
        building_price: apiData.building_price,
        depreciation_years: apiData.depreciation_years
      });
      
      // テスト: 最大期間でのリクエスト
      if (apiData.holding_years > 10) {
        console.log('⚠️ 35年のキャッシュフローを要求中...');
      }
      
      // FAST API呼び出し（タイムアウト対応）
      const API_BASE_URL = 'https://real-estate-app-1-iii4.onrender.com';
      
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
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('FAST APIレスポンス:', result);
      console.log('キャッシュフローテーブルの詳細:', result.cash_flow_table);
      console.log('キャッシュフローテーブルの件数:', result.cash_flow_table?.length);
      
      if (result.results) {
        console.log('受信したキャッシュフローテーブル長:', result.cash_flow_table?.length);
        console.log('最初の5行:', result.cash_flow_table?.slice(0, 5));
        console.log('最後の5行:', result.cash_flow_table?.slice(-5));
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
                propertyName: apiData.property_name || '無題の物件',
                location: apiData.location,
                propertyType: apiData.property_type,
                purchasePrice: apiData.purchase_price,
                monthlyRent: apiData.monthly_rent,
                managementFee: apiData.management_fee || 0,
                loanTerm: apiData.loan_years,
                interestRate: apiData.interest_rate,
                loanAmount: apiData.loan_amount,
                holdingYears: apiData.holding_years,
                vacancyRate: apiData.vacancy_rate,
                propertyTax: apiData.property_tax,
                ownershipType: apiData.ownership_type,
                effectiveTaxRate: apiData.effective_tax_rate,
                majorRepairCycle: apiData.major_repair_cycle,
                majorRepairCost: apiData.major_repair_cost,
                buildingPriceForDepreciation: apiData.building_price,
                depreciationYears: apiData.depreciation_years,
                propertyUrl: apiData.property_url,
                propertyMemo: apiData.property_memo,
                propertyImageUrl: apiData.property_image_url,
                propertyStatus: apiData.property_status
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
                  const existingShareToken = await fetchShareTokenFromSimulation(editingId);
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
      console.error('シミュレーションエラー:', error);
      console.error('エラースタック:', error instanceof Error ? error.stack : 'スタックなし');
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
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb />
        
        {/* Header */}
        <div className="mb-6">
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
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-blue-800">{saveMessage}</span>
            </div>
          </div>
        )}

        {saveError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-800">{saveError}</span>
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
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
                  <Tooltip content={tooltips.buildingPriceForDepreciation} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="100"
                    value={inputs.buildingPriceForDepreciation || 0}
                    onChange={(e) => handleInputChange('buildingPriceForDepreciation', Number(e.target.value))}
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
                  <input
                    type="text"
                    value={inputs.propertyMemo || ''}
                    onChange={(e) => handleInputChange('propertyMemo', e.target.value)}
                    placeholder="物件の特徴、気になるポイント、検討事項など..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            <div className="flex justify-center">
              <button 
                onClick={handleSimulation}
                disabled={isSimulating || !isFormValid}
                className={`flex items-center justify-center px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 min-h-[56px] touch-manipulation ${
                  isSimulating || !isFormValid
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:from-purple-800 active:to-indigo-800 active:scale-[0.98] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
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
                
                {/* 共有・招待ボタン */}
                {user && (editingId || saveMessage?.includes('✅')) && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 print:hidden shadow-md"
                    title="家族や専門家を招待してコメントで相談"
                  >
                    <Users size={18} />
                    <span>共有・招待</span>
                  </button>
                )}
                
                {/* 既存の共有ボタン */}
                {user && (editingId || saveMessage?.includes('✅')) && (
                  <ShareButton
                    propertyId={editingId || currentShare?.property_id || 'temp-id'}
                    simulationData={simulationResults.results}
                    propertyData={inputs}
                    size="large"
                    className="print:hidden"
                  />
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
            
            {/* 重要投資指標 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 重要投資指標</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* IRR */}
                <MetricCard
                  title="IRR"
                  subtitle="内部収益率"
                  value={simulationResults.results['IRR（%）']}
                  unit="%"
                  format="percentage"
                  size="large"
                  thresholds={{
                    excellent: 15,
                    good: 10,
                    warning: 5
                  }}
                  description="投資全体の年間収益率を示す参考指標です。"
                />
                
                {/* CCR */}
                <MetricCard
                  title="CCR"
                  subtitle="自己資金回収率"
                  value={simulationResults.results['CCR（%）']}
                  unit="%"
                  format="percentage"
                  size="large"
                  thresholds={{
                    excellent: 12,
                    good: 8,
                    warning: 5
                  }}
                  description="自己資金に対する年間収益率を示す参考指標です。"
                />
                
                {/* DSCR */}
                <MetricCard
                  title="DSCR"
                  subtitle="返済余裕率"
                  value={simulationResults.results['DSCR（返済余裕率）']}
                  format="number"
                  size="large"
                  thresholds={{
                    excellent: 1.5,
                    good: 1.3,
                    warning: 1.1
                  }}
                  description="債務返済能力を示す参考指標です。"
                />
                
                {/* 表面利回り */}
                <MetricCard
                  title="表面利回り"
                  subtitle="粗利回り"
                  value={simulationResults.results['表面利回り（%）']}
                  unit="%"
                  format="percentage"
                  size="large"
                  thresholds={{
                    excellent: 8,
                    good: 6,
                    warning: 4
                  }}
                  description="年間賃料収入÷物件価格。8%以上で優秀、6%以上で良好。"
                />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 キャッシュフロー</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 月間キャッシュフロー */}
                <MetricCard
                  title="月間キャッシュフロー"
                  value={simulationResults.results['月間キャッシュフロー（円）']}
                  unit="円"
                  format="currency"
                  size="large"
                  thresholds={{
                    excellent: 50000,
                    good: 20000,
                    warning: 0
                  }}
                  description="毎月の手取り収入。プラスであれば収益物件として機能。"
                />
                
                {/* 年間キャッシュフロー */}
                <MetricCard
                  title="年間キャッシュフロー"
                  value={simulationResults.results['年間キャッシュフロー（円）']}
                  unit="円"
                  format="currency"
                  size="large"
                  thresholds={{
                    excellent: 600000,
                    good: 240000,
                    warning: 0
                  }}
                  description="年間の手取り収入。投資収益の実額。"
                />
              </div>
              
              {/* 共有セクション - ミニマムリリースでは非表示 */}
              {/* {user && (editingId || saveMessage?.includes('✅')) && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Share2 className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          シミュレーション結果を共有
                        </span>
                      </div>
                    </div>
                    <ShareButton
                      propertyId={editingId || currentShare?.property_id || 'temp-id'}
                      simulationData={simulationResults.results}
                      propertyData={inputs}
                      size="large"
                      className="bg-blue-600 hover:bg-blue-700"
                      onShareCreated={(share) => {
                        console.log('Share created from ShareButton:', share);
                        setCurrentShare(share);
                      }}
                    />
                  </div>
                </div>
              )} */}
            </div>
            
            {/* 追加投資指標 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 詳細投資指標</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* NOI */}
                <MetricCard
                  title="NOI"
                  subtitle="純営業収益"
                  value={simulationResults.results['NOI（円）'] || 0}
                  unit="円"
                  format="currency"
                  size="large"
                  thresholds={{
                    excellent: 1000000,
                    good: 500000,
                    warning: 100000
                  }}
                  description="年間賃料収入から運営費を差し引いた純収益。物件の収益力を示す。"
                />
                
                {/* ROI */}
                <MetricCard
                  title="ROI"
                  subtitle="投資収益率"
                  value={simulationResults.results['ROI（%）'] || 0}
                  unit="%"
                  format="percentage"
                  size="large"
                  thresholds={{
                    excellent: 15,
                    good: 10,
                    warning: 5
                  }}
                  description="投資額に対する税引後キャッシュフローの割合。ROI=年間CF÷自己資金。"
                />
                
                {/* LTV */}
                <MetricCard
                  title="LTV"
                  subtitle="融資比率"
                  value={simulationResults.results['LTV（%）'] || 0}
                  unit="%"
                  format="percentage"
                  size="large"
                  thresholds={{
                    excellent: 70,
                    good: 80,
                    warning: 90
                  }}
                  description="物件価格に対する融資額の割合。低いほど安全性が高い。"
                />
              </div>
            </div>
            
            {/* 売却分析 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 売却分析</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 想定売却価格 */}
                <MetricCard
                  title="想定売却価格"
                  value={simulationResults.results['想定売却価格（万円）'] || 0}
                  unit="万円"
                  format="number"
                  size="large"
                  description="保有期間終了時の想定売却価格。"
                />
                
                {/* 残債 */}
                <MetricCard
                  title="残債"
                  value={simulationResults.results['残債（万円）'] || 0}
                  unit="万円"
                  format="number"
                  size="large"
                  description="売却時のローン残高。"
                />
                
                {/* 売却コスト */}
                <MetricCard
                  title="売却コスト"
                  value={simulationResults.results['売却コスト（万円）'] || 0}
                  unit="万円"
                  format="number"
                  size="large"
                  description="売却時にかかる諸費用（仲介手数料等）。"
                />
                
                {/* 売却益 */}
                <MetricCard
                  title="売却益"
                  value={simulationResults.results['売却益（万円）'] || 0}
                  unit="万円"
                  format="number"
                  size="large"
                  thresholds={{
                    excellent: 500,
                    good: 100,
                    warning: 0
                  }}
                  description="売却価格から残債と売却コストを引いた手取り額。"
                />
              </div>
            </div>
            
            {/* キャッシュフロー表 */}
            {simulationResults.cash_flow_table && simulationResults.cash_flow_table.length > 0 && (
              <div>
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
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="overflow-auto" style={{ maxHeight: '600px' }}>
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">年次</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">満室想定収入</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">空室率</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">実効収入</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">経費</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">減価償却</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">税金</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">大規模修繕</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">初期リフォーム</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">ローン返済</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">営業CF</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">累計CF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulationResults.cash_flow_table.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{row['年次']}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{row['満室想定収入'].toLocaleString()}円</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{row['空室率（%）']}%</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{row['実効収入'].toLocaleString()}円</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{row['経費'].toLocaleString()}円</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{(row['減価償却'] || 0).toLocaleString()}円</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{(row['税金'] || 0).toLocaleString()}円</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{row['大規模修繕'].toLocaleString()}円</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{(row['初期リフォーム'] || 0).toLocaleString()}円</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{row['ローン返済'].toLocaleString()}円</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{row['営業CF'].toLocaleString()}円</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{row['累計CF'].toLocaleString()}円</td>
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
              />
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-lg font-medium text-gray-700 mb-2">コメント機能を有効にする</p>
                <p className="text-sm text-gray-600 mb-4">このシミュレーション結果に対するコメントを受け取るには、まず共有を作成してください。</p>
                <p className="text-xs text-blue-600">
                  💡 上の「共有・招待」ボタンをクリックして共有URLを生成すると、そのURLからコメントを受け取れます
                </p>
              </div>
            )}
            {!currentShare && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  💡 実際に専門家を招待するには上の「共有・招待」ボタンをクリックしてください
                </p>
              </div>
            )}
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