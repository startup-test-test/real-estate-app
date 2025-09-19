"""
Ultra Simple Test App for Render Deployment
"""

import os
from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Ultra simple API is running", "status": "ok"}

@app.get("/test")
def test():
    return {"test": "success", "python_version": "3.10.13"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("ultra_simple_app:app", host="0.0.0.0", port=port)