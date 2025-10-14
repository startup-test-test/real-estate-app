"""
HTML生成モジュール

統計データからHTMLページを生成する
"""

import os
import yaml
from typing import Dict, List
from pathlib import Path


class LandPriceHTMLGenerator:
    """地価情報ページHTML生成クラス"""

    def __init__(self, base_url: str = "https://ooya.tech/media"):
        """
        初期化

        Args:
            base_url: WordPressサイトのベースURL
        """
        self.base_url = base_url

        # YAMLテンプレートの読み込み
        config_dir = Path(__file__).parent / 'config'

        with open(config_dir / 'text_templates.yaml', 'r', encoding='utf-8') as f:
            self.templates = yaml.safe_load(f)

        with open(config_dir / 'rules.yaml', 'r', encoding='utf-8') as f:
            self.rules = yaml.safe_load(f)

    def generate_prefecture_html(self, stats: Dict) -> str:
        """
        都道府県ページのHTMLを生成

        Args:
            stats: calculate_prefecture_stats() の結果

        Returns:
            完成したHTMLコンテンツ
        """
        pref_name = stats['prefecture_name']
        year = stats['year']
        summary = stats.get('summary', {})
        ranking = stats.get('municipality_ranking', [])[:10]  # TOP10
        price_dist = stats.get('price_distribution', {})

        # 数値フォーマット
        avg_price_sqm = self._format_price(summary.get('average_price_per_sqm', 0), unit="万円", divisor=10000)
        avg_price_tsubo = self._format_price(summary.get('average_price_per_tsubo', 0), unit="万円", divisor=10000)
        change_rate = self._format_change_rate(summary.get('change_rate', 0))
        total_points = summary.get('total_points', 0)
        highest_price = self._format_price(summary.get('highest_price', 0), unit="万円", divisor=10000)

        # パンくずリスト
        breadcrumb = self._generate_breadcrumb([
            ("ホーム", f"{self.base_url}/"),
            ("全国地価", f"{self.base_url}/land-price/"),
            (pref_name, None)
        ])

        # サマリーカード
        summary_cards = self._generate_summary_cards([
            ("平均地価", avg_price_sqm, "㎡あたり"),
            ("坪単価", avg_price_tsubo, "坪あたり"),
            ("最高額", highest_price, "㎡あたり"),
            ("調査地点数", f"{total_points:,}件", "")
        ])

        # 市区町村ランキング
        ranking_table = self._generate_municipality_ranking_table(ranking, pref_name)

        # 市区町村一覧
        municipalities_cards = self._generate_municipalities_cards(ranking, pref_name)

        # FAQ
        faq = self._generate_prefecture_faq(pref_name, ranking)

        # 構造化データ
        structured_data = self._generate_prefecture_structured_data(pref_name, year, stats)

        # テンプレートテキストの取得
        pref_templates = self.templates['prefecture']
        sections = pref_templates['sections']

        # サマリーセクションタイトル
        summary_title = sections['summary']['title'].format(pref_name=pref_name, year=year)

        # ランキングセクション
        ranking_title = sections['ranking']['title'].format(pref_name=pref_name, year=year)

        # 地価動向セクション
        trend_title = sections['trend']['title'].format(year=year)
        trend_desc = sections['trend']['description'].format(
            pref_name=pref_name,
            year=year,
            change_rate=change_rate
        )
        trend_analysis_title = sections['trend']['analysis_title']
        trend_analysis_text = sections['trend']['analysis_text'].format(
            year=year,
            pref_name=pref_name,
            avg_price_sqm=avg_price_sqm,
            change_rate=change_rate
        )

        # 市区町村一覧タイトル
        municipalities_title = sections['municipalities']['title'].format(pref_name=pref_name)

        # データソースセクション
        data_source = sections['data_source']
        data_source_title = data_source['title']
        data_source_desc = data_source['description']
        data_source_note = data_source['note']

        # HTML組み立て
        html = f"""
{breadcrumb}

<h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 1.5rem; color: #1a202c;">
{pref_name}の地価・公示地価【{year}年最新】平均相場・推移グラフ・ランキング
</h1>

<div style="background: #f7fafc; border-left: 4px solid #3182ce; padding: 1rem; margin-bottom: 2rem;">
<p style="color: #2d3748; line-height: 1.8;">
{pref_name}の公示地価・基準地価の最新データ（{year}年）を掲載。平均地価、前年比変動率、市区町村ランキング、地価推移グラフを分析。不動産投資や土地購入の判断材料としてご活用ください。
</p>
</div>

<h2 style="font-size: 1.5rem; font-weight: bold; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #3182ce; color: #1a202c;">
📍 {summary_title}
</h2>

{summary_cards}

<h2 style="font-size: 1.5rem; font-weight: bold; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #3182ce; color: #1a202c;">
{ranking_title}
</h2>

{ranking_table}

<h2 style="font-size: 1.5rem; font-weight: bold; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #3182ce; color: #1a202c;">
{trend_title}
</h2>

<p style="color: #2d3748; line-height: 1.8; margin-bottom: 1rem;">
{trend_desc}
</p>

<div style="background: #edf2f7; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
<h3 style="font-size: 1.2rem; font-weight: bold; margin-bottom: 1rem; color: #2d3748;">{trend_analysis_title}</h3>
<p style="color: #4a5568; line-height: 1.8;">
{trend_analysis_text}
</p>
</div>

<h2 style="font-size: 1.5rem; font-weight: bold; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #3182ce; color: #1a202c;">
{municipalities_title}
</h2>

{municipalities_cards}

<h2 style="font-size: 1.5rem; font-weight: bold; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #3182ce; color: #1a202c;">
❓ よくある質問（FAQ）
</h2>

{faq}

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; text-align: center; margin: 3rem 0;">
<h3 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">不動産投資シミュレーター</h3>
<p style="margin-bottom: 1.5rem; opacity: 0.95;">
{pref_name}の物件でどれくらいの収益が見込めるか、無料でシミュレーションできます。
</p>
<a href="https://ooya.tech/" style="background: white; color: #667eea; padding: 0.75rem 2rem; border-radius: 9999px; text-decoration: none; font-weight: bold; display: inline-block;">
今すぐシミュレーション →
</a>
</div>

<div style="background: #f7fafc; padding: 1.5rem; border-radius: 8px; margin-top: 3rem; border-left: 4px solid #3182ce;">
<h3 style="font-size: 1.1rem; font-weight: bold; margin-bottom: 0.5rem; color: #2d3748;">{data_source_title}</h3>
<p style="color: #4a5568; font-size: 0.9rem; line-height: 1.6;">
{data_source_desc}
</p>
<ul style="color: #4a5568; font-size: 0.9rem; line-height: 1.6; margin-top: 0.5rem;">
    <li>{data_source['features'][0]}</li>
    <li>{data_source['features'][1]}</li>
    <li>{data_source['features'][2]}</li>
    <li>{data_source['features'][3]}</li>
</ul>
<p style="color: #4a5568; font-size: 0.9rem; line-height: 1.6; margin-top: 0.5rem;">
{data_source_note}
</p>
</div>

{structured_data}
"""

        return html.strip()

    def generate_city_html(self, stats: Dict) -> str:
        """
        市区町村ページのHTMLを生成

        Args:
            stats: calculate_city_stats() の結果

        Returns:
            完成したHTMLコンテンツ
        """
        city_name = stats['city_name']
        pref_name = stats['prefecture']
        year = stats['year']
        summary = stats.get('summary', {})
        station_ranking = stats.get('station_ranking', [])[:5]  # TOP5
        point_ranking = stats.get('point_ranking', [])[:10]  # TOP10
        trend = stats.get('trend', {})

        # 数値フォーマット
        avg_price_sqm = self._format_price(summary.get('average_price_per_sqm', 0), unit="万円", divisor=10000)
        avg_price_tsubo = self._format_price(summary.get('average_price_per_tsubo', 0), unit="万円", divisor=10000)
        change_rate = self._format_change_rate(summary.get('change_rate', 0))
        total_points = summary.get('total_points', 0)

        # パンくずリスト
        breadcrumb = self._generate_breadcrumb([
            ("ホーム", f"{self.base_url}/"),
            ("全国地価", f"{self.base_url}/land-price/"),
            (pref_name, f"{self.base_url}/land-price/TODO/"),  # TODO: 都道府県スラッグ
            (city_name, None)
        ])

        # サマリーカード
        summary_cards = self._generate_summary_cards([
            ("平均地価", avg_price_sqm, "㎡あたり"),
            ("坪単価", avg_price_tsubo, "坪あたり"),
            ("変動率", change_rate, "前年比"),
            ("調査地点数", f"{total_points:,}件", "")
        ])

        # 駅別ランキング
        station_table = self._generate_station_ranking_table(station_ranking)

        # 地点別ランキング
        point_table = self._generate_point_ranking_table(point_ranking)

        # 推移データ
        trend_info = self._generate_trend_info(trend)

        # FAQ
        faq = self._generate_city_faq(city_name, pref_name)

        # 構造化データ
        structured_data = self._generate_city_structured_data(city_name, pref_name, year, stats)

        # HTML組み立て
        html = f"""
{breadcrumb}

<h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 1.5rem; color: #1a202c;">
{city_name}の地価・公示地価【{year}年最新】駅別・エリア別ランキング・推移グラフ
</h1>

<div style="background: #f7fafc; border-left: 4px solid #3182ce; padding: 1rem; margin-bottom: 2rem;">
<p style="color: #2d3748; line-height: 1.8;">
{pref_name}{city_name}の公示地価・基準地価（{year}年）を掲載。平均地価{avg_price_sqm}/㎡、前年比{change_rate}。駅別・エリア別ランキング、過去の地価推移グラフで不動産市場を分析。
</p>
</div>

<h2 style="font-size: 1.5rem; font-weight: bold; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #3182ce; color: #1a202c;">
{city_name}の地価サマリー（{year}年）
</h2>

{summary_cards}

<h2 style="font-size: 1.5rem; font-weight: bold; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #3182ce; color: #1a202c;">
🚉 駅別地価ランキング TOP5
</h2>

{station_table}

<h2 style="font-size: 1.5rem; font-weight: bold; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #3182ce; color: #1a202c;">
📍 詳細地点ランキング TOP10
</h2>

{point_table}

<h2 style="font-size: 1.5rem; font-weight: bold; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #3182ce; color: #1a202c;">
📊 地価推移（過去5年）
</h2>

{trend_info}

<h2 style="font-size: 1.5rem; font-weight: bold; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #3182ce; color: #1a202c;">
🏘️ エリア特性・投資分析
</h2>

<div style="background: #edf2f7; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
<h3 style="font-size: 1.2rem; font-weight: bold; margin-bottom: 1rem; color: #2d3748;">市場動向</h3>
<p style="color: #4a5568; line-height: 1.8;">
{city_name}は{pref_name}の中でも特徴的な不動産市場を形成しています。{year}年の平均地価は{avg_price_sqm}/㎡で、前年比{change_rate}となりました。
</p>
</div>

<h2 style="font-size: 1.5rem; font-weight: bold; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #3182ce; color: #1a202c;">
❓ よくある質問（FAQ）
</h2>

{faq}

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; text-align: center; margin: 3rem 0;">
<h3 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">不動産投資シミュレーター</h3>
<p style="margin-bottom: 1.5rem; opacity: 0.95;">
{city_name}の物件でどれくらいの収益が見込めるか、無料でシミュレーションできます。
</p>
<a href="https://ooya.tech/" style="background: white; color: #667eea; padding: 0.75rem 2rem; border-radius: 9999px; text-decoration: none; font-weight: bold; display: inline-block;">
今すぐシミュレーション →
</a>
</div>

<div style="background: #f7fafc; padding: 1.5rem; border-radius: 8px; margin-top: 3rem; border-left: 4px solid #3182ce;">
<h3 style="font-size: 1.1rem; font-weight: bold; margin-bottom: 0.5rem; color: #2d3748;">データ出典</h3>
<p style="color: #4a5568; font-size: 0.9rem; line-height: 1.6;">
本ページのデータは、国土交通省「不動産情報ライブラリ」が提供する公示地価・基準地価データに基づいています。
価格は{year}年1月1日時点の標準地の評価額です。
</p>
</div>

{structured_data}
"""

        return html.strip()

    # ===== ヘルパーメソッド =====

    def _format_price(self, price: int, unit: str = "円", divisor: int = 1) -> str:
        """価格フォーマット"""
        if price == 0:
            return "-"
        formatted = price // divisor
        return f"{formatted:,.1f}{unit}" if divisor >= 10000 else f"{formatted:,}{unit}"

    def _format_change_rate(self, rate: float) -> str:
        """変動率フォーマット"""
        if rate == 0:
            return "-"
        sign = "+" if rate > 0 else ""
        return f"{sign}{rate}%"

    def _generate_breadcrumb(self, items: List[tuple]) -> str:
        """パンくずリスト生成"""
        breadcrumb_items = []
        for name, url in items:
            if url:
                breadcrumb_items.append(f'<a href="{url}" style="color: #3182ce; text-decoration: none;">{name}</a>')
            else:
                breadcrumb_items.append(f'<span style="color: #4a5568;">{name}</span>')

        separator = ' <span style="color: #a0aec0; margin: 0 0.5rem;">›</span> '
        breadcrumb_html = separator.join(breadcrumb_items)

        return f'<nav style="margin-bottom: 1rem; font-size: 0.875rem;">{breadcrumb_html}</nav>'

    def _generate_summary_cards(self, cards: List[tuple]) -> str:
        """サマリーカード生成"""
        cards_html = []

        for title, value, subtitle in cards:
            card = f"""
<div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; text-align: center;">
    <p style="color: #718096; font-size: 0.875rem; margin-bottom: 0.5rem;">{title}</p>
    <p style="color: #2d3748; font-size: 1.75rem; font-weight: bold; margin-bottom: 0.25rem;">{value}</p>
    <p style="color: #a0aec0; font-size: 0.75rem;">{subtitle}</p>
</div>
"""
            cards_html.append(card)

        return f'<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">{"".join(cards_html)}</div>'

    def _generate_municipality_ranking_table(self, ranking: List[Dict], pref_name: str) -> str:
        """市区町村ランキングテーブル生成"""
        if not ranking:
            return "<p>データがありません。</p>"

        rows = []
        for item in ranking:
            rank = item['rank']
            municipality = item['municipality']
            avg_price = self._format_price(item['average_price'], unit="円", divisor=1)
            price_tsubo = self._format_price(item['price_per_tsubo'], unit="万円", divisor=10000)
            change_rate = self._format_change_rate(item['change_rate'])

            medal = "🥇" if rank == 1 else "🥈" if rank == 2 else "🥉" if rank == 3 else ""

            row = f"""
<tr style="border-bottom: 1px solid #e2e8f0;">
    <td style="padding: 1rem; text-align: center;">{medal} {rank}位</td>
    <td style="padding: 1rem;"><a href="#" style="color: #3182ce; text-decoration: none;">{municipality}</a></td>
    <td style="padding: 1rem; text-align: right;">{avg_price}</td>
    <td style="padding: 1rem; text-align: right;">{price_tsubo}</td>
    <td style="padding: 1rem; text-align: right;">{change_rate}</td>
</tr>
"""
            rows.append(row)

        table = f"""
<div style="overflow-x: auto;">
<table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #e2e8f0; border-radius: 8px;">
    <thead style="background: #f7fafc;">
        <tr>
            <th style="padding: 1rem; text-align: center; font-weight: 600; color: #2d3748;">順位</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #2d3748;">市区町村名</th>
            <th style="padding: 1rem; text-align: right; font-weight: 600; color: #2d3748;">平均地価（円/㎡）</th>
            <th style="padding: 1rem; text-align: right; font-weight: 600; color: #2d3748;">坪単価（万円）</th>
            <th style="padding: 1rem; text-align: right; font-weight: 600; color: #2d3748;">変動率</th>
        </tr>
    </thead>
    <tbody>
        {"".join(rows)}
    </tbody>
</table>
</div>
"""
        return table

    def _generate_municipalities_cards(self, ranking: List[Dict], pref_name: str) -> str:
        """市区町村一覧カード生成"""
        if not ranking:
            return "<p>データがありません。</p>"

        cards = []
        for item in ranking[:20]:  # 最大20件表示
            municipality = item['municipality']
            avg_price = self._format_price(item['average_price'], unit="万円", divisor=10000)

            card = f"""
<div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
    <h3 style="font-size: 1.1rem; font-weight: bold; margin-bottom: 0.5rem; color: #2d3748;">
        <a href="#" style="color: #3182ce; text-decoration: none;">{municipality}</a>
    </h3>
    <p style="color: #718096; font-size: 0.875rem;">平均地価: {avg_price}/㎡</p>
</div>
"""
            cards.append(card)

        return f'<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem;">{"".join(cards)}</div>'

    def _generate_station_ranking_table(self, ranking: List[Dict]) -> str:
        """駅別ランキングテーブル生成"""
        if not ranking:
            return "<p>駅別データがありません。</p>"

        rows = []
        for item in ranking:
            rank = item['rank']
            station = item['station']
            avg_price = self._format_price(item['average_price'], unit="円", divisor=1)
            price_tsubo = self._format_price(item['price_per_tsubo'], unit="万円", divisor=10000)
            count = item['count']

            row = f"""
<tr style="border-bottom: 1px solid #e2e8f0;">
    <td style="padding: 1rem; text-align: center;">{rank}位</td>
    <td style="padding: 1rem;">{station}</td>
    <td style="padding: 1rem; text-align: right;">{avg_price}</td>
    <td style="padding: 1rem; text-align: right;">{price_tsubo}</td>
    <td style="padding: 1rem; text-align: center;">{count}件</td>
</tr>
"""
            rows.append(row)

        table = f"""
<div style="overflow-x: auto;">
<table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #e2e8f0; border-radius: 8px;">
    <thead style="background: #f7fafc;">
        <tr>
            <th style="padding: 1rem; text-align: center; font-weight: 600; color: #2d3748;">順位</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #2d3748;">駅名</th>
            <th style="padding: 1rem; text-align: right; font-weight: 600; color: #2d3748;">平均地価（円/㎡）</th>
            <th style="padding: 1rem; text-align: right; font-weight: 600; color: #2d3748;">坪単価（万円）</th>
            <th style="padding: 1rem; text-align: center; font-weight: 600; color: #2d3748;">データ件数</th>
        </tr>
    </thead>
    <tbody>
        {"".join(rows)}
    </tbody>
</table>
</div>
"""
        return table

    def _generate_point_ranking_table(self, ranking: List[Dict]) -> str:
        """地点別ランキングテーブル生成"""
        if not ranking:
            return "<p>地点別データがありません。</p>"

        rows = []
        for item in ranking:
            rank = item['rank']
            address = item['address']
            price = self._format_price(item['price_per_sqm'], unit="円", divisor=1)
            station = item.get('station', '-')
            distance = item.get('distance', '-')

            row = f"""
<tr style="border-bottom: 1px solid #e2e8f0;">
    <td style="padding: 1rem; text-align: center;">{rank}位</td>
    <td style="padding: 1rem;">{address}</td>
    <td style="padding: 1rem; text-align: right;">{price}</td>
    <td style="padding: 1rem;">{station}</td>
    <td style="padding: 1rem; text-align: center;">{distance}</td>
</tr>
"""
            rows.append(row)

        table = f"""
<div style="overflow-x: auto;">
<table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #e2e8f0; border-radius: 8px;">
    <thead style="background: #f7fafc;">
        <tr>
            <th style="padding: 1rem; text-align: center; font-weight: 600; color: #2d3748;">順位</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #2d3748;">所在地</th>
            <th style="padding: 1rem; text-align: right; font-weight: 600; color: #2d3748;">地価（円/㎡）</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #2d3748;">最寄駅</th>
            <th style="padding: 1rem; text-align: center; font-weight: 600; color: #2d3748;">駅距離</th>
        </tr>
    </thead>
    <tbody>
        {"".join(rows)}
    </tbody>
</table>
</div>
"""
        return table

    def _generate_trend_info(self, trend: Dict) -> str:
        """推移情報生成"""
        if not trend:
            return "<p>推移データがありません。</p>"

        years = trend.get('years', [])
        prices = trend.get('average_prices', [])
        total_growth = trend.get('total_growth', 0)
        trend_type = trend.get('trend', '横ばい')

        if not years or not prices:
            return "<p>推移データがありません。</p>"

        # 簡易的な推移表示
        trend_items = []
        for year, price in zip(years, prices):
            price_str = self._format_price(price, unit="万円", divisor=10000)
            trend_items.append(f"<li style='margin-bottom: 0.5rem;'>{year}年: {price_str}/㎡</li>")

        html = f"""
<div style="background: #edf2f7; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
<h3 style="font-size: 1.2rem; font-weight: bold; margin-bottom: 1rem; color: #2d3748;">過去{len(years)}年間の推移</h3>
<ul style="list-style: none; padding: 0; color: #4a5568;">
    {"".join(trend_items)}
</ul>
<p style="color: #2d3748; margin-top: 1rem; font-weight: bold;">
{len(years)}年間の成長率: {self._format_change_rate(total_growth)} （トレンド: {trend_type}）
</p>
</div>
"""
        return html

    def _generate_prefecture_faq(self, pref_name: str, ranking: List[Dict]) -> str:
        """都道府県FAQ生成"""
        top_city = ranking[0]['municipality'] if ranking else "データなし"
        top_price = self._format_price(ranking[0]['average_price'], unit="万円", divisor=10000) if ranking else "データなし"

        faq_items = [
            (f"Q. {pref_name}で最も地価が高い市区町村は？",
             f"A. {top_city}が平均{top_price}/㎡で最も高くなっています。"),
            (f"Q. {pref_name}の地価は今後どうなる？",
             f"A. 経済動向、再開発計画、交通インフラの整備状況などによって変動します。最新のデータを定期的に確認することをお勧めします。"),
            (f"Q. 公示地価と実勢価格の違いは？",
             f"A. 公示地価は国が評価する標準的な価格で、実際の取引価格（実勢価格）は需給バランスにより上下します。一般的に実勢価格の方が高い傾向にあります。")
        ]

        return self._generate_faq_html(faq_items)

    def _generate_city_faq(self, city_name: str, pref_name: str) -> str:
        """市区町村FAQ生成"""
        faq_items = [
            (f"Q. {city_name}で不動産を購入するベストタイミングは？",
             f"A. 地価の変動率、金利動向、再開発計画などを総合的に判断する必要があります。専門家への相談をお勧めします。"),
            (f"Q. {city_name}の地価が高い理由は？",
             f"A. 交通利便性、商業施設の充実度、居住環境、開発計画など複数の要因が影響しています。"),
            (f"Q. 公示地価はどのように決まる？",
             f"A. 国土交通省が毎年1月1日時点で標準地を評価し、不動産鑑定士による鑑定評価に基づいて決定されます。")
        ]

        return self._generate_faq_html(faq_items)

    def _generate_faq_html(self, faq_items: List[tuple]) -> str:
        """FAQ HTML生成"""
        faq_html = []
        for question, answer in faq_items:
            faq_html.append(f"""
<div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem;">
    <h3 style="font-size: 1.1rem; font-weight: bold; margin-bottom: 0.5rem; color: #2d3748;">{question}</h3>
    <p style="color: #4a5568; line-height: 1.8;">{answer}</p>
</div>
""")
        return "".join(faq_html)

    def _generate_prefecture_structured_data(self, pref_name: str, year: str, stats: Dict) -> str:
        """都道府県の構造化データ生成"""
        summary = stats.get('summary', {})

        structured_data = f"""
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{pref_name}の地価・公示地価【{year}年最新】",
  "datePublished": "{year}-04-01",
  "dateModified": "{year}-04-01",
  "author": {{
    "@type": "Organization",
    "name": "大家DX"
  }},
  "publisher": {{
    "@type": "Organization",
    "name": "大家DX",
    "logo": {{
      "@type": "ImageObject",
      "url": "https://ooya.tech/logo.png"
    }}
  }},
  "description": "{pref_name}の公示地価・基準地価の最新データ（{year}年）。平均地価、市区町村ランキング、地価推移を掲載。"
}}
</script>
"""
        return structured_data

    def _generate_city_structured_data(self, city_name: str, pref_name: str, year: str, stats: Dict) -> str:
        """市区町村の構造化データ生成"""
        summary = stats.get('summary', {})

        structured_data = f"""
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{city_name}の地価・公示地価【{year}年最新】",
  "datePublished": "{year}-04-01",
  "dateModified": "{year}-04-01",
  "author": {{
    "@type": "Organization",
    "name": "大家DX"
  }},
  "publisher": {{
    "@type": "Organization",
    "name": "大家DX",
    "logo": {{
      "@type": "ImageObject",
      "url": "https://ooya.tech/logo.png"
    }}
  }},
  "description": "{pref_name}{city_name}の公示地価・基準地価（{year}年）。駅別・エリア別ランキング、地価推移を掲載。"
}}
</script>
"""
        return structured_data


# テスト用
if __name__ == "__main__":
    print("HTML生成モジュール テスト\n")

    # テストデータ
    test_stats = {
        "prefecture_name": "東京都",
        "prefecture_code": "13",
        "year": "2024",
        "summary": {
            "average_price_per_sqm": 1302000,
            "average_price_per_tsubo": 4303000,
            "total_points": 2500,
            "change_rate": 7.7,
            "highest_price": 12000000,
            "lowest_price": 50000
        },
        "municipality_ranking": [
            {"rank": 1, "municipality": "中央区", "average_price": 6530000,
             "price_per_tsubo": 21580000, "change_rate": 8.5, "total_points": 120},
            {"rank": 2, "municipality": "千代田区", "average_price": 6175000,
             "price_per_tsubo": 20413000, "change_rate": 13.9, "total_points": 86}
        ],
        "price_distribution": {},
        "municipalities": []
    }

    generator = LandPriceHTMLGenerator()
    html = generator.generate_prefecture_html(test_stats)

    print(f"生成されたHTML: {len(html)}文字")
    print("\n✅ テスト完了")
