import docker
from flask import Flask, jsonify, request

app = Flask(__name__)
dc = docker.from_env()


def d_serialize(item, attributes):
    d = {}
    attributes.sort()
    for a in attributes:
        d[a] = getattr(item, a, '')
    return d


@app.route('/container/<param>')
def route_container(param):
    attrs = ['id', 'labels', 'name', 'short_id', 'status']
    if param == 'list':
        return jsonify([d_serialize(d, attrs) for d in dc.containers.list()])
    if param == 'get':
        container = dc.containers.get(request.args.get('name'))
        return d_serialize(container, attrs)
    if param == 'logs':
        container = dc.containers.get(request.args.get('name'))
        params = dict(request.args)
        logs = container.logs(tail=int(request.args.get('tail', '100')), timestamps=True)
        log_hash = logs.__hash__()
        logs = [l.strip() for l in logs.decode().split('\n') if l.strip()]
        return dict(hash=log_hash, logs=logs)
    return 'not supported', 400


@app.route('/volume/<param>')
def route_volume(param):
    if param == 'list':
        return jsonify([d_serialize(d, ['attrs']) for d in dc.volumes.list()])
    return 'not supported', 400


if __name__ == '__main__':
    print('agent starting')
    app.run(host='0.0.0.0', port=5550)
