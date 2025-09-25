"""
Simplified FastAPI App for Testing Deployment
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Real Estate API Test")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "API is running", "status": "ok"}

@app.get("/health")
async def health():
    api_key = "configured" if os.getenv("VITE_REAL_ESTATE_API_KEY") else "not_configured"
    return {
        "status": "healthy",
        "api_key": api_key
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("simple_app:app", host="0.0.0.0", port=port, reload=False)