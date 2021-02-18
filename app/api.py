# api.py

from flask import Blueprint, request
from flask_login import login_required

from app.models import DockerServer

bp = Blueprint('api', __name__)


@bp.route('/servers/')
@login_required
def api_servers():
    return DockerServer.json_filter_by(active=True)


@bp.route('/server/<int:server_id>/', methods=['GET','DELETE'])
@bp.route('/server/', methods=['POST'])
@login_required
def api_server(server_id=None):
    if request.method in ['POST', 'DELETE']:
        try:
            return DockerServer.get_delete_put_post(item_id=server_id)
        except Exception as e:
            return f'Operation failed on server {e}', 400
    return DockerServer.json_get(server_id)
