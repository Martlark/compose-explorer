from flask import current_app
from ldap3 import Server, Connection, ALL

from app import User, db


def ldap_login(cn, password):
    # ldap server hostname and port
    ldap_server = current_app.config.get("LDAP_SERVER")  # f"ldap://andrew:389"

    # LDAP CONFIG
    root_dn = current_app.config.get("LDAP_ROOT_DN")  # "dc=andrew,dc=local, cn=users"
    user_dn_format = current_app.config.get("LDAP_USER_DN_FORMAT")  # f"cn={cn},{root_dn}"
    ldap_email_format = current_app.config.get("LDAP_USER_EMAIL_FORMAT")  # f"cn={cn},{root_dn}"
    search_filter = current_app.config.get("LDAP_ATTRIBUTES_FILTER")
    admin_match = current_app.config.get("LDAP_ADMIN_MATCH")
    # user
    ldap_user = user_dn_format.format(cn=cn, root_dn=root_dn)
    try:
        server = Server(ldap_server, get_info=ALL)

        connection = Connection(server, user=ldap_user, password=password, auto_bind=True)

        print(f" *** Response from the ldap bind is \n{connection}")
        print(f"{connection.user}")

        results = connection.search(ldap_user, search_filter=search_filter, attributes=["*"])

        if results:
            for index, entry in enumerate(connection.entries):
                attributes = entry.entry_attributes_as_dict
            # normalize to the first item of each attribute
            attributes = {k: v[0] for k, v in attributes.items()}
            current_app.logger.info(attributes)
            user = User.query.filter_by(options=ldap_user).first()
            if not user:
                user_type = "user"
                current_app.logger.info(f"Adding LDAP user {ldap_user} to directory")
                email = ldap_email_format.format(**attributes)
                first_name = attributes.get(current_app.config.get("LDAP_FIRST_NAME"))
                last_name = attributes.get(current_app.config.get("LDAP_LAST_NAME"))
                if eval(admin_match):
                    user_type = "admin"
                user = User(
                    email=email, first_name=first_name, last_name=last_name, options=ldap_user, user_type=user_type
                )
                db.session.add(user)
                db.session.commit()
        else:
            raise Exception(f"LDAP attributes not found for: {ldap_user}.  Using filter {search_filter}")
    except Exception as e:
        current_app.logger.exception(e)
        current_app.logger.error(f"Can't login as user {ldap_user}")
        return None

    return user
