# テストファイル

このディレクトリには、backend/simulator-api のテストファイルが格納されています。

## 構成

### /tests
- `test_amanuma_api.py` - API経由でのキャメルケース変換テスト
- `test_amanuma_direct.py` - 計算ロジックの直接テスト
- `test_ccr_issue.py` - CCR計算バグの調査・検証用テスト

### /tests/scenarios
シナリオテスト関連のドキュメント

## 実行方法

個別のテストファイルを実行する場合：

```bash
cd backend/simulator-api
python tests/test_amanuma_api.py
```

## 注意事項

これらのテストは開発時の検証用で、CI/CDパイプラインには組み込まれていません。