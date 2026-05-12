import os
import logging
import socket
from pyspark.sql import SparkSession
from config import SPARK_MASTER_URL

logger = logging.getLogger(__name__)

_spark = None

def get_driver_ip():
    """Detects the container's IP address on the overlay network."""
    try:
        return socket.gethostbyname(socket.gethostname())
    except:
        return os.getenv("SPARK_LOCAL_IP", "127.0.0.1")

def get_spark() -> SparkSession:
    """
    Lazy-initializes and returns the global SparkSession.
    """
    global _spark
    if _spark is None or _spark._sc._jsc is None:
        driver_ip = get_driver_ip()
        logger.info(f"Initializing SparkSession → master: {SPARK_MASTER_URL}, driver_ip: {driver_ip}")
        _spark = (
            SparkSession.builder
            .appName("SIMCOMP Generic Spark Analytics")
            .master(SPARK_MASTER_URL)
            .config("spark.sql.shuffle.partitions", "4")
            .config("spark.driver.host", driver_ip)
            .config("spark.driver.bindAddress", "0.0.0.0")
            .config("spark.network.timeout", "120s")
            .config("spark.executor.heartbeatInterval", "60s")
            .getOrCreate()
        )
        logger.info("SparkSession ready.")
    return _spark


# Backwards-compatibility alias — modules that do "from services.spark_session import spark"
# will still work; the session is created on first access.
class _LazySparkProxy:
    """Proxy that creates the SparkSession on first attribute access."""
    def __getattr__(self, name):
        return getattr(get_spark(), name)


spark = _LazySparkProxy()