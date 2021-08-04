import logging
import os
import shutil
import subprocess
import tarfile
import tempfile
import time
from io import BytesIO

from flask import request, current_app, send_file

cleanup = {}


def local_run(cmd):
    logging.info(cmd)
    result = subprocess.run([cmd], shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    if result.returncode != 0:
        logging.warning(result)
    return result.stdout.decode("utf-8")


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
    logging.info(cmd)
    exit_code, output = container.exec_run(cmd, stream=True)
    result = ""
    for z in output:
        result += z.decode("utf-8")

    logging.debug(result)
    return result


def get_directory(container, args):
    pwd = args.get("pwd", ".")
    result = exec_run(container, f'''bash -c "(cd '{pwd}' && cd .. && pwd)"''')
    if result.startswith("bash: "):
        raise Exception(f"invalid parent pwd: {result}")
    parent = result.split("\n")[0]
    result = exec_run(container, f'''bash -c "(cd '{pwd}' && pwd)"''')
    if result.startswith("bash: "):
        raise Exception(f"invalid pwd: {result}")
    path = result.split("\n")[0]
    cmd = f'ls -la1Qt "{pwd}"'
    listing = exec_run(container, cmd)
    if result.startswith("ls: "):
        raise Exception(f"invalid ls: {listing}")
    entries = []
    total = ""
    for i, l in enumerate(listing.split("\n")):
        if i == 0:
            total = l
            continue

        # lrwxrwxrwx   1 root root    33 Apr 30 06:37 "initrd. img.old" -> "boot/initrd.img-4.15.0-96- generic"
        parts = l.split(None)
        if len(parts) > 5:
            entry = dict(
                dir_type=parts[0][0],
                modes=parts[0][1:],
                owner=parts[2],
                group=parts[3],
                size=parts[4],
                modified=" ".join(parts[5:8]),
            )
            file_name_pos = l.find('"') + 1
            end_file_name_pos = l.find('"', file_name_pos + 1)
            file_name = l[file_name_pos:end_file_name_pos]
            file_name_pos = l.find('"', end_file_name_pos + 2)
            entry["file_name"] = file_name
            if file_name_pos > end_file_name_pos:
                end_file_name_pos = l.find('"', file_name_pos + 2)
                linked_file_name = l[file_name_pos + 1: end_file_name_pos]
                entry["linked_file_name"] = linked_file_name
            entries.append(entry)
    return {
        "pwd": pwd,
        "total": total,
        "entries": entries,
        "path": path,
        "parent": parent,
    }


def download_container_file(container):
    # download_container_file file
    filename = request.form.get("filename")
    if not filename:
        raise Exception("no filename in form")
    logging.info(f"download: {filename}")
    cleanup_tmp()
    tmp_dir = tempfile.mkdtemp(suffix=".docker-explorer-agent")
    fd, tmp_filename = tempfile.mkstemp(suffix=".tar", dir=tmp_dir)
    # extract from container is an archive
    bits, stat = container.get_archive(filename)
    for chunk in bits:
        os.write(fd, chunk)
    os.close(fd)
    # extract from tar
    result = subprocess.run(["tar", "-xf", tmp_filename, "-C", tmp_dir])
    if result.returncode != 0:
        current_app.logger.warning(result)
    attachment_filename = os.path.basename(filename)
    tmp_filename = os.path.join(tmp_dir, attachment_filename)
    cleanup[tmp_dir] = tmp_filename
    return send_file(tmp_filename, attachment_filename=attachment_filename, as_attachment=True)


def upload_container_file(container):
    filename = request.form.get("filename")
    base_filename = os.path.basename(filename)
    content = request.form.get("content")
    if not filename:
        raise Exception("no filename in form")
    logging.info(f"upload: {filename}")

    tar_stream = BytesIO()

    tar = tarfile.TarFile(fileobj=tar_stream, mode="w")

    file_data = content.encode("utf8")

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
            logging.exception(e)
