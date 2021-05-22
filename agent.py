import datetime
import os
import shutil
import subprocess
import tarfile
import tempfile
import time
from functools import wraps
from io import BytesIO
from typing import Any, Callable

import docker
from flask import Flask, jsonify, request, current_app, send_file, abort

app = Flask(__name__)
# https://docker-py.readthedocs.io/en/stable/
dc = docker.from_env()
cleanup = {}


def request_arg(arg_name:str, arg_type:Any=str, arg_default=None)->Callable:
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
    :param arg_type str: (optional) the type to convert to
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


def d_serialize(item, attributes=None):
    """
    convert the given attributes for the item into a dict
    so they can be serialized back to the caller

    :param item: an object
    :param attributes: list of attributes, defaults to all in item
    :return:
    """
    d = {}
    attributes = attributes or d.keys()
    attributes.sort()
    for a in attributes:
        value = getattr(item, a, '')
        if type(value) not in [list, dict, int, float, str]:
            value = str(value)
        d[a] = value
    return d


def local_run(cmd):
    result = subprocess.run([cmd], shell=True, stdout=subprocess.PIPE)
    if result.returncode != 0:
        current_app.logger.warning(result)
    return result.stdout.decode('utf-8')


def exec_run(container, cmd, shell=False):
    """
    run the command on the given container.

    :param container: container object
    :param cmd: command to run
    :param shell: run in a shell instead of directly
    :return: text result string
    """
    if shell:
        cmd = f'/bin/bash -c "{cmd}"'
    current_app.logger.info(cmd)
    exit_code, output = container.exec_run(cmd, stream=True)
    result = ''
    for z in output:
        result += z.decode('utf-8')

    current_app.logger.info(result)
    return result


def get_directory(container, args):
    current_app.logger.info(args)
    pwd = args.get('pwd', '.')
    result = exec_run(container, f'''bash -c "(cd '{pwd}' && cd .. && pwd)"''')
    if result.startswith('bash: '):
        raise Exception(f'invalid parent pwd: {result}')
    parent = result.split('\n')[0]
    result = exec_run(container, f'''bash -c "(cd '{pwd}' && pwd)"''')
    if result.startswith('bash: '):
        raise Exception(f'invalid pwd: {result}')
    path = result.split('\n')[0]
    cmd = f'ls -la1Qt "{pwd}"'
    listing = exec_run(container, cmd)
    if result.startswith('ls: '):
        raise Exception(f'invalid ls: {listing}')
    entries = []
    total = ''
    for i, l in enumerate(listing.split('\n')):
        print(i, l)
        if i == 0:
            total = l
            continue

        # lrwxrwxrwx   1 root root    33 Apr 30 06:37 "initrd. img.old" -> "boot/initrd.img-4.15.0-96- generic"
        parts = l.split(None)
        if len(parts) > 5:
            entry = dict(dir_type=parts[0][0], modes=parts[0][1:], owner=parts[2], group=parts[3],
                         size=parts[4], modified=' '.join(parts[5:8]))
            file_name_pos = l.find('"') + 1
            end_file_name_pos = l.find('"', file_name_pos + 1)
            file_name = l[file_name_pos:end_file_name_pos]
            file_name_pos = l.find('"', end_file_name_pos + 2)
            entry['file_name'] = file_name
            if file_name_pos > end_file_name_pos:
                end_file_name_pos = l.find('"', file_name_pos + 2)
                linked_file_name = l[file_name_pos + 1:end_file_name_pos]
                entry['linked_file_name'] = linked_file_name
            entries.append(entry)
    return {'pwd': pwd, 'total': total, 'entries': entries, 'path': path, 'parent': parent}


@app.route('/git/<action>/', methods=['GET', 'POST'])
@request_arg('working_dir', str)
def route_git(action, working_dir):
    current_app.logger.info(f'route_git {request.method} {action}')
    try:
        if request.method == 'GET':
            if action == 'status':
                cmd = f"""cd {working_dir} && git status"""
                output = local_run(cmd)

                return dict(result=output)
            if action == 'pwd':
                cmd = f"""pwd"""
                output = local_run(cmd)

                return dict(result=output)
        if request.method == 'POST':
            if action in ['fetch', 'pull', 'log']:
                cmd = f"""cd {working_dir} && git {action}"""
                output = local_run(cmd)
                return output

    except Exception as e:
        current_app.logger.exception(e)
        return f'{e}', 400

    return f'unknown operation', 400


@app.route('/container/<action>', methods=['GET', 'POST'])
@request_arg('name', str, '')
@request_arg('sleep_seconds', int, 10)
@request_arg('tail', int, 100)
def route_container(action, name='', sleep_seconds=10, tail=100):
    current_app.logger.info(f'route_container {request.method} {action}')
    try:
        container = None
        attrs = ['id', 'labels', 'name', 'short_id', 'status', 'image']
        if name:
            container = dc.containers.get(name)

            if not container:
                raise Exception(f'container {name} not found')

        if request.method == 'GET':
            if action == 'list':
                # get all containers
                return jsonify([d_serialize(d, attrs) for d in dc.containers.list(all=True)])
            elif action == 'get':
                # get specified container
                return d_serialize(container, attrs)
            elif action == 'logs':
                logs = container.logs(tail=tail, timestamps=True)
                log_hash = logs.__hash__()
                logs = [l.strip() for l in logs.decode().split('\n') if l.strip()]
                return dict(hash=log_hash, logs=logs)
            elif action == 'ls':
                if container.status == 'running':
                    return get_directory(container, request.args)
                return {'entries': []}
            elif action == 'date':
                result = None
                if container and container.status == 'running':
                    result = exec_run(container, f'''date''')
                if not container:
                    result = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                return {'date': result}

        if request.method == 'POST':
            if action == 'restart':
                container.restart(timeout=60)
            elif action == 'stop':
                container.stop(timeout=60)
            elif action == 'start':
                container.start()
            elif action == 'exec_run':
                if container.status == 'running':
                    cmd = request.form.get('cmd')
                    output = exec_run(container, cmd, shell=True)
                    return output
                else:
                    return 'not running'
            elif action == 'download':
                return download_container_file(container)
            elif action == 'upload':
                return upload_container_file(container)
            elif action == 'sleep':
                time.sleep(sleep_seconds)
                return 'slept'
            elif action == 'logs':
                # download
                logs = container.logs(tail=int(request.form.get('tail', '1000')), timestamps=True)
                fd, tmp_filename = tempfile.mkstemp()
                os.write(fd, logs)
                os.close(fd)
                return send_file(tmp_filename)
            else:
                raise Exception('unknown action')
            container = dc.containers.get(name)
            return d_serialize(container, attrs)

        raise Exception(f'Method {request.method} and action {action} not supported')

    except Exception as e:
        current_app.logger.exception(e)
        return f'{e}', 400


def download_container_file(container):
    # download_container_file file
    filename = request.form.get('filename')
    if not filename:
        raise Exception('no filename in form')
    current_app.logger.info(f'download: {filename}')
    cleanup_tmp()
    tmp_dir = tempfile.mkdtemp(suffix='.docker-explorer-agent')
    fd, tmp_filename = tempfile.mkstemp(suffix='.tar', dir=tmp_dir)
    # extract from container is an archive
    bits, stat = container.get_archive(filename)
    for chunk in bits:
        os.write(fd, chunk)
    os.close(fd)
    # extract from tar
    result = subprocess.run(['tar', '-xf', tmp_filename, '-C', tmp_dir])
    if result.returncode != 0:
        current_app.logger.warning(result)
    attachment_filename = os.path.basename(filename)
    tmp_filename = os.path.join(tmp_dir, attachment_filename)
    cleanup[tmp_dir] = tmp_filename
    return send_file(tmp_filename, attachment_filename=attachment_filename, as_attachment=True)


def upload_container_file(container):
    filename = request.form.get('filename')
    base_filename = os.path.basename(filename)
    content = request.form.get('content')
    if not filename:
        raise Exception('no filename in form')
    current_app.logger.info(f'upload: {filename}')

    tar_stream = BytesIO()

    tar = tarfile.TarFile(fileobj=tar_stream, mode='w')

    file_data = content.encode('utf8')

    tarinfo = tarfile.TarInfo(name=base_filename)
    tarinfo.size = len(file_data)
    tarinfo.mtime = time.time()
    # tarinfo.mode = 0600

    tar.addfile(tarinfo, BytesIO(file_data))
    tar.close()

    tar_stream.seek(0)

    dest_path = os.path.dirname(filename)

    success = container.put_archive(dest_path, tar_stream)
    return dict(dest_path=dest_path, base_filename=base_filename, success=success)


def cleanup_tmp():
    for old_tmp_dir in cleanup.copy():
        try:
            if os.path.isdir(old_tmp_dir):
                shutil.rmtree(old_tmp_dir)
            del cleanup[old_tmp_dir]
        except Exception as e:
            current_app.logger.exception(e)


@app.route('/volume/<param>')
def route_volume(param):
    if param == 'list':
        return jsonify([d_serialize(d, ['attrs']) for d in dc.volumes.list()])
    return 'not supported', 400


if __name__ == '__main__':
    print('agent starting')
    app.run(host='0.0.0.0', port=5550)
