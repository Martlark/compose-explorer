import logging
import os

import docker
from flask import Flask
from flask_httpauth import HTTPTokenAuth

# config

log_level = os.getenv("LOG_LEVEL", logging.INFO)
tokens = {os.getenv("AUTH_TOKEN", "debug"): "AUTH_TOKEN"}

logging.basicConfig(format="%(levelname)s:%(message)s", level=log_level)
dc = docker.from_env()
auth = HTTPTokenAuth(scheme="Bearer")


def create_app():
    from routes import bp as bp_routes
    app = Flask(__name__)
    app.register_blueprint(bp_routes)
    return app


@auth.verify_token
def verify_token(token):
    logging.debug(f"""verify_token({token})""")
    if token in tokens:
        return tokens.get(token)


if __name__ == "__main__":
    app = create_app()
    print("agent starting")
    app.run(host="0.0.0.0", port=5550)
