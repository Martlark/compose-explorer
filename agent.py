import docker
from flask import Flask, jsonify, request, current_app

app = Flask(__name__)
# https://docker-py.readthedocs.io/en/stable/
dc = docker.from_env()


def d_serialize(item, attributes):
    """
    convert the given attributes for the item into a dict
    so they can be serialized back to the caller

    :param item: an object
    :param attributes: list of attributes
    :return:
    """
    d = {}
    attributes.sort()
    for a in attributes:
        value = getattr(item, a, '')
        if type(value) not in [list, dict, int, float, str]:
            value = str(value)
        d[a] = value
    return d


@app.route('/container/<param>', methods=['GET', 'POST'])
def route_container(param):
    # current_app.logger.debug(f'route_container {request.method} {param}')
    try:
        container = None
        attrs = ['id', 'labels', 'name', 'short_id', 'status']
        current_app.logger.info(str(request.args))
        current_app.logger.info(str(request.form))
        name = request.args.get('name') or request.form.get('name')
        if name:
            container = dc.containers.get(name)

            if not container:
                raise Exception(f'container {name} not found')

        if request.method == 'GET':
            if param == 'list':
                # get all containers
                return jsonify([d_serialize(d, attrs) for d in dc.containers.list(all=True)])
            if param == 'get':
                # get specified container
                return d_serialize(container, attrs)
            if param == 'logs':
                params = dict(request.args)
                logs = container.logs(tail=int(request.args.get('tail', '100')), timestamps=True)
                log_hash = logs.__hash__()
                logs = [l.strip() for l in logs.decode().split('\n') if l.strip()]
                return dict(hash=log_hash, logs=logs)

        if request.method == 'POST':
            if param not in ['restart', 'stop', 'start']:
                raise Exception('action not supported')

            if param == 'restart':
                container.restart()
            elif param == 'stop':
                container.stop()
            elif param == 'start':
                container.start()
            else:
                raise Exception('unknown action')
            container = dc.containers.get(name)
            return d_serialize(container, attrs)

        raise Exception('Method and action not supported')

    except Exception as e:
        current_app.logger.exception(e)
        return f'{e}', 400


@app.route('/volume/<param>')
def route_volume(param):
    if param == 'list':
        return jsonify([d_serialize(d, ['attrs']) for d in dc.volumes.list()])
    return 'not supported', 400


if __name__ == '__main__':
    print('agent starting')
    app.run(host='0.0.0.0', port=5550)
