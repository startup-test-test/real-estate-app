// AI機能用カスタムフック

import { useState } from 'react';

// モック用の型定義
export interface PropertyAnalysisRequest {
  propertyType: string;
  area: number;
  price: number;
  location: string;
  yearBuilt?: number;
  features?: string[];
}

export interface AIAnalysisResult {
  score: number;
  recommendation: string;
  marketTrends: {
    priceGrowth: number;
    demandLevel: string;
    futureOutlook: string;
  };
  riskAssessment: {
    level: string;
    factors: string[];
  };
  investmentAdvice: string;
}

export const usePropertyAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeProperty = async (propertyData: PropertyAnalysisRequest) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // モックデータを返す
      await new Promise(resolve => setTimeout(resolve, 1500)); // API呼び出しをシミュレート
      
      // propertyDataを参照してモックデータを生成
      const score = propertyData.price ? Math.min(100, Math.floor((propertyData.area / propertyData.price) * 10000) + 70) : 85;
      
      const analysisResult: AIAnalysisResult = {
        score: score,
        recommendation: '投資価値が高い物件です。立地条件と将来性を考慮すると、長期的な資産価値の向上が期待できます。',
        marketTrends: {
          priceGrowth: Math.floor(Math.random() * 10) + 5, // 5-15%
          demandLevel: '高',
          futureOutlook: '好調'
        },
        riskAssessment: {
          level: '低',
          factors: ['災害リスクが低い', '需要安定エリア', '開発計画あり']
        },
        investmentAdvice: '現在の市場環境では積極的な投資を推奨します。特に長期保有による賃料収入と資産価値の向上が期待できます。'
      };
      setResult(analysisResult);
      return analysisResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI分析に失敗しました';
      setError(errorMessage);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
  };

  return {
    analyzeProperty,
    isAnalyzing,
    result,
    error,
    reset
  };
};

export const useMarketAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeMarket = async (location: string) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // モックデータを返す
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const analysisResult = {
        location,
        marketOverview: {
          averagePrice: Math.floor(Math.random() * 5000) + 3000, // 3000-8000万円
          priceChange: Math.floor(Math.random() * 20) - 5, // -5% to +15%
          inventory: Math.floor(Math.random() * 100) + 50,
          daysOnMarket: Math.floor(Math.random() * 60) + 30
        },
        demographics: {
          population: Math.floor(Math.random() * 50000) + 10000,
          averageIncome: Math.floor(Math.random() * 300) + 400, // 400-700万円
          growthRate: Math.floor(Math.random() * 5) + 1 // 1-6%
        },
        forecast: {
          sixMonths: '安定',
          oneYear: '上昇傾向',
          threeYears: '好調'
        },
        recommendations: [
          '新築マンションの需要が高まっています',
          '駅近物件の価値が上昇中',
          '投資用物件の利回りが改善傾向'
        ]
      };
      setResult(analysisResult);
      return analysisResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '市場分析に失敗しました';
      setError(errorMessage);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeMarket,
    isAnalyzing,
    result,
    error
  };
};

export const useTransactionAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeTransactions = async (transactions: any[]) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // モックデータを返す
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const analysisResult = {
        summary: {
          totalTransactions: transactions.length,
          averagePrice: transactions.reduce((sum: number, t: any) => sum + (t.price || 0), 0) / transactions.length,
          priceRange: {
            min: Math.min(...transactions.map((t: any) => t.price || 0)),
            max: Math.max(...transactions.map((t: any) => t.price || 0))
          }
        },
        patterns: [
          '価格は安定的に推移しています',
          '駅近物件の取引が活発です',
          '築浅物件の需要が高まっています'
        ],
        insights: [
          '過去3ヶ月で取引量が20%増加',
          '平均成約期間が短縮傾向',
          '投資目的の購入が増加中'
        ],
        predictions: {
          nextQuarter: '現在のトレンドが継続する見込み',
          marketDirection: '上昇',
          confidence: 85
        }
      };
      setResult(analysisResult);
      return analysisResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '取引分析に失敗しました';
      setError(errorMessage);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeTransactions,
    isAnalyzing,
    result,
    error
  };
};

export const useAIReport = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async (analysisData: any) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // モックレポートを生成
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // analysisDataを参照してタイトルを生成
      const dataType = analysisData?.type || 'AI不動産分析';
      
      const reportResult = {
        id: `report-${Date.now()}`,
        title: `${dataType}レポート`,
        generatedAt: new Date().toISOString(),
        sections: [
          {
            title: '概要',
            content: '本レポートは、AIによる不動産市場分析の結果をまとめたものです。'
          },
          {
            title: '市場動向',
            content: '現在の市場は安定的に推移しており、特に都市部での需要が堅調です。'
          },
          {
            title: '投資推奨',
            content: '中長期的な視点での投資を推奨します。特に交通利便性の高いエリアに注目してください。'
          },
          {
            title: 'リスク分析',
            content: '主なリスク要因として、金利上昇と人口動態の変化が挙げられます。'
          }
        ],
        charts: [
          { type: 'line', title: '価格推移', data: [] },
          { type: 'bar', title: '取引量', data: [] }
        ],
        downloadUrl: '#'
      };
      setReport(reportResult);
      return reportResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'レポート生成に失敗しました';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateReport,
    isGenerating,
    report,
    error
  };
};

export const useAIUsage = () => {
  const [usage, setUsage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsage = async () => {
    setIsLoading(true);
    try {
      // モック使用量データを返す
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const usageData = {
        tier: 'スタンダード',
        usage: {
          current: Math.floor(Math.random() * 50) + 10,
          limit: 100,
          resetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        features: {
          propertyAnalysis: true,
          marketAnalysis: true,
          transactionAnalysis: true,
          reportGeneration: true
        },
        history: [
          { date: new Date().toISOString(), action: '物件分析', count: 1 },
          { date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), action: '市場分析', count: 2 }
        ]
      };
      setUsage(usageData);
      return usageData;
    } catch (error) {
      console.error('Usage fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    usage,
    isLoading,
    fetchUsage
  };
};