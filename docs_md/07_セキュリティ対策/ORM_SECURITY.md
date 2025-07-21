# ORMセキュリティ実装ガイド

## 概要

SQLインジェクション攻撃を防ぐため、SQLAlchemy ORMを使用したセキュアなデータベース操作を実装しました。

## 実装内容

### 1. ORM基盤 (`database.py`)

#### セキュリティ機能
- **パラメータ化クエリ**: ORMが自動的にSQLインジェクションを防止
- **型安全性**: SQLAlchemyモデルによる厳密な型チェック
- **接続プーリング**: 安全な接続管理
- **トランザクション管理**: 自動ロールバック機能

#### データモデル
```python
# 物件テーブル
class Property(Base):
    __tablename__ = "properties"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), nullable=False, index=True)
    property_name = Column(String(255), nullable=False)
    purchase_price = Column(Float, nullable=False)
    # ... その他のフィールド

# シミュレーション結果テーブル
class SimulationResult(Base):
    __tablename__ = "simulation_results"
    # ... フィールド定義

# ユーザーアクティビティログ
class UserActivity(Base):
    __tablename__ = "user_activities"
    # 監査ログとセキュリティ分析用
```

### 2. セキュアなクエリ関数

#### 物件操作
```python
def get_user_properties(db: Session, user_id: str, limit: int = 100):
    """ユーザーの物件一覧を取得（SQLインジェクション対策済み）"""
    return db.query(Property).filter(
        Property.user_id == user_id  # ORMが自動的にエスケープ
    ).order_by(
        Property.created_at.desc()
    ).limit(limit).all()

def search_properties_by_location(db: Session, user_id: str, location: str):
    """場所で物件を検索（SQLインジェクション対策済み）"""
    # LIKEクエリでも安全
    return db.query(Property).filter(
        Property.user_id == user_id,
        Property.location.like(f"%{location}%")  # 自動エスケープ
    ).all()
```

#### アクティビティログ
```python
def log_user_activity(db: Session, user_id: str, activity_type: str,
                     endpoint: str, request_info: dict):
    """ユーザーアクティビティをログに記録"""
    # 機密情報を自動的に除外
    safe_request_data = {
        k: v for k, v in request_info.get("data", {}).items()
        if k not in ["password", "token", "secret", "api_key"]
    }
    # ORMモデルで安全に保存
```

### 3. セッション管理

#### コンテキストマネージャー
```python
@contextmanager
def get_db() -> Session:
    """データベースセッションを安全に管理"""
    db = SessionLocal()
    try:
        yield db
        db.commit()  # 成功時のみコミット
    except Exception:
        db.rollback()  # エラー時は自動ロールバック
        raise
    finally:
        db.close()  # 必ずクローズ
```

### 4. APIエンドポイントへの統合

```python
# シミュレーション実行時のログ記録
with get_db() as db:
    log_user_activity(
        db, 
        current_user.get('user_id'),
        "simulation",
        "/api/simulate",
        {
            "ip_address": request.client.host,
            "user_agent": request.headers.get("User-Agent"),
            "data": request.model_dump(),
            "response_status": 200
        }
    )
```

## SQLインジェクション対策の仕組み

### 1. パラメータバインディング
```python
# 危険な例（生SQL）
query = f"SELECT * FROM properties WHERE user_id = '{user_id}'"
# user_id = "'; DROP TABLE properties; --" で攻撃可能

# 安全な例（ORM）
db.query(Property).filter(Property.user_id == user_id)
# SQLAlchemyが自動的にパラメータをバインド
# 実行されるSQL: SELECT * FROM properties WHERE user_id = ?
```

### 2. 型検証
```python
# ORMモデルで型を定義
purchase_price = Column(Float, nullable=False)

# 不正な値は自動的に拒否
property_obj.purchase_price = "'; DELETE FROM properties; --"
# → ValueError: 数値型が期待されています
```

### 3. エスケープ処理
```python
# LIKE検索でも安全
location = "東京都'; DROP TABLE--"
results = db.query(Property).filter(
    Property.location.like(f"%{location}%")
)
# SQLAlchemyが特殊文字を自動エスケープ
```

## テスト

### ユニットテスト
```bash
# ORMセキュリティテストの実行
cd backend/simulator-api
python -m pytest test_database.py -v
```

### SQLインジェクションテスト
```python
def test_sql_injection_in_search(test_db):
    """SQLインジェクション攻撃のテスト"""
    malicious_inputs = [
        "'; DROP TABLE properties; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --"
    ]
    
    for malicious_input in malicious_inputs:
        # 攻撃を試みる
        results = search_properties_by_location(
            test_db, user_id, malicious_input
        )
        # 攻撃が無効化されていることを確認
        assert len(results) == 0
        assert test_db.query(Property).count() > 0  # テーブル存在
```

## ベストプラクティス

### 1. 生SQLの使用を避ける
```python
# ❌ 危険：生SQL
db.execute(f"SELECT * FROM properties WHERE id = {property_id}")

# ✅ 安全：ORM
db.query(Property).filter(Property.id == property_id).first()
```

### 2. 動的クエリの構築
```python
# 安全な動的クエリ構築
query = db.query(Property).filter(Property.user_id == user_id)

if location:
    query = query.filter(Property.location.like(f"%{location}%"))
if min_price:
    query = query.filter(Property.purchase_price >= min_price)

results = query.all()
```

### 3. トランザクション管理
```python
# 複数の操作をトランザクションで実行
with get_db() as db:
    property_obj = create_property(db, user_id, property_data)
    simulation_result = save_simulation_result(
        db, property_obj.id, user_id, simulation_data
    )
    # 両方成功した場合のみコミット
```

## 移行ガイド

### 既存コードの移行
```python
# Before（危険）
cursor.execute(
    "INSERT INTO properties (name, price) VALUES ('" + 
    name + "', " + str(price) + ")"
)

# After（安全）
property_obj = Property(name=name, price=price)
db.add(property_obj)
db.commit()
```

### パフォーマンス最適化
```python
# バルク操作
properties = [
    Property(name=f"物件{i}", price=30000000 + i * 1000000)
    for i in range(100)
]
db.bulk_save_objects(properties)
db.commit()
```

## 監視とログ

### アクティビティ監視
```python
# 不審なアクティビティを検出
suspicious_activities = db.query(UserActivity).filter(
    UserActivity.request_data.like('%DROP%'),
    UserActivity.request_data.like('%DELETE%'),
    UserActivity.request_data.like('%UNION%')
).all()
```

### セキュリティメトリクス
- ログイン失敗回数
- 異常なクエリパターン
- レスポンスタイムの異常
- エラー率の増加

## トラブルシューティング

### よくあるエラー

1. **"OperationalError: database is locked"**
   - SQLiteでの同時アクセス問題
   - 解決策：PostgreSQLへの移行を検討

2. **"DetachedInstanceError"**
   - セッション外でのオブジェクト使用
   - 解決策：`expire_on_commit=False`を設定

3. **"IntegrityError"**
   - 制約違反（外部キー、ユニーク制約など）
   - 解決策：適切なエラーハンドリングを実装

## 今後の改善点

1. **マイグレーション管理**: Alembicの導入
2. **クエリ最適化**: インデックスの追加
3. **キャッシング**: Redis連携
4. **読み書き分離**: レプリケーション対応

## 参考資料

- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [Python Database Security Best Practices](https://realpython.com/python-sql-libraries/)