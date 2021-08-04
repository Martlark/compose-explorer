import datetime
import logging
import os
import tempfile
import time

from flask import Blueprint, request, jsonify, send_file

from agent import auth, dc
from utils import  local_run, get_directory, exec_run, download_container_file, upload_container_file
from d_serialize import d_serialize
from request_arg import request_arg

bp = Blueprint("routes", __name__)


@bp.route("/action/<service>/<action>/", methods=["POST"])
@auth.login_required
@request_arg("working_dir", str)
def route_action(service, action, working_dir):
    logging.info(f"route_action {service} {action}")
    cmd = ""
    params = ""
    try:
        if service == "git":
            if action in ["status", "fetch", "pull", "branch", "log"]:
                if action == "log":
                    params = "-n 10"
                cmd = f"""cd {working_dir} && git {action} {params}"""

        elif service == "compose":
            if action in ["ps", "build", "up", "stop", "logs", "restart"]:
                if action == "up":
                    params = "-d"
                elif action == "logs":
                    params = "--tail=20 --no-color"
                cmd = f"""cd {working_dir} && docker-compose {action} {params}"""

        if cmd:
            output = local_run(cmd)
            return output

    except Exception as e:
        logging.exception(e)
        return f"{e}", 400

    return f"unknown operation", 400


@bp.route("/container/<action>/", methods=["GET", "POST"])
@auth.login_required
@request_arg("name", str, "")
@request_arg("sleep_seconds", int, 10)
@request_arg("tail", int, 100)
def route_container(action, name="", sleep_seconds=10, tail=100):
    logging.info(f"route_container {request.method} {action} {name}")
    try:
        container = None
        attrs = ["id", "labels", "name", "short_id", "status", "image"]
        if name:
            container = dc.containers.get(name)

            if not container:
                raise Exception(f"container {name} not found")

        if request.method == "GET":
            if action == "list":
                # get all containers
                return jsonify([d_serialize(d, attrs) for d in dc.containers.list(all=True)])
            elif action == "get":
                # get specified container
                return d_serialize(container, attrs)
            elif action == "logs":
                logs = container.logs(tail=tail, timestamps=True)
                log_hash = logs.__hash__()
                logs = [l.strip() for l in logs.decode().split("\n") if l.strip()]
                return dict(hash=log_hash, logs=logs)
            elif action == "ls":
                if container.status == "running":
                    return get_directory(container, request.args)
                return {"entries": []}
            elif action == "date":
                result = None
                if container and container.status == "running":
                    result = exec_run(container, f"""date""")
                if not container:
                    result = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                return {"date": result}

        if request.method == "POST":
            if action == "restart":
                container.restart(timeout=60)
            elif action == "stop":
                container.stop(timeout=60)
            elif action == "start":
                container.start()
            elif action == "exec_run":
                if container.status == "running":
                    cmd = request.form.get("cmd")
                    output = exec_run(container, cmd, shell=True)
                    return output
                else:
                    return "not running"
            elif action == "download":
                return download_container_file(container)
            elif action == "upload":
                return upload_container_file(container)
            elif action == "sleep":
                time.sleep(sleep_seconds)
                return "slept"
            elif action == "logs":
                # download
                logs = container.logs(tail=int(request.form.get("tail", "1000")), timestamps=True)
                fd, tmp_filename = tempfile.mkstemp()
                os.write(fd, logs)
                os.close(fd)
                return send_file(tmp_filename)
            else:
                raise Exception("unknown action")
            container = dc.containers.get(name)
            return d_serialize(container, attrs)

        raise Exception(f"Method {request.method} and action {action} not supported")

    except Exception as e:
        logging.exception(e)
        return f"{e}", 400


@bp.route("/volume/<param>/")
@auth.login_required
def route_volume(param):
    if param == "list":
        return jsonify([d_serialize(d, ["attrs"]) for d in dc.volumes.list()])
    return "not supported", 400
