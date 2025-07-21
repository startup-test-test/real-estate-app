"""
データベースORMのテスト
"""

import pytest
import json
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import (
    Base, Property, SimulationResult, MarketAnalysis, UserActivity,
    get_user_properties, create_property, save_simulation_result,
    log_user_activity, search_properties_by_location, get_simulation_history
)


# テスト用のインメモリデータベース設定
@pytest.fixture
def test_db():
    """テスト用データベースセッションを作成"""
    # インメモリSQLiteデータベースを使用
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # テーブルを作成
    Base.metadata.create_all(bind=engine)
    
    # セッションファクトリを作成
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # セッションを作成
    db = TestingSessionLocal()
    
    yield db
    
    # クリーンアップ
    db.close()


class TestPropertyOperations:
    """物件操作のテスト"""
    
    def test_create_property(self, test_db):
        """物件作成のテスト"""
        user_id = "test_user_123"
        property_data = {
            "property_name": "テストマンション",
            "purchase_price": 50000000,
            "location": "東京都渋谷区",
            "land_area": 200.5,
            "building_area": 150.3,
            "structure_type": "RC造",
            "year_built": 2020,
            "monthly_rent": 200000,
            "management_fee": 15000,
            "property_tax": 150000,
            "insurance_cost": 50000
        }
        
        # 物件を作成
        property_obj = create_property(test_db, user_id, property_data)
        test_db.commit()
        
        # 検証
        assert property_obj.id is not None
        assert property_obj.property_name == "テストマンション"
        assert property_obj.purchase_price == 50000000
        assert property_obj.user_id == user_id
        assert property_obj.location == "東京都渋谷区"
        assert property_obj.created_at is not None
    
    def test_get_user_properties(self, test_db):
        """ユーザー物件一覧取得のテスト"""
        user_id = "test_user_456"
        
        # 複数の物件を作成
        for i in range(3):
            property_data = {
                "property_name": f"物件{i+1}",
                "purchase_price": 30000000 + i * 10000000
            }
            create_property(test_db, user_id, property_data)
        
        # 別のユーザーの物件も作成
        create_property(test_db, "other_user", {"property_name": "他人の物件", "purchase_price": 20000000})
        test_db.commit()
        
        # ユーザーの物件を取得
        properties = get_user_properties(test_db, user_id)
        
        # 検証
        assert len(properties) == 3
        assert all(p.user_id == user_id for p in properties)
        assert properties[0].property_name == "物件3"  # 新しい順
    
    def test_search_properties_by_location(self, test_db):
        """場所検索のテスト"""
        user_id = "test_user_789"
        
        # 異なる場所の物件を作成
        locations = ["東京都新宿区", "東京都渋谷区", "神奈川県横浜市", "大阪府大阪市"]
        for i, location in enumerate(locations):
            create_property(test_db, user_id, {
                "property_name": f"物件{i+1}",
                "purchase_price": 30000000,
                "location": location
            })
        test_db.commit()
        
        # 東京都で検索
        tokyo_properties = search_properties_by_location(test_db, user_id, "東京都")
        
        # 検証
        assert len(tokyo_properties) == 2
        assert all("東京都" in p.location for p in tokyo_properties)
        
        # 横浜で検索
        yokohama_properties = search_properties_by_location(test_db, user_id, "横浜")
        assert len(yokohama_properties) == 1
        assert yokohama_properties[0].location == "神奈川県横浜市"


class TestSimulationOperations:
    """シミュレーション操作のテスト"""
    
    def test_save_simulation_result(self, test_db):
        """シミュレーション結果保存のテスト"""
        # 物件を作成
        property_obj = create_property(test_db, "test_user", {
            "property_name": "テスト物件",
            "purchase_price": 40000000
        })
        test_db.commit()
        
        # シミュレーション結果を保存
        simulation_data = {
            "simulation_type": "standard",
            "gross_yield": 6.5,
            "net_yield": 4.8,
            "monthly_cash_flow": 50000,
            "annual_cash_flow": 600000,
            "roi": 8.2,
            "noi": 1920000,
            "dscr": 1.5,
            "parameters": {
                "loan_amount": 30000000,
                "interest_rate": 1.5,
                "loan_term": 35
            }
        }
        
        result = save_simulation_result(
            test_db, property_obj.id, "test_user", simulation_data
        )
        test_db.commit()
        
        # 検証
        assert result.id is not None
        assert result.property_id == property_obj.id
        assert result.gross_yield == 6.5
        assert result.net_yield == 4.8
        assert result.monthly_cash_flow == 50000
        
        # パラメータがJSON形式で保存されているか確認
        params = json.loads(result.parameters)
        assert params["loan_amount"] == 30000000
        assert params["interest_rate"] == 1.5
    
    def test_get_simulation_history(self, test_db):
        """シミュレーション履歴取得のテスト"""
        user_id = "test_user"
        
        # 2つの物件を作成
        property1 = create_property(test_db, user_id, {
            "property_name": "物件1", "purchase_price": 30000000
        })
        property2 = create_property(test_db, user_id, {
            "property_name": "物件2", "purchase_price": 40000000
        })
        test_db.commit()
        
        # 各物件に対してシミュレーションを実行
        for i in range(2):
            save_simulation_result(test_db, property1.id, user_id, {
                "simulation_type": f"type{i+1}",
                "gross_yield": 5.0 + i
            })
        
        save_simulation_result(test_db, property2.id, user_id, {
            "simulation_type": "standard",
            "gross_yield": 6.0
        })
        test_db.commit()
        
        # 全履歴を取得
        all_history = get_simulation_history(test_db, user_id)
        assert len(all_history) == 3
        
        # 特定物件の履歴を取得
        property1_history = get_simulation_history(test_db, user_id, property1.id)
        assert len(property1_history) == 2
        assert all(h.property_id == property1.id for h in property1_history)


class TestUserActivityLogging:
    """ユーザーアクティビティログのテスト"""
    
    def test_log_user_activity(self, test_db):
        """アクティビティログ記録のテスト"""
        user_id = "test_user"
        
        # アクティビティをログに記録
        request_info = {
            "ip_address": "192.168.1.1",
            "user_agent": "Mozilla/5.0 (Test Browser)",
            "data": {
                "property_name": "テスト物件",
                "password": "secret123",  # 機密情報
                "token": "abc123",  # 機密情報
                "purchase_price": 30000000
            },
            "response_status": 200
        }
        
        log_user_activity(
            test_db, user_id, "property_create", 
            "/api/properties", request_info
        )
        test_db.commit()
        
        # ログを確認
        activity = test_db.query(UserActivity).filter(
            UserActivity.user_id == user_id
        ).first()
        
        assert activity is not None
        assert activity.activity_type == "property_create"
        assert activity.endpoint == "/api/properties"
        assert activity.ip_address == "192.168.1.1"
        assert activity.response_status == 200
        
        # 機密情報が除外されているか確認
        request_data = json.loads(activity.request_data)
        assert "password" not in request_data
        assert "token" not in request_data
        assert request_data["property_name"] == "テスト物件"
        assert request_data["purchase_price"] == 30000000


class TestSQLInjectionPrevention:
    """SQLインジェクション対策のテスト"""
    
    def test_sql_injection_in_search(self, test_db):
        """検索機能でのSQLインジェクション対策テスト"""
        user_id = "test_user"
        
        # 通常の物件を作成
        create_property(test_db, user_id, {
            "property_name": "正常な物件",
            "purchase_price": 30000000,
            "location": "東京都"
        })
        test_db.commit()
        
        # SQLインジェクション攻撃を試みる
        malicious_inputs = [
            "'; DROP TABLE properties; --",
            "' OR '1'='1",
            "' UNION SELECT * FROM users --",
            "'; UPDATE properties SET purchase_price=0; --"
        ]
        
        for malicious_input in malicious_inputs:
            # 悪意のある入力で検索を実行
            results = search_properties_by_location(test_db, user_id, malicious_input)
            
            # 結果が空であることを確認（攻撃が成功していない）
            assert len(results) == 0
            
            # テーブルがまだ存在することを確認
            assert test_db.query(Property).count() == 1
    
    def test_sql_injection_in_property_name(self, test_db):
        """物件名でのSQLインジェクション対策テスト"""
        user_id = "test_user"
        
        # 悪意のある物件名で作成を試みる
        malicious_property_data = {
            "property_name": "'; DELETE FROM properties; --",
            "purchase_price": 30000000
        }
        
        # 物件を作成（ORMが自動的にエスケープ）
        property_obj = create_property(test_db, user_id, malicious_property_data)
        test_db.commit()
        
        # 物件が正常に作成され、攻撃が無効化されていることを確認
        assert property_obj.property_name == "'; DELETE FROM properties; --"
        assert test_db.query(Property).count() == 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])