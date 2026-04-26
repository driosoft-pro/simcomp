from pyspark.sql import SparkSession
from config import SPARK_MASTER_URL

spark = (
    SparkSession.builder
    .appName("SIMCOMP Generic Spark Analytics")
    .master(SPARK_MASTER_URL)
    .config("spark.sql.shuffle.partitions", "4")
    .getOrCreate()
)