#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
共通パーツの定義

各ページで再利用できるHTML部品を定義します。
"""


def generate_header(title, subtitle=''):
    """
    ヘッダーセクション

    Args:
        title: ページタイトル（H1）
        subtitle: サブタイトル（省略可）

    Returns:
        HTMLコード
    """
    subtitle_html = ''
    if subtitle:
        subtitle_html = f'<p style="font-size: 16px; color: #6b7280; margin: 8px 0 0 0;">{subtitle}</p>'

    html = f'''
<!-- ヘッダーセクション -->
<div style="margin-bottom: 40px;">
    <h1 style="font-size: 32px; font-weight: 700; margin-bottom: 16px; color: #111827;">
        {title}
    </h1>
    {subtitle_html}
</div>
'''
    return html


def generate_lead_text(content):
    """
    導入文（リード文）

    Args:
        content: 導入文の内容

    Returns:
        HTMLコード
    """
    html = f'''
<!-- 導入文 -->
<div style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 24px; padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #667eea;">
    <p style="margin: 0;">
        {content}
    </p>
</div>
'''
    return html


def generate_summary_card(label, value, unit='', badge=None, badge_color=''):
    """
    サマリーカード（1枚）

    Args:
        label: ラベル（例: 平均地価）
        value: 値（例: 385,000）
        unit: 単位（例: 円/㎡）
        badge: バッジテキスト（例: 上昇、下落）
        badge_color: バッジの色（例: green, red, gray）

    Returns:
        HTMLコード
    """
    # バッジの色設定
    badge_colors = {
        'green': {'bg': '#dcfce7', 'text': '#16a34a'},
        'red': {'bg': '#fee2e2', 'text': '#dc2626'},
        'gray': {'bg': '#f3f4f6', 'text': '#6b7280'},
    }

    badge_html = ''
    if badge:
        colors = badge_colors.get(badge_color, badge_colors['gray'])
        badge_html = f'''
        <span style="display: inline-block; margin-top: 8px; padding: 4px 12px; background: {colors['bg']}; color: {colors['text']}; border-radius: 12px; font-size: 12px; font-weight: 600;">{badge}</span>
        '''

    html = f'''
<div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.3s;">
    <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">{label}</p>
    <p style="font-size: 28px; font-weight: 700; margin: 0; color: #111827;">
        {value}<span style="font-size: 14px; font-weight: 400;">{unit}</span>
    </p>
    {badge_html}
</div>
'''
    return html


def generate_summary_cards_grid(cards):
    """
    サマリーカードのグリッド

    Args:
        cards: カードのリスト（各カードはgenerate_summary_card()の戻り値）

    Returns:
        HTMLコード
    """
    cards_html = '\n'.join(cards)

    html = f'''
<!-- サマリーカード -->
<section style="margin-bottom: 48px;">
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
        {cards_html}
    </div>
</section>
'''
    return html


def generate_section(title, content, icon=''):
    """
    セクション（白い箱）

    Args:
        title: セクションタイトル（H2）
        content: セクションの内容
        icon: アイコン絵文字（省略可）

    Returns:
        HTMLコード
    """
    html = f'''
<!-- セクション -->
<section style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 48px;">
    <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 16px 0; color: #111827;">{icon} {title}</h2>
    {content}
</section>
'''
    return html


def generate_ranking_table(columns, rows):
    """
    ランキングテーブル

    Args:
        columns: カラム名のリスト（例: ['順位', '都道府県', '地価']）
        rows: 行データのリスト（各行はセルのリスト）

    Returns:
        HTMLコード
    """
    # ヘッダー行
    header_cells = []
    for col in columns:
        header_cells.append(f'<th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">{col}</th>')
    header_html = '<tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">' + ''.join(header_cells) + '</tr>'

    # データ行
    body_rows = []
    for row in rows:
        cells = []
        for cell in row:
            cells.append(f'<td style="padding: 12px; color: #111827;">{cell}</td>')
        body_rows.append('<tr style="border-bottom: 1px solid #e5e7eb;">' + ''.join(cells) + '</tr>')
    body_html = ''.join(body_rows)

    html = f'''
<table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <thead>
        {header_html}
    </thead>
    <tbody>
        {body_html}
    </tbody>
</table>
'''
    return html


def generate_footer():
    """
    データ出典フッター

    Returns:
        HTMLコード
    """
    html = '''
<!-- データ出典 -->
<div style="font-size: 13px; color: #6b7280; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="margin: 4px 0;">※ 出典: 国土交通省 不動産情報ライブラリ（当サイトで加工して作成）</p>
    <p style="margin: 4px 0;">※ データ基準日: 2025年1月1日（令和7年公示地価）</p>
    <p style="margin: 4px 0;">※ 最終更新日: 2025年10月15日</p>
</div>
'''
    return html


def format_number(value, with_comma=True):
    """
    数値のフォーマット

    Args:
        value: 数値
        with_comma: カンマ区切りするか

    Returns:
        フォーマット済み文字列
    """
    if with_comma:
        return f"{value:,}"
    else:
        return str(value)


def format_change_rate(rate):
    """
    変動率のフォーマット

    Args:
        rate: 変動率（例: 5.2）

    Returns:
        フォーマット済み文字列と色情報
    """
    if rate > 0:
        return {
            'text': f'↑ +{rate:.2f}%',
            'color': '#16a34a',
            'bg': '#dcfce7',
            'badge': '上昇',
            'badge_color': 'green'
        }
    elif rate < 0:
        return {
            'text': f'↓ {rate:.2f}%',
            'color': '#dc2626',
            'bg': '#fee2e2',
            'badge': '下落',
            'badge_color': 'red'
        }
    else:
        return {
            'text': f'→ {rate:.2f}%',
            'color': '#6b7280',
            'bg': '#f3f4f6',
            'badge': '横ばい',
            'badge_color': 'gray'
        }


def generate_change_rate_badge(rate):
    """
    変動率バッジの生成

    Args:
        rate: 変動率（例: 5.2）

    Returns:
        HTMLコード
    """
    info = format_change_rate(rate)

    html = f'''
<span style="display: inline-block; padding: 4px 12px; background: {info['bg']}; color: {info['color']}; border-radius: 4px; font-weight: 600; font-size: 13px;">
    {info['text']}
</span>
'''
    return html


# ========================================
# テンプレート用のヘルパー関数
# ========================================

def calculate_tsubo_price(price_per_sqm):
    """
    坪単価を計算

    Args:
        price_per_sqm: 1㎡あたりの価格（円）

    Returns:
        坪単価（万円）
    """
    tsubo_price = price_per_sqm * 3.30579
    return round(tsubo_price / 10000, 1)  # 万円単位、小数点1桁


def get_rank_emoji(rank):
    """
    順位に応じた絵文字を取得

    Args:
        rank: 順位（1, 2, 3, ...）

    Returns:
        絵文字文字列
    """
    emoji_map = {
        1: '🥇',
        2: '🥈',
        3: '🥉',
    }
    return emoji_map.get(rank, '')
