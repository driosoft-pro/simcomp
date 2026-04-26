from flask import Blueprint, jsonify, request
from services.dataset_service import save_dataset, list_datasets, get_dataset_path
from services.profiling_service import (
    dataset_summary,
    missing_values,
    numeric_columns,
    categorical_columns,
    numeric_statistics,
    top_categories,
    correlation_data,
    column_recommendations,
    correlation_matrix,
    numeric_top_metrics,
    paginated_data,
    execute_spark_code
)

api_bp = Blueprint("api", __name__)


@api_bp.route("/datasets", methods=["GET"])
def datasets():
    return jsonify(list_datasets())


@api_bp.route("/datasets/upload", methods=["POST"])
def upload_dataset():
    if "file" not in request.files:
        return jsonify({"error": "No se envió ningún archivo"}), 400

    try:
        result = save_dataset(request.files["file"])
        return jsonify({
            "message": "Dataset cargado correctamente",
            "dataset": result["filename"]
        })
    except ValueError as error:
        return jsonify({"error": str(error)}), 400


@api_bp.route("/datasets/<filename>/summary")
def summary(filename):
    path = get_dataset_path(filename)
    return jsonify(dataset_summary(path))


@api_bp.route("/datasets/<filename>/missing")
def missing(filename):
    path = get_dataset_path(filename)
    return jsonify(missing_values(path))


@api_bp.route("/datasets/<filename>/numeric-columns")
def nums(filename):
    path = get_dataset_path(filename)
    return jsonify(numeric_columns(path))


@api_bp.route("/datasets/<filename>/categorical-columns")
def cats(filename):
    path = get_dataset_path(filename)
    return jsonify(categorical_columns(path))


@api_bp.route("/datasets/<filename>/numeric-statistics")
def stats(filename):
    path = get_dataset_path(filename)
    return jsonify(numeric_statistics(path))


@api_bp.route("/datasets/<filename>/top-categories")
def categories(filename):
    column = request.args.get("column")

    if not column:
        return jsonify({"error": "Debe enviar ?column=nombre_columna"}), 400

    path = get_dataset_path(filename)
    return jsonify(top_categories(path, column))


@api_bp.route("/datasets/<filename>/correlation")
def correlation(filename):
    x = request.args.get("x")
    y = request.args.get("y")

    if not x or not y:
        return jsonify({"error": "Debe enviar ?x=columna1&y=columna2"}), 400

    path = get_dataset_path(filename)
    return jsonify(correlation_data(path, x, y))


@api_bp.route("/datasets/<filename>/recommendations")
def recommendations(filename):
    path = get_dataset_path(filename)
    return jsonify(column_recommendations(path))


@api_bp.route("/datasets/<filename>/correlation-matrix")
def correlations(filename):
    path = get_dataset_path(filename)
    return jsonify(correlation_matrix(path))


@api_bp.route("/datasets/<filename>/numeric-top")
def numeric_top(filename):
    path = get_dataset_path(filename)
    return jsonify(numeric_top_metrics(path))


@api_bp.route("/datasets/<filename>/data")
def data_paginated(filename):
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 10, type=int)

    path = get_dataset_path(filename)
    return jsonify(paginated_data(path, page, limit))


@api_bp.route("/datasets/<filename>/query", methods=["POST"])
def query(filename):
    data = request.get_json()
    code = data.get("code")

    if not code:
        return jsonify({"error": "No se envió ningún código"}), 400

    path = get_dataset_path(filename)
    return jsonify(execute_spark_code(path, code))

    