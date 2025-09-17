"""
APIキー設定確認用スクリプト
使用方法: python test_api.py YOUR_API_KEY
"""
import sys
import os

if len(sys.argv) > 1:
    api_key = sys.argv[1]
    print(f"APIキーを設定します（最初の10文字）: {api_key[:10]}...")

    # 環境変数として設定
    os.environ['MAIN_REAL_ESTATE_API_KEY'] = api_key

    # .envファイルとして保存
    with open('.env', 'w') as f:
        f.write(f"MAIN_REAL_ESTATE_API_KEY={api_key}\n")

    print("✅ .envファイルを作成しました")
    print("Streamlitアプリを再起動してください")
else:
    print("使用方法: python test_api.py YOUR_API_KEY")