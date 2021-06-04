# routes.py
import os

from flask import redirect, url_for, flash, current_app, Response, g
from flask_login import login_user, current_user, logout_user

from app.auth import bp
from app.models import User, create_admin_user
from app.request_arg.request_arg import request_arg


@bp.post('/login/')
@request_arg('email', arg_default=None)
@request_arg('password', arg_default=None)
def login(email=None, password=None):
    """
    api to login

    """
    if current_user.is_authenticated:
        return Response(g.d, 200)

    admin_password = password
    if email ==  os.getenv('ADMIN_USER', 'admin@admin.com'):
        create_admin_user(current_app, admin_password=admin_password)
    message = 'Invalid email or password'
    user = User.query.filter_by(email=email).first()
    if user is None:
        return Response(message, 403)
    else:
        if user.check_password(password):
            message = None

        if message:
            return Response(message, 403)

    login_user(user, remember=True)
    return Response(g.d, 200)


@bp.route('/signup')
def signup():
    return 'not implemented'


@bp.post('/logout/')
def logout():
    if current_user.is_anonymous:
        return Response('not logged in', 400)
    else:
        logout_user()
    return Response(g.d, 200)


@bp.route('/is_logged_in/')
def is_logged_in():
    if current_user and current_user.is_authenticated:
        return 'ok'
    return 'no'
