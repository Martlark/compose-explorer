# views.py
import os
import random

from flask import render_template, request, current_app, Blueprint, send_from_directory, flash
from flask_login import logout_user, login_required, current_user

from app.admin_views import UserAdmin, SettingAdmin, DockerServerAdmin
from app.models import User, Setting, DockerServer, Command
from config import STATIC_DIR

bp = Blueprint('main', __name__)


def admin_views(admin, db):
    # Add Flask-Admin views for Users and Roles
    admin.add_view(UserAdmin(User, db.session))
    admin.add_view(SettingAdmin(Setting, db.session))
    admin.add_view(DockerServerAdmin(DockerServer, db.session))


@bp.errorhandler(Exception)
def exception_handler(error):
    current_app.logger.error(repr(error))
    return repr(error), 500


@bp.route('/')
@login_required
def page_index():
    return render_template('index.html', page_title='Docker Explorer')


@bp.route('/server/<int:server_id>/')
@bp.route('/server/<int:server_id>/<path:path>/')
@login_required
def page_server(server_id, path=None):
    return render_template('index.html', server_id=server_id)


@bp.route('/page/<page>')
def page_page(page, title=''):
    return render_template(page, page_title=title)


@bp.route('/login')
def public_page_login():
    return render_template("auth/login.html")


@bp.route('/logout')
def public_page_logout():
    logout_user()
    flash('You have been logged out')
    return render_template("auth/logout.html")


@bp.route('/favicon.ico')
@bp.route('/robots.txt')
@bp.route('/ads.txt')
def public_static_file():
    """
    return a file from the templates folder
    intended for service of ads.txt, robots.txt or other such 'special' files

    :return: the file contents
    """
    file_name = os.path.basename(request.path)
    return send_from_directory(STATIC_DIR, file_name)


rand_check_number = random.randint(0, 9999999999)


@bp.route('/last_static_update')
def last_static_update():
    include_dirs = ['./app/js', './app/static/src', './app/templates']
    exclude_dir = ['node_modules', 'venv', 'tmp']
    notice_exts = ['js', 'html', 'css']
    initial_max_age = max_age = float(request.args.get('max_age', -1))
    for include_dir in include_dirs:
        for root, dirs, files in os.walk(include_dir):
            if os.path.basename(root) not in exclude_dir:
                for file in files:
                    if any([file.endswith(ext) for ext in notice_exts]):
                        full_path = os.path.join(root, file)
                        mtime = os.path.getmtime(full_path)
                        if mtime > max_age and initial_max_age != -1:
                            current_app.logger.debug(
                                'Refresh required because of:{full_path}'.format(full_path=full_path))
                        max_age = max(max_age, mtime)

    if request.args.get('rand_check_number'):
        if int(request.args.get('rand_check_number')) != rand_check_number:
            current_app.logger.debug(
                'Refresh required because of:rand_check_number')
    return dict(max_age=max_age, rand_check_number=rand_check_number)


@bp.route('/command/<int:item_id>/', methods=['GET', 'PUT', 'DELETE'])
@bp.route('/command/', methods=['GET', 'POST'])
@login_required
def route_command(item_id=None):
    return Command.get_delete_put_post(item_id, user=current_user)
