# views.py
import os
import random

from flask import render_template, request, current_app, Blueprint, send_from_directory
from flask_login import login_required, current_user

from app import app_before_request
from app.models import Command
from flask_request_arg import request_arg
from config import STATIC_DIR

bp = Blueprint("main", __name__)


@bp.errorhandler(Exception)
def exception_handler(error):
    current_app.logger.error(repr(error))
    return repr(error), 500


@bp.route("/")
@request_arg("request_path", arg_default="")
@request_arg("message", arg_default="")
def public_page_index(request_path=None, message=None):
    return render_template(
        "index.html",
        page_title="Compose Explorer",
        request_path=request_path,
        message=message,
        FLASK_ENV=os.getenv("FLASK_ENV", ""),
    )


@bp.route("/favicon.ico")
@bp.route("/robots.txt")
@bp.route("/ads.txt")
def public_static_file():
    """
    return a file from the templates folder
    intended for service of ads.txt, robots.txt or other such 'special' files

    :return: the file contents
    """
    file_name = os.path.basename(request.path)
    return send_from_directory(STATIC_DIR, file_name)


rand_check_number = random.randint(0, 9999999999)


@bp.before_app_request
def bp_before_request():
    app_before_request()


@bp.route("/last_static_update")
def public_last_static_update():
    include_dirs = ["./app/js", "./app/static/src", "./app/templates"]
    exclude_dir = ["node_modules", "venv", "tmp"]
    notice_exts = ["js", "html", "css"]
    initial_max_age = max_age = float(request.args.get("max_age", -1))
    for include_dir in include_dirs:
        for root, dirs, files in os.walk(include_dir):
            if os.path.basename(root) not in exclude_dir:
                for file in files:
                    if any([file.endswith(ext) for ext in notice_exts]):
                        full_path = os.path.join(root, file)
                        mtime = os.path.getmtime(full_path)
                        if mtime > max_age and initial_max_age != -1:
                            current_app.logger.debug(
                                "Refresh required because of:{full_path}".format(full_path=full_path)
                            )
                        max_age = max(max_age, mtime)

    if request.args.get("rand_check_number"):
        if int(request.args.get("rand_check_number")) != rand_check_number:
            current_app.logger.debug("Refresh required because of:rand_check_number")
    return dict(max_age=max_age, rand_check_number=rand_check_number)


@bp.route("/command/<int:item_id>/", methods=["GET", "PUT", "DELETE"])
@bp.route("/command/", methods=["GET", "POST"])
@request_arg("container_name", arg_default="")
@login_required
def route_command(item_id=None, container_name=None):
    return Command.fs_get_delete_put_post(item_id, user=current_user, prop_filters={"container_name": container_name})
