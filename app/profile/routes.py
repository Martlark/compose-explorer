# routes.py
import os

from flask import current_app, Response, request
from flask_login import login_user, current_user, logout_user, login_required

from app import db, is_ldap
from app.auth.ldap import ldap_login
from app.models import User, create_admin_user
from app.profile import bp
from request_arg import request_arg


@bp.post("/update_password/")
@request_arg("current_password", arg_default=None)
@request_arg("new_password", arg_default=None)
@request_arg("confirm_password", arg_default=None)
@login_required
def private_route_update_password(current_password, new_password, confirm_password):
    if is_ldap() and current_user.email != os.getenv("ADMIN_USER", "admin@admin.com"):
        return Response("LDAP maintains account details", 200)

    if not current_user.check_password(current_password):
        return Response("incorrect current password", 400)

    if new_password != confirm_password:
        return Response("new and confirm password do not match", 400)

    current_user.set_password(new_password)
    db.session.add(current_user)
    db.session.commit()

    return Response("updated password", 200)


@bp.post("/login/")
@request_arg("email", arg_default=None)
@request_arg("password", arg_default=None)
def public_route_login(email=None, password=None):
    """
    api to login

    """
    if current_user.is_authenticated:
        return Response("Already logged in", 200)

    message = "Invalid email or password"
    if is_ldap():
        user = ldap_login(email, password)
        if user is None:
            return Response(message, 403)
    else:
        create_admin_user(current_app)
        user = User.query.filter_by(email=email).first()
        if user is None:
            return Response(message, 403)
        else:
            if user.check_password(password):
                message = None

            if message:
                return Response(message, 403)

    login_user(user, remember=True)
    return Response(f"welcome {user.email}", 200)


@bp.post("/logout/")
def public_route_logout():
    if current_user.is_anonymous:
        return Response("not logged in", 400)

    logout_user()
    return Response("goodbye", 200)


@bp.route("/user/", methods=["GET", "PUT"])
@login_required
def route_user():
    if request.method != "GET" and is_ldap():
        return Response("LDAP maintains account details", 400)

    return User.fs_get_delete_put_post(item_id=current_user.id)
