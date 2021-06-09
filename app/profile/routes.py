# routes.py
import os

from flask import current_app, Response, g
from flask_login import login_user, current_user, logout_user, login_required

from app.models import User, create_admin_user
from app.profile import bp
from app.request_arg.request_arg import request_arg


@bp.post("/login/")
@request_arg("email", arg_default=None)
@request_arg("password", arg_default=None)
def route_login(email=None, password=None):
    """
    api to login

    """
    if current_user.is_authenticated:
        return Response(g.d, 200)

    create_admin_user(current_app)
    message = "Invalid email or password"
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


@bp.post("/logout/")
def route_logout():
    if current_user.is_anonymous:
        return Response("not logged in", 400)
    else:
        logout_user()
    return Response(g.d, 200)


@bp.route("/user/", methods=["GET", "PUT"])
@login_required
def route_user():
    return User.get_delete_put_post(item_id=current_user.id)
