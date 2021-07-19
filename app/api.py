# api.py

from flask import Blueprint
from flask_login import login_required

from app import admin_required
from app.models import DockerServer
from request_arg.main import request_arg

bp = Blueprint("api", __name__)


@bp.route("/servers/")
@login_required
def api_servers():
    return DockerServer.json_filter_by(active=True)


@bp.route("/server/<int:server_id>/", methods=["PUT", "DELETE"])
@bp.route("/server/", methods=["POST"])
@admin_required
def admin_api_server_update(server_id=None):
    return DockerServer.get_delete_put_post(item_id=server_id)


@bp.get("/server/<int:server_id>/")
@login_required
def api_server_get(server_id=None):
    return DockerServer.get_delete_put_post(item_id=server_id)


@bp.route("/server_summary/<int:server_id>/", methods=["GET"])
@login_required
def api_server_summary(server_id):
    server = DockerServer.query.get_or_404(server_id)
    try:
        summary = server.get_summary()
    except Exception as e:
        return f"{e}", 400
    return summary


@bp.route("/server_test_connection/", methods=["GET"])
@request_arg("name")
@request_arg("port")
@request_arg("credentials", arg_default="")
@request_arg("protocol", arg_default="http")
@admin_required
def admin_api_server_test_connection(name, port, credentials, protocol):
    return DockerServer.test_connection(name, port, credentials, protocol)
