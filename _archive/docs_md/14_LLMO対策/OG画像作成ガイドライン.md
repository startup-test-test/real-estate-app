# OG画像・TwitterCard画像作成ガイドライン

## 📋 概要
Open Graph（OG）画像とTwitterCard画像は、SNSやメッセージアプリでURLを共有した際に表示される重要な視覚要素です。
これらの画像は、クリック率に大きく影響するため、適切に設計・作成する必要があります。

## 🎨 必要な画像と仕様

### 1. OG画像（og-image.jpg）
**用途**: Facebook、LinkedIn、Slack、Discord、LINE等で使用

#### 推奨仕様
- **サイズ**: 1200 x 630px（推奨）
- **アスペクト比**: 1.91:1
- **ファイル形式**: JPG または PNG
- **ファイルサイズ**: 5MB以下（理想は500KB以下）
- **最小サイズ**: 600 x 315px

### 2. TwitterCard画像（twitter-card.jpg）
**用途**: Twitter（X）で使用

#### Summary Large Image仕様
- **サイズ**: 1200 x 628px（推奨）
- **アスペクト比**: 約1.91:1
- **ファイル形式**: JPG、PNG、WebP、GIF
- **ファイルサイズ**: 5MB以下

## 🖼️ デザイン要件

### 必須要素
1. **ロゴ**: 大家DXのロゴ（/img/logo_250709_2.png）
2. **メインキャッチコピー**: 
   - 「現役大家が開発した」
   - 「不動産投資シミュレーター」
3. **サブキャッチコピー**:
   - 「Excelで半日→60秒で完了」
   - 「35年CFを一瞬で可視化」
4. **主要機能アイコン**:
   - IRR / DSCR / LTV
   - 35年キャッシュフロー
   - PDFレポート

### デザイン案

```
┌─────────────────────────────────────────────┐
│                                             │
│     [大家DXロゴ]                            │
│                                             │
│   現役大家が開発した                         │
│   不動産投資シミュレーター                   │
│                                             │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                             │
│   Excelで半日かかる収支計算を                │
│   たった60秒で完了                          │
│                                             │
│   ✓ IRR/DSCR/LTV 自動計算                  │
│   ✓ 35年キャッシュフロー可視化              │
│   ✓ PDFレポート即時生成                     │
│                                             │
│   [シミュレーター画面のスクリーンショット]    │
│                                             │
└─────────────────────────────────────────────┘
```

### カラーパレット
- **メインカラー**: #2563EB（青）
- **サブカラー**: #4F46E5（インディゴ）
- **背景**: 白またはグラデーション
- **テキスト**: #111827（濃いグレー）

## 📁 ファイル配置

### 本番環境での配置
```
https://ooya.tech/
├── og-image.jpg        # OG画像
├── twitter-card.jpg    # TwitterCard画像
└── favicon.ico         # ファビコン（既存）
```

### 開発環境での配置
```
/workspaces/real-estate-app/bolt_front/public/
├── og-image.jpg
└── twitter-card.jpg
```

## 🛠️ 実装方法

### 1. 画像の作成
デザインツール（Figma、Canva、Adobe等）で作成、または以下の方法：

#### オプション1: スクリーンショットベース
```bash
# 開発サーバーを起動
cd /workspaces/real-estate-app/bolt_front
npm run dev

# ブラウザでアクセスして美しい状態をスクリーンショット
# 1200x630pxにトリミング・編集
```

#### オプション2: HTMLで生成
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      width: 1200px;
      height: 630px;
      margin: 0;
      padding: 60px;
      font-family: sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    h1 { font-size: 72px; margin: 20px 0; }
    h2 { font-size: 36px; margin: 10px 0; }
    .features { margin-top: 40px; font-size: 24px; }
  </style>
</head>
<body>
  <h1>大家DX</h1>
  <h2>現役大家が開発した不動産投資シミュレーター</h2>
  <p style="font-size: 28px;">Excelで半日→60秒で完了</p>
  <div class="features">
    <p>✓ IRR/DSCR/LTV 自動計算</p>
    <p>✓ 35年キャッシュフロー可視化</p>
    <p>✓ PDFレポート即時生成</p>
  </div>
</body>
</html>
```

### 2. index.htmlへの実装
```html
<!-- Open Graph -->
<meta property="og:title" content="現役大家が開発した不動産投資シミュレーター｜大家DX">
<meta property="og:description" content="Excelで半日かかる収支計算を60秒で。IRR/DSCR/LTV/35年CF、評価額、感度分析、PDFレポートまでワンクリック">
<meta property="og:type" content="website">
<meta property="og:url" content="https://ooya.tech">
<meta property="og:image" content="https://ooya.tech/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="大家DX">
<meta property="og:locale" content="ja_JP">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="現役大家が開発した不動産投資シミュレーター｜大家DX">
<meta name="twitter:description" content="35年CFを60秒で可視化。プロ水準の投資判断を誰でも簡単に">
<meta name="twitter:image" content="https://ooya.tech/twitter-card.jpg">
```

## 🧪 テスト方法

### 1. Facebook Sharing Debugger
https://developers.facebook.com/tools/debug/
- URLを入力してテスト
- 画像が正しく表示されるか確認

### 2. Twitter Card Validator
https://cards-dev.twitter.com/validator
- URLを入力してプレビュー確認

### 3. LinkedIn Post Inspector
https://www.linkedin.com/post-inspector/
- URLを入力して検証

## 📝 チェックリスト

### 画像作成
- [ ] OG画像（1200x630px）を作成
- [ ] TwitterCard画像（1200x628px）を作成
- [ ] ファイルサイズを最適化（500KB以下推奨）
- [ ] 高解像度ディスプレイでも鮮明に見えるか確認

### 実装
- [ ] public/フォルダに画像を配置
- [ ] index.htmlにメタタグを追加
- [ ] 本番環境にデプロイ
- [ ] 画像URLが正しくアクセス可能か確認

### テスト
- [ ] Facebook Debuggerでテスト
- [ ] Twitter Card Validatorでテスト
- [ ] Slackでリンクを共有してテスト
- [ ] LINEでリンクを共有してテスト

## 🎯 効果測定

### 測定項目
- SNSでのクリック率（CTR）
- シェア数の増加率
- 画像表示エラー率

### A/Bテスト案
1. スクリーンショット版 vs イラスト版
2. 機能説明重視 vs ベネフィット重視
3. 明るい背景 vs 暗い背景

## 📚 参考リソース

- [The Open Graph protocol](https://ogp.me/)
- [Twitter Cards Getting Started](https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started)
- [Facebook Sharing Best Practices](https://developers.facebook.com/docs/sharing/best-practices)
- [OG Image Generator](https://og-image.vercel.app/) - 動的OG画像生成サービス

---

**作成日**: 2025年9月2日  
**作成者**: AI Assistant  
**最終更新**: 2025年9月2日