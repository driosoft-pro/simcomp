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
    execute_spark_code,
    # SIMCOMP-specific
    simcomp_kpis,
    simcomp_por_ciudad,
    simcomp_por_estado,
    simcomp_por_tipo_sancion,
    simcomp_por_valor_multa,
    simcomp_tendencia_mensual,
    simcomp_por_marca,
    simcomp_por_tipo_servicio,
    simcomp_por_categoria_licencia,
    simcomp_por_anio,
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


# @api_bp.route("/datasets/<filename>/query", methods=["POST"])
# def query(filename):
#     """
#     ⚠️ ADVERTENCIA DE SEGURIDAD: Este endpoint permite ejecución de código arbitrario (RCE).
#     Se ha desactivado en producción por auditoría de seguridad.
#     """
#     return jsonify({"error": "Endpoint desactivado por motivos de seguridad (RCE Audit)"}), 403


# ─── SIMCOMP endpoints ───────────────────────────────────────────────────────

@api_bp.route("/datasets/<filename>/simcomp/kpis")
def sc_kpis(filename):
    path = get_dataset_path(filename)
    return jsonify(simcomp_kpis(path))


@api_bp.route("/datasets/<filename>/simcomp/por-ciudad")
def sc_por_ciudad(filename):
    limit = request.args.get("limit", 10, type=int)
    path = get_dataset_path(filename)
    return jsonify(simcomp_por_ciudad(path, limit))


@api_bp.route("/datasets/<filename>/simcomp/por-estado")
def sc_por_estado(filename):
    path = get_dataset_path(filename)
    return jsonify(simcomp_por_estado(path))


@api_bp.route("/datasets/<filename>/simcomp/por-tipo-sancion")
def sc_por_tipo_sancion(filename):
    path = get_dataset_path(filename)
    return jsonify(simcomp_por_tipo_sancion(path))


@api_bp.route("/datasets/<filename>/simcomp/por-valor-multa")
def sc_por_valor_multa(filename):
    path = get_dataset_path(filename)
    return jsonify(simcomp_por_valor_multa(path))


@api_bp.route("/datasets/<filename>/simcomp/tendencia-mensual")
def sc_tendencia_mensual(filename):
    path = get_dataset_path(filename)
    return jsonify(simcomp_tendencia_mensual(path))


@api_bp.route("/datasets/<filename>/simcomp/por-marca")
def sc_por_marca(filename):
    path = get_dataset_path(filename)
    return jsonify(simcomp_por_marca(path))


@api_bp.route("/datasets/<filename>/simcomp/por-tipo-servicio")
def sc_por_tipo_servicio(filename):
    path = get_dataset_path(filename)
    return jsonify(simcomp_por_tipo_servicio(path))


@api_bp.route("/datasets/<filename>/simcomp/por-categoria-licencia")
def sc_por_categoria_licencia(filename):
    path = get_dataset_path(filename)
    return jsonify(simcomp_por_categoria_licencia(path))


@api_bp.route("/datasets/<filename>/simcomp/por-anio")
def sc_por_anio(filename):
    path = get_dataset_path(filename)
    return jsonify(simcomp_por_anio(path))