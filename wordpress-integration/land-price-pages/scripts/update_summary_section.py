#!/usr/bin/env python3
"""
page_1726_national.html のサマリーセクションを動的データに置き換え
"""

def main():
    # 1. 元のHTMLファイルを読み込み
    html_file = '../page_1726_national.html'
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 2. 動的データで生成した新しいサマリーセクション
    new_summary = """<!-- 全国平均地価サマリーセクション -->
<!-- データソース: 国土交通省 不動産情報ライブラリAPI -->
<!-- 最終更新: 2025-10-16 06:30:05 -->
<!-- データ件数: 17,899件 -->
<section style="margin-bottom: 60px;">
<h2 style="margin-bottom: 30px;">📊 日本全国2025年［令和7年］公示地価</h2>
<div style="display: flex; justify-content: center; gap: 40px; flex-wrap: wrap;">
<div style="text-align: center;">
<p style="font-size: 20px; margin: 0 0 8px 0; color: #000000; font-weight: 700;">平均地価</p>
<p style="font-size: 48px; font-weight: 700; margin: 0; color: #111827;">136,982<span style="font-size: 24px; font-weight: 400;">円/㎡</span></p>
</div>
<div style="text-align: center;">
<p style="font-size: 20px; margin: 0 0 8px 0; color: #000000; font-weight: 700;">変動率</p>
<p style="font-size: 48px; font-weight: 700; margin: 0; color: #111827;">↑+2.1<span style="font-size: 24px; font-weight: 400;">%</span></p>
</div>
<div style="text-align: center;">
<p style="font-size: 20px; margin: 0 0 8px 0; color: #000000; font-weight: 700;">坪単価</p>
<p style="font-size: 48px; font-weight: 700; margin: 0; color: #111827;">453,000<span style="font-size: 24px; font-weight: 400;">円/坪</span></p>
</div>
</div>
</section>
"""

    # 3. 古いサマリーセクション（1-17行目）を探す
    lines = content.split('\n')

    # サマリーセクションの終了位置を探す（</section>の行）
    summary_end = 0
    for i, line in enumerate(lines):
        if i > 0 and '</section>' in line:
            summary_end = i
            break

    # 4. 古いセクションを新しいセクションに置き換え
    new_content = new_summary + '\n' + '\n'.join(lines[summary_end+1:])

    # 5. バックアップを作成
    import shutil
    from datetime import datetime
    backup_file = f'../page_1726_national_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.html'
    shutil.copy(html_file, backup_file)
    print(f"✅ バックアップ作成: {backup_file}")

    # 6. 新しい内容で保存
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"✅ {html_file} を更新しました")
    print()
    print("変更内容:")
    print("  平均地価: 74,154円/㎡ → 136,982円/㎡")
    print("  変動率: +1.10% → +2.1%")
    print("  坪単価: 245,137円/坪 → 453,000円/坪")
    print()
    print("追加:")
    print("  <!-- データソース: 国土交通省 不動産情報ライブラリAPI -->")
    print("  <!-- 最終更新: 2025-10-16 06:30:05 -->")
    print("  <!-- データ件数: 17,899件 -->")
    print()
    print("次のステップ:")
    print("  python3 ../scripts/update_title_style.py")

if __name__ == '__main__':
    main()
