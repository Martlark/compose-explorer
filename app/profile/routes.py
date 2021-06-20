# routes.py

from flask import current_app, Response, g, abort
from flask_login import login_user, current_user, logout_user, login_required

from app import db
from app.models import User, create_admin_user
from app.profile import bp
from app.request_arg.request_arg import request_arg


@bp.post('/update_password/')
@request_arg("current_password", arg_default=None)
@request_arg("new_password", arg_default=None)
def private_route_update_password(current_password, new_password):
    if not current_user.check_password(current_password):
        return Response('incorrect current password', 400)

    current_user.set_password(new_password)
    db.session.add(current_user)
    db.session.commit()

    return Response('updated password', 200)


@bp.post("/login/")
@request_arg("email", arg_default=None)
@request_arg("password", arg_default=None)
def public_route_login(email=None, password=None):
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
    return Response(f'welcome {user.email}', 200)


@bp.post("/logout/")
def public_route_logout():
    if current_user.is_anonymous:
        return Response("not logged in", 400)

    logout_user()
    return Response('goodbye', 200)


@bp.route("/user/", methods=["GET", "PUT"])
@login_required
def route_user():
    return User.get_delete_put_post(item_id=current_user.id)
