# 不動産情報ライブラリ API仕様書

## 概要
国土交通省が提供する不動産情報ライブラリAPIの技術仕様書です。不動産取引価格情報、地価情報、都市計画情報などの公的データにアクセスできます。

## 基本情報

### エンドポイント
- **ベースURL**: `https://www.reinfolib.mlit.go.jp/ex-api/external/`
- **認証方式**: APIキー（サブスクリプションキー）
- **データ形式**: JSON、GeoJSON、バイナリベクトルタイル（PBF）
- **座標系**: 世界測地系（JGD2011）、Web Mercator

### 認証
```http
Ocp-Apim-Subscription-Key: YOUR_API_KEY
Content-Type: application/json
Accept: application/json
```

## API一覧

### 1. 不動産取引価格情報API（XIT001）
不動産の実際の取引価格情報を取得します。

#### エンドポイント
```
GET /XIT001
```

#### パラメータ
| パラメータ | 必須 | 型 | 説明 | 例 |
|-----------|------|----|----|---|
| year | ✓ | string | 取引年（YYYY形式） | 2024 |
| quarter | - | string | 四半期（1-4） | 1 |
| area | - | string | 都道府県コード（2桁） | 13 |
| city | - | string | 市区町村コード（5桁） | 13101 |
| priceClassification | - | string | 価格区分（01:取引価格、02:成約価格） | 01 |

#### レスポンス例
```json
{
  "Version": "1.0",
  "Data": [
    {
      "Type": "宅地(土地と建物)",
      "Region": "住宅地",
      "MunicipalityCode": "13101",
      "Prefecture": "東京都",
      "Municipality": "千代田区",
      "DistrictName": "千代田",
      "TradePrice": 50000000,
      "PricePerUnit": 1500000,
      "UnitPrice": 450000,
      "Area": 111.11,
      "LandShape": "ほぼ整形",
      "Frontage": 6.0,
      "TotalFloorArea": 80.0,
      "BuildingYear": "平成15年",
      "Structure": "RC",
      "Use": "住宅",
      "Purpose": "住宅",
      "Direction": "南",
      "Classification": "市道",
      "Breadth": 4.0,
      "CityPlanning": "第一種住居地域",
      "CoverageRatio": 60,
      "FloorAreaRatio": 200,
      "Period": "2024年第1四半期",
      "Remarks": ""
    }
  ]
}
```

### 2. 市区町村情報取得API（XIT002）
指定した都道府県の市区町村一覧を取得します。

#### エンドポイント
```
GET /XIT002
```

#### パラメータ
| パラメータ | 必須 | 型 | 説明 | 例 |
|-----------|------|----|----|---|
| area | ✓ | string | 都道府県コード（2桁） | 13 |

#### レスポンス例
```json
{
  "Data": [
    {
      "MunicipalityCode": "13101",
      "Municipality": "千代田区"
    },
    {
      "MunicipalityCode": "13102", 
      "Municipality": "中央区"
    }
  ]
}
```

### 3. 地価公示・地価調査API（XPT002）
地価公示・地価調査の地点情報を地理空間データとして取得します。

#### エンドポイント
```
GET /XPT002
```

#### パラメータ
| パラメータ | 必須 | 型 | 説明 | 例 |
|-----------|------|----|----|---|
| response_format | ✓ | string | レスポンス形式（geojson/pbf） | geojson |
| z | ✓ | integer | ズームレベル（11-15） | 13 |
| x | ✓ | integer | タイルX座標 | 7281 |
| y | ✓ | integer | タイルY座標 | 3239 |
| year | ✓ | string | 対象年（YYYY形式） | 2024 |

### 4. 駅情報API（XST003）
駅の位置情報と基本データを取得します。

#### エンドポイント
```
GET /XST003
```

#### パラメータ
| パラメータ | 必須 | 型 | 説明 | 例 |
|-----------|------|----|----|---|
| response_format | ✓ | string | レスポンス形式（geojson/pbf） | geojson |
| z | ✓ | integer | ズームレベル（8-15） | 13 |
| x | ✓ | integer | タイルX座標 | 7281 |
| y | ✓ | integer | タイルY座標 | 3239 |

### 5. 都市計画情報API（XUP004）
都市計画区域、用途地域等の情報を取得します。

#### エンドポイント
```
GET /XUP004
```

#### パラメータ
| パラメータ | 必須 | 型 | 説明 | 例 |
|-----------|------|----|----|---|
| response_format | ✓ | string | レスポンス形式（geojson/pbf） | geojson |
| z | ✓ | integer | ズームレベル（11-15） | 13 |
| x | ✓ | integer | タイルX座標 | 7281 |
| y | ✓ | integer | タイルY座標 | 3239 |
| layer | - | string | レイヤー指定 | cityplan |

## エラーレスポンス

### HTTPステータスコード
| コード | 説明 |
|-------|------|
| 200 | 成功 |
| 400 | リクエストパラメータエラー |
| 401 | 認証エラー（APIキー不正） |
| 403 | アクセス権限なし |
| 404 | リソースが見つからない |
| 429 | レート制限超過 |
| 500 | サーバーエラー |

### エラーレスポンス例
```json
{
  "error": {
    "code": "400",
    "message": "パラメータが不正です",
    "details": "year parameter is required"
  }
}
```

## 利用制限

### レート制限
- 1分間に最大60リクエスト
- 1日に最大10,000リクエスト
- 大量データ取得時は適切な間隔での分割リクエストを推奨

### データ利用規約
- 個人・法人問わず無料で利用可能
- 商用利用可能
- データの再配布は出典明記が必要
- リアルタイムでのデータ更新はなし（四半期更新）

## 実装例

### JavaScript/TypeScript
```typescript
const API_KEY = 'your-api-key';
const BASE_URL = 'https://www.reinfolib.mlit.go.jp/ex-api/external';

async function getTransactionData(year: string, area?: string, city?: string) {
  const params = new URLSearchParams({
    year,
    priceClassification: '01'
  });
  
  if (area) params.append('area', area);
  if (city) params.append('city', city);
  
  const response = await fetch(`${BASE_URL}/XIT001?${params}`, {
    headers: {
      'Ocp-Apim-Subscription-Key': API_KEY,
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}
```

### Python
```python
import requests

API_KEY = 'your-api-key'
BASE_URL = 'https://www.reinfolib.mlit.go.jp/ex-api/external'

def get_transaction_data(year, area=None, city=None):
    url = f'{BASE_URL}/XIT001'
    headers = {
        'Ocp-Apim-Subscription-Key': API_KEY,
        'Accept': 'application/json'
    }
    params = {
        'year': year,
        'priceClassification': '01'
    }
    
    if area:
        params['area'] = area
    if city:
        params['city'] = city
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()
```

## 地域コード一覧

### 都道府県コード
| コード | 都道府県名 | コード | 都道府県名 |
|-------|-----------|-------|-----------|
| 01 | 北海道 | 25 | 滋賀県 |
| 02 | 青森県 | 26 | 京都府 |
| 03 | 岩手県 | 27 | 大阪府 |
| 04 | 宮城県 | 28 | 兵庫県 |
| 05 | 秋田県 | 29 | 奈良県 |
| 06 | 山形県 | 30 | 和歌山県 |
| 07 | 福島県 | 31 | 鳥取県 |
| 08 | 茨城県 | 32 | 島根県 |
| 09 | 栃木県 | 33 | 岡山県 |
| 10 | 群馬県 | 34 | 広島県 |
| 11 | 埼玉県 | 35 | 山口県 |
| 12 | 千葉県 | 36 | 徳島県 |
| 13 | 東京都 | 37 | 香川県 |
| 14 | 神奈川県 | 38 | 愛媛県 |
| 15 | 新潟県 | 39 | 高知県 |
| 16 | 富山県 | 40 | 福岡県 |
| 17 | 石川県 | 41 | 佐賀県 |
| 18 | 福井県 | 42 | 長崎県 |
| 19 | 山梨県 | 43 | 熊本県 |
| 20 | 長野県 | 44 | 大分県 |
| 21 | 岐阜県 | 45 | 宮崎県 |
| 22 | 静岡県 | 46 | 鹿児島県 |
| 23 | 愛知県 | 47 | 沖縄県 |
| 24 | 三重県 | | |

## サポート・問い合わせ
- 技術的な問い合わせ: 国土交通省不動産情報ライブラリ事務局
- API仕様変更通知: 公式サイトで告知
- メンテナンス情報: 事前に公式サイトで告知

## 更新履歴
- 2024年度: API v1.0 リリース
- データ更新頻度: 四半期ごと（3ヶ月に1回）
- API仕様変更: 後方互換性を保持しつつ機能追加

---
*このドキュメントは国土交通省不動産情報ライブラリAPIの公式マニュアルを基に作成されています。*
*最新の情報は公式サイト（https://www.reinfolib.mlit.go.jp/help/apiManual/）をご確認ください。*