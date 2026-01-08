# Claude-Mem トラブルシューティング記録

## エラー内容

```
Error calling Worker API: Worker API error (500):
{"error":"Chroma connection failed: Executable not found in $PATH: \"uvx\""}
```

**原因:** claude-mem プラグインの MCP サーバーが `uvx` コマンドを見つけられない。MCP サーバーはシェルの環境変数 (PATH) を完全に継承しないため、`~/.local/bin` にインストールされた `uvx` が見つからない。

## 試した解決方法

### 1. uv/uvx の再インストール

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**結果:** インストールは成功。`which uvx` で `/Users/tetzlow/.local/bin/uvx` が表示される。しかし MCP サーバーからは見えない。

### 2. シェル設定の再読み込み

```bash
source ~/.zshrc
```

**結果:** シェルでは uvx が使えるが、MCP サーバーには反映されない（別プロセスのため）。

### 3. Claude Code の再起動

**結果:** 効果なし。MCP サーバープロセスが PATH を継承していない。

### 4. .mcp.json に env 設定を追加

```json
{
  "mcpServers": {
    "mcp-search": {
      "type": "stdio",
      "command": "${CLAUDE_PLUGIN_ROOT}/scripts/mcp-server.cjs",
      "env": {
        "PATH": "/Users/tetzlow/.local/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
      }
    }
  }
}
```

**結果:** 効果なし。Claude Code が `env` 設定を無視している可能性。

### 5. Wrapper スクリプトの作成

`~/.claude/plugins/marketplaces/thedotmack/plugin/scripts/mcp-server-wrapper.sh`:

```bash
#!/bin/bash
export PATH="/Users/tetzlow/.local/bin:$PATH"
exec node "$(dirname "$0")/mcp-server.cjs" "$@"
```

`.mcp.json` を wrapper を使うように変更：

```json
{
  "mcpServers": {
    "mcp-search": {
      "type": "stdio",
      "command": "${CLAUDE_PLUGIN_ROOT}/scripts/mcp-server-wrapper.sh"
    }
  }
}
```

**結果:** 一部のタブで動作確認できたが、完全には解決していない。

## 現在の状態

- **uvx のインストール:** 完了 (`/Users/tetzlow/.local/bin/uvx`)
- **シェルでの動作:** OK
- **MCP サーバーからの動作:** NG（PATH が渡らない）

## 推奨される追加の対処法

### Option A: システムパスにシンボリックリンク作成

```bash
sudo ln -sf /Users/tetzlow/.local/bin/uvx /usr/local/bin/uvx
```

### Option B: VS Code の設定で PATH を追加

`~/Library/Application Support/Code/User/settings.json`:

```json
{
  "terminal.integrated.env.osx": {
    "PATH": "/Users/tetzlow/.local/bin:${env:PATH}"
  }
}
```

### Option C: プラグインの再インストール

```bash
# Claude Code 内で
/plugin uninstall claude-mem
/plugin install claude-mem
```

## 環境情報

- OS: macOS (Darwin 24.6.0)
- uv version: 0.9.22
- uvx location: `/Users/tetzlow/.local/bin/uvx`
- node location: `/usr/local/bin/node`
- Claude Code version: v2.0.76
