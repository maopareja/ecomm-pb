from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://mongo:27017"
    DATABASE_NAME: str = "saas_ecommerce"
    REDIS_URL: str = "redis://redis:6379/0"
    RABBITMQ_URL: str = "amqp://guest:guest@rabbitmq:5672//"
    SECRET_KEY: str = "supersecretkey" # In production, use a strong env var
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours for development stability
    DOMAIN: str | None = None # Allow cookie to bind to current host (ecommpb.local, localhost)
    COOKIE_SECURE: bool = True # Enabled for Secure Cookies requirement
    COOKIE_NAME: str = "ecomm_pb_token" # Unique name to avoid localhost collisions

    class Config:
        env_file = ".env"

settings = Settings()
