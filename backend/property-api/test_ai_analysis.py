#!/usr/bin/env python3
"""
AI市場分析機能のテストスクリプト
"""
import requests
import json
import os

# APIエンドポイント
API_URL = "http://localhost:8000/api/market-analysis-summary"

# テストデータ
test_data = {
    "market_data": {
        "prefecture": "東京都",
        "city": "世田谷区",
        "district": "三軒茶屋",
        "averagePrice": 5800,
        "totalTransactions": 45,
        "q25": 4200,
        "q50": 5500,
        "q75": 7200,
        "priceChange": 5.2
    },
    "similar_properties": [
        {
            "取引価格（万円）": 5200,
            "延べ床面積（㎡）": 95,
            "建築年": 2018,
            "取引時期": "2024年第1四半期"
        },
        {
            "取引価格（万円）": 6300,
            "延べ床面積（㎡）": 110,
            "建築年": 2020,
            "取引時期": "2024年第1四半期"
        }
    ],
    "land_price_data": [
        {
            "address": "世田谷区太子堂",
            "price_per_sqm": 1250000,
            "year": 2024
        }
    ],
    "target_area": 100,
    "target_year": 2018
}

def test_ai_analysis():
    """AI分析APIをテスト"""

    print("=" * 60)
    print("AI市場分析APIテスト")
    print("=" * 60)

    # APIキーの確認
    api_key = os.environ.get('CHATGPT_REAL_ESTATE_250922')
    if api_key:
        print(f"✅ APIキー設定済み: {api_key[:7]}...")
    else:
        print("⚠️ APIキーが設定されていません")
        print("export CHATGPT_REAL_ESTATE_250922=your-api-key を実行してください")

    print("\n📤 リクエスト送信中...")
    print(f"エンドポイント: {API_URL}")

    try:
        # POSTリクエスト送信
        response = requests.post(
            API_URL,
            json=test_data,
            headers={"Content-Type": "application/json"}
        )

        print(f"\n📥 ステータスコード: {response.status_code}")

        if response.status_code == 200:
            result = response.json()

            print("\n✅ 分析成功！")
            print("\n【サマリー】")
            print("-" * 40)
            print(result.get('summary', 'サマリーなし'))

            print("\n【主要な洞察】")
            print("-" * 40)
            for i, insight in enumerate(result.get('key_insights', []), 1):
                print(f"{i}. {insight}")

            print("\n【推奨事項】")
            print("-" * 40)
            for i, rec in enumerate(result.get('recommendations', []), 1):
                print(f"{i}. {rec}")

        else:
            print("\n❌ エラー発生:")
            print(json.dumps(response.json(), indent=2, ensure_ascii=False))

    except requests.exceptions.ConnectionError:
        print("\n❌ 接続エラー: APIサーバーが起動していません")
        print("backend/property-apiディレクトリで python app.py を実行してください")
    except Exception as e:
        print(f"\n❌ エラー: {e}")

if __name__ == "__main__":
    test_ai_analysis()