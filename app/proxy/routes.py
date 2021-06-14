# routes.py
# routes for calling docker proxy
import requests
from flask import request, jsonify
from flask_login import login_required

from app import admin_required
from app.models import DockerServer
from app.proxy import bp


@bp.get("/container/<int:server_id>/<verb>/")
@login_required
def route_container_get(server_id, verb):
    server = DockerServer.query.get_or_404(server_id)
    try:
        result = server.get("container", verb, params=request.args)
        return jsonify(result)
    except Exception as e:
        return str(e), 400


@bp.post("/container/<int:server_id>/<verb>/")
@login_required
def route_container_post(server_id, verb):
    server = DockerServer.query.get_or_404(server_id)
    try:
        result = server.post("container", verb, params=request.form)
        return result

    except Exception as e:
        return str(e), 400


@bp.route("/project/<int:server_id>/<project>/", methods=["GET"])
@login_required
def route_project_services(server_id, project):
    """
    return all services for the given server and project

    :param server_id:
    :param project:
    :return:
    """
    server = DockerServer.query.get_or_404(server_id)
    services = []
    if request.method == "GET":
        try:
            result = server.get("container", "list", params=request.args)
            result.sort(key=lambda c: c["labels"].get("com.docker.compose.project", ""))
            for c in result:
                if c["labels"].get("com.docker.compose.project", "") == project:
                    services.append(c)
            return jsonify(services)

        except Exception as e:
            return str(e), 400


@bp.route("/projects/<server_id>/", methods=["GET"])
@login_required
def route_projects(server_id):
    try:
        server = DockerServer.query.get(int(server_id))
    except:
        return jsonify([])
    if not server:
        return jsonify([])

    projects = []
    if request.method == "GET":
        try:
            result = server.get("container", "list", params=request.args)
            result.sort(key=lambda c: (c["labels"].get("com.docker.compose.project", "")))
            prev_project = ""
            services = []
            for c in result:
                if c["labels"].get("com.docker.compose.project") != prev_project:
                    if len(prev_project) > 0:
                        projects.append(dict(name=prev_project, services=services))
                    services = []
                    prev_project = c["labels"].get("com.docker.compose.project", "")
                services.append(c)

            if len(prev_project) > 0:
                projects.append(dict(name=prev_project, services=services))
            return jsonify(projects)

        except requests.exceptions.ConnectionError as e:
            return (
                f"Remote agent at {server.name} on port {server.port} is not responding",
                400,
            )

        except Exception as e:
            return str(e), 400


@bp.post("/agent/<service>/<int:server_id>/<action>/")
@login_required
def route_agent_service(service, server_id, action=None):
    server = DockerServer.query.get(int(server_id))

    try:
        result = server.post(f"action/{service}", action, params=request.form)
        return result

    except requests.exceptions.ConnectionError as e:
        return (
            f"Remote agent at {server.name} on port {server.port} is not responding",
            400,
        )

    except Exception as e:
        return str(e), 400


@bp.get("/volume/<int:server_id>/<verb>/")
@login_required
def route_volume(server_id, verb):
    server = DockerServer.query.get_or_404(server_id)
    try:
        result = server.get("volume", verb)
        return jsonify(result)
    except Exception as e:
        return str(e), 400
