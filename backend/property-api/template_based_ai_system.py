"""
テンプレート型AI分析システム
文章は固定テンプレート、数値のみChatGPTが生成
より安全で制御可能な実装
"""

# ============================================
# 1. JSON形式でデータのみ取得する方式
# ============================================

STRUCTURED_DATA_PROMPT = """
以下の不動産市場データを分析し、JSON形式で数値データのみを返してください。
文章は含めず、数値と単純な分類のみを返してください。

【入力データ】
{market_data}

【出力形式】
以下のJSON形式で返してください。数値のみ、文章は不要です：
{{
  "price_trend": "上昇" または "下降" または "横ばい",
  "price_change_percent": 数値,
  "average_price": 数値（万円）,
  "median_price": 数値（万円）,
  "transaction_count": 数値,
  "price_per_sqm": 数値（万円/㎡）,
  "year_on_year_change": 数値（%）,
  "market_strength_score": 1-10の数値,
  "supply_demand_balance": "供給過多" または "需要過多" または "均衡",
  "recommended_action": "様子見" または "検討可" または "要注意"
}}

JSONのみを返し、他の文章は含めないでください。
"""

# ============================================
# 2. 固定テンプレート（日本語文章）
# ============================================

FIXED_TEMPLATE = """
【市場分析レポート】

対象エリア：{prefecture} {city} {district}

■ 市場動向
現在の市場は「{price_trend}」傾向を示しています。
統計データによると、平均取引価格は{average_price:,}万円、
中央値は{median_price:,}万円となっています。

■ 価格推移
前年同期比で{year_on_year_change}%の変動が確認されています。
直近の取引件数は{transaction_count}件で、
平均㎡単価は約{price_per_sqm}万円/㎡です。

■ 市場評価
市場強度スコア：{market_strength_score}/10
需給バランス：{supply_demand_balance}

■ データに基づく判断
現在の市場環境は「{recommended_action}」の状況です。

※本レポートは統計データに基づく参考情報です。
※実際の不動産取引は宅地建物取引士にご相談ください。
※市場は常に変動する可能性があります。
"""

# ============================================
# 3. 実装例
# ============================================

import json
from typing import Dict, Any

def generate_safe_analysis(market_data: Dict[str, Any]) -> str:
    """
    安全なテンプレートベースの分析を生成

    1. ChatGPTには数値のみを生成させる
    2. 固定テンプレートに数値を埋め込む
    3. 文章は一切ChatGPTに生成させない
    """

    # Step 1: ChatGPTに数値のみを要求
    prompt = STRUCTURED_DATA_PROMPT.format(
        market_data=json.dumps(market_data, ensure_ascii=False)
    )

    # ChatGPTのレスポンス例（数値のみ）
    gpt_response = {
        "price_trend": "上昇",
        "price_change_percent": 5.2,
        "average_price": 5800,
        "median_price": 5500,
        "transaction_count": 45,
        "price_per_sqm": 56,
        "year_on_year_change": 5.2,
        "market_strength_score": 7,
        "supply_demand_balance": "需要過多",
        "recommended_action": "検討可"
    }

    # Step 2: テンプレートに数値を埋め込み
    final_report = FIXED_TEMPLATE.format(
        prefecture=market_data.get('prefecture', ''),
        city=market_data.get('city', ''),
        district=market_data.get('district', ''),
        **gpt_response  # 数値データを展開
    )

    return final_report

# ============================================
# 4. さらに安全な実装（選択肢制限版）
# ============================================

ULTRA_SAFE_PROMPT = """
以下のデータから該当する選択肢の番号のみを返してください。

【データ】
平均価格: {average_price}万円
前年比: {year_change}%

【質問1】価格トレンドは？
1. 上昇傾向
2. 横ばい
3. 下降傾向

【質問2】市場の活性度は？
1. 非常に活発
2. 活発
3. 通常
4. 低調

【質問3】需給バランスは？
1. 供給不足
2. 均衡
3. 供給過多

回答形式: 1,2,3のように数字のみカンマ区切りで返してください。
"""

# ============================================
# 5. 実際の使用例
# ============================================

# サンプル入力データ
sample_market_data = {
    "prefecture": "東京都",
    "city": "世田谷区",
    "district": "三軒茶屋",
    "average_price": 5800,
    "median_price": 5500,
    "year_change": 5.2,
    "transactions": 45
}

# ChatGPTへの実際のプロンプト（数値のみ要求）
actual_prompt_to_gpt = """
{
  "average_price": 5800,
  "median_price": 5500,
  "year_change": 5.2
}

上記データから以下を判定し、JSONで返してください：
- price_trend: "上昇"/"横ばい"/"下降"のいずれか
- market_strength_score: 1-10の整数
- recommended_action: "様子見"/"検討可"/"要注意"のいずれか
"""

# ChatGPTの返答（数値と選択肢のみ）
gpt_minimal_response = """
{
  "price_trend": "上昇",
  "market_strength_score": 7,
  "recommended_action": "検討可"
}
"""

# 最終的な表示（完全に制御されたテンプレート）
final_safe_output = """
【市場分析レポート】

対象エリア：東京都 世田谷区 三軒茶屋

■ 市場動向
現在の市場は「上昇」傾向を示しています。
統計データによると、平均取引価格は5,800万円、
中央値は5,500万円となっています。

■ 価格推移
前年同期比で5.2%の変動が確認されています。

■ 市場評価
市場強度スコア：7/10

■ データに基づく判断
現在の市場環境は「検討可」の状況です。

※本レポートは統計データに基づく参考情報です。
※実際の不動産取引は宅地建物取引士にご相談ください。
※市場は常に変動する可能性があります。
"""

# ============================================
# 6. メリット
# ============================================

TEMPLATE_SYSTEM_BENEFITS = """
【テンプレート方式のメリット】

✅ 完全な文章制御
  - ChatGPTは数値のみ生成
  - 文章は100%固定テンプレート
  - 法的リスクのある表現は一切生成されない

✅ 予測可能な出力
  - 常に同じフォーマット
  - 意図しない文章が出力されない
  - 品質が安定

✅ コスト削減
  - トークン使用量が少ない（数値のみ）
  - 処理速度が速い
  - API料金を抑えられる

✅ 法的安全性
  - 断定表現なし
  - 投資勧誘なし
  - 免責事項は常に表示

✅ 実装の簡単さ
  - JSONパースのみ
  - エラーハンドリングが容易
  - テストしやすい
"""

# ============================================
# 7. 実装コード例
# ============================================

class SafeMarketAnalyzer:
    """完全テンプレート型の安全な市場分析システム"""

    def __init__(self, openai_api_key: str):
        self.api_key = openai_api_key
        self.template = FIXED_TEMPLATE

    def analyze(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        市場データを分析し、安全なレポートを生成
        """

        # 1. ChatGPTに数値判定のみを依頼
        numerical_analysis = self._get_numerical_analysis(market_data)

        # 2. テンプレートに埋め込み
        report = self._generate_report(market_data, numerical_analysis)

        # 3. 構造化された結果を返す
        return {
            "report": report,
            "data": numerical_analysis,
            "disclaimer": "本情報は参考データです。専門家にご相談ください。"
        }

    def _get_numerical_analysis(self, data: Dict) -> Dict:
        """ChatGPTから数値・分類のみ取得"""
        # ここでOpenAI APIを呼び出し
        # JSON形式で数値のみを返すよう指示
        return {
            "price_trend": "上昇",
            "market_strength_score": 7,
            "recommended_action": "検討可"
        }

    def _generate_report(self, market_data: Dict, analysis: Dict) -> str:
        """固定テンプレートにデータを埋め込み"""
        return self.template.format(
            **market_data,
            **analysis
        )

print("=" * 60)
print("テンプレート型AI分析システム")
print("=" * 60)
print("\n✅ ChatGPTは数値・分類のみ生成")
print("✅ 文章は100%固定テンプレート")
print("✅ 法的リスクを完全回避")
print("✅ 出力が予測可能で安定")
print("\n実装準備完了！")