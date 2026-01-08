# Claude-Mem 使い方ガイド

## 概要

claude-mem は Claude Code の会話を自動的に記録・保存するプラグインです。
手動で保存する必要はなく、会話中に自動的にメモリに保存されます。

---

## 自動保存について

- **起動時**: Claude Code を起動すると自動的に claude-mem も起動
- **保存タイミング**: 会話中に自動的に保存（手動操作不要）
- **保存内容**:
  - 観察 (Observations): 重要な情報や作業内容
  - セッション (Sessions): 会話のまとめ
  - プロンプト (Prompts): ユーザーの質問

---

## データ保存場所

```
/Users/tetzlow/.claude-mem/
├── claude-mem.db          # メインデータベース (SQLite)
├── claude-mem.db-shm      # 共有メモリファイル
├── claude-mem.db-wal      # ログファイル
├── logs/                  # ログフォルダ
├── settings.json          # 設定ファイル
├── vector-db/             # ベクトルDB (ChromaDB)
└── worker.pid             # プロセスID
```

**注意**: `.claude-mem` は隠しフォルダです。Finder で表示するには `Cmd + Shift + .` を押してください。

---

## 検索方法（Claude Code 内で）

Claude Code との会話中に以下のように検索できます：

```
「〇〇について検索して」
「過去の作業を見せて」
「claude-mem の記録を一覧表示して」
```

---

## Web UI で閲覧する方法

### 方法1: 専用ビューア（推奨）

Claude Code が起動している間、以下のURLでアクセス可能：

```
http://localhost:37777
```

**注意**: ポート番号は `~/.claude-mem/worker.pid` で確認できます。

### 方法2: Datasette（汎用SQLiteビューア）

```bash
uvx datasette ~/.claude-mem/claude-mem.db --port 8001
```

その後、ブラウザで http://127.0.0.1:8001 にアクセス

---

## 記録の種類

| アイコン | タイプ | 説明 |
|----------|--------|------|
| 🔵 | Observation (学習) | 新しく学んだ情報 |
| 🔴 | Observation (完了) | 完了したタスク |
| ✅ | Observation (確認) | 確認・検証した内容 |
| 🎯 | Session | 会話セッションのまとめ |
| 💬 | Prompt | ユーザーの質問・指示 |

---

## トラブルシューティング

### MCP サーバーが起動しない場合

1. uvx がインストールされているか確認:
   ```bash
   which uvx
   ```

2. システムパスに uvx があるか確認:
   ```bash
   ls -la /usr/local/bin/uvx
   ```

3. なければシンボリックリンクを作成:
   ```bash
   sudo ln -sf ~/.local/bin/uvx /usr/local/bin/uvx
   ```

### データをリセットしたい場合

```bash
rm -rf ~/.claude-mem/
```

**警告**: これにより全ての記録が削除されます。

---

## バックアップ

記録をバックアップするには:

```bash
cp -r ~/.claude-mem/ ~/claude-mem-backup-$(date +%Y%m%d)/
```

---

## 環境情報

- OS: macOS (Darwin 24.6.0)
- uvx location: `/usr/local/bin/uvx`
- Claude Code version: v2.0.76
- 作成日: 2026-01-07
