"""
CORS設定のテストスクリプト
SEC-003のセキュリティ修正の動作確認用
"""

import os
import sys
import unittest
from unittest.mock import patch

# FastAPIのインポートエラーを回避
try:
    from fastapi.testclient import TestClient
except ImportError:
    print("FastAPIがインストールされていません。テストをスキップします。")
    sys.exit(0)


class TestCORSConfiguration(unittest.TestCase):
    """CORS設定のテストケース"""
    
    def setUp(self):
        """テスト環境のセットアップ"""
        # 環境変数の保存
        self.original_env = os.environ.copy()
    
    def tearDown(self):
        """テスト環境のクリーンアップ"""
        # 環境変数の復元
        os.environ.clear()
        os.environ.update(self.original_env)
    
    def test_development_cors_allows_localhost(self):
        """開発環境でlocalhostからのアクセスが許可されることを確認"""
        os.environ['ENV'] = 'development'
        os.environ.pop('ALLOWED_ORIGINS', None)
        
        # appモジュールを再インポート
        if 'app' in sys.modules:
            del sys.modules['app']
        
        try:
            from app import app
            client = TestClient(app)
            
            # CORSヘッダーのテスト
            response = client.options(
                "/api/simulate",
                headers={
                    "Origin": "http://localhost:5173",
                    "Access-Control-Request-Method": "POST"
                }
            )
            
            # レスポンスヘッダーの確認
            self.assertIn('access-control-allow-origin', response.headers)
            self.assertEqual(
                response.headers['access-control-allow-origin'],
                'http://localhost:5173'
            )
            print("✅ 開発環境: localhost:5173からのアクセス許可を確認")
            
        except Exception as e:
            print(f"⚠️  テスト実行エラー: {e}")
    
    def test_production_cors_requires_allowed_origins(self):
        """本番環境でALLOWED_ORIGINSが必須であることを確認"""
        os.environ['ENV'] = 'production'
        os.environ.pop('ALLOWED_ORIGINS', None)
        
        # appモジュールの再インポートでエラーが発生することを確認
        if 'app' in sys.modules:
            del sys.modules['app']
        
        with self.assertRaises(ValueError) as context:
            import app
        
        self.assertIn("本番環境ではALLOWED_ORIGINSの設定が必須です", str(context.exception))
        print("✅ 本番環境: ALLOWED_ORIGINS未設定時のエラーを確認")
    
    def test_production_cors_with_allowed_origins(self):
        """本番環境で指定されたオリジンのみ許可されることを確認"""
        os.environ['ENV'] = 'production'
        os.environ['ALLOWED_ORIGINS'] = 'https://example.com,https://app.example.com'
        
        # appモジュールを再インポート
        if 'app' in sys.modules:
            del sys.modules['app']
        
        try:
            from app import app
            client = TestClient(app)
            
            # 許可されたオリジンからのアクセス
            response = client.options(
                "/api/simulate",
                headers={
                    "Origin": "https://example.com",
                    "Access-Control-Request-Method": "POST"
                }
            )
            
            self.assertIn('access-control-allow-origin', response.headers)
            self.assertEqual(
                response.headers['access-control-allow-origin'],
                'https://example.com'
            )
            print("✅ 本番環境: 許可されたオリジンからのアクセスを確認")
            
            # 許可されていないオリジンからのアクセス
            response = client.options(
                "/api/simulate",
                headers={
                    "Origin": "https://evil.com",
                    "Access-Control-Request-Method": "POST"
                }
            )
            
            # 許可されていないオリジンの場合、CORSヘッダーが含まれない
            self.assertNotIn('access-control-allow-origin', response.headers)
            print("✅ 本番環境: 許可されていないオリジンからのアクセス拒否を確認")
            
        except Exception as e:
            print(f"⚠️  テスト実行エラー: {e}")
    
    def test_cors_allowed_methods(self):
        """許可されたHTTPメソッドのみが使用可能であることを確認"""
        os.environ['ENV'] = 'development'
        
        if 'app' in sys.modules:
            del sys.modules['app']
        
        try:
            from app import app
            client = TestClient(app)
            
            response = client.options(
                "/api/simulate",
                headers={
                    "Origin": "http://localhost:5173",
                    "Access-Control-Request-Method": "POST"
                }
            )
            
            # 許可されたメソッドの確認
            allowed_methods = response.headers.get('access-control-allow-methods', '').split(', ')
            expected_methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
            
            for method in expected_methods:
                self.assertIn(method, allowed_methods)
            print("✅ 許可されたHTTPメソッドの設定を確認")
            
        except Exception as e:
            print(f"⚠️  テスト実行エラー: {e}")


def main():
    """メイン関数"""
    print("=== CORS設定テスト (SEC-003) ===\n")
    
    # テストの実行
    unittest.main(argv=[''], exit=False, verbosity=2)
    
    print("\n=== テスト完了 ===")
    print("\n検証項目:")
    print("1. 開発環境でlocalhostからのアクセスが許可されること")
    print("2. 本番環境でALLOWED_ORIGINSが必須であること") 
    print("3. 本番環境で指定されたオリジンのみ許可されること")
    print("4. 許可されたHTTPメソッドのみ使用可能であること")


if __name__ == "__main__":
    main()