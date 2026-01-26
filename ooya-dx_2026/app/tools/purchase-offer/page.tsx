'use client';

import React, { useState, useRef } from 'react';
import { SharedHeader } from '@/components/shared-header';
import { LandingFooter } from '@/components/landing-footer';

interface FormData {
  // 申込日
  applicationDate: string;


  // 買主情報
  buyerAddress: string;
  buyerLastName: string;
  buyerFirstName: string;
  buyerCompanyName: string;
  buyerTitle: string;

  // 1. 物件
  propertyName: string;
  propertyAddress: string;
  exclusiveArea: string;
  landAreaM2: string;
  landAreaTsubo: string;
  buildingAreaM2: string;
  buildingAreaTsubo: string;

  // 2. 条件
  purchasePrice: string;
  earnestMoney: string;

  // 3. 支払方法
  paymentMethod: 'cash' | 'loan';
  loanPreApproval: 'done' | 'not_done';
  hasLoanContingency: boolean;

  // 4. 有効期間
  validityDate: string;

  // 5. 契約日
  contractDate: string;
  contractDateTbd: boolean;

  // 6. その他条件
  earnestMoneyCancellationDays: string;
  deliveryDate: string;
  deliveryDateTbd: boolean;
  otherConditions: string;

  // 印鑑表示
  showStamp: boolean;
}

const initialFormData: FormData = {
  applicationDate: new Date().toISOString().split('T')[0],
  buyerAddress: '',
  buyerLastName: '',
  buyerFirstName: '',
  buyerCompanyName: '',
  buyerTitle: '',
  propertyName: '',
  propertyAddress: '',
  exclusiveArea: '',
  landAreaM2: '',
  landAreaTsubo: '',
  buildingAreaM2: '',
  buildingAreaTsubo: '',
  purchasePrice: '',
  earnestMoney: '',
  paymentMethod: 'loan',
  loanPreApproval: 'done',
  hasLoanContingency: true,
  validityDate: '',
  contractDate: '',
  contractDateTbd: true,
  earnestMoneyCancellationDays: '14',
  deliveryDate: '',
  deliveryDateTbd: true,
  otherConditions: '',
  showStamp: true,
};

// m²から坪への変換
const m2ToTsubo = (m2: string): string => {
  const num = parseFloat(m2);
  if (isNaN(num)) return '';
  return (num / 3.30579).toFixed(2);
};

// 日付をフォーマット
const formatDateJP = (dateStr: string): { year: string; month: string; day: string } => {
  if (!dateStr) return { year: '', month: '', day: '' };
  const [year, month, day] = dateStr.split('-');
  return { year, month: month?.replace(/^0/, ''), day: day?.replace(/^0/, '') };
};

export default function PurchaseOfferPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showOptional, setShowOptional] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // m²入力時に坪を自動計算
  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>, tsuboField: 'landAreaTsubo' | 'buildingAreaTsubo') => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      [tsuboField]: m2ToTsubo(value),
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const appDate = formatDateJP(formData.applicationDate);
  const validDate = formatDateJP(formData.validityDate);
  const contDate = formatDateJP(formData.contractDate);

  return (
    <div className="min-h-screen bg-gray-50 print:min-h-0 print:bg-white">
      <div className="print:hidden">
        <SharedHeader />
      </div>
      <div className="h-[72px] sm:h-[88px] print:hidden" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-8 print:hidden">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm font-semibold rounded-full mb-4">
            無料ツール
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            買付申込書ジェネレーター
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            フォームに入力するだけで、A4サイズの買付予約書PDFを作成できます。
            <br />
            <span className="text-sm text-gray-500">※ 入力データはサーバーに保存されません。ブラウザを閉じると消去されます。</span>
          </p>
        </div>

        {/* 使い方（コンパクト版） */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6 print:hidden">
          <div className="flex flex-wrap items-start gap-6 text-sm">
            <div className="flex items-start gap-2 flex-1 min-w-[160px]">
              <span className="text-blue-600 font-bold text-xs shrink-0">Step.1</span>
              <div>
                <span className="font-medium text-gray-900">フォームに入力</span>
                <p className="text-xs text-gray-500 mt-0.5">物件情報・買主情報・条件を入力</p>
              </div>
            </div>
            <div className="flex items-start gap-2 flex-1 min-w-[160px]">
              <span className="text-blue-600 font-bold text-xs shrink-0">Step.2</span>
              <div>
                <span className="font-medium text-gray-900">プレビューで確認</span>
                <p className="text-xs text-gray-500 mt-0.5">右側でA4の仕上がりを確認</p>
              </div>
            </div>
            <div className="flex items-start gap-2 flex-1 min-w-[160px]">
              <span className="text-blue-600 font-bold text-xs shrink-0">Step.3</span>
              <div>
                <span className="font-medium text-gray-900">PDF保存・印刷</span>
                <p className="text-xs text-gray-500 mt-0.5">ボタンでダウンロードまたは印刷</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-blue-100">※ 入力データはサーバーに送信・保存されません。ブラウザを閉じると消去されます。</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 入力フォーム */}
          <div className="bg-white rounded-2xl shadow-sm p-6 print:hidden">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b">入力フォーム</h2>

            {/* 基本情報（買主） */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="text-sm font-bold text-gray-500 mb-4">申込者情報</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">申込日</label>
                  <input
                    type="date"
                    name="applicationDate"
                    value={formData.applicationDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
                  <input
                    type="text"
                    name="buyerAddress"
                    value={formData.buyerAddress}
                    onChange={handleChange}
                    placeholder="例：埼玉県さいたま市大宮区桜木町2丁目3番地"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">法人名（法人の場合）</label>
                  <input
                    type="text"
                    name="buyerCompanyName"
                    value={formData.buyerCompanyName}
                    onChange={handleChange}
                    placeholder="例：株式会社StartupMarketing"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">役職</label>
                    <input
                      type="text"
                      name="buyerTitle"
                      value={formData.buyerTitle}
                      onChange={handleChange}
                      placeholder="代表取締役"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">苗字</label>
                    <input
                      type="text"
                      name="buyerLastName"
                      value={formData.buyerLastName}
                      onChange={handleChange}
                      placeholder="山田"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
                    <input
                      type="text"
                      name="buyerFirstName"
                      value={formData.buyerFirstName}
                      onChange={handleChange}
                      placeholder="太郎"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="showStamp"
                    checked={formData.showStamp}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">印鑑（苗字）を表示する</span>
                </label>
              </div>
            </div>

            {/* 1. 物件 */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="text-sm font-bold text-gray-500 mb-4">1. 物件</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">物件名</label>
                  <input
                    type="text"
                    name="propertyName"
                    value={formData.propertyName}
                    onChange={handleChange}
                    placeholder="例：シューアダムスグランテ308号室"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">所在</label>
                  <input
                    type="text"
                    name="propertyAddress"
                    value={formData.propertyAddress}
                    onChange={handleChange}
                    placeholder="例：埼玉県上尾市上尾下1049-1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">土地 m²</label>
                    <input
                      type="text"
                      name="landAreaM2"
                      value={formData.landAreaM2}
                      onChange={(e) => handleAreaChange(e, 'landAreaTsubo')}
                      placeholder="例：150"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">坪（自動計算）</label>
                    <input
                      type="text"
                      name="landAreaTsubo"
                      value={formData.landAreaTsubo}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">建物 m²</label>
                    <input
                      type="text"
                      name="buildingAreaM2"
                      value={formData.buildingAreaM2}
                      onChange={(e) => handleAreaChange(e, 'buildingAreaTsubo')}
                      placeholder="例：80"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">坪（自動計算）</label>
                    <input
                      type="text"
                      name="buildingAreaTsubo"
                      value={formData.buildingAreaTsubo}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 条件 */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="text-sm font-bold text-gray-500 mb-4">2. 条件</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">購入価格（円）</label>
                  <input
                    type="text"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    placeholder="例：11,500,000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">手付金（円）※購入価格に充当</label>
                  <input
                    type="text"
                    name="earnestMoney"
                    value={formData.earnestMoney}
                    onChange={handleChange}
                    placeholder="例：575,000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. 支払方法 */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="text-sm font-bold text-gray-500 mb-4">3. 支払方法</h3>
              <div className="space-y-3">
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    現金
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="loan"
                      checked={formData.paymentMethod === 'loan'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    銀行融資
                  </label>
                </div>
                {formData.paymentMethod === 'loan' && (
                  <div className="pl-4 border-l-2 border-blue-200 space-y-2">
                    <div className="flex gap-4">
                      <span className="text-sm text-gray-600">事前審査:</span>
                      <label className="flex items-center cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="loanPreApproval"
                          value="done"
                          checked={formData.loanPreApproval === 'done'}
                          onChange={handleChange}
                          className="mr-1"
                        />
                        済
                      </label>
                      <label className="flex items-center cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="loanPreApproval"
                          value="not_done"
                          checked={formData.loanPreApproval === 'not_done'}
                          onChange={handleChange}
                          className="mr-1"
                        />
                        未
                      </label>
                    </div>
                    <label className="flex items-center cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        name="hasLoanContingency"
                        checked={formData.hasLoanContingency}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      ローン特約あり
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* 4. 有効期間 */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="text-sm font-bold text-gray-500 mb-4">4. 有効期間</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">本書面の有効期間</label>
                <input
                  type="date"
                  name="validityDate"
                  value={formData.validityDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* 5. 契約日 */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="text-sm font-bold text-gray-500 mb-4">5. 契約日</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">売買契約締結日（予定）</label>
                <div className="flex items-center gap-4">
                  <input
                    type="date"
                    name="contractDate"
                    value={formData.contractDate}
                    onChange={handleChange}
                    disabled={formData.contractDateTbd}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                  <label className="flex items-center cursor-pointer text-sm whitespace-nowrap">
                    <input
                      type="checkbox"
                      name="contractDateTbd"
                      checked={formData.contractDateTbd}
                      onChange={handleChange}
                      className="mr-1"
                    />
                    要相談
                  </label>
                </div>
              </div>
            </div>

            {/* 6. その他条件 */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 mb-4">6. その他条件</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">手付金解除期限（契約後〇日後まで）</label>
                  <input
                    type="text"
                    name="earnestMoneyCancellationDays"
                    value={formData.earnestMoneyCancellationDays}
                    onChange={handleChange}
                    placeholder="例：14"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">引渡し時期</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="date"
                      name="deliveryDate"
                      value={formData.deliveryDate}
                      onChange={handleChange}
                      disabled={formData.deliveryDateTbd}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                    <label className="flex items-center cursor-pointer text-sm whitespace-nowrap">
                      <input
                        type="checkbox"
                        name="deliveryDateTbd"
                        checked={formData.deliveryDateTbd}
                        onChange={handleChange}
                        className="mr-1"
                      />
                      要相談
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">その他</label>
                  <textarea
                    name="otherConditions"
                    value={formData.otherConditions}
                    onChange={handleChange}
                    rows={2}
                    placeholder="例：現状渡し希望、瑕疵担保責任免責 など"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-4 pt-4 border-t">
              <button
                onClick={handlePrint}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                PDFを保存・印刷
              </button>
              <button
                onClick={() => setFormData(initialFormData)}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                リセット
              </button>
            </div>
          </div>

          {/* プレビュー（スティッキー） */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-2xl shadow-sm p-6 print:p-[15mm] print:shadow-none print:bg-white">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b print:hidden">プレビュー</h2>

              {/* A4プレビュー */}
              <div
                ref={printRef}
                className="bg-white border border-gray-200 p-6 print:border-0 print:p-0 text-xs"
                style={{
                  aspectRatio: '210 / 297',
                  maxHeight: 'calc(100vh - 200px)',
                  overflow: 'auto'
                }}
              >
              {/* タイトル */}
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold tracking-[0.5em]">買 付 申 込 書</h1>
              </div>

              {/* 日付 */}
              <div className="text-right mb-4">
                <p>{appDate.year || '　　　　'}年　{appDate.month || '　　'}月　{appDate.day || '　　'}日</p>
              </div>

              {/* 売主・買主情報 */}
              <div className="flex justify-between mb-6">
                <div>
                  <div className="border-b border-gray-400 pb-1 mb-2 w-32">
                    <span>売主</span>
                    <span className="ml-8">様</span>
                  </div>
                </div>
                <div className="text-right">
                  <p>住所　{formData.buyerAddress || '　　　　　　　　　　　　　　　　'}</p>
                  {formData.buyerCompanyName && (
                    <p>　　　{formData.buyerCompanyName}</p>
                  )}
                  <p className="flex items-center justify-end gap-2">
                    <span>氏名　</span>
                    {formData.buyerTitle && <span>{formData.buyerTitle}　</span>}
                    <span>{formData.buyerLastName || '　　'}</span>
                    <span className="ml-1">{formData.buyerFirstName || '　　　　'}</span>
                    {/* 印鑑風デザイン */}
                    {formData.showStamp && (
                      formData.buyerLastName ? (
                        <span
                          className="inline-flex items-center justify-center ml-2 rounded-full border-2 border-red-600 text-red-600 font-bold"
                          style={{
                            width: '32px',
                            height: '32px',
                            fontSize: formData.buyerLastName.length === 1 ? '14px' : formData.buyerLastName.length === 2 ? '11px' : '9px',
                            lineHeight: 1,
                            fontFamily: 'serif',
                          }}
                        >
                          {formData.buyerLastName.slice(0, 3)}
                        </span>
                      ) : (
                        <span className="inline-block w-8 h-8 border border-gray-400 text-center leading-8 text-xs ml-2">印</span>
                      )
                    )}
                  </p>
                </div>
              </div>

              {/* 本文 */}
              <p className="mb-4">私は、下記不動産を、下記の条件にて購入したく、買い付けることを証明いたします。</p>

              <div className="text-center mb-4">
                <p>記</p>
              </div>

              {/* 1. 物件 */}
              <div className="mb-4">
                <p className="font-semibold mb-2">1．物件</p>
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1 w-24">物件名</td>
                      <td className="py-1 border-b border-gray-300">{formData.propertyName || '　'}</td>
                    </tr>
                    <tr>
                      <td className="py-1">所　在</td>
                      <td className="py-1 border-b border-gray-300">{formData.propertyAddress || '　'}</td>
                    </tr>
                    {formData.exclusiveArea && (
                      <tr>
                        <td className="py-1">専有面積</td>
                        <td className="py-1 border-b border-gray-300">{formData.exclusiveArea}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-1">土　地</td>
                      <td className="py-1 border-b border-gray-300">
                        {formData.landAreaM2 || '　　　'}m²（{formData.landAreaTsubo || '　　　'}坪）
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1">建　物</td>
                      <td className="py-1 border-b border-gray-300">
                        {formData.buildingAreaM2 || '　　　'}m²（{formData.buildingAreaTsubo || '　　　'}坪）
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 2. 条件 */}
              <div className="mb-4">
                <p className="font-semibold mb-2">2．条件</p>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1 w-24">購入価格</td>
                      <td className="py-1">金　{formData.purchasePrice || '　　　　　　　　'}　円也</td>
                    </tr>
                    <tr>
                      <td className="py-1">手付金</td>
                      <td className="py-1">金　{formData.earnestMoney || '　　　　　　　　'}　円也　※購入価格に充当</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3. 支払方法 */}
              <div className="mb-4">
                <p className="font-semibold mb-2">3．支払方法</p>
                <p className="ml-4">
                  ・{formData.paymentMethod === 'cash' ? <span className="font-bold">現金</span> : '現金'}
                  ・{formData.paymentMethod === 'loan' ? <span className="font-bold">銀行融資</span> : '銀行融資'}
                  {formData.paymentMethod === 'loan' && (
                    <>
                      （事前審査　<span className={formData.loanPreApproval === 'done' ? 'font-bold' : ''}>済</span>・<span className={formData.loanPreApproval === 'not_done' ? 'font-bold' : ''}>未</span>）
                    </>
                  )}
                </p>
                {formData.paymentMethod === 'loan' && formData.hasLoanContingency && (
                  <p className="ml-4">※ローン特約あり</p>
                )}
              </div>

              {/* 4. 有効期間 */}
              <div className="mb-4">
                <p className="font-semibold mb-2">4．有効期間</p>
                <p className="ml-4">
                  本書面の有効期間は　{validDate.year || '　　　　'}年　{validDate.month || '　　'}月　{validDate.day || '　　'}日（予定）まで
                </p>
              </div>

              {/* 5. 契約日 */}
              <div className="mb-4">
                <p className="font-semibold mb-2">5．契約日</p>
                <p className="ml-4">
                  売買契約締結日
                  {formData.contractDateTbd ? (
                    <>　　　　年　　　月　　　日（予定）<span className="ml-4">要相談</span></>
                  ) : (
                    <>{contDate.year || '　　　　'}年　{contDate.month || '　　'}月　{contDate.day || '　　'}日（予定）</>
                  )}
                </p>
              </div>

              {/* 6. その他条件 */}
              <div className="mb-4">
                <p className="font-semibold mb-2">6．その他条件</p>
                <p className="ml-4">手付金解除期限・・・契約後　{formData.earnestMoneyCancellationDays || '　　'}　日後まで。</p>
                <p className="ml-4">
                  引渡し時期・・・・・
                  {formData.deliveryDateTbd ? (
                    <>　　月　　日まで　<span>要相談</span></>
                  ) : (
                    <>{formatDateJP(formData.deliveryDate).month || '　　'}月　{formatDateJP(formData.deliveryDate).day || '　　'}日まで</>
                  )}
                </p>
                <p className="ml-4">その他・・・・・・・{formData.otherConditions || '　'}</p>
                {formData.paymentMethod === 'loan' && formData.hasLoanContingency && (
                  <p className="ml-4 mt-2 font-semibold">・融資特約を付帯します</p>
                )}
              </div>

              {/* 以上 */}
              <div className="text-right mt-8">
                <p>以上</p>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* 免責事項・注意事項 */}
        <div className="mt-8 bg-gray-50 rounded-xl p-6 print:hidden">
          <h3 className="text-sm font-bold text-gray-700 mb-4">免責事項</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="text-gray-400">1.</span>
              <span><strong>法的効力について</strong> - 本ツールで作成した書面は参考用であり、法的効力を保証するものではありません。</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400">2.</span>
              <span><strong>専門家への相談推奨</strong> - 重要な取引の際は不動産会社や弁護士にご相談ください。</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400">3.</span>
              <span><strong>書面の性質</strong> - 買付申込書は購入意思を示すものであり、売買契約とは異なります。</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400">4.</span>
              <span><strong>内容の確認</strong> - 出力内容に誤りがないか必ずご自身でご確認ください。</span>
            </li>
          </ul>
        </div>
      </main>

      <div className="print:hidden">
        <LandingFooter />
      </div>

      {/* 印刷用スタイル */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          html, body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden,
          header,
          nav,
          footer,
          .no-print,
          [class*="fixed"] {
            display: none !important;
            position: static !important;
          }
          * {
            position: static !important;
          }
        }
      `}</style>
    </div>
  );
}
