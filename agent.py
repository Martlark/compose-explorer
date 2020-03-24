import docker
from flask import Flask, jsonify

app = Flask(__name__)
dc = docker.from_env()


def d_serialize(item, attributes=None):
    d = {}
    if attributes:
        attributes.extend(['id', 'name'])
    else:
        attributes = ['id', 'name']
    attributes.sort()
    for a in attributes:
        d[a] = getattr(item, a, '')
    return d


@app.route('/container/<param>')
def route_container(param):
    if param == 'list':
        return jsonify([d_serialize(d, ['status', 'labels']) for d in dc.containers.list()])
    return 'not supported', 400


@app.route('/volume/<param>')
def route_volume(param):
    if param == 'list':
        return jsonify([d_serialize(d, ['attrs']) for d in dc.volumes.list()])
    return 'not supported', 400


if __name__ == '__main__':
    print('agent starting')
    app.run(port=5550)
