import logging
import os

import docker
from flask import Flask

# config

log_level = os.getenv("LOG_LEVEL", logging.INFO)

logging.basicConfig(format="%(levelname)s:%(message)s", level=log_level)
dc = docker.from_env()


def create_app():
    from routes import bp as bp_routes

    _app = Flask(__name__)
    _app.register_blueprint(bp_routes)
    return _app


if __name__ == "__main__":
    app = create_app()
    print("agent starting")
    app.run(host="0.0.0.0", port=5550)
