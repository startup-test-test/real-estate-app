"""
SEC-070: データベース接続とORM設定
SQLAlchemyを使用したセキュアなデータベース操作
"""

import os
from datetime import datetime
from typing import Optional
from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Boolean, Text
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from contextlib import contextmanager
import logging

logger = logging.getLogger(__name__)

# データベース設定
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./real_estate.db")

# セキュアなエンジン設定
engine_args = {
    "echo": False,  # 本番環境ではSQLログを無効化
    "future": True,
    "pool_pre_ping": True,  # 接続の健全性チェック
}

# SQLiteの場合の追加設定
if DATABASE_URL.startswith("sqlite"):
    engine_args.update({
        "connect_args": {"check_same_thread": False},
        "poolclass": StaticPool,
    })

# エンジンの作成
engine = create_engine(DATABASE_URL, **engine_args)

# セッションファクトリの作成
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False
)

# ベースクラスの作成
Base = declarative_base()


class Property(Base):
    """物件テーブル"""
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), nullable=False, index=True)
    property_name = Column(String(255), nullable=False)
    purchase_price = Column(Float, nullable=False)
    location = Column(String(500))
    land_area = Column(Float)
    building_area = Column(Float)
    structure_type = Column(String(100))
    year_built = Column(Integer)
    monthly_rent = Column(Float)
    management_fee = Column(Float)
    property_tax = Column(Float)
    insurance_cost = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SimulationResult(Base):
    """シミュレーション結果テーブル"""
    __tablename__ = "simulation_results"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, nullable=False, index=True)
    user_id = Column(String(255), nullable=False, index=True)
    simulation_type = Column(String(50), nullable=False)
    
    # 基本指標
    gross_yield = Column(Float)
    net_yield = Column(Float)
    monthly_cash_flow = Column(Float)
    annual_cash_flow = Column(Float)
    
    # 財務指標
    roi = Column(Float)  # Return on Investment
    noi = Column(Float)  # Net Operating Income
    dscr = Column(Float)  # Debt Service Coverage Ratio
    
    # その他のメタデータ
    parameters = Column(Text)  # JSON形式でパラメータを保存
    created_at = Column(DateTime, default=datetime.utcnow)


class MarketAnalysis(Base):
    """市場分析結果テーブル"""
    __tablename__ = "market_analyses"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, nullable=False, index=True)
    user_id = Column(String(255), nullable=False, index=True)
    
    # 市場統計
    median_price = Column(Float)
    mean_price = Column(Float)
    std_price = Column(Float)
    user_price = Column(Float)
    deviation = Column(Float)
    evaluation = Column(String(50))
    
    # 分析データ
    similar_properties_count = Column(Integer)
    analysis_data = Column(Text)  # JSON形式で類似物件データを保存
    
    created_at = Column(DateTime, default=datetime.utcnow)


class UserActivity(Base):
    """ユーザーアクティビティログテーブル"""
    __tablename__ = "user_activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), nullable=False, index=True)
    activity_type = Column(String(100), nullable=False)
    endpoint = Column(String(255))
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    request_data = Column(Text)  # 機密情報を除外したリクエストデータ
    response_status = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


# データベースの初期化
def init_db():
    """データベースとテーブルを初期化"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise


# セッション管理
@contextmanager
def get_db() -> Session:
    """
    データベースセッションを取得するコンテキストマネージャー
    
    Yields:
        Session: SQLAlchemyセッション
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


# セキュアなクエリヘルパー関数
def get_user_properties(db: Session, user_id: str, limit: int = 100) -> list[Property]:
    """
    ユーザーの物件一覧を取得（SQLインジェクション対策済み）
    
    Args:
        db: データベースセッション
        user_id: ユーザーID
        limit: 取得件数の上限
        
    Returns:
        list[Property]: 物件リスト
    """
    # ORMを使用することでSQLインジェクションを防止
    return db.query(Property).filter(
        Property.user_id == user_id
    ).order_by(
        Property.created_at.desc()
    ).limit(limit).all()


def create_property(db: Session, user_id: str, property_data: dict) -> Property:
    """
    新しい物件を作成（SQLインジェクション対策済み）
    
    Args:
        db: データベースセッション
        user_id: ユーザーID
        property_data: 物件データ
        
    Returns:
        Property: 作成された物件
    """
    # ORMモデルを使用してデータを検証・保存
    property_obj = Property(
        user_id=user_id,
        property_name=property_data.get("property_name", ""),
        purchase_price=float(property_data.get("purchase_price", 0)),
        location=property_data.get("location"),
        land_area=float(property_data.get("land_area", 0)) if property_data.get("land_area") else None,
        building_area=float(property_data.get("building_area", 0)) if property_data.get("building_area") else None,
        structure_type=property_data.get("structure_type"),
        year_built=int(property_data.get("year_built", 0)) if property_data.get("year_built") else None,
        monthly_rent=float(property_data.get("monthly_rent", 0)) if property_data.get("monthly_rent") else None,
        management_fee=float(property_data.get("management_fee", 0)) if property_data.get("management_fee") else None,
        property_tax=float(property_data.get("property_tax", 0)) if property_data.get("property_tax") else None,
        insurance_cost=float(property_data.get("insurance_cost", 0)) if property_data.get("insurance_cost") else None,
    )
    
    db.add(property_obj)
    db.flush()  # IDを取得するためにflush
    
    return property_obj


def save_simulation_result(db: Session, property_id: int, user_id: str, 
                         simulation_data: dict) -> SimulationResult:
    """
    シミュレーション結果を保存（SQLインジェクション対策済み）
    
    Args:
        db: データベースセッション
        property_id: 物件ID
        user_id: ユーザーID
        simulation_data: シミュレーション結果データ
        
    Returns:
        SimulationResult: 保存された結果
    """
    import json
    
    result = SimulationResult(
        property_id=property_id,
        user_id=user_id,
        simulation_type=simulation_data.get("simulation_type", "standard"),
        gross_yield=simulation_data.get("gross_yield"),
        net_yield=simulation_data.get("net_yield"),
        monthly_cash_flow=simulation_data.get("monthly_cash_flow"),
        annual_cash_flow=simulation_data.get("annual_cash_flow"),
        roi=simulation_data.get("roi"),
        noi=simulation_data.get("noi"),
        dscr=simulation_data.get("dscr"),
        parameters=json.dumps(simulation_data.get("parameters", {}))
    )
    
    db.add(result)
    db.flush()
    
    return result


def log_user_activity(db: Session, user_id: str, activity_type: str,
                     endpoint: str, request_info: dict) -> None:
    """
    ユーザーアクティビティをログに記録（SQLインジェクション対策済み）
    
    Args:
        db: データベースセッション
        user_id: ユーザーID
        activity_type: アクティビティタイプ
        endpoint: APIエンドポイント
        request_info: リクエスト情報
    """
    import json
    
    # 機密情報を除外
    safe_request_data = {
        k: v for k, v in request_info.get("data", {}).items()
        if k not in ["password", "token", "secret", "api_key"]
    }
    
    activity = UserActivity(
        user_id=user_id,
        activity_type=activity_type,
        endpoint=endpoint,
        ip_address=request_info.get("ip_address"),
        user_agent=request_info.get("user_agent"),
        request_data=json.dumps(safe_request_data) if safe_request_data else None,
        response_status=request_info.get("response_status")
    )
    
    db.add(activity)


# パラメータ化クエリの例
def search_properties_by_location(db: Session, user_id: str, location: str) -> list[Property]:
    """
    場所で物件を検索（SQLインジェクション対策済み）
    
    Args:
        db: データベースセッション
        user_id: ユーザーID
        location: 検索する場所
        
    Returns:
        list[Property]: 検索結果
    """
    # LIKEクエリでもORMを使用してSQLインジェクションを防止
    return db.query(Property).filter(
        Property.user_id == user_id,
        Property.location.like(f"%{location}%")
    ).all()


def get_simulation_history(db: Session, user_id: str, 
                         property_id: Optional[int] = None) -> list[SimulationResult]:
    """
    シミュレーション履歴を取得（SQLインジェクション対策済み）
    
    Args:
        db: データベースセッション
        user_id: ユーザーID
        property_id: 物件ID（オプション）
        
    Returns:
        list[SimulationResult]: シミュレーション履歴
    """
    query = db.query(SimulationResult).filter(
        SimulationResult.user_id == user_id
    )
    
    if property_id is not None:
        query = query.filter(SimulationResult.property_id == property_id)
    
    return query.order_by(SimulationResult.created_at.desc()).all()


# データベース初期化を実行
if __name__ == "__main__":
    init_db()
    print("Database initialized successfully")