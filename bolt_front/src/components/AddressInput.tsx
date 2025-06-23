// 住所入力コンポーネント

import React, { useState } from 'react';
import { MapPin, Search, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import { getAddressFromZipcode, validateAddress } from '../utils/addressUtils';

interface AddressInputProps {
  value: {
    postalCode: string;
    prefecture: string;
    city: string;
    district: string;
    chome: string;
    banchi: string;
    go: string;
  };
  onChange: (field: string, value: string) => void;
  required?: string[]; // 必須フィールドの配列
  className?: string;
}

const AddressInput: React.FC<AddressInputProps> = ({
  value,
  onChange,
  required = ['prefecture', 'city'],
  className = ''
}) => {
  const [isZipcodeLoading, setIsZipcodeLoading] = useState(false);
  const [zipcodeError, setZipcodeError] = useState<string | null>(null);
  const [zipcodeSuccess, setZipcodeSuccess] = useState(false);

  const prefectures = [
    '都道府県を選択',
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];

  const handleZipcodeSearch = async () => {
    if (!value.postalCode) {
      setZipcodeError('郵便番号を入力してください');
      return;
    }

    setIsZipcodeLoading(true);
    setZipcodeError(null);
    setZipcodeSuccess(false);

    try {
      const addressData = await getAddressFromZipcode(value.postalCode);
      
      // 住所情報を自動入力
      onChange('prefecture', addressData.prefecture);
      onChange('city', addressData.city);
      onChange('district', addressData.district);
      
      setZipcodeSuccess(true);
      setTimeout(() => setZipcodeSuccess(false), 3000);

    } catch (error) {
      setZipcodeError(error instanceof Error ? error.message : '住所の取得に失敗しました');
    } finally {
      setIsZipcodeLoading(false);
    }
  };

  const isRequired = (field: string) => required.includes(field);

  const validation = validateAddress({
    prefecture: value.prefecture,
    city: value.city,
    district: value.district
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 郵便番号 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          郵便番号
          {isRequired('postalCode') && (
            <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded ml-2">必須</span>
          )}
        </label>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="例: 1410031"
              value={value.postalCode}
              onChange={(e) => onChange('postalCode', e.target.value)}
              className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={8}
            />
            {zipcodeSuccess && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          <button
            type="button"
            onClick={handleZipcodeSearch}
            disabled={isZipcodeLoading || !value.postalCode}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              isZipcodeLoading || !value.postalCode
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'text-blue-600 border-blue-200 hover:bg-blue-50'
            }`}
          >
            {isZipcodeLoading ? (
              <div className="flex items-center">
                <Loader className="animate-spin h-4 w-4 mr-2" />
                検索中...
              </div>
            ) : (
              <div className="flex items-center">
                <Search className="h-4 w-4 mr-2" />
                住所を自動入力
              </div>
            )}
          </button>
        </div>
        
        {zipcodeError && (
          <div className="mt-2 flex items-center text-red-600 text-sm">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {zipcodeError}
          </div>
        )}
        
        {zipcodeSuccess && (
          <div className="mt-2 flex items-center text-green-600 text-sm">
            <CheckCircle className="h-4 w-4 mr-1" />
            住所を自動入力しました
          </div>
        )}
      </div>

      {/* 都道府県・市区町村 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            都道府県
            {isRequired('prefecture') && (
              <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded ml-2">必須</span>
            )}
          </label>
          <select
            value={value.prefecture}
            onChange={(e) => onChange('prefecture', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {prefectures.map((pref, index) => (
              <option key={index} value={index === 0 ? '' : pref}>
                {pref}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            市区町村
            {isRequired('city') && (
              <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded ml-2">必須</span>
            )}
          </label>
          <input
            type="text"
            placeholder="例: 品川区"
            value={value.city}
            onChange={(e) => onChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 町域・丁目・番地・号 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            町域
            {isRequired('district') && (
              <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded ml-2">必須</span>
            )}
          </label>
          <input
            type="text"
            placeholder="例: 西五反田"
            value={value.district}
            onChange={(e) => onChange('district', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">丁目</label>
          <input
            type="text"
            placeholder="例: 2"
            value={value.chome}
            onChange={(e) => onChange('chome', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">番地</label>
          <input
            type="text"
            placeholder="例: 15"
            value={value.banchi}
            onChange={(e) => onChange('banchi', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">号</label>
          <input
            type="text"
            placeholder="例: 3"
            value={value.go}
            onChange={(e) => onChange('go', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* バリデーションエラー表示 */}
      {!validation.isValid && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-800 text-sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="font-medium">入力エラー</span>
          </div>
          <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 入力完了表示 */}
      {validation.isValid && value.prefecture && value.city && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-green-800 text-sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="font-medium">住所入力完了</span>
          </div>
          <div className="mt-1 text-sm text-green-600">
            {value.prefecture}{value.city}{value.district}{value.chome ? `${value.chome}丁目` : ''}{value.banchi ? `${value.banchi}番地` : ''}{value.go ? `${value.go}号` : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressInput;