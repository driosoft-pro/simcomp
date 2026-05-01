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
    total_rows = df.count()
    
    # Lista curada de importancia para SIMCOMP
    important_keywords = [
        "ciudad", "estado_comparendo", "tipo_sancion", "marca_vehiculo", 
        "servicio_vehiculo", "licencia_categoria", "infraccion_codigo", 
        "infraccion_descripcion", "linea_vehiculo", "modelo_vehiculo"
    ]
    
    # 1. Identificar columnas que coinciden con los keywords importantes
    important_cols = []
    for kw in important_keywords:
        match = next((c for c in df.columns if kw == c.lower() or (kw in c.lower() and len(c) < 25)), None)
        if match and match not in important_cols:
            important_cols.append(match)
            
    # 2. Si faltan para completar 8, buscar otras columnas con buena cardinalidad (categóricas reales)
    other_cats = []
    if len(important_cols) < 8:
        for field in df.schema.fields:
            if isinstance(field.dataType, StringType) and field.name not in important_cols:
                distinct_count = df.select(field.name).distinct().count()
                # Categoría útil: entre 2 y 50 valores distintos
                if 2 <= distinct_count <= 50:
                    other_cats.append(field.name)
    
    # Combinar y limitar a los 8 más importantes
    final_cols = (important_cols + other_cats)[:8]
    return final_cols


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

    # Limpiar espacios y manejar nulos para una mejor gráfica
    result = (
        df.filter(col(column_name).isNotNull())
        .withColumn(column_name, trim(col(column_name)))
        .groupBy(column_name)
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
    total_rows = df.count()
    recommendations = []

    for field in df.schema.fields:
        column_name = field.name
        data_type = field.dataType
        distinct_count = df.select(column_name).distinct().count()

        if isinstance(data_type, NumericType):
            chart = "KPI / Histograma / Correlación"
            usage = "Útil para totales, promedios, máximos, mínimos y análisis numérico."
        elif isinstance(data_type, StringType):
            if distinct_count <= 2:
                chart = "Donut / Pie"
                usage = "Variable binaria o flag."
            elif distinct_count <= 25:
                chart = "Barras / Treemap"
                usage = "Categoría bien definida para comparación."
            elif distinct_count > 100 and (distinct_count / total_rows) > 0.5:
                chart = "Tabla de detalles"
                usage = "Probablemente un ID o nombre único. No apto para gráficos de distribución."
            else:
                chart = "Top 10 / Ranking"
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


# ─── SIMCOMP-specific analytics ─────────────────────────────────────────────

def simcomp_kpis(path):
    """Devuelve total, pendientes, pagados y anulados."""
    df = load_csv(path)
    total = df.count()
    estado_col = next(
        (c for c in df.columns if c.lower() == "estado_comparendo"),
        next((c for c in df.columns if "estado" in c.lower()), None)
    )
    if not estado_col:
        return {"total": total, "pendientes": 0, "pagados": 0, "anulados": 0}

    counts = (
        df.groupBy(estado_col)
        .count()
        .toPandas()
        .set_index(estado_col)["count"]
        .to_dict()
    )
    return {
        "total":      total,
        "pendientes": int(counts.get("PENDIENTE", 0)),
        "pagados":    int(counts.get("PAGADO",    0)),
        "anulados":   int(counts.get("ANULADO",   0)),
    }


def simcomp_por_ciudad(path, limit=10):
    """Top ciudades con más comparendos."""
    df = load_csv(path)
    ciudad_col = next(
        (c for c in df.columns if c.lower() == "ciudad"),
        next((c for c in df.columns if "municipio" in c.lower() or "ciudad_infraccion" in c.lower()), None)
    )
    if not ciudad_col:
        return {"labels": [], "values": []}
    result = (
        df.groupBy(ciudad_col)
        .count()
        .orderBy(col("count").desc())
        .limit(limit)
        .toPandas()
    )
    return {
        "labels": result[ciudad_col].astype(str).tolist(),
        "values": result["count"].tolist()
    }


def simcomp_por_estado(path):
    """Distribución de comparendos por estado."""
    df = load_csv(path)
    estado_col = next(
        (c for c in df.columns if c.lower() == "estado_comparendo"),
        next((c for c in df.columns if "estado" in c.lower()), None)
    )
    if not estado_col:
        return {"labels": [], "values": []}
    result = (
        df.groupBy(estado_col)
        .count()
        .orderBy(col("count").desc())
        .toPandas()
    )
    return {
        "labels": result[estado_col].astype(str).tolist(),
        "values": result["count"].tolist()
    }


def simcomp_por_tipo_sancion(path):
    """Distribución por tipo de sanción."""
    df = load_csv(path)
    col_name = next(
        (c for c in df.columns if c.lower() == "tipo_sancion"),
        next((c for c in df.columns if "sancion" in c.lower()), None)
    )
    if not col_name:
        return {"labels": [], "values": []}
    result = (
        df.groupBy(col_name)
        .count()
        .orderBy(col("count").desc())
        .toPandas()
    )
    return {
        "labels": result[col_name].astype(str).tolist(),
        "values": result["count"].tolist()
    }


def simcomp_por_valor_multa(path):
    """Frecuencia de los valores de multa más comunes."""
    df = load_csv(path)
    val_col = next(
        (c for c in df.columns if c.lower() == "valor_multa"),
        next((c for c in df.columns if "valor" in c.lower() or "multa" in c.lower()), None)
    )
    if not val_col:
        return {"labels": [], "values": []}
    result = (
        df.groupBy(val_col)
        .count()
        .orderBy(col("count").desc())
        .limit(10)
        .toPandas()
    )
    return {
        "labels": [f"${int(float(v)):,}" for v in result[val_col].tolist()],
        "values": result["count"].tolist()
    }


def simcomp_tendencia_mensual(path):
    """Comparendos agrupados por mes."""
    from pyspark.sql.functions import month, year as yr, to_timestamp, concat_ws, lpad
    df = load_csv(path)
    fecha_col = next(
        (c for c in df.columns if c.lower() == "fecha_comparendo"),
        next((c for c in df.columns if "fecha" in c.lower()), None)
    )
    if not fecha_col:
        return {"labels": [], "values": []}
    df2 = (
        df.withColumn("_ts", to_timestamp(col(fecha_col)))
          .withColumn("_year", yr(col("_ts")))
          .withColumn("_month", month(col("_ts")))
          .withColumn("_label", concat_ws("-", col("_year"), lpad(col("_month"), 2, "0")))
    )
    result = (
        df2.groupBy("_year", "_month", "_label")
        .count()
        .orderBy("_year", "_month")
        .toPandas()
    )
    return {
        "labels": result["_label"].tolist(),
        "values": result["count"].tolist()
    }


def simcomp_por_marca(path, limit=12):
    """Distribución por marca de vehículo."""
    df = load_csv(path)
    marca_col = next(
        (c for c in df.columns if c.lower() == "marca_vehiculo"),
        next((c for c in df.columns if "marca" in c.lower()), None)
    )
    if not marca_col:
        return {"labels": [], "values": []}
    result = (
        df.groupBy(marca_col)
        .count()
        .orderBy(col("count").desc())
        .limit(limit)
        .toPandas()
    )
    return {
        "labels": result[marca_col].astype(str).tolist(),
        "values": result["count"].tolist()
    }


def simcomp_por_tipo_servicio(path):
    """Distribución por tipo de servicio."""
    df = load_csv(path)
    serv_col = next(
        (c for c in df.columns if c.lower() == "servicio_vehiculo"),
        next((c for c in df.columns if "servicio" in c.lower()), None)
    )
    if not serv_col:
        return {"labels": [], "values": []}
    result = (
        df.groupBy(serv_col)
        .count()
        .orderBy(col("count").desc())
        .toPandas()
    )
    return {
        "labels": result[serv_col].astype(str).tolist(),
        "values": result["count"].tolist()
    }


def simcomp_por_categoria_licencia(path):
    """Distribución por categoría de licencia."""
    df = load_csv(path)
    
    # Prioridad: licencia_categoria -> categoria_licencia -> licencia + categoria -> categoria
    lic_col = None
    cols_to_check = ["licencia_categoria", "categoria_licencia"]
    for target in cols_to_check:
        if target in df.columns:
            lic_col = target
            break
            
    if not lic_col:
        lic_col = next(
            (c for c in df.columns if "licencia" in c.lower() and "categoria" in c.lower()),
            next((c for c in df.columns if "categoria" in c.lower() and "licencia" not in c.lower()), None)
        )
        
    if not lic_col:
        return {"labels": [], "values": []}
        
    # Filtrar valores nulos o "SI/NO" que puedan venir de columnas flag
    result = (
        df.filter(col(lic_col).isNotNull())
        .filter(~col(lic_col).isin(["SI", "NO", "S", "N"]))
        .groupBy(lic_col)
        .count()
        .orderBy(col("count").desc())
        .toPandas()
    )
    
    return {
        "labels": result[lic_col].astype(str).tolist(),
        "values": result["count"].tolist()
    }


def simcomp_por_anio(path):
    """Comparendos agrupados por año."""
    from pyspark.sql.functions import year as yr, to_timestamp
    df = load_csv(path)
    fecha_col = next(
        (c for c in df.columns if "fecha" in c.lower()),
        None
    )
    if not fecha_col:
        return {"labels": [], "values": []}
    df2 = df.withColumn("_year", yr(to_timestamp(col(fecha_col))))
    result = (
        df2.groupBy("_year")
        .count()
        .orderBy("_year")
        .toPandas()
    )
    return {
        "labels": result["_year"].astype(str).tolist(),
        "values": result["count"].tolist()
    }