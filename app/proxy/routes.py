# routes.py

from flask import request, jsonify
from flask_login import login_required

from app.models import DockerServer
from app.proxy import bp


@bp.route('/container/<int:server_id>/<verb>', methods=['GET', 'POST'])
@login_required
def route_container(server_id, verb):
    server = DockerServer.query.get_or_404(server_id)
    try:

        if request.method == 'GET':
            result = server.get('container', verb, params=request.args)
            return jsonify(result)

        if request.method == 'POST':
            result = server.post('container', verb, params=request.form)
            return result

    except Exception as e:
        return str(e), 400


@bp.route('/projects/<int:server_id>', methods=['GET'])
@login_required
def route_projects(server_id):
    server = DockerServer.query.get_or_404(server_id)
    projects = []
    if request.method == 'GET':
        try:
            result = server.get('container', 'list', params=request.args)
            result.sort(key=lambda c: c["labels"]["com.docker.compose.project"])
            prev_project = ''
            services = []
            for c in result:
                if c["labels"]["com.docker.compose.project"] != prev_project:
                    if len(prev_project) > 0:
                        projects.append(dict(name=prev_project, services=services))
                    services = []
                    prev_project = c["labels"]["com.docker.compose.project"]
                services.append(c)

            if len(prev_project) > 0:
                projects.append(dict(name=prev_project, services=services))
            return jsonify(projects)
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
