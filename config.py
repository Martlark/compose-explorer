import os

SECRET_KEY = os.environ.get('SECRET_KEY', 'NOT-VERY-SECRET')
BASEDIR = os.path.abspath(os.path.dirname(__file__))
STATIC_DIR = os.path.join(BASEDIR, 'app', 'static')

LOG_FOLDER = os.path.join(BASEDIR, 'logs')

SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI',
                                         f"sqlite:///{os.path.join(BASEDIR, 'db', 'app.db')}?check_same_thread=False")
SQLALCHEMY_MIGRATE_REPO = os.path.join(BASEDIR, 'db_repository')
SQLALCHEMY_TRACK_MODIFICATIONS = False

APP_ROOT = os.path.join(BASEDIR, 'app')  # refers to application_top
APP_STATIC = os.path.join(APP_ROOT, 'static')
PROPAGATE_EXCEPTIONS = True

# Set config values for Flask-Security.
# We're using PBKDF2 with salt.
SECURITY_PASSWORD_HASH = 'pbkdf2_sha512'
# Replace this with your own salt.
SECURITY_PASSWORD_SALT = os.environ.get('SECURITY_PASSWORD_SALT',
                                        'c|3KmqR8~sSjKT/gumounevwoijfds3ri-03490vjndp+,6pc,+/w')

TITLE = "EU Passport via Portugal"

# email server
MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.live.com')
MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
MAIL_USE_TLS = True
MAIL_USE_SSL = False
# docker-compose injected values
MAIL_USERNAME = os.environ.get('MAIL_USERNAME', 'pnchavez@hotmail.com')
MAIL_RECIPIENT = os.environ.get('MAIL_RECIPIENTS', 'info@eupassportviaportugal.com')
MAIL_CONTACT = os.environ.get('MAIL_CONTACT', 'info@eupassportviaportugal.com')
HOST_URL = os.environ.get('HOST_URL', 'https://www.eupassportviaportugal.com')
MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', '2018Mexico!')
GTAG = os.environ.get('GTAG', 'UA-157072071-1')

# administrator list
# https://admin.google.com/AdminHome?fral=1&pli=1
ADMINS = ['pnchavez@hotmail.com', 'rowe.andrew.d@gmail.com']
