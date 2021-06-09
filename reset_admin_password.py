import os
import string
from random import random

from app import db
from app.models import User

admin_email = os.environ.get("ADMIN_USER", "admin@admin.com")
user = User.query.filter_by(email=admin_email).first()
new_admin_password = "".join([random.choice(string.ascii_uppercase + string.digits) for r in range(20)])
new_admin_password = os.environ.get("ADMIN_PASSWORD", new_admin_password)

if not user:

    user = User(email=admin_email, user_type="admin")
    print("Creating default admin {} with password {}".format(admin_email, new_admin_password))
    user.set_password(new_admin_password)
    db.session.add(user)
    db.session.commit()
else:
    if not user.check_password(new_admin_password):
        print("Setting admin {} to password {}".format(admin_email, new_admin_password))
        user.set_password(new_admin_password)
        db.session.add(user)
        db.session.commit()
