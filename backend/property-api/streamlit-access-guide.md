# Streamlit アプリケーション アクセス手順書

## Streamlit起動コマンド

```bash
streamlit run streamlit_app.py --server.headless true --server.port 8501 --server.address 0.0.0.0
```

## アクセス方法

### 1. VSCode/GitHub Codespaces環境での確認

1. 上記のコマンドでStreamlitを起動
2. ターミナルに表示される以下のメッセージを確認：
   ```
   You can now view your Streamlit app in your browser.
   URL: http://0.0.0.0:8501
   ```
3. VSCodeの「ポート」タブを開く
4. ポート8501が表示されていることを確認
5. ポート8501の行の「ブラウザで開く」アイコンをクリック
6. または、ポート8501の「転送されたアドレス」のURLをブラウザでアクセス

### 2. 直接ブラウザでアクセス（推奨）

GitHub Codespacesの場合、以下のようなURL形式でアクセス可能：
```
https://<codespace-name>-8501.app.github.dev
```

**注意**: ポートタブからの「ブラウザで開く」では正常に表示されない場合があります。その場合は以下の方法を使用してください：

1. ターミナルで以下のコマンドを実行してCodespace名を取得：
   ```bash
   echo $CODESPACE_NAME
   ```

2. 取得したCodespace名を使って、以下のURLでアクセス：
   ```
   https://[CODESPACE_NAME]-8501.app.github.dev
   ```

3. または、VSCodeの「ポート」タブで：
   - ポート8501の「可視性」を「Public」に設定
   - 「転送されたアドレス」のURLをブラウザで開く

### 3. 注意事項

- `--server.address 0.0.0.0` を指定することで外部からのアクセスが可能になります
- `--server.headless true` でブラウザの自動起動を無効化します
- `--server.port 8501` でポートを指定します

### 4. 起動確認

正常に起動すると以下が表示されます：
- **🏢 不動産取引価格検索システム**
- 左サイドバーに検索条件入力フォーム
- 都道府県選択で市区町村が動的に更新される機能

### 5. トラブルシューティング

#### ポートが使用中の場合
```bash
pkill -f streamlit
```
でプロセスを終了してから再度起動してください。

#### VSCodeの「ポート」タブから正常にアクセスできない場合
**症状**: ポートタブの「ブラウザで開く」をクリックしても正常に表示されない

**解決方法**:
1. 上記の「直接ブラウザでアクセス」方法を使用
2. Codespace名を確認して公開URLを直接ブラウザで開く
3. VSCodeの「ポート」タブでポート8501の「可視性」を「Public」に設定

#### アクセスできない場合
1. ポート8501が正しく転送されているかVSCodeの「ポート」タブで確認
2. ファイアウォールの設定を確認
3. 必要に応じて異なるポート（8502、8503など）を試用
4. CORS設定を無効化したコマンドを使用：
   ```bash
   streamlit run streamlit_app.py --server.headless true --server.port 8501 --server.address 0.0.0.0 --server.enableCORS false --server.enableXsrfProtection false
   ```

## ファイル構成

```
/workspaces/real-estate-app/backend/property-api/
├── streamlit_app.py          # メインのStreamlitアプリケーション
├── real_estate_client.py     # 不動産情報ライブラリAPIクライアント
├── .env                      # 環境変数（APIキー）
└── requirements.txt          # Python依存関係
```