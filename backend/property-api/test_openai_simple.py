#!/usr/bin/env python
"""OpenAI API Simple Test"""

import os
import sys
from openai import OpenAI

# 環境変数の読み込み
api_key = os.getenv("CHATGPT_REAL_ESTATE_250922")

if not api_key:
    print("❌ APIキーが設定されていません")
    sys.exit(1)

print(f"✅ APIキー設定済み: {api_key[:8]}...")

try:
    # OpenAIクライアントの初期化
    client = OpenAI(api_key=api_key)
    print("✅ OpenAIクライアント初期化成功")

    # 簡単なテスト
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say hello in JSON format"}
        ],
        temperature=0.3,
        max_tokens=50
    )

    print("✅ API呼び出し成功")
    print(f"レスポンス: {response.choices[0].message.content}")

except Exception as e:
    print(f"❌ エラー発生: {e}")
    import traceback
    traceback.print_exc()