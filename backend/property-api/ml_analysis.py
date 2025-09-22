"""
機械学習による不動産市場分析モジュール
"""

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import IsolationForest
from sklearn.model_selection import cross_val_score
import warnings
warnings.filterwarnings('ignore')


class PropertyMLAnalyzer:
    """不動産データの機械学習分析クラス"""

    def __init__(self):
        self.scaler = StandardScaler()

    def analyze(self, properties_data, analysis_type='full'):
        """
        包括的な機械学習分析を実行

        Args:
            properties_data: 物件データのリスト
            analysis_type: 'full', 'clustering', 'regression', 'anomaly'

        Returns:
            分析結果の辞書
        """
        # データ検証
        if not properties_data or len(properties_data) < 5:
            return {
                'status': 'error',
                'message': '分析には最低5件のデータが必要です'
            }

        # DataFrameに変換
        df = self._prepare_dataframe(properties_data)

        results = {
            'status': 'success',
            'data': {}
        }

        # 基本統計
        results['data']['statistics'] = self._calculate_statistics(df)

        # 各分析の実行
        if analysis_type in ['full', 'clustering']:
            results['data']['clustering'] = self._perform_clustering(df)

        if analysis_type in ['full', 'regression']:
            results['data']['regression'] = self._perform_regression(df)

        if analysis_type in ['full', 'anomaly']:
            results['data']['anomaly_detection'] = self._detect_anomalies(df)

        return results

    def _prepare_dataframe(self, properties_data):
        """データの前処理とDataFrame化"""
        df = pd.DataFrame(properties_data)

        # カラム名の統一
        column_mapping = {
            '取引価格（万円）': 'price_man',
            '取引価格': 'price',
            '延床面積（㎡）': 'area',
            '延床面積': 'area',
            'building_area': 'area',  # フロントエンドからの field 名
            '建築年': 'built_year',
            'built_year': 'built_year',  # フロントエンドからの field 名
            '築年数': 'age'
        }

        for old_col, new_col in column_mapping.items():
            if old_col in df.columns:
                df[new_col] = df[old_col]

        # 価格を万円単位に統一
        if 'price' in df.columns and 'price_man' not in df.columns:
            df['price_man'] = df['price'] / 10000
        elif 'price_man' not in df.columns:
            df['price_man'] = 0

        # 築年数の計算
        if 'built_year' in df.columns and 'age' not in df.columns:
            current_year = pd.Timestamp.now().year
            df['age'] = current_year - df['built_year']

        # 駅距離のデフォルト値
        if 'station_distance' not in df.columns:
            df['station_distance'] = 800  # デフォルト800m

        # 欠損値の補完
        if 'area' in df.columns:
            df['area'] = df['area'].fillna(df['area'].median() if not df['area'].empty else 60)
        else:
            df['area'] = 60  # デフォルト値

        if 'age' in df.columns:
            df['age'] = df['age'].fillna(df['age'].median() if not df['age'].empty else 10)
        else:
            df['age'] = 10  # デフォルト値

        df['station_distance'] = df['station_distance'].fillna(800)

        # 価格/㎡を計算
        if df['area'].notna().any() and (df['area'] > 0).any():
            df['price_per_sqm'] = df['price_man'] * 10000 / df['area']
        else:
            df['price_per_sqm'] = df['price_man'] * 10000 / 60  # デフォルト面積で計算

        return df

    def _calculate_statistics(self, df):
        """基本統計量の計算"""
        price_data = df['price_man'].values

        return {
            'count': len(df),
            'mean': float(np.mean(price_data)),
            'median': float(np.median(price_data)),
            'std': float(np.std(price_data)),
            'q25': float(np.percentile(price_data, 25)),
            'q75': float(np.percentile(price_data, 75)),
            'min': float(np.min(price_data)),
            'max': float(np.max(price_data)),
            'price_per_sqm_avg': float(df['price_per_sqm'].mean())
        }

    def _perform_clustering(self, df):
        """K-meansクラスタリング"""
        # 特徴量の選択
        feature_cols = ['price_man', 'area', 'age']
        X = df[feature_cols].values

        # データが少ない場合のクラスタ数調整
        n_samples = len(df)
        if n_samples < 10:
            n_clusters = min(2, n_samples)
        elif n_samples < 30:
            n_clusters = 3
        else:
            n_clusters = min(4, n_samples // 10)

        # 正規化
        X_scaled = self.scaler.fit_transform(X)

        # K-means実行
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X_scaled)

        # クラスタごとの統計
        clusters = []
        for i in range(n_clusters):
            cluster_mask = labels == i
            cluster_df = df[cluster_mask]

            # クラスタの特徴を決定
            avg_price = cluster_df['price_man'].mean()
            avg_area = cluster_df['area'].mean()
            avg_age = cluster_df['age'].mean()

            # 名前の決定（価格ベース）
            all_prices = df['price_man'].values
            if avg_price <= np.percentile(all_prices, 33):
                name = "低価格帯"
            elif avg_price <= np.percentile(all_prices, 67):
                name = "中価格帯"
            else:
                name = "高価格帯"

            clusters.append({
                'cluster_id': int(i),
                'name': name,
                'size': int(cluster_mask.sum()),
                'percentage': round(100 * cluster_mask.sum() / len(df), 1),
                'avg_price': round(float(avg_price), 0),
                'avg_area': round(float(avg_area), 1),
                'avg_age': round(float(avg_age), 1),
                'characteristics': f"平均{round(avg_area)}㎡、築{round(avg_age)}年"
            })

        return {
            'n_clusters': n_clusters,
            'clusters': sorted(clusters, key=lambda x: x['avg_price'])
        }

    def _perform_regression(self, df):
        """線形回帰分析"""
        # 特徴量とターゲット
        feature_cols = ['area', 'age', 'station_distance']
        available_features = [col for col in feature_cols if col in df.columns]

        if len(available_features) < 2:
            return {
                'error': 'データが不足しています'
            }

        X = df[available_features].values
        y = df['price_man'].values * 10000  # 円単位に変換

        # モデルの訓練
        model = LinearRegression()
        model.fit(X, y)

        # 予測値
        predictions = model.predict(X)

        # 決定係数
        r2_score = model.score(X, y)

        # 係数の解釈
        coefficients = {}
        for i, feature in enumerate(available_features):
            coef = model.coef_[i]
            if feature == 'area':
                coefficients['area'] = round(float(coef), -3)  # 1㎡あたりの影響（円）
            elif feature == 'age':
                coefficients['age'] = round(float(coef), -3)  # 築1年あたりの影響（円）
            elif feature == 'station_distance':
                coefficients['station_distance'] = round(float(coef / 100), -2) * 100  # 100mあたりの影響

        # RMSE（平均二乗誤差）
        rmse = np.sqrt(np.mean((y - predictions) ** 2))

        return {
            'model_type': 'linear',
            'features': available_features,
            'coefficients': coefficients,
            'r_squared': round(float(r2_score), 3),
            'rmse': round(float(rmse), -4),  # 万円単位で丸める
            'intercept': round(float(model.intercept_), -4)
        }

    def _detect_anomalies(self, df):
        """異常検知（Isolation Forest）"""
        # 特徴量の選択
        feature_cols = ['price_man', 'area', 'price_per_sqm']
        X = df[feature_cols].values

        # サンプル数に応じてcontaminationを調整
        n_samples = len(df)
        if n_samples < 10:
            contamination = 0.1  # 10%を異常とする
        elif n_samples < 50:
            contamination = 0.15
        else:
            contamination = 0.1

        # Isolation Forest
        iso_forest = IsolationForest(
            contamination=contamination,
            random_state=42
        )

        # 異常スコアの計算
        anomaly_labels = iso_forest.fit_predict(X)
        anomaly_scores = iso_forest.decision_function(X)

        # 異常物件の詳細
        anomalies = []
        for idx in range(len(df)):
            if anomaly_labels[idx] == -1:  # 異常と判定
                row = df.iloc[idx]

                # 異常の理由を推定
                price_z = (row['price_man'] - df['price_man'].mean()) / df['price_man'].std()
                area_z = (row['area'] - df['area'].mean()) / df['area'].std()
                price_per_sqm_z = (row['price_per_sqm'] - df['price_per_sqm'].mean()) / df['price_per_sqm'].std()

                reasons = []
                if abs(price_z) > 2:
                    reasons.append(f"価格が{'高い' if price_z > 0 else '低い'}")
                if abs(area_z) > 2:
                    reasons.append(f"面積が{'広い' if area_z > 0 else '狭い'}")
                if abs(price_per_sqm_z) > 2:
                    reasons.append(f"㎡単価が{'高い' if price_per_sqm_z > 0 else '低い'}")

                if not reasons:
                    reasons.append("複合的な要因")

                anomalies.append({
                    'index': int(idx),
                    'score': round(float(anomaly_scores[idx]), 3),
                    'price': round(float(row['price_man']), 0),
                    'area': round(float(row['area']), 1),
                    'reason': '、'.join(reasons)
                })

        # 正常範囲の計算
        normal_mask = anomaly_labels == 1
        normal_df = df[normal_mask]

        if len(normal_df) > 0:
            normal_range = {
                'price': {
                    'min': round(float(normal_df['price_man'].min()), 0),
                    'max': round(float(normal_df['price_man'].max()), 0)
                },
                'price_per_sqm': {
                    'min': round(float(normal_df['price_per_sqm'].min()), -3),
                    'max': round(float(normal_df['price_per_sqm'].max()), -3)
                }
            }
        else:
            normal_range = {
                'price': {'min': 0, 'max': 0},
                'price_per_sqm': {'min': 0, 'max': 0}
            }

        return {
            'method': 'isolation_forest',
            'total_samples': len(df),
            'anomaly_count': len(anomalies),
            'anomaly_rate': round(100 * len(anomalies) / len(df), 1),
            'anomalies': anomalies,
            'normal_range': normal_range
        }


# シンプルな分析関数（互換性のため）
def simple_ml_analysis(properties_data):
    """シンプルなML分析API"""
    analyzer = PropertyMLAnalyzer()
    return analyzer.analyze(properties_data, analysis_type='full')