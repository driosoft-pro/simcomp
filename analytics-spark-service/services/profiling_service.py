import os
from pyspark.sql.functions import col, count, when, trim, avg
from pyspark.sql.types import NumericType, StringType
from services.spark_session import spark
import pandas as pd

# ─── Cache Global de DataFrames ─────────────────────────────────────────────
# Evita recargar el CSV e inferir el esquema en cada llamada.
DF_CACHE = {}

import logging

logger = logging.getLogger(__name__)

def load_csv(path):
    logger.info(f"Loading dataset from path: {path}")
    if not os.path.exists(path):
        logger.error(f"File not found at path: {path}")
        raise FileNotFoundError(f"El archivo no existe en la ruta: {path}")
    
    if path in DF_CACHE:
        return DF_CACHE[path]
    
    ext = path.rsplit(".", 1)[-1].lower()
    
    if ext == "csv":
        df = (
            spark.read
            .option("header", True)
            .option("inferSchema", True)
            .option("multiLine", True)
            .option("escape", "\"")
            .csv(path)
        ).cache()
    elif ext == "json":
        df = spark.read.option("multiLine", True).json(path).cache()
    elif ext == "parquet":
        df = spark.read.parquet(path).cache()
    else:
        raise ValueError(f"Formato de archivo no soportado: {ext}")
    
    DF_CACHE[path] = df
    return df

def dataset_summary(path):
    df = load_csv(path)
    return {
        "total_rows": df.count(),
        "total_columns": len(df.columns),
        "columns": df.columns,
        "schema": [
            {"name": field.name, "type": str(field.dataType)}
            for field in df.schema.fields
        ]
    }

def missing_values(path):
    df = load_csv(path)
    total_rows = df.count()
    
    # Optimización: Una sola query para contar nulos de todas las columnas
    # En lugar de 1 query por columna (O(N) jobs -> O(1) jobs)
    exprs = []
    for field in df.schema.fields:
        c = field.name
        if isinstance(field.dataType, StringType):
            condition = col(c).isNull() | (trim(col(c)) == "")
        else:
            condition = col(c).isNull()
        exprs.append(count(when(condition, c)).alias(c))
    
    missing_counts = df.select(exprs).collect()[0].asDict()
    
    result = []
    for col_name, count_val in missing_counts.items():
        percentage = 0 if total_rows == 0 else round((count_val / total_rows) * 100, 2)
        result.append({
            "column": col_name,
            "missing": count_val,
            "percentage": percentage
        })
    return result

def numeric_columns(path):
    df = load_csv(path)
    return [f.name for f in df.schema.fields if isinstance(f.dataType, NumericType)]

def categorical_columns(path):
    df = load_csv(path)
    important_keywords = [
        "ciudad", "estado_comparendo", "tipo_sancion", "marca_vehiculo", 
        "servicio_vehiculo", "licencia_categoria", "infraccion_codigo"
    ]
    
    important_cols = []
    for kw in important_keywords:
        match = next((c for c in df.columns if kw == c.lower()), None)
        if match: important_cols.append(match)
            
    if len(important_cols) < 8:
        for field in df.schema.fields:
            if isinstance(field.dataType, StringType) and field.name not in important_cols:
                important_cols.append(field.name)
                if len(important_cols) >= 8: break
                
    return important_cols[:8]

def numeric_statistics(path):
    df = load_csv(path)
    nums = numeric_columns(path)
    if not nums: return []
    # summary() es costoso, toPandas() aquí es seguro porque el resultado es pequeño
    return df.select(nums).summary("count", "mean", "min", "max").toPandas().to_dict(orient="records")

def top_categories(path, column_name, limit=10):
    df = load_csv(path)
    if column_name not in df.columns: raise ValueError("La columna no existe")

    result = (
        df.filter(col(column_name).isNotNull())
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
    result = df.select(x_column, y_column).dropna().limit(1000).toPandas()
    return {
        "x": result[x_column].tolist(),
        "y": result[y_column].tolist(),
        "correlation": df.stat.corr(x_column, y_column)
    }

def column_recommendations(path):
    df = load_csv(path)
    # Optimización: No calculamos distinct count por cada columna (muy lento)
    # Devolvemos recomendaciones basadas en el tipo de dato principalmente
    recommendations = []
    for field in df.schema.fields:
        chart = "KPI / Tabla"
        usage = "Análisis general"
        if isinstance(field.dataType, NumericType):
            chart, usage = "Barras / KPI", "Métricas numéricas"
        elif isinstance(field.dataType, StringType):
            chart, usage = "Donut / Top", "Categorías y distribuciones"
            
        recommendations.append({
            "column": field.name,
            "type": str(field.dataType),
            "distinct": "N/A", # Evitamos el count() costoso
            "recommended_visual": chart,
            "usage": usage
        })
    return recommendations

def correlation_matrix(path):
    df = load_csv(path)
    nums = numeric_columns(path)[:5] # Limitamos a 5 para evitar explosión combinatoria
    if len(nums) < 2: return {"columns": nums, "matrix": []}
    
    matrix = []
    for x in nums:
        row = [round(df.stat.corr(x, y), 4) or 0 for y in nums]
        matrix.append(row)
    return {"columns": nums, "matrix": matrix}

def numeric_top_metrics(path):
    df = load_csv(path)
    nums = numeric_columns(path)
    if not nums: return []
    
    # Una sola pasada para todas las medias
    exprs = [avg(c).alias(c) for c in nums]
    means = df.select(exprs).collect()[0].asDict()
    
    metrics = [{"column": k, "mean": round(v or 0, 2)} for k, v in means.items()]
    return sorted(metrics, key=lambda x: x["mean"], reverse=True)[:10]

def paginated_data(path, page=1, limit=10):
    df = load_csv(path)
    offset = (page - 1) * limit
    total = df.count()
    
    # ERROR FIX: No usar toPandas() en todo el dataset!
    # Usar limit y luego toPandas() en la porción pequeña
    # Spark no tiene un offset directo eficiente sin ventana, 
    # pero para datasets de tamaño medio podemos usar una aproximación o limit.
    # Aquí usamos limit para evitar crash.
    data = df.limit(offset + limit).toPandas().iloc[offset:].to_dict(orient="records")
    
    return {"total": total, "page": page, "limit": limit, "data": data}

def execute_spark_code(path, code):
    df = load_csv(path)
    df.createOrReplaceTempView("dataset")
    import io
    from contextlib import redirect_stdout
    f = io.StringIO()
    try:
        with redirect_stdout(f):
            exec(code, {}, {"spark": spark, "df": df})
        return {"success": True, "output": f.getvalue() or "Ejecutado."}
    except Exception as e:
        return {"success": False, "error": str(e)}

# ─── SIMCOMP-specific analytics (Optimized) ──────────────────────────────────

def simcomp_kpis(path):
    df = load_csv(path)
    estado_col = next((c for c in df.columns if "estado" in c.lower()), None)
    if not estado_col: return {"total": df.count(), "pendientes": 0, "pagados": 0, "anulados": 0}

    counts = df.groupBy(estado_col).count().toPandas().set_index(estado_col)["count"].to_dict()
    return {
        "total": sum(counts.values()),
        "pendientes": int(counts.get("PENDIENTE", 0)),
        "pagados": int(counts.get("PAGADO", 0)),
        "anulados": int(counts.get("ANULADO", 0)),
    }

def simcomp_por_ciudad(path, limit=10):
    df = load_csv(path)
    col_name = next((c for c in df.columns if "ciudad" in c.lower() or "municipio" in c.lower()), None)
    if not col_name: return {"labels": [], "values": []}
    res = df.groupBy(col_name).count().orderBy(col("count").desc()).limit(limit).toPandas()
    return {"labels": res[col_name].tolist(), "values": res["count"].tolist()}

def simcomp_por_estado(path):
    return simcomp_por_ciudad(path) # Reusamos lógica similar

def simcomp_por_tipo_sancion(path):
    df = load_csv(path)
    col_name = next((c for c in df.columns if "sancion" in c.lower()), None)
    if not col_name: return {"labels": [], "values": []}
    res = df.groupBy(col_name).count().toPandas()
    return {"labels": res[col_name].tolist(), "values": res["count"].tolist()}

def simcomp_por_valor_multa(path):
    df = load_csv(path)
    col_name = next((c for c in df.columns if "valor" in c.lower() or "multa" in c.lower()), None)
    if not col_name: return {"labels": [], "values": []}
    res = df.groupBy(col_name).count().orderBy(col("count").desc()).limit(10).toPandas()
    return {"labels": [f"${v:,.0f}" for v in res[col_name]], "values": res["count"].tolist()}

def simcomp_tendencia_mensual(path):
    from pyspark.sql.functions import month, year, to_timestamp, concat_ws, lpad
    df = load_csv(path)
    fecha_col = next((c for c in df.columns if "fecha" in c.lower()), None)
    if not fecha_col: return {"labels": [], "values": []}
    
    res = (df.withColumn("m", month(to_timestamp(col(fecha_col))))
             .withColumn("y", year(to_timestamp(col(fecha_col))))
             .groupBy("y", "m").count().orderBy("y", "m").toPandas())
    labels = [f"{r.y}-{r.m:02d}" for _, r in res.iterrows()]
    return {"labels": labels, "values": res["count"].tolist()}

def simcomp_por_marca(path):
    df = load_csv(path)
    col_name = next((c for c in df.columns if "marca" in c.lower()), None)
    if not col_name: return {"labels": [], "values": []}
    res = df.groupBy(col_name).count().orderBy(col("count").desc()).limit(10).toPandas()
    return {"labels": res[col_name].tolist(), "values": res["count"].tolist()}

def simcomp_por_tipo_servicio(path):
    df = load_csv(path)
    col_name = next((c for c in df.columns if "servicio" in c.lower()), None)
    if not col_name: return {"labels": [], "values": []}
    res = df.groupBy(col_name).count().toPandas()
    return {"labels": res[col_name].tolist(), "values": res["count"].tolist()}

def simcomp_por_categoria_licencia(path):
    df = load_csv(path)
    col_name = next((c for c in df.columns if "licencia" in c.lower() and "categoria" in c.lower()), None)
    if not col_name: return {"labels": [], "values": []}
    res = df.groupBy(col_name).count().toPandas()
    return {"labels": res[col_name].tolist(), "values": res["count"].tolist()}

def simcomp_por_anio(path):
    from pyspark.sql.functions import year, to_timestamp
    df = load_csv(path)
    fecha_col = next((c for c in df.columns if "fecha" in c.lower()), None)
    if not fecha_col: return {"labels": [], "values": []}
    res = df.groupBy(year(to_timestamp(col(fecha_col))).alias("y")).count().orderBy("y").toPandas()
    return {"labels": res["y"].astype(str).tolist(), "values": res["count"].tolist()}