from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.auth import router as auth_router
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.api import register_stubs

app = FastAPI(
    title="Academic Performance Prediction System",
    description="API for predicting academic performance using ML models",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])

# Stubs are registered only in non-production environments for frontend development
register_stubs(app)


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.get("/protected")
async def protected_endpoint(current_user: User = Depends(get_current_user)):
    return {"message": "Access granted", "user_id": current_user.id, "email": current_user.email}
