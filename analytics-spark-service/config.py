import os

def get_secret(key, default=None):
    """Obtiene un secreto de Docker o una variable de entorno."""
    # 1. Intentar desde variable de entorno
    val = os.getenv(key)
    if val:
        return val
    
    # 2. Intentar desde Docker Secret (/run/secrets/...)
    secret_path = f"/run/secrets/{key.lower()}"
    if os.path.exists(secret_path):
        try:
            with open(secret_path, "r") as f:
                return f.read().strip()
        except Exception:
            pass
            
    return default

APP_HOST = get_secret("APP_HOST", "0.0.0.0")
APP_PORT = int(get_secret("APP_PORT", "8010"))

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Carpeta raíz de datos (contiene el CSV preempaquetado y la subcarpeta uploads/)
DATA_FOLDER = get_secret(
    "DATA_FOLDER",
    os.path.join(BASE_DIR, "data")
)

# Carpeta para datasets subidos por el usuario
UPLOAD_FOLDER = get_secret(
    "UPLOAD_FOLDER",
    os.path.join(BASE_DIR, "data", "uploads")
)

SPARK_MASTER_URL = get_secret("SPARK_MASTER_URL", "local[*]")
JWT_SECRET = get_secret("JWT_SECRET", "supersecretkey_auth_2026")

ALLOWED_EXTENSIONS = {"csv", "json", "parquet"}