/**
 * データ変換関連のユーティリティ関数
 */

/**
 * フォーム入力データをAPI送信用データに変換
 */
export const transformFormDataToApiData = (inputs: any) => {
  return {
    property_name: inputs.propertyName || '不動産投資シミュレーション',
    location: inputs.location || '住所未設定',
    year_built: 2010, // デフォルト値
    property_type: '一棟アパート/マンション', // デフォルト値
    land_area: inputs.landArea || 0,
    building_area: inputs.buildingArea || 0,
    road_price: inputs.roadPrice || 0,
    market_value: inputs.marketValue || 0,
    purchase_price: inputs.purchasePrice || 0,
    other_costs: inputs.otherCosts || 0,
    renovation_cost: inputs.renovationCost || 0,
    monthly_rent: inputs.monthlyRent || 0,
    management_fee: inputs.managementFee || 0,
    fixed_cost: inputs.fixedCost || 0,
    property_tax: inputs.propertyTax || 0,
    vacancy_rate: inputs.vacancyRate || 0,
    rent_decline: inputs.rentDecline || 0,
    loan_amount: inputs.loanAmount || 0,
    interest_rate: inputs.interestRate || 0,
    loan_years: inputs.loanYears || 35,
    loan_type: inputs.loanType || '元利均等',
    holding_years: inputs.holdingYears || 10,
    exit_cap_rate: inputs.exitCapRate || 0,
    expected_sale_price: inputs.marketValue || 0,
    ownership_type: inputs.ownershipType || '個人',
    effective_tax_rate: inputs.effectiveTaxRate || 20,
    major_repair_cycle: inputs.majorRepairCycle || 10,
    major_repair_cost: inputs.majorRepairCost || 200,
    building_price: inputs.buildingPriceForDepreciation || (inputs.purchasePrice || 0) * 0.7,
    depreciation_years: inputs.depreciationYears || 27,
    property_url: inputs.propertyUrl || '',
    property_memo: inputs.propertyMemo || '',
    property_image_url: inputs.propertyImageUrl || '',
    property_status: inputs.propertyStatus || '検討中'
  };
};

/**
 * API応答データをSupabase保存用データに変換
 */
export const transformApiResponseToSupabaseData = (inputs: any, result: any, shareToken?: string) => {
  const simulationData = {
    propertyName: inputs.propertyName || '',
    location: inputs.location || '',
    landArea: inputs.landArea || 0,
    buildingArea: inputs.buildingArea || 0,
    roadPrice: inputs.roadPrice || 0,
    marketValue: inputs.marketValue || 0,
    purchasePrice: inputs.purchasePrice || 0,
    otherCosts: inputs.otherCosts || 0,
    renovationCost: inputs.renovationCost || 0,
    monthlyRent: inputs.monthlyRent || 0,
    managementFee: inputs.managementFee || 0,
    fixedCost: inputs.fixedCost || 0,
    propertyTax: inputs.propertyTax || 0,
    vacancyRate: inputs.vacancyRate || 0,
    rentDecline: inputs.rentDecline || 0,
    loanAmount: inputs.loanAmount || 0,
    interestRate: inputs.interestRate || 0,
    loanYears: inputs.loanYears || 35,
    loanType: inputs.loanType || '元利均等',
    holdingYears: inputs.holdingYears || 10,
    exitCapRate: inputs.exitCapRate || 0,
    ownershipType: inputs.ownershipType || '個人',
    effectiveTaxRate: inputs.effectiveTaxRate || 20,
    majorRepairCycle: inputs.majorRepairCycle || 15,
    majorRepairCost: inputs.majorRepairCost || 0,
    buildingPriceForDepreciation: inputs.buildingPriceForDepreciation || 0,
    depreciationYears: inputs.depreciationYears || 27,
    propertyUrl: inputs.propertyUrl || '',
    propertyMemo: inputs.propertyMemo || '',
    propertyImageUrl: inputs.propertyImageUrl || '',
    propertyStatus: inputs.propertyStatus || '検討中'
  };

  const resultData = {
    '総収益': result['総収益'] || 0,
    '総費用': result['総費用'] || 0,
    '純利益': result['純利益'] || 0,
    'ROI': result['ROI'] || 0,
    'IRR': result['IRR'] || 0,
    'NPV': result['NPV'] || 0,
    '投資効率': result['投資効率'] || 0,
    'DSCR': result['DSCR'] || 0,
    'LTV': result['LTV'] || 0,
    '実質利回り': result['実質利回り'] || 0,
    'CF累計': result['CF累計'] || 0,
    '売却時想定価格': result['売却時想定価格'] || 0,
    'その他費用合計': result['その他費用合計'] || 0,
    '減価償却累計': result['減価償却累計'] || 0,
    '所得税住民税累計': result['所得税住民税累計'] || 0
  };

  return {
    simulation_data: simulationData,
    results: resultData,
    property_id: inputs.propertyId || null,
    share_token: shareToken || null
  };
};

/**
 * Supabaseデータをフォーム入力用データに変換
 */
export const transformSupabaseDataToFormData = (simulationData: any) => {
  return {
    propertyName: simulationData.propertyName || '物件名を入力してください',
    location: simulationData.location || '',
    landArea: simulationData.landArea ?? 100.00,
    buildingArea: simulationData.buildingArea ?? 120.00,
    roadPrice: simulationData.roadPrice ?? 200000,
    marketValue: simulationData.marketValue ?? 6000,
    purchasePrice: simulationData.purchasePrice ?? 5000,
    otherCosts: simulationData.otherCosts ?? 250,
    renovationCost: simulationData.renovationCost ?? 0,
    monthlyRent: simulationData.monthlyRent ?? 200000,
    managementFee: simulationData.managementFee ?? 10000,
    fixedCost: simulationData.fixedCost ?? 5000,
    propertyTax: simulationData.propertyTax ?? 100000,
    vacancyRate: simulationData.vacancyRate ?? 5.00,
    rentDecline: simulationData.rentDecline ?? 1.00,
    loanAmount: simulationData.loanAmount ?? 4000,
    interestRate: simulationData.interestRate ?? 1.50,
    loanYears: simulationData.loanTerm || simulationData.loanYears || 35,
    loanType: simulationData.loanType || '元利均等',
    holdingYears: simulationData.holdingYears ?? 10,
    exitCapRate: simulationData.exitCapRate ?? 5.0,
    ownershipType: simulationData.ownershipType || '個人',
    effectiveTaxRate: simulationData.effectiveTaxRate ?? 20,
    majorRepairCycle: simulationData.majorRepairCycle ?? 15,
    majorRepairCost: simulationData.majorRepairCost ?? 200,
    buildingPriceForDepreciation: simulationData.buildingPriceForDepreciation ?? 3000,
    depreciationYears: simulationData.depreciationYears ?? 27,
    propertyUrl: simulationData.propertyUrl || '',
    propertyMemo: simulationData.propertyMemo || '',
    propertyImageUrl: simulationData.propertyImageUrl || '',
    propertyStatus: simulationData.propertyStatus || '検討中',
    propertyId: simulationData.propertyId || null
  };
};

/**
 * Supabase結果データを表示用データに変換
 */
export const transformSupabaseResultsToDisplayData = (results: any) => {
  return {
    '総収益': results['総収益'] || 0,
    '総費用': results['総費用'] || 0,
    '純利益': results['純利益'] || 0,
    'ROI': results['ROI'] || 0,
    'IRR': results['IRR'] || 0,
    'NPV': results['NPV'] || 0,
    '投資効率': results['投資効率'] || 0,
    'DSCR': results['DSCR'] || 0,
    'LTV': results['LTV'] || 0,
    '実質利回り': results['実質利回り'] || 0,
    'CF累計': results['CF累計'] || 0,
    '売却時想定価格': results['売却時想定価格'] || 0,
    'その他費用合計': results['その他費用合計'] || 0,
    '減価償却累計': results['減価償却累計'] || 0,
    '所得税住民税累計': results['所得税住民税累計'] || 0
  };
};