# MLIT不動産取引データ検索システム

## 🎯 概要
国土交通省の不動産情報ライブラリAPIを活用した、不動産取引データの検索・表示システムです。実際の取引価格情報を地域別に検索・分析できます。

## 📋 機能

### ✅ 実装済み機能
1. **カスケード地域選択**
   - 都道府県 → 市区町村 → 地区の3段階選択
   - 選択時の自動データ更新

2. **取引データ検索**
   - 年次・四半期での期間指定
   - 不動産取引価格情報・成約価格情報の選択
   - 地区レベルでの絞り込み

3. **データ表示**
   - 取引データのテーブル表示
   - 価格・面積・単価・建物情報・立地情報の詳細表示
   - レスポンシブデザイン対応

4. **プロキシAPI**
   - FastAPIベースのバックエンド
   - MLIT APIへの安全なアクセス
   - エラーハンドリング・フォールバック機能

## 🚀 起動方法

### バックエンド起動
```bash
cd backend

# 依存関係インストール
pip install -r requirements.txt

# 環境変数設定（MLITのAPIキーを設定）
cp .env.example .env
# .envファイルを編集してMLIT_API_KEYを設定

# サーバー起動
python main.py
```

### フロントエンド起動
```bash
# 依存関係インストール（既に完了している場合はスキップ）
npm install

# 開発サーバー起動
npm run dev
```

### アクセス
- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:8000
- API仕様書: http://localhost:8000/docs

## 📁 ファイル構成

```
├── backend/                     # FastAPIバックエンド
│   ├── main.py                 # メインAPIサーバー
│   ├── requirements.txt        # Python依存関係
│   ├── .env.example           # 環境変数テンプレート
│   └── README.md              # バックエンド仕様書
├── src/
│   ├── pages/
│   │   └── MLITDataSearch.tsx # MLIT検索ページ
│   ├── components/
│   │   └── Layout.tsx         # ナビゲーション更新
│   └── App.tsx                # ルーティング設定
├── docs/
│   └── real-estate-api-specification.md  # MLIT API仕様書
└── README-MLIT.md             # このファイル
```

## 🔧 技術スタック

### フロントエンド
- **React 18** + **TypeScript**
- **Tailwind CSS** - スタイリング
- **Lucide React** - アイコンライブラリ
- **React Router** - ルーティング

### バックエンド
- **FastAPI** - Python Webフレームワーク
- **Uvicorn** - ASGIサーバー
- **Requests** - HTTP クライアント
- **Pydantic** - データ検証
- **Python-dotenv** - 環境変数管理

### API連携
- **MLIT不動産情報ライブラリAPI**
  - XIT001: 不動産取引価格情報
  - XIT002: 市区町村情報
  - XIT003: 地区情報
  - XIT010: 成約価格情報

## 📊 データ仕様

### 取引データ項目
- **基本情報**: 物件種別、所在地、取引時期
- **価格情報**: 取引価格、平米単価、坪単価
- **物件詳細**: 面積、建築年、構造、用途
- **立地情報**: 最寄駅、都市計画、前面道路
- **その他**: 建蔽率、容積率、備考

### データソース
- 国土交通省 不動産情報ライブラリ
- 四半期ごとに更新される公的データ
- 匿名化された実際の取引価格情報

## 🔐 APIキー設定

### MLIT APIキー取得
1. [不動産情報ライブラリ](https://www.reinfolib.mlit.go.jp/)でアカウント作成
2. API利用申請を提出
3. 承認後、APIキー（Ocp-Apim-Subscription-Key）を取得

### 設定方法
```bash
# backend/.env ファイル
MLIT_API_KEY=your-actual-api-key-here
ENVIRONMENT=development
DEBUG=true
```

## 📈 利用方法

1. **地域選択**
   - 都道府県を選択（市区町村が自動更新）
   - 市区町村を選択（地区が自動更新）
   - 地区を選択（任意）

2. **検索条件設定**
   - 取引年を選択（2020-2024年）
   - 四半期を選択（任意）
   - データ種別を選択（取引価格 or 成約価格）

3. **データ検索・表示**
   - 「検索実行」ボタンをクリック
   - 取引データがテーブル形式で表示
   - 各項目の詳細情報を確認

## ⚠️ 注意事項

- MLITのAPIキーが必要です
- API利用規約に従ってご利用ください
- 大量リクエスト時はレート制限にご注意ください
- データは匿名化されており個人特定はできません

## 🔄 今後の拡張予定

- [ ] CSV/Excel出力機能
- [ ] データ可視化（グラフ・チャート）
- [ ] 高度な検索フィルター
- [ ] 統計分析機能
- [ ] 地図表示機能
- [ ] お気に入り保存機能

## 📞 サポート

技術的な問題やAPIに関する質問は、以下のドキュメントを参照してください：

- [MLIT API仕様書](./docs/real-estate-api-specification.md)
- [バックエンド仕様書](./backend/README.md)
- [国土交通省 公式API マニュアル](https://www.reinfolib.mlit.go.jp/help/apiManual/)

---

**データソース**: 国土交通省 不動産情報ライブラリ  
**更新頻度**: 四半期ごと  
**利用規約**: [不動産情報ライブラリ利用規約](https://www.reinfolib.mlit.go.jp/)に準拠