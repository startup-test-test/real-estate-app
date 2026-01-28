'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calculator,
  Building,
  Edit,
  Trash2,
  Copy,
  Loader,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { useCFSimulations, CFSimulationData } from "@/hooks/useCFSimulations";

const CFSimulatorListClient: React.FC = () => {
  const router = useRouter();
  const { getSimulations, deleteSimulation, duplicateSimulation } = useCFSimulations();

  const [simulations, setSimulations] = useState<CFSimulationData[]>([]);
  const [loading, setLoading] = useState(true);

  // データ読み込み
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await getSimulations();
      setSimulations(data);
      setLoading(false);
    };
    loadData();
  }, [getSimulations]);

  // 削除ハンドラ
  const handleDelete = async (id: string, propertyName: string) => {
    if (window.confirm(`「${propertyName}」を削除してもよろしいですか？`)) {
      if (window.confirm("本当に削除しますか？")) {
        const success = await deleteSimulation(id);
        if (success) {
          const data = await getSimulations();
          setSimulations(data);
          // 成功フィードバック
          const toast = document.createElement("div");
          toast.className = "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50";
          toast.textContent = "削除しました";
          document.body.appendChild(toast);
          setTimeout(() => {
            if (document.body.contains(toast)) {
              document.body.removeChild(toast);
            }
          }, 3000);
        }
      }
    }
  };

  // 複製ハンドラ
  const handleDuplicate = async (id: string) => {
    const duplicated = await duplicateSimulation(id);
    if (duplicated) {
      router.push(`/mypage/cf-simulator/${duplicated.id}`);
    }
  };

  // 通貨フォーマット
  const formatCurrency = (amount: number) => {
    return `${Math.round(amount).toLocaleString()}万円`;
  };

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

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\//g, "/");
  };

  useEffect(() => {
    document.title = 'CFシミュレーター | 大家DX';
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto pt-5 lg:pt-0">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">データを読み込み中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto pt-1 md:pt-0">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CFシミュレーター</h1>
                <p className="text-gray-600 mt-1">
                  6項目の入力でキャッシュフローを簡単にシミュレーション。結果を保存して一覧で管理できます。
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* 新規作成ボタン */}
            <div className="flex justify-center">
              <button
                onClick={() => router.push("/mypage/cf-simulator/new")}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 py-4 transition-all duration-200"
              >
                <div className="flex items-center">
                  <span className="text-lg font-semibold">
                    新規CFシミュレーションを作成する
                  </span>
                  <ChevronRight className="h-5 w-5 ml-3 flex-shrink-0" />
                </div>
              </button>
            </div>

            {/* シミュレーション一覧 */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
              <div className="flex items-center mb-6">
                <Calculator className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  CFシミュレーション一覧
                </h3>
                <span className="text-lg font-semibold text-gray-900 ml-2">{simulations.length}件</span>
              </div>

              {/* Card Grid */}
              {simulations.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    シミュレーションがまだありません
                  </h3>
                  <p className="text-gray-600 mb-6">
                    CFシミュレーターで物件のキャッシュフローを分析してみましょう。
                  </p>
                  <button
                    onClick={() => router.push("/mypage/cf-simulator/new")}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Calculator className="h-5 w-5 mr-2" />
                    最初のシミュレーションを作成
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

                  {simulations.map((sim, index) => {
                    const isLastItem = index === simulations.length - 1;
                    const isEvenRow = index % 2 === 1;
                    const propertyName = sim.inputData?.propertyName || sim.name || '無題';
                    const purchasePrice = sim.inputData?.purchasePrice || 0;
                    const surfaceYield = sim.results?.surfaceYield || 0;
                    const annualCashFlow = sim.results?.annualCashFlow || 0;

                    return (
                      <div
                        key={sim.id}
                        className={`transition-all duration-200 cursor-pointer ${
                          !isLastItem ? 'border-b border-gray-200' : ''
                        } ${
                          isEvenRow ? "bg-blue-50 hover:bg-blue-100" : "bg-white hover:bg-blue-50"
                        }`}
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (!target.closest("button")) {
                            router.push(`/mypage/cf-simulator/${sim.id}`);
                          }
                        }}
                      >
                        {/* PC版: 横並びレイアウト */}
                        <div className="hidden md:flex items-stretch">
                          {/* No. */}
                          <div className="w-12 text-center px-2 py-3 border-r border-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">{index + 1}</span>
                          </div>
                          {/* 物件名 */}
                          <div className="flex-[2] min-w-0 px-4 py-3 border-r border-gray-200 flex flex-col justify-center">
                            <p className="font-semibold text-gray-900 truncate mb-1" title={propertyName}>
                              {propertyName}
                            </p>
                          </div>

                          {/* 購入価格・表面利回り */}
                          <div className="flex-1 text-center px-2 py-3 border-r border-gray-200 flex flex-col justify-center">
                            <p className="font-bold text-gray-900">{formatCurrency(purchasePrice)}</p>
                            <p className="font-bold text-gray-900">{surfaceYield?.toFixed(2) || '0.00'}%</p>
                          </div>

                          {/* 年間CF */}
                          <div className="flex-1 text-center px-2 py-3 border-r border-gray-200 flex flex-col justify-center">
                            <p className={`font-bold ${annualCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {annualCashFlow >= 0 ? "+" : ""}{Math.round(annualCashFlow)}万
                            </p>
                          </div>

                          {/* 更新日 */}
                          <div className="flex-1 text-center px-2 py-3 border-r border-gray-200 flex flex-col justify-center">
                            <p className="text-sm text-gray-700">{formatDate(sim.updatedAt)}</p>
                          </div>

                          {/* ステータス */}
                          <div className="w-32 text-center px-2 py-3 border-r border-gray-200 flex items-center justify-center">
                            <span className="text-sm">
                              {getStatusEmoji(sim.status || '検討中')} {sim.status || '検討中'}
                            </span>
                          </div>

                          {/* 結果ボタン */}
                          <div className="w-28 px-2 py-3 border-r border-gray-200 flex items-center justify-center">
                            <button
                              onClick={() => router.push(`/mypage/cf-simulator/${sim.id}`)}
                              className="px-3 py-2 bg-white border border-blue-500 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                              title="結果を見る"
                            >
                              結果を見る
                            </button>
                          </div>

                          {/* 編集 */}
                          <div className="w-20 px-2 py-3 border-r border-gray-200 flex items-center justify-center">
                            <button
                              onClick={() => router.push(`/mypage/cf-simulator/${sim.id}?edit=true`)}
                              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors"
                              title="編集"
                            >
                              編集
                            </button>
                          </div>
                          {/* 複製 */}
                          <div className="w-20 px-2 py-3 border-r border-gray-200 flex items-center justify-center">
                            <button
                              onClick={() => handleDuplicate(sim.id)}
                              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors"
                              title="複製"
                            >
                              複製
                            </button>
                          </div>
                          {/* 削除 */}
                          <div className="w-20 px-2 py-3 flex items-center justify-center">
                            <button
                              onClick={() => handleDelete(sim.id, propertyName)}
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
                          <p className="font-semibold text-gray-900 truncate mb-1" title={propertyName}>
                            <span className="text-gray-500 mr-2">{index + 1}.</span>{propertyName}
                          </p>

                          {/* 2行目: ステータス */}
                          <p className="text-sm text-gray-600 mb-2">
                            {getStatusEmoji(sim.status || '検討中')} {sim.status || '検討中'}
                          </p>

                          {/* 3行目: 指標 */}
                          <div className="flex items-center gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-500">購入:</span>
                              <span className="font-bold ml-1">{formatCurrency(purchasePrice)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">年間CF:</span>
                              <span className={`font-bold ml-1 ${annualCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {annualCashFlow >= 0 ? "+" : ""}{Math.round(annualCashFlow)}万
                              </span>
                            </div>
                            <div className="text-gray-400 text-xs">
                              {formatDate(sim.updatedAt)}
                            </div>
                          </div>

                          {/* 4行目: ボタン */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/mypage/cf-simulator/${sim.id}`)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white border border-blue-500 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              <BarChart3 className="h-4 w-4" />
                              <span>結果</span>
                            </button>
                            <button
                              onClick={() => router.push(`/mypage/cf-simulator/${sim.id}?edit=true`)}
                              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              title="編集"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(sim.id)}
                              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              title="複製"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(sim.id, propertyName)}
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

      {/* プリフェッチ用の隠しリンク */}
      <Link href="/mypage/cf-simulator/new" prefetch={true} className="hidden" aria-hidden="true" tabIndex={-1} />
    </div>
  );
};

export default CFSimulatorListClient;
