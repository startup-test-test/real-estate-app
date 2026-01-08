
# 不動産情報ライブラリ API 仕様書

## 概要

国土交通省が提供する不動産情報ライブラリのWeb API。不動産取引価格、地価公示、都市計画情報、地理情報などを提供。

## API基本情報

- **提供元**: 国土交通省
- **プロトコル**: HTTPS
- **認証方式**: APIキー（Subscription Key）
- **レスポンス形式**: JSON, GeoJSON, バイナリベクタータイル

## 認証

### APIキーの取得
1. 不動産情報ライブラリに利用申請
2. APIキー（Subscription Key）を取得
3. リクエストヘッダーに設定

### ヘッダー設定
```
Ocp-Apim-Subscription-Key: YOUR_API_KEY
```

## 利用可能なAPI一覧

### 1. 不動産取引価格情報API
- **エンドポイント**: `/ex-api/external/XIT001`
- **説明**: 実際の不動産取引価格情報を取得
- **パラメータ**:
  - `year`: 取引年（例: 2015）
  - `area`: 都道府県コード（例: 13=東京都）
  - `quarter`: 四半期（1-4）

### 2. 地価公示・地価調査API
- **エンドポイント**: `/ex-api/external/XIT002`
- **説明**: 公示地価、基準地価の情報取得
- **パラメータ**:
  - `year`: 調査年
  - `area`: 都道府県コード

### 3. 都市計画決定GISデータAPI
- **座標系**: XYZタイル形式
- **ズームレベル**: 11-15推奨
- **形式**: GeoJSON, ベクタータイル

### 4. 施設情報API
- 学校情報
- 医療機関情報
- 福祉施設情報
- 文化施設情報

### 5. 人口・世帯数予測API
- 500mメッシュ単位の人口予測データ
- 世帯数予測データ

### 6. 災害リスク情報API
- 洪水浸水想定区域
- 土砂災害警戒区域
- 津波浸水想定区域

## リクエスト例

### 不動産取引価格の取得
```bash
curl -X GET "https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001?year=2023&area=13&quarter=1" \
  -H "Ocp-Apim-Subscription-Key: YOUR_API_KEY"
```

### レスポンス例
```json
{
  "Status": "OK",
  "Data": [
    {
      "Type": "宅地(土地と建物)",
      "Region": "住宅地",
      "MunicipalityCode": "13101",
      "Prefecture": "東京都",
      "Municipality": "千代田区",
      "DistrictName": "大手町",
      "TradePrice": "150000000",
      "PricePerUnit": "500000",
      "FloorPlan": "3LDK",
      "Area": "100",
      "UnitPrice": "1500000",
      "LandShape": "長方形",
      "Frontage": "10",
      "TotalFloorArea": "200",
      "BuildingYear": "2020",
      "Structure": "RC",
      "Use": "住宅",
      "Purpose": "住宅",
      "Direction": "南",
      "Classification": "区分所有",
      "CityPlanning": "商業地域",
      "CoverageRatio": "80",
      "FloorAreaRatio": "400",
      "Period": "2023年第1四半期"
    }
  ]
}
```

## パラメータ詳細

### 共通パラメータ
| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| response_format | string | × | レスポンス形式（json/geojson） |
| year | integer | ○ | 対象年 |
| area | string | ○ | 都道府県コード |

### タイル座標パラメータ
| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| z | integer | ○ | ズームレベル（11-15） |
| x | integer | ○ | X座標 |
| y | integer | ○ | Y座標 |

## 都道府県コード一覧（主要）
| コード | 都道府県名 |
|--------|-----------|
| 01 | 北海道 |
| 13 | 東京都 |
| 14 | 神奈川県 |
| 23 | 愛知県 |
| 27 | 大阪府 |
| 40 | 福岡県 |

## 制限事項

1. **APIキー必須**: 全てのAPIでAPIキーが必要
2. **レート制限**: 詳細は利用規約参照
3. **データ期間**: APIにより利用可能な年度が異なる
4. **ズームレベル**: 推奨は11-15（詳細度による）

## エラーレスポンス

```json
{
  "Status": "ERROR",
  "Error": {
    "Code": "401",
    "Message": "Unauthorized - Invalid API Key"
  }
}
```

## 実装上の注意点

1. **座標変換**: 緯度経度からXYZタイル座標への変換が必要
2. **データ量**: 大量データ取得時はページング処理推奨
3. **キャッシュ**: 同一データの繰り返し取得を避ける
4. **エラーハンドリング**: APIキー無効、データなしなどの処理

## Python実装例

```python
import requests
import os

class RealEstateAPI:
    def __init__(self):
        self.base_url = "https://www.reinfolib.mlit.go.jp/ex-api/external"
        self.api_key = os.getenv("REAL_ESTATE_API_KEY")
        self.headers = {
            "Ocp-Apim-Subscription-Key": self.api_key
        }
    
    def get_trade_prices(self, year, area, quarter=None):
        """不動産取引価格を取得"""
        endpoint = f"{self.base_url}/XIT001"
        params = {
            "year": year,
            "area": area
        }
        if quarter:
            params["quarter"] = quarter
            
        response = requests.get(endpoint, headers=self.headers, params=params)
        return response.json()
```

## 関連リンク

- [不動産情報ライブラリ](https://www.reinfolib.mlit.go.jp/)
- [API利用申請](https://www.reinfolib.mlit.go.jp/help/apiManual/)
- [利用規約](https://www.reinfolib.mlit.go.jp/help/terms/)

---

**最終更新**: 2024-06-19