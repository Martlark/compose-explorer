import re

from flask import current_app
from ldap3 import Server, Connection, ALL

from app import User, db


def ldap_login(user_name: str, password: str) -> User:
    """
    get LDAP attributes and set/create a user object

    :param user_name: user name string entered from the login screen
    :param password: the password from the login screen

    """
    cn = "" # the common name used to lookup in LDAP
    # clean the username to have only letters, numbers _ . and space
    for c in user_name:
        if re.match(r"[A-Za-z0-9_.\- ]", c):
            cn += c

    # LDAP CONFIG
    LDAP_SERVER = current_app.config.get("LDAP_SERVER")  # f"ldap://andrew:389"
    LDAP_ROOT_DN = current_app.config.get("LDAP_ROOT_DN")  # "dc=andrew,dc=local, cn=users"

    user_dn_format = current_app.config.get("LDAP_USER_DN_FORMAT")  # f"cn={cn},{root_dn}"
    ldap_email_format = current_app.config.get("LDAP_USER_EMAIL_FORMAT")  # f"cn={cn},{root_dn}"
    search_filter = current_app.config.get("LDAP_ATTRIBUTES_FILTER")
    admin_match = current_app.config.get("LDAP_ADMIN_MATCH")
    ldap_user = user_dn_format.format(cn=cn, LDAP_ROOT_DN=LDAP_ROOT_DN)
    try:
        if cn != user_name:
            raise Exception("invalid characters in the user name")
        server = Server(LDAP_SERVER, get_info=ALL)
        connection = Connection(server, user=ldap_user, password=password, auto_bind=True)
        current_app.logger.info(f"LDAP connection: {connection.user}")
        results = connection.search(ldap_user, search_filter=search_filter, attributes=["*"])

        if not results:
            raise Exception(f"LDAP attributes not found for: {ldap_user}.  Using filter {search_filter}")

        attributes = {k: v[0] for k, v in connection.entries[0].entry_attributes_as_dict.items()}
        email = ldap_email_format.format(**attributes).casefold()
        user = User.query.filter_by(email=email).first()
        if not user:
            # normalize to the first item of each attribute
            current_app.logger.info(f"Adding LDAP user {ldap_user} to directory. LDAP attributes: {attributes}")
            user = User(
                email=email,
                first_name=attributes.get(current_app.config.get("LDAP_FIRST_NAME")),
                last_name=attributes.get(current_app.config.get("LDAP_LAST_NAME")),
                options=ldap_user,
                user_type="admin" if admin_match and eval(admin_match) else "user",
            )
            if user.user_type == "admin":
                current_app.logger.warn(f"Creating user as admin")
            db.session.add(user)
            db.session.commit()
    except Exception as e:
        current_app.logger.exception(e)
        current_app.logger.error(f"Can't login as user {ldap_user}")
        return None

    return user
