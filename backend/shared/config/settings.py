"""
共通設定管理
"""
import os
from typing import Optional

class Settings:
    # API設定
    REAL_ESTATE_API_KEY: Optional[str] = os.getenv("REAL_ESTATE_API_KEY")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    
    # Firebase設定
    FIREBASE_PROJECT_ID: Optional[str] = os.getenv("FIREBASE_PROJECT_ID")
    FIREBASE_PRIVATE_KEY: Optional[str] = os.getenv("FIREBASE_PRIVATE_KEY")
    
    # Stripe設定
    STRIPE_SECRET_KEY: Optional[str] = os.getenv("STRIPE_SECRET_KEY")
    STRIPE_WEBHOOK_SECRET: Optional[str] = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    # データベース設定
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")
    
    # CORS設定
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://your-frontend-domain.com"
    ]

settings = Settings()