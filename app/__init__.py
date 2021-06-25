import logging
import mimetypes
import os
from functools import wraps
from urllib.parse import quote_plus

from flask import Flask, request, redirect, g, abort
from flask_ipban import IpBan
from flask_login import LoginManager, current_user
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect

from app.custom_tags import ImportJs

logging.basicConfig(format="%(levelname)s:%(message)s", level=os.getenv("LOG_LEVEL", "DEBUG"))

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
csrf = CSRFProtect()
ip_ban = IpBan(
    ip_header="X-TRUE-IP",
    abuse_IPDB_config=dict(key=os.getenv("ABUSE_IPDB_KEY"), report=os.getenv("DEPLOYMENT") == "Prod"),
)

from .models import User, AuditRecord, ServerGroup, Command, DockerServer, Setting


def d_serialize(item):
    """
    convert the item into a dict
    so they can be serialized back to the caller

    :param item: an object
    :return:
    """
    d = {}
    for a in item.__dict__.keys():
        if not a.startswith("_"):
            value = getattr(item, a, "")
            if value is None:
                value = ""
            if type(value) not in [list, dict, int, float, str, bool]:
                value = str(value)
            d[a] = value
    return d


def set_g():
    """
    make the shared global g have useful stuff.

    """
    g._current_user = current_user
    g.anon = current_user.is_anonymous
    g.admin = is_admin()
    g.email = getattr(current_user, "email", None)
    g.id = getattr(current_user, "id", None)
    g.d = d_serialize(g)
    return g.d


# Flask and Flask-SQLAlchemy initialization here

def is_admin():
    """
    return if user is an admin

    """
    return getattr(current_user, "is_admin", False)


def app_before_request():
    """
    set the global variable

    """
    set_g()


def create_app():
    from app.views import bp as bp_main
    from app.api import bp as bp_api

    def ensure_folder(folder):
        if not os.path.isdir(folder):
            os.makedirs(folder, exist_ok=True)

    app = Flask(__name__)
    app.jinja_env.trim_blocks = True
    app.jinja_env.lstrip_blocks = True
    app.config.from_object("config")

    mimetypes.add_type("application/javascript", ".js")
    ensure_folder(app.config["BASEDIR"])
    ensure_folder(app.config["LOG_FOLDER"])
    ensure_folder(app.config["APP_STATIC"])
    ensure_folder(os.path.join(app.config["BASEDIR"], "db"))
    db.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)
    login_manager.login_view = "main.public_page_index"
    login_manager.login_message = None
    login_manager.init_app(app)

    @app.errorhandler(404)
    def handle_404(e):
        """
        make react routes work by redirecting through /
        in index.html there is a request_path hidden input
        that is read by the react router on init.

        """
        logging.warning(f"""{404}, {request.path}""")
        if "/api/" not in request.path and request.method == "GET":
            return redirect(f"/?request_path={quote_plus(request.path)}")
        return e

    @login_manager.user_loader
    def load_user(user_id):
        # since the user_id is just the primary key of our user table, use it in the query for the user
        return User.query.get(int(user_id))

    ip_ban.init_app(app)
    ip_ban.load_nuisances()

    from app.auth import bp as bp_auth
    from app.proxy import bp as bp_proxy
    from app.profile import bp as bp_profile

    app.register_blueprint(bp_auth, url_prefix="/auth")
    app.register_blueprint(bp_proxy, url_prefix="/proxy")
    app.register_blueprint(bp_api, url_prefix="/api")
    app.register_blueprint(bp_profile, url_prefix="/profile")
    app.register_blueprint(bp_main)
    app.jinja_env.add_extension(ImportJs)

    return app


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if getattr(current_user, "is_admin", False):
            return f(*args, **kwargs)
        abort(403)

    return decorated
