import os
from werkzeug.utils import secure_filename
from config import UPLOAD_FOLDER, DATA_FOLDER, ALLOWED_EXTENSIONS


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def save_dataset(file):
    if file.filename == "":
        raise ValueError("No se seleccionó ningún archivo")

    if not allowed_file(file.filename):
        raise ValueError(f"Solo se permiten archivos: {', '.join(ALLOWED_EXTENSIONS)}")

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    filename = secure_filename(file.filename)
    path = os.path.join(UPLOAD_FOLDER, filename)

    file.save(path)

    return {
        "filename": filename,
        "path": path
    }


def list_datasets():
    """Lista CSVs disponibles: primero los preempaquetados en data/, luego los subidos en uploads/."""
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(DATA_FOLDER, exist_ok=True)

    seen = set()
    datasets = []

    # 1. Archivos en data/ (preempaquetados con la imagen)
    for f in os.listdir(DATA_FOLDER):
        if any(f.endswith(ext) for ext in ALLOWED_EXTENSIONS) and os.path.isfile(os.path.join(DATA_FOLDER, f)):
            seen.add(f)
            datasets.append(f)

    # 2. Archivos subidos por el usuario en data/uploads/
    for f in os.listdir(UPLOAD_FOLDER):
        if any(f.endswith(ext) for ext in ALLOWED_EXTENSIONS) and f not in seen:
            datasets.append(f)

    return datasets


def get_dataset_path(filename):
    filename = secure_filename(filename)

    # Buscar primero en data/ (preempaquetado)
    path_data = os.path.join(DATA_FOLDER, filename)
    if os.path.exists(path_data):
        return path_data

    # Luego en uploads/
    path_upload = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(path_upload):
        return path_upload

    raise FileNotFoundError(f"Dataset '{filename}' no encontrado")