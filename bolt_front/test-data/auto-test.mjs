#!/usr/bin/env node

/**
 * 🧪 リファクタリング自動テストスクリプト
 * 
 * 各ステップでの基本的な動作確認を自動化
 * ビルド確認、基本チェック、APIテストを実行
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

class RefactoringTester {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  logSuccess(message) {
    this.log(`✅ ${message}`, colors.green);
  }

  logError(message) {
    this.log(`❌ ${message}`, colors.red);
  }

  logWarning(message) {
    this.log(`⚠️  ${message}`, colors.yellow);
  }

  logInfo(message) {
    this.log(`ℹ️  ${message}`, colors.blue);
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'pipe',
        ...options
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({
          code,
          stdout,
          stderr,
          success: code === 0
        });
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async testBuild() {
    this.logInfo('🔧 ビルドテスト開始...');
    
    try {
      const result = await this.runCommand('npm', ['run', 'build'], {
        cwd: process.cwd(),
        timeout: 120000 // 2分タイムアウト
      });

      if (result.success) {
        this.logSuccess('ビルド成功');
        this.testResults.push({ test: 'build', status: 'pass' });
        return true;
      } else {
        this.logError(`ビルド失敗: ${result.stderr}`);
        this.testResults.push({ test: 'build', status: 'fail', error: result.stderr });
        return false;
      }
    } catch (error) {
      this.logError(`ビルドエラー: ${error.message}`);
      this.testResults.push({ test: 'build', status: 'error', error: error.message });
      return false;
    }
  }

  async testTypeScript() {
    this.logInfo('📝 TypeScriptチェック開始...');
    
    try {
      const result = await this.runCommand('npx', ['tsc', '--noEmit'], {
        cwd: process.cwd()
      });

      if (result.success) {
        this.logSuccess('TypeScriptチェック成功');
        this.testResults.push({ test: 'typescript', status: 'pass' });
        return true;
      } else {
        this.logError(`TypeScriptエラー: ${result.stderr}`);
        this.testResults.push({ test: 'typescript', status: 'fail', error: result.stderr });
        return false;
      }
    } catch (error) {
      this.logError(`TypeScriptチェックエラー: ${error.message}`);
      this.testResults.push({ test: 'typescript', status: 'error', error: error.message });
      return false;
    }
  }

  async testFileStructure() {
    this.logInfo('📁 ファイル構造チェック開始...');
    
    const requiredFiles = [
      'src/pages/Simulator.tsx',
      'src/components',
      'src/hooks',
      'src/types',
      'src/utils',
      'package.json',
      'tsconfig.json'
    ];

    let allFilesExist = true;

    for (const filePath of requiredFiles) {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        this.logSuccess(`ファイル確認: ${filePath}`);
      } else {
        this.logError(`ファイル不足: ${filePath}`);
        allFilesExist = false;
      }
    }

    this.testResults.push({ 
      test: 'file-structure', 
      status: allFilesExist ? 'pass' : 'fail' 
    });

    return allFilesExist;
  }

  async testSampleData() {
    this.logInfo('📊 サンプルデータチェック開始...');
    
    try {
      const sampleDataPath = path.join(process.cwd(), 'test-data', 'sample-inputs.json');
      
      if (!fs.existsSync(sampleDataPath)) {
        this.logError('サンプルデータファイルが見つかりません');
        this.testResults.push({ test: 'sample-data', status: 'fail', error: 'File not found' });
        return false;
      }

      const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf8'));
      
      const requiredTestCases = ['testCase1', 'testCase2', 'testCase3'];
      let allTestCasesValid = true;

      for (const testCase of requiredTestCases) {
        if (sampleData[testCase] && sampleData[testCase].inputs) {
          this.logSuccess(`テストケース確認: ${testCase}`);
        } else {
          this.logError(`テストケース不正: ${testCase}`);
          allTestCasesValid = false;
        }
      }

      this.testResults.push({ 
        test: 'sample-data', 
        status: allTestCasesValid ? 'pass' : 'fail' 
      });

      return allTestCasesValid;
    } catch (error) {
      this.logError(`サンプルデータエラー: ${error.message}`);
      this.testResults.push({ test: 'sample-data', status: 'error', error: error.message });
      return false;
    }
  }

  async testAPIConnection() {
    this.logInfo('🌐 API接続テスト開始...');
    
    try {
      // 開発サーバーの起動確認（実際にはローカルでの確認が必要）
      this.logWarning('API接続テストは手動確認が必要です');
      this.logInfo('以下を確認してください:');
      this.logInfo('- 開発サーバーが起動するか (npm run dev)');
      this.logInfo('- シミュレーションAPIが応答するか');
      this.logInfo('- サンプルデータでシミュレーション実行が成功するか');
      
      this.testResults.push({ test: 'api-connection', status: 'manual-check-required' });
      return true;
    } catch (error) {
      this.logError(`API接続テストエラー: ${error.message}`);
      this.testResults.push({ test: 'api-connection', status: 'error', error: error.message });
      return false;
    }
  }

  generateReport() {
    const endTime = Date.now();
    const duration = ((endTime - this.startTime) / 1000).toFixed(2);

    this.log('\n' + '='.repeat(50), colors.bright);
    this.log('🧪 リファクタリングテスト結果レポート', colors.bright);
    this.log('='.repeat(50), colors.bright);

    const passedTests = this.testResults.filter(r => r.status === 'pass').length;
    const failedTests = this.testResults.filter(r => r.status === 'fail').length;
    const errorTests = this.testResults.filter(r => r.status === 'error').length;
    const manualTests = this.testResults.filter(r => r.status === 'manual-check-required').length;

    this.logInfo(`実行時間: ${duration}秒`);
    this.logSuccess(`成功: ${passedTests}件`);
    this.logError(`失敗: ${failedTests}件`);
    this.logError(`エラー: ${errorTests}件`);
    this.logWarning(`手動確認必要: ${manualTests}件`);

    this.log('\n詳細結果:', colors.bright);
    this.testResults.forEach(result => {
      const status = result.status === 'pass' ? '✅' : 
                    result.status === 'fail' ? '❌' : 
                    result.status === 'error' ? '🚨' : '⚠️';
      this.log(`${status} ${result.test}: ${result.status}`);
      if (result.error) {
        this.log(`   エラー: ${result.error}`, colors.red);
      }
    });

    // 次のステップ判定
    this.log('\n🎯 次のステップ判定:', colors.bright);
    if (failedTests === 0 && errorTests === 0) {
      this.logSuccess('✅ 次のステップに進んでOK');
    } else {
      this.logError('❌ 問題があります。修正が必要です。');
    }

    // レポートファイル生成
    const reportData = {
      timestamp: new Date().toISOString(),
      duration: parseFloat(duration),
      summary: {
        total: this.testResults.length,
        passed: passedTests,
        failed: failedTests,
        errors: errorTests,
        manual: manualTests
      },
      results: this.testResults,
      recommendation: failedTests === 0 && errorTests === 0 ? 'proceed' : 'fix-issues'
    };

    const reportPath = path.join(process.cwd(), 'test-data', 'latest-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    this.logInfo(`📄 詳細レポート: ${reportPath}`);
  }

  async runAllTests() {
    this.log('🚀 リファクタリング自動テスト開始', colors.bright);
    this.log('=' + '='.repeat(48), colors.bright);

    const tests = [
      { name: 'ファイル構造', method: 'testFileStructure' },
      { name: 'サンプルデータ', method: 'testSampleData' },
      { name: 'TypeScript', method: 'testTypeScript' },
      { name: 'ビルド', method: 'testBuild' },
      { name: 'API接続', method: 'testAPIConnection' }
    ];

    for (const test of tests) {
      this.log(`\n--- ${test.name}テスト ---`, colors.blue);
      await this[test.method]();
    }

    this.generateReport();
  }
}

// スクリプト実行
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new RefactoringTester();
  tester.runAllTests().catch(error => {
    console.error('テスト実行エラー:', error);
    process.exit(1);
  });
}

export default RefactoringTester;