# api.py

from flask import Blueprint, jsonify
from flask_login import login_required

from app.models import DockerServer

bp = Blueprint('api', __name__)


def d_serialize(item):
    """
    convert the item into a dict
    so they can be serialized back to the caller

    :param item: an object
    :return:
    """
    d = {}
    for a in item.__dict__.keys():
        if not a.startswith('_'):
            value = getattr(item, a, '')
            if type(value) not in [list, dict, int, float, str]:
                value = str(value)
            d[a] = value
    return d


@bp.route('/servers')
@login_required
def api_servers():
    return DockerServer.json_filter_by(active=True)
