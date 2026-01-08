# AI市場分析のロジックの整理

## 1. 概要

### 背景
- ChatGPT APIによる要約文生成は法的リスク（投資アドバイス、物件評価）があるため削除
- 統計分析・機械学習アルゴリズムを用いて「AI分析」として正当性のある実装に変更
- 市場全体の分析に特化（個別物件の購入価格評価は行わない）

### 目的
- 法的リスクを回避しながら「AI」と呼べる分析機能を提供
- ユーザーが理解しやすい形で市場データを可視化
- 統計的事実のみを提示（評価的な表現を避ける）

## 2. 仕様


### 2.1 分析対象データ
- **入力データ**: 検索条件に合致した物件データ（価格、面積、築年数、構造、最寄り駅など）
- **サンプル数**: 最小5件以上（統計的有意性のため）
- **データ形式**: JSON形式でフロントエンドから送信

### 2.2 分析内容

#### フェーズ1: 基本統計分析（フロントエンド実装）
1. **価格分布分析**
   - 平均値、中央値、標準偏差
   - 四分位範囲（IQR）による外れ値検出
   - ヒストグラム表示

2. **相関分析**
   - 面積と価格の相関係数
   - 築年数と価格の相関係数

3. **地域別集計**
   - 区市町村ごとの平均価格
   - 地域別物件数

#### フェーズ2: 機械学習分析（Python API実装）
1. **K-meansクラスタリング**
   - 価格帯を3-5グループに自動分類
   - 各グループの特徴抽出

2. **異常検知**
   - Isolation Forestによる価格異常物件の検出
   - 統計的に通常範囲外の物件を特定

3. **線形回帰分析**
   - 面積・築年数から価格を予測
   - 各要因の影響度を数値化

### 2.3 法的制約
- **使用禁止用語**: 割安、割高、買い時、推奨、お得、狙い目
- **使用可能表現**: 平均より〇%高い/低い、統計的に〇%の物件が該当、標準偏差〇以内
- **免責事項**: 「本分析は統計的な参考情報であり、投資判断の根拠とするものではありません」を必ず表示

## 3. 進め方

### フェーズ1: MVP実装（1-2日）
```
1. フロントエンド統計分析の実装
   - MarketAnalysis.tsxに統計計算関数追加
   - 基本的な統計指標の算出
   - UIコンポーネントの作成

2. 表示UIの改善
   - 統計結果の可視化（グラフ、表）
   - レスポンシブデザイン対応
```

### フェーズ2: Python API統合（3-4日）
```
1. Python環境セットアップ
   - requirements.txtにnumpy, scikit-learn追加
   - backend/property-api/app.pyにエンドポイント追加

2. 機械学習アルゴリズム実装
   - K-meansクラスタリング
   - 異常検知
   - 線形回帰

3. フロントエンドとの連携
   - API呼び出し処理
   - エラーハンドリング
   - ローディング状態管理
```

### フェーズ3: 高度な分析（オプション、5-7日）
```
1. 時系列分析
   - 価格トレンドの予測
   - 季節変動の検出

2. 自然言語処理
   - 物件特徴の自動分類
   - キーワード抽出
```

## 4. ロジック詳細

### 4.1 K-meansクラスタリング
```python
def kmeans_clustering(properties_data):
    """
    物件を価格帯でグループ分け

    Input:
    - properties_data: [{price, area, age}, ...]

    Output:
    - clusters: [
        {
            "group_name": "グループA",
            "avg_price": 2500,
            "count": 5,
            "characteristics": "平均面積60㎡、築年数15年"
        },
        ...
    ]
    """
    from sklearn.cluster import KMeans

    # 特徴量の正規化
    features = normalize_features(properties_data)

    # クラスタ数の自動決定（エルボー法）
    n_clusters = determine_optimal_clusters(features)

    # クラスタリング実行
    kmeans = KMeans(n_clusters=n_clusters)
    labels = kmeans.fit_predict(features)

    return format_cluster_results(properties_data, labels)
```

### 4.2 異常検知（IQR法）
```javascript
function detectAnomalies(prices) {
    // 四分位数の計算
    const q1 = quantile(prices, 0.25);
    const q3 = quantile(prices, 0.75);
    const iqr = q3 - q1;

    // 外れ値の閾値
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    // 異常値の検出
    const anomalies = prices.filter(p => p < lowerBound || p > upperBound);

    return {
        normalRange: { min: lowerBound, max: upperBound },
        anomalyCount: anomalies.length,
        anomalyPercentage: (anomalies.length / prices.length) * 100
    };
}
```

### 4.3 線形回帰分析
```python
def linear_regression_analysis(properties_data):
    """
    面積と築年数から価格を予測するモデル

    Output:
    - coefficients: {
        "area_impact": 15000,  # 1㎡あたりの価格影響（円）
        "age_impact": -50000,  # 築1年あたりの価格影響（円）
        "r_squared": 0.75      # 決定係数
    }
    """
    from sklearn.linear_model import LinearRegression

    X = [[p['area'], p['age']] for p in properties_data]
    y = [p['price'] for p in properties_data]

    model = LinearRegression()
    model.fit(X, y)

    return {
        "area_impact": model.coef_[0],
        "age_impact": model.coef_[1],
        
        "r_squared": model.score(X, y)
    }
```
## 5. UI/UX設計

### 5.1 レイアウト構成
```
┌─────────────────────────────────────┐
│ AI市場分析                          │
│ 分析サンプル数: 14件                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📊 価格分布                         │
│ ・平均: 2,850万円                   │
│ ・中央値: 2,700万円                 │
│ ・標準偏差: 450万円                 │
│ [ヒストグラムグラフ]                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🔍 価格グループ分析                 │
│ グループA (5件): 平均2,100万円      │
│   特徴: 面積45㎡、築20年            │
│ グループB (6件): 平均2,800万円      │
│   特徴: 面積65㎡、築10年            │
│ グループC (3件): 平均3,800万円      │
│   特徴: 面積85㎡、築5年             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📈 要因分析                         │
│ ・面積1㎡増加: +15,000円            │
│ ・築年数1年増加: -50,000円          │
│ ・予測精度: 75%                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ⚠️ 統計的外れ値                    │
│ 通常範囲: 2,000万円〜3,500万円      │
│ 範囲外物件: 2件 (14%)               │
└─────────────────────────────────────┘
```

### 5.2 表示コンポーネント

#### StatisticsCard（統計カード）
```tsx
interface StatisticsCardProps {
  title: string;
  icon: string;
  metrics: Array<{
    label: string;
    value: string | number;
    unit?: string;
  }>;
  chart?: ReactNode;
}
```

#### ClusterCard（クラスタ分析カード）
```tsx
interface ClusterCardProps {
  clusters: Array<{
    name: string;
    count: number;
    avgPrice: number;
    characteristics: string;
  }>;
}
```

### 5.3 ユーザー体験の流れ
1. 物件検索実行
2. 「AI分析」ボタン表示（5件以上の場合のみ有効）
3. 分析実行中はローディング表示
4. 結果を段階的に表示（アニメーション付き）
5. 各カードは展開/折りたたみ可能

## 6. API仕様

### 6.1 エンドポイント

#### POST /api/ml/simple-analysis
**リクエスト:**
```json
{
  "properties": [
    {
      "price": 25000000,
      "area": 65.5,
      "age": 10,
      "structure": "RC",
      "station_distance": 8
    }
  ]
}
```

**レスポンス:**
```json
{
  "clusters": [...],
  "anomalies": {...},
  "regression": {...},
  "statistics": {...}
}
```

### 6.2 エラーハンドリング
- サンプル数不足: 400 Bad Request
- 計算エラー: 500 Internal Server Error
- タイムアウト: 504 Gateway Timeout（10秒）

## 7. テスト計画

### 7.1 単体テスト
- 統計計算関数の正確性
- クラスタリングアルゴリズムの動作
- エラーケースの処理

### 7.2 統合テスト
- API通信の確認
- UIレンダリングの確認
- パフォーマンステスト（100件データ）

### 7.3 ユーザビリティテスト
- 分析結果の理解度調査
- UIの使いやすさ評価
- 法的表現のレビュー

## 8. 今後の拡張案

### 8.1 短期（1-2ヶ月）
- グラフの種類追加（散布図、箱ひげ図）
- 分析結果のPDFエクスポート
- 分析履歴の保存

### 8.2 中期（3-6ヶ月）
- 時系列分析の追加
- 競合物件の自動抽出
- カスタマイズ可能な分析パラメータ

### 8.3 長期（6ヶ月以上）
- リアルタイム市場データ連携
- AIによる市場レポート生成（法的レビュー後）
- 機械学習モデルの継続的改善

## 9. 注意事項

### 9.1 法的コンプライアンス
- 金融商品取引法、宅地建物取引業法を遵守
- 投資アドバイスと解釈される表現を避ける
- 免責事項を必ず表示

### 9.2 技術的制約
- 最小サンプル数: 5件（統計的有意性）
- 処理時間: 10秒以内
- メモリ使用量: 500MB以下

### 9.3 データプライバシー
- 個人情報を含まないデータのみ分析
- 分析結果のキャッシュは24時間で削除
- ログには統計情報のみ記録

## 10. 実装チェックリスト

### フェーズ1（MVP）
- [ ] 統計計算関数の実装
- [ ] UIコンポーネントの作成
- [ ] 基本的なエラーハンドリング
- [ ] レスポンシブデザイン対応
- [ ] 免責事項の表示

### フェーズ2（Python API）
- [ ] requirements.txt更新
- [ ] APIエンドポイント実装
- [ ] K-meansクラスタリング
- [ ] 異常検知アルゴリズム
- [ ] 線形回帰分析
- [ ] API連携処理
- [ ] ローディング状態管理

### フェーズ3（品質向上）
- [ ] 単体テスト作成
- [ ] 統合テスト実施
- [ ] パフォーマンス最適化
- [ ] ドキュメント整備
- [ ] 法的レビュー完了
