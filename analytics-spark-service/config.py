import os

APP_HOST = os.getenv("APP_HOST", "0.0.0.0")
APP_PORT = int(os.getenv("APP_PORT", "8010"))

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Carpeta raíz de datos (contiene el CSV preempaquetado y la subcarpeta uploads/)
DATA_FOLDER = os.getenv(
    "DATA_FOLDER",
    os.path.join(BASE_DIR, "data")
)

# Carpeta para datasets subidos por el usuario
UPLOAD_FOLDER = os.getenv(
    "UPLOAD_FOLDER",
    os.path.join(BASE_DIR, "data", "uploads")
)

SPARK_MASTER_URL = os.getenv("SPARK_MASTER_URL", "local[*]")

ALLOWED_EXTENSIONS = {"csv"}