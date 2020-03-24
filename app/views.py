# views.py
import os

from flask import render_template, request, current_app, Blueprint, send_from_directory

from app.admin_views import UserAdmin, SettingAdmin, DockerServerAdmin
from app.models import User, Setting, DockerServer
from config import STATIC_DIR

bp = Blueprint('main', __name__)


def admin_views(admin, db):
    # Add Flask-Admin views for Users and Roles
    admin.add_view(UserAdmin(User, db.session, endpoint='user'))
    admin.add_view(SettingAdmin(Setting, db.session, endpoint='setting'))
    admin.add_view(DockerServerAdmin(DockerServer, db.session, endpoint='docker_server'))


@bp.errorhandler(Exception)
def exception_handler(error):
    current_app.logger.error(repr(error))
    return repr(error), 500


@bp.route('/')
def page_index():
    servers = DockerServer.query.filter_by(active=True).all()
    return render_template('index.html', title='Docker Explorer', servers=servers)


@bp.route('/server/<int:item_id>')
def page_server(item_id):
    server = DockerServer.query.get_or_404(item_id)
    return render_template('server.html', title=server.name, server=server)


@bp.route('/container/<int:item_id>/<container_name>')
def page_container(item_id, container_name):
    server = DockerServer.query.get_or_404(item_id)
    return render_template('container.html', title=server.name, server=server, container_name=container_name)


@bp.route('/page/<page>')
def page_page(page, title=''):
    return render_template(page, title=title)


@bp.route('/login')
def public_page_login():
    return render_template("auth/login.html")


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
