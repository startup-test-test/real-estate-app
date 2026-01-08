# Python ML API設計書

## 1. エンドポイント概要

### POST /api/ml/analyze
機械学習を使用した包括的な市場分析

**リクエスト:**
```json
{
  "properties": [
    {
      "price": 25000000,       // 価格（円）
      "area": 65.5,            // 延床面積（㎡）
      "age": 10,               // 築年数
      "structure": "RC",       // 構造
      "station_distance": 800, // 駅距離（m）
      "land_area": 50.0,       // 土地面積（㎡）
      "floor": 5               // 階数（マンションの場合）
    }
  ],
  "analysis_type": "full"      // full, clustering, regression, anomaly
}
```

**レスポンス:**
```json
{
  "status": "success",
  "data": {
    "clustering": {
      "n_clusters": 3,
      "clusters": [
        {
          "cluster_id": 0,
          "name": "低価格帯",
          "size": 45,
          "percentage": 35,
          "centroid": {
            "price": 20000000,
            "area": 55.0,
            "age": 15
          },
          "characteristics": "築年数10年以上、面積60㎡未満"
        }
      ],
      "property_clusters": [0, 1, 2, 0, 1, ...]  // 各物件のクラスタID
    },
    "regression": {
      "model_type": "linear",
      "coefficients": {
        "area": 150000,        // 1㎡あたりの価格影響（円）
        "age": -500000,        // 築1年あたりの価格影響（円）
        "station_distance": -10000  // 駅から100mあたりの影響
      },
      "r_squared": 0.75,       // 決定係数
      "rmse": 3000000,         // 平均二乗誤差
      "predictions": [...]      // 予測価格
    },
    "anomaly_detection": {
      "method": "isolation_forest",
      "anomaly_score_threshold": -0.5,
      "anomalies": [
        {
          "index": 5,
          "score": -0.65,
          "reason": "価格が面積に対して異常に高い"
        }
      ],
      "normal_range": {
        "price": {"min": 15000000, "max": 45000000},
        "price_per_sqm": {"min": 250000, "max": 600000}
      }
    },
    "statistics": {
      "mean": 28500000,
      "median": 27000000,
      "std": 8500000,
      "q25": 22000000,
      "q75": 35000000,
      "iqr": 13000000,
      "correlation_matrix": {
        "price_area": 0.85,
        "price_age": -0.65,
        "area_age": -0.15
      }
    }
  }
}
```

## 2. 実装する機械学習アルゴリズム

### 2.1 K-meansクラスタリング
```python
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

def perform_clustering(properties_df, n_clusters=None):
    """
    物件データのクラスタリング

    Args:
        properties_df: pandas DataFrame with columns [price, area, age, etc.]
        n_clusters: クラスタ数（Noneの場合はエルボー法で自動決定）

    Returns:
        clustering_results: クラスタリング結果の辞書
    """
    # 特徴量の選択と正規化
    features = ['price', 'area', 'age', 'station_distance']
    X = properties_df[features]
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # 最適クラスタ数の決定（エルボー法）
    if n_clusters is None:
        n_clusters = determine_optimal_clusters(X_scaled)

    # K-means実行
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    labels = kmeans.fit_predict(X_scaled)

    return format_clustering_results(properties_df, labels, kmeans, scaler)
```

### 2.2 線形回帰 / Random Forest回帰
```python
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_score

def perform_regression(properties_df, model_type='linear'):
    """
    価格予測モデルの構築

    Args:
        properties_df: pandas DataFrame
        model_type: 'linear' or 'random_forest'

    Returns:
        regression_results: 回帰分析結果
    """
    # 特徴量とターゲットの分離
    feature_columns = ['area', 'age', 'station_distance']
    X = properties_df[feature_columns]
    y = properties_df['price']

    # モデルの選択
    if model_type == 'linear':
        model = LinearRegression()
    else:
        model = RandomForestRegressor(n_estimators=100, random_state=42)

    # モデルの訓練
    model.fit(X, y)

    # 交差検証
    cv_scores = cross_val_score(model, X, y, cv=5,
                                scoring='r2')

    return {
        'coefficients': extract_coefficients(model, feature_columns),
        'r_squared': model.score(X, y),
        'cv_score': cv_scores.mean(),
        'predictions': model.predict(X).tolist()
    }
```

### 2.3 異常検知（Isolation Forest）
```python
from sklearn.ensemble import IsolationForest

def detect_anomalies(properties_df):
    """
    異常物件の検出

    Args:
        properties_df: pandas DataFrame

    Returns:
        anomaly_results: 異常検知結果
    """
    # 価格/㎡を追加特徴量として使用
    properties_df['price_per_sqm'] = properties_df['price'] / properties_df['area']

    # 特徴量の選択
    features = ['price', 'area', 'age', 'price_per_sqm']
    X = properties_df[features]

    # Isolation Forest
    iso_forest = IsolationForest(contamination=0.1, random_state=42)
    anomaly_scores = iso_forest.fit_predict(X)
    anomaly_decision = iso_forest.decision_function(X)

    # 異常物件の詳細分析
    anomalies = []
    for idx, (score, decision) in enumerate(zip(anomaly_scores, anomaly_decision)):
        if score == -1:  # 異常と判定
            anomaly_reason = analyze_anomaly_reason(
                properties_df.iloc[idx],
                properties_df
            )
            anomalies.append({
                'index': idx,
                'score': float(decision),
                'reason': anomaly_reason
            })

    return {
        'method': 'isolation_forest',
        'anomalies': anomalies,
        'normal_range': calculate_normal_ranges(properties_df[anomaly_scores == 1])
    }
```

## 3. データ前処理

### 3.1 欠損値処理
```python
def preprocess_data(properties_data):
    """
    データの前処理
    """
    df = pd.DataFrame(properties_data)

    # 欠損値の補完
    df['station_distance'].fillna(df['station_distance'].median(), inplace=True)
    df['age'] = df['age'].fillna(0)  # 新築の場合

    # 外れ値の除去（IQR法）
    df = remove_outliers_iqr(df, ['price', 'area'])

    # 特徴量エンジニアリング
    df['price_per_sqm'] = df['price'] / df['area']
    df['total_area'] = df['area'] + df.get('land_area', 0)

    return df
```

### 3.2 特徴量の正規化
```python
def normalize_features(df, features):
    """
    特徴量の正規化（0-1スケーリングまたは標準化）
    """
    from sklearn.preprocessing import StandardScaler, MinMaxScaler

    scaler = StandardScaler()  # または MinMaxScaler()
    df_scaled = df.copy()
    df_scaled[features] = scaler.fit_transform(df[features])

    return df_scaled, scaler
```

## 4. エラーハンドリング

### 4.1 データ不足エラー
```python
class InsufficientDataError(Exception):
    """データ不足エラー"""
    pass

def validate_data_size(properties_data):
    if len(properties_data) < 5:
        raise InsufficientDataError(
            "分析には最低5件のデータが必要です"
        )

    if len(properties_data) < 20:
        warnings.warn(
            "データが20件未満のため、分析精度が低い可能性があります"
        )
```

### 4.2 モデル学習エラー
```python
def safe_model_fit(model, X, y):
    """
    安全なモデル学習
    """
    try:
        model.fit(X, y)
        return model
    except ValueError as e:
        if "NaN" in str(e):
            # NaN値の処理
            X_clean = X.fillna(X.median())
            y_clean = y.fillna(y.median())
            return model.fit(X_clean, y_clean)
        else:
            raise
```

## 5. パフォーマンス最適化

### 5.1 キャッシング
```python
from functools import lru_cache
import hashlib

@lru_cache(maxsize=100)
def cached_clustering(data_hash, n_clusters):
    """
    クラスタリング結果のキャッシュ
    """
    # キャッシュキーはデータのハッシュ値
    return perform_clustering_internal(data_hash, n_clusters)

def get_data_hash(properties_data):
    """
    データのハッシュ値を生成
    """
    data_str = json.dumps(properties_data, sort_keys=True)
    return hashlib.md5(data_str.encode()).hexdigest()
```

### 5.2 並列処理
```python
from concurrent.futures import ThreadPoolExecutor
import asyncio

async def parallel_analysis(properties_data):
    """
    複数の分析を並列実行
    """
    with ThreadPoolExecutor(max_workers=3) as executor:
        clustering_future = executor.submit(perform_clustering, properties_data)
        regression_future = executor.submit(perform_regression, properties_data)
        anomaly_future = executor.submit(detect_anomalies, properties_data)

        results = {
            'clustering': clustering_future.result(),
            'regression': regression_future.result(),
            'anomaly_detection': anomaly_future.result()
        }

    return results
```

## 6. セキュリティ考慮事項

### 6.1 入力検証
```python
def validate_input(properties_data):
    """
    入力データの検証
    """
    # 型チェック
    if not isinstance(properties_data, list):
        raise ValueError("properties_data must be a list")

    # 各物件データの検証
    for prop in properties_data:
        # 必須フィールドチェック
        required = ['price', 'area']
        for field in required:
            if field not in prop:
                raise ValueError(f"Missing required field: {field}")

        # 値の範囲チェック
        if prop['price'] <= 0 or prop['price'] > 10**10:
            raise ValueError("Invalid price value")

        if prop['area'] <= 0 or prop['area'] > 10000:
            raise ValueError("Invalid area value")
```

### 6.2 出力サニタイゼーション
```python
def sanitize_output(results):
    """
    出力データのサニタイゼーション
    """
    # 個人情報の除去
    if 'raw_data' in results:
        del results['raw_data']

    # 数値の丸め処理
    if 'regression' in results:
        results['regression']['r_squared'] = round(
            results['regression']['r_squared'], 3
        )

    return results
```

## 7. テスト戦略

### 7.1 単体テスト
```python
import pytest
import numpy as np

def test_clustering_basic():
    """クラスタリングの基本テスト"""
    test_data = [
        {'price': 20000000, 'area': 50, 'age': 10},
        {'price': 30000000, 'area': 70, 'age': 5},
        {'price': 40000000, 'area': 90, 'age': 0},
    ]

    result = perform_clustering(test_data, n_clusters=2)

    assert 'clusters' in result
    assert len(result['clusters']) == 2
    assert all('centroid' in c for c in result['clusters'])

def test_regression_accuracy():
    """回帰モデルの精度テスト"""
    # 線形関係のあるテストデータ生成
    np.random.seed(42)
    n_samples = 100
    area = np.random.uniform(30, 150, n_samples)
    age = np.random.uniform(0, 30, n_samples)
    price = 300000 * area - 500000 * age + np.random.normal(0, 1000000, n_samples)

    test_data = pd.DataFrame({
        'area': area,
        'age': age,
        'price': price
    })

    result = perform_regression(test_data)

    assert result['r_squared'] > 0.8  # 高い決定係数を期待
    assert abs(result['coefficients']['area'] - 300000) < 50000
    assert abs(result['coefficients']['age'] + 500000) < 100000
```

### 7.2 統合テスト
```python
def test_full_analysis_pipeline():
    """完全な分析パイプラインのテスト"""
    # 実際のAPIエンドポイントを呼び出し
    response = client.post('/api/ml/analyze', json={
        'properties': generate_test_properties(50),
        'analysis_type': 'full'
    })

    assert response.status_code == 200
    data = response.json()

    assert 'clustering' in data['data']
    assert 'regression' in data['data']
    assert 'anomaly_detection' in data['data']
    assert 'statistics' in data['data']
```

## 8. デプロイメント考慮事項

### 8.1 必要なパッケージ
```txt
# requirements.txt に追加
numpy==1.24.3
pandas==2.0.3
scikit-learn==1.3.0
scipy==1.11.1
```

### 8.2 メモリ要件
- 最小: 512MB RAM
- 推奨: 1GB RAM
- 大規模データ（1000件以上）: 2GB RAM

### 8.3 実行時間の目安
- 100件以下: 1秒以内
- 1000件: 3-5秒
- 10000件: 10-30秒

## 9. 今後の拡張可能性

### 9.1 高度なアルゴリズム
- XGBoost/LightGBMによる価格予測
- DBSCAN/階層的クラスタリング
- 時系列予測（ARIMA, Prophet）
- ニューラルネットワーク

### 9.2 追加機能
- リアルタイム分析
- バッチ処理対応
- 分析結果の可視化API
- 機械学習モデルの自動更新

### 9.3 統合
- Jupyter Notebookとの連携
- BIツールとの統合
- GraphQL API対応