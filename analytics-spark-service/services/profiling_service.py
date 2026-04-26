from pyspark.sql.functions import col, count, when, trim
from pyspark.sql.types import NumericType, StringType
from services.spark_session import spark


def load_csv(path):
    return (
        spark.read
        .option("header", True)
        .option("inferSchema", True)
        .option("multiLine", True)
        .option("escape", "\"")
        .csv(path)
    )


def dataset_summary(path):
    df = load_csv(path)

    return {
        "total_rows": df.count(),
        "total_columns": len(df.columns),
        "columns": df.columns,
        "schema": [
            {
                "name": field.name,
                "type": str(field.dataType)
            }
            for field in df.schema.fields
        ]
    }


def missing_values(path):
    df = load_csv(path)

    total_rows = df.count()
    result = []

    for field in df.schema.fields:
        column_name = field.name
        data_type = field.dataType

        if isinstance(data_type, StringType):
            condition = col(column_name).isNull() | (trim(col(column_name)) == "")
        else:
            condition = col(column_name).isNull()

        missing_count = df.select(
            count(when(condition, column_name)).alias("missing")
        ).collect()[0]["missing"]

        percentage = 0 if total_rows == 0 else round((missing_count / total_rows) * 100, 2)

        result.append({
            "column": column_name,
            "missing": missing_count,
            "percentage": percentage
        })

    return result


def numeric_columns(path):
    df = load_csv(path)

    return [
        field.name
        for field in df.schema.fields
        if isinstance(field.dataType, NumericType)
    ]


def categorical_columns(path):
    df = load_csv(path)

    return [
        field.name
        for field in df.schema.fields
        if isinstance(field.dataType, StringType)
    ]


def numeric_statistics(path):
    df = load_csv(path)
    nums = numeric_columns(path)

    if not nums:
        return []

    result = df.select(nums).summary("count", "mean", "min", "max").toPandas()

    return result.to_dict(orient="records")


def top_categories(path, column_name, limit=10):
    df = load_csv(path)

    if column_name not in df.columns:
        raise ValueError("La columna no existe")

    result = (
        df.groupBy(column_name)
        .count()
        .orderBy(col("count").desc())
        .limit(limit)
        .toPandas()
    )

    return {
        "labels": result[column_name].astype(str).tolist(),
        "values": result["count"].tolist()
    }


def correlation_data(path, x_column, y_column):
    df = load_csv(path)

    nums = numeric_columns(path)

    if x_column not in nums or y_column not in nums:
        raise ValueError("Ambas columnas deben ser numéricas")

    result = (
        df.select(x_column, y_column)
        .dropna()
        .limit(500)
        .toPandas()
    )

    return {
        "points": result[[x_column, y_column]].to_dict(orient="records")
    }

def column_recommendations(path):
    df = load_csv(path)

    recommendations = []

    for field in df.schema.fields:
        column_name = field.name
        data_type = field.dataType

        distinct_count = df.select(column_name).distinct().count()

        if isinstance(data_type, NumericType):
            chart = "KPI / Histograma / Correlación"
            usage = "Útil para totales, promedios, máximos, mínimos y análisis numérico."
        elif isinstance(data_type, StringType):
            if distinct_count <= 20:
                chart = "Barras / Donut / Treemap"
                usage = "Útil para comparar categorías."
            else:
                chart = "Tabla / Top 10"
                usage = "Útil para ranking de valores más frecuentes."
        else:
            chart = "Línea de tiempo / Tabla"
            usage = "Útil si representa fechas o eventos."

        recommendations.append({
            "column": column_name,
            "type": str(data_type),
            "distinct": distinct_count,
            "recommended_visual": chart,
            "usage": usage
        })

    return recommendations


def correlation_matrix(path):
    df = load_csv(path)
    nums = numeric_columns(path)

    if len(nums) < 2:
        return {
            "columns": nums,
            "matrix": []
        }

    matrix = []

    for x in nums:
        row = []
        for y in nums:
            value = df.stat.corr(x, y)
            row.append(round(value, 4) if value is not None else 0)
        matrix.append(row)

    return {
        "columns": nums,
        "matrix": matrix
    }


def numeric_top_metrics(path):
    df = load_csv(path)
    nums = numeric_columns(path)

    if not nums:
        return []

    result = df.select(nums).summary("mean").toPandas()

    metrics = []

    for col_name in nums:
        try:
            value = float(result[col_name][0])
        except:
            value = 0

        metrics.append({
            "column": col_name,
            "mean": round(value, 2)
        })

    metrics = sorted(metrics, key=lambda x: x["mean"], reverse=True)[:10]

    return metrics


def paginated_data(path, page=1, limit=10):
    df = load_csv(path)

    offset = (page - 1) * limit

    total = df.count()

    data = df.toPandas().iloc[offset:offset + limit].to_dict(orient="records")

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "data": data
    }


def execute_spark_code(path, code):
    import sys
    import io
    from contextlib import redirect_stdout

    df = load_csv(path)
    df.createOrReplaceTempView("dataset")
    
    # Capturar la salida estándar (para .show())
    f = io.StringIO()
    try:
        with redirect_stdout(f):
            # Proporcionar spark y df al contexto de ejecución
            local_vars = {"spark": spark, "df": df}
            exec(code, {}, local_vars)
        
        output = f.getvalue()
        return {
            "success": True,
            "output": output if output else "Ejecutado correctamente (sin salida)."
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }