import os
import shutil
import subprocess
import tempfile
import tarfile
import time
from io import BytesIO

import docker
from flask import Flask, jsonify, request, current_app, send_file, make_response

app = Flask(__name__)
# https://docker-py.readthedocs.io/en/stable/
dc = docker.from_env()
cleanup = {}

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


def exec_run(container, cmd, shell=False):
    """
    run the command on the given container.

    :param container: container object
    :param cmd: command to run
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
    pwd = args.get('pwd', '.')
    parent = exec_run(container, f'''bash -c "(cd '{pwd}' && cd .. && pwd)"''').split('\n')[0]
    path = exec_run(container, f'''bash -c "(cd '{pwd}' && pwd)"''').split('\n')[0]
    cmd = f'ls -la1Qt "{pwd}"'
    listing = exec_run(container, cmd)
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
                linked_file_name = l[file_name_pos+1:end_file_name_pos]
                entry['linked_file_name'] = linked_file_name
            entries.append(entry)
    return {'pwd': pwd, 'total': total, 'entries': entries, 'path': path, 'parent': parent}


@app.route('/container/<param>', methods=['GET', 'POST'])
def route_container(param):
    # current_app.logger.debug(f'route_container {request.method} {param}')
    try:
        container = None
        attrs = ['id', 'labels', 'name', 'short_id', 'status', 'image']
        name = request.args.get('name') or request.form.get('name')
        if name:
            container = dc.containers.get(name)

            if not container:
                raise Exception(f'container {name} not found')

        if request.method == 'GET':
            if param == 'list':
                # get all containers
                return jsonify([d_serialize(d, attrs) for d in dc.containers.list(all=True)])
            elif param == 'get':
                # get specified container
                return d_serialize(container, attrs)
            elif param == 'logs':
                params = dict(request.args)
                logs = container.logs(tail=int(request.args.get('tail', '100')), timestamps=True)
                log_hash = logs.__hash__()
                logs = [l.strip() for l in logs.decode().split('\n') if l.strip()]
                return dict(hash=log_hash, logs=logs)
            elif param == 'ls':
                if container.status == 'running':
                    return get_directory(container, request.args)
                return {'entries': []}

        if request.method == 'POST':
            if param == 'restart':
                container.restart()
            elif param == 'stop':
                container.stop()
            elif param == 'start':
                container.start()
            elif param == 'exec_run':
                if container.status == 'running':
                    cmd = request.form.get('cmd')
                    return exec_run(container, cmd, shell=True)
                else:
                    return 'not running'
            elif param == 'download':
                return download_container_file(container)
            elif param == 'upload':
                return upload_container_file(container)
            elif param == 'logs':
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

        raise Exception('Method and action not supported')

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

    pw_tarstream = BytesIO()

    pw_tar = tarfile.TarFile(fileobj=pw_tarstream, mode='w')

    file_data = content.encode('utf8')

    tarinfo = tarfile.TarInfo(name=base_filename)
    tarinfo.size = len(file_data)
    tarinfo.mtime = time.time()
    # tarinfo.mode = 0600

    pw_tar.addfile(tarinfo, BytesIO(file_data))
    pw_tar.close()

    pw_tarstream.seek(0)

    dest_path = os.path.dirname(filename)

    success = container.put_archive(dest_path, pw_tarstream)
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
