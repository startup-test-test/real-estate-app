'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/client";
import { useSimulations, SimulationSummary } from "@/hooks/useSimulations";
import { sanitizeUrl, sanitizeImageUrl } from "@/lib/utils/securityUtils";
import { logError } from "@/lib/utils/errorHandler";
import {
  Calculator,
  Building,
  Plus,
  Edit,
  Trash2,
  Copy,
  Loader,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import UsageStatusBar from "@/components/simulator/UsageStatusBar";
import UpgradeModal from "@/components/simulator/UpgradeModal";
// import MaintenanceNotice from "@/components/shared/MaintenanceNotice";
// TODO: 認証移行後に有効化
// import { useUsageStatus } from "@/hooks/useUsageStatus";
import {
  sampleProperty,
  hasTutorialBeenCompleted
} from "@/data/sampleProperty";
// react-joyride React 19対応まで無効化
// import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Step = any;  // react-joyride無効化中の仮の型定義

const MyPage: React.FC = () => {
  const router = useRouter();
  // Neon Auth
  const auth = useAuth();
  const user = auth.user;
  const isAuthenticated = !!user;
  const authLoading = auth.isLoading;

  // シミュレーション保存フック
  const { getSimulations, deleteSimulation, duplicateSimulation, loading: simLoading } = useSimulations();

  const refetchUsage = () => {};
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);

  // チュートリアル用のステート
  const [runTutorial, setRunTutorial] = React.useState(false);
  const [pauseTutorial, setPauseTutorial] = React.useState(false);  // チュートリアル一時停止用

  // アップグレードモーダル開閉ハンドラー（チュートリアル一時停止対応）
  // 現在無料会員のみのため、アップグレード機能は無効化
  const handleUpgradeClick = () => {
    // モーダルを開かない（無効化）
    console.log('アップグレード機能は現在提供していません');
  };

  const handleUpgradeClose = () => {
    setShowUpgradeModal(false);
    if (pauseTutorial) {
      setPauseTutorial(false);  // チュートリアル再開
    }
  };

  // サンプル物件があるかどうかを動的に判定してステップを生成
  const tutorialSteps = React.useMemo<Step[]>(() => {
    const steps: Step[] = [];

    // SSRチェック
    if (typeof window === 'undefined') {
      return steps;
    }

    // デバイス判定（768px未満をモバイルとする）
    const isMobile = window.innerWidth < 768;

    // サンプル物件カードが存在する場合
    const hasSampleCard = document.querySelector('.sample-property-card');

    // 「次へ」ボタンクリック時の処理
    const handleNextClick = () => {
      // サンプル物件のIDでシミュレーション結果ページに遷移
      // チュートリアルフラグは残したまま遷移（Simulatorページでチュートリアル継続）
      const url = `/mypage/revenue-simulator?view=sample-property-001`;
      router.push(url);
      // チュートリアルは終了しない（Simulatorページに引き継ぐ）
    };

    // 「スキップ」ボタンクリック時の処理
    const handleSkipClick = () => {
      setRunTutorial(false);
      sessionStorage.removeItem('tutorial_in_progress');
      if (user) {
        localStorage.setItem(`tutorial_completed_${user.id}`, 'true');
      }
    };

    if (hasSampleCard) {
      steps.push({
        target: '.sample-property-card',
        content: (
          <div className="py-2">
            <div className="text-sm text-gray-500 mb-2">ステップ 1/7</div>
            <h3 className="font-bold text-lg mb-1 text-gray-800">🎯 サンプル物件で体験</h3>
            <p className="text-gray-700 mb-3">下の「シミュレーション結果を見る」ボタンをクリック！</p>

            {/* ボタンエリア */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={handleSkipClick}
                className="text-gray-600 text-sm hover:underline transition-colors"
              >
                スキップ
              </button>
              <button
                onClick={handleNextClick}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                次へ
              </button>
            </div>
          </div>
        ),
        disableBeacon: true,  // ビーコンを非表示
        placement: isMobile ? 'top' : 'bottom',  // SP版は上、PC版は下
        spotlightClicks: true,  // スポットライトされた要素をクリック可能にする
        disableScrolling: false,
        styles: {
          options: {
            primaryColor: '#3B82F6',
            zIndex: 10000,
            arrowColor: '#FFFBEB',  // 矢印の色
          },
          tooltip: {
            padding: '15px 20px',
            border: '2px solid #000000',  // 黒色の外枠
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          tooltipContent: {
            textAlign: 'left',
          }
        }
      });
    }

    return steps;
  }, [runTutorial, user, router]);

  useEffect(() => {
    document.title = '収益シミュレーション | 大家DX';
  }, []);

  // 決済成功処理
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      // 成功メッセージを表示（後で実装可能）
      console.log('決済が成功しました！');
      // 使用状況を更新
      if (refetchUsage) {
        refetchUsage();
      }
      // URLパラメータをクリーンアップ
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else if (paymentStatus === 'cancelled') {
      console.log('決済がキャンセルされました');
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // 認証状態をログに記録（開発環境のみ）
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("MyPage認証状態:", {
        user: user ? { id: user.id, email: user.email } : null,
        isAuthenticated,
        authLoading,
      });
    }
  }, [user, isAuthenticated, authLoading]);


  // Supabase state management
  const [simulations, setSimulations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState("newest");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isInitialLoad, setIsInitialLoad] = React.useState(true); // 初回読み込みフラグ

  // キャッシュキーの生成（ユーザーごとに異なるキャッシュ）
  const getCacheKey = () => `simulations_cache_${user?.id || "anonymous"}`;
  const getCacheTimestampKey = () =>
    `simulations_cache_timestamp_${user?.id || "anonymous"}`;

  // キャッシュからデータを読み込む
  const loadFromCache = () => {
    try {
      const cacheKey = getCacheKey();
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(getCacheTimestampKey());

      if (cachedData && cacheTimestamp) {
        const data = JSON.parse(cachedData);
        const timestamp = new Date(cacheTimestamp);
        const now = new Date();
        const hoursSinceCache =
          (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

        // キャッシュが24時間以内なら有効とする
        if (hoursSinceCache < 24) {
          console.log("キャッシュからデータを読み込みました");
          return data;
        }
      }
    } catch (error) {
      logError("キャッシュ読み込み", error);
    }
    return null;
  };

  // キャッシュにデータを保存
  const saveToCache = (data: any[]) => {
    try {
      const cacheKey = getCacheKey();
      const timestampKey = getCacheTimestampKey();
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(timestampKey, new Date().toISOString());
    } catch (error) {
      logError("キャッシュ保存", error);
    }
  };

  // データ読み込み関数
  const loadSimulations = async (forceRefresh = false) => {
    if (!user) {
      console.log("loadSimulations: ユーザーが登録されていません");
      return;
    }

    // 初回読み込み時はキャッシュをチェック
    if (isInitialLoad && !forceRefresh) {
      const cachedData = loadFromCache();
      if (cachedData) {
        setSimulations(cachedData);
        setLoading(false);
        setIsInitialLoad(false);

        // キャッシュ読み込み後、1秒後に最新データを取得（バックグラウンド）
        if (!(window as any).mypageDataRefreshed) {
          (window as any).mypageDataRefreshed = true;
          setTimeout(() => {
            console.log("キャッシュ読み込み後、最新データを取得します");
            loadSimulations(true);
            setTimeout(() => {
              (window as any).mypageDataRefreshed = false;
            }, 5000);
          }, 1000);
        }
        return;
      }
    }

    console.log(
      "loadSimulations: Neon APIからデータ読み込み開始, ユーザー:",
      user.id,
    );

    try {
      // バックグラウンド更新（forceRefresh）ではローディングを表示しない
      if (!forceRefresh) {
        setLoading(true);
      }

      setError(null);
      // 新しいAPI: 直接配列を返す
      const data = await getSimulations();
      console.log("Neon APIから取得したデータ件数:", data?.length || 0);
      setSimulations(data || []);
      saveToCache(data || []);
    } catch (err: any) {
      console.error("データ読み込みエラー:", err);
      setError(err.message);
      setSimulations([]);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const refetch = () => {
    loadSimulations(true); // 強制リフレッシュ
  };

  const handleDelete = async (id: string, _propertyName?: string) => {
    // フロントエンド固定のサンプル物件のみ削除不可
    if (id === 'sample-property-001') {
      alert("このサンプル物件は削除できません。\n\nフロントエンド固定のサンプル物件は体験用のため、削除することはできません。");
      return;
    }

    try {
      setLoading(true);
      // 新しいAPI: booleanを返す
      const success = await deleteSimulation(id);
      if (!success) {
        setError("削除に失敗しました");
        alert("削除に失敗しました");
      } else {
        // 削除成功後、データを再読み込み（強制リフレッシュ）
        loadSimulations(true);
        // 成功フィードバック
        const toast = document.createElement("div");
        toast.className =
          "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50";
        toast.textContent = "物件データを削除しました";
        document.body.appendChild(toast);
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message);
      alert("削除処理中にエラーが発生しました: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id: string, propertyName: string) => {
    // フロントエンド固定のサンプル物件は複製不可
    if (id === 'sample-property-001') {
      alert("サンプル物件は複製できません。");
      return;
    }

    try {
      setLoading(true);
      const result = await duplicateSimulation(id);
      if (!result) {
        setError("複製に失敗しました");
        alert("複製に失敗しました");
      } else {
        // 複製成功後、編集画面に遷移
        router.push(`/mypage/revenue-simulator?edit=${result.id}`);
      }
    } catch (err: any) {
      setError(err.message);
      alert("複製処理中にエラーが発生しました: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 初回読み込み
  React.useEffect(() => {
    console.log("MyPage useEffect: 初回読み込み", {
      user: user?.email,
      authLoading,
    });
    if (!authLoading) {
      loadSimulations();
    }
  }, [authLoading]); // userを依存配列から削除して無限ループを防ぐ

  // タブが表示されたときにデータを更新（visibilitychange を使用）
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const lastUpdate = (window as any).lastMypageUpdate || 0;
        const now = Date.now();
        // 最後の更新から10秒以上経過していたら更新
        if (now - lastUpdate > 10000) {
          console.log("タブが表示されたときにデータを更新");
          (window as any).lastMypageUpdate = now;
          loadSimulations(true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Supabaseデータを表示用フォーマットに変換
  const formatSimulationData = (simulations: any[]) => {
    return simulations.map((sim) => {
      // スキーマに合わせてデータを取得
      const simulationData = sim.simulation_data || {};
      const results = sim.results || {};

      // resultsが空または存在しない場合のフォールバック計算
      const calculateFallbackValues = () => {
        const purchasePrice = simulationData.purchasePrice || 0;
        const monthlyRent = simulationData.monthlyRent || 0;
        const yearlyRent = monthlyRent * 12;
        const managementFee = simulationData.managementFee || 0;

        // 表面利回りの計算
        const surfaceYield =
          purchasePrice > 0
            ? parseFloat(
                ((yearlyRent / 10000 / purchasePrice) * 100).toFixed(2),
              )
            : 0;

        // 月間キャッシュフローの簡易計算（ローン返済額が必要）
        const loanAmount =
          simulationData.loanAmount || purchasePrice * 0.9 * 10000;
        const interestRate = simulationData.interestRate || 2.0;
        const loanTerms = simulationData.loanTerms || 30;

        // 月々の返済額計算（元利均等）
        const monthlyRate = interestRate / 100 / 12;
        const totalPayments = loanTerms * 12;
        const monthlyPayment =
          (loanAmount *
            monthlyRate *
            Math.pow(1 + monthlyRate, totalPayments)) /
          (Math.pow(1 + monthlyRate, totalPayments) - 1);

        const monthlyCashFlow = monthlyRent - managementFee - monthlyPayment;

        return {
          surfaceYield: surfaceYield,
          monthlyCashFlow: Math.round(monthlyCashFlow),
          annualCashFlow: Math.round(monthlyCashFlow * 12),
        };
      };

      // resultsが存在しない場合はフォールバック計算
      const fallbackValues =
        !results.surfaceYield || !results.monthlyCashFlow
          ? calculateFallbackValues()
          : { surfaceYield: 0, monthlyCashFlow: 0, annualCashFlow: 0 };

      // 売却時ネットCF（10年後）の計算
      const calculateSaleNetCF10Year = () => {
        // resultsから売却時ネットCFを取得（シミュレーター画面で計算済みの値）
        if (
          results.cumulativeCashFlowWithSaleAt10 !== undefined &&
          results.cumulativeCashFlowWithSaleAt10 !== null
        ) {
          // resultsの値は円単位なので、万円に変換
          return results.cumulativeCashFlowWithSaleAt10 / 10000;
        }

        // cash_flow_tableから10年目のデータを取得
        if (sim.cash_flow_table && sim.cash_flow_table.length >= 10) {
          const year10Data = sim.cash_flow_table[9]; // 10年目（配列は0から始まる）

          // 新フィールド: 売却時ネットCFを直接取得
          const saleNetCF = year10Data["売却時ネットCF"] || 0;

          if (saleNetCF !== 0) {
            // 売却時ネットCFを万円単位で返す
            return saleNetCF / 10000;
          }

          // 旧フィールドのフォールバック（互換性のため）
          // 旧データでは売却時ネットCFが存在しないため、近似値を計算
          if (
            year10Data &&
            year10Data["売却純利益"] !== undefined &&
            year10Data["売却純利益"] !== null
          ) {
            // 売却純利益を売却時ネットCFの近似値として使用
            const value = year10Data["売却純利益"];
            return value / 10000;
          }
          // または英語のフィールド名
          if (
            year10Data &&
            year10Data.cumulativeCashFlowWithSale !== undefined &&
            year10Data.cumulativeCashFlowWithSale !== null
          ) {
            // 円単位から万円単位に変換
            return year10Data.cumulativeCashFlowWithSale / 10000;
          }
        }

        // フォールバック: 簡易計算（最終手段）
        const annualCF =
          results.annualCashFlow ||
          fallbackValues.annualCashFlow ||
          (results.monthlyCashFlow || fallbackValues.monthlyCashFlow || 0) * 12;
        const cumulativeCF10Year = annualCF * 10;

        // 売却益の簡易計算
        const purchasePrice = simulationData.purchasePrice || 0; // 万円単位
        const salePrice = purchasePrice * 0.9 * 10000; // 90%で売却と仮定、円単位に変換

        // ローン残債の計算（より正確な計算）
        const loanAmount = simulationData.loanAmount || purchasePrice * 0.9; // 万円単位
        const interestRate = simulationData.interestRate || 2.0;
        const loanTerms = simulationData.loanTerms || 30;

        // 10年後の残債を元利均等返済で計算
        const monthlyRate = interestRate / 100 / 12;
        const totalPayments = loanTerms * 12;
        const monthlyPayment =
          (loanAmount *
            10000 *
            monthlyRate *
            Math.pow(1 + monthlyRate, totalPayments)) /
          (Math.pow(1 + monthlyRate, totalPayments) - 1);

        const paymentsAfter10Years = 10 * 12;
        const remainingPayments = totalPayments - paymentsAfter10Years;
        const loanBalance =
          (monthlyPayment *
            (1 - Math.pow(1 + monthlyRate, -remainingPayments))) /
          monthlyRate;

        const saleProfit = salePrice - loanBalance;
        const total = cumulativeCF10Year + saleProfit;

        if (simulationData.propertyName?.includes("クレメント川越")) {
          console.log(
            "フォールバック計算（円単位）:",
            total,
            "万円変換後:",
            total / 10000,
          );
        }

        // 円単位から万円単位に変換
        return total / 10000;
      };

      // 年間CFを詳細キャッシュフローから取得
      const getAnnualCashFlow = () => {
        if (simulationData.propertyName?.includes("クレメント川越")) {
          console.log("年間CF取得開始");
        }

        // cash_flow_tableから初年度のデータを取得（改装費が含まれない2年目を使用）
        if (sim.cash_flow_table && sim.cash_flow_table.length >= 2) {
          const year2Data = sim.cash_flow_table[1]; // 2年目（通常運営時）

          if (simulationData.propertyName?.includes("クレメント川越")) {
            console.log(
              "2年目データのキー:",
              year2Data ? Object.keys(year2Data) : "データなし",
            );
            console.log("2年目データ全体:", year2Data);
            // キー名を1つずつ表示
            if (year2Data) {
              Object.keys(year2Data).forEach((key) => {
                console.log(`キー: "${key}", 値: ${year2Data[key]}`);
              });
            }
          }

          // 「営業CF」フィールドから年間CFを取得（詳細キャッシュフローの年間CFに相当）
          if (
            year2Data &&
            year2Data["営業CF"] !== undefined &&
            year2Data["営業CF"] !== null
          ) {
            const eigyoCF = year2Data["営業CF"];
            if (simulationData.propertyName?.includes("クレメント川越")) {
              console.log(
                "cash_flow_tableから取得: 2年目の営業CF（円）=",
                eigyoCF,
              );
              console.log("万円に変換:", eigyoCF / 10000);
            }
            // 円単位から万円単位に変換
            return eigyoCF / 10000;
          }
        }

        // フォールバック: resultsから取得（円単位）
        const cfInYen =
          results.annualCashFlow ||
          fallbackValues.annualCashFlow ||
          (results.monthlyCashFlow || fallbackValues.monthlyCashFlow || 0) * 12;

        if (simulationData.propertyName?.includes("クレメント川越")) {
          console.log("フォールバックから取得:", {
            "results.annualCashFlow": results.annualCashFlow,
            "fallbackValues.annualCashFlow": fallbackValues.annualCashFlow,
            "results.monthlyCashFlow": results.monthlyCashFlow,
            cfInYen: cfInYen,
            万円変換後: cfInYen / 10000,
          });
        }

        // 円単位から万円単位に変換
        return cfInYen / 10000;
      };

      // サンプル物件の特別処理
      if (sim.id === 'sample-property-001') {
        return {
          id: sim.id,
          propertyName: '【サンプル】シミュレーション',
          location: '東京都サンプル住所',
          propertyType: 'RC造',
          acquisitionPrice: simulationData.purchasePrice || 2800,
          annualIncome: ((simulationData.monthlyRent || 125000) * 12) / 10000,
          managementFee: ((simulationData.managementFee || 8500) * 12) / 10000,
          surfaceYield: results.surfaceYield || 5.36,
          netYield: results.netYield || 4.12,
          monthlyCashFlow: results.monthlyCashFlow || 15800,
          annualCashFlow: results.annualCashFlow || 189600,
          cumulativeCF10Year: 315,  // 10年後売却込み累計CF
          date: new Date().toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).replace(/\//g, "/"),
          status: '検討中',
          thumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
          propertyUrl: 'https://ooya.tech/',
          propertyMemo: 'サンプル物件で入れております。',
        };
      }

      // 通常の物件処理
      return {
        id: sim.id,
        propertyName: simulationData.propertyName || "無題の物件",
        location: simulationData.location || "住所未設定",
        propertyType: simulationData.propertyType || "一棟アパート/マンション",
        acquisitionPrice: simulationData.purchasePrice || 0, // 既に万円単位で保存されている
        annualIncome: ((simulationData.monthlyRent || 0) * 12) / 10000, // 月額家賃から年間収入を計算、万円に変換
        managementFee: ((simulationData.managementFee || 0) * 12) / 10000, // 月額管理費×12を万円に変換
        surfaceYield: results.surfaceYield || fallbackValues.surfaceYield || 0,
        netYield: results.netYield || 0,
        monthlyCashFlow:
          results.monthlyCashFlow || fallbackValues.monthlyCashFlow || 0,
        annualCashFlow: getAnnualCashFlow(),
        cumulativeCF10Year: calculateSaleNetCF10Year(),
        date: new Date(sim.updated_at || sim.created_at)
          .toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          .replace(/\//g, "/"),
        status: simulationData.propertyStatus || "検討中",
        thumbnail: sanitizeImageUrl(
          simulationData.propertyImageUrl,
          "https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=400",
        ),
        propertyUrl: sanitizeUrl(simulationData.propertyUrl),
        propertyMemo: simulationData.propertyMemo || "",
      };
    });
  };

  // サンプル物件の表示判定
  const hasSeenTutorial = user ? hasTutorialBeenCompleted(user.id) : false;

  // DBに既にサンプル物件が存在するかチェック
  const hasSampleInDB = simulations.some(sim =>
    sim.simulation_data?.propertyName?.startsWith('【サンプル】')
  );

  // DBにサンプル物件がない全ユーザーに、フロントエンドのサンプル物件を表示
  const showSample = !hasSampleInDB;
  
  // チュートリアル開始ボタンのハンドラー
  const handleStartTutorial = () => {
    console.log('チュートリアル開始');
    // チュートリアル進行中フラグをセット
    sessionStorage.setItem('tutorial_in_progress', 'true');
    // 一旦falseにしてリセット
    setRunTutorial(false);
    // 少し遅延させてから開始（DOMの更新を待つ）
    setTimeout(() => {
      console.log('サンプル物件カード要素:', document.querySelector('.sample-property-card'));
      setRunTutorial(true);
    }, 100);
  };

  
  // 初回サンプル物件表示時に自動でチュートリアルを開始
  React.useEffect(() => {
    // チュートリアル未完了 && 初回表示 && 実物件が0件の場合のみ自動開始
    if (!hasSeenTutorial && !loading) {
      // サンプル物件のみ（実物件がない）場合
      const onlyHasSample = simulations.length === 0 || 
        (simulations.length === 1 && hasSampleInDB);
      
      if (onlyHasSample) {
        // 少し遅延させてからチュートリアルを開始
        setTimeout(() => {
          // sessionStorageにフラグをセット（ページ遷移時のチュートリアル継続用）
          sessionStorage.setItem('tutorial_in_progress', 'true');
          setRunTutorial(true);
        }, 1500);
      }
    }
  }, [hasSeenTutorial, simulations.length, hasSampleInDB, loading]);
  
  // サンプル物件を含めたデータの準備
  const allSimulations = showSample 
    ? [sampleProperty, ...simulations]
    : simulations;
  
  const formattedSimulations = formatSimulationData(allSimulations);

  const quickActions: Array<{
    category: string;
    icon: any;
    color: string;
    badge?: string;
    description: string;
    actions: Array<{
      name: string;
      primary: boolean;
      path: string;
      disabled?: boolean;
    }>;
  }> = [
    {
      category: "収益シミュレーション",
      icon: Calculator,
      color: "bg-slate-700",
      description:
        "売却時ネットCF・キャッシュフロー推移・収益利回りをグラフと数値で診断",
      actions: [
        {
          name: "新規作成",
          primary: true,
          path: "/mypage/revenue-simulator",
        },
      ],
    },
    // メンテナンス中のため一時的に非表示
    // {
    //   category: "AI市場分析",
    //   icon: TrendingUp,
    //   color: "bg-gradient-to-r from-purple-600 to-indigo-600",
    //   badge: "NEW",
    //   description:
    //     "機械学習で周辺相場を瞬時に分析。価格帯別の市場動向・類似物件との比較・対象エリアの過去推移を可視化",
    //   actions: [
    //     {
    //       name: "AI市場分析",
    //       primary: true,
    //       path: "/market-analysis",
    //     },
    //   ],
    // },
    // {
    //   category: "公示地価検索",
    //   icon: MapPin,
    //   color: "bg-gradient-to-r from-green-600 to-teal-600",
    //   badge: "NEW",
    //   description:
    //     "国土交通省の公示地価データを高速検索。エリアごとの地価推移・過去4年分のデータを瞬時に分析・可視化",
    //   actions: [
    //     {
    //       name: "公示地価検索",
    //       primary: true,
    //       path: "/land-prices",
    //     },
    //   ],
    // },
    // 2次リリース用: AI事業計画書機能
    // {
    //   category: "AI事業計画書",
    //   icon: Sparkles,
    //   color: "bg-gradient-to-r from-amber-500 to-orange-600",
    //   badge: "COMING SOON",
    //   description:
    //     "AIエージェントが収益シミュレーション・市場分析を統合。物件購入の事業計画書を自動作成し、PDFで出力",
    //   actions: [
    //     {
    //       name: "2025年リリース予定",
    //       primary: false,
    //       path: "#",
    //       disabled: true,
    //     },
    //   ],
    // },
    // 2次リリース用: AI取引事例検索機能
    // {
    //   category: 'AI取引事例検索',
    //   icon: Search,
    //   color: 'bg-slate-700',
    //   description: '2億件超の取引データから類似物件の事例を検索・分析します。',
    //   actions: [
    //     { name: '取引事例を検索する', primary: true, path: '/transaction-search' }
    //   ]
    // },
    // 2次リリース用: AI市場分析機能
    // {
    //   category: 'AI市場分析',
    //   icon: TrendingUp,
    //   color: 'bg-slate-700',
    //   description: 'エリアの市場動向と将来性をAIが詳細に分析します。',
    //   actions: [
    //     { name: '市場分析を実行する', primary: true, path: '/market-analysis' }
    //   ]
    // },
  ];

  const filteredResults = formattedSimulations.filter((result) => {
    const matchesSearch =
      result.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || result.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // 全件表示（ページネーションなし）
  const displayResults = filteredResults;

  const formatCurrency = (amount: number) => {
    if (amount >= 10000) {
      return `${Math.round(amount / 10000).toLocaleString()}万円`;
    }
    return `${Math.round(amount).toLocaleString()}万円`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto pt-5 lg:pt-0">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600">物件データを読み込み中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        {/* 使用状況表示バー（無料ユーザーはアップグレード促進付き） */}
        <UsageStatusBar onUpgradeClick={handleUpgradeClick} />

        {/* お知らせバナー - 非表示（サービス終了通知は不要）
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <MaintenanceNotice />
        </div>
        */}

        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pt-1 md:pt-0">
            {/* Header */}
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">収益シミュレーション</h1>
                  <p className="text-gray-600 mt-1">
                    物件情報を入力して収益性を3分で分析。賃貸経営の成果を一目で確認できます。
                  </p>
                </div>

              </div>
            </div>

            <div className="space-y-6">
              {/* 新規作成ボタン */}
              <div className="flex justify-center">
                <button
                  onClick={() => router.push("/mypage/revenue-simulator")}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 py-4 transition-all duration-200"
                >
                  <div className="flex items-center">
                    <span className="text-lg font-semibold">
                      新規収益シミュレーションを作成する
                    </span>
                    <ChevronRight className="h-5 w-5 ml-3 flex-shrink-0" />
                  </div>
                </button>
              </div>

              {/* Property List Section */}
              <div
                id="property-list"
                className="bg-white rounded-lg border border-gray-200 p-3 md:p-6"
              >
                <div className="flex items-center mb-6">
                  <Calculator className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    収益シミュレーション一覧
                  </h3>
                  <span className="text-lg font-semibold text-gray-900 ml-2">{filteredResults.length}件</span>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">エラー: {error}</p>
                    <button
                      onClick={refetch}
                      className="mt-2 text-red-600 hover:text-red-700 underline"
                    >
                      再試行
                    </button>
                  </div>
                )}

                {/* Card Grid - Responsive Layout */}
                {filteredResults.length === 0 ? (
                  <div className="text-center py-12">
                    <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      物件がまだ登録されていません
                    </h3>
                    <p className="text-gray-600 mb-6">
                      AI物件シミュレーターで物件を分析して保存してみましょう。
                    </p>
                    <button
                      onClick={async () => {
                        // 完全無料プランのため、制限チェックをスキップ
                        router.push("/mypage/revenue-simulator");
                      }}
                      className="inline-flex items-center px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      最初の物件を分析する
                    </button>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* テーブルヘッダー（PC版のみ） */}
                    <div className="hidden md:flex items-center bg-gray-100 border-b border-gray-200 text-base font-medium text-gray-600">
                      <div className="w-12 text-center px-2 py-3 border-r border-gray-200">No.</div>
                      <div className="flex-[2] min-w-0 px-4 py-3 border-r border-gray-200 text-center">物件名</div>
                      <div className="flex-1 text-center px-2 py-3 border-r border-gray-200">
                        <div>購入価格</div>
                        <div className="text-sm text-gray-500">表面利回り</div>
                      </div>
                      <div className="flex-1 text-center px-2 py-3 border-r border-gray-200">年間CF</div>
                      <div className="flex-1 text-center px-2 py-3 border-r border-gray-200">更新日</div>
                      <div className="w-32 text-center px-2 py-3 border-r border-gray-200">ステータス</div>
                      <div className="w-28 text-center px-2 py-3 border-r border-gray-200">結果を見る</div>
                      <div className="w-20 text-center px-2 py-3 border-r border-gray-200">編集</div>
                      <div className="w-20 text-center px-2 py-3 border-r border-gray-200">複製</div>
                      <div className="w-20 text-center px-2 py-3">削除</div>
                    </div>

                    {displayResults.map((sim, index) => {
                      // サンプル物件の最初のインデックスを取得
                      const firstSampleIndex = displayResults.findIndex(s =>
                        s.id === 'sample-property-001' || s.propertyName?.startsWith('【サンプル】')
                      );

                      // このカードが最初のサンプル物件かどうか
                      const isFirstSample = (sim.id === 'sample-property-001' || sim.propertyName?.startsWith('【サンプル】'))
                        && index === firstSampleIndex;

                      // ステータスの絵文字を取得
                      const getStatusEmoji = (status: string) => {
                        switch (status) {
                          case "検討中": return "🔍";
                          case "内見予定": return "👀";
                          case "申込検討": return "⏳";
                          case "契約手続中": return "📋";
                          case "取得済み": return "✅";
                          case "売却済み": return "💰";
                          case "見送り": return "❌";
                          case "保留": return "📝";
                          default: return "🔍";
                        }
                      };

                      const isLastItem = index === displayResults.length - 1;

                      // 交互背景色（ゼブラストライプ）
                      const isEvenRow = index % 2 === 1;

                      return (
                        <div
                          key={sim.id}
                          className={`transition-all duration-200 cursor-pointer ${
                            isFirstSample ? 'sample-property-card' : ''
                          } ${
                            !isLastItem ? 'border-b border-gray-200' : ''
                          } ${
                            sim.status === "取得済み"
                              ? "bg-green-50 hover:bg-green-100"
                              : sim.status === "契約手続中"
                                ? "bg-blue-50 hover:bg-blue-100"
                                : isEvenRow
                                  ? "bg-blue-50 hover:bg-blue-100"
                                  : "bg-white hover:bg-blue-50"
                          }`}
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (!target.closest("button")) {
                              const isTutorial = sessionStorage.getItem('tutorial_in_progress') === 'true';
                              const url = isTutorial
                                ? `/mypage/revenue-simulator?view=${sim.id}`
                                : `/mypage/revenue-simulator?view=${sim.id}#results`;
                              router.push(url);
                            }
                          }}
                        >
                          {/* PC版: 横並びレイアウト */}
                          <div className="hidden md:flex items-stretch">
                            {/* No. */}
                            <div className="w-12 text-center px-2 py-3 border-r border-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">{index + 1}</span>
                            </div>
                            {/* 物件名・住所 */}
                            <div className="flex-[2] min-w-0 px-4 py-3 border-r border-gray-200 flex flex-col justify-center">
                              <p className="font-semibold text-gray-900 truncate mb-1" title={sim.propertyName}>
                                {sim.propertyName}
                              </p>
                              <p className="text-sm text-gray-500 truncate" title={sim.location}>
                                {sim.location}
                              </p>
                            </div>

                            {/* 購入価格・表面利回り */}
                            <div className="flex-1 text-center px-2 py-3 border-r border-gray-200 flex flex-col justify-center">
                              <p className="font-bold text-gray-900">{formatCurrency(sim.acquisitionPrice)}</p>
                              <p className="font-bold text-gray-900">{sim.surfaceYield.toFixed(2)}%</p>
                            </div>

                            {/* 年間CF */}
                            <div className="flex-1 text-center px-2 py-3 border-r border-gray-200 flex flex-col justify-center">
                              <p className={`font-bold ${sim.annualCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {sim.annualCashFlow >= 0 ? "+" : ""}{formatNumber(Math.round(sim.annualCashFlow))}万
                              </p>
                            </div>

                            {/* 登録日 */}
                            <div className="flex-1 text-center px-2 py-3 border-r border-gray-200 flex flex-col justify-center">
                              <p className="text-sm text-gray-700">{sim.date}</p>
                            </div>

                            {/* ステータス */}
                            <div className="w-32 text-center px-2 py-3 border-r border-gray-200 flex items-center justify-center">
                              <span className="text-sm">
                                {getStatusEmoji(sim.status || '検討中')} {sim.status || '検討中'}
                              </span>
                            </div>

                            {/* 結果ボタン（独立列） */}
                            <div className="w-28 px-2 py-3 border-r border-gray-200 flex items-center justify-center">
                              <button
                                onClick={() => {
                                  const isTutorial = sessionStorage.getItem('tutorial_in_progress') === 'true';
                                  const url = isTutorial
                                    ? `/mypage/revenue-simulator?view=${sim.id}`
                                    : `/mypage/revenue-simulator?view=${sim.id}#results`;
                                  router.push(url);
                                }}
                                className="px-3 py-2 bg-white border border-blue-500 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                                title="結果を見る"
                              >
                                結果を見る
                              </button>
                            </div>

                            {/* 編集 */}
                            <div className="w-20 px-2 py-3 border-r border-gray-200 flex items-center justify-center">
                              <button
                                onClick={() => router.push(`/mypage/revenue-simulator?edit=${sim.id}`)}
                                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors"
                                title="編集"
                              >
                                編集
                              </button>
                            </div>
                            {/* 複製 */}
                            <div className="w-20 px-2 py-3 border-r border-gray-200 flex items-center justify-center">
                              <button
                                onClick={() => handleDuplicate(sim.id, sim.propertyName)}
                                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors"
                                title="複製"
                              >
                                複製
                              </button>
                            </div>
                            {/* 削除 */}
                            <div className="w-20 px-2 py-3 flex items-center justify-center">
                              <button
                                onClick={() => {
                                  if (window.confirm(`「${sim.propertyName}」を削除してもよろしいですか？`)) {
                                    if (window.confirm("本当に削除しますか？")) {
                                      handleDelete(sim.id, sim.propertyName);
                                    }
                                  }
                                }}
                                className="px-3 py-1.5 bg-white border border-red-300 text-red-600 text-sm font-medium rounded hover:bg-red-50 transition-colors"
                                title="削除"
                              >
                                削除
                              </button>
                            </div>
                          </div>

                          {/* SP版: 縦並びコンパクトレイアウト */}
                          <div className="md:hidden p-3">
                            {/* 1行目: No.と物件名 */}
                            <p className="font-semibold text-gray-900 truncate mb-1" title={sim.propertyName}>
                              <span className="text-gray-500 mr-2">{index + 1}.</span>{sim.propertyName}
                            </p>

                            {/* 2行目: ステータス */}
                            <p className="text-sm text-gray-600 mb-2">
                              {getStatusEmoji(sim.status || '検討中')} {sim.status || '検討中'}
                            </p>

                            {/* 3行目: 住所 */}
                            <p className="text-sm text-gray-500 truncate mb-2" title={sim.location}>
                              {sim.location}
                            </p>

                            {/* 3行目: 指標 */}
                            <div className="flex items-center gap-4 text-sm mb-3">
                              <div>
                                <span className="text-gray-500">購入:</span>
                                <span className="font-bold ml-1">{formatCurrency(sim.acquisitionPrice)}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">年間CF:</span>
                                <span className={`font-bold ml-1 ${sim.annualCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  {sim.annualCashFlow >= 0 ? "+" : ""}{formatNumber(Math.round(sim.annualCashFlow))}万
                                </span>
                              </div>
                              <div className="text-gray-400 text-xs">
                                {sim.date}
                              </div>
                            </div>

                            {/* 4行目: ボタン */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const isTutorial = sessionStorage.getItem('tutorial_in_progress') === 'true';
                                  const url = isTutorial
                                    ? `/mypage/revenue-simulator?view=${sim.id}`
                                    : `/mypage/revenue-simulator?view=${sim.id}#results`;
                                  router.push(url);
                                }}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white border border-blue-500 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                <BarChart3 className="h-4 w-4" />
                                <span>結果</span>
                              </button>
                              <button
                                onClick={() => router.push(`/mypage/revenue-simulator?edit=${sim.id}`)}
                                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                title="編集"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDuplicate(sim.id, sim.propertyName)}
                                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                title="複製"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`「${sim.propertyName}」を削除してもよろしいですか？`)) {
                                    if (window.confirm("本当に削除しますか？")) {
                                      handleDelete(sim.id, sim.propertyName);
                                    }
                                  }
                                }}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                title="削除"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* プリフェッチ用の隠しリンク（ページ遷移高速化） */}
      <Link href="/mypage/revenue-simulator" prefetch={true} className="hidden" aria-hidden="true" tabIndex={-1} />

      {/* アップグレードモーダル */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={handleUpgradeClose}
      />
      
      {/* チュートリアル - react-joyride React 19対応まで完全に無効化
         ※ run={false}でもコンポーネントがレンダリングされるとReact 19互換性エラーが発生するため、
            コンポーネント自体をコメントアウト
      */}
    </>
  );
};

export default MyPage;
