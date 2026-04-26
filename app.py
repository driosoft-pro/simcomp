from flask import Flask
from config import APP_HOST, APP_PORT
from routes.dashboard_routes import dashboard_bp
from routes.api_routes import api_bp

app = Flask(__name__)

app.register_blueprint(dashboard_bp)
app.register_blueprint(api_bp, url_prefix="/api")


@app.route("/health")
def health():
    return {
        "status": "ok",
        "service": "analytics-spark-service"
    }


if __name__ == "__main__":
    app.run(
        host=APP_HOST,
        port=APP_PORT,
        debug=False,
        use_reloader=False,
        threaded=True
    )