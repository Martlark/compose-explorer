# api.py

from flask import Blueprint, jsonify
from flask_login import login_required

from app.models import DockerServer

bp = Blueprint('api', __name__)


@bp.route('/servers')
@login_required
def api_servers():
    return DockerServer.json_filter_by(active=True)


@bp.route('/server/<int:server_id>')
@login_required
def api_server(server_id):
    return DockerServer.json_get(server_id)
