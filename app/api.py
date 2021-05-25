# api.py
from functools import wraps

from flask import Blueprint, request, abort, Response
from flask_login import login_required

from app.models import DockerServer

bp = Blueprint('api', __name__)


def request_arg(arg_name, arg_type=str, arg_default=None):
    """
    decorator to auto convert arg or form fields to
    named method parameters with the correct type
    conversion

        @route('/something/<greeting>/')
        @request_arg('repeat', int, 1)
        def route_something(greeting='', repeat):
            return greeting * repeat

        # /something/yo/?repeat=10

        # yoyoyoyoyoyoyoyoyoyo

    :param arg_name str: name of the form field or arg
    :param arg_type lambda: (optional) the type to convert to
    :param arg_default any: (optional) a default value.  Use '' or 0 when allowing optional fields
    :return: a decorator
    """

    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            form_value = request.form.get(arg_name)
            arg_value = request.args.get(arg_name)
            if form_value:
                arg_value = form_value
            if not arg_value:
                arg_value = arg_default
            if arg_value is not None:
                try:
                    arg_value = arg_type(arg_value)
                except Exception as e:
                    abort(400, f"""Required argument failed type conversion: {arg_name}, {str(e)}""")

                kwargs[arg_name] = arg_value
                return f(*args, **kwargs)
            abort(400, f"""Required argument missing: {arg_name}""")

        return decorated

    return decorator


@bp.route('/servers/')
@login_required
def api_servers():
    return DockerServer.json_filter_by(active=True)


@bp.route('/server/<int:server_id>/', methods=['GET', 'PUT', 'DELETE'])
@bp.route('/server/', methods=['POST'])
@login_required
def api_server(server_id=None):
    return DockerServer.get_delete_put_post(item_id=server_id)


@bp.route('/server_summary/<int:server_id>/', methods=['GET'])
@login_required
def api_server_summary(server_id):
    server = DockerServer.query.get_or_404(server_id)
    try:
        summary = server.get_summary()
    except Exception as e:
        return f'{e}', 400
    return summary


@bp.route('/server_test_connection/', methods=['GET'])
@request_arg('name')
@request_arg('port')
@request_arg('credentials', arg_default='')
@request_arg('protocol', arg_default='http')
@login_required
def api_server_test_connection(name, port, credentials, protocol):
    return DockerServer.test_connection(name, port, credentials, protocol)
