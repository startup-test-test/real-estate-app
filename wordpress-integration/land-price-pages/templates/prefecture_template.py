#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
都道府県ページのテンプレート

共通パーツを組み合わせてページを生成します。
"""

import sys
from pathlib import Path

# 共通パーツをインポート
sys.path.append(str(Path(__file__).parent))
from common_parts import (
    generate_header,
    generate_lead_text,
    generate_summary_card,
    generate_summary_cards_grid,
    generate_section,
    generate_ranking_table,
    generate_footer,
    format_number,
    format_change_rate,
    generate_change_rate_badge,
    calculate_tsubo_price,
    get_rank_emoji,
)


def generate_prefecture_page(data):
    """
    都道府県ページを生成

    Args:
        data: 都道府県データ
            {
                'name': '東京都',
                'avg_price': 385000,
                'change_rate': 5.2,
                'rank': 1,
                'cities': [
                    {'name': '千代田区', 'price': 1250000, 'change_rate': 8.5},
                    ...
                ]
            }

    Returns:
        HTMLコード
    """
    name = data['name']
    avg_price = data['avg_price']
    change_rate = data['change_rate']
    rank = data['rank']
    cities = data.get('cities', [])

    # 坪単価計算
    tsubo_price = calculate_tsubo_price(avg_price)

    # 変動率情報
    change_info = format_change_rate(change_rate)

    # ========================================
    # 1. ヘッダー
    # ========================================
    header = generate_header(
        title=f'{name}の地価ランキング【2025年最新】',
        subtitle=''
    )

    # ========================================
    # 2. 導入文
    # ========================================
    lead = generate_lead_text(
        content=f'''{name}は全国<strong>{rank}位</strong>の地価水準です。
        2025年の平均地価は<strong>{format_number(avg_price)}円/㎡</strong>（坪単価約{tsubo_price}万円）で、
        前年比<strong>{change_info['text']}</strong>となっています。
        市区町村別の詳細データ、変動率、推移をご確認いただけます。'''
    )

    # ========================================
    # 3. サマリーカード
    # ========================================
    cards = [
        generate_summary_card(
            label='平均地価',
            value=format_number(avg_price),
            unit='円/㎡'
        ),
        generate_summary_card(
            label='変動率',
            value=change_info['text'],
            unit='',
            badge=change_info['badge'],
            badge_color=change_info['badge_color']
        ),
        generate_summary_card(
            label='坪単価',
            value=f'{tsubo_price}',
            unit='万円/坪'
        ),
        generate_summary_card(
            label='全国順位',
            value=f"{get_rank_emoji(rank)} {rank}",
            unit='位'
        ),
    ]
    summary_cards = generate_summary_cards_grid(cards)

    # ========================================
    # 4. 地価動向セクション
    # ========================================
    description_content = f'''
    <p style="font-size: 16px; line-height: 1.8; color: #374151; margin: 0 0 16px 0;">
        {name}の地価は、前年比{change_info['text']}となっています。
        市区町村別の詳細データは以下のランキングをご確認ください。
    </p>
    '''
    description_section = generate_section(
        title=f'{name}の地価動向',
        content=description_content,
        icon='📍'
    )

    # ========================================
    # 5. 市区町村ランキング
    # ========================================
    if cities:
        # テーブルのカラム
        columns = ['順位', '市区町村', '平均地価（円/㎡）', '坪単価（万円/坪）', '変動率', '詳細']

        # テーブルの行データ
        rows = []
        for i, city in enumerate(cities[:10], 1):  # TOP10のみ
            city_name = city['name']
            city_price = city['price']
            city_change = city['change_rate']
            city_tsubo = calculate_tsubo_price(city_price)
            city_slug = city.get('slug', '')

            # 詳細リンク
            detail_link = ''
            if city_slug:
                detail_link = f'<a href="/media/land-price/{data.get("slug", "")}/{city_slug}/" style="display: inline-block; padding: 6px 16px; background: #667eea; color: white; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px;">詳細 ▶</a>'
            else:
                detail_link = '<span style="color: #9ca3af; font-size: 13px;">準備中</span>'

            rows.append([
                f"{get_rank_emoji(i)} {i}位",
                f'<span style="font-weight: 600;">{city_name}</span>',
                f'<span style="font-weight: 600; color: #667eea;">{format_number(city_price)}</span>',
                f'<span style="font-weight: 600;">{city_tsubo}</span>',
                generate_change_rate_badge(city_change),
                detail_link
            ])

        ranking_table = generate_ranking_table(columns, rows)
        ranking_section = generate_section(
            title=f'{name}の市区町村別ランキング TOP10',
            content=ranking_table,
            icon='📊'
        )
    else:
        ranking_section = ''

    # ========================================
    # 6. フッター
    # ========================================
    footer = generate_footer()

    # ========================================
    # 全体を結合
    # ========================================
    html = f'''
{header}
{lead}
{summary_cards}
{description_section}
{ranking_section}
{footer}
'''

    return html


# ========================================
# 使用例
# ========================================
if __name__ == '__main__':
    # サンプルデータ
    sample_data = {
        'name': '東京都',
        'slug': 'tokyo',
        'avg_price': 385000,
        'change_rate': 5.2,
        'rank': 1,
        'cities': [
            {'name': '千代田区', 'slug': 'chiyoda', 'price': 1250000, 'change_rate': 8.5},
            {'name': '港区', 'slug': 'minato', 'price': 980000, 'change_rate': 7.2},
            {'name': '中央区', 'slug': 'chuo', 'price': 850000, 'change_rate': 6.8},
            {'name': '渋谷区', 'slug': 'shibuya', 'price': 720000, 'change_rate': 5.9},
            {'name': '新宿区', 'slug': 'shinjuku', 'price': 680000, 'change_rate': 5.5},
        ]
    }

    # HTMLを生成
    html = generate_prefecture_page(sample_data)

    # 出力（確認用）
    print(html)
