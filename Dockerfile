FROM docker.io/library/spark:4.1.1-java21-python3

USER root

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY spark/spark-defaults.conf /opt/spark/conf/spark-defaults.conf
COPY spark/log4j2.properties /opt/spark/conf/log4j2.properties

COPY . .

RUN mkdir -p /app/data/uploads

ENV APP_HOST=0.0.0.0
ENV APP_PORT=8010
ENV SPARK_MASTER_URL=local[*]
ENV UPLOAD_FOLDER=/app/data/uploads
ENV PYSPARK_PYTHON=python3
ENV PYSPARK_DRIVER_PYTHON=python3

EXPOSE 8010

CMD ["python3", "app.py"]