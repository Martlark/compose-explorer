import os

SECRET_KEY = os.environ.get("SECRET_KEY", "NOT-VERY-SECRET")
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "app", "static")
DB_DIR = os.path.join(BASE_DIR, "db")

SQLALCHEMY_DATABASE_URI = os.getenv(
    "DATABASE_URI",
    f"sqlite:///{os.path.join(DB_DIR, 'app.db')}?check_same_thread=False",
)
SQLALCHEMY_MIGRATE_REPO = os.path.join(BASE_DIR, "db_repository")
SQLALCHEMY_TRACK_MODIFICATIONS = False

PROPAGATE_EXCEPTIONS = True

# Set config values for Flask-Security.
# We're using PBKDF2 with salt.
SECURITY_PASSWORD_HASH = os.getenv("SECURITY_PASSWORD_HASH", "pbkdf2_sha512")
# Replace this with your own salt.
SECURITY_PASSWORD_SALT = os.environ.get(
    "SECURITY_PASSWORD_SALT", "c|3KmqR8~sSjKT/gumounevwoijfds3ri-03490vjndp+,6pc,+/w"
)

TITLE = os.getenv("TITLE", "Compose Explorer")

# token expiry in seconds, default is two days

WTF_CSRF_TIME_LIMIT = int(os.getenv("WTF_CSRF_TIME_LIMIT", 60 * 60 * 48))

# ldap and login setup

LOGIN_MESSAGE = os.getenv("LOGIN_MESSAGE", "Login email")

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
