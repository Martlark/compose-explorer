# routes.py

from flask import request, jsonify
from flask_login import login_required

from app.models import DockerServer
from app.proxy import bp


@bp.route('/container/<int:server_id>/<verb>', methods=['GET', 'POST'])
@login_required
def route_container(server_id, verb):
    server = DockerServer.query.get_or_404(server_id)
    if request.method == 'GET':
        try:
            result = server.get('container', verb)
            return jsonify(result)
        except Exception as e:
            return str(e), 400


@bp.route('/volume/<int:server_id>/<verb>', methods=['GET', 'POST'])
@login_required
def route_volume(server_id, verb):
    server = DockerServer.query.get_or_404(server_id)
    if request.method == 'GET':
        try:
            result = server.get('volume', verb)
            return jsonify(result)
        except Exception as e:
            return str(e), 400
