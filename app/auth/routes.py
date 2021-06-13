# user management, group management
# routes.py

from flask import Response, g
from flask_login import current_user

from app import db, admin_required, set_g
from app.auth import bp
from app.models import User, ServerGroup, DockerServer
from app.request_arg.request_arg import request_arg


@bp.route("/is_logged_in/")
def public_route_is_logged_in():
    if current_user and current_user.is_authenticated:
        return "ok"
    return "no"


@bp.get("/g/")
def public_g():
    set_g()
    return g.d


@bp.post('/group_add_server/')
@request_arg("server_id")
@request_arg("group_id")
@admin_required
def route_group_add_server(server_id, group_id):
    group = ServerGroup.query.get_or_404(group_id)
    server = DockerServer.query.get_or_404(server_id)
    group.servers.append(server)
    db.session.commit()
    return Response(f'Server {server.name} added to {group.name}', 200)


@bp.post('/group_remove_server/')
@request_arg("server_id")
@request_arg("group_id")
@admin_required
def route_group_remove_server(server_id, group_id):
    group = ServerGroup.query.get_or_404(group_id)
    server = DockerServer.query.get_or_404(server_id)
    group.servers.remove(server)
    db.session.commit()
    return Response(f'Server {server.name} removed from {group.name}', 200)


@bp.post('/group_add_user/')
@request_arg("user_id")
@request_arg("group_id")
@admin_required
def route_group_add_user(user_id, group_id):
    group = ServerGroup.query.get_or_404(group_id)
    user = User.query.get_or_404(user_id)
    group.users.append(user)
    db.session.commit()
    return Response(f'User {user.email} added to {group.name}', 200)


@bp.post('/group_remove_user/')
@request_arg("user_id")
@request_arg("group_id")
@admin_required
def route_group_remove_user(user_id, group_id):
    group = ServerGroup.query.get_or_404(group_id)
    user = User.query.get_or_404(user_id)
    group.users.remove(user)
    db.session.commit()
    return Response(f'User {user.email} removed from {group.name}', 200)


@bp.post("/user_set_password/<int:item_id>/")
@request_arg("password")
@admin_required
def route_user_set_password(item_id, password):
    user = User.query.get_or_404(item_id)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return Response(f"password set for {user.email}", 200)


@bp.route("/user/<int:item_id>/", methods=["GET", "PUT", "POST", "DELETE"])
@bp.route("/user/", methods=["GET", "POST"])
@admin_required
def route_user(item_id=None):
    return User.get_delete_put_post(item_id=item_id)


@bp.route("/group/<int:item_id>/", methods=["GET", "PUT", "POST", "DELETE"])
@bp.route("/group/", methods=["GET", "POST"])
@admin_required
def route_group(item_id=None):
    return ServerGroup.get_delete_put_post(item_id=item_id)
