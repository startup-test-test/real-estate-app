# AI市場分析の計算ロジック

## 概要
このドキュメントは、不動産市場分析機能における価格分析とトレンド計算のロジックを説明します。
Streamlit版とReactフロントエンド版の両方で同じロジックを実装しています。

## 1. データ取得期間

### 期間設定
- **取得期間**: 直近4年分（現在年 - 3年 から 現在年まで）
- **例**: 2024年時点では、2021年～2024年のデータを取得
- **四半期**: 各年の第1～第4四半期すべてを取得

```python
# Streamlit版
current_year = datetime.now().year
from_year = current_year - 3  # 3年前から
to_year = current_year  # 現在年まで

# React版（TypeScript）
const currentYear = Math.min(new Date().getFullYear(), 2024);
const fromYear = currentYear - 3;
const toYear = currentYear;
```

## 2. 検索パラメータ

### 必須パラメータ
- **都道府県コード**: 例：「11」（埼玉県）
- **市区町村コード**: 例：「11103」（さいたま市大宮区）
- **地区名**: 例：「天沼町」
- **物件種別**: 「マンション」 / 「戸建」 / 「土地」

### オプションパラメータ
- **最小面積・最大面積**: 延床面積のフィルタ（㎡）
- **最小築年・最大築年**: 建築年のフィルタ

### フィルタ条件（現在は無効化中）
```javascript
// データが少ない地域への対応として、フィルタは一時的に無効化
// if (targetArea > 0) {
//   params.min_area = targetArea - areaTolerance;  // デフォルト: ±10㎡
//   params.max_area = targetArea + areaTolerance;
// }
// if (targetYear > 0) {
//   params.min_year = targetYear - yearTolerance;  // デフォルト: ±5年
//   params.max_year = targetYear + yearTolerance;
// }
```

## 3. 価格統計の計算

### 年ごとのデータ集計
各年のデータを集計し、以下の統計値を計算：

```javascript
// 価格データの抽出
const prices = yearData.map(item => item.price || item.取引価格 || 0);
const areas = yearData.map(item => item.building_area || item.面積 || 0);

// 統計値の計算
const totalPrice = prices.reduce((sum, price) => sum + price, 0);
const avgPrice = totalPrice / prices.length;
const avgPricePerSqm = totalArea > 0 ? totalPrice / totalArea : 0;

// 四分位数の計算
const q25 = getPercentile(prices, 0.25);  // 第1四分位数（25パーセンタイル）
const q50 = getPercentile(prices, 0.50);  // 中央値（50パーセンタイル）
const q75 = getPercentile(prices, 0.75);  // 第3四分位数（75パーセンタイル）
```

### パーセンタイル計算関数
```javascript
const getPercentile = (arr: number[], percentile: number): number => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * percentile) - 1;
  return sorted[Math.max(0, index)];
};
```

## 4. AI価格トレンド分析

### 線形回帰による価格トレンド計算

1. **年ごとの平均価格から線形回帰を計算**
```javascript
// データ準備
const sortedResults = [...yearlyResults].sort((a, b) => a.year - b.year);
const years = sortedResults.map(y => y.year);
const prices = sortedResults.map(y => y.averagePrice);

// 線形回帰の計算
const n = years.length;
const sumX = years.reduce((a, b) => a + b, 0);
const sumY = prices.reduce((a, b) => a + b, 0);
const sumXY = years.reduce((a, b, i) => a + b * prices[i], 0);
const sumX2 = years.reduce((a, b) => a + b * b, 0);

const trendSlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
```

2. **年次成長率の計算**
```javascript
const basePrice = prices[0];  // 最も古い年の価格
if (basePrice > 0) {
  priceChange = (trendSlope / basePrice) * 100;  // パーセンテージに変換
}
```

3. **統計的有意性のチェック**
```javascript
// 相関係数の計算
const meanX = sumX / n;
const meanY = sumY / n;
const ssX = years.reduce((a, x) => a + (x - meanX) ** 2, 0);
const ssY = prices.reduce((a, y) => a + (y - meanY) ** 2, 0);
const ssXY = years.reduce((a, x, i) => a + (x - meanX) * (prices[i] - meanY), 0);
const r = ssXY / Math.sqrt(ssX * ssY);  // 相関係数

// t統計量の計算
const tStat = Math.abs(r) * Math.sqrt((n - 2) / (1 - r * r));

// p値の推定（簡易版）
// t値が2.0以上なら統計的に有意（p < 0.05）
pValue = tStat >= 2.0 ? 0.01 : 0.5;

// 統計的に有意でない場合は0%とする
if (pValue >= 0.05) {
  priceChange = 0;
}
```

### トレンド表示ロジック
- **p値 < 0.05（統計的に有意）**:
  - 正の変化: 「📈 +X.X%/年」 「明確な上昇傾向」
  - 負の変化: 「📉 -X.X%/年」 「明確な下降傾向」
- **p値 ≥ 0.05（統計的に有意でない）**:
  - 「→ ±0%/年」 「価格変動なし」

## 5. クラスタリング分析

### 価格帯による物件分類
```javascript
const performSimpleClustering = (properties: any[]) => {
  const prices = properties.map(p => p.price || 0).filter(p => p > 0);

  if (prices.length === 0) return { clusters: [] };

  prices.sort((a, b) => a - b);

  // 3つのクラスターに分割
  const tercileSize = Math.floor(prices.length / 3);

  return {
    clusters: [
      {
        name: '低価格帯',
        count: tercileSize,
        avgPrice: /* 低価格帯の平均 */,
        priceRange: { min: prices[0], max: prices[tercileSize - 1] }
      },
      // 中価格帯、高価格帯も同様
    ]
  };
};
```

## 6. グラフ表示（Plotly.js）

### 価格と面積の散布図
```javascript
{
  x: allProperties.map(p => p.building_area || p.面積 || 0),
  y: allProperties.map(p => (p.price || p.取引価格 || 0) / 10000),
  mode: 'markers',
  type: 'scatter',
  marker: {
    size: 8,
    color: 'rgba(66, 153, 225, 0.6)',
    line: { color: 'rgba(66, 153, 225, 1)', width: 1 }
  }
}
```

### 延床面積別価格分布のヒートマップ
```javascript
{
  z: heatmapData,
  x: areaLabels,  // ['50㎡未満', '50-70㎡', ...]
  y: priceLabels, // ['3000万円未満', '3000-4000万円', ...]
  type: 'heatmap',
  colorscale: [
    [0, '#ffffff'],
    [0.2, '#c6dbef'],
    [0.4, '#9ecae1'],
    [0.6, '#6baed6'],
    [0.8, '#3182bd'],
    [1, '#08519c']
  ]
}
```

## 7. 公示地価データの取得

### APIエンドポイント
- `/api/land-prices`
- パラメータ：都道府県名、市区町村名、地区名、年度

### データ形式
```javascript
{
  address: "天沼町１丁目４０８番２",
  price_per_sqm: 255000,      // 円/㎡
  price_per_tsubo: 842973,     // 円/坪
  change_rate: "2.8",          // 前年比（%）
  station: "大宮",
  station_distance: "1700",    // メートル
  use_district: "第１種住居地域"
}
```

## 8. エラーハンドリング

### データ不足時の処理
- 年次データが1年分のみ: トレンド計算不可
- データが0件: 「該当するデータが見つかりませんでした」を表示
- 統計的に有意でない: トレンドを±0%と表示

### デバッグ情報
コンソールに以下の情報を出力：
- 各年のデータ件数と価格レンジ
- 線形回帰の計算結果（傾き、相関係数、p値）
- API呼び出しパラメータとレスポンス

## 9. 今後の改善点

1. **フィルタ条件の最適化**
   - データ量に応じて動的にフィルタ範囲を調整
   - 地域特性に応じたフィルタ基準の設定

2. **統計分析の強化**
   - より精密なp値計算（t分布の正確な計算）
   - 季節性を考慮した時系列分析

3. **パフォーマンス最適化**
   - データキャッシュの実装
   - 並列API呼び出しの最適化

## 更新履歴

- 2024-09-20: 初版作成
- データ取得期間を3年から4年に変更
- 統計的有意性チェックを追加
- フィルタ条件を一時的に無効化（データ不足対応）