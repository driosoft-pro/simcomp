import os
from werkzeug.utils import secure_filename
from config import UPLOAD_FOLDER, ALLOWED_EXTENSIONS


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def save_dataset(file):
    if file.filename == "":
        raise ValueError("No se seleccionó ningún archivo")

    if not allowed_file(file.filename):
        raise ValueError("Solo se permiten archivos CSV")

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    filename = secure_filename(file.filename)
    path = os.path.join(UPLOAD_FOLDER, filename)

    file.save(path)

    return {
        "filename": filename,
        "path": path
    }


def list_datasets():
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    return [
        file for file in os.listdir(UPLOAD_FOLDER)
        if file.endswith(".csv")
    ]


def get_dataset_path(filename):
    filename = secure_filename(filename)
    path = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.exists(path):
        raise FileNotFoundError("Dataset no encontrado")

    return path