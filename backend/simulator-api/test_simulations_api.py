"""
SEC-057: シミュレーションデータ永続化APIのテスト
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from datetime import datetime
from app import app
import database

client = TestClient(app)

@pytest.fixture
def mock_auth():
    """認証をモック"""
    with patch('auth.get_current_user') as mock:
        mock.return_value = {"id": "test-user-123", "email": "test@example.com"}
        yield mock

@pytest.fixture
def mock_db():
    """データベースセッションをモック"""
    with patch('app.get_db') as mock:
        db = MagicMock()
        mock.return_value = db
        yield db

def test_save_simulation(mock_auth, mock_db):
    """シミュレーション保存のテスト"""
    # モックの設定
    mock_result = MagicMock()
    mock_result.id = 1
    
    with patch('database.save_simulation_result', return_value=mock_result):
        with patch('app.security_logger.log_data_access'):
            response = client.post(
                "/api/simulations",
                json={
                    "simulation_type": "standard",
                    "gross_yield": 5.2,
                    "net_yield": 4.8,
                    "monthly_cash_flow": 50000,
                    "annual_cash_flow": 600000
                },
                headers={"Authorization": "Bearer fake-token"}
            )
    
    assert response.status_code == 200
    assert response.json()["id"] == 1
    assert "message" in response.json()

def test_get_simulations(mock_auth, mock_db):
    """シミュレーション一覧取得のテスト"""
    # モックの設定
    mock_result = MagicMock()
    mock_result.id = 1
    mock_result.property_id = None
    mock_result.simulation_type = "standard"
    mock_result.gross_yield = 5.2
    mock_result.net_yield = 4.8
    mock_result.monthly_cash_flow = 50000
    mock_result.annual_cash_flow = 600000
    mock_result.roi = 10.5
    mock_result.noi = 720000
    mock_result.dscr = 1.25
    mock_result.parameters = '{"test": "data"}'
    mock_result.created_at = datetime.utcnow()
    
    with patch('database.get_simulation_history', return_value=[mock_result]):
        with patch('app.security_logger.log_data_access'):
            response = client.get(
                "/api/simulations",
                headers={"Authorization": "Bearer fake-token"}
            )
    
    assert response.status_code == 200
    data = response.json()
    assert "simulations" in data
    assert len(data["simulations"]) == 1
    assert data["simulations"][0]["id"] == 1

def test_get_simulation_by_id(mock_auth, mock_db):
    """特定のシミュレーション取得のテスト"""
    # モックの設定
    mock_result = MagicMock()
    mock_result.id = 1
    mock_result.property_id = None
    mock_result.simulation_type = "standard"
    mock_result.gross_yield = 5.2
    mock_result.net_yield = 4.8
    mock_result.monthly_cash_flow = 50000
    mock_result.annual_cash_flow = 600000
    mock_result.roi = 10.5
    mock_result.noi = 720000
    mock_result.dscr = 1.25
    mock_result.parameters = '{"test": "data"}'
    mock_result.created_at = datetime.utcnow()
    
    # クエリチェーンをモック
    query_mock = MagicMock()
    filter_mock = MagicMock()
    query_mock.filter.return_value = filter_mock
    filter_mock.first.return_value = mock_result
    mock_db.query.return_value = query_mock
    
    with patch('app.security_logger.log_data_access'):
        response = client.get(
            "/api/simulations/1",
            headers={"Authorization": "Bearer fake-token"}
        )
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["gross_yield"] == 5.2

def test_update_simulation(mock_auth, mock_db):
    """シミュレーション更新のテスト"""
    # モックの設定
    mock_result = MagicMock()
    mock_result.id = 1
    
    # クエリチェーンをモック
    query_mock = MagicMock()
    filter_mock = MagicMock()
    query_mock.filter.return_value = filter_mock
    filter_mock.first.return_value = mock_result
    mock_db.query.return_value = query_mock
    mock_db.commit = MagicMock()
    
    with patch('app.security_logger.log_data_access'):
        response = client.put(
            "/api/simulations/1",
            json={
                "gross_yield": 5.5,
                "net_yield": 5.0
            },
            headers={"Authorization": "Bearer fake-token"}
        )
    
    assert response.status_code == 200
    assert response.json()["id"] == 1
    assert "message" in response.json()

def test_delete_simulation(mock_auth, mock_db):
    """シミュレーション削除のテスト"""
    # モックの設定
    mock_result = MagicMock()
    mock_result.id = 1
    
    # クエリチェーンをモック
    query_mock = MagicMock()
    filter_mock = MagicMock()
    query_mock.filter.return_value = filter_mock
    filter_mock.first.return_value = mock_result
    mock_db.query.return_value = query_mock
    mock_db.delete = MagicMock()
    mock_db.commit = MagicMock()
    
    with patch('app.security_logger.log_data_access'):
        response = client.delete(
            "/api/simulations/1",
            headers={"Authorization": "Bearer fake-token"}
        )
    
    assert response.status_code == 200
    assert "message" in response.json()