# routes.py

from flask import Response
from flask_login import current_user

from app import db, admin_required
from app.auth import bp
from app.models import User
from app.request_arg.request_arg import request_arg


@bp.route('/is_logged_in/')
def public_route_is_logged_in():
    if current_user and current_user.is_authenticated:
        return 'ok'
    return 'no'


@bp.post('/user_set_password/<int:item_id>/')
@request_arg('password')
@admin_required
def route_user_set_password(item_id, password):
    user = User.query.get_or_404(item_id)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return Response(f'password set for {user.email}', 200)


@bp.route('/user/<int:item_id>/', methods=['GET', 'PUT', 'POST', 'DELETE'])
@bp.route('/user/', methods=['GET', 'POST'])
@admin_required
def route_user(item_id=None):
    return User.get_delete_put_post(item_id=item_id)
