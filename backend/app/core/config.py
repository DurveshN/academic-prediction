from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    DATABASE_URL: str = Field(default="postgresql+asyncpg://user:password@localhost:5432/academic_db")
    JWT_SECRET_KEY: str = Field(default="your-secret-key-here")
    JWT_ALGORITHM: str = Field(default="HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    MLFLOW_TRACKING_URI: str = Field(default="http://localhost:5000")
    ENVIRONMENT: str = Field(default="local")
    TEXT_MODEL: str = Field(default="distilbert-base-uncased")
    USE_MINILM_FALLBACK: bool = Field(default=False)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
