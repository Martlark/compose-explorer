from flask import Flask, request, render_template
from flask_admin import Admin
import os
import logging
from flask_ipban import IpBan
from flask_sqlalchemy import SQLAlchemy
from logging.handlers import RotatingFileHandler
from flask_mail import Mail
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_wtf.csrf import CSRFProtect

db = SQLAlchemy()
admin = Admin(name='eupassportviaportugal', template_mode='bootstrap3')
mail = Mail()
migrate = Migrate()
login_manager = LoginManager()
csrf = CSRFProtect()
ip_ban = IpBan(ip_header='X-TRUE-IP',
               abuse_IPDB_config=dict(key=os.getenv('ABUSE_IPDB_KEY'), report=os.getenv('DEPLOYMENT') == 'Prod'))


# Flask and Flask-SQLAlchemy initialization here

def create_app():
    from app.views import admin_views, bp as bp_main

    def ensure_folder(folder):
        if not os.path.isdir(folder):
            os.makedirs(folder, exist_ok=True)

    app = Flask(__name__)

    app.config.from_object('config')

    ensure_folder(app.config['BASEDIR'])
    ensure_folder(app.config['LOG_FOLDER'])
    ensure_folder(app.config['APP_STATIC'])
    ensure_folder(os.path.join(app.config['BASEDIR'], 'db'))
    db.init_app(app)
    admin.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    from .models import User

    @login_manager.user_loader
    def load_user(user_id):
        # since the user_id is just the primary key of our user table, use it in the query for the user
        return User.query.get(int(user_id))

    admin_views(admin, db)
    ip_ban.init_app(app)
    ip_ban.load_nuisances()

    from app.auth import bp as bp_auth

    app.register_blueprint(bp_auth, url_prefix='/auth')
    app.register_blueprint(bp_main)

    @app.errorhandler(404)
    def page_not_found_404(e):
        app.logger.info('404 url:' + request.url)
        app.logger.info(request.remote_addr)
        app.logger.info(request.headers.get('User-Agent'))

        return render_template("404.html", title=app.config['TITLE']), 404

    return app
