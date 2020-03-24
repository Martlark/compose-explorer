# routes.py

from flask import render_template, redirect, url_for, flash, current_app, request
from flask_login import login_user, current_user, logout_user

from app.auth import bp
from app.auth.forms import LoginForm
from app.models import User, create_admin_user, DockerServer


@bp.route('/containers/<int:server_id>/<verb>', methods=['GET', 'POST'])
def containers(server_id, verb):
    server = DockerServer.query.get_or_404(server_id)
    if request.method == 'GET':
        result = server.get('container', verb)
    return result
