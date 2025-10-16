#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
サンプル：東京都と千代田区のページを作成

階層構造:
/land-price/              # トップページ（既存）
└── /land-price/tokyo/    # 東京都ページ（これから作る）
    └── /land-price/tokyo/chiyoda/  # 千代田区ページ（これから作る）
"""

import os
import sys
import requests
from pathlib import Path
from dotenv import load_dotenv

# プロジェクトルートの.envを読み込み
project_root = Path(__file__).parent.parent
env_path = project_root / '.env'
load_dotenv(env_path)

# WordPress設定
WP_SITE_URL = os.getenv('WP_SITE_URL')
WP_USERNAME = os.getenv('WP_USERNAME')
WP_APP_PASSWORD = os.getenv('WP_APP_PASSWORD')

# トップページのID（親ページ）
PARENT_PAGE_ID = 1726


def create_page(title, slug, content, parent_id):
    """WordPressに固定ページを作成"""
    api_url = f"{WP_SITE_URL}/wp-json/wp/v2/pages"

    data = {
        'title': title,
        'content': content,
        'slug': slug,
        'status': 'draft',  # 下書きで作成（確認後に公開）
        'parent': parent_id,
    }

    try:
        response = requests.post(
            api_url,
            json=data,
            auth=(WP_USERNAME, WP_APP_PASSWORD),
            timeout=30
        )

        if response.status_code == 201:
            page = response.json()
            return {
                'success': True,
                'id': page['id'],
                'title': page['title']['rendered'],
                'url': page['link'],
                'status': page['status']
            }
        else:
            return {
                'success': False,
                'error': f"HTTP {response.status_code}: {response.text}"
            }

    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def generate_tokyo_html():
    """東京都ページのHTML生成"""
    html = '''
<!-- ヘッダーセクション -->
<div style="margin-bottom: 40px;">
    <h1 style="font-size: 32px; font-weight: 700; margin-bottom: 16px; color: #111827;">
        東京都の地価・公示地価【2025年最新】
    </h1>
    <div style="font-size: 14px; color: #6b7280;">
        <a href="/">ホーム</a> &gt;
        <a href="/media/land-price/">地価情報</a> &gt;
        <span>東京都</span>
    </div>
</div>

<!-- サマリーカード -->
<section style="margin-bottom: 48px;">
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">

        <!-- カード1: 平均地価 -->
        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.3s;">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">平均地価</p>
            <p style="font-size: 28px; font-weight: 700; margin: 0; color: #111827;">
                385,000<span style="font-size: 14px; font-weight: 400;">円/㎡</span>
            </p>
        </div>

        <!-- カード2: 変動率 -->
        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.3s;">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">変動率</p>
            <p style="font-size: 28px; font-weight: 700; margin: 0; color: #16a34a;">
                ↑ +5.2<span style="font-size: 14px; font-weight: 400;">%</span>
            </p>
            <span style="display: inline-block; margin-top: 8px; padding: 4px 12px; background: #dcfce7; color: #16a34a; border-radius: 12px; font-size: 12px; font-weight: 600;">上昇</span>
        </div>

        <!-- カード3: 坪単価 -->
        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.3s;">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">坪単価</p>
            <p style="font-size: 28px; font-weight: 700; margin: 0; color: #111827;">
                127.3<span style="font-size: 14px; font-weight: 400;">万円/坪</span>
            </p>
        </div>

        <!-- カード4: 全国順位 -->
        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.3s;">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">全国順位</p>
            <p style="font-size: 28px; font-weight: 700; margin: 0; color: #111827;">
                🥇 <span style="font-size: 28px;">1</span><span style="font-size: 14px; font-weight: 400;">位</span>
            </p>
        </div>

    </div>
</section>

<!-- 説明セクション -->
<section style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 48px;">
    <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 16px 0; color: #111827;">📍 東京都の地価について</h2>
    <p style="font-size: 16px; line-height: 1.8; color: #374151; margin: 0 0 16px 0;">
        東京都は日本の首都であり、全国で最も地価が高い地域です。
        2025年の平均地価は<strong>385,000円/㎡</strong>で、前年比<strong>+5.2%</strong>の上昇となっています。
    </p>
    <p style="font-size: 16px; line-height: 1.8; color: #374151; margin: 0;">
        特に千代田区、港区、中央区などの都心部では非常に高い地価となっており、
        商業地・住宅地ともに需要が高い状況が続いています。
        オフィス需要の回復や再開発プロジェクトの進展により、今後も上昇傾向が続くと見られています。
    </p>
</section>

<!-- 市区町村ランキング -->
<section style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 48px;">
    <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 24px 0; color: #111827;">📊 東京都の市区町村別ランキング TOP5</h2>

    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
            <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">順位</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">市区町村</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">平均地価（円/㎡）</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">坪単価（万円/坪）</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">変動率</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">詳細</th>
            </tr>
        </thead>
        <tbody>
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; text-align: center; font-weight: 600;">🥇 1位</td>
                <td style="padding: 12px; font-weight: 600; color: #111827;">千代田区</td>
                <td style="padding: 12px; text-align: right; font-weight: 600; color: #667eea;">1,250,000</td>
                <td style="padding: 12px; text-align: right; font-weight: 600;">413.1</td>
                <td style="padding: 12px; text-align: center;">
                    <span style="display: inline-block; padding: 4px 12px; background: #dcfce7; color: #16a34a; border-radius: 4px; font-weight: 600; font-size: 13px;">↑ +8.5%</span>
                </td>
                <td style="padding: 12px; text-align: center;">
                    <a href="/media/land-price/tokyo/chiyoda/" style="display: inline-block; padding: 6px 16px; background: #667eea; color: white; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px;">詳細 ▶</a>
                </td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; text-align: center; font-weight: 600;">🥈 2位</td>
                <td style="padding: 12px; font-weight: 600; color: #111827;">港区</td>
                <td style="padding: 12px; text-align: right; font-weight: 600; color: #667eea;">980,000</td>
                <td style="padding: 12px; text-align: right; font-weight: 600;">323.9</td>
                <td style="padding: 12px; text-align: center;">
                    <span style="display: inline-block; padding: 4px 12px; background: #dcfce7; color: #16a34a; border-radius: 4px; font-weight: 600; font-size: 13px;">↑ +7.2%</span>
                </td>
                <td style="padding: 12px; text-align: center;">
                    <span style="color: #9ca3af; font-size: 13px;">準備中</span>
                </td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; text-align: center; font-weight: 600;">🥉 3位</td>
                <td style="padding: 12px; font-weight: 600; color: #111827;">中央区</td>
                <td style="padding: 12px; text-align: right; font-weight: 600; color: #667eea;">850,000</td>
                <td style="padding: 12px; text-align: right; font-weight: 600;">280.9</td>
                <td style="padding: 12px; text-align: center;">
                    <span style="display: inline-block; padding: 4px 12px; background: #dcfce7; color: #16a34a; border-radius: 4px; font-weight: 600; font-size: 13px;">↑ +6.8%</span>
                </td>
                <td style="padding: 12px; text-align: center;">
                    <span style="color: #9ca3af; font-size: 13px;">準備中</span>
                </td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; text-align: center; font-weight: 600;">4位</td>
                <td style="padding: 12px; font-weight: 600; color: #111827;">渋谷区</td>
                <td style="padding: 12px; text-align: right; font-weight: 600; color: #667eea;">720,000</td>
                <td style="padding: 12px; text-align: right; font-weight: 600;">238.0</td>
                <td style="padding: 12px; text-align: center;">
                    <span style="display: inline-block; padding: 4px 12px; background: #dcfce7; color: #16a34a; border-radius: 4px; font-weight: 600; font-size: 13px;">↑ +5.9%</span>
                </td>
                <td style="padding: 12px; text-align: center;">
                    <span style="color: #9ca3af; font-size: 13px;">準備中</span>
                </td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; text-align: center; font-weight: 600;">5位</td>
                <td style="padding: 12px; font-weight: 600; color: #111827;">新宿区</td>
                <td style="padding: 12px; text-align: right; font-weight: 600; color: #667eea;">680,000</td>
                <td style="padding: 12px; text-align: right; font-weight: 600;">224.8</td>
                <td style="padding: 12px; text-align: center;">
                    <span style="display: inline-block; padding: 4px 12px; background: #dcfce7; color: #16a34a; border-radius: 4px; font-weight: 600; font-size: 13px;">↑ +5.5%</span>
                </td>
                <td style="padding: 12px; text-align: center;">
                    <span style="color: #9ca3af; font-size: 13px;">準備中</span>
                </td>
            </tr>
        </tbody>
    </table>
</section>

<!-- データ出典 -->
<div style="font-size: 13px; color: #6b7280; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="margin: 4px 0;">※ 出典: 国土交通省 不動産情報ライブラリ（当サイトで加工して作成）</p>
    <p style="margin: 4px 0;">※ データ基準日: 2025年1月1日（令和7年公示地価）</p>
    <p style="margin: 4px 0;">※ 最終更新日: 2025年10月15日</p>
</div>
'''
    return html


def generate_chiyoda_html():
    """千代田区ページのHTML生成"""
    html = '''
<!-- ヘッダーセクション -->
<div style="margin-bottom: 40px;">
    <h1 style="font-size: 32px; font-weight: 700; margin-bottom: 16px; color: #111827;">
        東京都千代田区の地価・公示地価【2025年最新】
    </h1>
    <div style="font-size: 14px; color: #6b7280;">
        <a href="/">ホーム</a> &gt;
        <a href="/media/land-price/">地価情報</a> &gt;
        <a href="/media/land-price/tokyo/">東京都</a> &gt;
        <span>千代田区</span>
    </div>
</div>

<!-- サマリーカード -->
<section style="margin-bottom: 48px;">
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px;">

        <!-- カード1: 平均地価 -->
        <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size: 13px; color: #6b7280; margin: 0 0 6px 0;">平均地価</p>
            <p style="font-size: 24px; font-weight: 700; margin: 0; color: #111827;">
                1,250,000<span style="font-size: 12px; font-weight: 400;">円/㎡</span>
            </p>
        </div>

        <!-- カード2: 変動率 -->
        <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size: 13px; color: #6b7280; margin: 0 0 6px 0;">変動率</p>
            <p style="font-size: 24px; font-weight: 700; margin: 0; color: #16a34a;">
                ↑ +8.5<span style="font-size: 12px; font-weight: 400;">%</span>
            </p>
        </div>

        <!-- カード3: 坪単価 -->
        <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size: 13px; color: #6b7280; margin: 0 0 6px 0;">坪単価</p>
            <p style="font-size: 24px; font-weight: 700; margin: 0; color: #111827;">
                413.1<span style="font-size: 12px; font-weight: 400;">万円/坪</span>
            </p>
        </div>

        <!-- カード4: 都内順位 -->
        <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size: 13px; color: #6b7280; margin: 0 0 6px 0;">都内順位</p>
            <p style="font-size: 24px; font-weight: 700; margin: 0; color: #111827;">
                🥇 1<span style="font-size: 12px; font-weight: 400;">位/23区</span>
            </p>
        </div>

        <!-- カード5: 全国順位 -->
        <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size: 13px; color: #6b7280; margin: 0 0 6px 0;">全国順位</p>
            <p style="font-size: 24px; font-weight: 700; margin: 0; color: #111827;">
                1<span style="font-size: 12px; font-weight: 400;">位</span>
            </p>
        </div>

        <!-- カード6: データ地点数 -->
        <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size: 13px; color: #6b7280; margin: 0 0 6px 0;">データ地点数</p>
            <p style="font-size: 24px; font-weight: 700; margin: 0; color: #111827;">
                85<span style="font-size: 12px; font-weight: 400;">地点</span>
            </p>
        </div>

    </div>
</section>

<!-- 説明セクション -->
<section style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 48px;">
    <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 16px 0; color: #111827;">📍 千代田区の地価について</h2>
    <p style="font-size: 16px; line-height: 1.8; color: #374151; margin: 0 0 16px 0;">
        千代田区は東京都の中心に位置し、<strong>日本で最も地価が高い地域</strong>です。
        2025年の平均地価は<strong>1,250,000円/㎡</strong>（坪単価約413万円）で、前年比<strong>+8.5%</strong>の大幅な上昇となっています。
    </p>
    <p style="font-size: 16px; line-height: 1.8; color: #374151; margin: 0 0 16px 0;">
        丸の内、大手町、永田町などのビジネス街を擁し、日本を代表する大企業の本社が集中しています。
        皇居周辺の番町エリアは高級住宅地として知られ、住宅地としても非常に高い地価を記録しています。
    </p>
    <p style="font-size: 16px; line-height: 1.8; color: #374151; margin: 0;">
        大規模な再開発プロジェクトが進行中であり、オフィス需要の回復とともに、
        今後も地価上昇が続くと予想されています。
    </p>
</section>

<!-- 用途区分別統計 -->
<section style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 48px;">
    <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 24px 0; color: #111827;">📈 用途区分別の平均地価</h2>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">

        <!-- 商業地 -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 24px; color: white;">
            <p style="font-size: 14px; margin: 0 0 8px 0; opacity: 0.9;">商業地</p>
            <p style="font-size: 32px; font-weight: 700; margin: 0 0 8px 0;">
                2,500,000<span style="font-size: 14px; font-weight: 400;">円/㎡</span>
            </p>
            <p style="font-size: 16px; margin: 0; opacity: 0.9;">
                坪単価: 826.4万円/坪
            </p>
        </div>

        <!-- 住宅地 -->
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px; padding: 24px; color: white;">
            <p style="font-size: 14px; margin: 0 0 8px 0; opacity: 0.9;">住宅地</p>
            <p style="font-size: 32px; font-weight: 700; margin: 0 0 8px 0;">
                850,000<span style="font-size: 14px; font-weight: 400;">円/㎡</span>
            </p>
            <p style="font-size: 16px; margin: 0; opacity: 0.9;">
                坪単価: 280.9万円/坪
            </p>
        </div>

    </div>
</section>

<!-- 地価が高い地点 TOP5 -->
<section style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 48px;">
    <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 24px 0; color: #111827;">🏆 千代田区で地価が高い地点 TOP5</h2>

    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
            <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">順位</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">所在地</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">用途</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">地価（円/㎡）</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">坪単価（万円/坪）</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">前年比</th>
            </tr>
        </thead>
        <tbody>
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; text-align: center; font-weight: 600;">🥇 1位</td>
                <td style="padding: 12px; color: #111827;">丸の内２丁目７番２</td>
                <td style="padding: 12px; text-align: center;"><span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px;">商業地</span></td>
                <td style="padding: 12px; text-align: right; font-weight: 600; color: #667eea;">35,200,000</td>
                <td style="padding: 12px; text-align: right; font-weight: 600;">11,634.4</td>
                <td style="padding: 12px; text-align: center;">
                    <span style="padding: 4px 12px; background: #dcfce7; color: #16a34a; border-radius: 4px; font-weight: 600; font-size: 13px;">↑ +12.8%</span>
                </td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; text-align: center; font-weight: 600;">🥈 2位</td>
                <td style="padding: 12px; color: #111827;">大手町１丁目６番１</td>
                <td style="padding: 12px; text-align: center;"><span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px;">商業地</span></td>
                <td style="padding: 12px; text-align: right; font-weight: 600; color: #667eea;">28,500,000</td>
                <td style="padding: 12px; text-align: right; font-weight: 600;">9,421.5</td>
                <td style="padding: 12px; text-align: center;">
                    <span style="padding: 4px 12px; background: #dcfce7; color: #16a34a; border-radius: 4px; font-weight: 600; font-size: 13px;">↑ +11.5%</span>
                </td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; text-align: center; font-weight: 600;">🥉 3位</td>
                <td style="padding: 12px; color: #111827;">丸の内３丁目２番３</td>
                <td style="padding: 12px; text-align: center;"><span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px;">商業地</span></td>
                <td style="padding: 12px; text-align: right; font-weight: 600; color: #667eea;">25,800,000</td>
                <td style="padding: 12px; text-align: right; font-weight: 600;">8,529.9</td>
                <td style="padding: 12px; text-align: center;">
                    <span style="padding: 4px 12px; background: #dcfce7; color: #16a34a; border-radius: 4px; font-weight: 600; font-size: 13px;">↑ +10.2%</span>
                </td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; text-align: center; font-weight: 600;">4位</td>
                <td style="padding: 12px; color: #111827;">有楽町２丁目１０番１</td>
                <td style="padding: 12px; text-align: center;"><span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px;">商業地</span></td>
                <td style="padding: 12px; text-align: right; font-weight: 600; color: #667eea;">22,000,000</td>
                <td style="padding: 12px; text-align: right; font-weight: 600;">7,272.7</td>
                <td style="padding: 12px; text-align: center;">
                    <span style="padding: 4px 12px; background: #dcfce7; color: #16a34a; border-radius: 4px; font-weight: 600; font-size: 13px;">↑ +9.8%</span>
                </td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; text-align: center; font-weight: 600;">5位</td>
                <td style="padding: 12px; color: #111827;">永田町２丁目１１番１</td>
                <td style="padding: 12px; text-align: center;"><span style="background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 12px;">住宅地</span></td>
                <td style="padding: 12px; text-align: right; font-weight: 600; color: #667eea;">3,200,000</td>
                <td style="padding: 12px; text-align: right; font-weight: 600;">1,057.9</td>
                <td style="padding: 12px; text-align: center;">
                    <span style="padding: 4px 12px; background: #dcfce7; color: #16a34a; border-radius: 4px; font-weight: 600; font-size: 13px;">↑ +8.1%</span>
                </td>
            </tr>
        </tbody>
    </table>
</section>

<!-- データ出典 -->
<div style="font-size: 13px; color: #6b7280; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="margin: 4px 0;">※ 出典: 国土交通省 不動産情報ライブラリ（当サイトで加工して作成）</p>
    <p style="margin: 4px 0;">※ データ基準日: 2025年1月1日（令和7年公示地価）</p>
    <p style="margin: 4px 0;">※ 最終更新日: 2025年10月15日</p>
</div>
'''
    return html


def main():
    """メイン処理"""
    print("=" * 80)
    print("サンプルページ作成: 東京都 + 千代田区")
    print("=" * 80)
    print()

    # 設定チェック
    if not all([WP_SITE_URL, WP_USERNAME, WP_APP_PASSWORD]):
        print("❌ WordPress設定が不完全です")
        print("   .envファイルを確認してください")
        sys.exit(1)

    print(f"WordPressサイト: {WP_SITE_URL}")
    print(f"親ページID: {PARENT_PAGE_ID}")
    print()

    # ステップ1: 東京都ページを作成
    print("=" * 80)
    print("ステップ1: 東京都ページを作成")
    print("=" * 80)
    print()

    tokyo_html = generate_tokyo_html()
    tokyo_result = create_page(
        title='東京都の地価・公示地価【2025年最新】',
        slug='tokyo',
        content=tokyo_html,
        parent_id=PARENT_PAGE_ID
    )

    if tokyo_result['success']:
        print(f"✅ 東京都ページ作成成功！")
        print(f"   ページID: {tokyo_result['id']}")
        print(f"   URL: {tokyo_result['url']}")
        print()
        tokyo_page_id = tokyo_result['id']
    else:
        print(f"❌ 東京都ページ作成失敗")
        print(f"   エラー: {tokyo_result['error']}")
        sys.exit(1)

    # ステップ2: 千代田区ページを作成（東京都ページを親にする）
    print("=" * 80)
    print("ステップ2: 千代田区ページを作成")
    print("=" * 80)
    print()

    chiyoda_html = generate_chiyoda_html()
    chiyoda_result = create_page(
        title='東京都千代田区の地価・公示地価【2025年最新】',
        slug='chiyoda',
        content=chiyoda_html,
        parent_id=tokyo_page_id  # 東京都ページを親にする
    )

    if chiyoda_result['success']:
        print(f"✅ 千代田区ページ作成成功！")
        print(f"   ページID: {chiyoda_result['id']}")
        print(f"   URL: {chiyoda_result['url']}")
        print()
    else:
        print(f"❌ 千代田区ページ作成失敗")
        print(f"   エラー: {chiyoda_result['error']}")
        sys.exit(1)

    # 完了メッセージ
    print("=" * 80)
    print("✅ サンプルページ作成完了！")
    print("=" * 80)
    print()
    print("作成されたページ:")
    print(f"  1. 東京都: {tokyo_result['url']}")
    print(f"  2. 千代田区: {chiyoda_result['url']}")
    print()
    print("URL階層構造:")
    print(f"  /land-price/              (トップページ)")
    print(f"  └─ /land-price/tokyo/     (東京都ページ)")
    print(f"      └─ /land-price/tokyo/chiyoda/  (千代田区ページ)")
    print()
    print("👉 WordPress管理画面で確認してください:")
    print(f"   {WP_SITE_URL}/wp-admin/edit.php?post_type=page")
    print()
    print("📝 ステータスは「下書き」なので、確認後に公開してください")


if __name__ == '__main__':
    main()
