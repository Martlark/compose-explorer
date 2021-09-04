import os

SECRET_KEY = os.environ.get("SECRET_KEY", "NOT-VERY-SECRET")
BASEDIR = os.path.abspath(os.path.dirname(__file__))
STATIC_DIR = os.path.join(BASEDIR, "app", "static")

LOG_FOLDER = os.path.join(BASEDIR, "logs")

SQLALCHEMY_DATABASE_URI = os.getenv(
    "DATABASE_URI",
    f"sqlite:///{os.path.join(BASEDIR, 'db', 'app.db')}?check_same_thread=False",
)
SQLALCHEMY_MIGRATE_REPO = os.path.join(BASEDIR, "db_repository")
SQLALCHEMY_TRACK_MODIFICATIONS = False

APP_ROOT = os.path.join(BASEDIR, "app")  # refers to application_top
APP_STATIC = os.path.join(APP_ROOT, "static")
PROPAGATE_EXCEPTIONS = True

# Set config values for Flask-Security.
# We're using PBKDF2 with salt.
SECURITY_PASSWORD_HASH = os.getenv("SECURITY_PASSWORD_HASH", "pbkdf2_sha512")
# Replace this with your own salt.
SECURITY_PASSWORD_SALT = os.environ.get(
    "SECURITY_PASSWORD_SALT", "c|3KmqR8~sSjKT/gumounevwoijfds3ri-03490vjndp+,6pc,+/w"
)

TITLE = "Docker Explorer"

# email server
HOST_URL = os.environ.get("HOST_URL", "https://www.tba.com")
GTAG = os.environ.get("GTAG", "UA-157072071-1")

# token expiry in seconds, default is two days

WTF_CSRF_TIME_LIMIT = int(os.getenv("WTF_CSRF_TIME_LIMIT", 60 * 60 * 48))

# ldap setup

LDAP_SERVER = os.getenv("LDAP_SERVER", f"ldap://192.168.0.119:389")
LDAP_ROOT_DN = os.getenv("LDAP_ROOT_DN", "cn=users,dc=andrew,dc=local")
LDAP_USER_DN_FORMAT = os.getenv("LDAP_USER_DN_FORMAT", "cn={cn},{LDAP_ROOT_DN}")
LDAP_USER_EMAIL_FORMAT = os.getenv("LDAP_USER_EMAIL_FORMAT", "{uid}@ldap.com")
LDAP_FIRST_NAME = os.getenv("LDAP_FIRST_NAME", "givenName")
LDAP_LAST_NAME = os.getenv("LDAP_LAST_NAME", "sn")
LDAP_ATTRIBUTES_FILTER = os.getenv(
    "LDAP_ATTRIBUTES_FILTER",
    "(objectClass=*)",
)
LDAP_ADMIN_MATCH = os.getenv("LDAP_ADMIN_MATCH", "attributes.get('uid') in ['admin']")
