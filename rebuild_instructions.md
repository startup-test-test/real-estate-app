# Codespacesの再構築手順

## VS Codeから再構築する方法

1. **F1**キーを押す（またはCtrl+Shift+P / Cmd+Shift+P）
2. 入力欄に「rebuild」と入力
3. **「Codespaces: Rebuild Container」**を選択
4. 確認ダイアログで「Rebuild」をクリック

## 再構築後の確認手順

```bash
# 1. 環境変数の確認
echo $CHATGPT_REAL_ESTATE_250922

# 2. APIキーが設定されているか確認
python -c "import os; print('✅' if os.getenv('CHATGPT_REAL_ESTATE_250922') else '❌')"

# 3. バックエンド起動
cd /workspaces/real-estate-app/backend/property-api
python app.py

# 4. テスト実行
python test_ai_analysis.py
```

## 注意事項
- 再構築には2-3分かかります
- 実行中の作業は保存されます
- Secretsは自動的に環境変数として設定されます