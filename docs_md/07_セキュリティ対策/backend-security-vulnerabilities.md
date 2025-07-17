# バックエンドセキュリティ脆弱性調査結果

## 調査実施日
2025-07-17

## 概要
バックエンドコード（/backend/simulator-api）の詳細なセキュリティ脆弱性調査を実施しました。既存のセキュリティ課題管理表に記載されていない脆弱性を6つのカテゴリに分けて分析し、21件の新たなセキュリティ脆弱性を発見しました。

## 🚨 新たに発見された脆弱性

### 1. Database Security（データベースセキュリティ）

#### SEC-BACKEND-001: データベース接続の完全欠如 (🔴 重大リスク)
**脆弱性の詳細:**
- FastAPI アプリケーションにデータベース接続が実装されていない
- 全ての処理がメモリ内で実行される
- データの永続化機能が存在しない

**影響:**
- データの一貫性がない
- 同時接続ユーザー間でのデータ分離ができない
- アプリケーション再起動時にデータが消失
- 監査ログの記録ができない

**対策:**
```python
# PostgreSQL/MySQLなどの適切なデータベース実装
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://user:password@localhost/dbname"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

#### SEC-BACKEND-002: ORMセキュリティ問題 (🟡 高リスク)
**脆弱性の詳細:**
- SQLAlchemy や他のORMが使用されていない
- 生のSQL文を使用する可能性がある状況
- データベース操作のサニタイゼーションが未実装

**影響:**
- SQLインジェクション攻撃のリスク
- データベーススキーマの露出
- 不正なデータ操作の可能性

### 2. API Security（APIセキュリティ）

#### SEC-BACKEND-003: CORS設定の重大な脆弱性 (🔴 重大リスク)
**脆弱性の詳細:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # 全てのオリジンを許可
    allow_credentials=True,     # 認証情報の送信を許可
    allow_methods=["*"],        # 全てのHTTPメソッドを許可
    allow_headers=["*"],        # 全てのヘッダーを許可
)
```

**影響:**
- CSRF攻撃の可能性
- 悪意のあるサイトからのAPIアクセス
- 認証情報の漏洩
- ブラウザのセキュリティ機能が無効化

**対策:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ooya-dx.com", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)
```

#### SEC-BACKEND-004: レート制限の完全欠如 (🔴 重大リスク)
**脆弱性の詳細:**
- APIエンドポイントにレート制限が実装されていない
- DoS攻撃に対する防護機能がない
- リソース消費の制限がない

**影響:**
- サービス拒否攻撃（DoS）
- サーバーリソースの枯渇
- 正当なユーザーのアクセス阻害
- 計算リソースの不正利用

**対策:**
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/simulate")
@limiter.limit("10/minute")  # 1分間に10回まで
def run_simulation(request: Request, property_data: dict):
```

#### SEC-BACKEND-005: API認証の完全欠如 (🔴 重大リスク)
**脆弱性の詳細:**
- 全てのAPIエンドポイントが認証なしでアクセス可能
- APIキーやJWTトークンの検証がない
- 権限制御が実装されていない

**影響:**
- 不正なAPIアクセス
- 計算リソースの悪用
- 機密データの漏洩
- システムの無制限利用

**対策:**
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    # JWT トークンの検証ロジック
    if not verify_jwt_token(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    return token

@app.post("/api/simulate")
def run_simulation(property_data: dict, token: str = Depends(verify_token)):
```

#### SEC-BACKEND-006: リクエスト検証の不備 (🟡 高リスク)
**脆弱性の詳細:**
- Pydanticモデルが使用されていない
- 入力データの型検証が不十分
- 必須フィールドの検証がない
- データ範囲の検証がない

**影響:**
- 不正なデータによるアプリケーション停止
- 計算エラーの発生
- メモリ消費攻撃
- 型エラーによる情報漏洩

**対策:**
```python
from pydantic import BaseModel, validator
from typing import Optional

class PropertyData(BaseModel):
    monthly_rent: float
    vacancy_rate: float
    purchase_price: float
    
    @validator('monthly_rent')
    def validate_monthly_rent(cls, v):
        if v <= 0 or v > 10000000:
            raise ValueError('月額賃料は1円から1000万円の範囲で入力してください')
        return v

@app.post("/api/simulate")
def run_simulation(property_data: PropertyData):
```

#### SEC-BACKEND-007: HTTPSリダイレクトの未実装 (🟡 高リスク)
**脆弱性の詳細:**
- HTTP通信を強制的にHTTPSにリダイレクトする機能がない
- 通信の暗号化が保証されない

**影響:**
- 中間者攻撃（MITM）
- 通信内容の盗聴
- セッションハイジャック

### 3. Authentication & Authorization（認証・認可）

#### SEC-BACKEND-008: 認証システムの完全欠如 (🔴 重大リスク)
**脆弱性の詳細:**
- バックエンドに認証機能が実装されていない
- ユーザー識別機能がない
- セッション管理がない

**影響:**
- 不正なアクセス
- データの無制限アクセス
- ユーザー間のデータ分離ができない

**対策:**
```python
from passlib.context import CryptContext
from jose import JWTError, jwt

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
```

#### SEC-BACKEND-009: 権限制御の未実装 (🔴 重大リスク)
**脆弱性の詳細:**
- ロールベースアクセス制御（RBAC）がない
- APIエンドポイント単位での権限制御がない
- 管理者権限の概念がない

**影響:**
- 権限昇格攻撃
- 不正な機能へのアクセス
- データの不正操作

### 4. Data Processing Security（データ処理セキュリティ）

#### SEC-BACKEND-010: 安全でない数値計算 (🟡 高リスク)
**脆弱性の詳細:**
```python
# calculations.py内の問題のある計算
def calculate_irr(...):
    try:
        # 複雑な計算
        return irr_approx if irr_approx > -100 and irr_approx < 1000 else None
    except:  # 漠然とした例外処理
        return None
```

**影響:**
- ゼロ除算エラーによるサービス停止
- 無限ループの可能性
- オーバーフロー攻撃
- 計算結果の信頼性低下

**対策:**
```python
import decimal
from decimal import Decimal, InvalidOperation

def calculate_irr_safe(annual_cf: float, years: int, sale_profit: float, 
                      self_funding: float, annual_loan: float) -> Optional[float]:
    try:
        # Decimalを使用した精密計算
        annual_cf_decimal = Decimal(str(annual_cf))
        if annual_cf_decimal < 0 or years <= 0:
            raise ValueError("Invalid input parameters")
        # 具体的な計算処理
    except (ValueError, InvalidOperation, OverflowError) as e:
        logger.error(f"IRR calculation error: {e}")
        return None
```

#### SEC-BACKEND-011: 入力サニタイゼーションの不備 (🟡 高リスク)
**脆弱性の詳細:**
- 辞書型データの直接使用
- `.get()`メソッドでのデフォルト値が0
- 負の値の検証がない

**影響:**
- 不正な計算結果
- アプリケーションロジックの破綻
- 意図しない動作

**対策:**
```python
def sanitize_property_data(data: dict) -> dict:
    sanitized = {}
    for key, value in data.items():
        if isinstance(value, (int, float)):
            if key in ['monthly_rent', 'purchase_price'] and value <= 0:
                raise ValueError(f"{key} must be positive")
            sanitized[key] = max(0, float(value))
        else:
            sanitized[key] = value
    return sanitized
```

#### SEC-BACKEND-012: メモリ消費攻撃の脆弱性 (🟡 高リスク)
**脆弱性の詳細:**
- `calculate_cash_flow_table`関数で大きな`holding_years`値による攻撃
- メモリ使用量の制限がない
- 計算時間の制限がない

**影響:**
- サーバーメモリの枯渇
- DoS攻撃
- システム全体の停止

**対策:**
```python
MAX_HOLDING_YEARS = 50
MAX_CALCULATION_TIME = 30  # 秒

def calculate_cash_flow_table(property_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    holding_years = property_data.get('holding_years', 0)
    if holding_years > MAX_HOLDING_YEARS:
        raise ValueError(f"保有年数は{MAX_HOLDING_YEARS}年以内で設定してください")
    
    import signal
    signal.alarm(MAX_CALCULATION_TIME)
    try:
        # 計算処理
        pass
    finally:
        signal.alarm(0)
```

### 5. File Handling Security（ファイル処理セキュリティ）

#### SEC-BACKEND-013: .envファイルの露出リスク (🟡 高リスク)
**脆弱性の詳細:**
```python
from dotenv import load_dotenv
load_dotenv()  # .envファイルの自動読み込み
```

**影響:**
- 環境変数の不適切な管理
- APIキーの意図しない露出
- 設定ファイルの漏洩

**対策:**
```python
import os
from pathlib import Path

# .envファイルの存在確認と安全な読み込み
env_path = Path('.env')
if env_path.exists() and env_path.stat().st_mode & 0o077:
    raise SecurityError(".env file has insecure permissions")

load_dotenv(env_path)
```

#### SEC-BACKEND-014: ログファイルのセキュリティ不備 (🟢 低リスク)
**脆弱性の詳細:**
- アプリケーションログが実装されていない
- エラーログの記録がない
- セキュリティイベントの記録がない

**影響:**
- セキュリティインシデントの検知不能
- 攻撃の追跡ができない
- 監査証跡の欠如

### 6. Infrastructure Security（インフラストラクチャセキュリティ）

#### SEC-BACKEND-015: 依存関係の脆弱性 (🔴 重大リスク)
**脆弱性の詳細:**
```
fastapi==0.99.1          # CVE-2024-24762 (DoS攻撃)
uvicorn[standard]==0.23.2 # 古いバージョン
requests==2.31.0         # CVE-2023-32681 (証明書検証バイパス)
```

**影響:**
- DoS攻撃への脆弱性
- SSL証明書検証のバイパス
- 中間者攻撃の可能性

**対策:**
```
fastapi>=0.104.1
uvicorn[standard]>=0.24.0
requests>=2.32.0
```

#### SEC-BACKEND-016: セキュリティヘッダーの欠如 (🟡 高リスク)
**脆弱性の詳細:**
- セキュリティヘッダーが設定されていない
- HSTS、CSP、X-Frame-Optionsなどが未実装

**影響:**
- クリックジャッキング攻撃
- XSS攻撃の悪用拡大
- 中間者攻撃

**対策:**
```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

app.add_middleware(HTTPSRedirectMiddleware)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["ooya-dx.com", "*.ooya-dx.com"])

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

#### SEC-BACKEND-017: 環境変数の不適切な管理 (🟡 高リスク)
**脆弱性の詳細:**
```python
openai_api_key = os.getenv("OPENAI_API_KEY", "")  # デフォルト値が空文字
real_estate_api_key = os.getenv("REAL_ESTATE_API_KEY", "")
```

**影響:**
- APIキーの設定漏れを検知できない
- 外部サービスとの通信失敗
- セキュリティ設定の不備

**対策:**
```python
def get_required_env(key: str) -> str:
    value = os.getenv(key)
    if not value:
        raise ValueError(f"Required environment variable {key} is not set")
    return value

openai_api_key = get_required_env("OPENAI_API_KEY")
real_estate_api_key = get_required_env("REAL_ESTATE_API_KEY")
```

#### SEC-BACKEND-018: デバッグモードの本番環境での有効化リスク (🟡 高リスク)
**脆弱性の詳細:**
- FastAPIのデバッグモード設定が明示的でない
- 本番環境でのデバッグ情報露出の可能性

**影響:**
- 詳細なエラー情報の露出
- 内部構造の開示
- 攻撃者への情報提供

**対策:**
```python
import os

DEBUG = os.getenv("DEBUG", "False").lower() == "true"

app = FastAPI(
    title="大家DX API",
    description="不動産投資シミュレーター RESTful API",
    version="1.0.0",
    debug=DEBUG
)
```

#### SEC-BACKEND-019: HTTPメソッド制限の不備 (🟢 低リスク)
**脆弱性の詳細:**
- 不要なHTTPメソッドが許可されている可能性
- OPTIONSメソッドの応答が適切でない可能性

**影響:**
- 情報の意図しない開示
- セキュリティスキャンでの検出

#### SEC-BACKEND-020: 例外処理の情報漏洩 (🟡 高リスク)
**脆弱性の詳細:**
```python
except:  # 漠然とした例外処理
    return None
```

**影響:**
- エラーの隠蔽
- デバッグ困難
- セキュリティインシデントの見逃し

**対策:**
```python
import logging
logger = logging.getLogger(__name__)

try:
    # 計算処理
    pass
except ValueError as e:
    logger.error(f"Calculation error: {e}")
    raise HTTPException(status_code=400, detail="Invalid input parameters")
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    raise HTTPException(status_code=500, detail="Internal server error")
```

#### SEC-BACKEND-021: ヘルスチェックエンドポイントの情報漏洩 (🟢 低リスク)
**脆弱性の詳細:**
```python
@app.get("/")
def read_root():
    return {
        "message": "大家DX API",
        "version": "1.0.0",     # バージョン情報の露出
        "status": "running"
    }
```

**影響:**
- システム情報の露出
- セキュリティスキャンでの検出
- 攻撃者への情報提供

## 📊 新発見脆弱性の統計

- 🔴 **重大リスク**: 7件（SEC-BACKEND-001, 003, 004, 005, 008, 009, 015）
- 🟡 **高リスク**: 11件（SEC-BACKEND-002, 006, 007, 010, 011, 012, 013, 016, 017, 018, 020）
- 🟢 **低リスク**: 3件（SEC-BACKEND-014, 019, 021）
- **総計: 21件の新たなバックエンド脆弱性**

## 🛡️ 緊急対応が必要な項目（1週間以内）

### 1. 最優先対応（即座に対応）
- **SEC-BACKEND-003**: CORS設定の修正
- **SEC-BACKEND-004**: レート制限の実装
- **SEC-BACKEND-005**: API認証の実装
- **SEC-BACKEND-015**: 依存関係の更新

### 2. 高優先対応（3日以内）
- **SEC-BACKEND-001**: データベース実装の検討
- **SEC-BACKEND-008**: 認証システムの実装
- **SEC-BACKEND-009**: 権限制御の実装

## 🔧 推奨される包括的セキュリティ対策

### 1. セキュリティミドルウェアの実装
```python
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
import logging

# ロギング設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# アプリケーション初期化
app = FastAPI(debug=False)

# セキュリティミドルウェア
app.add_middleware(HTTPSRedirectMiddleware)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["ooya-dx.com", "*.ooya-dx.com"])
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ooya-dx.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

# レート制限
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
```

### 2. 認証・認可システム
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # JWT検証ロジック
    pass

@app.post("/api/simulate")
@limiter.limit("10/minute")
def run_simulation(request: Request, property_data: PropertyData, 
                  token: str = Depends(verify_token)):
    # 認証済みユーザーのみアクセス可能
    pass
```

### 3. データベース統合
```python
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

Base = declarative_base()

class Simulation(Base):
    __tablename__ = "simulations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    property_data = Column(String)  # JSON形式
    results = Column(String)        # JSON形式
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
```

### 4. セキュリティモニタリング
```python
import logging
from datetime import datetime

security_logger = logging.getLogger("security")

@app.middleware("http")
async def security_logging(request: Request, call_next):
    start_time = datetime.utcnow()
    
    # リクエストログ
    security_logger.info(f"Request: {request.method} {request.url} from {request.client.host}")
    
    response = await call_next(request)
    
    # レスポンスログ
    process_time = (datetime.utcnow() - start_time).total_seconds()
    security_logger.info(f"Response: {response.status_code} in {process_time}s")
    
    return response
```

## 🚀 実装ロードマップ

### フェーズ1: 緊急対応（1週間）
1. CORS設定の修正
2. レート制限の実装
3. 依存関係の更新
4. 基本的なAPI認証の実装

### フェーズ2: セキュリティ強化（2週間）
1. データベース統合
2. 包括的な認証・認可システム
3. 入力検証の強化
4. セキュリティヘッダーの実装

### フェーズ3: 監視・運用（1ヶ月）
1. セキュリティログの実装
2. 監視システムの構築
3. インシデント対応手順の策定
4. セキュリティテストの自動化

## まとめ

バックエンドAPI（simulator-api）において21件の新たなセキュリティ脆弱性を発見しました。特に重大なのは：

1. **認証システムの完全欠如** - 誰でもAPIを無制限に利用可能
2. **CORS設定の危険な設定** - 全てのオリジンからのアクセスを許可
3. **レート制限の未実装** - DoS攻撃への脆弱性
4. **データベースの不在** - データの一貫性と永続化の問題
5. **依存関係の脆弱性** - 既知のCVEを持つライブラリの使用

これらの脆弱性は、既存のフロントエンドセキュリティ課題と組み合わさることで、アプリケーション全体のセキュリティリスクを大幅に増大させています。早急な対応が必要です。