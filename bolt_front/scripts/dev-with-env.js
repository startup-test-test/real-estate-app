#!/usr/bin/env node

/**
 * 開発サーバー起動スクリプト
 * Codespaces環境変数をViteに渡して起動
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 環境変数を一時的な.envファイルに書き出す
const envContent = `# 自動生成された環境変数ファイル（Git管理外）
# このファイルは開発サーバー起動時に自動生成されます
VITE_SUPABASE_URL=${process.env.VITE_SUPABASE_URL || ''}
VITE_SUPABASE_ANON_KEY=${process.env.VITE_SUPABASE_ANON_KEY || ''}
VITE_DEV_RENDER_SIMULATOR_API=${process.env.VITE_DEV_RENDER_SIMULATOR_API || ''}
`;

const envPath = path.join(__dirname, '..', '.env.development.local');

// .env.development.localファイルを作成
fs.writeFileSync(envPath, envContent);
console.log('✅ 環境変数ファイルを生成しました: .env.development.local');

// Vite開発サーバーを起動
const vite = spawn('npm', ['run', 'vite'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
});

// プロセス終了時にクリーンアップ
process.on('SIGINT', () => {
  vite.kill();
  // オプション: 一時ファイルを削除
  // fs.unlinkSync(envPath);
  process.exit(0);
});

vite.on('exit', (code) => {
  process.exit(code);
});